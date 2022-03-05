window.addEventListener('message', (event) => {
    if (event.source == window &&
        event.data) {
            if (event.data.direction == "Join") {
                Roblox.GameLauncher.joinGameInstance(event.data.PlaceId, event.data.Guid)
            } else if (event.data.direction == "PlayPlace") {
                Roblox.GameLauncher.joinMultiplayerGame(event.data.PlaceId)
            } else if (event.data.direction == "EditPlace") {
                Roblox.GameLauncher.editGameInStudio(event.data.PlaceId)
            }
        }
})