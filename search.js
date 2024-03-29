/*
    RoGold
    Coding and design by Alrovi Aps.
    Contact: contact@alrovi.com
    Copyright (C) Alrovi Aps
    All rights reserved.
*/

pages.search = (async () => {
	//setTimeout(async () => {
	const shouldSearch = await getSetting('DevHub Search')
	const shouldQuick = (await checkExperiments()) && (await getSetting('Quick User Search'))
	let devSearch = document.createElement('li')
	devSearch.setAttribute('class', 'navbar-search-option rbx-clickable-li')
	devSearch.innerHTML = `
			<a class="navbar-search-anchor" href="https://developer.roblox.com/en-us/">Search "" in DevHub</a>
		`
	const quickSearch = document.createElement('li')
	quickSearch.setAttribute('class', 'navbar-search-option rbx-clickable-li')
	quickSearch.setAttribute('style', 'display:flex;')
	quickSearch.innerHTML = `
		<div class="avatar avatar-card-fullbody" style="width: 40px;height: 50px;padding-top: 5px;padding-left: 5px;"> 
			<span class="avatar-card-link friend-avatar icon-placeholder-avatar-headshot" style="width: 40px;height: 40px;"> 
				<thumbnail-2d class="avatar-card-image ng-isolate-scope" thumbnail-type="layout.thumbnailTypes.avatarHeadshot" thumbnail-target-id="friend.id">
					<span class="thumbnail-2d-container" thumbnail-type="AvatarHeadshot" thumbnail-target-id=""> 
						<img image-load="" alt="" title="" class="ng-scope ng-isolate-scope" src="">
					</span>
				</thumbnail-2d> 
			</span> 
		</div>
		<div class="user-info-container" style="">
			<h1 class="user-name" style="font-size: medium;margin-left: 15px;font-weight: initial;display: inline-flex;flex-direction: column;justify-content: center;">
				No user
			</h1>
			<span class="text-secondary" style="
				margin-left: 5px;
				display: none;
				flex-direction: column;
				justify-content: center;
				color: dimgrey;
			">(Banned)</span>
		</div>
		<a class="rg-link" style="position:relative;width:100%;height:16%;position:absolute;"></a>
		`
	const quick2 = quickSearch.cloneNode(true)
	let added = false
	const addBar = async () => {
		if (added) {
			return
		}
		added = true
		const navbarSearch = await first(".navbar-search")
		const dropdown = qs(".dropdown-menu", navbarSearch)
		if (shouldSearch) {
			dropdown.appendChild(devSearch)
		}
		if (shouldQuick) {
			dropdown.insertBefore(quickSearch, dropdown.firstChild)
			dropdown.insertBefore(quick2, dropdown.firstChild)
		}
		let searchElement = qs("#right-navigation-header .input-field")
		let lastSearch = Date.now()
		let lastInput
		searchElement.addEventListener('input', throttle(async () => {
			if (shouldSearch) {
				let searchResult = await search(searchElement.value)
				if (searchResult == null || !searchResult[0]) {
					devSearch.innerHTML = `
							<a class="navbar-search-anchor" href="https://developer.roblox.com/en-us/">Go to DevHub</a>
						`
				} else {
					devSearch.innerHTML = `
							<a class="navbar-search-anchor" href="${searchResult[0].url}">Go to "${stripTags(searchResult[0].title)}" in DevHub</a>
						`
				}
			}
			if (shouldQuick) {
				const doCheck = async () => {
					if (lastInput == searchElement.value) return;
					if (Date.now() - lastSearch > 1000) {
						lastSearch = Date.now()
						let userSearch = await get(`https://www.roblox.com/search/users/results?keyword=${searchElement.value}&maxRows=1&startIndex=0`)
						let direct = (await postRepeat("https://users.roblox.com/v1/usernames/users", {
							data: JSON.stringify({
								usernames: [searchElement.value],
								excludeBannedUsers: false
							})
						}))?.data?.[0]

						let topRes = userSearch?.UserSearchResults?.[0]
						if (topRes?.UserId || direct?.id) {
							const amount = (topRes?.UserId && direct?.id) ? 2 : 1
							let thumbnails = await get('https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=' + (amount == 2 ? (topRes?.UserId + "," + direct?.id) : (topRes?.UserId || direct?.id)) + "&size=150x150&format=Png&isCircular=false")
							if (topRes) {
								qs("img", quickSearch).src = thumbnails.data[0].imageUrl || imgNone
								qs(".user-name", quickSearch).textContent = topRes.Name
								qs(".rg-link", quickSearch).href = "https://roblox.com" + topRes.UserProfilePageUrl
							}
							qs(".text-secondary", quickSearch).style.display = 'none'
							if (direct?.id) {
								qs("img", quick2).src = (thumbnails.data[1] && thumbnails.data[1].imageUrl) || imgNone
								qs(".user-name", quick2).textContent = direct.name
								qs(".rg-link", quick2).href = "https://roblox.com/users/" + direct?.id
								let userInfo = await get('https://users.roblox.com/v1/users/' + direct?.id)
								if (userInfo.isBanned) {
									qs(".text-secondary", quick2).style.display = 'inline-flex'
									qs(".rg-link", quick2).href = `/banned-users/` + direct?.id
								}
							}
							lastInput = searchElement.value
						}
					}
				}
				doCheck()
				// setTimeout(doCheck, 1000)
			}
		}, 500, {trailing: true}))
	}
	observe(document, "navbar-search", addBar, true)
	window.onload = addBar
	setInterval(addBar, 2000)
	const allItems = [];
	const search = async (value) => {
		return new Promise((resolve, reject) => {
			value = value.toLowerCase();
			const result = [];
			if (value === '') resolve(result);
			for (const item of allItems) {
				const title = item.titleLower;
				if (title.includes(value) || value.includes(title)) {
					item.s = similarity(title, value);
					result.push(item);
				}
			}
			result.sort((a, b) => {
				return (a.s < b.s ? 1 : -1);
			});
			resolve(result);
		})
	};
	const transformMapping = (mapping) => {
		const newMapping = {};
		for (const categoryKey in mapping) {
			const category = [];
			newMapping[categoryKey] = category;
			for (const categoryItemKey in mapping[categoryKey]) {
				const item = mapping[categoryKey][categoryItemKey];
				category.push(item);
			}
		}
		return newMapping;
	};
	get('https://dk135eecbplh9.cloudfront.net/static/page_mappings.json').then(response => {
		const mapping = transformMapping(response);
		for (const categoryKey in mapping) {
			const category = mapping[categoryKey];
			for (const item of category) {
				item.category = categoryKey;
				item.titleLower = item.title.toLowerCase();
				item.url = `https://developer.roblox.com/en-us${item.url}`;
				allItems.push(item);
			}
		}
	});
	//}, 1000)
})