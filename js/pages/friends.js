/*
    RoGold

    Coding and design by alexop1000 (AlexOp).
    Contact: https://rogold.me/invite

    Copyright (C) alexop1000 
	All rights reserved.
*/

pages.friends = async () => {
    if (!window.location.href.includes("friends")) return;
    let isRemoving = false
    const selectedForRemoval = []
    const setRemoving = (friend) => {
        if (friend.querySelector("input")) {
            friend.querySelector("input").checked = selectedForRemoval.includes(friend.id)
            return
        }
        friend.style.display = "flex"
        friend.style.alignItems = "center"
        friend.style.flexDirection = "row"
        friend.firstChild.style.width = "276px"
        const checkbox = document.createElement('input')
        checkbox.setAttribute('type', 'checkbox')
        checkbox.setAttribute('style', 'height: 91px;width: 20px;border-radius: 50%;margin-right: auto;margin-left: auto;')
        checkbox.checked = selectedForRemoval.includes(friend.id)
        friend.appendChild(checkbox)
        checkbox.addEventListener('click', (e) => {
            if (e.currentTarget.checked) {
                selectedForRemoval.push(e.currentTarget.parentNode.id)
            } else {
                selectedForRemoval.splice(selectedForRemoval.indexOf(e.currentTarget.parentNode.id), 1)
            }
        })
    }
    const doFavorites = await getSetting("Best Friends")
    const favoriteFriends = await pGetStorage("favorites") || []
    let maxBF = await get(`https://inventory.roblox.com/v1/users/50654562/items/GamePass/26817185`) // Very mean if you change this ;( its cheap too
   
    let maxNum = maxBF.data && maxBF.data[0] ? 89042378945378 : 9
    console.log(maxNum)
    const loadedList = []
    const friendLoad = async (friend) => {
        if (window.location.href.includes("friend-requests")) return;
        friend = friend.currentTarget
        if (loadedList.includes(friend.getAttribute("id"))) {
            if (!friend.className.includes("rg-class")) {
                loadedList.splice(loadedList.indexOf(friend.getAttribute("id")), 1)
            } else {
                return
            }
        } else {
            loadedList.push(friend.getAttribute("id"))
        }
        // for (const friend of document.getElementsByClassName('list-item avatar-card')) {
        if (isRemoving) {
            setRemoving(friend)
        }
        let id = parseInt(friend.id)
        $(friend).addClass("rg-class")
        if (!friend.querySelector(".icon-more") && doFavorites && window.location.href.includes("users/friends#!/friends")) {
            const theme = document.getElementById('rbx-body').className.includes('light')
            const favoriteButton = document.createElement('div')
            favoriteButton.className = "favorite-button"
            favoriteButton.innerHTML = `
                <div style='
                background-image:url(${theme &&
                "https://images.rbxcdn.com/d96bc8cfcc751bb4d7c1c4fc79fa7ae8-chat_light.svg" ||
                "https://images.rbxcdn.com/0ff32c69af9262d7c9fefe8284d81d88-chat_dark.svg"});
                background-repeat:no-repeat;
                background-size:auto;
                width:28px;
                height:28px;
                display:inline-block;
                vertical-align:middle;
                background-position:0px -643px;
                margin-bottom:4px;'></div>
            `
            favoriteButton.setAttribute('style', 'right:5px;top:0;position:absolute;')
            friend.style.position = "relative"
            friend.appendChild(favoriteButton)
            const favChild = favoriteButton.querySelector("div")
            if (favoriteFriends.includes(id)) {
                favChild.style.backgroundPosition = "-28px -643px"
            }
            let lastClick = Date.now()
            favoriteButton.addEventListener('click', (e) => {
                if (Date.now() - lastClick < 500) return
                lastClick = Date.now()
                if (favoriteFriends.includes(id)) {
                    favoriteFriends.splice(favoriteFriends.indexOf(id), 1)
                    favChild.style.backgroundPosition = "0 -643px"
                } else {
                    if (favoriteFriends.length == maxNum) return;
                    favoriteFriends.push(id)
                    favChild.style.backgroundPosition = "-28px -643px"
                }
                syncSet("favorites", favoriteFriends)
            })
            favoriteButton.addEventListener('mouseenter', (e) => {
                favChild.style.backgroundPosition = "-28px -643px"
            })
            favoriteButton.addEventListener('mouseleave', (e) => {
                if (favoriteFriends.includes(id)) {
                    favChild.style.backgroundPosition = "-28px -643px"
                } else {
                    favChild.style.backgroundPosition = "0 -643px"
                }
            })
        }
        const disabled = friend.getElementsByClassName('avatar-card-container disabled')[0]
        const status = friend.getElementsByClassName('avatar-card-label')[1]
        if (status) {
            if (status.textContent.includes('Seen')) return;
            let activity = await get('https://api.roblox.com/users/' + id + '/OnlineStatus')
            if (activity.LastLocation.search('Creating') !== -1 && activity.PlaceId && activity.LocationType == 6) {
                status.innerHTML = `<a class="text-link avatar-status-link" href="https://roblox.com/games/${activity.PlaceId}" title="${stripTags(activity.LastLocation)}">${stripTags(activity.LastLocation)}</a>
                `
            } else if (!activity.IsOnline) {
                status.innerHTML = `${disabled && "Inactive" || stripTags(activity.LastLocation)} - Seen ${dateSince(new Date(activity.LastOnline))}</div>
                `
                const avatarName = friend.getElementsByClassName('text-overflow avatar-name')[0]
                if (disabled && avatarName && avatarName.tagName == "DIV") { // actually disabled or banned
                    const replacement = document.createElement('a')
                    replacement.setAttribute('href', `https://${window.location.href.includes('web.roblox') && 'web' || 'www'}.roblox.com/banned-users/` + id)
                    replacement.setAttribute('class', 'text-overflow avatar-name')
                    replacement.textContent = stripTags(avatarName.textContent)
                    avatarName.parentNode.replaceChild(replacement, avatarName)
                }
            }
        }
        // }
    }
    $(document).on("DOMNodeInserted", ".list-item.avatar-card", friendLoad)
    if (!(await getSetting("Bulk Unfriend"))) return;
    const filter = await first(".friends-filter-searchbar-input")
    if (!window.location.href.includes("users/friends#!/friends")) return;
    
    const modal = document.createElement('div')
    modal.setAttribute('role', 'dialog')
    modal.setAttribute('style', 'position: fixed; z-index: 1002; height: 277px; width: 439px; left: 738px; top: 365px; display: none;')
    modal.innerHTML = `
    <div role="dialog">
    <div class="modal-backdrop in"></div>
    <div role="dialog" tabindex="-1" class="in modal" style="display: block;">
        <div class="modal-window modal-dialog">
            <div class="modal-content" role="document">
                <div class="modal-header">
                <button type="button" class="close"><span class="icon-close" id="cancel-btn"></span></button>
                <h4 class="modal-title">Confirm Unfriend</h4>
                </div>
                <div class="modal-body">Are you sure that you wish to unfriend 1 person?</div>
                <div class="modal-footer">
                <div class="loading"></div>
                <div class="modal-buttons"><button type="button" class="modal-button btn-control-md btn-min-width" id="remove-btn">Proceed</button></div>
                <div class="text-footer">This cannot be undone.</div>
                </div>
            </div>
        </div>
    </div>
    </div>
    `
    document.body.appendChild(modal)

    const confirm = document.getElementById('remove-btn')
    const decline = document.getElementById('cancel-btn')
    confirm.addEventListener('click', async () => {
        modal.style.display = 'none'
        console.log(selectedForRemoval)
        let csrf
        for (const friend of selectedForRemoval) {
            const response = await postRepeat(`https://friends.roblox.com/v1/users/${friend}/unfriend`, {
                    headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf || document.getElementsByName('csrf-token')[0].getAttribute('data-token') }
                })
            if (response) {
                let element = document.getElementById(friend)
                if (element) {
                    element.remove()
                }
            }
        }
        selectedForRemoval.splice(0, selectedForRemoval.length)
        isRemoving = false
    })
    decline.addEventListener('click', async () => {
        modal.style.display = 'none'
        selectedForRemoval.splice(0, selectedForRemoval.length)
        isRemoving = false
    })

    let holder = filter.parentNode.parentNode
    let bulkRemoveButton = document.createElement('button')
    const createBulkButton = async () => {
        holder = await first(".friends-filter-searchbar-input")
        holder = holder.parentNode.parentNode
        bulkRemoveButton = document.createElement('button')
        bulkRemoveButton.setAttribute('class', 'btn-secondary-md')
        bulkRemoveButton.setAttribute('style', 'padding: 6px;float: left;margin-left: 3px;margin-right: 2px;')
        bulkRemoveButton.id = "bulk-remove-button"
        bulkRemoveButton.innerText = 'Bulk Remove'
        holder.appendChild(bulkRemoveButton)

        bulkRemoveButton.addEventListener('click', async () => {
            const friends = await find(".list-item.avatar-card")
            if (!isRemoving) {
                isRemoving = true
                bulkRemoveButton.innerText = 'Confirm Removal'
                bulkRemoveButton.style.borderColor = 'red'
                for (const friend of friends) {
                    setRemoving(friend)
                }
            } else {
                bulkRemoveButton.innerText = 'Bulk Remove'
                bulkRemoveButton.style.borderColor = '#bdbebe'
                if (selectedForRemoval.length > 0) {
                    modal.querySelector(".modal-body").innerHTML = `Are you sure you would like to remove <strong>${selectedForRemoval.length}</strong> friend${selectedForRemoval.length > 1 ? "s" : ""}?`
                    modal.style.display = 'block'
                } else {
                    isRemoving = false
                }
                for (const friend of friends) {
                    friend?.querySelector('input')?.remove()
                    friend.removeAttribute('style')
                    friend.firstChild.removeAttribute('style')
                }
            }
        })
    }
    createBulkButton()
    document.getElementById("friends").addEventListener("click", (e) => {
        console.log(document.getElementById("bulk-remove-button"))
        if (!document.getElementById("bulk-remove-button")) {
            if (bulkRemoveButton) bulkRemoveButton.remove();
            createBulkButton()
        }
    })

}