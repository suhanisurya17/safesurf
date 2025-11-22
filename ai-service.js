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
    if (!this.apiKey || this.apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      return {
        usedAI: false,
        error: 'API key not configured',
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
    const truncatedContent = content.length > CONFIG.MAX_CONTENT_LENGTH
      ? content.substring(0, CONFIG.MAX_CONTENT_LENGTH) + '...'
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.AI_TIMEOUT);

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
        const errorData = await response.json();
        throw new Error(`API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Parse AI response
   */
  parseAIResponse(apiResponse) {
    try {
      // Extract text from Gemini response
      const text = apiResponse.candidates[0].content.parts[0].text;

      // Remove markdown code blocks if present
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      // Parse JSON
      const analysis = JSON.parse(cleanedText);

      return {
        usedAI: true,
        riskLevel: analysis.riskLevel || 'warning',
        confidence: analysis.confidence || 0,
        indicators: analysis.indicators || [],
        explanation: analysis.explanation || '',
        recommendations: analysis.recommendations || [],
        error: null,
        fallback: false
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return {
        usedAI: false,
        error: 'Failed to parse AI response',
        fallback: true
      };
    }
  }
}

// Create singleton instance
const aiService = new AIService();
