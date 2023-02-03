// window.postMessage({
//     type: 'ANGULAR_RETRIEVE_DATA',
//     data: window.angular
// }, '*');
window.addEventListener('message', (event) => {
    const info = event.data.data;
    if (event.data.type === "angular" && info.type === "trigger") {
        window.angular.element(document.querySelector(info.selector)).triggerHandler(info.event);
    }
});