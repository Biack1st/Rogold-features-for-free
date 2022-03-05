/*
    RoGold

    Coding and design by alexop1000 (AlexOp).
    Contact: https://rogold.me/invite

    Copyright (C) alexop1000 
	All rights reserved.
*/

let categories = {
    "2": 3,
    "3": 9,
    "8": 11,
    "10": 6,
    "11": 3,
    "12": 3,
    "13": 8,
    "17": 4,
    "18": 4,
    "19": 5,
    "38": 7,
    "40": 10,
    "41": 11,
    "42": 11,
    "43": 11,
    "44": 11,
    "45": 11,
    "46": 11,
    "47": 11,
    "48": 12,
    "50": 12,
    "51": 12,
    "52": 12,
    "53": 12,
    "54": 12,
    "55": 12,
    "61": 12,
    "62": 14
}
let subcategories = {
    "2": 13,
    "3": 16,
    "8": 9,
    "10": 6,
    "11": 12,
    "12": 14,
    "13": 8,
    "17": 15,
    "18": 10,
    "19": 5,
    "38": 7,
    "40": 18,
    "41": 20,
    "42": 21,
    "43": 22,
    "44": 23,
    "45": 24,
    "46": 25,
    "47": 26,
    "48": 28,
    "50": 30,
    "51": 31,
    "52": 32,
    "53": 33,
    "54": 34,
    "55": 35,
    "61": 39,
    "62": 41
}
pages.library = (async () => {
    await awaitReady()
    console.log("Loading library...")
    assetId = getId(window.location.href)
    let xsrf = document.getElementsByName('csrf-token')[0].getAttribute('data-token')
    await first("#item-container")
    const assetTypeName = document.querySelector("#item-container").getAttribute("data-asset-type")
    const getCatelogItemDetails = async (id) => {
        return new Promise(async (resolve, reject) => {
            let catalogResponse = await postRepeat('https://catalog.roblox.com/v1/catalog/items/details', {
                headers: { "Content-Type": "application/json", "X-CSRF-Token": xsrf },
                data: JSON.stringify({
                    "items": [
                        {
                            "itemType": assetTypeName,
                            "id": Number(id),
                            "key": `${assetTypeName}_${id}`,
                            "thumbnailType": assetTypeName,
                        }
                    ]
                })
            })
            resolve(catalogResponse)
        })
    }
    let response = await getCatelogItemDetails(assetId)
    let warning = document.createElement('div')
    warning.setAttribute('class', 'alert-info')
    warning.setAttribute('style', 'background-color: #f68802 !important; margin-bottom: 10px;')
    response = response.data[0]
    const itemContainer = document.querySelector("#item-container")
    let assetType = itemContainer.getAttribute('data-asset-type-id')
    if (assetType == 38) {
        const searchName = removeDublicates(itemContainer.getAttribute("data-item-name").replace(emojiRegex, '')).replace(/([\[(])(.+?)([\])])/g, '').trim()
        let search = await get(
            `https://search.roblox.com/catalog/contents?CatalogContext=2&Subcategory=${subcategories[assetType]}&Keyword=${searchName}&SortType=1&SortAggregation=5&LegendExpanded=true&Category=${categories[assetType]}`
        )
        let searchResult = document.createElement('html')
        searchResult.innerHTML = search
        let top = itemContainer.getAttribute("data-item-id")
        let topLikes = document.getElementById('vote-up-text').title.replace(/,?[^0-9\.]+/g, '')
        let topHref
        const itemIds = []
        for (const searchElement of searchResult.getElementsByClassName('CatalogItemName')) {
            const href = searchElement.getElementsByClassName('name')[0].getAttribute('href')
            //console.log(searchElement.getElementsByClassName('name')[0], getId(href))
            if (!href) continue;
            itemIds.push(getId(href))
        }
        const items = await splitLimit(itemIds, async (ids) => {
            return new Promise(async resolve => {
                const res = await get(`https://apis.roblox.com/toolbox-service/v1/items/details?assetIds=${ids}`)
                resolve(res.data)
            })
        })
        for (const searchElement of searchResult.getElementsByClassName('CatalogItemInner')) {
            let name = searchElement.getElementsByClassName('name')[0].innerText
            let nameDifference = similarity(searchName.toUpperCase(), name.toUpperCase())
            if (nameDifference == 1 || searchName.replace(" ", "") == name.replace(" ", "")) {
                //let likes = searchElement.getElementById('vote-up-text').innerText.replace(/,?[^0-9\.]+/g, '')
                const href = searchElement.getElementsByClassName('name')[0].getAttribute('href')
                const assetId = getId(href)
                let likes = 0
                for (const item of items) {
                    if (item.asset && item.asset.id == assetId && item.voting && item.voting.upVotes && item.voting.showVotes) {
                        likes = item.voting.upVotes
                    } 
                }
                if (assetId < top && topLikes < likes) {
                    top = assetId
                    topLikes = likes
                    topHref = href
                }
            }
        }
        const fakeUserSearch = async (creatorName) => {
            return new Promise(async (resolve, reject) => {
                let otherSearch
                if (creatorName.includes("I")) {
                    otherSearch = await fakeUserSearch(creatorName.replace(/I+/g, "l"))
                }
                let userSearch = await get(`https://www.roblox.com/search/users/results?keyword=${creatorName}&maxRows=12&startIndex=0`)
                if (userSearch.UserSearchResults && userSearch.UserSearchResults[0]) {
                    let topRes = userSearch.UserSearchResults[0]
                    let followers = await get('https://friends.roblox.com/v1/users/' + topRes.UserId + '/followers/count')
                    if (topRes.Name.toLowerCase() == creatorName.replace("@", "").toLowerCase()) {
                        let topUrl = topRes.UserProfilePageUrl
                        if (otherSearch && otherSearch.isFake && otherSearch.followers > followers.count) {
                            topUrl = otherSearch.topUrl
                            followers = otherSearch.followers
                        }
                        resolve({isFake: true, topUrl: topUrl, followers: followers.count})
                    }
                }
                resolve({isFake: false})
            })
        }
        const doSearch = async () => {
            if (response.creatorName.includes("@") && response.creatorType == "Group") {
                const info = await fakeUserSearch(response.creatorName)
                if (info.isFake) {
                    warning.innerHTML = `
                    WARNING!<br> RoGold has detected that this asset is likely a fake and is unsafe.<br> The asset is probably pretending to be made by <a href="${info.topUrl}">this person</a>.
                    `
                    document.getElementById('item-details').insertBefore(warning, document.getElementById('item-details').getElementsByClassName('price-container')[0])
                }
            }
        }
        if (top !== itemContainer.getAttribute("data-item-id")) {
            let topId = getId(topHref)
            if (topId) {
                const details = await getCatelogItemDetails(topId)
                if (details && details.data && details.data[0] && details.data[0].creatorType == "Group") {
                    const info = await fakeUserSearch(details.data[0].creatorName)
                    if (info.isFake) {
                        console.log(info, details.data[0]);
                        doSearch();
                        return
                    };
                }
            }
            warning.innerHTML = `
            WARNING!<br> RoGold has detected that this asset is likely a fake and is unsafe.<br> You were probably looking for <a href="${topHref}">this</a>.
            `
            document.getElementById('item-details').insertBefore(warning, document.getElementById('item-details').getElementsByClassName('price-container')[0])
        } else {
            doSearch()
        }

        // let content = await get(`https://assetdelivery.roblox.com/v1/assetId/${assetId}`)
        // if (content.location) {
        //     get(content.location).then(async (resp = "") => {
        //         let cleaned = resp.replace(/<(.*?)>(.*?)<\/(.*?)>/g, "").replace(/<(.*?)>/g, "").replace("&#9;", "\n").replace(/[^\x20-\x7E]/g, '');
        //         let badRequire = cleaned.match(/require\(math\.(.*?)\)\)/g)
        //         console.log(cleaned);
        //         console.log(badRequire);
        //     })
        // }
    }
    if (assetType) {
        //return;
        let hasExperiments = await checkExperiments()
        if (!hasExperiments) {
            return
        }
        const doAnalysis = await getSetting('Library Analysis')
        if (!doAnalysis) {
            return
        }
        const checkSource = (source) => {
            let cleaned = source.replace(/<(.*?)>(.*?)<\/(.*?)>/g, "").replace(/<(.*?)>/g, "")
            let badRequire = cleaned.match(/require\(math\.(.*?)\)\)/g)
            let badClone = cleaned.match("script:Clone()")
            let susWords = cleaned.match(/([Ii]nfector)|([Vv]irus)/g)
            let parsed = parse(decode(cleaned))
            const hasRequire = parsed.body.some(node => node.type == "CallExpression" && node.callee.type == "Identifier" && node.callee.name == "require" && node.arguments.length == 1 && node.arguments[0].type == "CallExpression");
            let states = []
            if (!badRequire && badClone) {
                states.push("Self Cloning")
            } 
            if (susWords) {
                states.push("Suspicious Words")
            } 
            if(parsed.comments.length > 100) {
                states.push("Many Comments")
            } 
            if (hasRequire) {
                states.push("Unusual Requires")
            }
            return [states, parsed]
        }
        let content = await get(`https://assetdelivery.roblox.com/v1/assetId/${assetId}`)
        if (content.location) {
            const header = `
                <div class="rbx-tabs-horizontal">
                    <ul id="horizontal-tabs" class="nav nav-tabs" role="tablist" profile-tab-click="">
                        <li class="rbx-tab active" style="width: 50%;">
                            <a class="rbx-tab-heading" href="#analysis" id="tab-analysis"> 
                                <span class="text-lead">Analysis</span> 
                                <span class="rbx-tab-subtitle"></span> 
                            </a>
                        </li>
                        <li class="rbx-tab" style="width: 50%;">
                            <a class="rbx-tab-heading" href="#comments" id="tab-comments"> 
                                <span class="text-lead">Comments</span> 
                                <span class="rbx-tab-subtitle"></span> 
                            </a>
                        </li>
                    </ul>
                    <div class="tab-content rbx-tab-content">
                        <div class="tab-pane active" id="analysis">
                            <div class="section">
                                <div class="container-header">
                                    <h3>Safety</h3>
                                </div>
                                <div class="section-content" id="analysis-score">
                                    Score: Loading
                                    <br>
                                </div>
                                <div class="container-header">
                                    <h3>Info</h3>
                                </div>
                                <div class="section-content" id="analysis-info">
                                    Loading
                                    <br>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
            if (document.getElementById('AjaxCommentsContainer')) {
                const elem = document.createElement('div')
                document.getElementById('item-container').appendChild(elem)
                elem.outerHTML = header
                const container = document.getElementById('AjaxCommentsContainer').parentNode
                container.setAttribute("style", "display:none;")
                $(container).appendTo('#item-container')
                document.getElementById('tab-comments').addEventListener('click', () => {
                    document.getElementById('tab-comments').parentElement.className = "rbx-tab active"
                    document.getElementById('tab-analysis').parentElement.className = "rbx-tab"

                    container.style.display = ""
                    document.getElementById('analysis').className = "tab-pane"
                })
                document.getElementById('tab-analysis').addEventListener('click', () => {
                    document.getElementById('tab-comments').parentElement.className = "rbx-tab"
                    document.getElementById('tab-analysis').parentElement.className = "rbx-tab active"

                    container.style.display = "none"
                    document.getElementById('analysis').className = "tab-pane active"
                })
            } else {
                const elem = document.createElement('div')
                document.getElementById('item-container').appendChild(elem)
                elem.outerHTML = header
                document.getElementById('tab-comments').parentElement.remove()
                document.getElementById('tab-analysis').parentElement.setAttribute("style", "width:100%;")
            }
            fetch(content.location).then(async (resp = "") => {
                resp = await resp.text()
                const analysis = {
                    scripts: [],
                    instances: [],
                    isRBXM: false
                }
                if (resp.includes("http://www.w3.org/2005/05/xmlmime")) {
                    const instances = parseXML(resp)
                    for (const item of instances) {
                        if (item.ClassName == "Script" || item.ClassName == "LocalScript" || item.ClassName == "ModuleScript") {
                            const [dangerous, parsed] = checkSource(item.Properties.Source)
                            analysis.scripts.push({
                                name: item.Properties.Name,
                                parsed: parsed,
                                score: 100 - (dangerous.length * 25),
                                danger: dangerous
                            })
                        }
                        analysis.instances.push(item)
                    }
                } else {
                    // TODO: Switch to using array encoded. var enc = new TextEncoder("utf-8");
                    // const encoded = new TextEncoder("utf-8").encode(resp)
                    // const output = new Uint8Array(encoded.length)
                    // console.log(encoded)
                    // console.log(decodeLz4Block(encoded, output))
                    // console.log(output)
                    const rbxm = readRBXM(resp)
                    console.log(rbxm)
                    Object.values(rbxm).forEach(item => {
                        for (const instance of item.Instances) {
                            if (instance.Source) {
                                const [dangerous, parsed] = checkSource(instance.Source)
                                analysis.scripts.push({
                                    name: instance.Name || item.ClassName,
                                    parsed: parsed,
                                    score: 100 - (dangerous.length * 25),
                                    danger: dangerous
                                })
                            } else {
                                instance.ClassName = item.ClassName
                                analysis.instances.push(instance)
                            }
                        }
                    })
                    analysis.isRBXM = true
                }
                let avgScore = []
                const dangers = {}
                for (const script of analysis.scripts) {
                    avgScore.push(script.score)
                    for (const danger of script.danger) {
                        if (dangers[danger]) {
                            dangers[danger] += 1
                        } else {
                            dangers[danger] = 1
                        }
                    }
                }
                avgScore = (avgScore.reduce((a,b) => a + b, 0) / avgScore.length) || 100
                let analysisString = `
                    This asset has been rated as <span style="color:${avgScore == 100 && "green" || avgScore > 80 && "orange" || "red"};">${avgScore}%</span> safe.`
                if (Object.keys(dangers).length > 0) {
                    let dangerString = `<br><br>The following was found in the assets scripts:`
                    Object.keys(dangers).forEach(entry => {
                        dangerString += `<br>\t- ${entry}: ${dangers[entry]} entries.`
                    })
                    analysisString += dangerString
                }
                document.getElementById('analysis-score').innerHTML = analysisString
                let infoString = `${analysis.isRBXM ? 
                    "<strong style='color:indianred'>This asset is encoded in a binary format, and might not show 100% correct results. You are recommended to check it yourself too.</strong><br><br>" : ""}`
                const instanceList = {}
                for (const instance of analysis.instances) {
                    if (instanceList[instance.ClassName]) {
                        instanceList[instance.ClassName] += 1
                    } else {
                        instanceList[instance.ClassName] = 1
                    }
                }
                if (Object.keys(instanceList).length > 0) {
                    let instanceString = `The asset consists of:`
                    Object.keys(instanceList).forEach(entry => {
                        instanceString += `<br>\t- ${instanceList[entry]} <strong>${entry}</strong> instance${instanceList[entry] > 1 ? "s" : ""}.`
                    })
                    infoString += instanceString
                }
                document.getElementById('analysis-info').innerHTML = infoString
                    console.log(analysis)
                // if (!badRequire && badClone) {
                //     warning.innerHTML = `
                //     WARNING!<br> RoGold has detected that this script clones itself. This might be unwanted behaviour and it is recommended to review further before using.
                //     `
                //     document.getElementById('item-details').insertBefore(warning, document.getElementById('item-details').getElementsByClassName('price-container')[0])
                // } else if (susWords) {
                //     warning.innerHTML = `
                //     WARNING!<br> RoGold has detected words like "<strong>${susWords[0]}</strong>" in the source code. It is recommended that you further review the code before use.
                //     `
                //     document.getElementById('item-details').insertBefore(warning, document.getElementById('item-details').getElementsByClassName('price-container')[0])
                // } else if(parsed.comments.length > 100) {
                //     warning.innerHTML = `
                //     WARNING!<br> RoGold has detected this script has <strong>${parsed.comments.length}</strong> comments in the source code. <br> It is recommended that you further review the code before use.
                //     `
                //     document.getElementById('item-details').insertBefore(warning, document.getElementById('item-details').getElementsByClassName('price-container')[0])
                // }
            })
        }
    }
})