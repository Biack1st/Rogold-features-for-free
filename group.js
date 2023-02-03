/*
    RoGold
    Coding and design by Alrovi Aps.
    Contact: contact@alrovi.com
    Copyright (C) Alrovi Aps
    All rights reserved.
*/

// TODO add group wall purging
pages.group = (async () => {
	const shouldGroup = await getSetting('More Group Stats')
	if (!shouldGroup) {
		return
	}
    if (window.location.href.includes("configure")) {
        // setInterval(async () => {
        //     $('#configure-group', window.parent.document).load(window.location.href + "#!/revenue/sales" + " #configure-group>*")
        // }, 5000)
    } else {
        const groupId = getId(window.location.href)
        const groupStats = await get("https://groups.roblox.com/v1/groups/" + groupId)
        const groupInfo = await get("https://groups.roblox.com/v2/groups?groupIds=" + groupId)
        if (groupStats.isLocked) {
            if (!(await checkExperiments())) return;
            if (!(await getSetting('View Locked Groups'))) return;
            const groupHolder = document.createElement('div')
            const roles = await get(`https://groups.roblox.com/v1/groups/${groupId}/roles`)
            const rolesCopy = $.extend(true,{},roles)
            const membership = await get(`https://groups.roblox.com/v1/groups/${groupId}/membership`)
            const groupFunds = await get(`https://economy.roblox.com/v1/groups/${groupId}/currency`)
            groupHolder.innerHTML = `
            <div class="section-content">
                <div class="hidden" id="page-top"></div>
                <div class="group-header">
                    <div class="group-image">
                        <thumbnail-2d thumbnail-type="thumbnailTypes.groupIcon" thumbnail-target-id="library.currentGroup.id" class="ng-isolate-scope">
                            <span ng-class="$ctrl.getCssClasses()" class="thumbnail-2d-container" thumbnail-type="GroupIcon" thumbnail-target-id="11479637">
                                <img image-load="" alt="" title="" class="ng-scope ng-isolate-scope" src="
                                ${(await postRepeat("https://thumbnails.roblox.com/v1/batch", {data: JSON.stringify([
                                    {requestId: groupId + ":undefined:GroupIcon:150x150:null:regular", size:"150x150", targetId: groupId, type: "Groupicon"}]
                                    )}
                                ))?.data?.[0]?.imageUrl}
                                "> 
                            </span>
                        </thumbnail-2d>
                    </div>
                    <div ng-if="!layout.loadGroupError" class="group-caption ng-scope">
                        <div class="group-title shimmer-lines ng-hide" ng-show="layout.isLoadingGroup">
                            <h1 class="group-name shimmer-line placeholder"></h1>
                            <div class="group-owner text font-caption-body shimmer-line placeholder"></div>
                        </div>
                        <div class="group-title" ng-hide="layout.isLoadingGroup">
                            <h1 class="group-name text-overflow ng-binding" ng-bind="library.currentGroup.group.name">${stripTags(groupStats.name ?? "")}</h1>
                            <div ng-if="doesGroupHaveOwner()" class="group-owner text font-caption-body ng-scope"> 
                            <span ng-bind="'Label.ByOwner' | translate" class="ng-binding">By</span> 
                            <a class="text-link ng-binding ng-scope" ng-bind="library.currentGroup.group.owner.displayName" href="https://www.roblox.com/users/${groupStats?.owner?.userId}/profile">${stripTags(groupStats?.owner?.username ?? "")}</a>
                            <br><span class="text-secondary">Created </span><a class="text-link">${dateFormat(groupInfo.data[0].created, "MMM DD, YYYY | hh:mm A")}</a></div>
                        </div>
                        <div class="group-info" ng-hide="layout.isLoadingGroup">
                            <ul class="group-stats">
                                <li class="group-members">
                                    <span class="font-header-2 ng-binding" title="5470" ng-bind="library.currentGroup.group.memberCount | abbreviate">${addCommas(roles.roles.reduce((e, a) => e+a.memberCount, 0))}</span> 
                                    <div class="text-label font-caption-header ng-binding" ng-bind="'Heading.Members' | translate">Members</div>
                                </li>
                                <li ng-if="canViewGroupRank()" class="group-rank text-overflow ng-scope">
                                    <span class="text-overflow font-header-2 ng-binding" title="Creator" ng-bind="library.currentGroup.role.name">${stripTags(membership.userRole.role.name ?? "")}</span> 
                                    <div class="text-label font-caption-header ng-binding" ng-bind="'Heading.Rank' | translate">Rank</div>
                                </li>
                                <li class="group-members">
                                    <span class="font-header-2 ng-binding" title="" id="group-active">0</span> 
                                    <div class="text-label font-caption-header ng-binding" ng-bind="'Heading.Members' | translate">Active</div>
                                </li>
                                <li class="group-members">
                                    <span class="font-header-2 ng-binding" title="" id="group-favorites">0</span> 
                                    <div class="text-label font-caption-header ng-binding" ng-bind="'Heading.Members' | translate">Favorites</div>
                                </li>
                                <li class="group-members">
                                    <span class="font-header-2 ng-binding" title="" id="group-visits">0</span> 
                                    <div class="text-label font-caption-header ng-binding" ng-bind="'Heading.Members' | translate">Visits</div>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="group-menu"> <a tabindex="0" class="rbx-menu-item" popover-placement="bottom-right" popover-trigger="'outsideClick'" uib-popover-template="'group-menu-popover'"> <span class="icon-more"></span> </a> </div>
                </div>
            </div>
            <div class="rbx-tabs-horizontal">
                <ul id="horizontal-tabs" class="nav nav-tabs" role="tablist">
                    <li id="about" class="rbx-tab group-tab ng-scope ng-isolate-scope active" ui-sref="about" href="#!/about"> <a class="rbx-tab-heading"> <span class="text-lead ng-binding" ng-bind="tab.translationKey | translate">About</span> </a> </li>
                    <li id="store" class="rbx-tab group-tab ng-scope ng-isolate-scope" ui-sref="store" href="#!/store"> <a class="rbx-tab-heading"> <span class="text-lead ng-binding" ng-bind="tab.translationKey | translate">Store</span> </a> </li>
                    <li id="affiliates" class="rbx-tab group-tab ng-scope ng-isolate-scope" ui-sref="affiliates" href="#!/affiliates"> <a class="rbx-tab-heading"> <span class="text-lead ng-binding" ng-bind="tab.translationKey | translate">Affiliates</span> </a> </li>
                </ul>
            </div>
            <div group-about="" class="ng-scope">
                <div class="tab-content rbx-tab-content col-xs-12">
                    <group-description group-id="library.currentGroup.id" description="library.currentGroup.group.description" funds="currencyInRobux" policies="policies" metadata="library.metadata" class="ng-isolate-scope">
                        <div class="section">
                            <div class="container-header">
                                <h3 ng-bind="'Heading.Description' | translate" class="ng-binding">Description</h3>
                            </div>
                            <div class="section-content remove-panel">
                                
                                <div class="group-description toggle-target ng-scope" ng-if="$ctrl.canViewDescription()">
                                    <pre id="group-description-text" class="text group-description-text">
                                    <span class="group-description-content-text ng-binding" ng-bind-html="$ctrl.description | linkify">${stripTags(groupStats.description ?? "")}</span>
                                    </pre>
                                </div>
                                <ul style="display: ${groupFunds?.robux && "block" || "none"}" class="border-top group-detail-stats ng-scope"> 
                                    <li class="group-detail-stat col-xs-6 col-md-2"> 
                                        <p class="text-label font-caption-header ng-binding" ng-bind="'Label.Funds' | translate">Funds</p> 
                                        <p class="text-lead"></p> 
                                        <h3 title="R$ ${addCommas(groupFunds?.robux ?? 0)}" class="icon-text-wrapper"> 
                                            <span class="icon-robux-28x28"></span> 
                                            <span class="text-robux-lg ng-binding">${NumberFormatting.abbreviatedFormat(groupFunds?.robux ?? 0)}</span> 
                                        </h3> 
                                    </li> 
                                </ul>
                            </div>
                            <div class="section-content remove-panel">
                                <div class="border-top group-description-footer">
                                     
                                </div>
                            </div>
                        </div>
                    </group-description>
                    <div style="display: ${groupStats.shout && "block" || "none"}" id="group-shout" class="section group-shout ng-scope" ng-if="canViewStatus() || canPostToStatus()">
                        <div class="container-header">
                            <h3 ng-bind="'Heading.Shout' | translate" class="ng-binding">Shout</h3>
                        </div>
                        <div class="section-content shout-container">
                            <div ng-if="canViewStatus()" class="avatar avatar-headshot avatar-headshot-sm ng-scope">
                                <a class="avatar-card-link" href="https://www.roblox.com/users/${groupStats?.shout?.poster?.userId}/profile">
                                    <thumbnail-2d class="avatar-card-image ng-isolate-scope" thumbnail-type="thumbnailTypes.avatarHeadshot" thumbnail-target-id="library.currentGroup.group.shout.poster.userId">
                                        <span ng-class="$ctrl.getCssClasses()" class="thumbnail-2d-container" thumbnail-type="AvatarHeadshot">
                                            
                                            <img image-load="" alt="" title="" class="ng-scope ng-isolate-scope" src="${groupStats.shout && (await postRepeat("https://thumbnails.roblox.com/v1/batch", {data: JSON.stringify([
                                                {requestId: groupStats?.shout?.poster?.userId + "::AvatarHeadshot:150x150:png:regular", size:"150x150", targetId: groupStats?.shout?.poster?.userId, type: "AvatarHeadShot", format: "png"}]
                                                )}
                                            ))?.data?.[0]?.imageUrl}"> 
                                        </span>
                                    </thumbnail-2d>
                                </a>
                            </div>
                            <div class="group-shout ng-scope" ng-if="canViewStatus()">
                                <div class="group-shout-name">
                                    
                                    <a class="text-name name ng-binding ng-scope" href="https://www.roblox.com/users/${groupStats?.shout?.poster?.userId}/profile">alexop1000</a> 
                                </div>
                                <div class="group-shout-body ng-binding">${stripTags(groupStats?.shout?.body ?? "")}</div>
                                <div class="group-shout-info">
                                    <div class="text-date-hint shout-date ng-binding" >${dateFormat(groupStats?.shout?.updated ?? (new Date()), "MMM DD, YYYY | hh:mm A")}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <group-games ng-if="library.currentGroup.areGroupGamesVisible" group-id="library.currentGroup.id" class="ng-scope ng-isolate-scope">
                        <div class="section">
                            <div class="container-header">
                                <h3 ng-bind="'Heading.Games' | translate" class="ng-binding">Experiences</h3>
                                <div class="pager-holder" ng-show="games.length > 0" cursor-pagination="gamesPager">
                                    <ul class="pager">
                                        <li class="pager-prev"> <button class="btn-generic-left-sm" ng-click="cursorPaging.loadPreviousPage()" ng-disabled="!cursorPaging.canLoadPreviousPage()" disabled="disabled"> <span class="icon-left"></span> </button> </li>
                                        <li> <span ng-bind="'Label.CurrentPage' | translate:{ currentPage: cursorPaging.getCurrentPageNumber() }" class="ng-binding">Page 1</span> </li>
                                        <li class="pager-next"> <button class="btn-generic-right-sm" ng-click="cursorPaging.loadNextPage()" ng-disabled="!cursorPaging.canLoadNextPage()" disabled="disabled"> <span class="icon-right"></span> </button> </li>
                                    </ul>
                                </div>
                            </div>
                            <div class="group-games">
                                <div class="spinner spinner-default ng-hide" ng-show="gamesPager.isBusy()"></div>
                                <div class="section-content-off ng-binding ng-hide" ng-show="!gamesPager.isBusy() &amp;&amp; games.length == 0" ng-bind="$ctrl.layout.loadGamesError ? 'Message.LoadGroupGamesError' : 'Label.NoGames' | translate">No experiences are associated with this group.</div>
                                <ul class="hlist game-cards" ng-show="!gamesPager.isBusy() &amp;&amp; games.length > 0">  </ul>
                            </div>
                        </div>
                    </group-games>
                    <div class="clearfix"></div>
                    <group-members-list ng-if="library.currentGroup.roles &amp;&amp; canViewMembers()" is-authenticated-user="isAuthenticatedUser" group-id="library.currentGroup.id" roles="library.currentGroup.roles" class="ng-scope ng-isolate-scope">
                        <div class="section" ng-hide="$ctrl.group.memberCount == 0">
                            <div class="container-header group-members-list-container-header">
                                <h3 ng-bind="'Heading.Members' | translate" class="ng-binding">Members</h3>
                                <div ng-show="$ctrl.members.length > 0" class="pager-holder" cursor-pagination="membersPager">
                                    <ul class="pager">
                                        <li class="pager-prev"> <button class="btn-generic-left-sm" ng-click="cursorPaging.loadPreviousPage()" ng-disabled="!cursorPaging.canLoadPreviousPage()" disabled="disabled"> <span class="icon-left"></span> </button> </li>
                                        <li> <span ng-bind="'Label.CurrentPage' | translate:{ currentPage: cursorPaging.getCurrentPageNumber() }" class="ng-binding">Page 1</span> </li>
                                        <li class="pager-next"> <button class="btn-generic-right-sm" ng-click="cursorPaging.loadNextPage()" ng-disabled="!cursorPaging.canLoadNextPage()"> <span class="icon-right"></span> </button> </li>
                                    </ul>
                                </div>
                                <div ng-if="$ctrl.roles.length > 0" class="input-group-btn group-dropdown ng-scope">
                                    <button type="button" class="input-dropdown-btn" data-toggle="dropdown"> <span class="rbx-selection-label ng-binding" title="Member" ng-bind="$ctrl.data.currentRoleName">Member</span> <span class="icon-down-16x16"></span> </button> 
                                    <ul data-toggle="dropdown-menu" class="dropdown-menu" role="menu">
                                    ${rolesCopy?.roles.splice(1).reduce((acc, role) => acc  + "<li><a><span class='text-overflow'>" + stripTags(role.name ?? "") + "</span><span class='role-member-count'>"+ addCommas(role?.memberCount ?? 0) +"</span></a></li>", "")}
                                    </ul>
                                </div>
                            </div>
                            <div class="spinner spinner-default ng-hide" ng-show="membersPager.isBusy() &amp;&amp; $ctrl.members.length == 0"></div>
                            <div class="section-content-off ng-binding ng-hide" ng-show="!membersPager.isBusy() &amp;&amp; $ctrl.members.length == 0" ng-bind="$ctrl.loadMembersError ? 'Message.BuildGroupRolesListError' : 'Label.NoMembersInRole' | translate">No group members are in this role.</div>
                            <div class="section-content group-members-list" ng-show="$ctrl.members.length > 0">
                                <ul class="hlist">  </ul>
                            </div>
                        </div>
                    </group-members-list>
                </div>
            </div>
            `
            document.querySelector(".group-details").appendChild(groupHolder);
            const createMembers = async (members) => {
                document.querySelector(".group-members-list .hlist").clearChildren()
                const avatarHeadshots = await postRepeat("https://thumbnails.roblox.com/v1/batch", {data: JSON.stringify(members.map(member => ({
                    requestId: member.userId + "::AvatarHeadshot:150x150:png:regular", 
                    size:"150x150", 
                    targetId: member.userId, 
                    type: "AvatarHeadShot", format: "png"
                })))})
                let i = 0;
                for (const member of members) {
                    if (i == 9) break;
                    i++;
                    const user = document.createElement("li")
                    user.className = "list-item member"
                    user.innerHTML = `
                    <div class="avatar-container"> 
                        <a href="https://www.roblox.com/users/${member.userId}/profile">
                            <span class="avatar-card-link-spanner"></span>
                        </a>
                        <div class="avatar avatar-card-fullbody">
                            <thumbnail-2d class="avatar-card-image ng-isolate-scope">
                                <span class="thumbnail-2d-container">
                                    <img image-load="" alt="" title="" class="ng-scope ng-isolate-scope" src="${avatarHeadshots?.data.find(e => e.targetId == member.userId).imageUrl}">
                                </span> 
                            </thumbnail-2d> 
                            <a class="avatar-status">
                                <span ng-show="member.presence.locationType === 1" class="icon-online ng-hide"></span>
                            </a>
                            <a class="avatar-status">
                                <span ng-show="member.presence.locationType === 2" class="icon-game ng-hide"></span>
                            </a>
                            <a class="avatar-status">
                                <span ng-show="member.presence.locationType === 3" class="icon-studio ng-hide"></span>
                            </a> 
                        </div>
                        <span class="text-overflow font-caption-header member-name ng-binding ng-scope" title="${stripTags(member.displayName)}">${stripTags(member.displayName)}</span>
                    </div>
                    `
                    document.querySelector(".group-members-list .hlist").appendChild(user)
                }
            }
            const games = await get(`https://games.roblox.com/v2/groups/${groupId}/games?accessFilter=Public&cursor=&limit=100&sortOrder=Desc`)
            let gameDatas = await get("https://games.roblox.com/v1/games?universeIds=" + games?.data?.map(game => game.id).join(","))
            document.querySelector("#group-active").textContent = addCommas(gameDatas?.data?.reduce((acc,game) => acc + game.playing, 0));
            document.querySelector("#group-favorites").textContent = addCommas(gameDatas?.data?.reduce((acc,game) => acc + game.favoritedCount, 0));
            document.querySelector("#group-visits").textContent = addCommas(gameDatas?.data?.reduce((acc,game) => acc + game.visits, 0));
            const gameThumbs = await postRepeat("https://thumbnails.roblox.com/v1/batch", {data: JSON.stringify(gameDatas?.data.map(game => ({
                requestId: game.id + ":undefined:GameIcon:150x150:null:regular", 
                size:"150x150", 
                targetId: game.id, 
                type: "GameIcon"
            })))})
            for (const game of gameDatas?.data ?? []) {
                const gameHolder = document.createElement("li")
                gameHolder.className = "list-item"
                gameHolder.innerHTML = `
                <group-games-item class="game-card game-tile ng-isolate-scope" game="game">
                    <div class="game-card-container"> 
                        <a class="game-card-link" href="https://www.roblox.com/games/${game.rootPlaceId}">
                            <thumbnail-2d class="game-card-thumb-container ng-isolate-scope">
                                <span class="thumbnail-2d-container" thumbnail-type="GameIcon">
                                    <img image-load="" alt="" title="" class="ng-scope ng-isolate-scope" src="${gameThumbs?.data.find(e => e.targetId == game.id).imageUrl}">
                                </span> 
                            </thumbnail-2d>
                            <div class="game-card-name game-name-title ng-binding" title="${stripTags(game.name)}">${stripTags(game.name)}</div> 
                            <div class="game-card-info"> 
                                <span class="info-label icon-votes-gray"></span>
                                <span class="info-label vote-percentage-label ng-binding ng-scope">86%</span>
                                <span class="info-label icon-playing-counts-gray"></span>
                                <span class="info-label playing-counts-label ng-binding" title="${game.playing}">${game.playing}</span>
                            </div>
                        </a>
                    </div>
                </group-games-item>
                `
                document.querySelector(".group-games .hlist").appendChild(gameHolder)
            }
            const normalMembers = await get(`https://groups.roblox.com/v1/groups/${groupId}/roles/${roles?.roles?.[1]?.id}/users?cursor=&limit=100&sortOrder=Desc`)
            for (const dropdown of document.querySelector("group-members-list .dropdown-menu").children) {
                const dropDownName = dropdown.querySelector(".text-overflow")
                const role = roles?.roles?.find(r => r.name == dropDownName.textContent)
                dropdown.addEventListener("click", async () => {
                    document.querySelector("group-members-list .input-dropdown-btn .rbx-selection-label").textContent = dropDownName.textContent
                    const categoryMembers = await get(`https://groups.roblox.com/v1/groups/${groupId}/roles/${role.id}/users?cursor=&limit=100&sortOrder=Desc`)
                    createMembers(categoryMembers?.data ?? [])
                })
            }
            createMembers(normalMembers?.data ?? [])
            return
        }
        first(".group-owner:not(.placeholder)[ng-if='doesGroupHaveOwner()']", (e) => e.innerHTML += `<br><span class="text-secondary">Created </span><span style="color:white">${dateFormat(groupInfo.data[0].created, "MMM DD, YYYY | hh:mm A")}</span>`)
        setTimeout(async () => {
            let groupGames = await get("https://games.roblox.com/v2/groups/" + groupId + "/gamesV2?accessFilter=Public&cursor=&limit=50&sortOrder=Desc")
            if (groupGames?.data?.length == 0) {
                return
            }
            await first(".group-members")
            const con = await createStat("Active"), 
                fav = await createStat("Favorites"), 
                vis = await createStat("Visits")
            async function createStat(header) {
                let element = document.createElement("li")
                element.innerHTML = `
                    <span class="font-header-2">Loading</span>
                    <div class="text-label font-caption-header">${header}</div>
                `
                document.querySelector('.group-members').parentNode.appendChild(element)
                return element
            }
            let totalConcurrent = 0
            let totalFavorites = 0
            let totalVisits = 0
            const count = async () => {
                return new Promise(async resolve => {
                    totalConcurrent = 0; totalFavorites = 0; totalVisits = 0
                    let ids = groupGames?.data?.map(game => game.id).join(",")
                    if (ids == "" || !ids) return resolve();
                    let gameDatas = await get("https://games.roblox.com/v1/games?universeIds=" + ids)
                    for (const gameData of gameDatas?.data ?? []) {
                        totalConcurrent += gameData.playing
                        totalFavorites += gameData.favoritedCount
                        totalVisits += gameData.visits
                    }
                    resolve()
                })
            }
            const set = () => {
                con.querySelector("span").textContent = addCommas(totalConcurrent)
                fav.querySelector("span").textContent = addCommas(totalFavorites)
                vis.querySelector("span").textContent = addCommas(totalVisits)
            }
            await count()
            set()
            setInterval(async () => {
                await count()
                set()
            }, 20000)
        }, 0)
        if (!await getSetting("Group Wall Replies")) return;
        const messages = await get("https://groups.roblox.com/v2/groups/" + groupId + "/wall/posts?cursor=&limit=50&sortOrder=Desc")
        const matchesDid = []
        const modal = new Modal("Filtered", "Roblox filtered the reply", "The reply was filtered by Roblox. Do you want to switch to an ID based reply system?\n This will make the reply less readable for non-rogold users, but will allow you to reply to this and other posts.", "This can be changed in settings")
        setInterval( async () => {
            if (document?.getElementsByClassName('comment')?.length > messages?.data?.length && messages?.nextPageCursor) {
                const newMessages = await get("https://groups.roblox.com/v2/groups/" + groupId + "/wall/posts?cursor=" + messages.nextPageCursor + "&limit=50&sortOrder=Desc")
                for (const message of newMessages.data) {
                    messages.data.push(message)
                }
                messages.nextPageCursor = newMessages.nextPageCursor
            }
            try {
                for (let comment of document.querySelectorAll('.list-content')) {
                    const commentTopParent = comment.parentElement.parentElement
                    if (commentTopParent.className.includes("comment") && commentTopParent.style.display != "none") {
                        for (const message of messages.data) {
                            if (!message.poster) continue;
                            if (message.body == comment.textContent) {
                                commentTopParent.id = getId(commentTopParent.querySelector("a.text-name").href) + "-message-id-" + stripTags(message.body)
                                commentTopParent.setAttribute("data-message-id", message.id)
                                break
                            }
                        }
                        const makeReply = async (messageElement, message) => {
                            if (messageElement) {
                                if (!messageElement.classList.contains("reply")) {
                                    messageElement.classList.add("reply")
                                    const emptyReply = document.createElement("div")
                                    emptyReply.className = "comment list-item"
                                    emptyReply.style.zIndex = "-1"
                                    messageElement.appendChild(emptyReply)
                                }
                                const reply = commentTopParent.cloneNode(true)
                                // Remove all the replies to this comment (elements with class "comment" and "list-item")
                                for (const replyElement of reply.getElementsByClassName("comment")) {
                                    replyElement.remove()
                                }

                                reply.getElementsByClassName('list-content')[0].textContent = stripTags(reply.getElementsByClassName('list-content')[0].textContent.replace(/\[Replying to .*\]/g, ""))
                                reply.classList.add("isReply")
                                messageElement.appendChild(reply)

                                // Remove all children of class "group-menu"
                                for (const child of reply.getElementsByClassName("group-menu")) {
                                    child.remove()
                                }
                                reply.querySelector("div:nth-child(1)").style.left = "7%"
                                reply.querySelector("div:nth-child(2)").style.left = "7%"
                                reply.querySelector("div:nth-child(2)").style.width = "calc(100% - 124px)"
                                reply.style.border = "none"
                                
                                commentTopParent.style.display = "none"

                                // Add delete button to reply
                                const deleteButton = document.createElement("div")
                                deleteButton.className = "group-menu"
                                deleteButton.innerHTML = `<div class="group-menu-item" style="width: 100%;"><div class="group-menu-item-content"><div class="group-menu-item-content-text"><span class="text-link">Delete</span></div></div></div>`
                                reply.appendChild(deleteButton)
                                deleteButton.addEventListener("click", async () => {
                                    const request = await fetch("https://groups.roblox.com/v1/groups/" + groupId + "/wall/posts/" + message.id, {
                                        method: "DELETE",
                                        headers: {
                                            "Content-Type": "application/json",
                                            "X-CSRF-Token": document.getElementsByName('csrf-token')[0].getAttribute('data-token')
                                        },
                                        credentials: "include"
                                    })
                                    const postRequest = await request.json()
                                    if (!postRequest.errors) {
                                        reply.remove()
                                    }
                                })
                                const messageUserId = message.poster.userId || message.poster.user.userId
                                if (messageUserId == getId(document.querySelector(".age-bracket-label .text-link").href)) {
                                    deleteButton.style.display = "block"
                                } else {
                                    deleteButton.style.display = "none"
                                }
                            }
                        }
                        // Match 3 capture groups: [Replying to <username>: "<message><optional "..." here>"]
                        let isReply = comment.textContent.match(/\[Replying to (.*): "(.*)"\]/)
                        // Alternatively use the number format: [Replying to <base64 messageId>]
                        if (!isReply?.[1]) {
                            isReply = comment.textContent.match(/\[Replying to (.*)==\]/)
                            if (isReply) {
                                try {
                                    isReply[1] = atob(isReply[1])
                                } catch {}
                            }
                        }
                        if (isReply) {
                            comment.parentElement.parentElement.style.visibility = "hidden"
                            comment.parentElement.parentElement.style.position = "absolute"
                            // If the comment is a reply to a message, find the comment with the message id (using the messages array) and add the reply to the message
                            if (!matchesDid.includes(commentTopParent.id)) {
                                // Remove the trailing "..." if it exists
                                const message = stripTags(isReply?.[2]?.replace(/\.\.\.$/, ""))
                                const topUserID = getId(commentTopParent.querySelector("a.text-name").href)
                                for (const messageElement of document.getElementsByClassName("comment")) {
                                    if (!messageElement.id) continue;
                                    const userID = getId(messageElement.querySelector("a.text-name").href)
                                    const match = messageElement.id.match(/^(.*)-message-id-(.*)$/)
                                    const doNext = async (e) => {
                                        // Find the reply data from the messages.data array
                                        const replyData = messages.data.find(msg => {
                                            return msg.body == (isReply.input) && msg.poster.user.userId == topUserID
                                        })
                                        matchesDid.push(commentTopParent.id)
                                        comment.parentElement.parentElement.style.visibility = "visible"
                                        comment.parentElement.parentElement.style.position = "relative"
                                        makeReply(messageElement, replyData)
                                    }
                                    const cleanedReply = isReply.map(e => stripTags(e))
                                    if (isReply[1] && (messages.data.find(msg => msg.id == isReply[1])?.id) == messageElement.getAttribute("data-message-id") && !messageElement.classList.contains("isReply")) {
                                        doNext()
                                        break
                                    } else if (match && (isReply[2]?.length < 20 && match[2] == message || (match[2].includes(message) && !match[2].includes(cleanedReply[0]))) && match[1] == userID && !messageElement.classList.contains("isReply")) {
                                        doNext(2)
                                        break
                                    }
                                }
                            }
                        } else {
                            // Add a reply button to the comment
                            if (!commentTopParent.classList.contains("isReply") && !commentTopParent.getElementsByClassName("reply-menu")[0]) {
                                const replyButton = document.createElement("div")
                                replyButton.className = "group-menu reply-menu"
                                replyButton.style.right = "35px"
                                replyButton.style.marginTop = "5px"
                                replyButton.style.zIndex = "500"
                                // Truncate string function
                                const truncate = (str, n) => {
                                    return str.length > n ? str.substr(0, n - 1) + '...' : str
                                }
                                const userId = commentTopParent.querySelector("a.text-name").href.match(/\d+/)[0]
                                replyButton.innerHTML = `
                                <button class="btn-secondary-md reply" style="padding:0px;margin-top:0px;">
                                    <div class="group-menu-item-text">Reply</div>
                                    <textarea id="postData" ng-model="groupWall.postData" ng-disabled="groupWall.isPostInProgress || groupWall.captchaActivated" 
                                        class="form-control input-field ng-valid ng-valid-maxlength ng-touched ng-dirty ng-empty"
                                        maxlength="${450}" placeholder="Say something..." spellcheck="false" style="display:none;height: 45px;">
                                    </textarea>
                                </button>
                                <button class="btn-secondary-md send" style="padding:0px;margin-top:3px;display:none;z-index:200" >
                                    <div class="group-menu-item-text" style="padding: 2px; float:left; margin-left:2px; margin-right:2px;">Send</div>
                                </button>`
                                commentTopParent.appendChild(replyButton)
                                replyButton.querySelector(".reply").style = "padding: 2px; float:left; margin-left:2px; margin-right:2px;"
                                replyButton.addEventListener("click", () => {
                                    if (replyButton.querySelector("textarea").style.display == "none") {
                                        replyButton.querySelector("textarea").style.display = "block"
                                        replyButton.querySelector("textarea").focus()
                                        replyButton.querySelector(".send").style.display = "block"
                                    } else {
                                        // replyButton.querySelector("textarea").style.display = "none"
                                        // replyButton.querySelector(".send").style.display = "none"
                                    }
                                })
                                // lost focus
                                replyButton.querySelector("textarea").addEventListener("blur", () => {
                                    setTimeout(() => {

                                    replyButton.querySelector("textarea").style.display = "none"
                                    replyButton.querySelector(".send").style.display = "none"
                                    }, 500)
                                })
                                replyButton.querySelector(".send").addEventListener("click", async () => {
                                    
                                    // modal.removeButton("Filtered-confirm-btn")
                                    // modal.addButton("Yes", "yes-btn", () => {
                                    //     // TODO
                                    //     modal.hide()
                                    // })
                                    // modal.addButton("No", "no-btn", () => {
                                    //     modal.hide()
                                    // })
                                    // modal.show()
                                    // return
                                    if (comment.textContent.length == 0) return;
                                    const requestedId = await get("https://users.roblox.com/v1/users/" + userId)
                                    const newId = "[Replying to " + (requestedId.name || commentTopParent.querySelector("a.text-name").textContent) + ": \"" + truncate(comment.textContent, 20) + "\"]"
                                    const request = await fetch("https://groups.roblox.com/v1/groups/" + groupId + "/wall/posts", {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                            "X-CSRF-Token": document.getElementsByName('csrf-token')[0].getAttribute('data-token')
                                        },
                                        body: JSON.stringify({
                                            body: newId + " " + replyButton.querySelector("textarea").value,
                                        }),
                                        credentials: "include"
                                    })
                                    const postRequest = await request.json()
                                    console.log(postRequest)
                                    if (postRequest.body !== newId + " " + replyButton.querySelector("textarea").value) {
                                        // Roblox filtered the post, need to present the user with an alternate system, like a modal for switching to an id based reply system
                                        // modal.show()
                                    }
                                    replyButton.querySelector("textarea").value = ""
                                    replyButton.querySelector("textarea").style.display = "none"
                                    replyButton.querySelector("button:nth-child(2)").style.display = "none"
                                    
                                    const newMessage = commentTopParent.cloneNode(true)
                                    for (const replyElement of newMessage.getElementsByClassName("comment")) {
                                        replyElement.remove()
                                    }
                                    newMessage.getElementsByClassName('list-content')[0].textContent = postRequest.body
                                    newMessage.querySelector(".text-name").textContent = postRequest.poster.username
                                    newMessage.querySelector(".text-name").href = "https://www.roblox.com/users/" + postRequest.poster.userId
                                    newMessage.querySelector(".text-date-hint").textContent = document.querySelector(".group-rank").querySelector("span").textContent + " | " + dateFormat(postRequest.created, "MMM DD, YYYY | hh:mm A")
                                    newMessage.querySelector("img").src = document.querySelector(".age-bracket-label img").src
                                    newMessage.querySelector(".group-menu").remove()
                                    // newMessage.id = postRequest.poster.displayName + "-message-id-" + stripTags(postRequest.body)
                                    postRequest.poster.user = {
                                        username: postRequest.poster.username,
                                        userId: postRequest.poster.userId,
                                        displayName: postRequest.poster.displayName
                                    }
                                    messages.data.push(postRequest)
                                    
                                    commentTopParent.parentNode.appendChild(newMessage)
                                })
                            }
                        }
                        const matches = stripTags(comment.textContent).match(/\@\w+/g)
                        if (!matches) continue;
                        const username = comment.parentElement.childNodes[0].textContent
                        for (const match of matches) {
                            if (matchesDid[match + "_" + username]) continue;
                            matchesDid[match + "_" + username] = true
                            const textLink = document.createElement('a')
                            textLink.setAttribute('class', 'text-link')
                            textLink.setAttribute('href', 'https://www.roblox.com/search/users?keyword=' + match)
                            textLink.setAttribute('target', '_blank')
                            textLink.setAttribute('rel', 'noopener')
                            textLink.innerText = match
                            comment.innerHTML = comment.innerHTML.replaceAll(match, textLink.outerHTML)
                        }
                    }
                }
            } catch (err) {
                console.log(err)
            }
        }, 1000)
    }
})