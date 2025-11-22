// Background service worker for Scam Shield

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Scam Shield installed');
  
  // Initialize storage
  chrome.storage.local.set({
    recentScans: [],
    settings: {
      autoScan: false,
      notifications: true
    }
  });
});

// Email scanning functionality
// Note: Full email scanning requires Gmail API integration
// This is a basic implementation that can be extended

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scanEmail') {
    const result = analyzeEmail(request.emailContent);
    sendResponse(result);
    return true;
  }
});

// Analyze email content for scam indicators
function analyzeEmail(emailContent) {
  const indicators = {
    suspicious: [],
    warnings: [],
    safe: []
  };
  
  const content = emailContent.toLowerCase();
  
  // Check for common email scam patterns
  checkEmailUrgency(content, indicators);
  checkEmailSender(emailContent, indicators);
  checkEmailLinks(emailContent, indicators);
  checkEmailRequests(content, indicators);
  
  const status = determineEmailStatus(indicators);
  const message = generateEmailMessage(indicators, status);
  
  return {
    status,
    message,
    indicators: indicators.suspicious.length + indicators.warnings.length
  };
}

// Check for urgency in email
function checkEmailUrgency(content, indicators) {
  const urgencyPhrases = [
    'urgent', 'immediate action required', 'act now',
    'your account will be closed', 'expires today',
    'limited time offer', 'verify immediately'
  ];
  
  urgencyPhrases.forEach(phrase => {
    if (content.includes(phrase)) {
      indicators.warnings.push(`Urgent language: "${phrase}"`);
    }
  });
}

// Check email sender
function checkEmailSender(emailContent, indicators) {
  // This would need access to email headers
  // For now, we check content for impersonation attempts
  
  const impersonationPhrases = [
    'microsoft support', 'apple security', 'amazon customer service',
    'paypal security', 'bank security', 'irs'
  ];
  
  impersonationPhrases.forEach(phrase => {
    if (emailContent.toLowerCase().includes(phrase)) {
      indicators.warnings.push(`Possible impersonation: "${phrase}"`);
    }
  });
}

// Check email links
function checkEmailLinks(emailContent, indicators) {
  // Extract URLs from email (basic regex)
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = emailContent.match(urlRegex) || [];
  
  urls.forEach(url => {
    // Check for URL shorteners
    if (url.includes('bit.ly') || url.includes('tinyurl.com') || 
        url.includes('t.co') || url.includes('goo.gl')) {
      indicators.warnings.push(`Suspicious shortened URL: ${url}`);
    }
    
    // Check for mismatched domains
    if (url.includes('paypal') && !url.includes('paypal.com')) {
      indicators.suspicious.push(`Suspicious PayPal link: ${url}`);
    }
    if (url.includes('amazon') && !url.includes('amazon.com')) {
      indicators.suspicious.push(`Suspicious Amazon link: ${url}`);
    }
  });
}

// Check for sensitive information requests
function checkEmailRequests(content, indicators) {
  const sensitiveRequests = [
    'enter your password', 'verify your account', 'confirm your ssn',
    'provide your credit card', 'update your payment information',
    'verify your identity', 'confirm your bank account'
  ];
  
  sensitiveRequests.forEach(phrase => {
    if (content.includes(phrase)) {
      indicators.suspicious.push(`Request for sensitive info: "${phrase}"`);
    }
  });
  
  // Legitimate companies don't ask for passwords via email
  if (content.includes('password') && content.includes('email')) {
    indicators.suspicious.push('Legitimate companies never ask for passwords via email');
  }
}

// Determine email status
function determineEmailStatus(indicators) {
  if (indicators.suspicious.length >= 2) {
    return 'danger';
  } else if (indicators.suspicious.length >= 1 || indicators.warnings.length >= 2) {
    return 'warning';
  } else {
    return 'safe';
  }
}

// Generate email message
function generateEmailMessage(indicators, status) {
  if (status === 'danger') {
    return `This email shows multiple scam indicators. Do not click any links or provide any information.`;
  } else if (status === 'warning') {
    return `This email has some suspicious characteristics. Verify the sender before taking any action.`;
  } else {
    return `No obvious scam indicators found in this email.`;
  }
}

