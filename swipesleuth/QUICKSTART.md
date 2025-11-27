# Quick Start Guide

## 5-Minute Setup

### 1. Install Dependencies
```bash
cd web
npm install
cd ..
```

### 2. Start Web Server
```bash
cd web
npm run dev
```
Site opens at `http://localhost:5173`

### 3. Load Extension
1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked"
4. Select `swipesleuth/extension/` folder

### 4. Test It!
1. Open `http://localhost:5173` in Chrome
2. Cards should load automatically
3. Swipe right (scam) or left (safe)
4. Watch your score increase!

## Verify Everything Works

### Check Extension
- [ ] Extension icon appears in Chrome toolbar
- [ ] Click icon → popup shows example count
- [ ] Right-click text → "Report suspicious message" appears

### Check Website
- [ ] Website loads at localhost:5173
- [ ] Cards appear and are swipeable
- [ ] Scoreboard shows level/points
- [ ] Feedback appears on swipe

### Check Messaging
1. Open website DevTools (F12)
2. Check Console for messages
3. Should see: `[Page] Sending: GET_EXAMPLES`
4. Cards should load within 2 seconds

## Common Issues

**No cards loading?**
- Check extension is installed and enabled
- Check browser console for errors
- Verify content script is injected (DevTools → Sources → Content scripts)

**Extension not responding?**
- Open extension popup to wake service worker
- Check `chrome://serviceworker-internals/` for service worker status
- Reload extension in `chrome://extensions/`

**Build errors?**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (need 18+)

## Next Steps

- Read full [README.md](README.md) for detailed docs
- Check [DEVELOPER.md](DEVELOPER.md) for architecture details
- Run tests: `cd web && npm test`
- Build for production: `./scripts/build.sh`

