// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.dataset.tab;
    
    // Update active tab
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    // Update active content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${tabName}-content`).classList.add('active');
  });
});

// Scan button functionality
document.getElementById('scanBtn').addEventListener('click', async () => {
  const scanBtn = document.getElementById('scanBtn');
  scanBtn.classList.add('loading');
  scanBtn.disabled = true;

  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Check if URL is scannable
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://')) {
      throw new Error('Cannot scan browser internal pages');
    }

    // Check if URL is a new tab page or file:// URL
    if (tab.url.startsWith('about:') || tab.url.startsWith('file://')) {
      throw new Error('Cannot scan this type of page');
    }

    // Try to inject content scripts if not already loaded
    try {
      await ensureContentScriptLoaded(tab.id);
    } catch (injectionError) {
      console.warn('Script injection failed:', injectionError);
      throw new Error('Please refresh the page and try again');
    }

    // Send message to content script to scan the page
    let result;
    try {
      result = await chrome.tabs.sendMessage(tab.id, { action: 'scanPage' });
    } catch (sendError) {
      // If sendMessage fails, try injecting again
      if (sendError.message && sendError.message.includes('Receiving end does not exist')) {
        console.log('Retrying script injection...');
        await ensureContentScriptLoaded(tab.id);
        result = await chrome.tabs.sendMessage(tab.id, { action: 'scanPage' });
      } else {
        throw sendError;
      }
    }

    // Display result
    displayScanResult(result);

    // Save to recent scans
    await saveRecentScan(tab.url, result);

    // Update recent scans list
    loadRecentScans();
  } catch (error) {
    console.error('Scan error:', error);
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    let errorMessage = 'Unable to scan this page.';

    if (error.message === 'Cannot scan browser internal pages') {
      errorMessage = 'Cannot scan browser internal pages.';
    } else if (error.message === 'Cannot scan this type of page') {
      errorMessage = 'Cannot scan this type of page.';
    } else if (error.message.includes('refresh') || error.message.includes('inject')) {
      errorMessage = 'Please refresh the page and try again.';
    } else if (error.message.includes('Receiving end does not exist')) {
      errorMessage = 'Content script not loaded. Please refresh the page.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    displayScanResult({
      status: 'error',
      message: errorMessage,
      url: tab?.url || 'Unknown'
    });
  } finally {
    scanBtn.classList.remove('loading');
    scanBtn.disabled = false;
  }
});

// Ensure content scripts are loaded
async function ensureContentScriptLoaded(tabId) {
  try {
    // Try to ping the content script
    const pingResponse = await chrome.tabs.sendMessage(tabId, { action: 'ping' });
    if (pingResponse && pingResponse.status === 'ready') {
      return; // Content script is loaded
    }
  } catch (error) {
    // Content script not loaded or not responding, inject it
    console.log('Injecting content scripts...');
  }

  // Content script not loaded, inject it
  try {
    // Inject scripts in order - critical for dependencies
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['config.js']
    });

    // Small delay to ensure CONFIG is available
    await new Promise(resolve => setTimeout(resolve, 50));

    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['ai-service.js']
    });

    // Small delay to ensure aiService is available
    await new Promise(resolve => setTimeout(resolve, 50));

    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    });

    // Wait for scripts to initialize and verify they're ready
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Verify content script is ready
    try {
      const verifyResponse = await chrome.tabs.sendMessage(tabId, { action: 'ping' });
      if (!verifyResponse || verifyResponse.status !== 'ready') {
        throw new Error('Content script not ready after injection');
      }
    } catch (verifyError) {
      console.warn('Content script verification failed:', verifyError);
      // Continue anyway - might still work
    }
  } catch (injectionError) {
    console.error('Script injection error:', injectionError);
    throw new Error('Failed to inject content scripts. Please refresh the page.');
  }
}

// Display scan result
function displayScanResult(result) {
  const scanResult = document.getElementById('scanResult');
  const resultText = document.getElementById('resultText');
  const resultBadge = document.getElementById('resultBadge');
  const resultMessage = document.getElementById('resultMessage');
  const resultUrl = document.getElementById('resultUrl');

  scanResult.style.display = 'flex';
  scanResult.className = 'scan-result';

  if (result.status === 'safe') {
    scanResult.classList.add('safe');
    resultText.textContent = 'Looks Safe';
    resultBadge.textContent = result.usedAI ? 'AI: SAFE' : 'SAFE';
    resultBadge.className = 'result-badge';
    resultMessage.textContent = result.message || 'No obvious scam indicators found on this page.';
  } else if (result.status === 'warning') {
    scanResult.classList.add('warning');
    resultText.textContent = 'Caution Advised';
    resultBadge.textContent = result.usedAI ? 'AI: WARNING' : 'WARNING';
    resultBadge.className = 'result-badge';
    resultMessage.textContent = result.message || 'Some suspicious indicators found. Proceed with caution.';
  } else if (result.status === 'danger') {
    scanResult.classList.add('danger');
    resultText.textContent = 'Potential Scam';
    resultBadge.textContent = result.usedAI ? 'AI: DANGER' : 'DANGER';
    resultBadge.className = 'result-badge';
    resultMessage.textContent = result.message || 'Multiple scam indicators detected. Avoid this page.';
  } else if (result.status === 'error') {
    scanResult.classList.add('warning');
    resultText.textContent = 'Scan Error';
    resultBadge.textContent = 'ERROR';
    resultBadge.className = 'result-badge';
    resultMessage.textContent = result.message || 'Unable to complete scan.';
  } else {
    scanResult.classList.add('warning');
    resultText.textContent = 'Unknown Status';
    resultBadge.textContent = 'UNKNOWN';
    resultBadge.className = 'result-badge';
    resultMessage.textContent = result.message || 'Unable to determine page status.';
  }

  resultUrl.textContent = result.url || 'Unknown URL';

  // Display AI analysis details if available
  displayAIDetails(result);
}

// Display AI analysis details
function displayAIDetails(result) {
  // Remove existing AI details if any
  const existingDetails = document.querySelector('.ai-details');
  if (existingDetails) {
    existingDetails.remove();
  }

  // Only show if AI was used
  if (!result.usedAI || !result.aiAnalysis) {
    return;
  }

  const scanResult = document.getElementById('scanResult');
  const aiDetailsDiv = document.createElement('div');
  aiDetailsDiv.className = 'ai-details';

  let detailsHTML = '<div class="ai-section-title">🤖 AI Analysis</div>';

  // Add indicators if present
  if (result.aiAnalysis.aiIndicators && result.aiAnalysis.aiIndicators.length > 0) {
    detailsHTML += '<div class="ai-subsection"><strong>Indicators Found:</strong><ul>';
    result.aiAnalysis.aiIndicators.forEach(indicator => {
      detailsHTML += `<li>${indicator}</li>`;
    });
    detailsHTML += '</ul></div>';
  }

  // Add recommendations if present
  if (result.aiAnalysis.recommendations && result.aiAnalysis.recommendations.length > 0) {
    detailsHTML += '<div class="ai-subsection"><strong>Recommendations:</strong><ul>';
    result.aiAnalysis.recommendations.forEach(rec => {
      detailsHTML += `<li>${rec}</li>`;
    });
    detailsHTML += '</ul></div>';
  }

  aiDetailsDiv.innerHTML = detailsHTML;
  scanResult.appendChild(aiDetailsDiv);
}

// Save recent scan
async function saveRecentScan(url, result) {
  const scans = await getRecentScans();
  const scanData = {
    url,
    status: result.status || 'unknown',
    message: result.message || '',
    timestamp: new Date().toLocaleTimeString(),
    date: Date.now()
  };
  
  scans.unshift(scanData);
  // Keep only last 10 scans
  if (scans.length > 10) {
    scans.pop();
  }
  
  await chrome.storage.local.set({ recentScans: scans });
}

// Get recent scans
async function getRecentScans() {
  const data = await chrome.storage.local.get(['recentScans']);
  return data.recentScans || [];
}

// Load and display recent scans
async function loadRecentScans() {
  const scans = await getRecentScans();
  const scansList = document.getElementById('scansList');
  
  if (scans.length === 0) {
    scansList.innerHTML = '<p style="color: #999; font-size: 14px; padding: 20px; text-align: center;">No recent scans</p>';
    return;
  }
  
  scansList.innerHTML = scans.map(scan => {
    const statusClass = scan.status === 'safe' ? 'safe' : 
                       scan.status === 'warning' ? 'warning' : 'danger';
    const icon = scan.status === 'safe' ? '✓' : 
                 scan.status === 'warning' ? '⚠' : '✗';
    const badgeText = scan.status === 'safe' ? 'safe' : 
                     scan.status === 'warning' ? 'warning' : 'danger';
    
    return `
      <div class="scan-item ${statusClass}">
        <div class="scan-item-icon">${icon}</div>
        <div class="scan-item-content">
          <div class="scan-item-url">${truncateUrl(scan.url)}</div>
          <div class="scan-item-time">${scan.timestamp}</div>
        </div>
        <div class="scan-item-badge">${badgeText}</div>
      </div>
    `;
  }).join('');
}

// Truncate URL for display
function truncateUrl(url) {
  if (url.length > 45) {
    return url.substring(0, 42) + '...';
  }
  return url;
}

// Close button
document.getElementById('closeBtn').addEventListener('click', () => {
  window.close();
});

// Expand button (placeholder - could open in new window)
document.getElementById('expandBtn').addEventListener('click', () => {
  // Could implement opening in a larger window
  console.log('Expand clicked');
});

// Load recent scans on popup open
loadRecentScans();

