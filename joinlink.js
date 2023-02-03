/*
    RoGold
    Coding and design by Alrovi Aps.
    Contact: contact@alrovi.com
    Copyright (C) Alrovi Aps
    All rights reserved.
*/
var s = document.createElement('script');
s.src = chrome.runtime.getURL('init.js');
(document.head || document.documentElement).appendChild(s);
s.onload = function () {
    s.remove();
};
const getJoinUrl = () => {
    let url = window.location.href;
    let regex = /\/rg-join\/([a-zA-Z0-9\-_]+)\/([a-zA-Z0-9\-_]+)/;
    let result = url.match(regex);
    return result.slice(1, result.length).map(elem => elem.slice(0, elem.length));
};
pages.joinlink = (async () => {
    const setting = await getSetting("Server Join Link")
    if (!setting) return;
    const joinUrl = getJoinUrl()
    if (!joinUrl) return;
    if (!joinUrl[0]) return;
    if (!joinUrl[1]) {
        if (isMobile()) {
            window.location.href = "robloxmobile://placeID=" + joinUrl[0];
            return
        }
        window.postMessage({
            direction: "PlayPlace",
            PlaceId: joinUrl[0],
        })
    } else {
        setTimeout(() => {
            if (isMobile()) {
                window.location.href = "robloxmobile://placeID=" + joinUrl[0] + "&gameInstanceId=" + joinUrl[1];
                return
            }
            window.postMessage({
                direction: "Join",
                PlaceId: joinUrl[0],
                Guid: joinUrl[1]
            })
        }, 1000)
    }
})