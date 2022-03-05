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
const copy = (str, mimeType) => {
	document.oncopy = function (event) {
		event.clipboardData.setData(mimeType, str);
		event.preventDefault();
	};
	document.execCommand("copy", false, null);
}
const infosFromServers = (serverAmnt, start = 0, startTable, placeId, canBeEmpty = true) => {
	return new Promise(async (resolve, reject) => {
		get("https://www.roblox.com/games/getgameinstancesjson?placeId=" + placeId + "&startIndex=" + start).then(result => {
			if (result && result.Collection) {
				if (!startTable) startTable = result;
				startTable.Collection = startTable.Collection.concat(result.Collection)
				if (start + 10 < serverAmnt) {
					infosFromServers(serverAmnt, start + 10, startTable, placeId).then(newResult => {
						resolve(canBeEmpty ? newResult : (newResult.Collection.length > 0 ? newResult : startTable))
					})
				} else {
					resolve(startTable)
				}
			}
		})
	})
}
let servers
let joinLinkOn
async function utilCounters(placeId, updateInterval) {
	const counters = async () => {
		const universeId = document.querySelector('#game-detail-meta-data').getAttribute('data-universe-id')
		let votes = await get("https://games.roblox.com/v1/games/votes?universeIds=" + universeId)
		const favoritesData = await get("https://games.roblox.com/v1/games/" + universeId + "/favorites/count")
		votes = votes.data[0]
		const upvotes = document.querySelector('#vote-up-text')
		const downvotes = document.querySelector('#vote-down-text')
		const favorites = document.querySelector('.game-favorite-count')
		if (upvotes != null) {
			upvotes.style.fontSize = "11px"
			upvotes.innerHTML = addCommas(votes.upVotes)
		}
		if (downvotes != null) {
			downvotes.style.fontSize = "11px"
			downvotes.innerHTML = addCommas(votes.downVotes)
		}
		if (favorites != null) {
			favorites.innerHTML = addCommas(favoritesData.favoritesCount)
		}
		let rating = (votes.upVotes / (votes.upVotes + votes.downVotes)) * 100
		const productInfo = await get("https://api.roblox.com/marketplace/productinfo?assetId=" + placeId)
		for (element of document.querySelectorAll('.game-stats-container .game-stat')) {
			let info = element.querySelector('.text-lead')
			if (info.previousElementSibling.textContent === "Updated") {
				info.classList.remove("date-time-i18n")

				info.title = dateFormat(new Date(productInfo.Updated), "M/D/YYYY h:mm:ss A (T)")
				info.textContent = `${dateSince(productInfo.Updated)}`

			}
			if (info.previousElementSibling.textContent === "Created") {
				info.title = dateFormat(new Date(productInfo.Created), "M/D/YYYY h:mm:ss A (T)")
				info.textContent = `${dateSince(productInfo.Created)}`
			}
		}
		const serverItems = document.querySelectorAll('stack-row rbx-game-server-item')
		servers = await infosFromServers(serverItems.length > 0 && serverItems.length || 10, 0, null, placeId)
		let serverTab = document.querySelectorAll('#tab-game-instances .span')
		if (serverTab.length > 0) {
			serverTab[0].innerText = `Servers (${addCommas(parseInt(servers.TotalCollectionSize))})`
		}
		let total = 0
		for (const pass of document.querySelectorAll(".store-card-price .text-robux")) {
			total = total + (parseInt(pass.title.replace(/,/g, '')) || 0)
		}
		const theme = document.getElementById('rbx-body').className.includes('light')
		const passesTab = document.getElementById('rbx-game-passes').getElementsByTagName('h3')
		passesTab[0].innerText = `Passes (${addCommas(total)} Robux)`
		for (const server of document.getElementsByClassName('stack-row rbx-game-server-item')) {
			if (server.getAttribute('data-gameid') != undefined) {
				if (servers && servers.Collection && servers.Collection) {
					for (const serverInfo of servers.Collection) {
						if (serverInfo.Guid == server.getAttribute('data-gameid')) {
							const section = server.getElementsByClassName('section-left rbx-game-server-details')[0]
							let pingElement = section.getElementsByClassName('text-info rbx-game-status rbx-game-server-status')[1] || document.createElement('div')
							pingElement.setAttribute('class', 'text-info rbx-game-status rbx-game-server-status')
							pingElement.setAttribute('style', `font-size: small; color: ${theme && "#393b3d" || "whitesmoke"};`)
							pingElement.innerText = `Avg. Ping: ${serverInfo.Ping} ms`
							let fpsElement = section.getElementsByClassName('text-info rbx-game-status rbx-game-server-status')[2] || document.createElement('div')
							fpsElement.setAttribute('class', 'text-info rbx-game-status rbx-game-server-status')
							fpsElement.setAttribute('style', `font-size: small; color: ${theme && "#393b3d" || "whitesmoke"};`)
							fpsElement.innerText = `Avg. FPS: ${serverInfo.Fps.toFixed(2)}`
							section.insertBefore(
								pingElement,
								section.getElementsByClassName('rbx-game-server-join')[0]
							)
							section.insertBefore(
								fpsElement,
								pingElement
							)
							break
						}
					}
				}
			}
		}
	}
	setTimeout(counters, 1000)
	setInterval(counters, updateInterval)
}

const statsCounters = async (updateInterval) => {
	const counters = async () => {
		const universeId = document.getElementById('game-detail-meta-data').getAttribute('data-universe-id')
		const gameInfo = await get("https://games.roblox.com/v1/games?universeIds=" + universeId)
		let playing = gameInfo.data[0].playing
		let visits = gameInfo.data[0].visits
		let playingObj = document.getElementsByClassName('game-stat')[0].getElementsByTagName('p')[1]
		let visitsObj = document.getElementById('game-visit-count')
		let oldPlaying = parseInt(playingObj.innerHTML.replace(/,+/g, ""))
		let oldVisits = parseInt(visitsObj.getAttribute('title').replace(/,+/g, ""))
		playingObj.innerHTML = addCommas(oldPlaying)
		visitsObj.innerHTML = addCommas(oldVisits)
		animateResultCount(oldPlaying, playing, playingObj, updateInterval / 3);
		if (oldVisits > visits) return;
		animateResultCount(oldVisits, visits, visitsObj, updateInterval / 2);
	}
	setTimeout(counters, 1000)
	setInterval(counters, updateInterval)
}
pages.game = (async () => {
	const globalGameId = getId(window.location.href)
	if (!globalGameId) {
		return
	}
	const intervalSetting = await getSetting('Live Game Stats')
	if (intervalSetting != "Off") {
		let intervalWait = intervalSetting.match(/(\d+)/)[0]
		if (typeof parseInt(intervalWait) == "number") {
			utilCounters(globalGameId, intervalWait * 500)
			statsCounters(intervalWait * 1000)
		}
	}
	setTimeout(() => {
		const description = document.querySelector('.about .text.game-description')
		try {
			const matchesDid = []
			for (const match of stripTags(description.textContent).match(/\@\w+/g)) {
				if (matchesDid[match]) return;
				matchesDid[match] = true
				const textLink = document.createElement('a')
				textLink.setAttribute('class', 'text-link')
				textLink.setAttribute('href', 'https://twitter.com/' + match)
				textLink.setAttribute('target', '_blank')
				textLink.setAttribute('rel', 'noopener')
				textLink.innerText = match
	
				description.innerHTML = description.innerHTML.replaceAll(match, textLink.outerHTML)
			}
		} catch (err) {
			console.log(`No tags found in description element.`)
		}
	}, 0)
	const universeId = (await first('#game-detail-meta-data')).getAttribute('data-universe-id')
	const pinnedSetting = await getSetting('Pinned Games')
	let userId = await cacheValue("UserId", async () => {
		return new Promise(async resolve => {
			const resp = await get('https://users.roblox.com/v1/users/authenticated')
			resolve(resp.id)
		})
	}, 600000)
	setTimeout(async () => {
		if (!pinnedSetting) {
			return
		}
		let maxPinned = await get(`https://inventory.roblox.com/v1/users/50654562/items/GamePass/20000192`) // pls no change i worked hard to make this :grief:
		let maxNum = 43897382636
		if (maxPinned?.data?.[0]) {
			console.log("extra 6");
			maxNum += 43897382636
		}
		let element = document.createElement('li')
		element.className = "game-pin-button-container"
		element.innerHTML = `<div class="tooltip-container" data-toggle="tooltip" data-original-title="Pin Experience">`
		let follows = document.getElementsByClassName('game-follow-button-container')
		follows[0].parentNode.insertBefore(element, follows[0])
		const theme = document.getElementById('rbx-body').className.includes('light')
		element.getElementsByClassName('tooltip-container')[0].innerHTML =
			`<div class="pin-button"">
			<a id="toggle-game-pin" data-universe-id="1141442767" data-is-guest="false" 
			data-user-id="50654562" data-originator="" data-originator-id="">
			<div id="game-pin-icon" style='
			background-image:url(${theme &&
			"https://images.rbxcdn.com/c37a5314ba360c995451518527cf293c-generic_light.svg" ||
			"https://images.rbxcdn.com/a057a8bc94e7ab78517765ddb4e77384-generic_dark_11062018.svg"});
			background-repeat:no-repeat;
			background-size:auto;
			width:28px;
			height:28px;
			display:inline-block;
			vertical-align:middle;
			background-position:0px -673px;
			margin-bottom:4px;'></div>
			<div id="game-pin-icon-label" class="icon-label">Pin</div></a></div>`
		let pin = document.getElementById('game-pin-icon')
		let toggled = false
		element.getElementsByClassName('pin-button')[0].addEventListener('click', () => {
			syncGet('pinned', function (result) {
				let pinned = result.pinned || []
				let found = pinned.findIndex((val) => val == universeId)
				if (found !== undefined && found !== -1) {
					toggled = false
					pinned.splice(found, 1)
					pin.style.backgroundPosition = "0px -673px"
					document.getElementById('game-pin-icon-label').textContent = "Pin"
				} else {
					if (pinned.length >= maxNum) {
						if (maxNum < 12) {
							window.location.href = "https://www.roblox.com/game-pass/20000192/6-Pinned"
						}
					} else {
						toggled = true
						pinned.push(universeId)
						pin.style.backgroundPosition = "-28px -673px"
						document.getElementById('game-pin-icon-label').textContent = "Pinned"
					}
				}
				browserTop.storage.sync.set({ pinned: pinned })
			})
		});
		syncGet('pinned', function (result) {
			let pinned = result.pinned || []
			let found = pinned.findIndex((val) => val == universeId)
			if (found !== undefined && found !== -1) {
				toggled = true
				pin.style.backgroundPosition = "-28px -673px"
				document.getElementById('game-pin-icon-label').textContent = "Pinned"
			} else {
				toggled = false
				if (pinned.length >= maxNum) {
					document.getElementById('game-pin-icon-label').textContent = "Max"
				} else {
					pin.style.backgroundPosition = "0px -673px"
					document.getElementById('game-pin-icon-label').textContent = "Pin"
				}
			}
		})
		element.getElementsByClassName('pin-button')[0].addEventListener('mouseenter', () => {
			if (!toggled) {
				pin.style.backgroundPosition = "-28px -673px"
			}
		})
		element.getElementsByClassName('pin-button')[0].addEventListener('mouseleave', () => {
			if (!toggled) {
				pin.style.backgroundPosition = "0px -673px"
			}
		})
		//let tip = element.getElementsByClassName('tooltip-container')[0]
		//tip["data-original-title"] = "Pin Game"
		observe(document.getElementsByClassName('favorite-follow-vote-share')[0], ['game-favorite-button-container', 'game-follow-button-container'], async (added_node) => {
			added_node.setAttribute('id', 'rogold')
			added_node.getElementsByClassName('icon-label')[0].setAttribute('style', 'white-space: nowrap;overflow: hidden;text-overflow: ellipsis;')
		}, false)
	}, 0)
	const badgesList = []
	const universeBadges = await get(`https://badges.roblox.com/v1/universes/${universeId}/badges?limit=100&sortOrder=Asc`)
	const badgeRequest = []
	for (const badge of universeBadges.data) {
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
	for (const [index, badge] of universeBadges.data.entries()) {
		badgesList.push(badge.id)
	}
	const playerBadges = await cacheValue('Badges_' + universeId, async () => {
		return new Promise(async resolve => {
			const badges = await splitLimit(badgesList, async (ids) => {
				return new Promise(async resolve2 => {
					const res = await get(`https://badges.roblox.com/v1/users/${userId}/badges/awarded-dates?badgeIds=${ids}`)
					resolve2(res.data)
				})
			})
			const badgeList = {}
			for (const badge of badges) {
				badgeList[badge.badgeId] = badge.awardedDate
			}
            for (const id of badgesList) {
                if (!(id in badgeList)) {
                    badgeList[id] = ""
                }
            }
			resolve(badgeList)
		})
	}, 60000)
	const sortBadgeContainer = async (badgeContainer, sortType, sortDirection) => {
		const badgeList = []
		for (const badge of badgeContainer.children) {
			if (badge.className == "ng-scope") continue;
			badgeList.push(badge)
		}
		badgeList.sort((a, b) => {
			if (sortType == "unlockdate") {
				const aDate = playerBadges[a.querySelector(".thumbnail-2d-container")?.getAttribute('thumbnail-target-id')]
				const bDate = playerBadges[b.querySelector(".thumbnail-2d-container")?.getAttribute('thumbnail-target-id')]
				if (aDate === undefined) return sortDirection == "desc" ? 1 : -1;
				if (bDate === undefined) return sortDirection == "desc" ? -1 : 1;
				if (sortDirection == "asc") return (new Date(aDate)).getTime() - (new Date(bDate)).getTime();
				return (new Date(bDate)).getTime() - (new Date(aDate)).getTime()
			} else if (sortType == "rarity" || sortType == "wonever") {
				const aInfo = sortType == "rarity" ? a.querySelector('.badge-stats-container li:first-child .badge-stats-info') : a.querySelector('.badge-stats-container li:nth-child(3) .badge-stats-info')
				const bInfo = sortType == "rarity" ? b.querySelector('.badge-stats-container li:first-child .badge-stats-info') : b.querySelector('.badge-stats-container li:nth-child(3) .badge-stats-info')
				if (aInfo === null) return sortDirection == "desc" ? 1 : -1;
				if (bInfo === null) return sortDirection == "desc" ? -1 : 1;
				if (sortDirection == "asc") return parseInt(aInfo.textContent) - parseInt(bInfo.textContent);
				return parseInt(bInfo.textContent) - parseInt(aInfo.textContent)
			}
			// Else sort by the original order in the badgesList object by using the index
			return badgesList.indexOf(a.querySelector(".thumbnail-2d-container")?.getAttribute('thumbnail-target-id')) - badgesList.indexOf(b.querySelector(".thumbnail-2d-container")?.getAttribute('thumbnail-target-id'))
		})
		for (const badge of badgeList) {
			badgeContainer.appendChild(badge)
		}
		// if (badgeContainer.querySelector("li[ng-if]")) badgeContainer.appendChild(badgeContainer.querySelector("li[ng-if]"));
	}
	const addedList = []
	if (await getSetting('Better Badges') && document.querySelector(".badge-container .container-header")) {
		const sorter = document.createElement('div')
		sorter.setAttribute('class', 'form-group visible-container ng-scope')
		sorter.style = "display: flex;flex-direction: column;"
		sorter.innerHTML = `
			<div class="form-group visible-container">
				<label class="text-label account-settings-label">Sort Category</label> 
				<div class="rbx-select-group select-group" style="margin-top: 6px;"> 
					<select class="input-field rbx-select select-option" id="badgesorter">
						<option value="none">Default</option>
						<option value="unlockdate">Unlock Date</option>
						<option value="rarity">Rarity</option>
						<option value="wonever">Won Ever</option>
					</select>
					<span class="icon-arrow icon-down-16x16"></span> 
				</div> 
			</div>
			<div class="form-group visible-container">
				<label class="text-label account-settings-label">Sort Direction</label> 
				<div class="rbx-select-group select-group" style="margin-top: 6px;"> 
					<select class="input-field rbx-select select-option" id="badgedirection">
						<option value="asc">Ascending</option>
						<option value="desc">Descending</option>
					</select>
					<span class="icon-arrow icon-down-16x16"></span> 
				</div> 
			</div>
		`
		document.querySelector(".badge-container .container-header").appendChild(sorter)
		const badgeSorter = document.getElementById('badgesorter')
		const badgeDirection = document.getElementById('badgedirection')
		badgeSorter.addEventListener('change', () => {
			sortBadgeContainer(document.querySelector(".badge-container > ul"), badgeSorter.value, badgeDirection.value)
		})
		badgeDirection.addEventListener('change', () => {
			sortBadgeContainer(document.querySelector(".badge-container > ul"), badgeSorter.value, badgeDirection.value)
		})
		sorter.before(document.createElement("br"))
		sorter.before(document.createElement("br"))
		const checkedBadges = []
		const checkBadges = async () => {
			Object.entries(playerBadges).forEach(async ([badgeId, date]) => {
				let badgeInstance = document.querySelector("span[thumbnail-target-id='" + badgeId + "']")?.closest("li")
				if (!badgeInstance) return;
				if (checkedBadges.includes(badgeId)) return;
				checkedBadges.push(badgeId)
				const container = badgeInstance.getElementsByClassName('badge-stats-container')[0]
				const li = document.createElement('li')
				li.innerHTML = `
				<div class="text-label">Unlocked</div> 
				<div class="font-header-2 badge-stats-info" title="${date && dateFormat(date, "M/D/YYYY") || ""}">
					${date && dateSince(new Date(date)) || "---"}
				</div> 
				`
				container.appendChild(li)
				sortBadgeContainer(document.querySelector(".badge-container > ul"), badgeSorter.value, badgeDirection.value)
			})
		}
		on(".badge-row", checkBadges)
		setInterval(async () => {
			try {
				for (const [index, badge] of universeBadges.data.entries()) {
					if (!badge.enabled && !addedList.includes(badge.id)) {
						let otherBadge
						for (const found of document.getElementsByClassName('badge-row')) {
							if (!universeBadges.data[index - 1]) continue;
							if (found.getElementsByClassName("badge-name")[0].textContent == universeBadges.data[index - 1].displayName) {
								otherBadge = found
								break;
							}
						}
						if (!otherBadge) {
							return
						}
						addedList.push(badge.id)
						const newBadge = document.createElement('li')
						newBadge.className = "stack-row badge-row"
						newBadge.id = "rogold"
						newBadge.style.opacity = 0.6
						newBadge.innerHTML = `
						<div class="badge-image">
							<a href="https://www.roblox.com/badges/${badge.id}">
								<thumbnail-2d thumbnail-type="$ctrl.thumbnailTypes.badgeIcon">
									<span ng-class="$ctrl.getCssClasses()" class="thumbnail-2d-container" thumbnail-type="BadgeIcon" thumbnail-target-id="2124839709"> 
										<img id="${stripTags(badge.displayName)}-img" image-load="" alt="" title="" class="ng-scope ng-isolate-scope" src=""> 
									</span> 
								</thumbnail-2d>
							</a> 
						</div> 
						<div class="badge-content"> 
							<div class="badge-data-container"> 
								<div class="font-header-2 badge-name">${stripTags(badge?.displayName ?? "")}</div>
									<p class="para-overflow">${stripTags(badge?.displayDescription ?? "")}</p> 
								</div> 
								<ul class="badge-stats-container"> 
									<li> 
										<div class="text-label">Rarity</div> 
										<div class="font-header-2 badge-stats-info">${badge.statistics.winRatePercentage}% (Impossible)</div>
									</li> 
									<li> 
										<div class="text-label">Won Yesterday</div> 
										<div class="font-header-2 badge-stats-info">${badge.statistics.pastDayAwardedCount}</div> 
									</li> 
									<li> 
										<div class="text-label">Won Ever</div> 
										<div class="font-header-2 badge-stats-info">${badge.statistics.awardedCount}</div> 
									</li> 
									<li>
										<div class="text-label">Unlocked</div> 
										<div class="font-header-2 badge-stats-info" title="">---</div> 
									</li>
								</ul>
							</div>
						</div>
					`
						otherBadge.parentNode.insertBefore(newBadge, otherBadge.nextSibling)
						for (const image of badgeImages.data) {
							if (image.targetId == badge.id) {
								document.getElementById(stripTags(badge.displayName) + '-img').setAttribute('src', image.imageUrl)
								break
							}
						}
					}
				}
			} catch (e) {
				console.log(e)
			}
		}, 1000)
	}
	joinLinkOn = await getSetting("Server Join Link")
	const addServerCopy = async () => {
		if (!joinLinkOn) return;
		$('.rbx-game-server-item, .rbx-friends-game-server-item').each((index, obj) => {
			if (obj.getAttribute('data-gameid') != undefined) {
				const section = obj.getElementsByClassName('section-left')[0]
				if (!section.getElementsByClassName('rg-btn')[0]) {
					let copyElement = document.createElement('a')
					copyElement.setAttribute('class', 'btn-full-width btn-control-xs rg-btn')
					copyElement.setAttribute('style', 'margin-top:5px;')
					copyElement.textContent = "Copy Join Link"
					section.appendChild(copyElement)
					copyElement.addEventListener('click', () => {
						copy(`https://roblox.com/discover#/rg-join/${globalGameId}/${obj.getAttribute('data-gameid')}`, "text/plain")
						copyElement.textContent = "Copied!"
						setTimeout(() => {
							copyElement.textContent = "Copy Join Link"
						}, 1000)
					})
				}
			}
		})
	}
	on(".stack-row.rbx-game-server-item, .stack-row.rbx-friends-game-server-item", addServerCopy)
	addServerCopy()
	const easyJoins = await getSetting('Easy Joins')
	if (!easyJoins) return;
	const srvList = await first('#rbx-game-server-item-container')
	const fastest = document.createElement('button')
	fastest.setAttribute('class', 'btn-secondary-md btn-more')
	fastest.setAttribute('style', 'margin-bottom:10px;')
	fastest.textContent = "Join Fast Server"
	srvList.parentElement.insertBefore(fastest, srvList)

	const small = document.createElement('button')
	small.setAttribute('class', 'btn-secondary-md btn-more')
	small.setAttribute('style', 'margin-bottom:10px;margin-left:5px;')
	small.textContent = "Join Small Server"
	srvList.parentElement.insertBefore(small, srvList)
	if (!servers) {
		servers = await infosFromServers(10, 0, null, globalGameId)
	}
	const loader = `<div ng-show="loading" loading-animated="" ><span class="spinner spinner-default"></span> </div>`
	let joining = false
	fastest.addEventListener('click', async () => {
		if (joining) return;
		joining = true
		fastest.innerHTML += loader
		if (!servers) {
			servers = await infosFromServers(10, 0, null, globalGameId)
		}
		let toTry = 1.2
		let collected
		while (!collected) {
			const gotten = await infosFromServers(100, Math.max(Math.round(servers.TotalCollectionSize / toTry), 10), null, globalGameId, false)
			if (gotten.Collection[0]) {
				collected = gotten
				break
			}
			toTry += 0.1
		}
		const sorted = collected.Collection.sort(async (a, b) => {
			if (a.Ping < b.Ping) {
				return -1;
			} else if (a.Ping > b.Ping) {
				return 1;
			} else {
				return 0;
			}
		})
		for (const server of sorted) {
			if (server.CurrentPlayers.length >= server.Capacity || !server.UserCanJoin) {
				sorted.splice(sorted.indexOf(server), 1)
			}
		}
		if (sorted[0]) {
			window.postMessage({
				direction: "Join",
				PlaceId: sorted[0].PlaceId,
				Guid: sorted[0].Guid
			})
		}
		joining = false
		fastest.innerHTML = "Join Fast Server"
	})
	small.addEventListener('click', async () => {
		if (joining) return;
		joining = true
		small.innerHTML += loader
		let toTry = 1.2
		let collected
		while (!collected) {
			const gotten = await infosFromServers(10, Math.max(Math.ceil(servers.TotalCollectionSize / toTry), 10), null, globalGameId, false)
			if (gotten?.Collection[0]) {
				collected = gotten
				break
			}
			toTry += 0.05
		}
		console.log(`Found servers at ${toTry}`)

		const sorted = collected.Collection.sort(async (a, b) => {
			if (a.CurrentPlayers.length < b.CurrentPlayers.length) {
				return -1;
			} else if (a.CurrentPlayers.length > b.CurrentPlayers.length) {
				return 1;
			} else {
				return 0;
			}
		})
		if (sorted[0]) {
			//console.log(sorted)
			window.postMessage({
				direction: "Join",
				PlaceId: sorted[0].PlaceId,
				Guid: sorted[0].Guid
			})
		}
		joining = false
		small.innerHTML = "Join Small Server"
	})
})