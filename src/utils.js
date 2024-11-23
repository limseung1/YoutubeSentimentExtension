export function delay (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function poll (condition, timeout) {
    const start = Date.now();

    while (condition()) {
        if (Date.now() - start > timeout)
            throw new Error('Timeout: Polling ended due to timeout');
        
        await delay(100);
    }
}