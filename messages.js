/*
    RoGold
    Coding and design by Alrovi Aps.
    Contact: contact@alrovi.com
    Copyright (C) Alrovi Aps
    All rights reserved.
*/

pages.messages = (async () => {
    const hightlightSus = await getSetting("Message Scam Protection")
    if (!hightlightSus) return;
    let currentPage = 1
    const sus = [
        "thumbnail",
        "character",
        "middleman",
        "no longer",
        "model clothing",
        "avatar",
        "termination",
        "deletion",
        "report",
        "robux for free",
        "free robux"
    ]
    let response = await get("https://privatemessages.roblox.com/v1/messages?messageTab=inbox&pageNumber=0&pageSize=20");
    on(".messageDivider", async () => {
        const parsed = document.getElementById("rbx-current-page").innerText.length > 0 ? parseInt(document.getElementById("rbx-current-page").innerText) :
            parseInt(document.getElementById("rbx-current-page").firstChild.value)
        if (isNaN(parsed)) return;
        if (!isNaN(parsed) && currentPage != parsed) {
            currentPage = parsed
            response = await get("https://privatemessages.roblox.com/v1/messages?messageTab=inbox&pageNumber=" + (currentPage - 1) + "&pageSize=20");
        }
        sleep(500)
    })
    on("div[ng-bind-html='selectedMessage.Body']", async (div) => {
        // div = div.currentTarget
        if (div.classList.contains("rogold")) return;
        div.classList.add("rogold")
        if (qs(".roblox-sender-link .paired-name").href.includes("/users/1/profile")) return;
        if (qs(".roblox-sender-link .paired-name").href.includes("/users/156/profile")) return;
        const body = stripTags(div.textContent)
        let amount = 0
        for (const word of body.split(" ")) {
            if (sus.includes(word.toLowerCase())) {
                amount++;
                div.innerHTML = div.innerHTML.replace(word, `<span style="color: red">${word}</span>`)
            }
        }
        if (amount > 0) {
            const strong = document.createElement("strong")
            strong.style.color = "#e6b54c"
            strong.innerText = "This message has been marked as potentially misleading or dangerous!"
            div.before(strong)
            div.before(document.createElement("br"))
            div.before(document.createElement("br"))
        }
    })
    setInterval(async () => {
        if (!document.getElementById("rbx-current-page")) return;
        const parsed = document.getElementById("rbx-current-page").innerText.length > 0 ? parseInt(document.getElementById("rbx-current-page").innerText) :
            parseInt(document.getElementById("rbx-current-page").firstChild.value)
        if (isNaN(parsed)) return;
        for (const message of response.collection) {
            const body = decode(stripTags(message.body)).toLowerCase();
            for (const div of document.getElementsByClassName("messageDivider")) {
                if (!qs(".message-summary-username", div)) continue;
                if (!qs(".element:nth-child(1)", qs(".message-summary-username", div))) continue;
                if (qs(".text-preview", div).innerText.toLowerCase() === body && qs(".element:nth-child(1)", qs(".message-summary-username", div)).innerText === message.sender.name) {
                    if (div.classList.contains("rogold")) continue;
                    div.classList.add("rogold")
                    if (message.sender.id === 1 || message.sender.id == 156) continue;
                    const susWords = sus.filter(word => body.includes(word));
                    if (susWords.length > 1) {
                        div.style.backgroundColor = `rgba(255, ${255 - (susWords.length * 50)}, ${255 - (susWords.length * 50)}, 0.3)`
                    }
                }
            }
        }
    }, 1000)
    if (!await getSetting("Message Search")) return;
    let once = false
    on("#private-message .nav-tabs", async (nav) => {
        if (once) return;
        once = true
        const tab = document.createElement("li")
        tab.className = "rbx-tab"
        tab.innerHTML = `
        <a class="rbx-tab-heading" ui-sref="search" href="#!/search">
            <span class="text-lead ng-binding">Search</span>
        </a>`
        nav.appendChild(tab)
        const page = document.createElement("ui-view")
        page.className = "tab-content rbx-tab-content ng-hide"
        page.innerHTML = `
            <div class="tab-content rbx-tab-content">
                <div id="inbox-general-buttons" class="top-nav inbox-buttons" messages-nav="">
                    <div ng-switch-when="list" class="ng-scope">
                        <div class="roblox-messages-btns">
                            <div>
                                <ul id="pagingSearch" class="pagingDiv pagination-container clearfix pager" data-toggle="pager">
                                    <li class="first">
                                        <button class="btn-generic-first-page-sm" disabled="disabled">
                                        <span class="icon-first-page"></span>
                                        </button>
                                    </li>
                                    <li id="previous" class="pager-prev">
                                        <button class="btn-generic-left-sm" disabled="disabled">
                                        <span class="icon-left"></span>
                                        </button>
                                    </li>
                                    <li class="pager-cur">
                                        <span id="rbx-current-page" class="CurrentPage">1</span>
                                    </li>
                                    <li class="pager-total">
                                        <span>/</span>
                                        <span class="TotalPages">1</span>
                                    </li>
                                    <li id="next" class="pager-next">
                                        <button class="btn-generic-right-sm">
                                        <span class="icon-right"></span>
                                        </button>
                                    </li>
                                    <li class="last">
                                        <button class="btn-generic-last-page-sm">
                                        <span class="icon-last-page"></span>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            <input class="form-control input-field search-input" id="rg-search" placeholder="Search" type="text" maxlength="50" autocomplete="off" spellcheck="true" style="width: 20%; height: 100%; display: inline; float: right;">
                        </div>
                    </div>
                </div>
                <div ng-switch-when="list" class="ng-scope">
                    <div ng-switch="currentStatus.activeTab" messages-list="" class="ng-scope">
                        <div ng-switch-default="" class="ng-scope">
                            <div id="MessagesSearch" class="messages">
                                <div class="section-content-off">
                                    <span>Search above to find some messages. To search for a users messages you can enter @username</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
        qs(".roblox-messages-container").appendChild(page)
        let activeTab = qs(".tab-active")
        tab.addEventListener("click", () => {
            activeTab = qs(".tab-active")
            activeTab.classList.remove("tab-active")
            activeTab.classList.add("ng-hide")
            page.classList.add("tab-active")
            page.classList.remove("ng-hide")
            activeTab = page
            for (const tabButton of qsa(".rbx-tab")) {
                tabButton.classList.remove("active")
            }
            tab.classList.add("active")
            setTimeout(() => {
                if(history.pushState) {
                    location.hash = '#!/search';
                    history.pushState({},"","#!/search");
                }
                else {
                    location.hash = '#!/search';
                }
            },500)
        })
        find(".rbx-tab", 4).then(() => {
            for (const tabButton of qsa(".rbx-tab")) {
                tabButton.style.minWidth = "19.9%"
                tabButton.addEventListener("click", () => {
                    if (tabButton.classList.contains("active")) return;
                    if (tabButton == tab) return;
                    page.classList.remove("tab-active")
                    page.classList.add("ng-hide")
                    tab.classList.remove("active")
                    activeTab = qs(".tab-active")
                })
            }
        })
        const searchButton = qs("#rg-search", page)
        let cachedMessages = localStorage.getItem("rg-cachedMessages") || []
        if (cachedMessages.length > 0) {
            cachedMessages = JSON.parse(window.LZMA_WORKER.decompress(JSON.parse(cachedMessages)))
        }
        let isGetting = false
        searchButton.addEventListener("blur", throttle(async (e) => {
            const search = searchButton.value.toLowerCase();
            console.log(search)
            if(history.pushState) history.pushState({},"","#!/search");
            if (search.length < 3) return qs("#MessagesSearch").innerHTML = `<div class="section-content-off"><span>Please include more than 3 characters.</span></div>`;
            const doSearch = async () => {
                if (isGetting) return;
                isGetting = true
                const similar = []
                for (const message of cachedMessages) {
                    const subject = message.subject.toLowerCase()
                    const body = message.body.toLowerCase()
                    const subjectSearch = similarity(subject, search)
                    const bodySearch = similarity(body, search)
                    const userSearch = search.includes("@") ? similarity(message.sender.name.toLowerCase(), search.replace("@", "")) : 0
                    if (subjectSearch > 0.5 || bodySearch > 0.5 || userSearch > 0.5 || subject.includes(search) || body.includes(search)) {
                        similar.push({
                            id: message.id,
                            sender: message.sender,
                            subject: message.subject,
                            body: message.body,
                            created: message.created,
                            similarity: Math.max(subjectSearch, bodySearch, userSearch)
                        })
                    }
                }
                similar.sort((a, b) => b.similarity - a.similarity)
                console.log(similar)
                if (similar.length > 0) {
                    qs("#MessagesSearch").innerHTML = ""
                    const maxPage = Math.ceil(similar.length / 20)
                    qs("#pagingSearch .TotalPages").textContent = maxPage
                    let rPage = 1
                    const renderPage = async (newPage) => {
                        const start = (newPage - 1) * 20
                        const end = newPage * 20
                        const messages = similar.slice(start, end)
                        qs("#MessagesSearch").innerHTML = ""
                        qs("#pagingSearch .CurrentPage").textContent = newPage
                        let showingMessage = false
                        const thumbnails = await get(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${[...new Set(messages.map(f => f.sender.id))].join(",")}&size=150x150&format=Png&isCircular=true`)
                        for (const message of messages) {
                            const messageElement = document.createElement("div")
                            messageElement.className = "border-top sub-divider-bottom messageDivider roblox-message-row ng-scope read rogold"
                            const avatarElement = message.sender.id == 1 && `<div class="roblox-avatar-image roblox-system-image">
                                    <a class="avatar-card-link icon-logo-r icon-logo-notification"></a>
                                </div>` || 
                                `<div class="roblox-avatar-image avatar avatar-headshot-sm">
                                    <a class="avatar-card-link">
                                        <thumbnail-2d class="avatar-card-image">
                                            <span class="thumbnail-2d-container">
                                                <img image-load="" alt="" title="" src="${thumbnails?.data?.find(i => i.targetId == message.sender.id)?.imageUrl}">
                                            </span>
                                        </thumbnail-2d>
                                    </a>
                                </div>`
                            messageElement.innerHTML = `
                                <a class="messageRowAnchor"></a>
                                ${avatarElement}
                                <div class="roblox-messageRow roblox-message-summary">
                                    <div class="wrapped-text message-summary-body">
                                    <span class="font-header-2 paired-name message-summary-username positionAboveLink ng-binding ng-scope">
                                        <span class="element">${message.sender.displayName}</span>
                                        <span class="connector">@</span>
                                        <span class="element">${message.sender.name}</span>
                                    </span>
                                    <div class="text-label text-overflow message-summary-content">
                                        <span class="font-subheader-2 text-subheader subject ng-binding">${stripTags(message.subject)}</span>
                                        <span class="text-preview ng-binding">${stripTags(message.body)}</span>
                                    </div>
                                    </div>
                                    <span class="font-caption-body text-date-hint text message-summary-date text-messageDate read ng-binding">${dateFormat(message.created, "MMM DD, YYYY | hh:mm A")}</span>
                                </div>
                            `
                            qs("#MessagesSearch").appendChild(messageElement)
                            messageElement.addEventListener("click", () => {
                                if (showingMessage) return;
                                showingMessage = true
                                const messagePage = document.createElement("ui-view")
                                messagePage.className = "tab-content rbx-tab-content tab-active"
                                messagePage.innerHTML = `
                                <ui-view class="tab-content rbx-tab-content tab-active">
                                    <div class="tab-content rbx-tab-content">
                                        <div id="search-general-buttons" class="top-nav inbox-buttons">
                                            <div ng-switch-when="detail" class=">
                                                <div class="roblox-messages-btns">
                                                    <button class="roblox-message-back-btn btn-generic-back-sm">
                                                        <span class="icon-back"></span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div ng-switch-when="detail" class="roblox-message-body">
                                            <div class="messages message-detail section-content ng-isolate-scope" messages-detail="" send-message="sendMessage" current-status="currentStatus">
                                                <div class="clearfix">
                                                    <div class="subject roblox-send-message-subject">
                                                        <h3 id="rbx-message-detail-subject" class="message-detail-subject ng-binding"> ${stripTags(message.subject)} </h3>
                                                        <div class="sender">
                                                            ${avatarElement}
                                                        </div>
                                                        <div class="roblox-send-message-content">
                                                            <p class="roblox-sender-link" ng-if="currentStatus.activeTab !== tabDict.sent.name">
                                                                <a class="paired-name text-name ng-binding" href="https://www.roblox.com/users/${message.sender.id}/profile">
                                                                    <span class="element">${message.sender.displayName}</span>
                                                                    <span class="connector">@</span>
                                                                    <span class="element">${message.sender.name}</span>
                                                                </a>
                                                                <span class="date text-date-hint ng-binding">${dateFormat(message.created, "MMM DD, YYYY | hh:mm A")}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="body text clearfix message-detail-body">
                                                    <div class="ng-binding rogold">${message.body}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ui-view>
                                `
                                qs(".tab-active").className = "tab-content rbx-tab-content ng-hide"
                                qs(".roblox-messages-container").appendChild(messagePage)
                                qs(".roblox-message-back-btn", messagePage).addEventListener("click", () => {
                                    messagePage.remove()
                                    page.className = "tab-content rbx-tab-content tab-active"
                                    showingMessage = false
                                })
                            })
                        }
                    }
                    qs("#pagingSearch .pager-next").addEventListener("click", () => {
                        if (rPage == maxPage) return;
                        rPage++
                        renderPage(rPage)
                        if (rPage == maxPage) {
                            qs("#pagingSearch .pager-next button").disabled = "disabled"
                            qs("#pagingSearch .last button").disabled = "disabled"
                        }
                        qs("#pagingSearch .pager-prev button").disabled = ""
                        qs("#pagingSearch .first button").disabled = ""
                    })
                    qs("#pagingSearch .last").addEventListener("click", () => {
                        rPage = maxPage
                        renderPage(rPage)
                        qs("#pagingSearch .last button").disabled = "disabled"
                        qs("#pagingSearch .pager-next button").disabled = "disabled"
                    })
                    qs("#pagingSearch .pager-prev").addEventListener("click", () => {
                        if (rPage == 1) return;
                        rPage--
                        renderPage(rPage)
                        if (rPage == 1) {
                            qs("#pagingSearch .pager-prev button").disabled = "disabled"
                            qs("#pagingSearch .first button").disabled = "disabled"
                        }
                    })
                    qs("#pagingSearch .first").addEventListener("click", () => {
                        rPage = 1
                        renderPage(rPage)
                        qs("#pagingSearch .first button").disabled = "disabled"
                        qs("#pagingSearch .pager-prev button").disabled = "disabled"
                    })
                    renderPage(rPage)
                } else {
                    qs("#MessagesSearch").innerHTML = `
                        <div class="section-content-off">
                            <span>No messages found. Try searching for something else.</span>
                        </div>
                    `
                }
            }
            if (cachedMessages.length == 0 && !isGetting) {
                isGetting = true;
                const getAllMessages = async (pageNumber, progress) => {
                    return new Promise(async resolve => {
                        const resp = await get("https://privatemessages.roblox.com/v1/messages?messageTab=inbox&pageNumber=" + (pageNumber - 1) + "&pageSize=20");
                        for (const message of resp.collection) {
                            if (cachedMessages.find(m => m.id == message.id)) {
                                resolve(true)
                                break
                            }
                            cachedMessages.push({
                                id: message.id,
                                sender: message.sender,
                                subject: message.subject,
                                body: message.body,
                                created: message.created
                            })
                        }
                        if (resp.pageNumber < Math.min(resp.totalPages - 1, 5000)) {
                            progress(20 * pageNumber, Math.min(resp.totalCollectionSize, 5000))
                            await sleep(400)
                            await getAllMessages(pageNumber + 1, progress)
                        }
                        resolve(true)
                    })
                }
                qs("#MessagesSearch").innerHTML = `
                <div class="loading modal-processing" id="loader">
                    <img class=loading-default src="https://images.rbxcdn.com/4bed93c91f909002b1f17f05c0ce13d1.gif" alt=Processing...>
                </div>
                <span class="wait-for-i18n-format-render" id="messages-text" 
                    style="display:flex; justify-content: center;">Indexing messages... This might take some time.</span>
                `
                await getAllMessages(1, async (currentAmount, totalAmount) => {
                    qs("#messages-text").textContent = `Please wait. Indexing messages... ${Math.floor(currentAmount / totalAmount * 100)}%`
                })
                window.LZMA_WORKER.compress(JSON.stringify(cachedMessages), 3, (compressed) => {
                    console.log(compressed)
                    console.log(JSON.parse(window.LZMA_WORKER.decompress(compressed)))
                    localStorage.setItem("rg-cachedMessages", JSON.stringify(compressed))
                })
                isGetting = false
                doSearch()
            } else if (cachedMessages.length > 0) {
                isGetting = false
                doSearch()
            }
        }), 100)
    })
})