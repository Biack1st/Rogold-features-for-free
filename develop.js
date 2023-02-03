/*
    RoGold
    Coding and design by Alrovi Aps.
    Contact: contact@alrovi.com
    Copyright (C) Alrovi Aps
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
    setTimeout(loadF, 100)

    if (!(await getSetting("Audio Preview"))) return;

    const blobToUri = async (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve(e.target.result);
            };
            reader.onerror = (e) => {
                reject(e);
            };
            reader.readAsDataURL(blob);
        });
    };
    const getAudio = async (url) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.responseType = 'arraybuffer';
            xhr.onload = (e) => {
                if (xhr.status == 200) {
                    const blob = new Blob([xhr.response], { type: 'audio/mpeg' });
                    blobToUri(blob).then(resolve).catch(reject);
                } else {
                    reject(e);
                }
            };
            xhr.onerror = (e) => {
                reject(e);
            };
            xhr.send();
        })
    }
    const calculateTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const seconds2 = Math.floor(seconds % 60);
        return `${minutes < 10 ? `${minutes}` : minutes}:${seconds2 < 10 ? `0${seconds2}` : seconds2}`;
    }

    let currentlyPlaying = null;
    
    const createPlayer = async (el, smaller = true) => {
        const player = qs(".MediaPlayerControls", el)
        if (!player) return;
        const audio = new Audio()
        const src = await getAudio(qs(".MediaPlayerIcon", player).getAttribute("data-mediathumb-url"))
        audio.src = src
    
        qs(".MediaPlayerIcon", player).remove()

        player.style = `top: -45px;width: 100%;left: 0px;`
    
        const progressBar = createElement("div", {className: "progressBar", style: `
            margin-left: 10px;
            width: 86%;
            height: 40px;
            display: flex;
            position: absolute;
            top: 89%;
            align-items: center;
            flex-wrap: wrap;
        `})
        player.appendChild(progressBar)
    
        const timerStart = createElement("div", {style: `margin-right: auto;font-size: ${smaller && "x-small" || "small"};`, textContent: "0:00"})
        progressBar.appendChild(timerStart)
        const timerEnd = createElement("div", {style: `font-size: ${smaller && "x-small" || "small"};`, textContent: "0:00"})
        progressBar.appendChild(timerEnd)
    
        const canvas = createElement("canvas", {style: `
            width: 100%;
            margin: 0px auto;
            height: ${smaller && 5 || 8}px;
            background: #191919;
        `})
        await sleep(500)
        progressBar.appendChild(canvas)
    
        const playIcon = createElement("div", {className: "MediaPlayerIcon icon-play", style: `
            left: ${smaller && 39 || 89}%;
            position: absolute;
            cursor: pointer;
            z-index: 1000;
            background-position: 0px -330px;
            width: 30px;
            height: 30px;
            background-size: 60px;
        `})
        player.appendChild(playIcon)
    
        canvas.addEventListener("click", (e) => {
            const progressWidth = parseInt(window.getComputedStyle(canvas).width)
            const progressDone = (e.clientX - canvas.getBoundingClientRect().left) / progressWidth
            audio.currentTime = audio.duration * progressDone
        })
    
        const updateProgressBar = () => {
            const { currentTime, duration } = audio;
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#00b06f";
            ctx.fillRect(0, 0, canvas.width * (currentTime / duration), canvas.height);
            timerStart.innerText = calculateTime(currentTime)
            timerEnd.innerText = calculateTime(duration)
        }
    
        audio.addEventListener("timeupdate", updateProgressBar)
        const onPaused = () => {
            playIcon.style.backgroundPosition = "0px -330px"
            updateProgressBar()
        }
        audio.addEventListener("ended", onPaused)
        audio.addEventListener("pause", onPaused)
        audio.addEventListener("canplaythrough", updateProgressBar)
        audio.addEventListener("canplay", updateProgressBar)
        playIcon.addEventListener("click", () => {
            if (audio.paused) {
                if (currentlyPlaying && currentlyPlaying !== audio) {
                    currentlyPlaying.pause()
                    currentlyPlaying.currentTime = 0
                }
                audio.play()
                playIcon.style.backgroundPosition = "0px -360px"
                currentlyPlaying = audio
            } else {
                audio.pause()
                playIcon.style.backgroundPosition = "0px -330px"
            }
        })
        setTimeout(updateProgressBar, 2000)
    }
    on(".CatalogItemOuter", async(el) => createPlayer(el))
    on("#AssetThumbnail", async(el) => createPlayer(el, false))
})