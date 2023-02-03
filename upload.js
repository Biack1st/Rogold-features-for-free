/*
    RoGold
    Coding and design by Alrovi Aps.
    Contact: contact@alrovi.com
    Copyright (C) Alrovi Aps
    All rights reserved.
*/

pages.upload = (async () => {
    const theme = await cacheValue('Theme', async () => {
        return new Promise(async resolve => {
            const actualTheme = await get('https://accountsettings.roblox.com/v1/themes/user')
            resolve(actualTheme.themeType)
        })
    }, 60000);
    (await first('#rbx-body'));
    document.getElementById('rbx-body').className = `rbx-body ${theme.toLowerCase()}-theme gotham-font`
    const uploadType = await getSetting('Bulk Upload')
    if (uploadType == "None") return;
    let assetTypeIds = [
        // '2',  // T-Shirts
        // '11', // Shirts
        // '12', // Pants
        '13'  // Decals
    ];
    let assetTypeName = {
        // "2": "T-Shirts",
        // "11": "Shirts",
        // "12": "Pants",
        "13": "Decals"
    }
    let assetTypeId = (await first('#assetTypeId')).value;
    let onDevelopPage = window.parent.location.pathname.indexOf('/develop') == 0;
    if (assetTypeIds.indexOf(assetTypeId) >= 0) {
        if (uploadType != "All" && assetTypeName[assetTypeId] != uploadType) {
            return
        }
        document.querySelector('label').innerText = "Find your image(s)"
        $('#upload-button')
            .parent()
            .append('<div id="success-count" class="status-confirm btn-level-element" style="display:none">')
            .append('<div id="error-count" class="status-error btn-level-element" style="display:none;background-color:#221F1F;border:1px solid #622A2A;">');
        document.getElementById('loading-container').getElementsByTagName('img').src = "https://images.rbxcdn.com/4bed93c91f909002b1f17f05c0ce13d1.gif"
        document.getElementById('loading-container').setAttribute('style', 'width:50px; height:100px;')
        let fileInput = document.getElementById('file');
        fileInput.multiple = 'multiple';
        fileInput.setAttribute('accept', 'image/*')
        document.getElementById('upload-form').setAttribute('onsubmit', 'return false')
        document.getElementById('upload-form').addEventListener('submit', (e) => {e.preventDefault()})
        const fee = {price:0} //await postRepeat(`https://itemconfiguration.roblox.com/v1/avatar-assets/${assetTypeId}/get-upload-fee`, {})
        let i = 0
        fileInput.addEventListener('input', () => {
            if (fee.price > 0) {
                document.getElementById('upload-button').innerText = `Upload (${fileInput.files.length} files) for ${fee.price * fileInput.files.length} Robux`
            } else {
                document.getElementById('upload-button').innerText = `Upload (${fileInput.files.length} files)`
            }
            for (const file of fileInput.files) {
                if (i == 12) break;
                i ++
                let minImage = document.createElement('img')
                minImage.setAttribute('style', 'width: 50px; height: 50px;')
                minImage.src = URL.createObjectURL(file)
                minImage.alt = file.name
                minImage.title = file.name
                document.getElementById('container').insertBefore(minImage,document.getElementById('upload-button').parentNode)
            }
        })
        document.getElementById('name').parentNode.setAttribute('style', 'display:none;');//.removeChild(document.getElementById('name').parentNode);
        document.getElementById('upload-button').addEventListener('click', (e) => {
            e.preventDefault();
            assetTypeId = document.getElementById('assetTypeId').value;
            let groupId = document.getElementById('groupId').value;
            let requestVerificationToken = document.getElementsByName('__RequestVerificationToken')[0].value;
            let files = document.getElementById('file').files;
    
            $('#loading-container').show();
            $('#success-count').hide();
            $('#error-count').hide();
            let successCount = 0;
            let errorCount = 0;
    
            for (const file of files) {
                let data = new FormData();
                data.append('assetTypeId', assetTypeId);
                data.append('groupId', groupId);
                data.append('__RequestVerificationToken', requestVerificationToken);
                data.append('file', file, file.name);
                let fileNameWithoutExtension = file.name.split('.')[0]; // everything up to the first period
                data.append('name', fileNameWithoutExtension || file.name.replace(/\.[^/.]+$/, "") || "upload");
    
                $.ajax({
                    type: 'POST',
                    url: 'https://www.roblox.com/build/upload',
                    data: data,
                    contentType: false,
                    processData: false,
                    success: function (html) {
                        let result = $(html).find('#upload-result');
                        $('#loading-container').hide();
                        if (result.hasClass('status-confirm')) {
                            successCount++;
                            let successUrl = '/develop'
                            if (groupId > 0) {
                                successUrl += '/groups/' + groupId;
                            }
                            successUrl += '?View=' + assetTypeId;
                            if (groupId > 0 && !onDevelopPage && assetTypeId != '13') {
                                successUrl = $('a:contains("all group items")', window.parent.document).attr('href');
                            }
                            $('#success-count').html('<a href="' + successUrl + '">' + successCount + ' successful uploads</a>');
                            $('#success-count').click(() => {
                                window.top.location.href = successUrl;
                            });
                            $('#success-count').css('display', 'inline-block');
                        } else {
                            errorCount++;
                            $('#error-count').text(errorCount + ' failed uploads');
                            $('#error-count').show();
                        }
                        if (successCount + errorCount == files.length && successCount > 0 && onDevelopPage) {
                            let url = '/build/assets?assetTypeId=' + assetTypeId;
                            if (groupId) {
                                url += '&groupId=' + groupId;
                            }
                            url += '&_=' + new Date().getTime();
                            $('.tab-active .items-container', window.parent.document).load(url);
                        }
                    },
                    error: function(err) {
                        console.log(err)
                        errorCount++;
                        $('#error-count').text(errorCount + ' failed uploads');
                        $('#error-count').show();
                    }
                });
            }
        });
    }
})