/*
    RoGold
    Coding and design by Alrovi Aps.
    Contact: contact@alrovi.com
    Copyright (C) Alrovi Aps
    All rights reserved.
*/

try {
    let rates
    const cache = {}
    chrome.runtime.onMessage.addListener((request, _, respond) => {
        setTimeout(async () => {
            switch (request.greeting) {
                case "GetURL":
                    fetch(request.url, {credentials: "omit"}).then((resp) => {
                        resp.json().then(respond)
                    }).catch(respond)
                    break;
                case "GetBlob": 
                    fetch(request.url).then((resp) => {
                        resp.blob().then(console.log)
                    }).catch(respond)
                    break;
                case "CreateMenu":
                    chrome.contextMenus.removeAll(() => {
                        respond(chrome.contextMenus.create(request.info));
                    });
                    break;
                case "EditMenu":
                    respond(chrome.contextMenus.update(request.info.id, request.info.update));
                    break;
                case "GetRates":
                    if (!rates) {
                        fetch(`https://api.exchangerate.host/latest?base=USD`).then((resp) => {
                            resp.json().then((data) => {
                                rates = data.rates
                                respond(data.rates)
                            })
                        }).catch(respond)
                    } else {
                        respond(rates)
                    }
                    break;
                case "CacheValue":
                    cache[request.info.key] = request.info.value
                    respond(true)
                    break;
                case "GetCacheValue":
                    respond(cache[request.info.key])
                    break;
            }
        })
        return true
    })
    setInterval(() => {
        for (let key in cache) {
            if (cache[key].time < Date.now()) {
                console.log(`Cache expired for ${key}`)
                delete cache[key]
            }
        }
    }, 1000)
} catch (e) {
    console.warn(e)
}

try {
    // https://gist.github.com/Rob--W/ec23b9d6db9e56b7e4563f1544e0d546
    const escapeHTML = (str) => {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;").replace(/'/g, "&#39;")
            .replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    chrome.contextMenus.onClicked.addListener((data) => {
        if (data.menuItemId == "RoGold-Context" && data.linkUrl) {
            const safe = escapeHTML(data.linkUrl)
            const urlSplit = safe.split("/")
            let toCopy = safe.includes("roblox.com") && safe.match(/(\d+)/g)[0] || urlSplit[3]
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: "copy",
                    data: toCopy
                })
            })
        }
    })
} catch (e) {
    console.warn(e)
}

try {
    chrome.runtime.onUpdateAvailable.addListener(() => {
        chrome.runtime.reload()
    })

    chrome.runtime.onInstalled.addListener(async (details) => {
        if (details.reason == "install") {

        } else if (details.reason == "update") {
            const currentVersion = chrome.runtime.getManifest().version
            const previousVersion = details.previousVersion
            if (currentVersion != previousVersion) {
                chrome.notifications.create("updateNotification", {
                    type: "basic",
                    iconUrl: chrome.runtime.getURL("icons/grey_128x128.png"),
                    title: "RoGold",
                    message: "RoGold has been updated to version " + chrome.runtime.getManifest().version + "!",
                    priority: 2,
                    requireInteraction: false
                })
                // chrome.notifications.onClicked.addListener(() => {
                //     chrome.tabs.create({
                //         url: "https://roblox.com/home"
                //     })
                //     // send a message to the client to show the update log
                //     setTimeout(() => {
                //         chrome.tabs.query({
                //             active: true,
                //             currentWindow: true
                //         }, (tabs) => {
                //             chrome.tabs.sendMessage(tabs[0].id, {
                //                 greeting: "UpdateLog"
                //             })
                //         })
                //     }, 1500)
                // })
            }
        }
    })
} catch (e) {
    console.warn(e)
}