/*
    RoGold

    Coding and design by alexop1000 (AlexOp).
    Contact: https://rogold.me/invite

    Copyright (C) alexop1000 
	All rights reserved.
*/

async function makeSearchContent(error) {
    let mainContent = await first("#container-main .content")
    mainContent.getElementsByClassName('request-error-page-content')[0].remove()
    mainContent.style = "display: flex;justify-content: center;flex-direction: row;flex-wrap: wrap;"
    mainContent.innerHTML = `
    ${error ? `<span class="text-error">${error}</span>` : ""}
    <h1 style="width:100%;text-align:center;">Find Banned User</h1>
    <input class="form-control input-field" style="width:auto;" placeholder="Enter username or userId">
        <button class="btn-control-sm" style="margin-left:5px;" id="search">Search</button>
    </input>`
    let search = await first("#search")
    search.addEventListener('click', async () => {
        let input = await first("#container-main .content input")
        let username = input.value
        window.location.href = `/banned-users/${username}`
    })
}

pages.banned = (async () => {
    if (window.location.href.split('/')[4] == '') {
        await makeSearchContent()
        return
    }
	let userId
	try {
		userId = Number(window.location.href.split('/')[4])
	} catch (error) {
		console.warn(error)
	}
	if (!userId) {
		const name = window.location.href.split('/')[4]
		userId = await get("https://api.roblox.com/users/get-by-username?username=" + name)
		userId = userId.Id
        window.location.href = window.location.href.replace(window.location.href.split('/')[4], "") + userId
	}
	if (!userId) return;
    
	const view = await getSetting('View Banned Users')
	if (!view) {
		return
	}
	let userInfo = await get('https://users.roblox.com/v1/users/' + userId)
    if (userInfo.responseJSON && userInfo.responseJSON.errors) {
        await makeSearchContent(userInfo.responseJSON.errors[0].message)
        return
    }
	if (!userInfo.isBanned) {
		window.location.href = "https://www.roblox.com/users/" + userId
		return
	}
	const mainContent = await first("#container-main .content")
	mainContent.querySelector('.request-error-page-content').remove()
	mainContent.innerHTML = `<div ng-show="loading" loading-animated="" id="loader"><span class="spinner spinner-default"></span> </div>`
	let friends = await get('https://friends.roblox.com/v1/users/' + userId + '/friends/count')
	let followers = await get('https://friends.roblox.com/v1/users/' + userId + '/followers/count')
	let following = await get('https://friends.roblox.com/v1/users/' + userId + '/followings/count')
	let icon = await get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`)
	let avatar = await get(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=352x352&format=Png&isCircular=false`)
	let friendsList = await get(`https://friends.roblox.com/v1/users/${userId}/friends`)
	let groups = await get("https://groups.roblox.com/v1/users/" + userId + "/groups/roles")
	let favorites = await get("https://www.roblox.com/users/favorites/list-json?assetTypeId=9&itemsPerPage=7&pageNumber=1&userId=" + userId)
	let rBadges = await get(`https://accountinformation.roblox.com/v1/users/${userId}/roblox-badges`)
	let badges = await get(`https://badges.roblox.com/v1/users/${userId}/badges?sortOrder=Desc`)
	// let userStatus = await get("https://api.roblox.com/users/" + userId + "/onlinestatus/")
	document.getElementById("loader").remove()
	friends = friends.count
	followers = followers.count
	following = following.count
	icon = icon.data[0].imageUrl
	avatar = avatar.data[0].imageUrl
	friendsList = friendsList.data
	groups = groups.data
	let profile = document.createElement('div')
	profile.setAttribute('class', 'profile-container ng-scope')
	profile.setAttribute('style', 'max-width: 970px; margin: 0 auto;')
	profile.innerHTML = `
    <div ng-controller="profileBaseController" class="ng-scope">
<div class="section profile-header">
    <div class="section-content profile-header-content ng-scope" ng-controller="profileHeaderController"><input
            type="hidden" data-userstatus-disabled="True" id="user-stat" autocomplete="off">
        <div class="profile-header-top" style="
display: flex;
">
            <div class="avatar avatar-headshot-lg card-plain profile-avatar-image" style="
position: relative;
margin-right: 12px;
width: 128px;
height: 128px;
"><span class="avatar-card-link avatar-image-link">
                    <thumbnail-2d ng-if="profileHeaderLayout.profileUserId"
                        class="avatar-card-image profile-avatar-thumb ng-scope ng-isolate-scope"
                        thumbnail-target-id="profileHeaderLayout.profileUserId"
                        thumbnail-type="thumbnailTypes.avatarHeadshot"><span ng-class="$ctrl.getCssClasses()"
                            class="thumbnail-2d-container" thumbnail-type="AvatarHeadshot"
                            thumbnail-target-id="50654562">
                            <img
                                ng-if="$ctrl.thumbnailUrl &amp;&amp; !$ctrl.isLazyLoadingEnabled()"
                                ng-src="${icon}"
                                thumbnail-error="$ctrl.setThumbnailLoadFailed"
                                ng-class="{'loading': $ctrl.thumbnailUrl &amp;&amp; !isLoaded }" image-load=""
                                alt="" title="" class="ng-scope ng-isolate-scope"
                                style="width: 130px;"
                                src="${icon || imgNone}">
                        </span> </thumbnail-2d>
                </span>
            </div>
            <div class="header-caption" style="
width: 82%;
width: calc(100% - 128px - 24px);
position: relative;
float: left;
display: flex;
justify-content: space-between;
flex-direction: column;
">
                <div class="header-names">
                    <div class="header-title" style="
display: flex;
align-items: center;
"><span class="icon-premium-medium" style="margin: 0 12px 0 0;float: left; 

                        background-image: url('https://images.rbxcdn.com/a057a8bc94e7ab78517765ddb4e77384-generic_dark_11062018.svg');
                        background-position: 0px -1623px;
                        " title="Banned"></span> <span class="icon-premium-small" style="display: none;"></span>
                        <h2 ng-non-bindable="" class="profile-name text-overflow">${stripTags(userInfo.displayName)}</h2>
                        <h3 ng-non-bindable="" class="profile-name text-overflow" style="
display: none;
">${stripTags(userInfo.displayName)}</h3>
                    </div>
                    <div class="profile-display-name font-caption-body text text-overflow" ng-non-bindable="" style="
">@${stripTags(userInfo.name)}</div>
                </div>
                <div class="header-details" style="
position: relative;
float: left;
display: flex;
align-items: center;
justify-content: space-between;
min-height: 35px;
">
                    <ul class="details-info" style="
display: flex;
">
                        <li style="
float: left;
display: flex;
align-items: center;
flex-direction: row-reverse;
padding-right: 15px;
">
                            <div class="text-label font-caption-header ng-binding"
                                ng-bind="'Label.Friends' | translate">Friends</div><a class="text-name"
                                > <span
                                    class="font-header-2 ng-binding" title="${friends}"
                                    ng-bind="profileHeaderLayout.friendsCount | abbreviate" style="padding-right: 5px;">${addCommas(friends)}</span> </a>
                        </li>
                        <li style="
float: left;
display: flex;
align-items: center;
flex-direction: row-reverse;
padding-right: 15px;
">
                            <div class="text-label font-caption-header ng-binding"
                                ng-bind="'Label.Followers' | translate">Followers</div><a class="text-name"
                                > <span
                                    class="font-header-2 ng-binding" title="${followers}"
                                    ng-bind="getAbbreviatedStringFromCountValue(profileHeaderLayout.followersCount)" style="padding-right: 5px;">${addCommas(followers)}</span>
                            </a>
                        </li>
                        <li style="
float: left;
display: flex;
align-items: center;
flex-direction: row-reverse;
padding-right: 15px;
">
                            <div class="text-label font-caption-header ng-binding"
                                ng-bind="'Label.Following' | translate">Following</div><a class="text-name"
                                > <span
                                    class="font-header-2 ng-binding" title="${following}"
                                    ng-bind="getAbbreviatedStringFromCountValue(profileHeaderLayout.followingsCount)" style="padding-right: 5px;">${addCommas(following)}</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <p ng-show="profileHeaderLayout.hasError" class="text-error header-details-error ng-binding ng-hide"
            ng-bind="profileHeaderLayout.errorMsg"></p>

    </div>
</div>
</div>
<div class="rbx-tabs-horizontal">
<ul id="horizontal-tabs" class="nav nav-tabs" role="tablist" profile-tab-click="">
    <li class="rbx-tab active" style="width: 50%;"><a class="rbx-tab-heading" href="#about" id="tab-about"> <span
                class="text-lead">About</span> <span class="rbx-tab-subtitle"></span> </a></li>
    <li class="rbx-tab" style="width: 50%;"><a class="rbx-tab-heading" href="#creations" id="tab-creations"> <span
                class="text-lead">Creations</span> <span class="rbx-tab-subtitle"></span> </a></li>
</ul>
<div class="tab-content rbx-tab-content">
    <div class="tab-pane active" id="about">
        <div class="section profile-about ng-scope" ng-controller="profileUtilitiesController">
            <div class="social-links">
                <ul class="profile-social-networks" ng-non-bindable="">
                    <li><a href="https://twitter.com/AlexOp_" target="_blank" title="Twitter"> <span
                                class="profile-social Twitter"></span> </a></li>
                    <li><a href="https://youtube.com/c/AlexOp" target="_blank" title="YouTube"> <span
                                class="profile-social YouTube"></span> </a></li>
                </ul>
            </div>
            <profile-description class="ng-isolate-scope">
                <div class="section profile-about">
                    <system-feedback class="ng-isolate-scope">
                        <div class="sg-system-feedback">
                            <div class="alert-system-feedback">
                                <div class="alert " ng-class="{ on: $ctrl.params.showBanner }">
                                </div>
                            </div>
                        </div>
                    </system-feedback>
                    <div class="container-header">
                        <h3 ng-bind="'Heading.AboutTab' | translate" class="ng-binding">About</h3>
                    </div>
                    <div class="section-content remove-panel ng-scope"
                        ng-if="$ctrl.data.description &amp;&amp; !$ctrl.layout.showEditBox">
                        <profile-description-view description="$ctrl.data.description" class="ng-isolate-scope">
                            <div class="profile-about-content toggle-target">
                                <pre id="profile-about-text"
                                    class="text profile-about-text"
                                    style="position: relative;">        
                                    <span class="profile-about-content-text ng-binding linkify" ng-class="{'linkify': !$ctrl.inApp}" ng-bind-html="$ctrl.description | linkify">${userInfo.description}</span></pre> 
                            </div>
                        </profile-description-view>
                    </div><!-- end ngIf: $ctrl.data.description && !$ctrl.layout.showEditBox -->
                </div>
            </profile-description>
            <div class="section-content remove-panel">
                <div id="aliases-container">
                    <div class="border-top ng-hide" ng-hide="isAliasesLoaded"><span
                            class="spinner spinner-default"></span></div>
                    <div aliases-container="">
                        <div class="border-top ng-scope ng-hide" ng-controller="aliasesContainerController"
                            ng-show="layout.isAliasesShown">
                            <div class="user-tag-header"> <span class="font-header-2 ng-binding"> Alias </span>
                                <span class="cursor-pointer icon-edit user-tag-controller"
                                    ng-click="changeAlias()"></span> </div>
                            <div class="font-header-2 text-subheader user-tag ng-binding"
                                ng-bind="library.currentUserTag"></div>
                        </div>
                    </div>
                </div>
                <div class="border-top profile-about-footer"></div>
            </div>
        </div>
        <div class="section profile-avatar">
            <div id="use-dynamic-thumbnail-lighting" class="hidden" data-use-dynamic-thumbnail-lighting="False">
            </div>
            <div class="container-header">
                <h3 ng-bind="'Heading.CurrentlyWearing' | translate" class="ng-binding">Currently Wearing</h3>
            </div>
            <div class="col-sm-6 section-content profile-avatar-left" ng-non-bindable="" style="
background-color: #191B1D;
padding: 0 12px;
position: relative;
            ">
                <div id="UserAvatar" class="thumbnail-holder" data-reset-enabled-every-page=""
                    data-3d-thumbs-enabled=""
                    data-url="/thumbnail/user-avatar?userId=50654562&amp;thumbnailFormatId=124&amp;width=300&amp;height=300"
                    style="width:300px;height:300px;margin: 0 auto;"><span class="thumbnail-span" style="
display: inline-block;
width: 300px;
height: 300px;
                    "><img 
                            src="${avatar || imgNone}" style="
width: 100%;
height: 100%;
max-height: 300px;
max-width: 300px;
                    "></span>
                    <span class="thumbnail-span-original hidden"
                        data-3d-url="/avatar-thumbnail-3d/json?userId=50654562"
                        data-orig-retry-url="/avatar-thumbnail/json?userId=50654562&amp;width=352&amp;height=352&amp;format=Png"><img
                            
                            src="${avatar}"></span>
                    <!--<span class="enable-three-dee btn-control btn-control-lg" style="visibility: visible;">3D</span>-->
                </div>
            </div>
        </div>
        <div id="people-list-container" class="section no-self-bootstrap">
            <div ng-controller="peopleListContainerController" people-list-container="">
                <div class="col-xs-12 people-list-container"
                    ng-show="layout.isAllFriendsDataLoaded &amp;&amp; library.numOfFriends > 0 || layout.friendsError">
                    <div class="section home-friends">
                        <div class="container-header people-list-header">
                            <h3 class="ng-binding"> Friends<span ng-show="library.numOfFriends !== null"
                                    class="friends-count ng-binding">(${friendsList.length})</span> </h3> <span
                                ng-show="layout.invalidPresenceData" class="presence-error ng-hide"> <span
                                    class="icon-warning"></span> <span class="text-error ng-binding"
                                    ng-bind="'Label.PresenceError' | translate">User status may not be up to
                                    date</span> </span>
                        </div>
                        <div class="section-content remove-panel people-list">
                            <p ng-show="layout.friendsError" class="section-content-off ng-binding ng-hide"
                                ng-bind="'Label.FriendsError' | translate">Unable to load friends</p>
                            <ul class="hlist" ng-controller="friendsListController" people-list=""
                                ng-class="{'invisible': !layout.isAllFriendsDataLoaded}" id="friend-holder">
                            </ul> <span class="spinner spinner-default ng-hide"
                                ng-show="!layout.isAllFriendsDataLoaded"></span>
                        </div>
                    </div>
                </div>
                <div class="col-xs-12 people-list-container ng-hide" ng-hide="layout.isAllFriendsDataLoaded">
                    <div class="section home-friends">
                        <div class="container-header people-list-header">
                            <h3 class="ng-binding">Friends</h3>
                        </div>
                        <div class="section-content remove-panel people-list"> <span
                                class="spinner spinner-default"></span> </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="section layer profile-collections ng-scope" ng-controller="profileCollectionsController">
            <div class="container-header">
                <h3 ng-bind="'Heading.Collections' | translate" class="ng-binding">Collections</h3>
            </div><!-- ngInclude: 'profile-collections-section' -->
            <div class="section-content remove-panel ng-scope" ng-include="'profile-collections-section'">
                <ul class="hlist collections-list item-list ng-scope" ng-init="getCollectionsData()">
                    <!-- ngRepeat: item in collections -->
                </ul>
            </div>
        </div>
        <div groups-showcase="" display-user-id="50654562" class="ng-isolate-scope">
            <!-- ngIf: !metadata.areProfileGroupsHidden -->
            <div ng-if="!metadata.areProfileGroupsHidden"
                ng-class="{'section': !layout.isGridOn, 'container-list': layout.isGridOn}"
                ng-show="groups.length > 0" class="ng-scope section">
                <div class="container-header">
                    <h3 ng-bind="'Heading.Groups' | translate" class="ng-binding">Groups</h3>
                    <div class="container-buttons"> <button
                            class="profile-view-selector btn-secondary-xs btn-generic-slideshow-xs"
                            title="Slideshow View" type="button" ng-click="updateDisplay(false)" id="slideshow-group"
                            ng-class="{'btn-secondary-xs btn-generic-slideshow-xs': !layout.isGridOn, 'btn-control-xs btn-generic-slideshow-xs': layout.isGridOn}">
                            <span class="icon-slideshow selected" ng-class="{'selected': !layout.isGridOn}"></span>
                        </button> <button class="profile-view-selector btn-control-xs btn-generic-grid-xs"
                            title="Grid View" type="button" ng-click="updateDisplay(true)" id="grid-group"
                            ng-class="{'btn-secondary-xs btn-generic-grid-xs': layout.isGridOn, 'btn-control-xs btn-generic-grid-xs': !layout.isGridOn}">
                            <span class="icon-grid" ng-class="{'selected': layout.isGridOn}"></span> </button>
                    </div>
                </div>
                <div class="profile-slide-container section-content remove-panel">
                    <groups-showcase-grid groups-cache="groups" ng-show="layout.isGridOn"
                        class="ng-isolate-scope ng-hide">
                        <ul class="hlist game-cards group-list" horizontal-scroll-bar="$ctrl.loadMoreGroups()">
                            <!-- ngRepeat: group in $ctrl.groups -->
                        </ul> 
                    </groups-showcase-grid>
                    <div id="groups-switcher" class="switcher slide-switcher groups ng-isolate-scope"
                        groups-showcase-switcher="" groups="groups" ng-hide="layout.isGridOn">
                        <ul class="slide-items-container switcher-items hlist">
                        </ul><a class="carousel-control left ng-scope"
                            ng-if="multipleItems()" ng-click="slidePrev()"> <span class="icon-carousel-left" id="group-prev"></span>
                        </a>
                       <a class="carousel-control right ng-scope" id="group-next"
                            ng-if="multipleItems()" ng-click="slideNext()"> <span
                                class="icon-carousel-right"></span> </a>
                    </div>
                </div>
            </div><!-- end ngIf: !metadata.areProfileGroupsHidden -->
        </div>
        <div class="container-list favorite-games-container">
            <div class="container-header">
                <h3 ng-bind="'Heading.FavoriteGames' | translate" class="ng-binding">Favorites</h3>
            </div>
            <ul class="hlist game-cards" id="favorite-list"></ul>
        </div>
        <div class="section" id="roblox-badges-container">
            <div class="container-header">
                <h3>Roblox Badges</h3>
            </div>
            <div class="section-content remove-panel">
                <ul class="hlist badge-list" id="rbx-badges"></ul>
            </div>
        </div>
        <div class="section" id="player-badges-container">
            <div class="container-header">
                <h3>Badges</h3>
            </div>
            <div class="section-content remove-panel">
                <ul class="hlist badge-list" id="plr-badges"></ul>
            </div>
        </div>
        <div class="section profile-statistics" id="profile-statistics-container">
            <div class="section profile-statistics">
                <div class="container-header">
                    <h3>Statistics</h3>
                </div>
                <div class="section-content">
                    <ul class="profile-stats-container">
                        <li class="profile-stat" style="width: 33%;">
                            <p class="text-label">Join Date</p>
                            <p class="text-lead" id="join-date">Loading</p>
                        </li>
                        <li class="profile-stat" style="width: 33%;">
                            <p class="text-label">Place Visits</p>
                            <p class="text-lead">Loading</p>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    <div class="tab-pane" id="creations" profile-empty-tab="">
        <div class="profile-game ng-scope section" ng-controller="profileGridController"
            ng-init="init('game-cards','game-container')" ng-class="{'section': !isGridOn,
                'container-list': isGridOn}">
            <div class="container-header">
                <h3 ng-non-bindable="">Experiences</h3>
                <div class="container-buttons"><button
                        class="profile-view-selector btn-secondary-xs btn-generic-slideshow-xs"
                        title="Slideshow View" type="button" ng-click="updateDisplay(false)"
                        ng-class="{'btn-secondary-xs btn-generic-slideshow-xs': !isGridOn, 'btn-control-xs btn-generic-slideshow-xs': isGridOn}">
                        <span class="icon-slideshow selected" ng-class="{'selected': !isGridOn}"></span> </button>
                    <button class="profile-view-selector btn-control-xs btn-generic-grid-xs" title="Grid View"
                        type="button" ng-click="updateDisplay(true)"
                        ng-class="{'btn-secondary-xs btn-generic-grid-xs': isGridOn, 'btn-control-xs btn-generic-grid-xs': !isGridOn}">
                        <span class="icon-grid" ng-class="{'selected': isGridOn}"></span> </button></div>
            </div>
            <div ng-show="isGridOn" class="game-grid ng-hide">
                <ul class="hlist game-cards" style="max-height: -8px" horizontal-scroll-bar="loadMore()"></ul><a
                    ng-click="loadMore()" class="btn btn-control-xs load-more-button ng-hide"
                    ng-show="4 > 6 * NumberOfVisibleRows">Load More</a>
            </div>
            <div id="games-switcher" class="switcher slide-switcher games ng-isolate-scope" ng-hide="isGridOn"
                switcher="" itemscount="switcher.games.itemsCount" currpage="switcher.games.currPage">
                <ul class="slide-items-container switcher-items hlist"></ul><a class="carousel-control left"
                    data-switch="prev"><span class="icon-carousel-left"></span></a> <a
                    class="carousel-control right" data-switch="next"><span class="icon-carousel-right"></span></a>
            </div>
        </div>
    </div>
</div>
</div>
    `
	mainContent.appendChild(profile)
	function getImages(images = "") {
		return new Promise((resolve, reject) => {
			get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${images}&size=150x150&format=Png&isCircular=false`).then(got => {
				resolve(got.data)
			}).catch(reject)
		})
	}
	let images = await getImages(friendsList.map(e => e.id).splice(0, 9).join(','))
	if (friendsList.length == 0) {
		document.getElementById('people-list-container').display = 'none'
	}
	let i = 0
	for (const friend of friendsList) {
		if (i < 9) {
			let thumbnail = images.find(value => value.targetId == friend.id)
			let friendInstance = document.createElement('li')
			friendInstance.setAttribute('id', 'people-' + friend.id)
			friendInstance.setAttribute('class', 'list-item friend ng-scope')
			friendInstance.innerHTML = `
                            <div ng-controller="peopleController" people="" class="ng-scope">
                <div class="avatar-container"> <a href="/users/${friend.id}/profile" class="text-link friend-link ng-isolate-scope"
                        ng-click="clickAvatar(friend, $index)" popover-trigger=" 'none' "
                        popover-class="people-info-card-container card-with-game people-info-${friend.id}" popover-placement="bottom"
                        popover-append-to-body="true" popover-is-open="hoverPopoverParams.isOpen"
                        hover-popover-params="hoverPopoverParams" hover-popover="" uib-popover-template="'people-info-card'">
                        <div class="avatar avatar-card-fullbody"> <span
                                class="avatar-card-link friend-avatar icon-placeholder-avatar-headshot"
                                ng-class="{'icon-placeholder-avatar-headshot': !friend.avatar.imageUrl}">
                                <thumbnail-2d class="avatar-card-image ng-isolate-scope"
                                    thumbnail-type="layout.thumbnailTypes.avatarHeadshot" thumbnail-target-id="friend.id"><span
                                        ng-class="$ctrl.getCssClasses()" class="thumbnail-2d-container"
                                        thumbnail-type="AvatarHeadshot" thumbnail-target-id="${friend.id}">
                                        <!-- ngIf: $ctrl.thumbnailUrl && !$ctrl.isLazyLoadingEnabled() --><img
                                            ng-if="$ctrl.thumbnailUrl &amp;&amp; !$ctrl.isLazyLoadingEnabled()"
                                            thumbnail-error="$ctrl.setThumbnailLoadFailed"
                                            ng-class="{'loading': $ctrl.thumbnailUrl &amp;&amp; !isLoaded }" image-load="" alt=""
                                            title="" class="ng-scope ng-isolate-scope"
                                            src="${thumbnail.imageUrl || imgNone}">
                                        <!-- end ngIf: $ctrl.thumbnailUrl && !$ctrl.isLazyLoadingEnabled() -->
                                        <!-- ngIf: $ctrl.thumbnailUrl && $ctrl.isLazyLoadingEnabled() -->
                                    </span> </thumbnail-2d>
                            </span> </div> <span class="text-overflow friend-name font-caption-header ng-binding"
                            ng-bind="friend.nameToDisplay" title="${stripTags(friend.name)}">${stripTags(friend.displayName)}</span> <!-- ngIf: friend.presence.placeUrl -->
                        <div class="text-overflow xsmall text-label place-name ng-binding ng-scope" ng-if="friend.presence.placeUrl"
                            ng-bind="library.placesDict[friend.presence.rootPlaceId].name">${friend.isOnline && "Online" || ""}</div>
                        <!-- end ngIf: friend.presence.placeUrl -->
                    </a> <span class="avatar-status friend-status icon-online" title="Online" id="status-${friend.id}"></span>
                </div>
            </div>
            `
			document.getElementById('friend-holder').appendChild(friendInstance)
			if (!friend.isOnline) {
				document.getElementById("status-" + friend.id).remove()
			}
            if (friend.isBanned) {
                friendInstance.getElementsByClassName('friend-link')[0].href = "/banned-users/" + friend.id
            }
			i++
		} else {
			break
		}
	}
	let collections = await get(`https://www.roblox.com/users/profile/robloxcollections-json?userId=${userInfo.id}`)
	if (collections.length == 0) {
		document.getElementsByClassName('profile-collections')[0].style.display = 'none'
	}
	let p = 0
	for (const item of collections.CollectionsItems) {
		if (p > 5) {
			break
		}
		p++
		let instance = document.createElement('li')
		instance.setAttribute('class', 'list-item asset-item collections-item ng-scope')
		instance.setAttribute('style', `padding: 5px 0;
        text-align: center;
        width: 16.66667%;`)
		instance.innerHTML = `
        <a ng-href="${item.AssetSeoUrl}" class="collections-link"
            title="${stripTags(item.Name)}" href="${item.AssetSeoUrl}">
            <div class="img-container" style="position:relative;"><img class="asset-thumb-container ng-isolate-scope"
                    lazy-img="${item.Thumbnail.Url}" thumbnail="item.Thumbnail"
                    reset-src="true" image-retry=""
                    src="${item.Thumbnail.Url}" style="width: 140px;
                    height: 140px;">
                <div class="asset-restriction-icon"><span
                        ng-show="item.AssetRestrictionIcon&amp;&amp;item.AssetRestrictionIcon.CssTag"
                        class="icon-label icon-limited-label"
                        ng-class="'icon-'+item.AssetRestrictionIcon.CssTag+'-label'" style="position: absolute;
                        text-align: left;
                        left: 8px;
                        bottom: 0;
                        line-height: 1em;"></span></div>
            </div><span class="font-header-2 text-overflow item-name" style="
display: block;
width: 140px;
text-align: left;
margin: auto;
line-height: 22px;
overflow-x: hidden;
white-space: nowrap;
            ">
                <span ng-bind="item.Name" class="ng-binding">${stripTags(item.Name)}</span>
            </span>
        </a>
        `
        if (item.AssetRestrictionIcon){
            if (item.AssetRestrictionIcon.CssTag == "limited-unique") {
                instance.getElementsByClassName('icon-label icon-limited-label')[0].className = "icon-label icon-limited-unique-label"
            } else if (item.AssetRestrictionIcon.CssTag == null) {
                instance.getElementsByClassName('asset-restriction-icon')[0].remove()
            }
        } else {
            instance.getElementsByClassName('asset-restriction-icon')[0].remove()
        }
		document.getElementsByClassName('hlist collections-list item-list ng-scope')[0].appendChild(instance)
	}
	const groupRequest = []
	for (const group of groups) {
		groupRequest.push({
			format: null,
			requestId: `${group.group.id}:undefined:GroupIcon:150x150:null:regular`,
			size: "150x150",
			targetId: group.group.id,
			type: "GroupIcon"
		})
	}
	const groupImages = await postRepeat('https://thumbnails.roblox.com/v1/batch', {
		headers: { "Content-Type": "application/json", "X-CSRF-Token": "" },
		data: JSON.stringify(groupRequest)
	})
	const list = document.getElementById('groups-switcher').getElementsByClassName('slide-items-container')[0]
	const grid = document.getElementById('groups-switcher').parentNode.getElementsByTagName('groups-showcase-grid')[0].getElementsByClassName('group-list')[0]
	if (groups.length == 0) {
		document.getElementById('groups-switcher').parentNode.parentNode.style.display = 'none'
	}
	const pager = new Pager({ useBTR: false })
	const [collectPages] = pager.constructPages(groups, 12)
	pager.setMax()
	let loading = false
	pager.onset = (newPage) => {
		if (loading) return;
		loading = true
        grid.clearChildren()
		const page = collectPages[newPage - 1]
        if (!page) return;
		for (const info of page) {
			const gridItem = document.createElement('li')
			gridItem.setAttribute('class', `list-item group-container`)
			gridItem.setAttribute('style', 'display: inline-block;width: 16.66667%;min-width: 102px;float: left;margin-bottom: 6px;padding-bottom: 6px;text-align: center;')
			gridItem.innerHTML = `
			<groups-showcase-card group="group" class="ng-isolate-scope">
				<div class="game-card"> <a ng-href="https://www.roblox.com/groups/${info.group.id}"
						class="card-item game-card-container" href="https://www.roblox.com/groups/${info.group.id}">
						<div class="game-card-thumb-container">
							<thumbnail-2d class="slide-item-image ng-isolate-scope" thumbnail-type="$ctrl.thumbnailTypes.groupIcon"
								thumbnail-target-id="$ctrl.group.id" thumbnail-options="$ctrl.thumbnailOptions"><span
									ng-class="$ctrl.getCssClasses()" class="thumbnail-2d-container" thumbnail-type="GroupIcon"
									thumbnail-target-id="11479637"><img
										ng-if="$ctrl.thumbnailUrl &amp;&amp; $ctrl.isLazyLoadingEnabled()"
										lazy-img="https://t7.rbxcdn.com/8ff47c7bd4a2ce094909dcc5fd41d711"
										style="width: 150px;"
										src="https://t7.rbxcdn.com/8ff47c7bd4a2ce094909dcc5fd41d711" id="${info.group.id}-img2">
								</span> </thumbnail-2d>
						</div>
						<div class="text-overflow game-card-name ng-binding" title="${stripTags(info.group.name)}" ng-bind="$ctrl.group.name">${stripTags(info.group.name)}</div>
						<div ng-bind="'Label.MembersCount' | translate:{ memberCount: $ctrl.group.members }"
							class="text-overflow game-card-name-secondary ng-binding">${addCommas(info.group.memberCount)} Members</div>
						<div class="text-overflow game-card-name-secondary ng-binding" ng-bind="$ctrl.group.role.name">${stripTags(info.role.name)}</div>
					</a> </div>
			</groups-showcase-card>
			`
			grid.appendChild(gridItem)
			for (const image of groupImages.data) {
				if (image.targetId == info.group.id) {
					document.getElementById(`${info.group.id}-img2`).setAttribute('src', image.imageUrl || imgNone)
					break
				}
			}
		}
        loading = false
	}
	pager.onset(1)
	grid.parentElement.appendChild(pager.pager)
	// pager.pager.style.display = "flow-root"
	let gi = 0
	for (const group of groups) {
		gi++
		const listItem = document.createElement('li')
		listItem.setAttribute('class', `switcher-item slide-item-container${gi == 1 && " active" || ""}`)
		listItem.setAttribute('data-index', gi - 1)
		listItem.innerHTML = `
        <div class="col-sm-6 slide-item-container-left">
            <div class="slide-item-emblem-container"> <a
                    href="https://www.roblox.com/groups/${group.group.id}">
                    <thumbnail-2d class="slide-item-image ng-isolate-scope" thumbnail-type="thumbnailTypes.groupIcon"
                        thumbnail-target-id="group.id" thumbnail-options="thumbnailOptions"><span
                            class="thumbnail-2d-container" thumbnail-type="GroupIcon"
                            thumbnail-target-id="11479637" style="width: 100%;height: 100%;">
                                <img
                                lazy-img=""
                                thumbnail-error="$ctrl.setThumbnailLoadFailed"
                                src="" id="${group.group.id}-img">
                        </span> </thumbnail-2d>
                </a> </div>
        </div>
        <div class="col-sm-6 text-overflow slide-item-container-right groups">
            <div class="slide-item-info"> <a ng-href="https://www.roblox.com/groups/${group.group.id}"
                    href="https://www.roblox.com/groups/${group.group.id}">
                    <h2 class="slide-item-name text-overflow groups">${stripTags(group.group.name)}</h2>
                </a>
                <p class="text-description slide-item-description groups">${stripTags(group.group.description)}</p>
            </div>
            <div class="slide-item-stats">
                <ul class="hlist">
                    <li class="list-item">
                        <div class="text-label slide-item-stat-title">Members
                        </div>
                        <div class="text-lead group-members-count">${addCommas(group.group.memberCount)}</div>
                    </li>
                    <li class="list-item">
                        <div class="text-label slide-item-stat-title">Rank</div>
                        <div class="text-lead text-overflow group-rank groups">${stripTags(group.role.name)}
                        </div>
                    </li>
                </ul>
            </div>
        </div>
        `
		list.appendChild(listItem)
		for (const image of groupImages.data) {
			if (image.targetId == group.group.id) {
				document.getElementById(`${group.group.id}-img`).setAttribute('src', image.imageUrl || imgNone)
				break
			}
		}
	}
	let selectedC = 0
	document.getElementById('group-prev').addEventListener('click', () => {
		list.querySelectorAll(`[data-index="${selectedC}"]`)[0].className = "switcher-item slide-item-container"
		if (selectedC > 0) {
			selectedC--
		} else {
			selectedC = groupImages.data.length - 1
		}
		list.querySelectorAll(`[data-index="${selectedC}"]`)[0].className = "switcher-item slide-item-container active"
	})
	document.getElementById('group-next').addEventListener('click', () => {
		list.querySelectorAll(`[data-index="${selectedC}"]`)[0].className = "switcher-item slide-item-container"
		if (selectedC < groupImages.data.length - 1) {
			selectedC++
		} else {
			selectedC = 0
		}
		list.querySelectorAll(`[data-index="${selectedC}"]`)[0].className = "switcher-item slide-item-container active"
	})
	document.getElementById('slideshow-group').addEventListener('click', () => {
		document.getElementById('groups-switcher').className = 'switcher slide-switcher groups ng-isolate-scope'
		grid.parentNode.className = 'ng-isolate-scope ng-hide'
	})
	document.getElementById('grid-group').addEventListener('click', () => {
		document.getElementById('groups-switcher').className = 'switcher slide-switcher groups ng-hide'
		grid.parentNode.className = 'ng-isolate-scope'
	})
	let ids = ""
	for (const favorite of favorites.Data.Items) {
		ids += favorite.Item.UniverseId + ","
	}
	const favoritesVotes = await get(`https://games.roblox.com/v1/games/votes?universeIds=` + ids)
	const gameInfo = await get("https://games.roblox.com/v1/games?universeIds=" + ids)
	if (favorites.Data.Items.length == 0) {
		document.getElementsByClassName('favorite-games-container')[0].style.display = 'none'
	}
	let favNum = 0
	for (const favorite of favorites.Data.Items) {
		favNum++
		if (favNum == 7) break;
		const element = document.createElement('li')
		element.setAttribute('class', 'list-item game-card game-tile')
		element.innerHTML = `
        <li class="list-item game-card game-tile">
            <div class="game-card-container"><a
                    href="${favorite.Item.AbsoluteUrl}"
                    class="game-card-link">
                    <div class="game-card-thumb-container"><img class="game-card-thumb ng-isolate-scope"
                            src="${favorite.Thumbnail.Url}" alt="${stripTags(favorite.Item.Name)}"
                            thumbnail="${favorite.Thumbnail.Url}"
                            image-retry=""></div>
                    <div class="game-card-name game-name-title" title="${stripTags(favorite.Item.Name)}" ng-non-bindable="">${stripTags(favorite.Item.Name)}
                    </div>
                    <div class="game-card-info"><span class="info-label icon-votes-gray"></span> <span
                            class="info-label vote-percentage-label" id="${favorite.Item.Name}-rating">93%</span> <span class="info-label no-vote hidden"></span>
                        <span class="info-label icon-playing-counts-gray"></span> <span class="info-label playing-counts-label"
                            title="137" id="${favorite.Item.Name}-playing">137</span></div>
                </a></div>
        </li>
        `
		document.getElementById('favorite-list').appendChild(element)
        try {
            for (const vote of favoritesVotes.data) {
                if (vote.id == favorite.Item.UniverseId) {
                    let rating = (vote.upVotes / (vote.upVotes + vote.downVotes)) * 100
                    document.getElementById(`${favorite.Item.Name}-rating`).innerText = (isNaN(rating) ? 100 : rating.toFixed(0)) + "%"
                    break
                }
            }
            for (const game of gameInfo.data) {
                if (game.id == favorite.Item.UniverseId) {
                    document.getElementById(`${favorite.Item.Name}-playing`).innerText = NumberFormatting.abbreviatedFormat(game.playing)
                    document.getElementById(`${favorite.Item.Name}-playing`).setAttribute('title', addCommas(game.playing))
                }
            }
        } catch (e) {console.warn(e)}
	}
	let badgeCount = 0
	for (const badge of rBadges) {
		badgeCount++
		if (badgeCount == 7) break;
		const element = document.createElement('li')
		element.setAttribute('class', 'list-item asset-item')
		element.innerHTML = `
        <a class="" href="https://www.roblox.com/info/roblox-badges#Badge${badge.id}"
        title="${badge.description}">
        <span class="border asset-thumb-container icon-badge-${badge.name.toLowerCase().split(" ").join("-")}" title="${badge.name}"
        style="
        background-image: url(https://images.rbxcdn.com/8ec75d42f482e0b1d04c324e8038bbc5-badges.svg);
        background-repeat: no-repeat;
        background-size: 280px auto;
        width: 140px;
        height: 140px;
        display: inline-block;
        vertical-align: middle;
        "
        ></span><span
            class="font-header-2 text-overflow item-name">${badge.name}</span></a>
        `
		document.getElementById('rbx-badges').appendChild(element)
	}
	const badgeRequest = []
	for (const badge of badges.data) {
		badgeRequest.push({
			format: "png",
			requestId: `${badge.id}::BadgeIcon:150x150:png:regular`,
			size: "150x150",
			targetId: badge.id,
			token: "",
			type: "BadgeIcon"
		})
	}
	const badgeImages = await postRepeat('https://thumbnails.roblox.com/v1/batch', {
		headers: { "Content-Type": "application/json", "X-CSRF-Token": "" },
		data: JSON.stringify(badgeRequest)
	})
	if (badges.data.length == 0) {
		document.getElementById('player-badges-container').style.display = 'none'
	}
	badgeCount = 0
	for (const badge of badges.data) {
		badgeCount++
		if (badgeCount == 7) break;
		const element = document.createElement('li')
		element.setAttribute('class', 'list-item asset-item')
		element.innerHTML = `
        <a class="" href="https://www.roblox.com/badges/${badge.id}" 
        title="${badge.name}"><span class="thumbnail-2d-container"><img class="asset-thumb-container" 
        src="" alt="${stripTags(badge.name)}" id="${badge.id}-img"
        title="${stripTags(badge.name)}" style="width: 140px;height: 140px;">
        </span><span class="font-header-2 text-overflow item-name">${stripTags(badge.name)}</span></a>
        `
		document.getElementById('plr-badges').appendChild(element)
		for (const image of badgeImages.data) {
			if (image.targetId == badge.id) {
				document.getElementById(badge.id + '-img').setAttribute('src', image.imageUrl)
				break
			}
		}
	}
	//document.getElementById('last-online').innerText = dateSince(new Date(userStatus.LastOnline))
	document.getElementById('join-date').innerText = dateFormat(userInfo.created, "M/D/YYYY")

	const playerGames = await get("https://games.roblox.com/v2/users/" + userId + "/games?accessFilter=Public&cursor=&limit=50&sortOrder=Desc")
	let playerGameIds = ""
	for (const playerGame of playerGames.data) {
		playerGameIds += playerGame.id + ","
	}
	let gameDatas = await get("https://games.roblox.com/v1/games?universeIds=" + playerGameIds)
	const gameVotes = await get(`https://games.roblox.com/v1/games/votes?universeIds=` + playerGameIds)
	if (gameDatas.data) {
        const thumbnails = await splitLimit(playerGameIds.split(","), async (returnIds) => {
            return new Promise(async resolve => {
                const res = await get(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${returnIds}&size=150x150&format=Png&isCircular=false`)
                resolve(res.data)
            })
        }, ",", 100)
		let p = 0
		for (const gameData of gameDatas.data) {
			let thumb
			for (const actual of thumbnails) {
				if (actual.targetId == gameData.id) {
					thumb = actual.imageUrl
					break
				}
			}

			let sample = document.createElement('li')
			sample.setAttribute('class', `switcher-item slide-item-container${p == 0 && " active" || ""}`)
			sample.setAttribute('data-index', p++)
			sample.innerHTML = `
				<div class="col-sm-6 slide-item-container-left">
					<div class="slide-item-emblem-container">
						<a href="https://www.roblox.com/games/${gameData.rootPlaceId}"> <img
								class="slide-item-image ng-isolate-scope" src="${thumb || imgNone}"
								data-src="${thumb}" data-emblem-id="4631436023"
								image-retry=""> </a>
					</div>
				</div>
				<div class="col-sm-6 slide-item-container-right games">
				<div class="slide-item-info">
					<h2 class="text-overflow slide-item-name games" ng-non-bindable="">${stripTags(gameData.name)}</h2>
					<p class="text-description para-overflow slide-item-description games" ng-non-bindable=""></p>
				</div>
				<div class="slide-item-stats">
					<ul class="hlist">
					<li class="list-item">
						<div class="text-label slide-item-stat-title">Active</div>
						<div class="text-lead slide-item-members-count">${addCommas(gameData.playing)}</div>
					</li>
					<li class="list-item">
						<div class="text-label slide-item-stat-title">Visits</div>
						<div class="text-lead text-overflow slide-item-my-rank games">${addCommas(gameData.visits)}</div>
					</li>
					</ul>
				</div>
				</div>`

			let sample2 = document.createElement('div')
			sample2.setAttribute('class', 'game-container shown')
			sample.setAttribute('data-index', p - 1)
			sample2.setAttribute('style', 'display: inline-block;width: 16.66667%;min-width: 102px;float: left;text-align: center;')
			sample2.innerHTML = `
				<li class="list-item game-card game-tile">
					<div class="game-card-container"><a
						href="https://www.roblox.com/games/${gameData.rootPlaceId}"
						class="game-card-link">
						<div class="game-card-thumb-container"><img class="game-card-thumb ng-isolate-scope" data-=""
							src="${thumb || imgNone}" alt="${stripTags(gameData.name)}"
							image-retry=""></div>
						<div class="game-card-name game-name-title" title="${stripTags(gameData.name)}" ng-non-bindable="">${stripTags(gameData.name)}</div>
						<div class="game-card-info"><span class="info-label icon-votes-gray"></span> <span
							class="info-label vote-percentage-label" title="Ratio" id="${stripTags(gameData.name)}-rating">0%</span> <span class="info-label no-vote hidden"></span> 
                            <span class="info-label icon-playing-counts-gray"></span>
                            <span class="info-label playing-counts-label" title="Playing">${addCommas(gameData.playing)}</span>
							</div>
					</a></div>
				</li>
				`

			document.getElementById('games-switcher').getElementsByClassName("hlist")[0].appendChild(sample)
			document.getElementById('creations').getElementsByClassName('hlist game-cards')[0].appendChild(sample2)
			for (const vote of gameVotes.data) {
				if (vote.id == gameData.id) {
					let rating = (vote.upVotes / (vote.upVotes + vote.downVotes)) * 100
					document.getElementById(`${stripTags(gameData.name)}-rating`).innerText = (isNaN(rating) ? 100 : rating.toFixed(0)) + "%"
					break
				}
			}
		}
	}
	let selectedC2 = 0
	document.getElementById('games-switcher').getElementsByClassName("left")[0].addEventListener('click', () => {
		document.getElementById('games-switcher').getElementsByClassName("hlist")[0].querySelectorAll(`[data-index="${selectedC2}"]`)[0].className = "switcher-item slide-item-container"
		if (selectedC2 > 0) {
			selectedC2--
		} else {
			selectedC2 = gameDatas.data.length - 1
		}
		document.getElementById('games-switcher').getElementsByClassName("hlist")[0].querySelectorAll(`[data-index="${selectedC2}"]`)[0].className = "switcher-item slide-item-container active"
	})
	document.getElementById('games-switcher').getElementsByClassName("right")[0].addEventListener('click', () => {
		document.getElementById('games-switcher').getElementsByClassName("hlist")[0].querySelectorAll(`[data-index="${selectedC2}"]`)[0].className = "switcher-item slide-item-container"
		if (selectedC2 < gameDatas.data.length - 1) {
			selectedC2++
		} else {
			selectedC2 = 0
		}
		document.getElementById('games-switcher').getElementsByClassName("hlist")[0].querySelectorAll(`[data-index="${selectedC2}"]`)[0].className = "switcher-item slide-item-container active"
	})
	document.getElementById('creations').getElementsByClassName("btn-generic-slideshow-xs")[0].addEventListener('click', () => {
		document.getElementById('games-switcher').className = 'switcher slide-switcher games ng-isolate-scope'
		document.getElementById('creations').getElementsByClassName('hlist game-cards')[0].parentNode.className = 'ng-isolate-scope ng-hide'
	})
	document.getElementById('creations').getElementsByClassName("btn-generic-grid-xs")[0].addEventListener('click', () => {
		document.getElementById('games-switcher').className = 'switcher slide-switcher games ng-hide'
		document.getElementById('creations').getElementsByClassName('hlist game-cards')[0].parentNode.className = 'ng-isolate-scope'
	})

	document.getElementById("tab-about").addEventListener('click', () => {
		document.getElementById("about").className = "tab-pane active"
		document.getElementById("tab-about").parentElement.className = "rbx-tab active"

		document.getElementById("creations").className = "tab-pane"
		document.getElementById("tab-creations").parentElement.className = "rbx-tab"
	})

	document.getElementById("tab-creations").addEventListener('click', () => {
		document.getElementById("creations").className = "tab-pane active"
		document.getElementById("tab-creations").parentElement.className = "rbx-tab active"

		document.getElementById("about").className = "tab-pane"
		document.getElementById("tab-about").parentElement.className = "rbx-tab"
	})
})