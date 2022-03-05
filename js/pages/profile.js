/*
    RoGold

    Coding and design by alexop1000 (AlexOp).
    Contact: https://rogold.me/invite

    Copyright (C) alexop1000 
	All rights reserved.
*/

// TODO https://i.imgur.com/Jh8XrwL.png Join Studio button if you have perms to edit the game your friend is editing
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
pages.profile = async () => {
	//sleep(5000)
    await awaitReady()
	const friendId = getId(window.location.href)
	if (!friendId || window.location.href.includes('friends')) {
		return
	}
	const isBanned = window.location.href.includes('banned-users')
	if (isBanned) {
		await sleep(5000)
	}
	let userStatus = await get("https://api.roblox.com/users/" + friendId + "/onlinestatus/")
    let userId = await get(`https://users.roblox.com/v1/users/authenticated`)
	userId = userId.id
	setTimeout(async () => {
		$(document).ready(async () => {
			if ($("button.btn-control-md").first().text() == "Pending") {
				$("button.btn-control-md").first().text("Cancel Request")
				$("button.btn-control-md").first().toggleClass("disabled")
				$("button.btn-control-md").first().click(async () => {
					const response = await postRepeat(`https://friends.roblox.com/v1/users/${friendId}/unfriend`,{
						headers: { "Content-Type": "application/json", "X-CSRF-Token": document.getElementsByName('csrf-token')[0].getAttribute('data-token') }
					})
					if (response) window.location.reload();
				})
			}
		})
		progressRequest(`https://friends.roblox.com/v1/users/${friendId}/followings?sortOrder=Asc&limit=100`, 10, 1, async (followings, page) => {
			for (const following of followings.data) {
				if (following.id == userId) {
					const displayName = document.getElementsByClassName("profile-display-name")[0]
					displayName.parentElement.innerHTML = displayName.parentElement.innerHTML + '<span class="text-secondary" style="font-style: italic;"> Follows you</span>'
				} 
			}
		})
	})
	setTimeout(async () => {
        const doFavorites = await getSetting("Best Friends")
        if (!doFavorites) return;
        const favorites = await pGetStorage('favorites') || []
		const fID = Number(friendId)
        if (favorites && favorites.length > 0) {
			const favorite = favorites.find(f => f == fID)
			if (favorite) {
				const name = await first(".profile-display-name")
				const toParent = name.parentElement.querySelector("div")
				const favoriteButton = document.createElement('div')
				favoriteButton.className = "favorite-button"
				favoriteButton.innerHTML = `
					<div style='
					background-image:url(${document.getElementById('rbx-body').className.includes('light') &&
					"https://images.rbxcdn.com/d96bc8cfcc751bb4d7c1c4fc79fa7ae8-chat_light.svg" ||
					"https://images.rbxcdn.com/0ff32c69af9262d7c9fefe8284d81d88-chat_dark.svg"});
					background-repeat:no-repeat;
					background-size:auto;
					width:28px;
					height:28px;
					display:inline-block;
					vertical-align:middle;
					background-position:-28px -643px;
					margin-right:4px;'></div>
				`
				toParent.insertBefore(favoriteButton, toParent.firstChild)
				const favChild = favoriteButton.querySelector("div")
				let lastClick = Date.now()
				favoriteButton.addEventListener('click', (e) => {
					if (Date.now() - lastClick < 500) return
					lastClick = Date.now()
					if (favorites.includes(fID)) {
						favorites.splice(favorites.indexOf(fID), 1)
						favChild.style.backgroundPosition = "0 -643px"
					} else {
						if (favorites.length == 9) return;
						favorites.push(fID)
						favChild.style.backgroundPosition = "-28px -643px"
					}
					syncSet("favorites", favorites)
				})
				favoriteButton.addEventListener('mouseenter', (e) => {
					favChild.style.backgroundPosition = "-28px -643px"
				})
				favoriteButton.addEventListener('mouseleave', (e) => {
					if (favorites.includes(fID)) {
						favChild.style.backgroundPosition = "-28px -643px"
					} else {
						favChild.style.backgroundPosition = "0 -643px"
					}
				})
			}
		}
	}, 0)
	const isBTR = document.body.getAttribute("data-btr-page") == "profile"
	let date = new Date(userStatus.LastOnline)
	if (!isBTR) {
		let clone = document.createElement('li')
		clone.setAttribute('class', 'profile-stat')
		clone.setAttribute('style', 'width:33%;')
		clone.innerHTML = `
				<p class="text-label">Last Online</p><p class="text-lead">${userStatus.PresenceType === 0 && dateSince(date) || "Now"}</p>
			`
		document.getElementsByClassName('profile-stat')[0].parentNode.appendChild(clone)
	}
	for (const stat of document.getElementsByClassName('profile-stat')) {
		stat.style.width = "33%"
	}
	setTimeout(async () => {
		if (!isBTR && !isBanned) {
			const wearing = await get(`https://avatar.roblox.com/v1/users/${friendId}/currently-wearing`)
			let wearingArray = []
			for (const result of wearing.assetIds) {
				wearingArray.push({
					id: result,
					itemType: "Asset",
				})
			}
			let wearInfo = await postRepeat("https://catalog.roblox.com/v1/catalog/items/details", {
				headers: { "Content-Type": "application/json", "X-CSRF-Token": document.getElementsByName('csrf-token')[0].getAttribute('data-token') },
				data: JSON.stringify({
					"items": wearingArray
				}),
				xsrf: true
			})
			let price = 0
			const simplePriceAdd = (item) => price += item.lowestPrice || item.price || 0;
			const bundles = []
			for (const item of wearInfo.data) {
				if (item.assetType != 12 && item.assetType != 11) {
					const bundle = await get(`https://catalog.roblox.com/v1/assets/${item.id}/bundles?sortOrder=Asc&limit=10`)
					if (bundle.data && bundle.data[0]) {
						if (bundles.includes(bundle.data[0].name)) continue;
						const owned = []
						for (const part of bundle.data[0].items) {
							if (part.owned || part.id == item.id) {
								owned.push(part.id)
							}
						}
						if (owned.length == bundle.data[0].items.length) {
							bundles.push(bundle.data[0].name)
							price += bundle.data[0].product.priceInRobux || 0
						} else simplePriceAdd(item);
					} else simplePriceAdd(item);
				} else simplePriceAdd(item);
			}
			// console.log(wearInfo)
			document.getElementById("profile-current-wearing-avatar").getElementsByTagName("H3")[0].innerHTML = `
				Currently Wearing | Outfit Cost <span class="icon-robux-28x28 roblox-popover-close"></span> ${addCommas(price)}
			`
		}
	}, 0);
	setTimeout(() => {
		if (document.getElementsByClassName("tooltip-pastnames")[0]) {
			const past = document.getElementsByClassName("tooltip-pastnames")[0].getAttribute("data-original-title").split(",").length
			document.getElementsByClassName("text-pastname")[0].textContent += ` (${past})`
		}
	}, 1000);
	setTimeout(async () => {
		observe(document, 'profile-stat', async (added_node) => {
			added_node.style.width = "33%"
			if (added_node.getElementsByClassName('text-label')[0].textContent == "Place Visits") {
				if (!isBTR) {
					sleep(5000)
					document.getElementById('profile-statistics-container').getElementsByClassName('container-header')[0].innerHTML = `<h3>Statistics (Counting...)</h3>`
				}
				const cached = await cacheValue(`${friendId}-visits`, null, 1000 * 60 * 5)
				let totalVisits = cached?.visits ?? (Number(added_node.querySelector(".text-lead").textContent.replace(/(\,?\.?)/g, "")) || 0)
				console.log(totalVisits)
				const visitsLead = added_node.querySelector(".text-lead")
				let favorites = document.createElement('li')
				favorites.setAttribute('class', 'profile-stat')
				favorites.setAttribute('style', 'width:33%;')
				favorites.innerHTML = `
						<p class="text-label">Total Favorites</p><p class="text-lead">0</p>
					`
				added_node.parentNode.appendChild(favorites)
				const favoritesLead = favorites.querySelector(".text-lead")
				let total = document.createElement('li')
				total.setAttribute('class', 'profile-stat')
				total.setAttribute('style', 'width:33%;')
				total.innerHTML = `
						<p class="text-label">Current Active</p><p class="text-lead">0</p>
					`
				added_node.parentNode.appendChild(total)
				const totalLead = total.querySelector(".text-lead")
				let members = document.createElement('li')
				members.setAttribute('class', 'profile-stat')
				members.setAttribute('style', 'width:33%;')
				members.innerHTML = `
						<p class="text-label">Total Group Members</p><p class="text-lead">0</p>
					`
				added_node.parentNode.appendChild(members)
				const membersLead = members.querySelector(".text-lead")
				let totalGroups = 0
				let totalConcurrent = 0
				let totalFavorites = 0
				let totalMembers = 0
				let gamePassPrices = 0
				let estimate = 0
				const setLead = (lead, num) => lead.textContent = addCommas(num)
				async function lookGame(gameData, isProfile) {
					if (!isProfile) {
						setLead(visitsLead, totalVisits + gameData.visits)
						totalVisits += gameData.visits
					}
					setLead(favoritesLead, totalFavorites + gameData.favoritedCount)
					totalFavorites += gameData.favoritedCount
					setLead(totalLead, totalConcurrent + gameData.playing)
					totalConcurrent += gameData.playing
					// TODO? add total likes, dislikes etc
					// let passes = await get("https://www.roblox.com/games/getgamepassesinnerpartial?startIndex=0&maxRows=50&placeId=" + gameData.rootPlaceId + "&_=1625070945265")
					// if (passes) {
					// 	let el = document.createElement('html')
					// 	el.innerHTML = passes
					// 	for (pass of el.getElementsByClassName('text-robux')) {
					// 		gamePassPrices += parseInt(pass.innerText)
					// 		estimate += (gameData.visits * parseInt(pass.innerText)) * 0.00001
					// 	}
					// }
					//let socials = await get(`https://games.roblox.com/v1/games/${gameData.id}/social-links/list`)
				}
				let searchType = "Speed"
				const performSearch = async (games) => {
					let ids = ""
					let perms = []
					for (const game of games.data) {
						if (searchType == "Accuracy") {
							perms.push(game.id)
						}
						ids += game.id + ","
					}
					if (ids == "") return;
					let gameDatas = await get("https://games.roblox.com/v1/games?universeIds=" + ids)
					if (searchType == "Accuracy") {
						var size = 30; var arrayOfArrays = [];
						for (var i = 0; i < perms.length; i += size) {
							arrayOfArrays.push(perms.slice(i, i + size));
						}
						let edits = []
						function getPerms(permsS = "") {
							return new Promise((resolve, reject) => {
								get("https://develop.roblox.com/v1/universes/multiget/permissions?ids=" + permsS).then(got => {
									resolve(got.data)
								}).catch(reject)
							})
						}
						for (const content of arrayOfArrays) {
							let edit = content.map(e => e).join('&ids=')
							for (const got of await getPerms(edit)) {
								edits.push(got)
							}
						}
						for (const contents of edits) {
							if (contents.canManage) {
								if (gameDatas.data) {
									for (const gameData of gameDatas.data) {
										if (gameData.id == contents.universeId) await lookGame(gameData);
									}
								}
							}
						}
					} else {
						if (gameDatas.data) {
							for (const gameData of gameDatas.data) {
								await lookGame(gameData)
							}
						}
					}
				}
				if (!cached) {
					let groups = await get("https://groups.roblox.com/v1/users/" + friendId + "/groups/roles")
					for (const group of groups.data) {
						totalGroups++
						if (group.role.rank >= 253 || (group.group && group.group.owner && group.group.owner.userId == friendId)) {
							if (group.group && group.group.owner && group.group.owner.userId == friendId) {
								//animateResultCount(totalMembers, totalMembers + group.group.memberCount, membersLead, 1000, (num) => {
									membersLead.textContent = addCommas(totalMembers + group.group.memberCount);
								//})
								totalMembers += group.group.memberCount
							}
							let groupGames = await get("https://games.roblox.com/v2/groups/" + group.group.id + "/games?accessFilter=All&cursor=&limit=50&sortOrder=Desc")
							if (!groupGames || !groupGames.data || groupGames.data.length == 0) {
								continue
							}
							await performSearch(groupGames)
						}
					}
					let playerGames = await get("https://games.roblox.com/v2/users/" + friendId + "/games?accessFilter=Public&cursor=&limit=50&sortOrder=Desc")
					let ids = ""
					for (const playerGame of playerGames.data) {
						ids += playerGame.id + ","
					}
					let gameDatas = await get("https://games.roblox.com/v1/games?universeIds=" + ids)
					if (gameDatas.data) {
						for (const gameData of gameDatas.data) {
							await lookGame(gameData, true)
						}
					}
				} else {
					setLead(visitsLead, cached.visits)
					totalVisits = cached.visits
					setLead(favoritesLead, cached.favorites)
					totalFavorites = cached.favorites
					setLead(totalLead, cached.concurrent)
					totalConcurrent = cached.concurrent
					setLead(membersLead, cached.members)
					totalMembers = cached.members
				}
				cacheValue(`${friendId}-visits`, async () => ({
					visits: totalVisits,
					favorites: totalFavorites,
					concurrent: totalConcurrent,
					members: totalMembers
				}), 1000 * 60 * 5)
				document.getElementById('profile-statistics-container').getElementsByClassName('container-header')[0].innerHTML = `<h3>Statistics</h3>`
				for (const header of document.getElementsByClassName('ng-binding')) {
					if (header.textContent == "Groups") {
						header.textContent = 'Groups (' + totalGroups + ')'
					}
				}
			}
		}, false)
	}, 0);
	const doRap = await getSetting('Show RAP')
	if (!doRap || isBanned) {
		return
	}
	function getCollectiblesList(cursor = "") {
		return new Promise((resolve, reject) => {
			get(`https://inventory.roblox.com/v1/users/${friendId}/assets/collectibles?cursor=${cursor}`).then(got => {
				if (got.nextPageCursor) {
					getCollectiblesList(got.nextPageCursor).then(extra => {
						resolve(got.data.concat(extra))
					}).catch(reject)
				} else {
					resolve(got.data)
				}
			})
		})
	}
	function getCollectibles() {
		return new Promise((resolve, reject) => {
			getCollectiblesList().then(data => {
				if (!data || Array.isArray(data) == false || data == []) {
					reject()
				}
				let combined = 0
				let collectibles = []
				data.forEach((asset) => {
					combined += asset.recentAveragePrice || 0
				})
				collectibles = collectibles.concat(data);
				collectibles.sort(function (a, b) {
					if (a.assetId === b.assetId) {
						return a.userAssetId - b.userAssetId;
					}

					return a.assetId - b.assetId;
				});
				resolve({
					combined: combined,
					list: collectibles
				})
			}).catch(reject)
		})
	}
	let RAP = document.createElement('li')
	RAP.setAttribute('style', 'float: left;display: flex;align-items: center;flex-direction: row-reverse;padding-right: 15px;')
	RAP.innerHTML = `
		<div class="text-label font-caption-header">RAP</div>
		<a class="text-name"> <span class="font-header-2" title="Loading">Loading</span></a>
		`
	let rapTab
	if (!isBTR) {
		// console.log("BTRoblox is unsupported for this page!");
		// return
		rapTab = document.createElement('li')
		rapTab.setAttribute('class', 'rbx-tab')
		rapTab.setAttribute('style', "width:33.333%;")
		rapTab.innerHTML = `
			<a class="rbx-tab-heading" href="#collectibles" id="tab-collectibles" style="
			background-image: url(&quot;https://images.rbxcdn.com/fab3a9d08d254fef4aea4408d4db1dfe-loading_dark.gif&quot;);
			background-repeat: no-repeat;
			background-size: 60px;
			background-position: center;"> <span class="text-lead"></span> <span class="rbx-tab-subtitle"></span> </a>
			`
		for (element of document.getElementsByClassName('rbx-tab-heading')) {
			element.parentNode.style.width = "33.333%"
		}
		document.getElementById('horizontal-tabs').appendChild(rapTab)
	}
	document.getElementsByClassName('details-info')[0].appendChild(RAP)
	function failedLoad() {
		if (rapTab) {
			rapTab.innerHTML = ``
			for (element of document.getElementsByClassName('rbx-tab-heading')) {
				element.parentNode.style.width = "50%"
			}
		}
		RAP.innerHTML = `
			<div class="text-label font-caption-header">RAP</div>
			<a class="text-name"> <span class="font-header-2" title="Private Inventory" style="padding-right: 5px;">Unknown</span></a>
			`
	}
	let collectibles = await getCollectibles().catch(() => {
		failedLoad()
	})
	if (!collectibles) {
		failedLoad()
		return
	}
	collectibles.list.sort((a, b) => {
		return b.recentAveragePrice - a.recentAveragePrice;
	})
	if (!isBTR) {
		rapTab.innerHTML = `
			<a class="rbx-tab-heading" href="#collectibles" id="tab-collectibles"> <span class="text-lead">Collectibles</span> <span class="rbx-tab-subtitle"></span> </a>
			`
	}
	RAP.innerHTML = `
		<div class="text-label font-caption-header">RAP</div>
		<a class="text-name" href="#collectibles"> <span class="font-header-2" title="${collectibles.combined}" style="padding-right: 5px;">${addCommas(collectibles.combined)}</span></a>
		`
	let rapPage = document.createElement('div')
	if (!isBTR) {
		rapPage.setAttribute('class', 'tab-pane')
		rapPage.setAttribute('id', 'collectibles')
		rapPage.innerHTML = `
			<div class="profile-game ng-scope section">
				<div class="container-header">
					<h3></h3>
					<div class="container-buttons">
						<button class="profile-view-selector btn-secondary-xs btn-generic-slideshow-xs" title="Slideshow View"
						type="button" ng-click="updateDisplay(false)" id="slideshow-col"> <span class="icon-slideshow selected"></span> </button> <button
						class="profile-view-selector btn-control-xs btn-generic-grid-xs" title="Grid View" type="button"
						ng-click="updateDisplay(true)"
						ng-class="{'btn-secondary-xs btn-generic-grid-xs': isGridOn, 'btn-control-xs btn-generic-grid-xs': !isGridOn}" id="grid-col">
						<span class="icon-grid" ng-class="{'selected': isGridOn}"></span> </button>
					</div>
				</div>
				<div ng-show="isGridOn" class="game-grid ng-isolate-scope" id="col-grid">
					<ul class="hlist game-cards" style="max-height: 0px" horizontal-scroll-bar="loadMore()"></ul>
				</div>
				<div id="collectibles-switcher" class="switcher slide-switcher games ng-hide" ng-hide="isGridOn" switcher="" itemscount="switcher.games.itemsCount" currpage="switcher.games.currPage">
					<ul class="slide-items-container switcher-items hlist"></ul><a class="carousel-control left"
						data-switch="prev" id="col-prev"><span class="icon-carousel-left"></span></a> <a class="carousel-control right"
						data-switch="next" id="col-next"><span class="icon-carousel-right"></span></a>
				</div>
			</div>
		`
		for (element of document.getElementsByClassName('rbx-tab-heading')) {
			element.parentNode.style.width = "33.333%"
			if (element.id != "tab-collectibles") {
				element.addEventListener('click', () => {
					rapPage.setAttribute('class', 'tab-pane')
				})
			}
		}
		document.getElementsByClassName('tab-content')[0].appendChild(rapPage)
	} else {
		rapPage.setAttribute('class', 'profile-game')
		rapPage.setAttribute('id', 'collectibles')
		rapPage.innerHTML = `
				<div class="container-header">
					<h3 ng-non-bindable>Collectibles</h3>
				</div>
				<div class="section-content game-grid" id="col-grid">
					<ul class="hlist game-cards"></ul>
				</div>
			</div>
		`
		document.getElementsByClassName("btr-profile-right")[0].appendChild(rapPage)
	}
	var size = 20; let arrayOfArrays = [];
	for (let i = 0; i < collectibles.list.length; i += size) {
		arrayOfArrays.push(collectibles.list.slice(i, i + size));
	}
	let thumbnails = []
	function getImages(images = "") {
		return new Promise((resolve, reject) => {
			get(`https://thumbnails.roblox.com/v1/assets?assetIds=${images}&returnPolicy=PlaceHolder&size=250x250&format=Png&isCircular=false`).then(got => {
				resolve(got.data)
			}).catch(reject)
		})
	}
	for (const content of arrayOfArrays) {
		let images = await getImages(content.map(e => e.assetId).join(','))
		for (const thumbnail of images) {
			thumbnails.push(thumbnail)
		}
	}
	const perPage = isBTR && 6 || 12
	const pager = new Pager({ useBTR: isBTR })
	const [collectPages] = pager.constructPages(collectibles.list, perPage)
	pager.setMax()
	let loading = false
	pager.onset = (newPage) => {
		if (loading) return;
		loading = true
		document.getElementById('col-grid').getElementsByClassName('hlist game-cards')[0].clearChildren()
		
		const page = collectPages[newPage - 1]
		for (const info of page) {
			let thumb
			for (const actual of thumbnails) {
				if (actual.targetId == info.assetId) {
					thumb = actual.imageUrl
					break
				}
			}
			let sample2 = document.createElement('div')
			sample2.setAttribute('class', 'game-container shown')
			sample2.innerHTML = `
				<li class="list-item game-card game-tile">
					<div class="game-card-container"><a
						href="https://www.roblox.com/catalog/${info.assetId}"
						class="game-card-link">
						<div class="game-card-thumb-container"><img class="game-card-thumb ng-isolate-scope" data-=""
							src="${thumb}" alt="${stripTags(info.name)}"
							thumbnail="{&quot;Final&quot;:true,&quot;Url&quot;:&quot;${thumb}&quot;,&quot;RetryUrl&quot;:null,&quot;UserId&quot;:0,&quot;EndpointType&quot;:&quot;Avatar&quot;}"
							image-retry=""></div>
						<div class="game-card-name game-name-title" title="${stripTags(info.name)}" ng-non-bindable="">${stripTags(info.name)}</div>
						<div class="game-card-info"><span class="info-label icon-votes-gray" style="background-image:url('https://images.rbxcdn.com/0ff32c69af9262d7c9fefe8284d81d88-chat_dark.svg');background-position:-15px -385px;"></span> <span
							class="info-label vote-percentage-label" title="RAP">${addCommas(info.recentAveragePrice)}</span> <span class="info-label no-vote hidden"></span> 
							</div>
					</a></div>
				</li>
				`
			document.getElementById('col-grid').getElementsByClassName('hlist game-cards')[0].appendChild(sample2)
			if (info.serialNumber) {
				let limited = document.createElement('div')
				limited.setAttribute('class', 'asset-restriction-icon')
				limited.setAttribute('style', 'position:absolute;top:87.5%;right: 19.5%;')
				limited.innerHTML = `
						<span class="rbx-tooltip" data-toggle="tooltip" title="" data-original-title="Serialized limited release, resellable..">
							<span class="icon-label icon-limited-unique-label"></span>
						</span>
					`
				sample2.getElementsByClassName('game-card-thumb-container')[0].insertBefore(limited, sample2.getElementsByClassName('game-card-thumb')[0])
				let serialLabel1 = document.createElement('span')
				serialLabel1.setAttribute('class', 'info-label icon-playing-counts-gray')
				serialLabel1.setAttribute('style', "background-image:url('https://images.rbxcdn.com/0ff32c69af9262d7c9fefe8284d81d88-chat_dark.svg');background-position:-15px -433px;")
				let serialLabel2 = document.createElement('span')
				serialLabel2.setAttribute('class', 'info-label playing-counts-label')
				serialLabel2.setAttribute('style', 'padding:0px 0px 0px 5.5px;')
				serialLabel2.setAttribute('title', 'Serial')
				serialLabel2.textContent = `#${info.serialNumber}`
				sample2.getElementsByClassName('game-card-info')[0].appendChild(serialLabel1)
				sample2.getElementsByClassName('game-card-info')[0].appendChild(serialLabel2)
			} else {
				let limited = document.createElement('div')
				limited.setAttribute('class', 'asset-restriction-icon')
				limited.setAttribute('style', 'position:absolute;top:87.5%;right: 19.5%;')
				limited.innerHTML = `
						<span class="rbx-tooltip" data-toggle="tooltip" title="" data-original-title="Limited">
							<span class="icon-label icon-limited-label"></span>
						</span>
					`
				sample2.getElementsByClassName('game-card-thumb-container')[0].insertBefore(limited, sample2.getElementsByClassName('game-card-thumb')[0])
			}
		}
		loading = false
	}
	pager.onset(1)
	document.getElementById("col-grid").appendChild(pager.pager)
	
	let p = 0
	for (const info of collectibles.list) {
		let thumb
		for (const actual of thumbnails) {
			if (actual.targetId == info.assetId) {
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
					<a href="https://www.roblox.com/catalog/${info.assetId}"> <img
							class="slide-item-image ng-isolate-scope" src="${thumb}"
							data-src="${thumb}" data-emblem-id="4631436023"
							thumbnail="{&quot;Final&quot;:true,&quot;Url&quot;:&quot;${thumb}&quot;,&quot;RetryUrl&quot;:null,&quot;UserId&quot;:0,&quot;EndpointType&quot;:&quot;Avatar&quot;}"
							image-retry=""> </a>
				</div>
			</div>
			<div class="col-sm-6 slide-item-container-right games">
			<div class="slide-item-info">
				<h2 class="text-overflow slide-item-name games" ng-non-bindable="">${stripTags(info.name)}</h2>
				<p class="text-description para-overflow slide-item-description games" ng-non-bindable=""></p>
			</div>
			<div class="slide-item-stats">
				<ul class="hlist">
				<li class="list-item">
					<div class="text-label slide-item-stat-title">RAP</div>
					<div class="text-lead slide-item-members-count">${addCommas(info.recentAveragePrice)}</div>
				</li>
				<li class="list-item">
					<div class="text-label slide-item-stat-title">${info.originalPrice && "Original Price" || info.assetStock && "Stock" || ""}</div>
					<div class="text-lead text-overflow slide-item-my-rank games">${info.originalPrice && addCommas(info.originalPrice) || info.assetStock && addCommas(info.assetStock) || ""}</div>
				</li>
				</ul>
			</div>
			</div>`
		sample.setAttribute('data-index', p - 1)
		if (!isBTR) document.getElementById('collectibles-switcher').getElementsByClassName('slide-items-container')[0].appendChild(sample);
		const slideItemInfo = sample.getElementsByClassName('slide-item-info')[0]
		if (info.serialNumber) {
			let limited = document.createElement('div')
			limited.setAttribute('class', 'asset-restriction-icon')
			limited.setAttribute('style', 'top:87.5%;right: 19.5%;')
			limited.innerHTML = `
					<span class="rbx-tooltip" data-toggle="tooltip" title="" data-original-title="Serialized limited release, resellable..">
						<span class="icon-label icon-limited-unique-label"></span>
					</span>
				`
			slideItemInfo.insertBefore(limited, sample.getElementsByClassName('slide-item-name')[0])
			sample.getElementsByClassName('slide-item-description')[0].textContent = `#${info.serialNumber}`
		} else {
			let limited = document.createElement('div')
			limited.setAttribute('class', 'asset-restriction-icon')
			limited.setAttribute('style', 'top:87.5%;right: 19.5%;')
			limited.innerHTML = `
					<span class="rbx-tooltip" data-toggle="tooltip" title="" data-original-title="Limited">
						<span class="icon-label icon-limited-label"></span>
					</span>
				`
			slideItemInfo.insertBefore(limited, sample.getElementsByClassName('slide-item-name')[0])
		}
	}
	if (!isBTR) {
		let selectedC = 0
		document.getElementById('col-prev').addEventListener('click', () => {
			if (selectedC > 0) {
				rapPage.querySelectorAll(`[data-index="${selectedC}"]`)[0].className = "switcher-item slide-item-container"
				selectedC--
				rapPage.querySelectorAll(`[data-index="${selectedC}"]`)[0].className = "switcher-item slide-item-container active"
			}
		})
		document.getElementById('col-next').addEventListener('click', () => {
			if (selectedC < thumbnails.length - 1) {
				rapPage.querySelectorAll(`[data-index="${selectedC}"]`)[0].className = "switcher-item slide-item-container"
				selectedC++
				rapPage.querySelectorAll(`[data-index="${selectedC}"]`)[0].className = "switcher-item slide-item-container active"
			}
		})
		document.getElementById('tab-collectibles').addEventListener('click', () => {
			document.getElementById('tab-collectibles').parentNode.className = "rbx-tab active"
			document.getElementById('tab-creations').parentNode.className = "rbx-tab"
			document.getElementById('tab-about').parentNode.className = "rbx-tab"
			document.getElementById('about').className = "tab-pane"
			document.getElementById('creations').className = "tab-pane"
			rapPage.setAttribute('class', 'tab-pane active')
			window.scrollTo(0, 0);
		})
		document.getElementById('slideshow-col').addEventListener('click', () => {
			document.getElementById('collectibles-switcher').className = 'switcher slide-switcher games ng-isolate-scope'
			document.getElementById('col-grid').className = 'game-grid games ng-hide'
		})
		document.getElementById('grid-col').addEventListener('click', () => {
			document.getElementById('collectibles-switcher').className = 'switcher slide-switcher games ng-hide'
			document.getElementById('col-grid').className = 'game-grid ng-isolate-scope'
		})
		if (window.location.href.includes("#collectibles")) {
			document.getElementById('tab-collectibles').dispatchEvent(new Event('click'))
		}
		function locationHashChanged(e) {
			if (location.hash.includes("#collectibles")) {
				document.getElementById('tab-collectibles').dispatchEvent(new Event('click'))
			}
		}
	
		window.onhashchange = locationHashChanged;
	}
}