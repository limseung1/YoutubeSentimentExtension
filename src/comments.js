// how to use: 
// const arr = Array.from(getCommentElements()).map(comment => getCommentText(comment))


export function countTotalComments() {
    return parseInt(document.querySelector('#count .count-text .yt-formatted-string').textContent)
}

export function getCommentsContainer() {
    return document.querySelector('#comments #sections #contents')
}

export function getCommentElements() {
    return document.querySelectorAll('ytd-comment-thread-renderer')
}

function hideCommentElements(commentElements) {
    commentElements.forEach(commentElement => {
        commentElement.style.display = 'none'
    })
}

function showCommentElements(commentElements) {
    commentElements.forEach(commentElement => {
        commentElement.style.display = 'block'
    })
}

function getCommentText(commentElement) {
    return commentElement.querySelector('#comment #content-text').textContent
}

export function delay (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForNextBatch(startingCount, timeoutMs = 10000) {
    const startTime = Date.now();
    
    while (getCommentElements().length < startingCount + 20) {
        if (Date.now() - startTime > timeoutMs) {
            throw new Error('Timeout: Failed to load next batch of comments');
        }
        await delay(100);
    }
}

async function loadComments(n = 10) {
    // TODO handle the end of comments load
    // TODO adjust n 

    for (let i = 0; i < n; i ++) {
        const commentElements = getCommentElements();
        hideCommentElements(commentElements);
        await delay(100);
        await waitForNextBatch(commentElements.length)
    }

    showCommentElements(getCommentElements());
    console.log("Terminating ...")
    console.log("Total: ", getCommentElements().length)
}

// TODO handle comments disabled or comments = 0

