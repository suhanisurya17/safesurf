// AI Service for Gemini API integration

class AIService {
  constructor() {
    this.apiKey = CONFIG.GEMINI_API_KEY;
    this.apiUrl = CONFIG.GEMINI_API_URL;
  }

  /**
   * Analyze page content using Gemini AI
   * @param {Object} pageData - Object containing url, title, and content
   * @returns {Promise<Object>} AI analysis result
   */
  async analyzePage(pageData) {
    // Check if API key is configured
    if (!this.apiKey || this.apiKey === 'YOUR_GEMINI_API_KEY_HERE' || this.apiKey.trim() === '') {
      console.warn('Gemini API key not configured. Using rule-based detection only.');
      return {
        usedAI: false,
        error: 'API key not configured. Please set GEMINI_API_KEY in config.js',
        fallback: true
      };
    }

    try {
      const prompt = this.buildPrompt(pageData);
      const response = await this.callGeminiAPI(prompt);
      return this.parseAIResponse(response);
    } catch (error) {
      console.error('AI analysis error:', error);
      return {
        usedAI: false,
        error: error.message,
        fallback: true
      };
    }
  }

  /**
   * Build prompt for Gemini AI
   */
  buildPrompt(pageData) {
    const { url, title, content } = pageData;

    // Truncate content if too long
    const maxLength = (typeof CONFIG !== 'undefined' && CONFIG.MAX_CONTENT_LENGTH) ? CONFIG.MAX_CONTENT_LENGTH : 5000;
    const truncatedContent = content.length > maxLength
      ? content.substring(0, maxLength) + '...'
      : content;

    return `You are a cybersecurity expert analyzing a webpage for potential scams and phishing attempts.

Analyze the following webpage and provide a JSON response only (no markdown, no additional text):

URL: ${url}
Title: ${title}
Content: ${truncatedContent}

Analyze for:
1. Phishing attempts (fake login pages, impersonation)
2. Scam indicators (urgency tactics, too-good-to-be-true offers)
3. Suspicious patterns (typosquatting, URL manipulation)
4. Requests for sensitive information
5. Overall legitimacy of the website

Respond with ONLY a JSON object in this exact format:
{
  "riskLevel": "safe" | "warning" | "danger",
  "confidence": 0-100,
  "indicators": ["indicator1", "indicator2"],
  "explanation": "brief explanation",
  "recommendations": ["action1", "action2"]
}`;
  }

  /**
   * Call Gemini API
   */
  async callGeminiAPI(prompt) {
    const timeout = (typeof CONFIG !== 'undefined' && CONFIG.AI_TIMEOUT) ? CONFIG.AI_TIMEOUT : 10000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 1,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_NONE"
            }
          ]
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `API error: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = `API error: ${errorData.error?.message || response.statusText}`;
        } catch (e) {
          // If JSON parsing fails, use status text
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Check if response has valid structure
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid API response structure');
      }
      
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - AI service took too long to respond');
      }
      throw error;
    }
  }

  /**
   * Parse AI response
   */
  parseAIResponse(apiResponse) {
    try {
      // Check if response structure is valid
      if (!apiResponse.candidates || !apiResponse.candidates[0] || !apiResponse.candidates[0].content) {
        throw new Error('Invalid API response structure');
      }

      // Extract text from Gemini response
      const parts = apiResponse.candidates[0].content.parts;
      if (!parts || !parts[0] || !parts[0].text) {
        throw new Error('No text content in API response');
      }

      const text = parts[0].text;

      // Remove markdown code blocks if present
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      // Try to extract JSON from text (in case there's extra text)
      let jsonText = cleanedText;
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      // Parse JSON
      const analysis = JSON.parse(jsonText);

      // Validate risk level
      const validRiskLevels = ['safe', 'warning', 'danger'];
      const riskLevel = validRiskLevels.includes(analysis.riskLevel) ? analysis.riskLevel : 'warning';

      return {
        usedAI: true,
        riskLevel: riskLevel,
        confidence: Math.min(100, Math.max(0, analysis.confidence || 0)),
        indicators: Array.isArray(analysis.indicators) ? analysis.indicators : [],
        explanation: analysis.explanation || 'AI analysis completed',
        recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : [],
        error: null,
        fallback: false
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return {
        usedAI: false,
        error: 'Failed to parse AI response: ' + error.message,
        fallback: true
      };
    }
  }
}

// Create singleton instance
const aiService = new AIService();
