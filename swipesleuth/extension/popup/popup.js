// Popup script for SwipeSleuth extension

document.addEventListener('DOMContentLoaded', () => {
  updateStats();
  
  document.getElementById('pushExamples').addEventListener('click', pushExamplesToPage);
  document.getElementById('exportData').addEventListener('click', exportData);
  document.getElementById('importData').addEventListener('click', importData);
});

function updateStats() {
  chrome.storage.local.get(['examples', 'reported'], (result) => {
    const exampleCount = (result.examples || []).length;
    const reportedCount = (result.reported || []).length;
    
    document.getElementById('exampleCount').textContent = exampleCount;
    document.getElementById('reportedCount').textContent = reportedCount;
  });
}

function pushExamplesToPage() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'PUSH_EXAMPLES',
        source: 'popup'
      }, (response) => {
        showStatus('Examples pushed to page', 'success');
      });
    }
  });
}

function exportData() {
  chrome.storage.local.get(null, (data) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `swipesleuth-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showStatus('Data exported', 'success');
  });
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        chrome.storage.local.set(data, () => {
          updateStats();
          showStatus('Data imported successfully', 'success');
        });
      } catch (error) {
        showStatus('Invalid JSON file', 'error');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function showStatus(message, type) {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  setTimeout(() => {
    statusDiv.textContent = '';
    statusDiv.className = '';
  }, 3000);
}

