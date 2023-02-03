/*
    RoGold
    Coding and design by Alrovi Aps.
    Contact: contact@alrovi.com
    Copyright (C) Alrovi Aps
    All rights reserved.
*/

pages.outfitcopy = async () => {
    const split = window.location.href.split('/')[4]
    if (!split || split == "") {
        let mainContent = await first("#container-main .content");
        (await first(".request-error-page-content")).remove()
        mainContent.style = "display: flex;justify-content: center;flex-direction: row;flex-wrap: wrap;"
        mainContent.innerHTML = `
        <h1 style="width:100%;text-align:center;">Find User</h1>
        <input class="form-control input-field" style="width:auto;" placeholder="Enter username or userId">
            <button class="btn-control-sm" style="margin-left:5px;" id="search">Search</button>
        </input>`
        let search = await first("#search")
        search.addEventListener('click', async () => {
            let input = await first("#container-main .content input")
            let username = input.value
            window.location.href = `/outfit-copier/${username}`
        })
        return
    }
	let userId
	try {
		userId = Number(split)
	} catch (error) {
		console.warn(error)
	}
    console.log("[%cRoGold%c] Loading outfit copier for userId: %c" + userId, "color: #FFD700", "color: #FFFFFF", "color: #068c06");
	if (!userId || isNaN(userId)) {
		const name = split
		userId = (await postRepeat("https://users.roblox.com/v1/usernames/users", {
            data: JSON.stringify({
                usernames: [name],
                excludeBannedUsers: false
            })
        }))?.data?.[0]?.id
        if (!userId) return
        window.location.href = window.location.href.replace(split, "") + userId
        return
	}
	if (!userId) return;
    
	const view = await getSetting('Outfit Copier')
	if (!view) {
		return
	}
	const mainContent = await first("#container-main .content")
	mainContent.querySelector('.request-error-page-content').remove()
	mainContent.innerHTML = `<div ng-show="loading" loading-animated="" id="loader"><span class="spinner spinner-default"></span> </div>`
	let userInfo = await get('https://users.roblox.com/v1/users/' + userId)
    const outfitInfo = await get(`https://avatar.roblox.com/v1/users/${userId}/outfits?itemsPerPage=100`)
    const thumbnails = await postRepeat(`https://thumbnails.roblox.com/v1/batch`, {
        data: JSON.stringify(outfitInfo.data?.map(outfit => {
            return {
                targetId: outfit.id,
                size: "150x150",
                type: "Outfit"
            }
        }))
    })
    mainContent.innerHTML = `
    <div avatar-tab-content="" class="tab-content">
        <div class="tab-pane ng-scope active" id="costumes">
            <div avatar-items=""><div class="items-list avatar-item-list">
                <div class="container-header"><h1>${stripTags(userInfo.name)}'s Outfits</h1></div>
                <ul class="hlist item-cards-stackable">
                    ${thumbnails.data?.map(thumb => {
                        const target = outfitInfo.data?.find(outfit => outfit.id == thumb.targetId)
                        return `
                        <li class="list-item item-card ng-scope six-column" style="width: 133.5px;height: 188px;" id=${target?.id}>
                            <div avatar-item-card="">
                                <div class="item-card-container remove-panel outfit-card">
                                    <div class="item-card-link">
                                        <a class="item-card-thumb-container">
                                            <thumbnail-2d class="item-card-thumb ng-isolate-scope">
                                                <span class="thumbnail-2d-container">
                                                    <img image-load="" alt="" title="" class="ng-scope ng-isolate-scope" src="${thumb.imageUrl}">
                                                </span>
                                            </thumbnail-2d>
                                        </a> 
                                    </div> 
                                    <div class="item-card-caption">
                                        <a class="item-card-name-link">
                                            <div title="${stripTags(target?.name)}" class="text-overflow item-card-name ng-binding">${stripTags(target?.name)}</div>
                                        </a> 
                                    </div>
                                </div>
                            </div> 
                        </li>
                        `
                    })?.join("")}
                </ul> 
            </div> 
            <div ng-show="loading" loading-animated="" class="ng-hide">
                <span class="spinner spinner-default"></span> 
            </div> 
            <div class="col-xs-12 section-content-off ng-hide"> 
                <div>This user does not have any outfits!</div>
            </div>
        </div>
    </div>
    <div class="remove-panel section-content top-section ng-hide" style="">
        <div class="btn-control-sm" id="back">Back</div>
        <div class="border-bottom item-name-container" style="margin-bottom: 15px;">
            <h2>Beautiful Hair for Beautiful People</h2> 
        </div>
        <div class="item-thumbnail-container " style="display: flex">
            <div id="AssetThumbnail" class="asset-thumb-container thumbnail-holder thumbnail-Large" style="    display: flex;height: fit-content;flex-wrap: wrap;justify-content: center;flex-direction: column;">
            <span class="thumbnail-span"><img class="" src="https://tr.rbxcdn.com/631de650a96e6b4d3893ca86ad3a33d3/420/420/Hat/Png"></span> 
            <div class="btn-control-sm" id="buy-outfit" style="background-color: #4CAF50 !important;color: rgba(255, 255, 255, 1) !important;cursor: pointer !important;
                            display: inline-block !important;height: auto !important;text-align: center !important;white-space: nowrap !important;
                            vertical-align: middle !important;font-size: 16px !important;line-height: 100% !important;background-image: none !important;
                            border-radius: 8px !important;border-width: 1px !important;border-style: solid !important;border-color: #4CAF50 !important;
                            border-image: initial !important;padding: 9px !important;">Copy Outfit</div>   
        </div>
            <ul class="hlist item-cards" style="display: flex;flex-wrap:wrap;"></ul>
        </div>
    </div>
    `
    let selectedInfo
    for (const outfit of document.querySelectorAll(".list-item.item-card")) {
        outfit.addEventListener('click', async () => {
            document.querySelector(".tab-pane").classList.remove("active")
            const outfitDetails = await get(`https://avatar.roblox.com/v1/outfits/${outfit.id}/details`)
            console.log(outfitDetails)
            selectedInfo = outfitDetails
            const infoHolder = document.querySelector(".section-content")
            infoHolder.classList.remove("ng-hide")
            infoHolder.querySelector(".item-name-container h2").textContent = outfitDetails.name
            infoHolder.querySelector(".item-thumbnail-container img").src = outfit.querySelector("img").src
            const images = await get(`https://thumbnails.roblox.com/v1/assets?assetIds=${outfitDetails.assets?.map(o => o.id).join(",")}&size=420x420&format=Png&isCircular=false`)
            infoHolder.querySelector(".hlist.item-cards").innerHTML = outfitDetails.assets?.map(outfitData => {
                return `
                <li class="list-item item-card ng-scope six-column" style="width: 133.5px;height: 188px;" id=${outfitData.id}>
                    <div avatar-item-card="">
                        <div class="item-card-container remove-panel outfit-card">
                            <div class="item-card-link">
                                <a class="item-card-thumb-container" href="/catalog/${outfitData.id}">
                                    <thumbnail-2d class="item-card-thumb ng-isolate-scope">
                                        <span class="thumbnail-2d-container">
                                            <img image-load="" alt="" title="" class="ng-scope ng-isolate-scope" src="${images?.data?.find(e => e.targetId == outfitData.id)?.imageUrl}">
                                        </span>
                                    </thumbnail-2d>
                                </a> 
                            </div> 
                            <div class="item-card-caption">
                                <a class="item-card-name-link">
                                    <div title="${stripTags(outfitData.name)}" class="text-overflow item-card-name ng-binding">${stripTags(outfitData.name)}</div>
                                </a> 
                            </div>
                        </div>
                    </div> 
                </li>
                `
            }).join("")
        })
    }
    let selectedInfos
    const buyModal = new Modal("buyModal", "Copy Outfit", "Are you sure you want to copy this outfit?", "It will be available in the avatar editor after")
    const successModal = new Modal("successModal", "Success", "You can now equip your new outfit in the avatar editor!", "Enjoy")
    document.querySelector("#buy-outfit").addEventListener('click', async () => {
        const assetInfos = await postRepeat("https://catalog.roblox.com/v1/catalog/items/details", {
            data: JSON.stringify({ items: selectedInfo.assets.map(asset => {
                return {
                    id: asset.id,
                    itemType: "Asset"
                }
            })})
        })
        selectedInfos = assetInfos.data
        const totalPrice = assetInfos?.data?.reduce((acc, cur) => acc + (cur?.price ?? 0), 0)
        const offsaleItems = assetInfos?.data?.filter(asset => asset?.priceStatus === "Offsale")
        if (totalPrice > 0) {
            buyModal.show(`
                Are you sure that you wish to buy all the ${assetInfos?.data?.length} items needed for <span class="icon-robux-16x16"></span><span class="text-lead">${addCommas(totalPrice)}</span>?
                ${offsaleItems?.length > 0 ? `<br>There are <span class="text-lead">${offsaleItems?.length}</span> items that are currently offsale and will not be added or bought.` : ""}
            `)
        } else {
            buyModal.show(`
                Are you sure that you wish to copy this outfit?
                ${offsaleItems?.length > 0 ? `<br>There are <span class="text-lead">${offsaleItems?.length}</span> items that are currently offsale and will not be added.` : ""}
            `)
        }
    })
    buyModal.setCallback(async () => {
        let purchasedAmount = 0
        for (const item of selectedInfos) {
            if (item.priceStatus === "Offsale") continue;
            let purchased = await postRepeat("https://economy.roblox.com/v1/purchases/products/" + item.productId, {
                data: JSON.stringify({expectedCurrency:1, expectedPrice:item.price})
            })
            if (purchased?.reason === "Success" || purchased?.reason === "AlreadyOwned") {
                purchasedAmount ++;
            }
        }
        console.log("Purchased: " + purchasedAmount)
        if (purchasedAmount > 0) {
            const createdOutfit = await postRepeat("https://avatar.roblox.com/v1/outfits/create", {
                data: JSON.stringify({
                    name: selectedInfo.name,
                    assetIds: selectedInfo.assets.map(asset => asset.id),
                    bodyColors: selectedInfo.bodyColors,
                    scale: selectedInfo.scale,
                    playerAvatarType: selectedInfo.playerAvatarType,
                })
            })
            console.log(createdOutfit)
            successModal.show()
        }
    })
    document.querySelector("#back").addEventListener('click', () => {
        document.querySelector(".tab-pane").classList.add("active")
        document.querySelector(".section-content").classList.add("ng-hide")
    })
}