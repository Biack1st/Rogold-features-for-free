/*
    RoGold

    Coding and design by alexop1000 (AlexOp).
    Contact: https://rogold.me/invite

    Copyright (C) alexop1000 
	All rights reserved.
*/

pages.develop = (async () => {
    let loaded = false
    const loadF = async () => {
        if (loaded) return
        loaded = true
        const theme = await cacheValue('Theme', async () => {
            return new Promise(async resolve => {
                const actualTheme = await get('https://accountsettings.roblox.com/v1/themes/user')
                resolve(actualTheme.themeType)
            })
        }, 60000)
        if (!await getSetting("Better Styling")) {
            // Remove stylesheet with href 
            document.querySelector(`link[href*="${chrome.runtime.getURL("/css/develop.css")}"]`).remove()
            return
        }
        await first("#rbx-body")
        document.getElementById('rbx-body').className = `rbx-body ${theme.toLowerCase()}-theme gotham-font`
        if (document.getElementById('rbx-body').className.includes('light-theme')) return;
        // for (const item of document.getElementsByClassName('tab-item')) {
        //     //console.log(item)
        //     item.style = "color: white !important;"
        // }
        $(".tab-item").attr("style", "color: white !important;");
        $(document).on("inserted",".tab-item",function(){
            $(this).attr("style", "color: white !important;");
        });
        setInterval(() => {
            for (const item of document.querySelectorAll('.tab-item')) {
                item.style = "color: white !important;"
            }
        }, 1000)
    }
    window.onload = loadF
    setTimeout(loadF, 100)
    $(document).ready(loadF)
})