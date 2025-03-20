chrome.runtime.sendMessage({ type: 'getSettings' }, (settings) => {
  if (settings && settings.enabled) {
    analyzeSearchResults(settings);
  }
});

function analyzeSearchResults(settings) {
  // Wait for search results to load
  setTimeout(() => {
    // Get all job cards in search results - updated selectors
    const jobCards = document.querySelectorAll('.job-tile, [data-test="job-tile"], [data-job-uid]');
    
    // Process each job card
    jobCards.forEach(card => {
      // Extract limited client data available in search results
      const clientData = {
        hiringRate: extractHiringRateFromCard(card),
        paymentVerified: checkPaymentVerificationFromCard(card),
        lastSeen: null, // Usually not available in search results
        totalJobs: null, // Usually not available in search results
        totalSpending: null // Usually not available in search results
      };
      
      // Calculate partial score with available data
      const partialScore = calculateWorthinessScore(clientData, settings.weights);
      
      // Apply a penalty for missing data
      const missingDataPenalty = 20; // Adjust based on importance of missing data
      const adjustedScore = Math.max(0, partialScore - missingDataPenalty);
      
      // Display widget on the job card
      const titleElement = card.querySelector('.job-title, [data-test="job-title"], a[href*="/jobs/"]');
      if (titleElement) {
        const widgetContainer = document.createElement('div');
        widgetContainer.style.display = 'inline-block';
        titleElement.parentNode.insertBefore(widgetContainer, titleElement.nextSibling);
        displayScoreWidget(adjustedScore, settings.thresholds, widgetContainer);
      }
    });
  }, 1500); // Delay to ensure results are loaded
}

// Data extraction functions for search results - updated for current Upwork UI
function extractHiringRateFromCard(card) {
  const cardText = card.innerText;
  const hiringMatch = cardText.match(/(\d+)%\s*hire\s*rate/i);
  
  return hiringMatch ? parseInt(hiringMatch[1]) : null;
}

function checkPaymentVerificationFromCard(card) {
  return card.innerText.includes('Payment method verified') || 
         card.querySelector('[data-test="payment-verified"], .payment-verified-icon');
}