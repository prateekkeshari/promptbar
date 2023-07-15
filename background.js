// Here, chrome.storage.sync is replaced with chrome.storage.local because sync is not available in MV3
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === 'savePrompt') {
        chrome.storage.local.set({[request.prompt]: true}, function() {
            sendResponse({status: 'success'});
        });
    } else if (request.type === 'getPrompts') {
        chrome.storage.local.get(null, function(items) {
            sendResponse({prompts: Object.keys(items)});
        });
    }

    // Return true to indicate that we will send a response asynchronously
    return true;
});
