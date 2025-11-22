// Configuration file for Scam Shield
// Get your free API key from: https://aistudio.google.com/app/apikey

// INSTRUCTIONS:
// 1. Copy this file and rename it to 'config.js'
// 2. Replace 'YOUR_GEMINI_API_KEY_HERE' with your actual API key
// 3. Never commit config.js to Git (it's in .gitignore)

const CONFIG = {
  // Gemini API key - KEEP THIS SECRET!
  // Get your free key from: https://aistudio.google.com/app/apikey
  GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY_HERE',

  // Gemini API endpoint
  GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',

  // Feature flags
  USE_AI_ANALYSIS: true, // Set to false to use only rule-based detection

  // AI Analysis settings
  MAX_CONTENT_LENGTH: 5000, // Maximum characters to send to AI
  AI_TIMEOUT: 10000, // 10 seconds timeout for AI requests
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
