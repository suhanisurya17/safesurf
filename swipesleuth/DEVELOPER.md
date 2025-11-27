# Developer Notes - SwipeSleuth

## Architecture Overview

### Messaging Flow

```
Website (React) 
  ↓ window.postMessage
Content Script (bridge)
  ↓ chrome.runtime.sendMessage
Service Worker (extension)
  ↓ chrome.storage / processing
Response flows back up
```

### Key Design Decisions

1. **Content Script as Bridge**: Prevents direct website ↔ extension communication issues
2. **chrome.storage.sync for Progress**: Small data, cross-device sync
3. **chrome.storage.local for Examples**: Large data, device-specific
4. **Request IDs**: Correlate requests/responses for async messaging

## Code Organization

### Extension Files

- `service-worker.js`: Main extension logic, seed data, message handling
- `content-script.js`: Bridge between page and extension
- `popup/`: Extension popup UI (optional, for admin functions)

### Website Files

- `App.jsx`: Main app, handles examples loading, stats management
- `components/SwipeDeck.jsx`: Card swiping logic
- `components/Card.jsx`: Individual card UI
- `components/Scoreboard.jsx`: Progress display
- `utils/scoring.js`: Game logic, scoring, level calculation

## Extending Functionality

### Adding New Message Types

1. **Service Worker** (`service-worker.js`):
   ```javascript
   case 'NEW_MESSAGE_TYPE':
     // Handle logic
     sendResponse({ type: 'RESPONSE_NEW', payload: data });
     return true;
   ```

2. **Content Script** (`content-script.js`):
   - Already forwards all messages, no changes needed

3. **Website** (`App.jsx`):
   ```javascript
   window.postMessage({
     source: 'swipesleuth-page',
     type: 'NEW_MESSAGE_TYPE',
     requestId: generateId()
   }, '*');
   ```

### Adding New Scam Detection Rules

Edit `service-worker.js` → `scanPage()` function:
```javascript
function scanPage(url) {
  const indicators = [];
  // Add new checks
  if (newPattern) {
    indicators.push('New pattern detected');
  }
  return { url, indicators, riskLevel };
}
```

### Adding New Badges

Edit `web/src/utils/scoring.js` → `updateLevel()`:
```javascript
if (newCondition) {
  badges.push('New Badge Name');
}
```

## Backend Integration Guide

### Step 1: API Setup

Create API endpoints matching contract in README.md

### Step 2: Update Website

Replace `getExamples()` in `App.jsx`:
```javascript
async function getExamples() {
  try {
    const response = await fetch('https://api.example.com/examples');
    return await response.json();
  } catch (error) {
    // Fallback to extension
    if (window.swipesleuthAPI) {
      return await window.swipesleuthAPI.requestExamples();
    }
  }
}
```

### Step 3: Add Authentication

```javascript
// Add auth header
const response = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Step 4: Sync Extension with Backend

Update `service-worker.js` to periodically sync:
```javascript
// On extension install/update
chrome.runtime.onInstalled.addListener(async () => {
  const examples = await fetchBackendExamples();
  chrome.storage.local.set({ examples });
});
```

## Testing Strategy

### Unit Tests
- Focus on pure functions (scoring.js)
- Mock chrome.storage for extension tests
- Use vitest for React components

### Integration Tests
- Test message flow: page → content → service worker
- Verify storage persistence
- Test error handling

### E2E Tests (Manual)
- Full user flow: load page → swipe cards → check progress
- Extension installation and permissions
- Cross-tab communication

## Performance Considerations

### Storage Limits
- `chrome.storage.sync`: 100KB total, 8KB per item
- `chrome.storage.local`: 10MB total
- Use local for examples, sync for user stats

### Message Size
- Keep messages under 1MB
- Batch large data transfers
- Use compression if needed

### Service Worker Lifecycle
- Service workers sleep after 30s inactivity
- Wake with chrome.runtime.sendMessage
- Cache critical data in memory

## Security Best Practices

### Message Validation
```javascript
// Always validate
if (event.data.source !== 'swipesleuth-page') return;
if (!allowedOrigins.includes(event.origin)) return;
```

### Content Security Policy
- Extension CSP in manifest.json
- Website CSP in index.html meta tag
- Restrict script sources

### Data Sanitization
- Sanitize user-reported examples
- Validate URLs before storage
- Escape HTML in displayed content

## Debugging Tips

### Service Worker Debugging
1. Go to `chrome://extensions/`
2. Find SwipeSleuth extension
3. Click "Service worker" → Opens DevTools
4. Add breakpoints, check console

### Content Script Debugging
1. Open website in Chrome
2. Open DevTools (F12)
3. Go to Sources tab
4. Find "Content scripts" section
5. Set breakpoints in content-script.js

### Message Flow Debugging
Add logging at each step:
```javascript
// Website
console.log('[Page] Sending:', message);

// Content Script
console.log('[Content] Forwarding:', message);

// Service Worker
console.log('[SW] Received:', message);
```

## Common Pitfalls

1. **Service Worker Sleeping**: Wake with message or user action
2. **Message Channel Closing**: Return `true` for async responses
3. **Storage Quota**: Check limits before storing large data
4. **Origin Mismatch**: Update `externally_connectable` for new domains
5. **Content Script Timing**: Use `run_at: 'document_idle'` for reliability

## Future Enhancements

- [ ] Machine learning model for scam detection
- [ ] Real-time multiplayer mode
- [ ] Community-reported examples database
- [ ] Mobile app version
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Accessibility improvements (keyboard navigation, screen readers)

## Resources

- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Messaging Guide](https://developer.chrome.com/docs/extensions/mv3/messaging/)
- [Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)

