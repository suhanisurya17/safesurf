# Fixes Applied to Make Extension & Website Run

## Issues Fixed

### 1. Content Script Injection Timing
**Problem**: The API might not be available when the page tries to use it.

**Fix**: 
- Added DOMContentLoaded check
- Added duplicate injection prevention
- Added console logging for debugging

### 2. Message Handling
**Problem**: Service worker responses might not be properly forwarded.

**Fix**:
- Added error handling in content script
- Added logging at each step
- Improved response forwarding logic

### 3. Website Loading
**Problem**: Website might try to load examples before extension is ready.

**Fix**:
- Added retry logic with timeout
- Added better error messages
- Added empty state handling
- Added connection status indicators

### 4. Service Worker Logging
**Problem**: Hard to debug when things go wrong.

**Fix**:
- Added console.log statements throughout
- Added error logging
- Added message type logging

## Key Changes

### `extension/content-script.js`
- Better injection timing
- Improved error handling
- Added logging

### `extension/service-worker.js`
- Added console logging
- Better error responses
- Improved message handling

### `web/src/App.jsx`
- Added retry logic for API availability
- Better loading states
- Improved error messages
- Empty state handling

## How to Test

1. **Start the website:**
   ```bash
   cd swipesleuth/web
   npm install  # if not done yet
   npm run dev
   ```

2. **Load the extension:**
   - Open `chrome://extensions/`
   - Enable Developer mode
   - Load unpacked → select `swipesleuth/extension/`

3. **Open the website:**
   - Go to `http://localhost:5173`
   - Open DevTools (F12) → Console tab
   - You should see logs like:
     - `[SwipeSleuth Content Script] Loaded`
     - `[SwipeSleuth] API injected`
     - `[App] Requesting examples from extension...`
     - `[App] Received 12 examples from extension`

4. **Verify it works:**
   - Cards should appear
   - You can swipe them
   - Scoreboard should update

## Debugging Tips

### If cards don't load:

1. **Check extension is installed:**
   - `chrome://extensions/` → Should see "SwipeSleuth Connector"

2. **Check content script:**
   - Website console should show: `[SwipeSleuth Content Script] Loaded`
   - If not, reload the page

3. **Check service worker:**
   - Extension → Service worker → Inspect
   - Should see logs when website requests examples

4. **Check API:**
   - In website console, type: `window.swipesleuthAPI`
   - Should return an object with `requestExamples` method

5. **Test manually:**
   - In website console: `window.swipesleuthAPI.requestExamples().then(console.log)`
   - Should return array of examples

## Expected Behavior

✅ **Working:**
- Website loads at localhost:5173
- Extension icon appears in toolbar
- Cards load automatically
- Swiping works
- Scoreboard updates
- Progress saves

❌ **Not working if:**
- Cards never appear
- "Loading examples..." forever
- Console shows errors
- Extension not detected

## Next Steps

If it's still not working:
1. Check `RUN.md` for detailed troubleshooting
2. Check browser console for specific errors
3. Verify extension permissions
4. Try reloading both extension and page

