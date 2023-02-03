setTimeout(function() {
    try {
        document.dispatchEvent(new CustomEvent("retrieveGlobal", {
            detail: Roblox?.CurrentUser ?? {
                userId: document.querySelector("meta[name='user-data']")?.getAttribute("data-userid"),
                name: document.querySelector("meta[name='user-data']")?.getAttribute("data-name"),
            }
        }));
    } catch {
        document.dispatchEvent(new CustomEvent("retrieveGlobal", {
            detail: {
                userId: document.querySelector("meta[name='user-data']")?.getAttribute("data-userid"),
                name: document.querySelector("meta[name='user-data']")?.getAttribute("data-name"),
            }
        }));
    }
}, 0);