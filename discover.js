/*
    RoGold
    Coding and design by Alrovi Aps.
    Contact: contact@alrovi.com
    Copyright (C) Alrovi Aps
    All rights reserved.
*/

pages.discover = (async () => {
	if (!(await getSetting("Trending Sort"))) return;
	const topic = document.createElement('div');
	topic.className = "games-list-container is-windows"
	topic.innerHTML = `
	<a>
		<div data-testid="game-lists-game-container-header" class="container-header games-filter-changer">
			<h3>RTrack Trending 🚀</h3>
		</div>
	</a>
	<div class="horizontal-scroller games-list">
		<div data-testid="game-carousel-carousel-container" class="clearfix horizontal-scroll-window">
			<div class="horizontally-scrollable" style="left: 0px;">
				<ul class="hlist games game-cards game-tile-list"></ul>
			</div>
			<div data-testid="game-carousel-scroll-bar" class="scroller prev disabled" role="button" tabindex="0">
				<div class="arrow"><span class="icon-games-carousel-left"></span></div>
				<div class="spacer"></div>
			</div>
			<div data-testid="game-carousel-scroll-bar" class="scroller next" role="button" tabindex="0">
				<div class="arrow"><span class="icon-games-carousel-right"></span></div>
				<div class="spacer"></div>
			</div>
		</div>
	</div>
	`;
	(await find(".games-list-container", 6)).after(topic)
	const games = await get("https://rtrack.cloud/Community/RTrackSort.php")
	const images = await get(`https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${games.data.map(info => info.PlaceId).join(",")}&size=150x150&format=Png&isCircular=false`)
	for (const detail of games.data) {
		const game = document.createElement("li")
		game.className = "list-item game-card game-tile"
		game.title = stripTags(detail.name)
		game.innerHTML = `
		<div class="game-card-container">
			<a class="game-card-link" href="${detail.href}" id="${detail.UniverseId}">
				<div class="game-card-thumb-container">
					<span class="thumbnail-2d-container game-card-thumb">
						<img class="" src="${images?.data?.find(el => el.targetId == detail.PlaceId)?.imageUrl}" alt="${stripTags(detail.name)}" title="${stripTags(detail.name)}">
					</span>
				</div>
				<div class="game-card-name game-name-title" title="${stripTags(detail.name)}">${stripTags(detail.name)}</div>
				<div class="game-card-info" data-testid="game-tile-stats">
					<span class="info-label icon-votes-gray"></span>
					<span class="info-label vote-percentage-label">${Number(((detail.totalUpVotes / (detail.totalUpVotes + detail.totalDownVotes)) * 100) || 0).toFixed(0)}%</span>
					<span class="info-label icon-playing-counts-gray"></span>
					<span class="info-label playing-counts-label">${NumberFormatting.abbreviatedFormat(detail.players)}</span>
				</div>
			</a>
		</div>
		`
		qs(".game-tile-list", topic).appendChild(game)
	}
	qs(".scroller.next", topic).addEventListener("click", async e => {
		const container = qs(".horizontally-scrollable", topic)
		const containerWidth = qs(".horizontal-scroll-window", topic).offsetWidth
		const scrollWidth = container.scrollWidth
		const scrollLeft = Number(container.style.left.replace("px", ""))
		if (scrollLeft + containerWidth < scrollWidth) {
			container.style.left = scrollLeft - containerWidth + "px"
		}
	})
	qs(".scroller.prev", topic).addEventListener("click", async e => {
		const container = qs(".horizontally-scrollable", topic)
		const containerWidth = qs(".horizontal-scroll-window", topic).offsetWidth
		const scrollWidth = container.scrollWidth
		const scrollLeft = Number(container.style.left.replace("px", ""))
		if (scrollLeft + containerWidth < scrollWidth) {
			container.style.left = scrollLeft + containerWidth + "px"
		}
	})
})