/*
    RoGold

    Coding and design by alexop1000 (AlexOp).
    Contact: https://rogold.me/invite

    Copyright (C) alexop1000 
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
        const body = stripTags(div.textContent)
        let amount = 0
        for (const word of body.split(" ")) {
            if (sus.includes(word.toLowerCase())) {
                amount ++;
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
                if (!div.getElementsByClassName("message-summary-username")[0]) continue;
                if (!div.getElementsByClassName("message-summary-username")[0].getElementsByClassName("element")[1]) continue;
                if (div.getElementsByClassName("text-preview")[0].innerText.toLowerCase() === body && div.getElementsByClassName("message-summary-username")[0].getElementsByClassName("element")[1].innerText === message.sender.name) {
                    if (div.classList.contains("rogold")) continue;
                    div.classList.add("rogold")
                    if (message.sender.id === 1) continue;
                    const susWords = sus.filter(word => body.includes(word));
                    if (susWords.length > 1) {
                        div.style.backgroundColor = `rgba(255, ${255 - (susWords.length * 50)}, ${255 - (susWords.length * 50)}, 0.3)`
                    }
                }
            }
        }
    }, 1000)
})