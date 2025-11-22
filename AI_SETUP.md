# AI Setup Guide - Gemini Integration

This guide will help you set up **Gemini AI** for enhanced scam detection in Scam Shield.

## Why Gemini?

- ✅ **Free tier** with generous API limits
- ✅ **Fast response times** (<2 seconds)
- ✅ **Advanced pattern recognition** for scam detection
- ✅ **Easy to set up** (just need an API key)

## Step 1: Get Your Free Gemini API Key

1. **Visit Google AI Studio**: https://aistudio.google.com/app/apikey

2. **Sign in** with your Google account

3. **Click "Create API Key"**
   - Select "Create API key in new project" or use an existing project
   - Your API key will be generated instantly

4. **Copy your API key** (it looks like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)

## Step 2: Configure Scam Shield

1. **Open the config file** in your extension folder:
   ```
   safesurf/config.js
   ```

2. **Replace the API key** on line 5:
   ```javascript
   GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY_HERE',
   ```

   Change to:
   ```javascript
   GEMINI_API_KEY: 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
   ```

3. **Save the file**

## Step 3: Reload the Extension

1. Go to `chrome://extensions/`
2. Find "Scam Shield"
3. Click the **reload icon** (circular arrow)
4. Done! AI is now enabled ✨

## Step 4: Test It Out

1. Visit any website
2. Click the Scam Shield extension icon
3. Click "Scan This Page"
4. You should see **"AI: SAFE"**, **"AI: WARNING"**, or **"AI: DANGER"** badges
5. AI analysis details will appear below the main result

## Usage Tips

### Free Tier Limits
- **15 requests per minute**
- **1,500 requests per day**
- More than enough for daily use!

### If You See "Rule-Based" Results
This means AI is disabled or the API key isn't configured. The extension will fall back to rule-based detection (which still works great!).

### Disable AI (Optional)
If you want to use only rule-based detection:

Open `config.js` and change:
```javascript
USE_AI_ANALYSIS: false,
```

## Features

### AI-Powered Detection
The AI analyzes:
- **Phishing attempts** (fake login pages, brand impersonation)
- **Scam patterns** (urgency tactics, suspicious offers)
- **URL manipulation** (typosquatting, lookalike domains)
- **Content credibility** (grammar, tone, legitimacy)
- **Overall risk assessment** with confidence scores

### Hybrid Approach
Scam Shield uses **both** AI and rule-based detection:
- AI provides intelligent analysis
- Rule-based checks catch known patterns
- Results are combined for maximum accuracy

## Troubleshooting

### "Unable to scan this page"
- Make sure you're not on a `chrome://` page
- Try refreshing the page first
- Check browser console for errors

### AI not working?
1. Check API key is correct in `config.js`
2. Verify you have internet connection
3. Check if you've exceeded API limits (wait a minute)
4. Look for errors in browser console (F12)

### API Key Invalid?
- Make sure there are no extra spaces
- The key should start with `AIza`
- Try generating a new key at https://aistudio.google.com/app/apikey

## Privacy & Security

- **All analysis happens via HTTPS** to Google's servers
- **Only page content is sent** (URL, title, visible text)
- **No personal data is stored** by the extension
- **Google's privacy policy applies** to API usage
- You can disable AI anytime by setting `USE_AI_ANALYSIS: false`

## Cost

Gemini API is **completely FREE** for personal use with the free tier limits mentioned above.

If you need more, check pricing at: https://ai.google.dev/pricing

---

## Need Help?

- **Check browser console**: Right-click → Inspect → Console tab
- **Review the logs**: Look for errors in red
- **File an issue**: https://github.com/anthropics/claude-code/issues

Happy scam hunting! 🛡️
