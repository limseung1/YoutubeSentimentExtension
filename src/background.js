
async function createOffscreen() {
    if (await chrome.offscreen.hasDocument()) return;
    await chrome.offscreen.createDocument({
        url: "offscreen.html",
        reasons: ["BLOBS"],
        justification: "inference",
    });
}

async function triggerInitialize(message, sender, sendResponse) {
    await createOffscreen();
    const result = await chrome.runtime.sendMessage({
        target: "offscreen",
        action: "initialize"
    });

    sendResponse({ 
        received: true, 
        success: result.success
    });
}

async function handleMessage(message, sender, sendResponse) {
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.target !== "background") return;

    if (message.action === "initialize") 
        triggerInitialize(message, sender, sendResponse)
    if (message.action === "classify") 
        handleMessage(message, sender, sendResponse)

    return true; // see https://stackoverflow.com/a/46628145 for more information
});  
