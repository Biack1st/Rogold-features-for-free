/*
    RoGold

    Coding and design by alexop1000 (AlexOp).
    Contact: https://rogold.me/invite

    Copyright (C) alexop1000 
    All rights reserved.
*/
const categoryNames = ["Featured", "All", "Collectibles", "Clothing", "BodyParts", "Gear", "Models", "Plugins", "Decals", "Audio", "Meshes", "Accessories", "AvatarAnimations", "CommunityCreations", "Video", "Recommended", "LayeredClothing", "Characters"]
const subcategoryNames = ["Featured", "All", "Collectibles", "Clothing", "BodyParts", "Gear", "Models", "Plugins", "Decals", "Audio", "Meshes", "Accessories", "AvatarAnimations", "CommunityCreations", "Video", "Recommended", "LayeredClothing", "Characters"]

const getTextureLocation = async (assetId) => {
    return new Promise(async (resolve, reject) => {
        let assetInfo = await get(`https://assetgame.roblox.com/asset-thumbnail-3d/json?assetId=${assetId}`)
        if (assetInfo.Final != true) {
            reject()
        }
        let modelInfo = await get(assetInfo.Url)
        if (!modelInfo) reject();
        if (typeof modelInfo.textures[0] == 'string') {
            const t = [...modelInfo.textures[0]].reduce((lastCode, char) => lastCode ^ char.charCodeAt(0), 31)
			resolve({ url: `https://t${t % 8}.rbxcdn.com/${modelInfo.textures[0]}` })
        }
        reject()
    })
}
pages.catalog = (async () => {
    setTimeout(async () => {
        let id
        try {
            id = getId(window.location.href)
        } catch { }
        if (!id) {
            return
        }
        if (!await getSetting("More Item Stats")) return;
        const productInfo = await get("https://api.roblox.com/marketplace/productinfo?assetId=" + id)
        if (!productInfo) return;
        const itemDetails = await first("#item-details")

        if (!document.querySelector("body[data-btr-page]") && !document.querySelector(".item-field-container .date-time-i18n")) {
            const createdDiv = document.createElement("div")
            createdDiv.className = "clearfix item-field-container"
            createdDiv.innerHTML = `
                <div class="font-header-1 text-subheader text-label text-overflow field-label">Created</div>
                <span class="field-content rogold">${dateFormat(productInfo.Created, "MMM DD, YYYY | hh:mm A")}</span>
            `
            itemDetails.insertBefore(createdDiv, itemDetails.querySelector("div:nth-child(6)"))
            const updatedDiv = createdDiv.cloneNode(true)
            updatedDiv.querySelector(".field-label").textContent = "Updated"
            updatedDiv.querySelector(".field-content").textContent = dateFormat(productInfo.Updated, "MMM DD, YYYY | hh:mm A")
            itemDetails.insertBefore(updatedDiv, itemDetails.querySelector("div:nth-child(7)"))
        }

        const resaleData = await get(`https://economy.roblox.com/v1/assets/${id}/resale-data`)
        if (resaleData.volumeDataPoints && resaleData.volumeDataPoints.length > 30) {
            const volumeDataPoints = resaleData.volumeDataPoints.slice(-30)
            let totalSales = 0
            let lastDate = new Date().getTime()
            for (const point of volumeDataPoints) {
                if (new Date(point.date).getTime() > lastDate - 2592000000) {
                    totalSales += point.value
                }
            }
            const salesDiv = document.createElement("div")
            salesDiv.className = "clearfix price-chart-info-container"
            salesDiv.innerHTML = `
                <div class="text-label" title="How many times this item has on average been sold the last 30 days.">Avg Daily Sales</div> 
                <div class="info-content"> 
                    <span class="text-lead info-content">${(totalSales / 30).toFixed(2)}</span> 
                </div> 
            `
            await first(".price-chart-info-container")
            document.querySelector(".price-chart-info-container:last-of-type").insertAdjacentElement("afterend", salesDiv)
        }
        let totalOwners = 0
        let deletedOwners = 0
        let cachedOwners = {}
        let hoarded = 0
        let neededRequests = Math.round(resaleData.sales / 100)
        if (resaleData.sales > 5000) return;
        progressRequest(`https://inventory.roblox.com/v2/assets/${id}/owners?sortOrder=Asc&limit=100`, neededRequests, 1, async (owners, page) => {
            if (!owners.data) return;
            totalOwners += owners.data.length
            for (const owner of owners.data) {
                if (!owner.owner) {
                    deletedOwners++
                    continue
                }
                if (!cachedOwners[owner.owner.id]) {
                    cachedOwners[owner.owner.id] = 1
                } else {
                    cachedOwners[owner.owner.id]++
                }
            }
            if (page == neededRequests) {
                for (const owner in cachedOwners) {
                    if (cachedOwners[owner] > 1) {
                        hoarded += cachedOwners[owner]
                    }
                }
                const ownersDiv = document.createElement("div")
                ownersDiv.className = "clearfix item-field-container"
                ownersDiv.innerHTML = `
                    <div class="font-header-1 text-subheader text-label text-overflow field-label">Owners</div>
                    <p class="field-content font-body text description-content wait-for-i18n-format-render"">${addCommas(Object.values(cachedOwners).length)} (${deletedOwners} deleted)</p>
                `
                itemDetails.insertBefore(ownersDiv, itemDetails.querySelector("div:nth-child(8)"))
                const hoardedDiv = document.createElement("div")
                hoardedDiv.className = "clearfix item-field-container"
                hoardedDiv.innerHTML = `
                    <div class="font-header-1 text-subheader text-label text-overflow field-label">Hoarded</div>
                    <p class="field-content font-body text description-content wait-for-i18n-format-render"">${hoarded}</p>
                `
                itemDetails.insertBefore(hoardedDiv, itemDetails.querySelector("div:nth-child(9)"))
            }
        })
    }, 0)
    console.log("[Roblox] Loaded catalog page")
    await awaitReady()
    setTimeout(async () => {
        if (window.location.href.includes("/catalog?Category") || window.location.href.split("/")[3] == "catalog") {
            if (!await getSetting("Random Accessory Finder")) return;
            const panelGroup = await first("#main-view #category-panel-group")
            const el = document.createElement('li')
            el.setAttribute('class', 'font-header-2 text-subheader panel panel-default')
            el.innerHTML = `
        <a id="category-rogold" data-target="#rogold" class="small text menu-link text-link-secondary panel-heading" data-toggle="collapse" data-parent="#category-panel-group" role="tab"> 
            <button class="category-name btn-text">RoGold</button>
        </a> 
        `
            panelGroup.insertBefore(el, panelGroup.firstChild)
            let didOpen = false
            el.getElementsByClassName("btn-text")[0].addEventListener("click", async () => {
                if (didOpen) return;
                didOpen = true
                for (const button of await find("#main-view .btn-text")) {
                    if (button.parentNode.id != "category-rogold") {
                        button.addEventListener("click", async () => {
                            window.location.reload()
                        })
                    }
                }
                document.querySelectorAll(".results-container").forEach(res => res.style.display = "none")
                $(document.getElementById("results").getElementsByTagName("ul")[0]).addClass("ng-hide")
                $(document.getElementsByClassName("pager-holder")[0]).addClass("ng-hide")
                $(document.getElementsByClassName("view-all")[0]).addClass("ng-hide")
                $(document.getElementsByClassName("line-height ng-binding")[0]).text("RoGold")
                const savedItems = []
                const categories = [0, 1, 2, 3, 4, 11, 12, 13, 17]
                const sortTypes = [1, 2, 3, 4]
                const savedCursors = {}
                let lastFill = new Date().getTime() - 5000;
                const fillSaved = async (toFill) => {
                    if (new Date().getTime() - lastFill < 5000) return;
                    lastFill = new Date().getTime()
                    console.log("Filling saved items")
                    for (const category of toFill) {
                        const sortType = sortTypes[Math.floor(Math.random() * sortTypes.length)]
                        const sub = subcategories[category] ? "&subcategory=" + subcategoryNames[category] : ""
                        const cursor = savedCursors[category] ? "&cursor=" + savedCursors[category].cursor : ""
                        let items
                        if (savedCursors[category] && savedCursors[category].cursor) {
                            items = await get(savedCursors[category].url + cursor)
                        } else {
                            items = await get(`https://catalog.roblox.com/v1/search/items?category=${category}&sortType=${sortType}&limit=100${sub}`)
                        }
                        if (!items.data || items.data.length == 0) {
                            console.warn("No items found in category " + category)
                            console.warn(items)
                            console.warn(savedCursors[category], `https://catalog.roblox.com/v1/search/items?category=${category}&sortType=${sortType}&limit=100${sub}`)
                            if (savedCursors[category]) {
                                savedCursors[category] = null
                            }
                            continue
                        }
                        const filledItems = []
                        for (const item of items.data) {
                            const thumbnailType = item.itemType == "Bundle" ? "BundleThumbnail" : item.itemType
                            filledItems.push({
                                id: item.id,
                                itemType: item.itemType,
                                key: item.itemType + "_" + item.id,
                                thumbnailType: thumbnailType
                            })
                        }
                        const itemInfos = await postRepeat("https://catalog.roblox.com/v1/catalog/items/details", {
                            headers: { "Content-Type": "application/json", "X-CSRF-Token": document.getElementsByName('csrf-token')[0].getAttribute('data-token') },
                            data: JSON.stringify({
                                "items": filledItems
                            }),
                            xsrf: true
                        })
                        for (const itemInfo of itemInfos.data) {
                            savedItems.push(itemInfo)
                        }
                        savedCursors[category] = { url: `https://catalog.roblox.com/v1/search/items?category=${category}&sortType=${sortType}&limit=100${sub}`, cursor: items.nextPageCursor }
                    }
                    console.log(savedItems.length)
                    console.log("Filled saved items")
                    savedItems.sort(() => Math.random() - 0.5)
                }
                let chosenFilter = "Any"
                const searchRandom = async (amount, rec = 1) => {
                    if (rec > 3) return ["", ""];
                    const items = []
                    const thumbnails = []
                    if (savedItems.length < amount) {
                        await fillSaved(categories)
                    }
                    let wasChosen = chosenFilter
                    for (const randomItem of savedItems) {
                        if (items.length >= amount) break;
                        if (!randomItem) continue;
                        if (wasChosen != "Any") {
                            const price = randomItem.lowestPrice || randomItem.price
                            if (wasChosen == "Free" && price > 0) {
                                continue
                            }
                            if (wasChosen == "Cheap" && price >= 5000) {
                                continue
                            }
                            if (wasChosen == "Expensive" && price < 5000) {
                                continue
                            }
                        }
                        const thumbnailType = randomItem.itemType == "Bundle" ? "BundleThumbnail" : randomItem.itemType
                        items.push(randomItem)
                        thumbnails.push({
                            format: null,
                            requestId: randomItem.id + ":undefined:" + thumbnailType + ":150x150:null:regular",
                            size: "150x150",
                            targetId: randomItem.id,
                            type: thumbnailType
                        })
                        savedItems.splice(savedItems.indexOf(randomItem), 1)
                    }
                    if (wasChosen == "Expensive" && items.length < amount) {
                        await fillSaved([2])
                        const random = await searchRandom(amount, rec + 1)
                        return random
                    } else if (wasChosen == "Cheap" && items.length < amount) {
                        await fillSaved(categories)
                        const random = await searchRandom(amount, rec + 1)
                        return random
                    }
                    const thumbnailDatas = await postRepeat("https://thumbnails.roblox.com/v1/batch", {
                        headers: { "Content-Type": "application/json", "X-CSRF-Token": document.getElementsByName('csrf-token')[0].getAttribute('data-token') },
                        data: JSON.stringify(thumbnails),
                        xsrf: true
                    })
                    return [items, thumbnailDatas.data]
                }
                const radAHolder = document.createElement("div")
                radAHolder.setAttribute('class', 'section-content notifications-section')
                radAHolder.setAttribute("style", 'background-color:#262928;')
                radAHolder.innerHTML = `
                <div class="security-2svsetting-label btn-toggle-label"> 
                    <div class="btn-toggle-label" id="Show RAP-name">Random Accessory Finder</div> 
                    <div class="rbx-divider" style="margin-top: 15px;margin-bottom: 12px;"></div> 
                    <div class="text-description">
                        <div class="rbx-select-group select-group" style="margin-top: 5px;float: right;width: 100px;margin-left: 2px;">
                            <span class="icon-arrow icon-down-16x16"></span>
                            <select class="input-field rbx-select select-option ng-pristine ng-valid ng-scope ng-not-empty ng-touched" id="catalog-filter">
                                <option value="Any" selected="selected">Any</option>
                                <option value="Free">Free</option>
                                <option value="Cheap">Cheap</option>
                                <option value="Expensive">Expensive</option>
                            </select>
                            <span class="icon-arrow icon-down-16x16"></span>
                        </div>
                        <input max="20" min="1" type="number" id="generate-amount" class="form-control input-field ng-pristine ng-valid ng-empty ng-touched" value="10" style="margin-top: 5px;
                        float: right;
                        width: 100px;
                        margin-left: 2px;">
                        <button id="radA" type="button" class="btn-full-width btn-common-play-game-lg btn-primary-md btn-min-width" 
                            style="width: 16%;min-width: 16%;padding:2px;margin-top:5px;background-color:#262928;border-color:#3e4442;float:right;">
                            <span class="icon-common-play" style="background-size: 53px auto;width: 26px;height: 32px;background-image:url('https://images.rbxcdn.com/a057a8bc94e7ab78517765ddb4e77384-generic_dark_11062018.svg');background-repeat:no-repeat;background-position: 0px -1773px;"></span>
                        </button>
                        <ul class="hlist item-cards-stackable" id="rg-cards">
                            <div class="loading modal-processing" id="loader">
                                <img class=loading-default src=https://images.rbxcdn.com/4bed93c91f909002b1f17f05c0ce13d1.gif alt=Processing...>
                            </div>
                            <span class="wait-for-i18n-format-render" id="search-loader">Finding Random Accessories...</span>
                        </ul>
                    </div>
                </div>
            `
                document.getElementsByClassName('catalog-results')[0].appendChild(radAHolder)
                radAHolder.getElementsByClassName('rbx-select')[0].addEventListener('change', (e) => {
                    chosenFilter = e.target.value
                })
                const createRA = async (info, thumbnailInfo) => {
                    const thumbnail = thumbnailInfo[thumbnailInfo.findIndex(x => x.targetId === info.id)]
                    const item = document.createElement('li')
                    item.setAttribute('class', 'list-item item-card recommended-item')
                    item.style.marginLeft = "5px"
                    item.style.overflow = "hidden"
                    item.innerHTML = `
                <div class="item-card-container recommended-item-link"> <a data-test="Recommended-test"
                    class="item-card-link" href="${item.itemType == "Bundle" ? ("https://www.roblox.com/bundles/" + info.id) : ("https://www.roblox.com/catalog/" + info.id)}" style="display:grid;color:white;">
                    <thumbnail-2d class="item-card-thumb-container" thumbnail-type="item.thumbnail.type"
                    thumbnail-target-id="item.id">
                    <span class="thumbnail-2d-container" thumbnail-type="Asset"
                        thumbnail-target-id="${info.id}">
                        <img image-load="" alt="" title="" class="ng-scope ng-isolate-scope"
                        src="${thumbnail.imageUrl}"> 
                    </span> </thumbnail-2d>
                    <div class="item-card-name recommended-name" title="${stripTags(info.name)}">
                    <span>${stripTags(info.name)}</span>
                    </div>
                </a>
                <div class="text-overflow item-card-creator recommended-creator" style="display:inline-flex;"> <span class="ng-binding">By <a
                        target="_self" class="creator-name text-link"
                        href="
                ${info.creatorType == "Group" && ("https://www.roblox.com/groups/" + info.creatorTargetId) || "https://www.roblox.com/users/" + info.creatorTargetId}">${stripTags(info.creatorName)}</a></span> </div>
                <div class="text-overflow item-card-price"> <span class="icon-robux-16x16"></span> <span
                    class="text-robux-tile">${info.lowestPrice ? addCommas(info.lowestPrice) : (info.price ? addCommas(info.price) : (info.priceStatus || 0))}</span> <span class="text-robux-tile"></span>
                    <h4 class="text text-label">
                    </h4>
                </div>
                </div>
                `
                    document.querySelector("#rg-cards").appendChild(item)
                    if (info.itemRestrictions[0] == "LimitedUnique") {
                        let limited = document.createElement('div')
                        limited.setAttribute('class', 'asset-restriction-icon')
                        limited.setAttribute('style', 'top:87.5%;right: 19.5%;position:absolute;')
                        limited.innerHTML = `
                            <span class="rbx-tooltip" data-toggle="tooltip" title="" data-original-title="Serialized limited release, resellable..">
                                <span class="icon-label icon-limited-unique-label"></span>
                            </span>
                        `
                        item.getElementsByClassName('item-card-thumb-container')[0].prepend(limited)
                    } else if (info.itemRestrictions[0] == "Limited") {
                        let limited = document.createElement('div')
                        limited.setAttribute('class', 'asset-restriction-icon')
                        limited.setAttribute('style', 'top:87.5%;right: 19.5%;position:absolute;')
                        limited.innerHTML = `
                            <span class="rbx-tooltip" data-toggle="tooltip" title="" data-original-title="Limited">
                                <span class="icon-label icon-limited-label"></span>
                            </span>
                        `
                        item.getElementsByClassName('item-card-thumb-container')[0].prepend(limited)
                    }
                }
                let isSearching = false
                const doRandom = async (amount) => {
                    document.getElementById("loader").style.display = "block"
                    document.getElementById("search-loader").style.display = "block"
                    for (const item of document.querySelectorAll("#rg-cards li")) {
                        item.remove()
                    }
                    const [itemInfo, thumbnailInfo] = await searchRandom(amount)
                    console.log(itemInfo)
                    document.getElementById("loader").style.display = "none"
                    document.getElementById("search-loader").style.display = "none"
                    if (itemInfo.length > 0) {
                        itemInfo.forEach(info => {
                            createRA(info, thumbnailInfo)
                        })
                    }
                }
                document.getElementById("radA").addEventListener("click", async () => {
                    if (!isSearching) {
                        isSearching = true
                        try {
                            await doRandom(document.getElementById("generate-amount").value)
                        } catch (e) {
                            console.warn(e)
                        }
                        isSearching = false
                    }
                })
                isSearching = true
                await doRandom(5)
                isSearching = false
            })
        }
    }, 0)
    console.log("[Random Accessories] Loaded")
    let hasExperiments = await checkExperiments()
    if (!hasExperiments) {
        return
    }
    const doCatalog = await getSetting('Original Finder')
    if (!doCatalog) {
        return
    }
    const assetType = document.getElementById('type-content')?.textContent
    if (assetType != "Shirt" && assetType != "T-Shirt" && assetType != "Pants") return;
    let level = 1
    let nameMatch = 1
    let imageMatch = 11
    let id = getId(window.location.href)
    if (!id) {
        return
    }
    const emReg = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g
    let primaryTexture = await getTextureLocation(id).catch(console.warn)
    const doSearch = async () => {
        return new Promise(async (resolve, reject) => {
            let searchName = removeDublicates(document.querySelector("#item-container")?.getAttribute("data-item-name"))
            console.log(`Searching for ${searchName}`);
            const searchCategory = assetType || "Shirts"
            let similars = []
            let startTime = Date.now()
            progressRequest(`https://catalog.roblox.com/v1/search/items?category=Clothing&keyword=${searchName}&limit=100&subcategory=${searchCategory}`, level * 2, (level * 2) - 1, async (search, page) => {
                if (!search?.data) {
                    resolve([])
                }
                let searchArray = []
                for (const result of search.data) {
                    searchArray.push({
                        id: result.id,
                        itemType: "Asset",
                        key: "Asset_" + result.id,
                        thumbnailType: "Asset"
                    })
                }
                let searchInfo = await postRepeat("https://catalog.roblox.com/v1/catalog/items/details", {
                    headers: { "Content-Type": "application/json", "X-CSRF-Token": document.getElementsByName('csrf-token')[0].getAttribute('data-token') },
                    data: JSON.stringify({
                        "items": searchArray
                    }),
                    xsrf: true
                })
                for (const searchResult of searchInfo?.data) {
                    if (!searchResult?.name) continue;
                    try {
                        let cleanSearchName = removeDublicates(searchResult.name.replace(emReg, ''))
                        let nameDifference = similarity(searchName?.replace(emReg, ""), cleanSearchName)
                        if (nameDifference >= nameMatch) { // Same asset if 1??
                            let imageTexture = await getTextureLocation(searchResult.id).catch(console.warn)
                            if (imageTexture && imageTexture.url) {
                                resemble(primaryTexture.url)
                                    .compareTo(imageTexture.url)
                                    //.ignoreColors()
                                    .onComplete(function (data) {
                                        if (data.rawMisMatchPercentage < imageMatch) {
                                            similars.push({
                                                id: searchResult.id,
                                                price: searchResult.price,
                                                creatorName: searchResult.creatorName,
                                                creatorType: searchResult.creatorType
                                            })
                                        }
                                    });
                            }
                        }// } else if(nameDifference == 1) {
                        //     similars.push({
                        //         id: searchResult.id,
                        //         price: searchResult.price,
                        //         creatorName: searchResult.creatorName,
                        //         creatorType: searchResult.creatorType
                        //     })
                        // }
                    } catch (e) {
                        console.warn(e)
                    }
                }
                console.log("Did all searches at page " + page);
                if (page == (level * 2) || page == null) {
                    console.log(`search took ${(Date.now() - startTime) / 1000} seconds`);
                    similars.sort((a, b) => a.id - b.id)
                    console.log(similars);
                    console.log(similars[0]);
                    resolve(similars)
                }
            })
        })
    }
    const svgPath = browserTop.runtime.getURL('/svg/icons.svg')
    let resultsCategory
    const addResults = (data, images, i) => {
        if (!resultsCategory) {
            const resContain = document.getElementById('recommendations-container')
            resultsCategory = document.createElement('div')
            resultsCategory.innerHTML = `
            <div class="current-items">
                <div class="container-list layer recommendations-container">
                <div class="container-header recommendations-header">
                    <h3> <span>RoGold Original Search</span><br>
                    <span class="text-secondary" id="search-level">Level ${level} Search</span></h3>
                </div>
                <div class="recommended-items-slider">
                    <ul class="hlist item-cards recommended-items" id="slider-holder-rg">
                        <button class="btn-primary-md" id="perform-search">Search</button>
                    </ul>
                </div>
                </div>
            </div>
            `
            const matchCategory = document.createElement('div')
            matchCategory.setAttribute('class', 'current-items')
            matchCategory.innerHTML = `
                <div class="container-list layer recommendations-container">
                <div class="container-header recommendations-header">
                    <h3> <span>Match Config</span><br>
                </div>
                <div class="recommended-items-slider">
                    <ul class="hlist item-cards recommended-items" id="config-holder-rg">
                        <span class="wait-for-i18n-format-render">Name Match</span><br>
                        <span class="text-secondary">Changes how close a name has to match with the current clothing item.</span>
                        <div class="player">
                            <i class="fa fa-volume-down"></i>
                            <div id="slider1" class="volume"></div>
                            <i class="fa fa-volume-up"></i>
                        </div>
                        <span class="text-secondary" id="name-match">Value: ${nameMatch * 100}%</span><br>
                        <span class="wait-for-i18n-format-render">Image Match</span><br>
                        <span class="text-secondary">Changes how close the texture of clothing has to be to the one you are on.</span>
                        <div class="player">
                            <i class="fa fa-volume-down"></i>
                            <div id="slider2" class="volume"></div>
                            <i class="fa fa-volume-up"></i>
                        </div>
                        <span class="text-secondary" id="image-match">Value: ${100 - imageMatch}%</span><br>
                    </ul>
                </div>
                </div>
            `
            resContain.insertBefore(resultsCategory, resContain.getElementsByTagName('recommendations')[0])
            resContain.insertBefore(matchCategory, resContain.getElementsByTagName('recommendations')[0])
            try {
                $("#slider1").slider({
                    min: 30,
                    max: 100,
                    value: 100,
                    range: "min",
                    slide: function (event, ui) {
                        nameMatch = ui.value / 100
                        document.getElementById('name-match').innerText = `Value: ${ui.value}%`
                    }
                });
                $("#slider2").slider({
                    min: 0,
                    max: 90,
                    value: 89,
                    range: "min",
                    slide: function (event, ui) {
                        imageMatch = 100 - ui.value
                        document.getElementById('image-match').innerText = `Value: ${ui.value}%`
                    }
                });
            } catch (e) {
                console.warn(e)
            }
            document.getElementById('perform-search').addEventListener('click', () => {
                document.getElementById('perform-search').remove()
                searchWithLevel()
            })
        } else {
            document.getElementById('search-level').innerText = `Level ${level} Search`
        }
        if (!data) return;
        if (document.getElementById('search-loader')) {
            document.getElementById('search-loader').remove();
        }
        let imageUrl = "https://tr.rbxcdn.com/b977c29b035a1741958c3a7bbfc26ab9/150/150/Shirt/Png"
        if (images) {
            for (const image of images) {
                if (image.targetId == data.id) imageUrl = image.imageUrl;
            }
        }
        const item = document.createElement('li')
        item.setAttribute('class', 'list-item item-card recommended-item')
        item.innerHTML = `
        <div class="item-card-container recommended-item-link"> <a data-test="Recommended-test"
            class="item-card-link" href="https://www.roblox.com/catalog/${data.id}">
            <thumbnail-2d class="item-card-thumb-container" thumbnail-type="item.thumbnail.type"
            thumbnail-target-id="item.id">
            <span class="thumbnail-2d-container" thumbnail-type="Asset"
                thumbnail-target-id="${data.id}">
                <img image-load="" alt="" title="" class="ng-scope ng-isolate-scope"
                src="${imageUrl}"> 
            </span> </thumbnail-2d>
            <div class="item-card-name recommended-name" title="${stripTags(data.name)}">
            <span>${stripTags(data.name)}</span>
            </div>
        </a>
        <div class="text-overflow item-card-creator recommended-creator"> <span class="ng-binding">By <a
                target="_self" class="creator-name text-link"
                href="
        ${data.creatorType == "Group" && ("https://www.roblox.com/groups/" + data.creatorTargetId) || "https://www.roblox.com/users/" + data.creatorTargetId}">${stripTags(data.creatorName)}</a></span> </div>
        <div class="text-overflow item-card-price"> <span class="icon-robux-16x16"></span> <span
            class="text-robux-tile">${data.price}</span> <span class="text-robux-tile"></span>
            <h4 class="text text-label">
            </h4>
        </div>
        </div>
        `
        document.getElementById('slider-holder-rg').appendChild(item)
        if (i == 0 && data.id <= getId(window.location.href)) {
            const oldDiv = document.createElement('div')
            oldDiv.setAttribute('style', `
            background-image: url(${svgPath});
            background-repeat: no-repeat;
            background-size: auto;
            width: 28px;
            height: 28px;
            display: inline-block;
            vertical-align: middle;
            position: absolute;
            top: 5px;
            left: 5px;
            `)
            let cardLink = item.getElementsByClassName('item-card-container')[0].getElementsByClassName('item-card-link')[0]
            cardLink.insertBefore(oldDiv, cardLink.getElementsByTagName('thumbnail-2d')[0])
        }
    }
    const searchWithLevel = async () => {
        if (document.getElementById('search-next-button')) {
            document.getElementById('search-next-button').remove()
        }
        if (resultsCategory) {
            document.getElementById('slider-holder-rg').innerHTML = `
            <div class="loading modal-processing" id="loader">
                <img class=loading-default src=https://images.rbxcdn.com/4bed93c91f909002b1f17f05c0ce13d1.gif alt=Processing...>
            </div>
            <span class="wait-for-i18n-format-render" id="search-loader">Searching... This might take some time.</span>
            `
        }

        doSearch().then(async gotten => {
            let searchArray = []
            let idArray = []
            for (result of gotten) {
                idArray.push(result.id)
                searchArray.push({
                    id: result.id,
                    itemType: "Asset",
                    key: "Asset_" + result.id,
                    thumbnailType: "Asset"
                })
            }
            const details = await postRepeat("https://catalog.roblox.com/v1/catalog/items/details", {
                headers: { "Content-Type": "application/json", "X-CSRF-Token": document.getElementsByName('csrf-token')[0].getAttribute('data-token') },
                data: JSON.stringify({
                    "items": searchArray
                }),
                xsrf: true
            })
            const images = await splitLimit(idArray, async (ids) => {
                return new Promise(async resolve => {
                    const res = await get(`https://thumbnails.roblox.com/v1/assets?assetIds=${ids}&size=140x140&format=Png&isCircular=false`)
                    resolve(res.data)
                })
            }, ",", 100)
            let i = 0
            for (const detail of details.data) {
                addResults(detail, images, i)
                i++
            }
            if (details.data.length == 0) {
                document.getElementById('slider-holder-rg').innerHTML = `
                <span class="wait-for-i18n-format-render" id="search-loader">No results found. Try changing match percentages.</span><br>
                <button class="btn-primary-md" id="perform-search">Retry</button>`
                document.getElementById('perform-search').addEventListener('click', () => {
                    document.getElementById('perform-search').remove()
                    searchWithLevel()
                })
            } else {
                if (level < 3) {
                    document.getElementById('loader').remove()
                    const nextLevel = document.createElement('button')
                    nextLevel.setAttribute('class', 'btn-primary-md')
                    nextLevel.setAttribute('style', 'height: 40px;width: -webkit-fill-available;')
                    nextLevel.setAttribute('id', 'search-next-button')
                    nextLevel.innerText = `Next Search Level`
                    document.getElementById('slider-holder-rg').appendChild(nextLevel)
                    nextLevel.addEventListener('click', async () => {
                        level++
                        searchWithLevel()
                    })
                }
            }
        })
    }
    const addButton = async () => {
        addResults()
    }
    window.onload = addButton
    setTimeout(addButton, 1000);
})
