document.addEventListener('DOMContentLoaded', () => {
  // Load saved settings
  chrome.storage.sync.get(['weights', 'thresholds', 'enabled'], (result) => {
    const weights = result.weights || {
      hiringRate: 35,
      paymentVerified: 25,
      lastSeen: 30,
      totalJobs: 5,
      totalSpending: 5
    };
    
    const thresholds = result.thresholds || {
      good: 70,
      average: 40
    };
    
    const enabled = result.enabled !== undefined ? result.enabled : true;
    
    // Update UI with saved settings
    document.getElementById('enableExtension').checked = enabled;
    
    // Update weight sliders
    updateSliderAndValue('hiringRateWeight', weights.hiringRate);
    updateSliderAndValue('paymentVerifiedWeight', weights.paymentVerified);
    updateSliderAndValue('lastSeenWeight', weights.lastSeen);
    updateSliderAndValue('totalJobsWeight', weights.totalJobs);
    updateSliderAndValue('totalSpendingWeight', weights.totalSpending);
    
    // Update threshold sliders
    updateSliderAndValue('goodThreshold', thresholds.good);
    updateSliderAndValue('averageThreshold', thresholds.average);
  });
  
  // Helper function to safely update slider and value element
  function updateSliderAndValue(sliderId, value) {
    const sliderElement = document.getElementById(sliderId);
    const valueElement = document.getElementById(sliderId + 'Value');
    
    if (sliderElement) {
      sliderElement.value = value;
    }
    
    if (valueElement) {
      valueElement.textContent = value;
    } else {
      console.warn(`Value element for ${sliderId} not found`);
    }
  }
  
  // Add event listeners for slider changes
  const sliders = [
    'hiringRateWeight', 'paymentVerifiedWeight', 'lastSeenWeight', 
    'totalJobsWeight', 'totalSpendingWeight', 'goodThreshold', 'averageThreshold'
  ];
  
  sliders.forEach(sliderId => {
    const sliderElement = document.getElementById(sliderId);
    if (sliderElement) {
      sliderElement.addEventListener('input', (e) => {
        const valueElement = document.getElementById(sliderId + 'Value');
        if (valueElement) {
          valueElement.textContent = e.target.value;
        }
        saveSettings();
      });
    } else {
      console.warn(`Slider element ${sliderId} not found`);
    }
  });
  
  // Add event listener for toggle switch
  const enableElement = document.getElementById('enableExtension');
  if (enableElement) {
    enableElement.addEventListener('change', () => {
      saveSettings();
    });
  }
  
  // Add event listener for reset button
  const resetButton = document.getElementById('resetButton');
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      const defaultSettings = {
        weights: {
          hiringRate: 35,
          paymentVerified: 25,
          lastSeen: 30,
          totalJobs: 5,
          totalSpending: 5
        },
        thresholds: {
          good: 70,
          average: 40
        },
        enabled: true
      };
      
      chrome.storage.sync.set(defaultSettings, () => {
        // Reload the popup to reflect default settings
        window.location.reload();
      });
    });
  }
});

// Save all settings to storage
function saveSettings() {
  // Safely get values
  function getElementValueById(id, defaultValue) {
    const element = document.getElementById(id);
    return element ? parseInt(element.value) : defaultValue;
  }
  
  const weights = {
    hiringRate: getElementValueById('hiringRateWeight', 35),
    paymentVerified: getElementValueById('paymentVerifiedWeight', 25),
    lastSeen: getElementValueById('lastSeenWeight', 30),
    totalJobs: getElementValueById('totalJobsWeight', 5),
    totalSpending: getElementValueById('totalSpendingWeight', 5)
  };
  
  const thresholds = {
    good: getElementValueById('goodThreshold', 70),
    average: getElementValueById('averageThreshold', 40)
  };
  
  const enableElement = document.getElementById('enableExtension');
  const enabled = enableElement ? enableElement.checked : true;
  
  chrome.storage.sync.set({
    weights: weights,
    thresholds: thresholds,
    enabled: enabled
  });
}