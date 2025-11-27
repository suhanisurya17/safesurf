# SwipeSleuth

A React-based swiping game that teaches users to identify scams, integrated with a Chrome Extension (Manifest V3) that provides scam examples and scans pages for suspicious content.

## Project Structure

```
swipesleuth/
├── web/                 # React website (Vite + Tailwind)
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── utils/       # Scoring utilities
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── extension/           # Chrome Extension (MV3)
│   ├── manifest.json
│   ├── service-worker.js
│   ├── content-script.js
│   └── popup/
└── scripts/            # Build scripts
```

## Features

- **Swipe Game**: Tinder-like interface for learning to spot scams
- **Progressive Difficulty**: Easy → Medium → Hard examples
- **Progress Tracking**: XP, levels, streaks, badges
- **Extension Integration**: Chrome extension provides examples and scans pages
- **Secure Messaging**: Content script bridge between website and extension
- **Storage**: User progress synced via chrome.storage

## Installation

### Prerequisites

- Node.js 18+ and npm
- Google Chrome browser

### Setup

1. **Clone and navigate to project**
   ```bash
   cd swipesleuth
   ```

2. **Install web dependencies**
   ```bash
   cd web
   npm install
   cd ..
   ```

3. **Create extension icons** (optional)
   - Create three PNG files in `extension/icons/`:
     - `icon16.png` (16x16)
     - `icon48.png` (48x48)
     - `icon128.png` (128x128)
   - Or use placeholder colored squares
   - Extension will work without icons (Chrome shows default)

## Running the Project

### Development Mode

1. **Start the web server**
   ```bash
   cd web
   npm run dev
   ```
   The site will open at `http://localhost:5173`

2. **Load the extension**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle top-right)
   - Click "Load unpacked"
   - Select the `swipesleuth/extension/` directory
   - Extension icon should appear in toolbar

3. **Test the integration**
   - Open `http://localhost:5173` in Chrome
   - The website should automatically request examples from the extension
   - Start swiping through cards!

### Production Build

```bash
./scripts/build.sh
```

Or manually:
```bash
cd web
npm run build
# Output in web/dist/
```

## Testing

### Unit Tests

```bash
cd web
npm test
```

Tests cover:
- Scoring logic (`scoring.js`)
- Level calculation
- Streak tracking

### Manual Testing Checklist

#### Extension Permissions
- [ ] Extension loads without errors in `chrome://extensions/`
- [ ] Service worker is active (check `chrome://serviceworker-internals/`)
- [ ] Content script injects on web pages
- [ ] Popup opens and shows stats

#### Messaging Flow
- [ ] Website requests examples from extension
- [ ] Content script receives page message
- [ ] Service worker responds with examples
- [ ] Website receives examples and displays cards

#### Storage
- [ ] User progress saves to chrome.storage.sync
- [ ] Reported examples save to chrome.storage.local
- [ ] Progress persists after browser restart

#### Game Functionality
- [ ] Cards swipe left/right correctly
- [ ] Scoring works (points, streaks, levels)
- [ ] Feedback shows on swipe
- [ ] Scoreboard updates in real-time
- [ ] Badges unlock appropriately

#### Context Menu
- [ ] Right-click selected text shows "Report suspicious message"
- [ ] Reported items save to storage
- [ ] Reported items appear in examples

## Messaging Architecture

### Website ↔ Extension Communication

The extension uses a content script as a bridge:

1. **Website** posts message via `window.postMessage`
2. **Content Script** listens and forwards to service worker
3. **Service Worker** processes and responds
4. **Content Script** forwards response back to website

### Message Format

```javascript
// Request
{
  source: 'swipesleuth-page',
  type: 'GET_EXAMPLES',
  requestId: 'unique-id'
}

// Response
{
  source: 'swipesleuth-ext',
  type: 'RESPONSE_EXAMPLES',
  payload: [...examples],
  requestId: 'unique-id'
}
```

### Security

- Messages validated by `source` field
- Content script checks `event.source === window`
- Service worker validates message types
- Origin checking for production (update `externally_connectable` in manifest)

## API Contract (Future Backend Integration)

To swap seed data for a real backend:

### Current Extension API
```javascript
// Extension exposes:
window.swipesleuthAPI.requestExamples() → Promise<Card[]>
```

### Backend API Contract
```javascript
// Replace with:
GET /api/examples?difficulty=easy|medium|hard
Response: { cards: Card[], total: number }

POST /api/report
Body: { text: string, url: string, redFlags: string[] }
Response: { id: string, success: boolean }

GET /api/user/stats
Response: { level, points, accuracy, ... }

POST /api/user/stats
Body: { stats object }
Response: { success: boolean }
```

### Migration Steps
1. Update `web/src/App.jsx` `getExamples()` to call backend API
2. Add authentication if needed
3. Update `extension/service-worker.js` to sync with backend
4. Replace chrome.storage with API calls (or sync both)

## Privacy & Telemetry

### Current Implementation
- All data stored locally (chrome.storage)
- No external API calls
- No tracking or analytics

### Adding Telemetry (Opt-in)

1. **Add opt-in toggle** in extension popup
2. **Store preference** in chrome.storage.sync
3. **Send anonymized events**:
   ```javascript
   POST /api/telemetry
   Body: {
     event: 'card_swiped',
     difficulty: 'medium',
     correct: true,
     timestamp: Date.now()
   }
   ```
4. **Never send**:
   - Personal information
   - Full URLs
   - Email content
   - User identifiers

### Reported Examples Privacy
- User-reported examples stored locally by default
- Option to share anonymously (opt-in)
- Clear disclosure in UI
- Allow deletion of reported items

## Troubleshooting

### Content Script Not Receiving Messages

**Problem**: Website can't communicate with extension

**Solutions**:
- Check `manifest.json` `content_scripts.matches` includes your domain
- For localhost, ensure `externally_connectable` includes `http://localhost:5173/*`
- Verify content script injected: Check DevTools → Sources → Content scripts
- Check console for errors

### Service Worker Not Responding

**Problem**: Extension service worker appears inactive

**Solutions**:
- Check `chrome://serviceworker-internals/` for service worker status
- Open extension popup to wake service worker
- Check service worker console: Extensions → SwipeSleuth → Service worker → Inspect
- Add logging: `console.log()` in service-worker.js

### Examples Not Loading

**Problem**: Website shows "Loading examples..." indefinitely

**Solutions**:
- Verify extension is installed and enabled
- Check browser console for errors
- Verify `window.swipesleuthAPI` exists (inject via content script)
- Test manually: Open extension popup → "Push Examples to Page"
- Check storage: Extension popup should show example count

### Storage Not Persisting

**Problem**: Progress resets after browser restart

**Solutions**:
- Check chrome.storage quota (sync has 100KB limit)
- Use chrome.storage.local for large data
- Verify storage permissions in manifest.json
- Check for storage errors in console

### Build Errors

**Problem**: `npm run build` fails

**Solutions**:
- Clear node_modules: `rm -rf node_modules package-lock.json && npm install`
- Check Node.js version: `node --version` (need 18+)
- Update dependencies: `npm update`
- Check for TypeScript errors if using TS

## Development Notes

### Adding New Card Examples

Edit `extension/service-worker.js`:
```javascript
const SEED_EXAMPLES = [
  // Add new card object
  {
    id: 'new-1',
    title: 'Example Title',
    text: 'Example text...',
    url: 'https://example.com',
    redFlags: ['Flag 1', 'Flag 2'],
    difficulty: 'easy|medium|hard',
    isScam: true|false
  }
];
```

### Customizing Scoring

Edit `web/src/utils/scoring.js`:
- Adjust `basePoints` for difficulty levels
- Modify badge requirements
- Change level calculation formula

### Styling

- Web app uses Tailwind CSS
- Edit `web/src/index.css` for global styles
- Component styles in JSX using Tailwind classes

## Browser Compatibility

- **Primary**: Chrome/Chromium (Manifest V3)
- **Not supported**: Firefox (uses Manifest V2), Safari (different extension API)
- **Edge**: Should work (Chromium-based)

## License

MIT License - See LICENSE file

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Add tests
5. Submit pull request

## Support

For issues or questions:
- Check troubleshooting section above
- Review Chrome Extension documentation: https://developer.chrome.com/docs/extensions/
- Check messaging patterns: https://developer.chrome.com/docs/extensions/mv3/messaging/

