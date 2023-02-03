/*
    RoGold
    Coding and design by Alrovi Aps.
    Contact: contact@alrovi.com
    Copyright (C) Alrovi Aps
    All rights reserved.
*/
pages.avatar = async () => {
    if (!(await getSetting("Multiple Hair"))) return;
    const multiHairBtn = document.createElement("button")
    multiHairBtn.className = "btn-secondary-md group-form-button"
    multiHairBtn.style.background = "green"
    multiHairBtn.style.borderColor = "green"
    multiHairBtn.innerHTML = `<span class="btn-text" style="font-weight:900">Multiple Hair</span>`;
    if (!isMobile()) {
        (await first(".catalog-header")).append(multiHairBtn)
    } else {
        (await first(".part1 > div")).before(multiHairBtn)
    }
    const holder = document.createElement("div")
    holder.className = "ng-hide"
    holder.style = `max-width: 540px; display: flex; right: 10%; min-width: 280px; border-radius: 8px; background-color: rgb(25, 27, 29); width: auto; height: 19%; position: absolute;
    filter: drop-shadow(black 2px 4px 6px); z-index: 10; flex-direction: column; justify-content: center; align-items: center; min-height: 290px;`
    holder.innerHTML = `
    <span style="padding: 5px;">This feature may break at any time due to Roblox api changes.</span>
    <div style="
        width: 93%;
        height: 86%;
        overflow-y: scroll;
    " class="hair-holder hlist item-cards-stackable"></div>
    `
    multiHairBtn.after(holder)
    multiHairBtn.onclick = () => {
        holder.classList.toggle("ng-hide")
    }
    const hairHolder = qs(".hair-holder", holder)
    const userId = (await GetUserInfo())?.userId
    let currentAvatar = await get("https://avatar.roblox.com/v1/avatar")
    const getHairs = (async (cursor = "") => {
        return new Promise(async resolve => {
            const request = (await get(`https://inventory.roblox.com/v2/users/${userId}/inventory?assetTypes=HairAccessory&cursor=${cursor}&limit=100&sortOrder=Desc`))
            if (!request?.data) resolve([])
            let data = request.data
            if (request.nextPageCursor) {
                data = [...data, ...(await getHairs(request.nextPageCursor))]
            }
            resolve(data)
        })
    })
    const hairs = await getHairs()
    const thumbnails = await splitLimit(hairs, async (batch) => {
        return Promise.resolve((await postRepeat(`https://thumbnails.roblox.com/v1/batch`, {data: JSON.stringify(
            batch.map(hair => ({
                    requestId: hair.assetId+":undefined:Asset:150x150:null:regular",
                    size: "150x150",
                    targetId: hair.assetId,
                    type: "Asset",
                }))
        )}))?.data)
    },null,100) 
    let equippedHair = []
    const pager = new Pager({ useBTR: false })
    const [collectPages] = pager.constructPages(hairs, 8)
    pager.setMax()
    let loading = false
    pager.onset = (newPage) => {
        if (loading) return;
        loading = true
        hairHolder.clearChildren()
        
        const page = collectPages[newPage - 1]
        for (const item of page) {
            const itemCard =document.createElement("li")
            itemCard.className = "list-item item-card six-colunm"
            itemCard.style.maxWidth = "119px"
            itemCard.style.width = "30%"
            itemCard.style.maxHeight = "140px"
            itemCard.style.marginBottom = "20px"
            if (currentAvatar?.assets?.find(e => e.id == item.assetId)) {
                equippedHair.push(item.assetId)
            }
            itemCard.innerHTML = `
            <div avatar-item-card="">
                <div class="item-card-container remove-panel">
                    <div class="item-card-link">
                        <a class="item-card-thumb-container" data-item-name="Hair" style="max-width:114px;max-height:114px;">
                            <thumbnail-2d class="item-card-thumb">
                                <span class="thumbnail-2d-container" thumbnail-type="Asset">
                                    <img image-load="" alt="" title="" src="${thumbnails?.find(e => e.targetId == item.assetId)?.imageUrl}">
                                </span>
                            </thumbnail-2d>
                        </a>
                    </div>
                    <div class="item-card-caption" style="width:100%"> 
                        <div class="item-card-equipped ${equippedHair.find(e => e == item.assetId) ? "" : "ng-hide"}" style="width: 114px;height: 114px;left: 12px;" data-item-status="equipped"> 
                            <div class="item-card-equipped-label"></div>
                            <span class="icon-check-selection"></span> 
                        </div> 
                        <a class="item-card-name-link" style="width: 100%;height: 30%;overflow: hidden;">
                            <div title="${item.name}" class="text-overflow item-card-name ng-binding">${item.name}</div> 
                        </a>
                    </div> 
                </div>
            </div> 
            `
            hairHolder.append(itemCard)
            itemCard.addEventListener("click", debounce(async () => {
                if (equippedHair.length == 10) return;
                if (equippedHair.includes(item.assetId)) {
                    equippedHair = equippedHair.filter(e => e != item.assetId)
                    itemCard.querySelector(".item-card-equipped").classList.add("ng-hide")
                } else {
                    equippedHair.push(item.assetId)
                    itemCard.querySelector(".item-card-equipped").classList.remove("ng-hide")
                }
                const updatedAvatar = await postRepeat("https://avatar.roblox.com/v2/avatar/set-wearing-assets", {data: JSON.stringify({
                    assets: currentAvatar?.assets.map(e => {
                        if (e.assetType.name != "HairAccessory") return {
                            assetType: e.assetType,
                            currentVersionId: e.currentVersionId,
                            id: e.id,
                            name: e.name,
                            meta: e.meta
                        }
                    }).concat(equippedHair.map(e => ({
                        id: e,
                        name: currentAvatar?.assets.find(e => e.assetId == e)?.name
                    }))).filter(n => n)
                })})
                if (!updatedAvatar?.success) {
                    itemCard.querySelector(".item-card-equipped").classList.add("ng-hide")
                } else {
                    currentAvatar = await get("https://avatar.roblox.com/v1/avatar")
                }
            }, 500, true))
        }
        loading = false
    }
    pager.onset(1)
    holder.appendChild(pager.pager)
}