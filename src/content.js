import { getCommentsContainer, waitForCommentContainer, isCommentNode, getCommentFromNode } from './comments'

let commentsContainerObserver;
let hasLanded = false

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
    label(nodes, response)

    return true
}


function label(nodes, response) {
    const inferenceResults = response.data
    console.log(inferenceResults)

    for (let i = 0; i < nodes.length; i++) {
        const wrapper = nodes[i].querySelector('#comment #content');

        const label = document.createElement('label');
        label.textContent = inferenceResults[i].prediction;
        label.style.backgroundColor = 'red';
        label.style.padding = '0.5rem';
        label.style.marginRight = '0.25rem';

        wrapper.insertBefore(label, wrapper.firstChild);
    }
}

function processComments (commentNodes) {
    const nodes = commentNodes.slice(-20).filter(node => isCommentNode(node));
    const comments = nodes.map(node => getCommentFromNode(node));
    
    return { comments, nodes }
}

async function waitForVisibility () {
    if (document.hidden) {
        // Wait for tab to become active before starting observer
        await new Promise(resolve => {
            const onVisible = () => {
                if (!document.hidden) {
                    document.removeEventListener('visibilitychange', onVisible);
                    resolve();
                }
            };
            document.addEventListener('visibilitychange', onVisible);
        });
    }
}

async function attachCommentsObserver() {
    await waitForVisibility()
    await waitForCommentContainer()
    const commentsContainer = getCommentsContainer();
    let comments = []

    commentsContainerObserver = new MutationObserver(async (mutations) => {
        // TODO Problem: We are not collecting 20 comments; 20 comments + 1 continuation 
        // Try loging comments only here
        for (const { addedNodes } of mutations) {
            comments.push(...addedNodes)
        }
        
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
    if (window.location.href.includes('youtube.com/watch') && !hasLanded) {
        await attachCommentsObserver()
    }
});

// detect navigation 
document.addEventListener('yt-navigate-start', async function() {
    if (window.location.href.includes('youtube.com/watch')) {
        commentsContainerObserver && commentsContainerObserver.disconnect()
        hasLanded = false
    }
});

// detect landing
(async function land() {
    hasLanded = true
    if (window.location.href.includes('youtube.com/watch')) {
        await attachCommentsObserver()
        await runInitialize()
    }
})()
