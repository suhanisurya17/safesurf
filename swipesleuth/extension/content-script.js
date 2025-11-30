// Content Script - Bridge between page and extension
console.log('[SwipeSleuth Content Script] Loaded');

// Listen for messages from the page
window.addEventListener('message', (event) => {
  // Security: Only accept messages from same window
  if (event.source !== window) return;
  
  // Only process messages from SwipeSleuth page
  if (!event.data || event.data.source !== 'swipesleuth-page') return;
  
  console.log('[Content Script] Received from page:', event.data.type);
  
  // Forward to service worker
  chrome.runtime.sendMessage({
    type: event.data.type,
    requestId: event.data.requestId,
    payload: event.data.payload
  }, (response) => {
    // Forward response back to page
    if (chrome.runtime.lastError) {
      console.error('[Content Script] Extension error:', chrome.runtime.lastError);
      // Send error back to page
      window.postMessage({
        source: 'swipesleuth-ext',
        type: 'ERROR',
        payload: { error: chrome.runtime.lastError.message },
        requestId: event.data.requestId
      }, '*');
    } else if (response) {
      console.log('[Content Script] Forwarding response:', response.type);
      window.postMessage({
        source: 'swipesleuth-ext',
        type: response.type,
        payload: response.payload,
        requestId: response.requestId
      }, '*');
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
  console.log('[Content Script] Initializing injection...');
  console.log('[Content Script] Document ready state:', document.readyState);
  console.log('[Content Script] Current URL:', window.location.href);

  // Run immediately to ensure API is available
  if (document.readyState === 'loading') {
    console.log('[Content Script] Waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', injectAPI);
  } else {
    console.log('[Content Script] Document already loaded, injecting immediately...');
    injectAPI();
  }

  function injectAPI() {
    console.log('[Content Script] injectAPI() called');

    // Check if already injected
    if (window.swipesleuthAPI) {
      console.log('[Content Script] API already injected');
      return;
    }

    console.log('[Content Script] Creating script element using blob URL to avoid CSP...');

    // Create script content as a blob to bypass CSP
    const scriptContent = `
      (function() {
        console.log('[Injected Script] Running in page context...');
        // Page-side message handler
        window.swipesleuthAPI = {
          requestExamples: function() {
            return new Promise((resolve, reject) => {
              const requestId = 'req-' + Date.now() + '-' + Math.random();

              const handler = (event) => {
                if (event.data && event.data.source === 'swipesleuth-ext' &&
                    event.data.type === 'RESPONSE_EXAMPLES' &&
                    event.data.requestId === requestId) {
                  window.removeEventListener('message', handler);
                  clearTimeout(timeoutId);
                  resolve(event.data.payload || []);
                }
              };

              window.addEventListener('message', handler);

              // Send request
              window.postMessage({
                source: 'swipesleuth-page',
                type: 'GET_EXAMPLES',
                requestId: requestId
              }, '*');

              // Timeout after 5 seconds
              const timeoutId = setTimeout(() => {
                window.removeEventListener('message', handler);
                reject(new Error('Timeout waiting for extension response'));
              }, 5000);
            });
          }
        };
        console.log('[SwipeSleuth] API injected');
      })();
    `;

    const blob = new Blob([scriptContent], { type: 'text/javascript' });
    const blobUrl = URL.createObjectURL(blob);
    const script = document.createElement('script');
    script.src = blobUrl;
    script.onload = () => {
      console.log('[Content Script] Script loaded successfully');
      URL.revokeObjectURL(blobUrl);
    };
    script.onerror = (error) => {
      console.error('[Content Script] Script load error:', error);
      URL.revokeObjectURL(blobUrl);
    };

    (document.head || document.documentElement).appendChild(script);
  }
})();

