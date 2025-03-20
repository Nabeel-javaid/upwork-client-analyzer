// Initialize default settings when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({
      weights: {
        hiringRate: 50,
        paymentVerified: 15,
        lastSeen: 20,
        totalJobs: 10,
        totalSpending: 15
      },
      thresholds: {
        good: 80,
        average: 60
      },
      enabled: true
    });
  });

  //listen for message
  
  
  // Listen for messages from content scripts
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'getSettings') {
      chrome.storage.sync.get(['weights', 'thresholds', 'enabled'], (result) => {
        sendResponse(result);
      });
      return true; // Required for async sendResponse
    }
  });