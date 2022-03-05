document.addEventListener('DOMContentLoaded', function() {
    var links = document.querySelectorAll("button[href]");
    for (var i = 0; i < links.length; i++) {
        (function() {
            var ln = links[i];
            var location = ln.getAttribute("href");
            ln.onclick = function() {
                chrome.tabs.create({ active: true, url: location });
            };
        })();
    }
});

function setTheme(themeName) {
    syncSet('theme', themeName);
    document.documentElement.className = themeName;
}

const getTheme = async() => {
    return new Promise((resolve) => {
        syncGet('theme', async(res) => { resolve(res.theme) })
    })
}

async function toggleTheme() {
    if (await getTheme() === 'theme-dark') {
        setTheme('theme-light');
    } else {
        setTheme('theme-dark');
    }
}

(async function() {
    if (await getTheme() === 'theme-dark') {
        setTheme('theme-dark');
        document.getElementById('slider').checked = false;
    } else {
        setTheme('theme-light');
        document.getElementById('slider').checked = true;
    }
    document.getElementById("slider").addEventListener("change", toggleTheme)
    document.querySelector(".version").innerHTML = "Version " + chrome.runtime.getManifest().version;
})();