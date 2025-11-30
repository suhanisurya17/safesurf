# How to Run SwipeSleuth

## Quick Start (3 Steps)

### Step 1: Install Web Dependencies
```bash
cd swipesleuth/web
npm install
```

### Step 2: Start the Web Server
```bash
npm run dev
```
This will start the server at `http://localhost:5173`

### Step 3: Load the Extension
1. Open Chrome browser
2. Go to `chrome://extensions/`
3. Enable **"Developer mode"** (toggle in top-right)
4. Click **"Load unpacked"**
5. Navigate to and select the `swipesleuth/extension/` folder
6. The extension should appear in your extensions list

### Step 4: Test It!
1. Open `http://localhost:5173` in Chrome
2. The website should automatically connect to the extension
3. Cards should load and you can start swiping!

## Troubleshooting

### Cards Not Loading?

**Check 1: Extension is installed**
- Go to `chrome://extensions/`
- Make sure "SwipeSleuth Connector" is listed and enabled
- If not, reload it

**Check 2: Content Script is running**
- Open the website (`http://localhost:5173`)
- Open DevTools (F12)
- Go to Console tab
- You should see: `[SwipeSleuth Content Script] Loaded`
- If not, reload the page

**Check 3: Service Worker is active**
- Go to `chrome://extensions/`
- Find "SwipeSleuth Connector"
- Click "Service worker" link (opens DevTools)
- Check console for any errors
- You should see: `[Service Worker] Received message: GET_EXAMPLES`

**Check 4: Check browser console**
- On the website, open DevTools (F12)
- Check Console for error messages
- Look for messages starting with `[App]`, `[Content Script]`, etc.

### Extension Not Responding?

1. **Wake the service worker:**
   - Click the extension icon in toolbar
   - This wakes up the service worker

2. **Reload extension:**
   - Go to `chrome://extensions/`
   - Click reload icon on "SwipeSleuth Connector"

3. **Check permissions:**
   - Make sure extension has all required permissions
   - Check if any are blocked

### Still Not Working?

1. **Clear storage:**
   - Open extension popup
   - Check if examples count shows a number
   - If 0, the seed data might not have loaded

2. **Manual test:**
   - Open website console
   - Type: `window.swipesleuthAPI.requestExamples()`
   - Should return a Promise that resolves with examples

3. **Check manifest:**
   - Verify `externally_connectable` includes `http://localhost:5173/*`
   - Verify `content_scripts.matches` includes `<all_urls>`

## Expected Console Output

When everything works, you should see:

**Website Console:**
```
[App] Requesting examples from extension...
[App] Received 12 examples from extension
[App] Loaded 12 cards
```

**Content Script (in page context):**
```
[SwipeSleuth Content Script] Loaded
[SwipeSleuth] API injected
[Content Script] Received from page: GET_EXAMPLES
[Content Script] Forwarding response: RESPONSE_EXAMPLES
```

**Service Worker (in extension DevTools):**
```
[Service Worker] Received message: GET_EXAMPLES
[Service Worker] Sending 12 examples
```

## Manual Testing Steps

1. ✅ Extension loads without errors
2. ✅ Website loads at localhost:5173
3. ✅ Content script injects (check console)
4. ✅ API is available (`window.swipesleuthAPI` exists)
5. ✅ Examples are requested and received
6. ✅ Cards appear on screen
7. ✅ Swiping works (mouse or touch)
8. ✅ Scoreboard updates
9. ✅ Progress saves (check extension popup)

## Next Steps After It Works

- Try the context menu: Right-click selected text → "Report suspicious message"
- Check extension popup: Click extension icon → See stats
- Test different difficulty levels
- Check progress persistence: Reload page → Progress should remain

