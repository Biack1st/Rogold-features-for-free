/*
    RoGold
    Coding and design by Alrovi Aps.
    Contact: contact@alrovi.com
    Copyright (C) Alrovi Aps
    All rights reserved.
*/

const contentScripts = {
    profile: { matches: ["^/users/", "^/banned-users"], css: ["css/profile.css"] },
    avatar: { matches: ["^/my/avatar"] },
    friends: { matches: ["^/users/"] },
    settings: { matches: ["^/my/account"], },
    joinlink: { matches: ["^/discover"] },
    discover: { matches: ["^/discover"] },
    trade: { matches: ["^/trades","^/users/(\\d+)/trade"] },
    game: { matches: ["^/discover/", "^/experience/", "^/experiences/", "^/games/"], css: ["css/game.css"] },
    group: { matches: ["^/groups/"] },
    home: { matches: ["^/home"], css: ["css/home.css"] },
    develop: { matches: ["^/develop", "^/build/upload", "^/places", "^/universes", "^/library"], css: ["css/develop.css"], all_frames: true },
    library: { matches: ["^/library"] },
    catalog: { matches: ["^/catalog"] },
    upload: { matches: ["^/build/upload", "^/places", "^/universes"], css: ["css/develop.css"], all_frames: true },
    banned: { matches: ["^/banned-users"], css: ["css/banneduser.css", "css/profile.css"] },
    messages: { matches: ["^/my/messages"] },
    search: { matches: ["^/"] },
    inventory: { matches: ["^/users/(\\d+)/inventory"] },
    outfitcopy: { matches: ["^/outfit-copier"] },
};
// Check if the current page is found in the content scripts object.
const isValidPage = (page) => {
    return contentScripts?.[page].matches.some((match) => {
        return new RegExp(match, "i").test(window.location.pathname);
    });
}
const injectCss = (page) => {
    const css = contentScripts[page].css;
    if (css) {
        css.forEach((file) => {
            console.log("[%cRoGold%c] Applying CSS: %c" + file, "color: #FFD700", "color: #FFFFFF", "color: #068c06");
            const link = document.createElement("link");
            link.href = chrome.runtime.getURL(file);
            link.type = "text/css";
            link.rel = "stylesheet";
            (document.head || document.documentElement).appendChild(link);
        });
    }
}
const currentPage = Object.keys(contentScripts).find(isValidPage);
Object.keys(contentScripts).forEach(async (page) => {
    if (isValidPage(page) && (self === top || contentScripts[page]?.all_frames)) {
        if(pages[page]) pages[page].apply();
        injectCss(page);
        if (self === top) console.log('[%cRoGold%c] Content script applied: %c' + page, "color: #FFD700", "color: #FFFFFF", "color: #068c06");
    }
});
if (self === top) {
    first("body", (body) => body.classList.add("rogold"));
}