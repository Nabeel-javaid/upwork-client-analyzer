// This is the updated job-page.js with fixed selectors
chrome.runtime.sendMessage({ type: 'getSettings' }, (settings) => {
  if (settings && settings.enabled) {
    analyzeJobPage(settings);
  }
});

function analyzeJobPage(settings) {
  // Wait for client info section to load
  setTimeout(() => {
    // Get client info section using standard selectors without jQuery syntax
    const clientInfoSection = document.querySelector('[data-test="client-info"]') || 
                             document.querySelector('.up-card-section') || 
                             document.querySelector('.job-details-card');
    
    // Verify if this section contains client info by checking its text content
    if (!clientInfoSection || 
        !(clientInfoSection.textContent.includes('About the client') || 
          clientInfoSection.textContent.includes('Payment method'))) return;
    
    // Extract client data
    const clientData = {
      hiringRate: extractHiringRate(),
      paymentVerified: checkPaymentVerification(),
      lastSeen: extractLastSeen(),
      totalJobs: extractTotalJobs(),
      totalSpending: extractTotalSpending()
    };
    
    // Log extracted data for debugging
    console.log('Upwork Client Analyzer - Extracted data:', clientData);
    
    // Calculate the worthiness score
    const score = calculateWorthinessScore(clientData, settings.weights);
    
    // Display the score widget
    const titleContainer = document.querySelector('.job-title-wrapper') || 
                          document.querySelector('[data-test="job-title"]') ||
                          document.querySelector('h1');
                          
    if (titleContainer) {
      displayScoreWidget(score, settings.thresholds, titleContainer);
    } else {
      // Fallback to another container if job title not found
      const alternativeContainer = document.querySelector('.up-card-header') || 
                                  document.querySelector('header');
      if (alternativeContainer) {
        displayScoreWidget(score, settings.thresholds, alternativeContainer);
      }
    }
  }, 1500); // Increased delay to ensure page is fully loaded
}

// Updated data extraction functions

function extractHiringRate() {
  // Look for the hire rate text with pure JS
  const elements = document.querySelectorAll('*');
  for (let element of elements) {
    const text = element.textContent;
    if (text && text.match(/(\d+)%\s*hire\s*rate/i)) {
      const match = text.match(/(\d+)%\s*hire\s*rate/i);
      return parseInt(match[1]);
    }
  }
  return null;
}

function checkPaymentVerification() {
  // Check if payment method verified is present
  return document.body.textContent.includes('Payment method verified');
}

function extractLastSeen() {
  // Extract Last viewed by client info
  const elements = document.querySelectorAll('*');
  for (let element of elements) {
    if (element.textContent && element.textContent.includes('Last viewed by client')) {
      return element.textContent.trim();
    }
  }
  
  // Alternative: Look for "yesterday" or time references
  if (document.body.textContent.includes('yesterday')) {
    return 'yesterday';
  }
  
  return null;
}

function extractTotalJobs() {
  // Look for "X jobs posted" pattern
  const elements = document.querySelectorAll('*');
  for (let element of elements) {
    const text = element.textContent;
    if (text && text.match(/(\d+)\s*jobs?\s*posted/i)) {
      const match = text.match(/(\d+)\s*jobs?\s*posted/i);
      return parseInt(match[1]);
    }
  }
  
  return null;
}

function extractTotalSpending() {
  // Look for spending pattern like "$516 total spent"
  const elements = document.querySelectorAll('*');
  for (let element of elements) {
    const text = element.textContent;
    if (text && text.match(/\$\s*([0-9,]+)(?:\s*total\s*spent)?/i)) {
      const match = text.match(/\$\s*([0-9,]+)(?:\s*total\s*spent)?/i);
      return parseInt(match[1].replace(/,/g, ''));
    }
  }
  
  return null;
}