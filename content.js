// Content script for analyzing web pages

// Listen for scan requests from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Ping response - confirms content script is loaded
  if (request.action === 'ping') {
    sendResponse({ status: 'ready' });
    return true;
  }

  // Scan page request
  if (request.action === 'scanPage') {
    analyzePageWithAI().then(result => {
      sendResponse(result);
    }).catch(error => {
      console.error('Analysis error:', error);
      sendResponse({
        status: 'error',
        message: 'Failed to analyze page',
        url: window.location.href
      });
    });
    return true; // Keep channel open for async response
  }
});

// Main page analysis function with AI
async function analyzePageWithAI() {
  const url = window.location.href;
  const indicators = {
    suspicious: [],
    warnings: [],
    safe: []
  };

  // Run rule-based detection
  checkUrl(url, indicators);
  checkContent(indicators);
  checkSecurity(url, indicators);
  checkScamPatterns(indicators);

  // Determine rule-based status
  const ruleBasedStatus = determineStatus(indicators);

  // Try AI analysis if enabled
  let aiResult = null;
  if (CONFIG.USE_AI_ANALYSIS) {
    const pageData = extractPageData();
    aiResult = await aiService.analyzePage(pageData);
  }

  // Combine results
  const finalResult = combineResults(ruleBasedStatus, indicators, aiResult, url);

  return finalResult;
}

// Extract page data for AI analysis
function extractPageData() {
  const url = window.location.href;
  const title = document.title;
  const bodyText = document.body ? document.body.innerText : '';

  // Limit content length
  const content = bodyText.substring(0, CONFIG.MAX_CONTENT_LENGTH);

  return { url, title, content };
}

// Combine rule-based and AI results
function combineResults(ruleBasedStatus, indicators, aiResult, url) {
  // If AI analysis succeeded, use it as primary
  if (aiResult && aiResult.usedAI && !aiResult.fallback) {
    return {
      status: aiResult.riskLevel,
      message: buildAIMessage(aiResult, indicators),
      url,
      indicators: indicators.suspicious.length + indicators.warnings.length,
      aiAnalysis: {
        confidence: aiResult.confidence,
        explanation: aiResult.explanation,
        recommendations: aiResult.recommendations,
        aiIndicators: aiResult.indicators
      },
      usedAI: true
    };
  }

  // Fallback to rule-based
  return {
    status: ruleBasedStatus,
    message: generateMessage(indicators, ruleBasedStatus),
    url,
    indicators: indicators.suspicious.length + indicators.warnings.length,
    usedAI: false,
    aiError: aiResult?.error || null
  };
}

// Build message incorporating AI analysis
function buildAIMessage(aiResult, ruleIndicators) {
  let message = `AI Analysis (${aiResult.confidence}% confidence): ${aiResult.explanation}`;

  // Add rule-based indicators if any
  if (ruleIndicators.suspicious.length > 0 || ruleIndicators.warnings.length > 0) {
    message += `\n\nAdditional indicators found: ${ruleIndicators.suspicious.length + ruleIndicators.warnings.length}`;
  }

  return message;
}

// Main page analysis function (legacy, now used as fallback)
function analyzePage() {
  const url = window.location.href;
  const indicators = {
    suspicious: [],
    warnings: [],
    safe: []
  };

  // Check URL for suspicious patterns
  checkUrl(url, indicators);

  // Check page content
  checkContent(indicators);

  // Check for SSL/HTTPS
  checkSecurity(url, indicators);

  // Check for common scam patterns
  checkScamPatterns(indicators);

  // Determine overall status
  const status = determineStatus(indicators);
  const message = generateMessage(indicators, status);

  return {
    status,
    message,
    url,
    indicators: indicators.suspicious.length + indicators.warnings.length
  };
}

// Check URL for suspicious patterns
function checkUrl(url, indicators) {
  const suspiciousDomains = [
    'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly',
    'amzn.to', 'rebrand.ly', 'short.link'
  ];
  
  const suspiciousKeywords = [
    'verify', 'confirm', 'urgent', 'action-required',
    'suspended', 'locked', 'expired', 'limited-time'
  ];
  
  const urlLower = url.toLowerCase();
  
  // Check for suspicious domains
  suspiciousDomains.forEach(domain => {
    if (urlLower.includes(domain)) {
      indicators.warnings.push('URL contains a URL shortener');
    }
  });
  
  // Check for suspicious keywords in URL
  suspiciousKeywords.forEach(keyword => {
    if (urlLower.includes(keyword)) {
      indicators.warnings.push(`URL contains suspicious keyword: "${keyword}"`);
    }
  });
  
  // Check for typosquatting (common misspellings)
  const commonTypos = [
    'amazom', 'amaz0n', 'paypai', 'paypa1', 'microsft',
    'gooogle', 'facebok', 'app1e', 'bankofamericaa'
  ];
  
  commonTypos.forEach(typo => {
    if (urlLower.includes(typo)) {
      indicators.suspicious.push(`Possible typo in domain: "${typo}"`);
    }
  });
  
  // Check for HTTPS
  if (!url.startsWith('https://') && !url.startsWith('chrome-extension://') && !url.startsWith('about:')) {
    indicators.warnings.push('Page is not using HTTPS (secure connection)');
  }
}

// Check page content for scam indicators
function checkContent(indicators) {
  const bodyText = document.body ? document.body.innerText.toLowerCase() : '';
  const title = document.title.toLowerCase();
  
  // Urgency indicators
  const urgencyPhrases = [
    'act now', 'limited time', 'expires today', 'urgent action required',
    'your account will be closed', 'immediate attention required',
    'verify your account now', 'click here immediately'
  ];
  
  urgencyPhrases.forEach(phrase => {
    if (bodyText.includes(phrase) || title.includes(phrase)) {
      indicators.warnings.push(`Urgent language detected: "${phrase}"`);
    }
  });
  
  // Request for sensitive information
  const sensitiveInfoRequests = [
    'enter your password', 'verify your ssn', 'confirm your credit card',
    'provide your bank account', 'enter your pin', 'verify your identity'
  ];
  
  sensitiveInfoRequests.forEach(phrase => {
    if (bodyText.includes(phrase)) {
      indicators.suspicious.push(`Request for sensitive information: "${phrase}"`);
    }
  });
  
  // Too good to be true offers
  const scamOffers = [
    'you have won', 'free money', 'claim your prize',
    'congratulations you are selected', 'guaranteed income',
    'work from home earn', 'get rich quick'
  ];
  
  scamOffers.forEach(phrase => {
    if (bodyText.includes(phrase)) {
      indicators.warnings.push(`Suspicious offer detected: "${phrase}"`);
    }
  });
  
  // Check for excessive exclamation marks (common in scams)
  const exclamationCount = (bodyText.match(/!/g) || []).length;
  if (exclamationCount > 10) {
    indicators.warnings.push('Excessive use of exclamation marks (common in scams)');
  }
  
  // Check for spelling/grammar errors (common in scam emails/sites)
  const commonErrors = ['recieve', 'seperate', 'occured', 'definately'];
  commonErrors.forEach(error => {
    if (bodyText.includes(error)) {
      indicators.warnings.push('Possible spelling errors detected');
      break;
    }
  });
}

// Check security indicators
function checkSecurity(url, indicators) {
  // HTTPS check is done in checkUrl, but we can add more here
  if (url.startsWith('https://')) {
    indicators.safe.push('Page uses HTTPS');
  }
  
  // Check for security certificates (basic check)
  if (window.location.protocol === 'https:') {
    indicators.safe.push('Secure connection established');
  }
}

// Check for common scam patterns
function checkScamPatterns(indicators) {
  // Check for popups or redirects
  // This is harder to detect in content script, but we can check for suspicious scripts
  
  // Check for hidden iframes (common in phishing)
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach(iframe => {
    if (iframe.style.display === 'none' || iframe.style.visibility === 'hidden') {
      indicators.warnings.push('Hidden iframe detected (potential phishing)');
    }
  });
  
  // Check for suspicious form fields
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    const inputs = form.querySelectorAll('input[type="password"], input[type="text"]');
    if (inputs.length > 3) {
      // Multiple password or sensitive fields could be suspicious
      const formText = form.innerText.toLowerCase();
      if (formText.includes('ssn') || formText.includes('social security')) {
        indicators.suspicious.push('Form requests Social Security Number');
      }
    }
  });
}

// Determine overall status based on indicators
function determineStatus(indicators) {
  if (indicators.suspicious.length >= 2) {
    return 'danger';
  } else if (indicators.suspicious.length >= 1 || indicators.warnings.length >= 3) {
    return 'warning';
  } else if (indicators.warnings.length >= 1) {
    return 'warning';
  } else {
    return 'safe';
  }
}

// Generate user-friendly message
function generateMessage(indicators, status) {
  if (status === 'danger') {
    return `Multiple scam indicators detected (${indicators.suspicious.length} suspicious, ${indicators.warnings.length} warnings). Avoid entering any personal information on this page.`;
  } else if (status === 'warning') {
    return `Some suspicious indicators found (${indicators.warnings.length} warnings). Proceed with caution and verify the legitimacy of this page.`;
  } else {
    return 'No obvious scam indicators found on this page.';
  }
}

