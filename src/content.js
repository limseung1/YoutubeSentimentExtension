import { getCommentElements, getCommentsContainer, countTotalComments, delay } from './comments'
import { test_texts } from './test.js'

(async function execute() {

    // initialize classifier
    const initStart = performance.now();
    await chrome.runtime.sendMessage({
        target: 'background',
        action: 'initialize'
    });
    console.log("Initialize runtime: ", performance.now() - initStart)

    // inference in batch
    const infStart = performance.now();
    const response = await chrome.runtime.sendMessage({
        target: 'background',
        action: 'classify',
        data: test_texts
    });
    console.log("Batch Inference runtime: ", performance.now() - infStart)
    console.log("Response: ", response)



    // const commentsContainer = getCommentsContainer();
    // let previousCount = getCommentElements().length;
    // let currentAddedNodesCount = 0;

    // const observer = new MutationObserver(async (mutations) => {
    //     const currentCount = getCommentElements().length;
    //     const totalCount = countTotalComments();

    //     const addedNodesCount = mutations.reduce((count, mutation) => count + mutation.addedNodes.length, 0)

    //     if (currentCount === 0) {
    //         console.log("Comments disabled or none exist")
    //         return
    //     }

    //     if (currentCount !== previousCount) {
    //         previousCount = currentCount;
    //         // TODO send data to classify
    //         console.log("classify")
    //         console.log(mutations)
    //         // const text = ...mutations
    //         // const {input_ids, attention_mask} = await classifier.tokenize(text)
    //         // const result = await classifier.classify(input_ids, attention_mask)
    //         currentAddedNodesCount += addedNodesCount
    //         console.log(currentAddedNodesCount)
    //         // console.log(currentCount)
    //         // console.log(previousCount)
    //     }

    //     if (currentCount !== totalCount && previousCount + 20 === currentCount) {
    //         // TODO load more comments
    //         console.log("need to load more comment")
    //     }

    //     if (currentCount === totalCount) {
    //         console.log("The end")
    //     }
    // });

    // // Start observing the document with the configured parameters
    // observer.observe(commentsContainer, {
    //     childList: true,        // observe direct children
    //     subtree: false,         // don't observe all descendants
    //     attributes: false,      // don't observe attribute changes
    //     characterData: false    // don't observe text content changes
    // });
    return true
})();