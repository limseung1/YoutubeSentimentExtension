
# Bugs:

# 1. DONE
- Opening another tab does not make inference
- Cause: offscreen is already created, (only allowed to create one) preventing next tab from completing initalization
- Solution: check for existing offscreen and if so, send response and terminate initialize function

# 2. TODO
- Need to sanitize input texts before running inference with it
- Cause: texts may include symbols that are not Bigint
- Solution:


# 3. DONE
- Opening another video in another tab using new tab or window before inference ends causes silent fall

# 4. TODO
- Send message from content.js to background.js and then to offscreen.js for inference
- Navigate to different video before inference result comes back
- Observe two results, one inference result from previous video page, and one inference from current video page
- Maybe relevant: The service worker navigation preload request was cancelled before 'preloadResponse' settled. If you intend to use 'preloadResponse', use waitUntil() or respondWith() to wait for the promise to settle.