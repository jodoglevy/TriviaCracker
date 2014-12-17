var oldSite = "234425";
var newSite = "258100";

// 160 X 600
var oldSlot1 = "slot97489";
var oldKey1 = "8a6";
var newSlot1 = "slot110111";
var newKey1 = "e09";

// 728 X 90
var oldSlot2 = "slot96645";
var oldKey2 = "0c8";
var newSlot2 = "slot110112";
var newKey2 = "d8b";

// 300 X 250
var oldSlot3 = "slot96790";
var oldKey3 = "bc5";
var newSlot3 = "slot110130";
var newKey3 = "3ab";


chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        var newUrl = details.url.replace(oldSite, newSite);
        
        newUrl = newUrl.replace(oldSlot1, newSlot1);
        newUrl = newUrl.replace(oldKey1, newKey1);

        newUrl = newUrl.replace(oldSlot2, newSlot2);
        newUrl = newUrl.replace(oldKey2, newKey2);

        newUrl = newUrl.replace(oldSlot3, newSlot3);
        newUrl = newUrl.replace(oldKey3, newKey3);

        console.log("Old: " + details.url);
        console.log("New: " + newUrl);
        
        return {
            redirectUrl: newUrl
        };
    },
    {
        urls: [
            "*://*.lfstmedia.com/geta*?site=" + oldSite,
            "*://*.lfstmedia.com/gate/dynamic/*"]
    },
    ["blocking"]
);