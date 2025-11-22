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
    
    // Send message to content script to scan the page
    const result = await chrome.tabs.sendMessage(tab.id, { action: 'scanPage' });
    
    // Display result
    displayScanResult(result);
    
    // Save to recent scans
    await saveRecentScan(tab.url, result);
    
    // Update recent scans list
    loadRecentScans();
  } catch (error) {
    console.error('Scan error:', error);
    displayScanResult({
      status: 'error',
      message: 'Unable to scan this page. Please try again.',
      url: 'Unknown'
    });
  } finally {
    scanBtn.classList.remove('loading');
    scanBtn.disabled = false;
  }
});

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
    resultBadge.textContent = 'SAFE';
    resultBadge.className = 'result-badge';
    resultMessage.textContent = result.message || 'No obvious scam indicators found on this page.';
  } else if (result.status === 'warning') {
    scanResult.classList.add('warning');
    resultText.textContent = 'Caution Advised';
    resultBadge.textContent = 'WARNING';
    resultBadge.className = 'result-badge';
    resultMessage.textContent = result.message || 'Some suspicious indicators found. Proceed with caution.';
  } else if (result.status === 'danger') {
    scanResult.classList.add('danger');
    resultText.textContent = 'Potential Scam';
    resultBadge.textContent = 'DANGER';
    resultBadge.className = 'result-badge';
    resultMessage.textContent = result.message || 'Multiple scam indicators detected. Avoid this page.';
  } else {
    scanResult.classList.add('warning');
    resultText.textContent = 'Scan Error';
    resultBadge.textContent = 'ERROR';
    resultBadge.className = 'result-badge';
    resultMessage.textContent = result.message || 'Unable to complete scan.';
  }
  
  resultUrl.textContent = result.url || 'Unknown URL';
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

