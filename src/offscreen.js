import { GoEmotionClassifier } from './classifier.js';

let classifier = null;

// Initialize classifier when the page loads
async function initializeClassifier(sendResponse) {
    classifier = new GoEmotionClassifier();
    await classifier.initialize();
    console.log('Classifier initialized successfully');

    sendResponse({ 
        received: true, 
        success: true
    });
}

async function handleMessage(message, sender, sendResponse) {
    try {
        if (!classifier.session) throw new Error('Classifier not initialized');
        
        const texts = message.data;

        let results = [];
        for (const text of texts) {
          try {
            const {input_ids, attention_mask} = await classifier.tokenize(text)
            const result = await classifier.classify(input_ids, attention_mask)
            results.push(result)
          } catch (error) {
            console.log(error)
          }
        }
        // const {input_ids, attention_mask} = await classifier.tokenize(text)
        // const result = await classifier.classify(input_ids, attention_mask)

        sendResponse({ 
            received: true, 
            data: results,
            success: true
        });
    } catch (error) {

        sendResponse({ 
            received: true, 
            error: error.message,
            success: false
        });
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.target !== "offscreen") return;

    if (message.action === "initialize")
        initializeClassifier(sendResponse).catch(console.error);
    if (message.action === "classify")
        handleMessage(message, sender, sendResponse)

    return true;
})