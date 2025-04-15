chrome.runtime.sendMessage({ type: 'getSettings' }, (settings) => {
  if (settings && settings.enabled) {
    analyzeSearchResults(settings);
  }
});

// Define the selectors for job cards
const JOB_CARD_SELECTORS = '.job-tile, [data-test="job-tile"], [data-job-uid]';
// Define a set to keep track of processed cards to avoid duplicates
const processedCards = new Set();

function processJobCard(card, settings) {
  // Check if card has already been processed
  if (processedCards.has(card)) {
    return;
  }
  processedCards.add(card); // Mark card as processed

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
  if (titleElement && !titleElement.parentNode.querySelector('.worthiness-widget-container')) { // Prevent adding multiple widgets
    const widgetContainer = document.createElement('div');
    widgetContainer.style.display = 'inline-block';
    widgetContainer.classList.add('worthiness-widget-container'); // Add class for identification
    titleElement.parentNode.insertBefore(widgetContainer, titleElement.nextSibling);
    // Assuming displayScoreWidget exists and is imported/available
    displayScoreWidget(adjustedScore, settings.thresholds, widgetContainer);
  }
}

function analyzeSearchResults(settings) {
  // Function to process all job cards currently on the page
  const processExistingCards = () => {
    const jobCards = document.querySelectorAll(JOB_CARD_SELECTORS);
    jobCards.forEach(card => processJobCard(card, settings));
  };

  // Initial processing for any cards already loaded
  processExistingCards();

  // Set up the MutationObserver
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          // Check if the added node is an element
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the added node itself is a job card
            if (node.matches(JOB_CARD_SELECTORS)) {
              processJobCard(node, settings);
            }
            // Check if the added node contains job cards
            const newCards = node.querySelectorAll(JOB_CARD_SELECTORS);
            newCards.forEach(card => processJobCard(card, settings));
          }
        });
      }
    }
  });

  // Start observing the document body for added nodes
  observer.observe(document.body, { childList: true, subtree: true });

  // Optional: Consider disconnecting the observer if the page navigates away
  // or if the search context changes significantly, though for a typical
  // search results page, letting it run is usually fine.
  // Example: window.addEventListener('unload', () => observer.disconnect());
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