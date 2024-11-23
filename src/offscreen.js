import { GoEmotionClassifier } from './classifier.js';

let classifier = null;

async function initialize(sendResponse) {
    classifier = new GoEmotionClassifier();
    await classifier.initialize();

    sendResponse({ 
        received: true, 
        success: true
    });
}

async function classify(message, sendResponse) {
    try {
        if (!classifier.session) 
            throw new Error('Classifier not initialized');
        
        const texts = message.data;
        let results = [];
        for (const text of texts) {
          try {
            const {input_ids, attention_mask} = await classifier.tokenize(text)
            const result = await classifier.classify(input_ids, attention_mask)
            result['text'] = text
            results.push(result)
          } catch (error) {
            // TODO: sanitize comment for ' and ` symbols
            console.log(error)
            results.push({
                prediction: 'Unknown',
                confidence: 0,
                scores: {},
                text: text
            })
          }
        }

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

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.target !== "offscreen") return;

    if (message.action === "initialize")
        initialize(sendResponse)
    if (message.action === "classify")
        classify(message, sendResponse)

    return true;
})