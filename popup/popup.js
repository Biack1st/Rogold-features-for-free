document.addEventListener('DOMContentLoaded', function () {
    let links = document.querySelectorAll('button[href]');
    for (let i = 0; i < links.length; i++) {
        (function () {
            let ln = links[i];
            let location = ln.getAttribute('href');
            ln.onclick = function () {
                chrome.tabs.create({ active: true, url: location });
            };
        }());
    }
});
(async function () {
    document.querySelector('.version').innerHTML = 'Version ' + chrome.runtime.getManifest().version;
}());