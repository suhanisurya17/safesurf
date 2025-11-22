# Scam Shield - Chrome Extension

A Chrome browser extension designed to help seniors detect scam emails and potential scam websites. The extension analyzes web pages and emails for common scam indicators and provides clear, easy-to-understand warnings.

## Features

- **Page Scanning**: Analyze any webpage for scam indicators
- **Email Analysis**: Detect suspicious patterns in emails (basic implementation)
- **Safety Tips**: Educational content about common scams
- **Recent Scans**: History of scanned pages with results
- **Senior-Friendly UI**: Clean, simple interface with clear warnings

## Installation

1. **Download or clone this repository**
   ```bash
   git clone <repository-url>
   cd safesurf
   ```

2. **Create Extension Icons**
   - The extension requires icons in the `icons/` directory:
     - `shield-16.png` (16x16 pixels)
     - `shield-48.png` (48x48 pixels)
     - `shield-128.png` (128x128 pixels)
   - You can create these using any image editor, or use an online icon generator
   - The icon should be a shield symbol (🛡️) in blue

3. **Load the Extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `safesurf` directory

## Usage

1. **Scan a Web Page**
   - Navigate to any webpage you want to check
   - Click the Scam Shield icon in your Chrome toolbar
   - Click "Scan This Page"
   - Review the results (Safe, Warning, or Danger)

2. **View Safety Tips**
   - Open the extension popup
   - Click the "Safety Tips" tab
   - Read through tips about Email Scams, Website Safety, and General Tips

3. **View Recent Scans**
   - Recent scans are automatically saved
   - View them in the "Current Page" tab under "Recent Scans"

## How It Works

The extension analyzes web pages for:

- **URL Patterns**: Suspicious domains, URL shorteners, typosquatting
- **Content Analysis**: Urgent language, requests for sensitive information
- **Security Indicators**: HTTPS usage, secure connections
- **Scam Patterns**: Hidden iframes, suspicious forms, too-good-to-be-true offers

## Scam Detection Indicators

### Safe
- No suspicious patterns detected
- HTTPS enabled
- Legitimate domain

### Warning
- Some suspicious indicators found
- Proceed with caution
- Verify legitimacy

### Danger
- Multiple scam indicators detected
- Avoid entering personal information
- Likely a scam

## File Structure

```
safesurf/
├── manifest.json       # Extension configuration
├── popup.html         # Extension popup UI
├── popup.css          # Styling for popup
├── popup.js           # Popup functionality
├── content.js         # Page analysis script
├── background.js      # Background service worker
├── icons/             # Extension icons
│   ├── shield-16.png
│   ├── shield-48.png
│   └── shield-128.png
└── README.md          # This file
```

## Development

### Testing
1. Load the extension in Chrome (see Installation)
2. Navigate to test pages
3. Use Chrome DevTools to debug (right-click extension popup → Inspect)

### Extending Functionality
- **Email Scanning**: Currently basic. Can be extended with Gmail API integration
- **Database**: Can add a database of known scam sites
- **Machine Learning**: Can integrate ML models for better detection
- **Notifications**: Can add browser notifications for dangerous sites

## Privacy

- All scanning is done locally in your browser
- No data is sent to external servers
- Recent scans are stored locally in Chrome storage
- No tracking or analytics

## Limitations

- This is an analysis tool, not a guarantee
- Some legitimate sites may trigger false warnings
- Some sophisticated scams may not be detected
- Always use your judgment and verify through official channels

## License

MIT License - Feel free to modify and distribute

## Support

For issues or questions, please open an issue in the repository.

