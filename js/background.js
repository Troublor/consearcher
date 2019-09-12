let payload = {
    keyword: null,
    site: null,
};
let consearchBtnId = null;

function createConsearchBtn() {
    if (payload.keyword !== null && payload.site !== null) {
        let siteText = mapSite(payload.site);
        // adjust keyword in a limited length
        let keyword = adjustText(payload.keyword, 20);
        // create menu item
        consearchBtnId = chrome.contextMenus.create({
            title: `Consearch ${keyword} in ${siteText}`,
            contexts: ["all"],
            onclick: info => doConsearch()
        });
    }
}


function deleteConsearchBtn() {
    if (consearchBtnId !== null) {
        chrome.contextMenus.remove(consearchBtnId);
    }
}

function updateConsearchBtn() {
    if (consearchBtnId === null) {
        createConsearchBtn();
    } else if (payload.keyword !== null && payload.site !== null) {
        let siteText = mapSite(payload.site);
        // adjust keyword in a limited length
        let keyword = adjustText(payload.keyword, 8);
        // create menu item
        chrome.contextMenus.update(consearchBtnId, {
            title: `Consearch ${keyword} in ${siteText}`,
        });
    }
}

function adjustText(text, length) {
    let newText = text;
    if (text.length > length) {
        newText = text.substring(0, length - 3);
        newText += "..."
    }
    return newText;
}

function mapSite(currentSite) {
    let site = null;
    switch (currentSite) {
        case 'baidu':
            site = 'Google';
            break;
        case 'google':
            site = 'Baidu';
            break;
        default:
            site = "Google";
    }
    return site;
}

function doConsearch() {
    // get the position of current active tab
    chrome.tabs.query({
        active: true,
        currentWindow: true,
    }, tabs => {
        let newTabPosition = tabs[0].index + 1;
        if (payload.site === 'baidu') {
            chrome.tabs.create({
                url: BaiduSearchUrl(payload.keyword),
                active: true,
                index:newTabPosition,
            });
        } else if (payload.site === 'google') {
            chrome.tabs.create({
                url: GoogleSearchUrl(payload.keyword),
                active: true,
                index:newTabPosition,
            });
        }
    })

}

/**
 * @return {string}
 */
function BaiduSearchUrl(keyword) {
    return encodeURI(`https://www.google.com/search?q=${keyword}`)
}

/**
 * @return {string}
 */
function GoogleSearchUrl(keyword) {
    return encodeURI(`https://www.baidu.com/s?wd=${keyword}`);
}


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (typeof request.keyword == 'string') {
        if (request.keyword !== payload.keyword || request.site !== payload.site) {
            console.log(`update keyword: ${request.keyword}`);
            payload.keyword = request.keyword;
            payload.site = request.site;
            updateConsearchBtn()
        } else {
            console.log("keyword not changed");
        }
        sendResponse({success: true});
    } else {
        console.error(`keyword is not a string: ${request.keyword}`);
        sendResponse({success: false});
    }
});

chrome.commands.onCommand.addListener(function (command) {
    if (command === 'do-consearch') {
        doConsearch();
    }
});