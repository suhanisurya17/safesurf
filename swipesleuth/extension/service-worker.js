// Service Worker for SwipeSleuth Extension (Manifest V3)

// Seed data: 12 example cards across 3 difficulty levels
const SEED_EXAMPLES = [
  // Easy (Obvious) - 4 examples
  {
    id: 'easy-1',
    title: 'You Won $1,000,000!',
    text: 'Congratulations! You have been selected as the winner of $1,000,000. Click here to claim your prize immediately!',
    url: 'http://fake-lottery-scam.com',
    redFlags: ['Too good to be true offer', 'Urgent action required', 'No legitimate lottery contact'],
    difficulty: 'easy',
    isScam: true
  },
  {
    id: 'easy-2',
    title: 'Verify Your Account Now',
    text: 'URGENT: Your account will be closed in 24 hours unless you verify your identity. Click here to verify: http://not-your-bank.com/verify',
    url: 'http://not-your-bank.com/verify',
    redFlags: ['Urgent deadline threat', 'Suspicious domain', 'Request for verification via link'],
    difficulty: 'easy',
    isScam: true
  },
  {
    id: 'easy-3',
    title: 'Amazon Order Confirmation',
    text: 'Your order #12345 has been confirmed. To track your package, please click here: https://amazom.com/track',
    url: 'https://amazom.com/track',
    redFlags: ['Typo in domain (amazom vs amazon)', 'Unexpected order notification'],
    difficulty: 'easy',
    isScam: true
  },
  {
    id: 'easy-4',
    title: 'Legitimate Bank Statement',
    text: 'Your monthly statement is ready. Log in to your account at https://chase.com to view it.',
    url: 'https://chase.com',
    redFlags: [],
    difficulty: 'easy',
    isScam: false
  },
  
  // Medium (Subtle) - 4 examples
  {
    id: 'medium-1',
    title: 'Payment Method Update Required',
    text: 'We noticed unusual activity on your account. Please update your payment method to continue using our services. Update now: https://paypal-security.com/update',
    url: 'https://paypal-security.com/update',
    redFlags: ['Suspicious subdomain', 'Urgency without clear reason', 'Link to update payment info'],
    difficulty: 'medium',
    isScam: true
  },
  {
    id: 'medium-2',
    title: 'Your Subscription is Expiring',
    text: 'Your Netflix subscription expires in 3 days. To avoid interruption, please update your billing information at: https://netflix-billing.com/renew',
    url: 'https://netflix-billing.com/renew',
    redFlags: ['Different domain than official service', 'Urgent renewal request'],
    difficulty: 'medium',
    isScam: true
  },
  {
    id: 'medium-3',
    title: 'Security Alert: New Device',
    text: 'We detected a login from a new device in San Francisco. If this was you, no action needed. If not, secure your account: https://accounts.google.com/security',
    url: 'https://accounts.google.com/security',
    redFlags: [],
    difficulty: 'medium',
    isScam: false
  },
  {
    id: 'medium-4',
    title: 'Tax Refund Available',
    text: 'You are eligible for a tax refund of $847. Click here to claim: https://irs-refund-claim.gov/process',
    url: 'https://irs-refund-claim.gov/process',
    redFlags: ['Suspicious domain (not official .gov)', 'Unexpected refund offer'],
    difficulty: 'medium',
    isScam: true
  },
  
  // Hard (Spear-phish) - 4 examples
  {
    id: 'hard-1',
    title: 'Invoice #INV-2024-0892',
    text: 'Your invoice for $299.99 is due. View and pay: https://invoice-payment.com/pay/INV-2024-0892',
    url: 'https://invoice-payment.com/pay/INV-2024-0892',
    redFlags: ['Generic payment domain', 'No company name in email', 'Unexpected invoice'],
    difficulty: 'hard',
    isScam: true
  },
  {
    id: 'hard-2',
    title: 'Package Delivery Attempt Failed',
    text: 'We attempted to deliver your package but no one was available. Reschedule delivery: https://usps-delivery-reschedule.com/track/1Z999AA10123456784',
    url: 'https://usps-delivery-reschedule.com/track/1Z999AA10123456784',
    redFlags: ['Non-official USPS domain', 'Tracking number format may be fake'],
    difficulty: 'hard',
    isScam: true
  },
  {
    id: 'hard-3',
    title: 'Your Microsoft Account Security',
    text: 'We noticed you signed in from a new location. Review your recent activity: https://account.microsoft.com/security',
    url: 'https://account.microsoft.com/security',
    redFlags: [],
    difficulty: 'hard',
    isScam: false
  },
  {
    id: 'hard-4',
    title: 'Update Required: Payment Method',
    text: 'Your credit card on file is expiring soon. Update it to avoid service interruption: https://stripe.com/account/update-card',
    url: 'https://stripe.com/account/update-card',
    redFlags: [],
    difficulty: 'hard',
    isScam: false
  }
];

// Initialize storage with seed data
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['examples'], (result) => {
    if (!result.examples || result.examples.length === 0) {
      chrome.storage.local.set({ examples: SEED_EXAMPLES });
    }
  });
  
  // Create context menu
  chrome.contextMenus.create({
    id: 'reportSuspicious',
    title: 'Report suspicious message',
    contexts: ['selection']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'reportSuspicious') {
    const selectedText = info.selectionText;
    const newExample = {
      id: `reported-${Date.now()}`,
      title: 'Reported Suspicious Message',
      text: selectedText,
      url: tab.url,
      redFlags: ['User reported'],
      difficulty: 'medium',
      isScam: true,
      reported: true
    };
    
    chrome.storage.local.get(['reported'], (result) => {
      const reported = result.reported || [];
      reported.push(newExample);
      chrome.storage.local.set({ reported });
    });
  }
});

// Message handler
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || !msg.type) return false;
  
  switch (msg.type) {
    case 'GET_EXAMPLES':
      chrome.storage.local.get(['examples', 'reported'], (result) => {
        const examples = result.examples || SEED_EXAMPLES;
        const reported = result.reported || [];
        const allExamples = [...examples, ...reported];
        
        sendResponse({
          type: 'RESPONSE_EXAMPLES',
          payload: allExamples,
          requestId: msg.requestId
        });
      });
      return true; // Keep channel open for async response
      
    case 'SCAN_PAGE':
      // Lightweight heuristic scanner
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          const url = tabs[0].url;
          const indicators = scanPage(url);
          sendResponse({
            type: 'SCAN_RESULT',
            payload: indicators,
            requestId: msg.requestId
          });
        }
      });
      return true;
      
    default:
      return false;
  }
});

// Lightweight page scanner
function scanPage(url) {
  const indicators = [];
  const urlLower = url.toLowerCase();
  
  // Check for suspicious patterns
  if (!url.startsWith('https://') && !url.startsWith('chrome-extension://')) {
    indicators.push('Not using HTTPS');
  }
  
  const suspiciousDomains = ['bit.ly', 'tinyurl.com', 't.co'];
  suspiciousDomains.forEach(domain => {
    if (urlLower.includes(domain)) {
      indicators.push('URL shortener detected');
    }
  });
  
  const typos = ['amazom', 'paypai', 'microsft', 'gooogle'];
  typos.forEach(typo => {
    if (urlLower.includes(typo)) {
      indicators.push(`Possible typo in domain: ${typo}`);
    }
  });
  
  return {
    url,
    indicators,
    riskLevel: indicators.length > 2 ? 'high' : indicators.length > 0 ? 'medium' : 'low'
  };
}

