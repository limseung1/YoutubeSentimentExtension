import { getCommentsContainer, waitForCommentContainer, isCommentNode, getCommentFromNode } from './comments'



async function runInitialize () {
    const initStart = performance.now();
    await chrome.runtime.sendMessage({
        target: 'background',
        action: 'initialize'
    });
    console.log("Initialize runtime: ", performance.now() - initStart)

    return true
}

async function runInference({ comments, nodes }) {

    const infStart = performance.now();
    const response = await chrome.runtime.sendMessage({
        target: 'background',
        action: 'classify',
        data: comments
    });
    console.log("Inference runtime: ", performance.now() - infStart)
    console.log("Response: ", response)

    label(nodes)

    return true
}


function label (nodes) {
    console.log(nodes)
}

function processComments (commentNodes) {
    const nodes = commentNodes.slice(-20).filter(node => isCommentNode(node));
    const comments = nodes.map(node => getCommentFromNode(node));

    return { comments, nodes }
}

async function attachCommentsObserver() {
    await waitForCommentContainer()
    const commentsContainer = getCommentsContainer();
    let comments = []
    //TODO send for inference for comments already in commentsContainer

    const commentsContainerObserver = new MutationObserver(async (mutations) => {
        for (const { addedNodes } of mutations)
            comments.push(...addedNodes)

        if (comments.length % 20 === 0)
            await runInference(processComments(comments))

        // TODO if last batch of comments, comments.length may not be divisible by 20
        // and be careful with -1 with continuation element
    })
    commentsContainerObserver.observe(commentsContainer, {
        childList: true,        // observe direct children
        subtree: false,         // don't observe all descendants
        attributes: false,      // don't observe attribute changes
        characterData: false    // don't observe text content changes
    });
};

// detect navigation 
document.addEventListener('yt-navigate-finish', async function() {
    if (window.location.href.includes('youtube.com/watch')) {
        await attachCommentsObserver()
        await runInitialize()
    }
});