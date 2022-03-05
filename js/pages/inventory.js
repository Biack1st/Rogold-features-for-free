/*
    RoGold

    Coding and design by alexop1000 (AlexOp).
    Contact: https://rogold.me/invite

    Copyright (C) alexop1000 
    All rights reserved.
*/

pages.inventory = async () => {
    await first("#assetsItems")
    const modal = new Modal("BadgeRemoval", "Remove Badges", "Are you sure you want to remove the selected badges?", "This cannot be undone.")
    const loadedList = []
    let isRemoving = false
    const selectedForRemoval = []
    const setRemoving = (badge) => {
        if (badge.querySelector("input")) {
            badge.querySelector("input").checked = selectedForRemoval.includes(badge.querySelector("a").href.split("/")[4])
            return
        }
        badge.style.display = "flex"
        badge.style.alignItems = "center"
        badge.style.flexDirection = "row"
        const checkbox = document.createElement('input')
        checkbox.setAttribute('type', 'checkbox')
        checkbox.setAttribute('style', 'height: 91px;width: 20px;border-radius: 50%;margin-right: auto;margin-left: auto;position: absolute;')
        checkbox.checked = selectedForRemoval.includes(badge.id)
        badge.appendChild(checkbox)

        checkbox.addEventListener('click', (e) => {
            const badgeId = badge.querySelector("a").href.split("/")[4]
            badge.id = badgeId
            if (e.currentTarget.checked) {
                console.log(badgeId)
                selectedForRemoval.push(badgeId)
            } else {
                selectedForRemoval.splice(selectedForRemoval.indexOf(badgeId), 1)
            }
        })
    }
    const badgeLoad = async (badge) => {
        badge = badge.currentTarget
        const badgeId = badge.querySelector("a").href.split("/")[4]
        if (loadedList.includes(badgeId)) {
            if (!badge.className.includes("rg-class")) {
                loadedList.splice(loadedList.indexOf(badgeId), 1)
            } else {
                return
            }
        } else {
            loadedList.push(badgeId)
        }
        if (isRemoving) {
            setRemoving(badge)
        }
    }
    $(document).on("DOMNodeInserted", ".item-card", badgeLoad)
    const loadBF = async () => {
        await first("#assetsItems")
        const removeBadges = async () => {
            if (modal.isOpen) return modal.hide();
            if (selectedForRemoval.length == 0) {
                modal.show("No badges selected.", "Please select at least one badge to remove.", true)
                return
            }
            console.log(selectedForRemoval)
            for (const badgeId of selectedForRemoval) {
                const response = await postRepeat(`https://badges.roblox.com/v1/user/badges/${badgeId}`, {
                    type: "DELETE",
                })
                console.log(response, badgeId)
                if (response) {
                    const badge = document.getElementById(badgeId)
                    if (badge) badge.remove();
                }
            }
            modal.show(`You have successfully removed ${selectedForRemoval.length} badges!`, "Success", true)
            selectedForRemoval.length = 0
            isRemoving = false
            const badges = document.getElementById("assetsItems")
            const badgeList = badges.getElementsByClassName("list-item")
            for (const badge of badgeList) {
                badge.removeChild(badge.lastChild)
            }
        }
        modal.setCallback(removeBadges)
        const removeBadgesButton = document.createElement("button")
        removeBadgesButton.setAttribute("class", "btn-secondary-md")
        removeBadgesButton.setAttribute("style", "margin-left: auto;margin-right: auto;")
        removeBadgesButton.id = "removeBadgesButton"
        removeBadgesButton.innerText = "Remove Badges"
        removeBadgesButton.addEventListener("click", () => {
            if (isRemoving) {
                modal.show(`Are you sure that you want to remove ${selectedForRemoval.length} badges?`, "This cannot be undone.")
            } else {
                isRemoving = true
                const badges = document.getElementById("assetsItems")
                const badgeList = badges.getElementsByClassName("list-item")
                for (const badge of badgeList) {
                    setRemoving(badge)
                }
            }
        })
        document.querySelector(".assets-explorer-title").appendChild(removeBadgesButton)
    }
    function locationHashChanged(e) {
        if (document.querySelector("#removeBadgesButton")) {
            document.querySelector("#removeBadgesButton").remove()
        }
        if (location.hash.includes("#!/badges")) {
            loadBF()
        } else {
            isRemoving = false
            selectedForRemoval.length = 0
        }
    }

    window.onhashchange = locationHashChanged;
    locationHashChanged(window.location);
}