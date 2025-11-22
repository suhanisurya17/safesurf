# Quick Start Guide - Scam Shield Extension

## Step 1: Generate Icons (Required)

The extension needs icon files to work properly. You have two options:

### Option A: Use the Icon Generator (Easiest)
1. Open `generate-icons.html` in your web browser
2. Click the "Generate Icons" button
3. Three PNG files will download (shield-16.png, shield-48.png, shield-128.png)
4. Move these files to the `icons/` folder in this directory

### Option B: Create Icons Manually
- Create 3 PNG files: 16x16, 48x48, and 128x128 pixels
- Name them: `shield-16.png`, `shield-48.png`, `shield-128.png`
- Place them in the `icons/` folder
- Use a blue shield icon or any simple icon you prefer

## Step 2: Load Extension in Chrome

1. **Open Chrome Extensions Page**
   - Open Google Chrome
   - Type `chrome://extensions/` in the address bar and press Enter
   - OR go to: Menu (⋮) → Extensions → Manage Extensions

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner
   - It should turn blue/on

3. **Load the Extension**
   - Click the "Load unpacked" button
   - Navigate to and select the `safesurf` folder (this directory)
   - Click "Select Folder" or "Open"

4. **Verify Installation**
   - You should see "Scam Shield" appear in your extensions list
   - The extension icon should appear in your Chrome toolbar (top right)

## Step 3: Use the Extension

1. **Open the Extension**
   - Click the Scam Shield icon in your Chrome toolbar
   - The popup window will open

2. **Scan a Web Page**
   - Navigate to any website you want to check
   - Click the Scam Shield icon
   - Click the "Scan This Page" button
   - Review the results (Safe/Warning/Danger)

3. **View Safety Tips**
   - In the extension popup, click the "Safety Tips" tab
   - Read through the educational content

## Troubleshooting

**Extension not loading?**
- Make sure all files are in the correct locations
- Check that `manifest.json` exists and is valid
- Ensure icons are in the `icons/` folder (even if they're placeholders)

**Icons missing?**
- The extension will work without icons, but Chrome will show a default icon
- Use `generate-icons.html` to create them quickly

**Scan not working?**
- Make sure you're on a regular webpage (not chrome:// pages)
- Check the browser console for errors (right-click extension popup → Inspect)

**Need to update the extension?**
- After making changes, go to `chrome://extensions/`
- Click the refresh icon (↻) on the Scam Shield extension card

## Testing the Extension

Try scanning these types of sites:
- A legitimate site (like google.com) - should show "Safe"
- A site with HTTP (not HTTPS) - may show "Warning"
- A site with suspicious content - may show "Warning" or "Danger"

## Next Steps

- Customize the detection rules in `content.js`
- Add more safety tips in `popup.html`
- Extend email scanning functionality in `background.js`

