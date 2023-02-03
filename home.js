/*
    RoGold
    Coding and design by Alrovi Aps.
    Contact: contact@alrovi.com
    Copyright (C) Alrovi Aps
    All rights reserved.
*/

var s = document.createElement("script");
s.src = chrome.runtime.getURL("init.js");
(document.head || document.documentElement).appendChild(s);
s.onload = function () {
     s.remove();
};

async function addGame(name, id, url, thumbnail, num) {
     const gameHTML = `
    <div class="game-card-container" style="flex: 0 0 auto; margin: 0 11px 0 0; width: 100%;">
        <a class="game-card-link" href="${url}" style="text-align: center;">
            <div class="game-card-thumb-container" id="${parseInt(id)}">
                <div class="game-card-thumb">
                    <span class="thumbnail-2d-container"><img class="game-card-thumb" src="${stripTags(
                         thumbnail
                    )}"
                            alt="${stripTags(name)}" title="${stripTags(name)}">
                    </span>
                </div>
            </div>
        </a>
        <div style="margin-top: -3px;font-size: 12px;padding: 0px;text-overflow: ellipsis;white-space: normal;text-align: center;max-height: 16px;"
            class="game-card-name game-name-title" title="${stripTags(
                 name
            )}">${stripTags(name)}</div>
        <div style="display:flex;position:relative;justify-content:space-around;" class="game-card-info">
            <button id="play-${id}" type="button"
                class="btn-full-width btn-common-play-game-lg btn-primary-md btn-min-width"
                style="width:90%;min-width:45%;padding:2px;margin-top:5px;float:left;margin-left:2px;">
                <span class="icon-common-play" style="background-size:34px auto;width:16px;height:19px;"></span></button>
            <button id="edit-${id}" type="button"
                class="btn-full-width btn-common-play-game-lg btn-primary-md btn-min-width"
                style="display:none;width:45%;min-width:45%;padding:2px;margin-top:5px;float:right;margin-right:2px;background-color:#262928;border-color:#3e4442;">
                <span class="icon-common-play"
                    style="background-size:34px auto;width:16px;height:19px;background-image:url('https://images.rbxcdn.com/a057a8bc94e7ab78517765ddb4e77384-generic_dark_11062018.svg');background-repeat:no-repeat;background-position:0px -50px;"></span></button>
        </div>
    </div>
    `;
     const li = document.createElement("li");
     li.setAttribute("style", "height:auto;padding:0 0 0 0;width:min-content;");
     li.setAttribute("class", "list-item game-card game-tile");
     li.setAttribute("title", stripTags(name));
     if ((num / 6) % 1 == 0) {
          li.setAttribute(
               "style",
               "height:auto;padding:0 0 0 0;width:min-content;"
          );
     }
     li.innerHTML = gameHTML;
     document.getElementById("pinned-container").appendChild(li);
     let canEdit = await get("https://develop.roblox.com/v2/places/" + id);
     if (
          !canEdit ||
          canEdit == undefined ||
          canEdit.errors ||
          canEdit == "ERROR" ||
          !canEdit.id ||
          isMobile()
     ) {
          document.getElementById("edit-" + id).remove();
          document.getElementById("play-" + id).style.width = "90%";
     } else {
          document.getElementById("play-" + id).style.width = "45%";
          document.getElementById("edit-" + id).style.display = "inline-block";
          document
               .getElementById("edit-" + id)
               .addEventListener("click", () => {
                    window.postMessage({
                         direction: "EditPlace",
                         PlaceId: id,
                    });
               });
     }
     document.getElementById("play-" + id).addEventListener("click", () => {
          if (isMobile()) {
               window.location.href = "robloxmobile://placeID=" + id;
               return;
          }
          window.postMessage({
               direction: "PlayPlace",
               PlaceId: id,
          });
     });
     return li;
}
const helloMessages = [
     "Hello",
     "Hey",
     "Hi",
     "Salut",
     "Olá",
     "Wassup",
     "G'day",
     "Welcome",
];
pages.home = async () => {
     let userInfo = await GetUserInfo();
     let userId = userInfo.userId;
     setTimeout(() => {
          getSetting("Pinned Games").then(async (result) => {
               if (result) {
                    let didPinned = false;
                    const addPinned = async (added_node) => {
                         if (didPinned) {
                              return;
                         }
                         didPinned = true;
                         if (!added_node) {
                              added_node = await first(
                                   ".game-home-page-container div:first-child"
                              );
                         }
                         let pinTitle = document.createElement("div");
                         pinTitle.setAttribute(
                              "class",
                              "col-xs-12 container-list places-list"
                         );
                         pinTitle.setAttribute(
                              "style",
                              "margin-top: 6px; height: auto"
                         );
                         let maxPinned = await get(
                              `https://inventory.roblox.com/v1/users/${userId}/items/GamePass/20000192`
                         ); // pls no change i worked hard to make this :grief:
                         let maxNum = 6;
                         if (maxPinned?.data?.[0]) {
                              console.log("extra 6");
                              maxNum += 6;
                              pinTitle.innerHTML = `
                        <a>
                            <div class="container-header games-filter-changer">
                                <h3>${
                                     chrome.i18n.getMessage("pinnedGames") ||
                                     "Pinned"
                                }📌</h3>
                            </div>
                        </a>
                        <ul class="hlist game-cards" id="pinned-container" style="display: contents">
                        </ul>
                        `;
                         } else {
                              pinTitle.innerHTML = `
                        <a href="/game-pass/20000192/6-Pinned">
                            <div class="container-header games-filter-changer">
                                <h3>${
                                     chrome.i18n.getMessage("pinnedGames") ||
                                     "Pinned"
                                }📌</h3>
                                <span class="see-all-button games-filter-changer btn-min-width btn-secondary-xs btn-more see-all-link-icon">Get 6 More Slots</span>
                            </div>
                        </a>
                        <ul class="hlist game-cards" id="pinned-container">
                        </ul>
                        `;
                         }
                         syncGet("pinned", async function (result) {
                              if (
                                   result &&
                                   result.pinned &&
                                   result.pinned.length > 0
                              ) {
                                   const continueAddNode = async () => {
                                        if (!added_node.parentNode)
                                             added_node = qs(
                                                  ".game-home-page-container div:first-child"
                                             );
                                        added_node.before(pinTitle);
                                        let thumbnails = await get(
                                             "https://thumbnails.roblox.com/v1/games/icons?universeIds=" +
                                                  result.pinned.join(",") +
                                                  "&size=150x150&format=Png&isCircular=false"
                                        );
                                        let gameInfos = await get(
                                             "https://games.roblox.com/v1/games?universeIds=" +
                                                  result.pinned.join(",")
                                        );
                                        let num = 0;
                                        for (const gameInfo of gameInfos?.data) {
                                             if (num == maxNum) {
                                                  break;
                                             }
                                             num++;
                                             let thumb = thumbnails.data.find(
                                                  (x) =>
                                                       x.targetId == gameInfo.id
                                             )?.imageUrl;
                                             addGame(
                                                  gameInfo.name,
                                                  gameInfo.rootPlaceId,
                                                  "https://roblox.com/games/" +
                                                       gameInfo.rootPlaceId,
                                                  thumb,
                                                  num
                                             );
                                        }
                                   };
                                   if (!added_node) {
                                        added_node = document.querySelector(
                                             ".game-home-page-container div:first-child"
                                        );
                                   }
                                   if (!added_node) {
                                        setTimeout(() => {
                                             added_node =
                                                  document.querySelector(
                                                       ".game-home-page-container div:first-child"
                                                  );
                                             continueAddNode();
                                        }, 1000);
                                   } else {
                                        continueAddNode();
                                   }
                              }
                         });
                    };

                    first(
                         ".game-home-page-container div:first-child",
                         addPinned
                    );
               }
          });
     }, 0);
     const friendHTML = `
    <div ng-controller="peopleController" people="" class="ng-scope">
        <div class="avatar-container">
            <a href="" class="text-link friend-link ng-isolate-scope" ng-click="clickAvatar(friend, $index)" popover-trigger=" 'none' " popover-class="people-info-card-container card-with-game" popover-placement="bottom" popover-append-to-body="true" popover-is-open="hoverPopoverParams.isOpen" hover-popover-params="hoverPopoverParams" hover-popover="" uib-popover-template="'people-info-card'">
                <div class="avatar avatar-card-fullbody">
                    <span class="avatar-card-link friend-avatar icon-placeholder-avatar-headshot" ng-class="{'icon-placeholder-avatar-headshot': !friend.avatar.imageUrl}">
                        <thumbnail-2d class="avatar-card-image ng-isolate-scope" thumbnail-type="layout.thumbnailTypes.avatarHeadshot" thumbnail-target-id="friend.id">
                            <span ng-class="$ctrl.getCssClasses()" class="thumbnail-2d-container" thumbnail-type="AvatarHeadshot" thumbnail-target-id="">
                                <img image-load="" alt="" title="" class="ng-scope ng-isolate-scope" src="">
                            </span>
                        </thumbnail-2d>
                    </span>
                </div>
                <span class="text-overflow friend-name font-caption-header ng-binding" ng-bind="friend.nameToDisplay" title=""></span> 
                <div class="text-overflow xsmall text-label place-name ng-binding ng-scope"></div>
            </a>
            <a class="friend-status place-link ng-scope" ng-if="friend.presence.placeUrl" ng-click="clickPlaceLink(friend, $index)" href="https://www.roblox.com/games/"> 
                <span class="avatar-status friend-status" title=""></span> 
            </a>
        </div>
    </div>
    `;
     const angularScript = document.createElement("script");
     angularScript.src = chrome.runtime.getURL("useAngular.js");
     document.head.appendChild(angularScript);
     const elementToSelector = (el) => {
          if (el.tagName.toLowerCase() == "html") return "html";
          let str = el.tagName.toLowerCase();
          str += el.id != "" ? "#" + el.id : "";
          if (el.className) {
               let classes = el.className.trim().split(/\s+/);
               for (const gotclass of classes) {
                    str += "." + gotclass;
               }
          }

          if (document.querySelectorAll(str).length == 1) return str;

          return elementToSelector(el.parentNode) + " > " + str;
     };
     let lastHover = Date.now();
     const createHoverPopup = async (activator, userInfo, userStatus) => {
          const element = document.createElement("div");
          element.className = `popover bottom people-info-card-container ${
               (userStatus.PlaceId && "card-with-game") || ""
          } fade`;
          element.setAttribute("uib-popover-template-popup", "");
          element.setAttribute("uib-title", "");
          element.setAttribute("uib-tooltip-classes", "");
          element.setAttribute("origin-scope", "origScope");
          element.setAttribute("tooltip-animation-class", "origScope");
          const gameInfo =
               (userStatus.PlaceId &&
                    (
                         await get(
                              "https://games.roblox.com/v1/games/multiget-place-details?placeIds=" +
                                   userStatus.PlaceId
                         )
                    )?.[0]) ||
               {};
          const gameThumbnail =
               (userStatus.PlaceId &&
                    (
                         await get(
                              "https://thumbnails.roblox.com/v1/games/icons?universeIds=" +
                                   gameInfo?.universeId +
                                   "&size=150x150&format=Png&isCircular=false"
                         )
                    )?.data) ||
               [];
          element.innerHTML = `
        <div class="arrow"></div>
        <div class="popover-inner">
            <div class="popover-content" uib-tooltip-template-transclude="contentExp()" tooltip-template-transclude-scope="originScope()">
                <div ng-controller="peopleInfoCardController" ng-class="{'card-with-game': friend.presence.placeUrl}" class="ng-scope ${
                     (userStatus.PlaceId == null && "card-with-game") || ""
                }"> 
                    <div class="border-bottom place-container ${
                         (userStatus.PlaceId == null && "ng-hide") || ""
                    }"> 
                        <span ng-click="goToGameDetails('icon')" onclick="window.location.href='/games/${
                             userStatus.PlaceId
                        }'"> 
                            <thumbnail-2d class="cursor-pointer place-icon ng-isolate-scope" thumbnail-type="layout.thumbnailTypes.gameIcon" thumbnail-target-id="library.placesDict[friend.presence.rootPlaceId].universeId">
                                <span ng-class="$ctrl.getCssClasses()" class="thumbnail-2d-container" thumbnail-type="GameIcon" thumbnail-target-id="">
                                    <img image-load="" alt="" title="" class="ng-scope ng-isolate-scope" src="${
                                         (gameThumbnail &&
                                              gameThumbnail?.find(
                                                   (e) =>
                                                        e.targetId ==
                                                        gameInfo.universeId
                                              )?.imageUrl) ||
                                         "https://t4.rbxcdn.com/3f73af996b69eafb3df5770a07050f43"
                                    }">
                                </span> 
                            </thumbnail-2d> 
                        </span> 
                        <div class="place-info-container"> 
                            <div class="place-info"> 
                                <span class="text-subject cursor-pointer place-title" onclick="window.location.href='/games/${
                                     userStatus.PlaceId
                                }'">${gameInfo?.name}</span> 
                                <div class="icon-text-wrapper ${
                                     (gameInfo?.price == 0 && "ng-hide") || ""
                                }"> 
                                    <span class="icon-robux"></span> 
                                    <span class="text-robux ng-binding">${
                                         gameInfo?.price
                                    }</span> 
                                </div> 
                            </div> 
                            <div class="place-btn-container"> 
                                <button class="btn-full-width place-btn btn-control-sm" style="display: ${
                                     gameInfo?.isPlayable ? "none" : "initial"
                                }" onclick="window.location.href='/games/${
               userStatus.PlaceId
          }'"> View Details </button>
                                <button class="btn-full-width place-btn btn-growth-sm" style="display: ${
                                     gameInfo?.isPlayable ? "initial" : "none"
                                }" onclick="Roblox.GameLauncher.joinMultiplayerGame(${
               gameInfo.universeRootPlaceId
          })"> Join </button>
                            </div> 
                        </div>
                    </div>
                    <ul class="dropdown-menu interaction-container"> 
                        <li class="interaction-item" ng-click="goToChat()"> 
                            <span class="icon icon-chat-gray"></span> 
                            <span class="text-overflow border-bottom label ng-binding" ng-bind="layout.interactionLabels.chat(friend.nameToDisplay)" title="Chat with ${
                                 userInfo.name
                            }">Chat with ${userInfo.name}</span> 
                        </li> 
                        <li class="interaction-item" ng-click="goToProfilePage()"> 
                            <span class="icon icon-viewdetails"></span> 
                            <span class="label ng-binding" onclick="window.location.href='/users/${
                                 userInfo.id
                            }/profile'">View Profile</span> 
                        </li> 
                    </ul> 
                </div>
            </div>
        </div>
        `;
          document.body.appendChild(element);
          qs(".dropdown-menu .text-overflow", element).addEventListener(
               "click",
               async () => {
                    let foundChat = qs(
                         `.chat-avatar-headshot[user-id="${userInfo.id}"]`
                    )?.parentNode;
                    if (foundChat) {
                         window.postMessage(
                              {
                                   type: "angular",
                                   data: {
                                        type: "trigger",
                                        selector: elementToSelector(foundChat),
                                        event: "click",
                                   },
                              },
                              "*"
                         );
                    } else {
                         const chatInput = qs(".chat-search-input");
                         chatInput.value = userInfo.name;
                         chatInput.dispatchEvent(new Event("input"));
                         chatInput.dispatchEvent(new Event("keyup"));
                         setTimeout(async () => {
                              foundChat = qs(
                                   `.chat-avatar-headshot[user-id="${userInfo.id}"]`
                              )?.parentNode;
                              if (foundChat) {
                                   window.postMessage(
                                        {
                                             type: "angular",
                                             data: {
                                                  type: "trigger",
                                                  selector:
                                                       elementToSelector(
                                                            foundChat
                                                       ),
                                                  event: "click",
                                             },
                                        },
                                        "*"
                                   );
                              }
                              chatInput.value = "";
                              chatInput.dispatchEvent(new Event("input"));
                              chatInput.dispatchEvent(new Event("keyup"));
                         }, 500);
                    }
               }
          );
          activator.addEventListener("mouseenter", (e) => {
               e.preventDefault();
               if (Date.now() - lastHover < 200) {
                    return;
               }
               lastHover = Date.now();
               document.body.appendChild(element);
               setTimeout(() => element.classList.add("in"), 50);
               element.style.left =
                    activator.getBoundingClientRect().left +
                    activator.offsetWidth / 2 -
                    element.offsetWidth / 2 +
                    "px";
               element.style.top =
                    activator.getBoundingClientRect().top +
                    scrollY +
                    activator.offsetHeight * 1.1 +
                    "px";
          });
          const getDistance = (event, elm) => {
               const rect = elm.getBoundingClientRect();
               return {
                    x: event.clientX - rect.left,
                    y: event.clientY - rect.top,
               };
          };
          activator.addEventListener("mouseleave", (e) => {
               e.preventDefault();
               if (
                    getDistance(e, element).y < -20 ||
                    getDistance(e, element).x > element.offsetWidth + 20
               ) {
                    element.classList.remove("in");
                    setTimeout(() => $(element).detach(), 200);
               }
          });
          element.addEventListener("mouseleave", (e) => {
               e.preventDefault();
               element.classList.remove("in");
               setTimeout(() => $(element).detach(), 200);
          });
          return () => {
               element.remove();
          };
     };
     setTimeout(async () => {
          const doFavorites = await getSetting("Best Friends");
          if (!doFavorites) return;
          let friends = await get(
               `https://friends.roblox.com/v1/users/${userId}/friends`
          );
          let maxBF = await get(
               `https://inventory.roblox.com/v1/users/${userId}/items/GamePass/26817185`
          ); // Very mean if you change this ;( its cheap too
          let maxNum = maxBF.data && maxBF.data[0] ? 1000 : 1000;
          let favorites = (await pGetStorage("favorites")) || [];
          if (favorites && favorites.length > 0) {
               const container = document.createElement("div");
               container.setAttribute(
                    "class",
                    "col-xs-12 home-header-container"
               );
               container.style = "margin: 0;";
               container.innerHTML = `
            <div class="col-xs-12 people-list-container" style="height:auto">
                <div class="section home-friends" style="height:auto">
                    <a class="container-header people-list-header" ${
                         maxNum == 9
                              ? 'href="/game-pass/26817185/9-Best-Friends"'
                              : ""
                    }>
                        <h3>${
                             chrome.i18n.getMessage("bestFriends") ||
                             "Best Friends"
                        }<span class="friends-count ng-binding">(${
                    favorites.length
               }/${maxNum})</span> </h3>
                        ${
                             maxNum == 9
                                  ? '<span class="see-all-button games-filter-changer btn-min-width btn-secondary-xs btn-more see-all-link-icon">Get 9 More Slots</span>'
                                  : ""
                        }
                    </a>
                    <div class="section-content remove-panel people-list" style="max-height: none!important;height: fit-content;">
                        <p ng-show="layout.friendsError" class="section-content-off ng-binding ng-hide" ng-bind="'Label.FriendsError' | translate">Unable to load best friends</p>
                        <ul class="hlist" ng-controller="friendsListController" people-list="" ng-class="{'invisible': !layout.isAllFriendsDataLoaded}">  </ul>
                        <span class="spinner spinner-default ng-hide" ng-show="!layout.isAllFriendsDataLoaded"></span> 
                    </div>
                </div>
            </div>
            `;
               (await first("#HomeContainer")).insertBefore(
                    container,
                    (await first("#HomeContainer")).children[1]
               );
               let orig = favorites.length;
               let favFriends = [];
               for (const favorite of favorites) {
                    let didFind = false;
                    for (const friend of friends?.data) {
                         if (friend.id == favorite) {
                              favFriends.push(friend);
                              didFind = true;
                         }
                    }
                    if (!didFind) {
                         console.log("Failed to find " + favorite);
                         favorites.splice(favorites.indexOf(favorite), 1);
                    }
               }
               if (orig != favorites.length) {
                    console.log("Failed to find some favorites");
                    syncSet("favorites", favorites);
               }

               const friendThumbnails = await get(
                    `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${favFriends
                         .map((f) => f.id)
                         .join(",")}&size=150x150&format=Png&isCircular=true`
               );
               const presences = await getPresence(favFriends.map((f) => f.id));
               for (const friend of favFriends) {
                    setTimeout(async () => {
                         let thumbnail;
                         for (const image of friendThumbnails.data) {
                              if (image.targetId == friend.id) {
                                   thumbnail = image.imageUrl;
                                   break;
                              }
                         }
                         const friendElement = document.createElement("li");
                         friendElement.setAttribute(
                              "class",
                              "list-item friend"
                         );
                         friendElement.setAttribute("rbx-user-id", friend.id);
                         friendElement.innerHTML = friendHTML;
                         friendElement.querySelector(
                              "a"
                         ).href = `/users/${friend.id}/profile`;
                         friendElement.querySelector("img").src = thumbnail;
                         friendElement.querySelector(".friend-name").innerText =
                              stripTags(friend.displayName);
                         friendElement.querySelector(".friend-name").title =
                              stripTags(friend.displayName);
                         container
                              .querySelector(".hlist")
                              .appendChild(friendElement);
                         let activity = presences.find(
                              (p) => p.userId == friend.id
                         );
                         createHoverPopup(
                              qs(".friend-link", friendElement),
                              friend,
                              activity
                         );
                         const placeName =
                              friendElement.querySelector(".place-name");
                         const friendStatus =
                              friendElement.querySelector(".friend-status");
                         if (activity?.userPresenceType !== 0) {
                              if (activity.lastLocation.includes("Playing")) {
                                   friendStatus.href =
                                        "https://www.roblox.com/games/" +
                                        activity.placeId;
                                   placeName.innerHTML = `<span class="text-overflow xsmall text-label place-name ng-binding ng-scope">${stripTags(
                                        activity.lastLocation
                                   ).replace("Playing ", "")}</span>`;
                                   friendStatus.innerHTML = `<span class="avatar-status friend-status icon-game" title="${stripTags(
                                        activity.lastLocation
                                   ).replace("Playing ", "")}"></span>`;
                              } else if (
                                   activity.lastLocation.includes("Creating")
                              ) {
                                   friendStatus.href = activity.placeId
                                        ? "https://www.roblox.com/games/" +
                                          activity.placeId
                                        : "";
                                   placeName.innerHTML = `<span class="text-overflow xsmall text-label place-name ng-binding ng-scope">${stripTags(
                                        activity.lastLocation
                                   ).replace("Creating ", "")}</span>`;
                                   friendStatus.innerHTML = `<span class="avatar-status friend-status icon-studio" title="${stripTags(
                                        activity.lastLocation
                                   ).replace("Creating ", "")}"></span>`;
                              } else {
                                   friendStatus.href = "";
                                   placeName.innerHTML = `<span class="text-overflow xsmall text-label place-name ng-binding ng-scope"></span>`;
                                   friendStatus.innerHTML = `<span class="avatar-status friend-status icon-online" title="Website"></span>`;
                              }
                         } else {
                              placeName.innerHTML = `<div class="text-overflow xsmall text-label place-name">${
                                   (activity?.lastOnline &&
                                        dateSince(
                                             new Date(activity.lastOnline)
                                        )) ||
                                   "Offline"
                              }</div>`;
                              friendStatus.remove();
                         }
                    }, 0);
               }
          }
     }, 0);
     setTimeout(async () => {
          if (!(await getSetting("Home Favorites"))) return;

          let favorites = document.createElement("div");
          favorites.setAttribute(
               "class",
               "col-xs-12 container-list places-list"
          );
          favorites.setAttribute("style", "margin-top: 6px; height: auto;");
          favorites.innerHTML = `
        <a><div class="container-header games-filter-changer"><h3>Favorites</h3></div></a>
        <ul class="hlist game-cards" style="display: contents;" id="options"></ul>
        <ul class="hlist item-cards item-cards-embed ng-scope" id="holder"></ul>
        `;
          (
               await find(
                    "#place-list .game-home-page-container .game-carousel",
                    2
               )
          ).after(favorites);
          const favoriteCategories = await get(
               `https://inventory.roblox.com/v1/users/${userId}/categories/favorites`
          );
          if (!favoriteCategories?.categories?.length) return;
          const pager = new Pager({ useBTR: false });
          const renderCategory = async (category) => {
               document.getElementById("holder").clearChildren();
               let info = await get(
                    `https://www.roblox.com/users/favorites/list-json?assetTypeId=${category.id}&itemsPerPage=100&pageNumber=1&userId=${userId}`
               );
               if (!info.IsValid || info.Data.Items.length === 0) {
                    const none = document.createElement("div");
                    none.setAttribute("class", "item-cards ng-scope");
                    none.innerHTML = `
                <div class="section-content-off"> 
                    <span>You have not favorited items in this category.</span> 
                    <span> 
                        <span>Try using the <a class="text-link" href="https://www.roblox.com/develop/library">library</a> to find new items.</span> 
                    </span> 
                </div>
                `;
                    document.getElementById("holder").appendChild(none);
                    return;
               }

               const [collectPages] = pager.constructPages(info.Data.Items, 12);
               pager.setMax();
               let loading = false;
               pager.onset = (newPage) => {
                    if (loading) return;
                    loading = true;
                    document.getElementById("holder").clearChildren();
                    const page = collectPages[newPage - 1];
                    for (const Item of page) {
                         const itemHtml = document.createElement("li");
                         itemHtml.setAttribute("class", "list-item item-card");
                         itemHtml.innerHTML = `
                        <div class="item-card-container">
                        <a class="item-card-link" href="${stripTags(
                             Item.Item.AbsoluteUrl
                        )}">
                            <div class="item-card-thumb-container">
                                <thumbnail-2d class="item-card-thumb ng-isolate-scope" thumbnail-type="item.itemV2.thumbnail.type" style="width: 100%; height: 100%">
                                    <span class="thumbnail-2d-container" thumbnail-type="Asset" style="width: 100%; height: 100%">
                                        <img thumbnail-error="$ctrl.setThumbnailLoadFailed" image-load="" alt="" title="" class="ng-scope ng-isolate-scope" src="${
                                             Item.Thumbnail.Url
                                        }">
                                    </span>
                                </thumbnail-2d>
                                <span class="icon-limited-label ng-hide"> </span> 
                                <span class="icon-limited-unique-label ng-hide"> </span> 
                            </div>
                            <div class="item-card-name" title="${stripTags(
                                 Item.Item.Name
                            )}">
                                <span ng-bind="item.Item.Name" class="ng-binding">${stripTags(
                                     Item.Item.Name
                                )}</span> 
                            </div>
                        </a>
                        <div ng-if="$ctrl.showCreatorName" class="text-overflow item-card-label ng-scope"> 
                            <span ng-bind="'Label.OwnershipPreposition' | translate" class="ng-binding">By</span> 
                            <a class="creator-name text-overflow text-link" href="${stripTags(
                                 Item.Creator.CreatorProfileLink
                            )}" style="display: inline;">${stripTags(
                              Item.Creator.Name
                         )}</a> 
                            <a class="creator-name text-overflow text-link"></a> 
                        </div>
                        <div class="text-overflow item-card-price">
                            <span class="icon-robux-16x16 ng-scope"></span>
                            <span class="text-robux-tile ng-binding" title="${addCommas(
                                 (Item.Product && Item.Product.PriceInRobux) ||
                                      0
                            )}">
                            ${NumberFormatting.abbreviatedFormat(
                                 (Item.Product && Item.Product.PriceInRobux) ||
                                      0
                            )}
                            </span>
                            <span class="text-label ng-hide">
                                <span class="text-overflow font-caption-body">Offsale</span>
                            </span>
                        </div>
                    </div>
                    `;
                         favorites
                              .querySelector("#holder")
                              .appendChild(itemHtml);
                         if (
                              !Item.Product ||
                              Item.Product.IsFree ||
                              Item.Product.PriceInRobux == null
                         ) {
                              itemHtml
                                   .querySelector(".text-label")
                                   .classList.remove("ng-hide");
                              itemHtml
                                   .querySelector(".text-robux-tile")
                                   .classList.add("ng-hide");
                              itemHtml
                                   .querySelector(".icon-robux-16x16")
                                   .classList.add("ng-hide");
                         }
                         if (Item.Product && Item.Product.IsLimited) {
                              itemHtml
                                   .querySelector(".icon-limited-label")
                                   .classList.remove("ng-hide");
                         } else if (
                              Item.Product &&
                              Item.Product.IsLimitedUnique
                         ) {
                              itemHtml
                                   .querySelector(".icon-limited-unique-label")
                                   .classList.remove("ng-hide");
                         }
                    }
                    loading = false;
               };
               pager.onset(1);
          };
          favorites.appendChild(pager.pager);
          for (const category of favoriteCategories.categories) {
               const isDropdown = category.items.length > 1;
               if (!isDropdown) {
                    const button = document.createElement("button");
                    button.setAttribute(
                         "class",
                         "btn-secondary-md group-form-button"
                    );
                    button.setAttribute(
                         "style",
                         "margin-bottom: 4px; margin-right: 5px;"
                    );
                    button.innerText = category.items[0].name;
                    document.getElementById("options").appendChild(button);
                    button.addEventListener("click", async () => {
                         renderCategory(category.items[0]);
                    });
               } else {
                    const select = document.createElement("select");
                    select.setAttribute(
                         "class",
                         "input-field rbx-select select-option"
                    );
                    select.setAttribute(
                         "style",
                         "margin-bottom: 4px; margin-right: 5px;"
                    );
                    for (const item of category.items) {
                         const option = document.createElement("option");
                         option.setAttribute("value", item.id);
                         option.innerText = item.name;
                         select.appendChild(option);
                    }
                    document.getElementById("options").appendChild(select);
                    select.addEventListener("change", async () => {
                         renderCategory(category.items[select.selectedIndex]);
                    });
               }
          }
          renderCategory(favoriteCategories.categories[10].items[0]);
     }, 1000);
     first(
          ".list-item.friend .text-overflow.xsmall.text-label.place-name",
          async () => {
               if (!(await getSetting("Last Online"))) return;
               const friendsToDo = [];
               on(".list-item.friend", async () => {
                    for (const friend of qsa(".list-item.friend") ?? []) {
                         let playing = qs(".place-name", friend);
                         if (!playing) {
                              if (
                                   qs(
                                        ".text-overflow.xsmall.text-label.place-name",
                                        friend
                                   )
                              ) {
                                   continue;
                              }
                              // if (fullBody.querySelector("img") == null) continue;
                              let id =
                                   parseInt(friend.id.replace("people-", "")) ||
                                   parseInt(friend.getAttribute("rbx-user-id"));
                              if (friendsToDo.includes(id)) continue;
                              friendsToDo.push(id);
                         }
                    }
               });
               setTimeout(async () => {
                    let friendStatuses = await getPresence(friendsToDo);
                    for (const friendStatus of friendStatuses) {
                         let friend =
                              document.getElementById(
                                   `people-${friendStatus.userId}`
                              ) || qs(`[rbx-user-id="${friendStatus.userId}"]`);
                         let placeName = qs(".place-name", friend);
                         if (!placeName) {
                              placeName = document.createElement("div");
                              placeName.className =
                                   "text-overflow xsmall text-label place-name";
                              qs(".friend-link", friend).appendChild(placeName);
                         }
                         if (
                              placeName &&
                              friendStatus.lastLocation &&
                              friendStatus.userPresenceType === 0
                         ) {
                              placeName.innerText = stripTags(
                                   friendStatus.lastLocation?.replace(
                                        /Playing|Creating/g,
                                        ""
                                   )
                              );
                         } else if (
                              placeName &&
                              friendStatus.userPresenceType !== 0
                         ) {
                              placeName.innerText =
                                   (friendStatus.lastOnline &&
                                        dateSince(
                                             new Date(friendStatus.lastOnline)
                                        )) ||
                                   "Offline";
                         }
                    }
               }, 1000);
          }
     );
     getSetting("Friend Updater").then((option) => {
          if (!option || option == "Off") return;
          const optionTime = Number(option.replace(/\D/g, "")) * 1000;
          const popups = {};
          setInterval(async () => {
               const frequents = (
                    await get(
                         "https://friends.roblox.com/v1/users/" +
                              userId +
                              "/friends?userSort=StatusFrequents"
                    )
               )?.data;
               if (!frequents) return;
               const presences = await getPresence(
                    frequents.map((f) => f.id).slice(0, 9)
               );
               const thumbnails = await get(
                    "https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=" +
                         frequents
                              .map((f) => f.id)
                              .slice(0, 9)
                              .join(",") +
                         "&size=150x150&format=Png&isCircular=true"
               );
               for (let i = 0; i < 9; i++) {
                    setTimeout(async () => {
                         const friend = frequents[i];
                         const list = qs(
                              "#people-list-container .people-list .hlist"
                         );
                         const element = list?.children?.[i];
                         if (!element) return;
                         if (element.getAttribute("rbx-user-id") == friend.id)
                              return;
                         if (popups[friend.id]) popups[friend.id]();
                         const friendElement = document.createElement("li");
                         friendElement.setAttribute(
                              "class",
                              "list-item friend"
                         );
                         friendElement.setAttribute("rbx-user-id", friend.id);
                         friendElement.innerHTML = friendHTML;
                         qs(
                              "a",
                              friendElement
                         ).href = `/users/${friend.id}/profile`;
                         qs("img", friendElement).src = thumbnails?.data?.find(
                              (t) => t.targetId == friend.id
                         )?.imageUrl;
                         qs(".friend-name", friendElement).innerText =
                              stripTags(friend.displayName);
                         qs(".friend-name", friendElement).title = stripTags(
                              friend.name
                         );

                         list.insertBefore(friendElement, element);
                         element.remove();

                         friendElement.setAttribute("rbx-user-id", friend.id);
                         friendElement.id = "people-" + friend.id;
                         qs(".friend-link", friendElement).href =
                              "/users/" + friend.id + "/profile";
                         qs(".friend-link", friendElement).setAttribute(
                              "popover-class",
                              "people-info-card-container people-info-" +
                                   friend.id
                         );
                         const friendStatus = presences.find(
                              (p) => p.userId == friend.id
                         );
                         const statusElement = qs(
                              ".friend-status",
                              friendElement
                         );
                         const updateElement =
                              qs(
                                   ".icon-studio, .icon-online, .icon-game",
                                   statusElement
                              ) || statusElement;
                         if (
                              statusElement &&
                              friendStatus?.userPresenceType !== 0
                         ) {
                              if (friendStatus.placeId) {
                                   statusElement.href =
                                        "https://roblox.com/games/" +
                                        friendStatus.placeId;
                                   updateElement.className =
                                        "avatar-status friend-status icon-" +
                                        ((friendStatus.userPresenceType == 3 &&
                                             "studio") ||
                                             "game");
                              } else {
                                   statusElement.href = "";
                                   updateElement.className =
                                        "avatar-status friend-status icon-online";
                              }
                         } else if (statusElement) {
                              statusElement.href = "";
                              updateElement.className =
                                   "avatar-status friend-status";
                         }
                         const placeName = qs(".place-name", friendElement);
                         if (
                              placeName &&
                              friendStatus.lastLocation &&
                              friendStatus.userPresenceType !== 0
                         ) {
                              placeName.innerText = stripTags(
                                   friendStatus.lastLocation?.replace(
                                        /Playing|Creating/g,
                                        ""
                                   )
                              );
                         } else if (
                              placeName &&
                              friendStatus.userPresenceType !== 0
                         ) {
                              placeName.innerText =
                                   (friendStatus.lastOnline &&
                                        dateSince(
                                             new Date(friendStatus.lastOnline)
                                        )) ||
                                   "Offline";
                         }
                         const popup = await createHoverPopup(
                              qs(".friend-link", friendElement),
                              friend,
                              friendStatus
                         );
                         popups[friend.id] = popup;
                    });
               }
          }, optionTime);
     });
     const getGreeting = async () => {
          return new Promise(async (resolve) => {
               const greetingType = await getSetting("Home Greeting");
               if (greetingType != "Off") {
                    const hours = new Date().getHours();
                    resolve(
                         ((greetingType == "Dynamic" &&
                              (hours < 5
                                   ? "Night"
                                   : hours < 12
                                   ? "Morning"
                                   : hours < 18
                                   ? "Afternoon"
                                   : "Evening")) ||
                              greetingType) + ", "
                    );
               }
               resolve("");
          });
     };
     if (await getSetting("Home User")) {
          on(
               "#HomeContainer > .section > .container-header > h1",
               async (e) => {
                    const hasPremium =
                         (await first("#upgrade-now-button"))?.textContent ==
                         "Premium";
                    const userData = qs("meta[name='user-data']");
                    const applyStyle = async () => {
                         e.style.display = "flex";
                         e.style.alignItems = "center";
                         e.style.marginBottom = "15px";
                         e.innerHTML = `
                    <a class="avatar avatar-card-fullbody" style="margin-right:15px;width:128px;height:128px;" href="/users/${userId}/profile">
                        <span class="avatar-card-link friend-avatar icon-placeholder-avatar-headshot" style="width:128px;height:128px;">
                            <thumbnail-2d class="avatar-card-image">
                                <span class="thumbnail-2d-container">
                                    <img src="${
                                         (
                                              await first(
                                                   "#navigation .avatar img"
                                              )
                                         )?.src
                                    }" style="background-color: #d4d4d4;"></img>
                                </span>
                            </thumbnail-2d>
                        </span>
                    </a>
                    ${
                         (hasPremium &&
                              '<span class="icon-premium-medium" style="margin-right: 10px;"></span>') ||
                         ""
                    }
                    <a href="/users/${userId}/profile" class="user-name-container">${await getGreeting()}${
                              userData?.getAttribute("data-displayname") ??
                              qs("#navigation .text-nav .font-header-2")
                                   ?.textContent
                         }</a>
                `;
                    };
                    applyStyle();
                    const glower = await first("#mostPlayedContainer");
                    if (glower) {
                         applyStyle();
                         e.style.height = "initial";
                         e.style.maxWidth = "55%";
                         e.style.marginBottom = "0px";
                         glower.parentNode.style.marginTop = "-140px";
                    }
               }
          );
     }
};
