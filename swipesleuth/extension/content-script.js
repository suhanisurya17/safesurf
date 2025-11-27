// Content Script - Bridge between page and extension

// Listen for messages from the page
window.addEventListener('message', (event) => {
  // Security: Only accept messages from same window
  if (event.source !== window) return;
  
  // Only process messages from SwipeSleuth page
  if (!event.data || event.data.source !== 'swipesleuth-page') return;
  
  // Forward to service worker
  chrome.runtime.sendMessage({
    type: event.data.type,
    requestId: event.data.requestId,
    payload: event.data.payload
  }, (response) => {
    // Forward response back to page
    if (response && chrome.runtime.lastError === undefined) {
      window.postMessage({
        source: 'swipesleuth-ext',
        type: response.type,
        payload: response.payload,
        requestId: response.requestId
      }, '*');
    } else if (chrome.runtime.lastError) {
      console.error('Extension error:', chrome.runtime.lastError);
    }
  });
});

// Listen for messages from service worker
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg) return false;
  
  // Forward to page
  window.postMessage({
    source: 'swipesleuth-ext',
    type: msg.type,
    payload: msg.payload,
    requestId: msg.requestId
  }, '*');
  
  return false;
});

// Inject page script to enable communication
(function() {
  const script = document.createElement('script');
  script.textContent = `
    (function() {
      // Page-side message handler
      window.swipesleuthAPI = {
        requestExamples: function() {
          return new Promise((resolve, reject) => {
            const requestId = 'req-' + Date.now() + '-' + Math.random();
            
            const handler = (event) => {
              if (event.data.source === 'swipesleuth-ext' && 
                  event.data.type === 'RESPONSE_EXAMPLES' &&
                  event.data.requestId === requestId) {
                window.removeEventListener('message', handler);
                resolve(event.data.payload);
              }
            };
            
            window.addEventListener('message', handler);
            
            window.postMessage({
              source: 'swipesleuth-page',
              type: 'GET_EXAMPLES',
              requestId: requestId
            }, '*');
            
            // Timeout after 5 seconds
            setTimeout(() => {
              window.removeEventListener('message', handler);
              reject(new Error('Timeout waiting for extension response'));
            }, 5000);
          });
        }
      };
    })();
  `;
  (document.head || document.documentElement).appendChild(script);
  script.remove();
})();

