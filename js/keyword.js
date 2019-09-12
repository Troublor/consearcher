function updateKeyword() {
    let url = new URL(location.href);
    let payload = {
        keyword: null,
        site: null
    };
    if (url.hostname.toLowerCase().indexOf('google') >= 0) {
        if (!url.searchParams.has("q")) {
            return;
        }
        payload.site = 'google';
        payload.keyword = decodeGoogleKeyword(url.searchParams.get('q'));
    } else if (url.hostname.toLowerCase().indexOf('baidu') >= 0) {
        if (!url.searchParams.has("wd")) {
            return;
        }
        payload.site = 'baidu';
        payload.keyword = decodeBaiduKeyword(url.searchParams.get("wd"))
    } else {
        return;
    }
    saveKeyword(payload);
}

function decodeBaiduKeyword(keyword) {
    return decodeURI(keyword);
}

function decodeGoogleKeyword(keyword) {
    return keyword.replace('+', ' ');
}

function saveKeyword(payload) {
    console.log('keyword changed: ' + payload.keyword);
    chrome.runtime.sendMessage(payload, function (response) {
        if (response.success) {
            console.log("keyword update success (" + payload.keyword + ")");
        } else {
            console.log("keyword update failed (" + payload.keyword + ")");
        }
    });
}

// TODO need to distinguish between search page and normal page

// TODO listen to the change of url
updateKeyword();


