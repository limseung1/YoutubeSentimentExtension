import { poll } from './utils.js'


export function isCommentNode (node) {
    return node.nodeName.toLowerCase() === 'ytd-comment-thread-renderer'
}
export function getCommentFromNode(node) {
    return node.querySelector('#comment #content-text').textContent
}


///////////////////////////////////////////////////////////////////////////////////////
export function getComments() {
    return Array.from(getCommentElements()).map(element => getCommentText(element))
}

function getCommentElements() {
    return document.querySelectorAll('ytd-comment-thread-renderer[read]')
}

function getCommentText(commentElement) {
    return commentElement.querySelector('#comment #content-text').textContent
}
///////////////////////////////////////////////////////////////////////////////////////
export function countTotalComments() {
    return parseInt(document.querySelector('#count .count-text .yt-formatted-string').textContent)
}

export function getCommentsContainer() {
    return document.querySelector('#comments #sections #contents')
}
///////////////////////////////////////////////////////////////////////////////////////
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
///////////////////////////////////////////////////////////////////////////////////////
export async function waitForCommentContainer() {
    await poll(() => getCommentsContainer() === null, 5000)
}

async function waitForNextBatch(startingCount) {
    await poll(() => getCommentElements().length < startingCount + 20, 10000)
}
///////////////////////////////////////////////////////////////////////////////////////
async function autoLoadComments(n = 10) {
    // TODO handle comments disabled or comments = 0
    // TODO handle the end of comments load
    // TODO adjust n 

    for (let i = 0; i < n; i ++) {
        const commentElements = getCommentElements();
        hideCommentElements(commentElements);
        await waitForNextBatch(commentElements.length)
    }

    showCommentElements(getCommentElements());
    console.log("Terminating ...")
    console.log("Total: ", getCommentElements().length)
}


