'use strict';

// https://developer.chrome.com/extensions/background_pages

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GREETINGS') {
    // Log message coming from the `request` parameter
    console.log(request.payload.message);
    // Send a response message
  }
});
