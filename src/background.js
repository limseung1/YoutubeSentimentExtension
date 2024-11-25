async function sendInitialize(sendResponse) {
    if (await chrome.offscreen.hasDocument()) {
        sendResponse( { initialized: false, success: true } )
        return
    }
    await chrome.offscreen.createDocument({
        url: "offscreen.html",
        reasons: ["BLOBS"],
        justification: "inference",
    });

    const result = await chrome.runtime.sendMessage({
        target: "offscreen",
        action: "initialize"
    });

    sendResponse( { initialized: true, success: result.success } );
}

async function sendClassify(message, sendResponse) {
    const result = await chrome.runtime.sendMessage({
        target: "offscreen",
        action: "classify",
        data: message.data
    });

    sendResponse({ 
        received: true, 
        data: result.data,
    });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.target !== "background") return;

    if (message.action === "initialize") 
        sendInitialize(sendResponse)
    if (message.action === "classify") 
        sendClassify(message, sendResponse)

    return true; // see https://stackoverflow.com/a/46628145 for more information
});  
