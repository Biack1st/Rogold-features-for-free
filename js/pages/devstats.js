/*
    RoGold

    Coding and design by alexop1000 (AlexOp).
    Contact: https://rogold.me/invite

    Copyright (C) alexop1000 
	All rights reserved.
*/

pages.devstats = async () => {
    // TODO: This is for the next update and currently does not serve a purpose.
    const mainContent = await first('.content');
    mainContent.getElementsByClassName('request-error-page-content')[0].remove()
    mainContent.innerHTML = `
    <div class="section profile-statistics" id="profile-statistics-container"></div>
    `
    let userId = await get(`https://users.roblox.com/v1/users/authenticated`)
	userId = userId.id
	let userInfo = await get('https://users.roblox.com/v1/users/' + userId)
    const overAllCategory = document.createElement('div')
    overAllCategory.className = 'section profile-statistics'
    overAllCategory.innerHTML = `
    <div class="section profile-statistics">
        <div class="container-header">
            <h3>Statistics</h3>
        </div>
        <div class="section-content">
            <ul class="profile-stats-container">
            <li class="profile-stat" style="width: 33%;">
                <p class="text-label">Join Date</p>
                <p class="text-lead" title="${dateSince(userInfo.created)}">${dateFormat(userInfo.created, "MM/DD/YYYY")}</p>
            </li>
            <li class="profile-stat" style="width: 33%;">
                <p class="text-label">Place Visits</p>
                <p class="text-lead">5,556,567</p>
            </li>
            <li class="profile-stat" style="width:33%;">
                <p class="text-label">Total Favorites</p>
                <p class="text-lead">44,797</p>
            </li>
            <li class="profile-stat" style="width:33%;">
                <p class="text-label">Current Active</p>
                <p class="text-lead">44</p>
            </li>
            <li class="profile-stat" style="width:33%;">
                <p class="text-label">Total Group Members</p>
                <p class="text-lead">290,140</p>
            </li>
            </ul>
        </div>
    </div>
    `
    mainContent.appendChild(overAllCategory)
}