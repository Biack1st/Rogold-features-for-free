/*
    RoGold

    Coding and design by alexop1000 (AlexOp).
    Contact: https://rogold.me/invite

    Copyright (C) alexop1000 
	All rights reserved.
*/

var s = document.createElement('script');
s.src = browserTop.runtime.getURL('init.js');
(document.head || document.documentElement).appendChild(s);
s.onload = function () {
    s.remove();
};


async function addGame(name, id, url, thumbnail, num) {
    const gameHTML = `
    <div class="game-card-container" style="flex: 0 0 auto; margin: 0 11px 0 0; width: 150px;">
        <a class="game-card-link" href="${url}">
            <div class="game-card-thumb-container" id="${parseInt(id)}">
                <div class="game-card-thumb">
                    <span class="thumbnail-2d-container"><img class="game-card-thumb" src="${stripTags(thumbnail)}"
                            alt="${stripTags(name)}" title="${stripTags(name)}">
                    </span>
                </div>
            </div>
        </a>
        <div style="margin-top:-3px;font-size:12px;padding:0px;text-overflow:ellipsis;white-space:nowrap;text-align:center;"
            class="game-card-name game-name-title" title="${stripTags(name)}">${stripTags(name)}</div>
        <div style="display:flex;position:relative;justify-content:space-around;" class="game-card-info">
            <button id="play-${id}" type="button"
                class="btn-full-width btn-common-play-game-lg btn-primary-md btn-min-width"
                style="width:45%;min-width:45%;padding:2px;margin-top:5px;float:left;margin-left:2px;">
                <span class="icon-common-play" style="background-size:34px auto;width:16px;height:19px;"></span></button>
            <button id="edit-${id}" type="button"
                class="btn-full-width btn-common-play-game-lg btn-primary-md btn-min-width"
                style="width:45%;min-width:45%;padding:2px;margin-top:5px;float:right;margin-right:2px;background-color:#262928;border-color:#3e4442;">
                <span class="icon-common-play"
                    style="background-size:34px auto;width:16px;height:19px;background-image:url('https://images.rbxcdn.com/a057a8bc94e7ab78517765ddb4e77384-generic_dark_11062018.svg');background-repeat:no-repeat;background-position:0px -50px;"></span></button>
        </div>
    </div>
    `
    const li = document.createElement('li')
    li.setAttribute("style", "height:199px;padding:0 14px 0 0;width:161px;")
    li.setAttribute("class", "list-item game-card game-tile")
    li.setAttribute("title", stripTags(name))
    if ((num / 6) % 1 == 0) {
        li.setAttribute("style", "height:199px;padding:0 14px 0 0;width:161px;")
    }
    li.innerHTML = gameHTML
    document.getElementById("pinned-container").appendChild(li)
    let canEdit = await get("https://develop.roblox.com/v2/places/" + id)
    if (!canEdit || canEdit == undefined || canEdit.errors || canEdit == "ERROR" || !canEdit.id) {
        document.getElementById("edit-" + id).remove()
        document.getElementById("play-" + id).style.width = "90%"
    } else {
        document.getElementById("edit-" + id).addEventListener('click', () => {
            window.postMessage({
                direction: "EditPlace",
                PlaceId: id,
            })
        })
    }
    // document.getElementById(id).addEventListener('click', () => {
    //     window.location = url
    // })
    document.getElementById("play-" + id).addEventListener('click', () => {
        window.postMessage({
            direction: "PlayPlace",
            PlaceId: id,
        })
    })
    return li
}
const helloMessages = ["Hello", "Hey", "Hi", "Salut", "Olá", "Wassup", "G'day", "Welcome"];
pages.home = (async () => {
    let userId = await get(`https://users.roblox.com/v1/users/authenticated`)
    userId = userId.id
    setTimeout(() => {
        getSetting('Pinned Games').then(async (result) => {
            if (result) {
                let didPinned = false
                const addPinned = async (added_node) => {
                    if (didPinned) {
                        return
                    }
                    didPinned = true
                    // if not added_node then wait until document.getElementById('place-list').firstChild.firstChild is found and assing it to added_node
                    if (!added_node) {
                        let i = 0
                        while (!document.getElementById('place-list').firstChild.firstChild) {
                            await sleep(100)
                            if (i > 50) {
                                break
                            }
                            i++
                        }
                        added_node = document.getElementById('place-list').firstChild.firstChild
                    }
                    let pinTitle = document.createElement('div')
                    pinTitle.setAttribute('class', 'col-xs-12 container-list places-list')
                    pinTitle.setAttribute('style', 'margin-top: 6px; height: 253px')
                    let maxPinned = await get(`https://inventory.roblox.com/v1/users/50654562/items/GamePass/20000192`) // pls no change i worked hard to make this :grief:
                    let maxNum = 6
                    if (maxPinned.data[0]) {
                        console.log("extra 6");
                        maxNum += 6
                        pinTitle.innerHTML = `
                        <a>
                            <div class="container-header games-filter-changer">
                                <h3>Pinned📌</h3>
                            </div>
                        </a>
                        <ul class="hlist game-cards" id="pinned-container" style="display: contents">
                        </ul>
                        `
                    } else {
                        pinTitle.innerHTML = `
                        <a href="/game-pass/20000192/6-Pinned">
                            <div class="container-header games-filter-changer">
                                <h3>Pinned📌</h3>
                                <span class="see-all-button games-filter-changer btn-min-width btn-secondary-xs btn-more see-all-link-icon">Get 6 More Slots</span>
                            </div>
                        </a>
                        <ul class="hlist game-cards" id="pinned-container">
                        </ul>
                        `
                    }
                    syncGet('pinned', async function (result) {
                        if (result && result.pinned && result.pinned.length > 0) {
                            if (result.pinned.length > 6) {
                                pinTitle.setAttribute('style', 'height: 468px;')
                            }
                            const continueAddNode = async () => {
                                if (!added_node.parentNode) added_node = document.getElementById('place-list').firstChild.firstChild;
                                added_node.parentNode.insertBefore(pinTitle, document.getElementsByClassName('game-home-page-carousel-title')[0]);
                                let thumbnails = await get('https://thumbnails.roblox.com/v1/games/icons?universeIds=' + result.pinned.join(",") + "&size=150x150&format=Png&isCircular=false")
                                let gameInfos = await get('https://games.roblox.com/v1/games?universeIds=' + result.pinned.join(","))
                                let num = 0
                                for (const gameInfo of gameInfos?.data) {
                                    if (num == maxNum) {
                                        break
                                    }
                                    num++
                                    let thumb = ""
                                    for (const image of thumbnails.data) {
                                        if (image.targetId == gameInfo.id) {
                                            thumb = image.imageUrl
                                            break
                                        }
                                    }
                                    addGame(gameInfo.name, gameInfo.rootPlaceId, "https://roblox.com/games/" + gameInfo.rootPlaceId, thumb, num)
                                }
                            }
                            if (!added_node) {
                                added_node = document.getElementById('place-list').firstChild.firstChild
                            }
                            if (!added_node) {
                                setTimeout(() => {
                                    added_node = document.getElementById('place-list').firstChild.firstChild
                                    continueAddNode()
                                }, 1000)
                            } else {
                                continueAddNode()
                            }
                        }
                    })
                }
    
                observe(document.getElementById('place-list'), 'loading', async () => {
                    addPinned(document.getElementById('place-list').firstChild.firstChild)
                }, true, false)
    
                setTimeout(async () => {
                    addPinned(document.getElementById('place-list').firstChild.firstChild)
                }, 1000)
    
            }
        })
    }, 0)
    setTimeout(async () => {
        const doFavorites = await getSetting("Best Friends")
        if (!doFavorites) return;
        let friends = await get(`https://friends.roblox.com/v1/users/${userId}/friends`)
        let maxBF = await get(`https://inventory.roblox.com/v1/users/50654562/items/GamePass/26817185`) // Very mean if you change this ;( its cheap too
        let maxNum = maxBF.data && maxBF.data[0] ? 18 : 9
        let favorites = await pGetStorage('favorites') || []
        if (favorites && favorites.length > 0) {
            const container = document.createElement('div')
            container.setAttribute('class', 'col-xs-12 home-header-container')
            container.innerHTML = `
            <div class="col-xs-12 people-list-container" style="max-height: 133px; height: 133px;">
                <div class="section home-friends">
                    <a class="container-header people-list-header" ${maxNum == 9 ? 'href="/game-pass/26817185/9-Best-Friends"' : ''}>
                        <h3>Best Friends<span class="friends-count ng-binding">(${favorites.length}/${maxNum})</span> </h3>
                        ${maxNum == 9 ? '<span class="see-all-button games-filter-changer btn-min-width btn-secondary-xs btn-more see-all-link-icon">Get 9 More Slots</span>' : ""}
                    </a>
                    <div class="section-content remove-panel people-list" style="max-height: 133px; height: 133px;">
                        <p ng-show="layout.friendsError" class="section-content-off ng-binding ng-hide" ng-bind="'Label.FriendsError' | translate">Unable to load best friends</p>
                        <ul class="hlist" ng-controller="friendsListController" people-list="" ng-class="{'invisible': !layout.isAllFriendsDataLoaded}">  </ul>
                        <span class="spinner spinner-default ng-hide" ng-show="!layout.isAllFriendsDataLoaded"></span> 
                    </div>
                </div>
            </div>
            `
            document.getElementById('HomeContainer').insertBefore(container, document.getElementById('HomeContainer').children[1])
            if (favorites.length > 9) {
                container.style.marginBottom = "50px"
                container.querySelector(".col-xs-12").style.maxHeight = "266px"
                container.querySelector(".col-xs-12").style.height = "266px"
                container.querySelector(".section-content").style.maxHeight = "266px"
                container.querySelector(".section-content").style.height = "266px"
            }
            let orig = favorites.length
            let favFriends = []
            for (const favorite of favorites) {
                let didFind = false
                for (const friend of friends.data) {
                    if (friend.id == favorite) {
                        favFriends.push(friend)
                        didFind = true
                    }
                }
                if (!didFind) {
                    console.log("Failed to find " + favorite)
                    favorites.splice(favorites.indexOf(favorite), 1)
                }
            }
            if (orig != favorites.length){
                console.log("Failed to find some favorites")
                syncSet("favorites", favorites)
            }

            const friendThumbnails = await get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${favFriends.map(f => f.id).join(",")}&size=150x150&format=Png&isCircular=true`)
            for (const friend of favFriends) {
                setTimeout(async () => {
                    let thumbnail
                    for (const image of friendThumbnails.data) {
                        if (image.targetId == friend.id) {
                            thumbnail = image.imageUrl
                            break
                        }
                    }
                    let activity = await get('https://api.roblox.com/users/' + friend.id + '/OnlineStatus')
                    const friendElement = document.createElement('li')
                    friendElement.setAttribute('class', 'list-item friend')
                    friendElement.setAttribute('rbx-user-id', friend.id)
                    friendElement.innerHTML = `
                    <div ng-controller="peopleController" people="" class="ng-scope">
                        <div class="avatar-container">
                            <a href="/users/${friend.id}/profile" class="text-link friend-link ng-isolate-scope" ng-click="clickAvatar(friend, $index)" popover-trigger=" 'none' " popover-class="people-info-card-container card-with-game people-info-${friend.id}" popover-placement="bottom" popover-append-to-body="true" popover-is-open="hoverPopoverParams.isOpen" hover-popover-params="hoverPopoverParams" hover-popover="" uib-popover-template="'people-info-card'">
                                <div class="avatar avatar-card-fullbody">
                                    <span class="avatar-card-link friend-avatar icon-placeholder-avatar-headshot" ng-class="{'icon-placeholder-avatar-headshot': !friend.avatar.imageUrl}">
                                        <thumbnail-2d class="avatar-card-image ng-isolate-scope" thumbnail-type="layout.thumbnailTypes.avatarHeadshot" thumbnail-target-id="friend.id">
                                            <span ng-class="$ctrl.getCssClasses()" class="thumbnail-2d-container" thumbnail-type="AvatarHeadshot" thumbnail-target-id="${friend.id}">
                                                <img image-load="" alt="" title="" class="ng-scope ng-isolate-scope" src="${thumbnail}">
                                            </span>
                                        </thumbnail-2d>
                                    </span>
                                </div>
                                <span class="text-overflow friend-name font-caption-header ng-binding" ng-bind="friend.nameToDisplay" title="${friend.displayName}">${friend.displayName}</span> 
                                <div class="text-overflow xsmall text-label place-name ng-binding ng-scope"></div>
                            </a>
                            <a class="friend-status place-link ng-scope" ng-if="friend.presence.placeUrl" ng-click="clickPlaceLink(friend, $index)" href="https://www.roblox.com/games/"> 
                                <span class="avatar-status friend-status icon-game" title=""></span> 
                            </a>
                        </div>
                    </div>
                    `
                    container.querySelector('.hlist').appendChild(friendElement)
                    const placeName = friendElement.querySelector(".place-name")
                    const friendStatus = friendElement.querySelector(".friend-status")
                    if (activity.IsOnline) {
                        if (activity.LastLocation.includes("Playing")) {
                            friendStatus.href = "https://www.roblox.com/games/" + activity.PlaceId
                            placeName.innerHTML = `<span class="text-overflow xsmall text-label place-name ng-binding ng-scope">${stripTags(activity.LastLocation).replace("Playing ", "")}</span>`
                            friendStatus.innerHTML = `<span class="avatar-status friend-status icon-game" title="${stripTags(activity.LastLocation).replace("Playing ", "")}"></span>`
                        } else if (activity.LastLocation.includes("Creating")) {
                            friendStatus.href = activity.PlaceId ? "https://www.roblox.com/games/" + activity.PlaceId : ""
                            placeName.innerHTML = `<span class="text-overflow xsmall text-label place-name ng-binding ng-scope">${stripTags(activity.LastLocation).replace("Creating ", "")}</span>`
                            friendStatus.innerHTML = `<span class="avatar-status friend-status icon-studio" title="${stripTags(activity.LastLocation).replace("Creating ", "")}"></span>`
                        } else {
                            friendStatus.href = ""
                            placeName.innerHTML = `<span class="text-overflow xsmall text-label place-name ng-binding ng-scope"></span>`
                            friendStatus.innerHTML = `<span class="avatar-status friend-status icon-online" title="Website"></span>`
                        }
                    } else {
                        placeName.remove()
                        friendStatus.remove()
                    }
                }, 0)
            }
        }

    }, 0)
    setTimeout(async () => {
        if (!(await getSetting('Home Favorites'))) return;

        let favorites = document.createElement('div')
        favorites.setAttribute('class', 'col-xs-12 container-list places-list')
        favorites.setAttribute('style', 'margin-top: 6px; height: auto;')
        favorites.innerHTML = `
        <a><div class="container-header games-filter-changer"><h3>Favorites</h3></div></a>
        <ul class="hlist game-cards" style="display: contents;" id="options"></ul>
        <ul class="hlist item-cards item-cards-embed ng-scope" id="holder"></ul>
        `
        await sleep(1000)
        await first(".game-home-page-carousel-title")
        await first(".game-home-page-carousel-title:nth-child(3n)")
        document.getElementById('place-list').firstChild.insertBefore(favorites, document.getElementById('place-list').firstChild.querySelector(".game-home-page-carousel-title:nth-child(3n)"))
        const favoriteCategories = await get(`https://inventory.roblox.com/v1/users/${userId}/categories/favorites`)
        const pager = new Pager({ useBTR: false })
        const renderCategory = async (category) => {
            document.getElementById('holder').clearChildren()
            let info = await get(`https://www.roblox.com/users/favorites/list-json?assetTypeId=${category.id}&itemsPerPage=100&pageNumber=1&userId=${userId}`)
            if (!info.IsValid || info.Data.Items.length === 0) {
                const none = document.createElement('div')
                none.setAttribute('class', 'item-cards ng-scope')   
                none.innerHTML = `
                <div class="section-content-off"> 
                    <span>You have not favorited items in this category.</span> 
                    <span> 
                        <span>Try using the <a class="text-link" href="https://www.roblox.com/develop/library">library</a> to find new items.</span> 
                    </span> 
                </div>
                `
                document.getElementById('holder').appendChild(none)
                return
            }
            
            const [collectPages] = pager.constructPages(info.Data.Items, 12)
            pager.setMax()
            let loading = false
            pager.onset = (newPage) => {
                if (loading) return;
                loading = true
                document.getElementById('holder').clearChildren()
                const page = collectPages[newPage - 1]
                for (const Item of page) {
                    const itemHtml = document.createElement('li')
                    itemHtml.setAttribute('class', 'list-item item-card')
                    itemHtml.innerHTML = `
                        <div class="item-card-container">
                        <a class="item-card-link" href="${Item.Item.AbsoluteUrl}">
                            <div class="item-card-thumb-container">
                                <thumbnail-2d class="item-card-thumb ng-isolate-scope" thumbnail-type="item.itemV2.thumbnail.type" style="width: 100%; height: 100%">
                                    <span class="thumbnail-2d-container" thumbnail-type="Asset" style="width: 100%; height: 100%">
                                        <img thumbnail-error="$ctrl.setThumbnailLoadFailed" image-load="" alt="" title="" class="ng-scope ng-isolate-scope" src="${Item.Thumbnail.Url}">
                                    </span>
                                </thumbnail-2d>
                                <span class="icon-limited-label ng-hide"> </span> 
                                <span class="icon-limited-unique-label ng-hide"> </span> 
                            </div>
                            <div class="item-card-name" title="${stripTags(Item.Item.Name)}">
                                <span ng-bind="item.Item.Name" class="ng-binding">${stripTags(Item.Item.Name)}</span> 
                            </div>
                        </a>
                        <div ng-if="$ctrl.showCreatorName" class="text-overflow item-card-label ng-scope"> 
                            <span ng-bind="'Label.OwnershipPreposition' | translate" class="ng-binding">By</span> 
                            <a class="creator-name text-overflow text-link" href="${Item.Creator.CreatorProfileLink}" style="display: inline;">${stripTags(Item.Creator.Name)}</a> 
                            <a class="creator-name text-overflow text-link"></a> 
                        </div>
                        <div class="text-overflow item-card-price">
                            <span class="icon-robux-16x16 ng-scope"></span>
                            <span class="text-robux-tile ng-binding" title="${addCommas(Item.Product && Item.Product.PriceInRobux || 0)}">
                            ${NumberFormatting.abbreviatedFormat(Item.Product && Item.Product.PriceInRobux || 0)}
                            </span>
                            <span class="text-label ng-hide">
                                <span class="text-overflow font-caption-body">Offsale</span>
                            </span>
                        </div>
                    </div>
                    `
                    favorites.querySelector('#holder').appendChild(itemHtml)
                    if (!Item.Product || Item.Product.IsFree || Item.Product.PriceInRobux == null) {
                        itemHtml.querySelector('.text-label').classList.remove('ng-hide')
                        itemHtml.querySelector('.text-robux-tile').classList.add('ng-hide')
                        itemHtml.querySelector('.icon-robux-16x16').classList.add('ng-hide')
                    }
                    if (Item.Product && Item.Product.IsLimited) {
                        itemHtml.querySelector('.icon-limited-label').classList.remove('ng-hide')
                    } else if (Item.Product && Item.Product.IsLimitedUnique) {
                        itemHtml.querySelector('.icon-limited-unique-label').classList.remove('ng-hide')
                    }
                }
                loading = false
            }
            pager.onset(1)
        }
        favorites.appendChild(pager.pager)
        for (const category of favoriteCategories.categories) {
            const isDropdown = category.items.length > 1
            if (!isDropdown) {
                const button = document.createElement('button')
                button.setAttribute('class', 'btn-secondary-md group-form-button')
                button.setAttribute('style', 'margin-bottom: 4px; margin-right: 5px;')
                button.innerText = category.items[0].name
                document.getElementById('options').appendChild(button)
                button.addEventListener('click', async () => {
                    renderCategory(category.items[0])
                })
            } else {
                const select = document.createElement('select')
                select.setAttribute('class', 'input-field rbx-select select-option')
                select.setAttribute('style', 'margin-bottom: 4px; margin-right: 5px;')
                for (const item of category.items) {
                    const option = document.createElement('option')
                    option.setAttribute('value', item.id)
                    option.innerText = item.name
                    select.appendChild(option)
                }
                document.getElementById('options').appendChild(select)
                select.addEventListener('change', async () => {
                    renderCategory(category.items[select.selectedIndex])
                })
            }
        }
        renderCategory(favoriteCategories.categories[10].items[0])
    }, 1000)
    const friendsDid = []
    on(".list-item.friend", async() => {
        for (const friend of document.querySelectorAll('.list-item.friend') ?? []) {
            let playing = friend.querySelector('.place-name')
            if (!playing) {
                let fullBody = friend.querySelector('.avatar-container')
                if (friend.querySelector('.text-overflow.xsmall.text-label.place-name')) {
                    continue;
                }
                if (fullBody.querySelector("img") == null) continue;
                let id = parseInt(friend.id.replace("people-", "")) || parseInt(friend.getAttribute("rbx-user-id"))
                if (friendsDid.includes(friend.id || friend.getAttribute("rbx-user-id"))) continue;
                friendsDid.push(friend.id || friend.getAttribute("rbx-user-id"))
                let activity = await get('https://api.roblox.com/users/' + id + '/OnlineStatus')
                if (activity.IsOnline) {
                    fullBody.innerHTML = fullBody.innerHTML + `
                    <div class="text-overflow xsmall text-label place-name" href="https://roblox.com/games/${activity.PlaceId == ""}" title="${stripTags(activity.LastLocation)}">${stripTags(activity.LastLocation)}</div>
                    `
                } else if (!activity.IsOnline) {
                    fullBody.innerHTML = fullBody.innerHTML + `
                    <div class="text-overflow xsmall text-label place-name">${dateSince(new Date(activity.LastOnline))}</div>
                    `
                }
            }
        }
    })
    
    const greetingType = await getSetting("Home Greeting")
    if (greetingType != "Off") {
        const hours = new Date().getHours()
        const greeting = greetingType == "Dynamic" && (hours < 5 ? "Night" : hours < 12 ? "Morning" : hours < 18 ? "Afternoon" : "Evening") || greetingType
        let greetingElement = await first('.user-name-container')
        if (!greetingElement.textContent.includes(greeting)) {
            greetingElement.textContent = greeting + ", " + greetingElement.textContent;
        }
    }
})