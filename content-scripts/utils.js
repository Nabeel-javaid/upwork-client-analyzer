// Calculate worthiness score based on client data and weights
function calculateWorthinessScore(clientData, weights) {
  let score = 0;
  let debugInfo = {};
  
  // Hiring rate (0-40 points by default)
  if (clientData.hiringRate !== null) {
    const hiringScore = (clientData.hiringRate / 100) * weights.hiringRate;
    score += hiringScore;
    debugInfo.hiringScore = hiringScore;
  }
  
  // Payment verification (0 or 15 points by default)
  if (clientData.paymentVerified !== null) {
    const paymentScore = clientData.paymentVerified ? weights.paymentVerified : 0;
    score += paymentScore;
    debugInfo.paymentScore = paymentScore;
  }
  
  // Last seen recency (0-20 points by default)
  if (clientData.lastSeen !== null) {
    const daysSinceLastSeen = calculateDaysSinceLastSeen(clientData.lastSeen);
    // Full points if seen in last 2 days, decreases to 0 at 22 days
    const lastSeenScore = Math.max(0, weights.lastSeen - daysSinceLastSeen);
    score += lastSeenScore;
    debugInfo.lastSeenScore = lastSeenScore;
  }
  
  // Total jobs posted (0-10 points by default)
  if (clientData.totalJobs !== null) {
    // Scale: 0 jobs = 0 points, 10+ jobs = full points
    const jobsScore = Math.min(clientData.totalJobs, 10) / 10 * weights.totalJobs;
    score += jobsScore;
    debugInfo.jobsScore = jobsScore;
  }
  
  // Total spending (0-15 points by default)
  if (clientData.totalSpending !== null) {
    // Scale: $0 = 0 points, $10,000+ = full points
    const spendingNormalized = Math.min(clientData.totalSpending, 10000) / 10000;
    const spendingScore = spendingNormalized * weights.totalSpending;
    score += spendingScore;
    debugInfo.spendingScore = spendingScore;
  }
  
  console.log('Score calculation details:', debugInfo);
  return Math.round(score);
}

// Calculate days since client was last seen
function calculateDaysSinceLastSeen(lastSeenText) {
  if (!lastSeenText) return 30; // Default if no data
  
  // Handle common time phrases
  lastSeenText = lastSeenText.toLowerCase();
  
  if (lastSeenText.includes('yesterday')) {
    return 1;
  } else if (lastSeenText.includes('today') || lastSeenText.includes('hour') || 
             lastSeenText.includes('minute') || lastSeenText.includes('online now')) {
    return 0;
  } else if (lastSeenText.includes('week')) {
    const weeksMatch = lastSeenText.match(/(\d+)\s+week/);
    return weeksMatch ? parseInt(weeksMatch[1]) * 7 : 14; // Default to 2 weeks
  } else if (lastSeenText.includes('month')) {
    const monthsMatch = lastSeenText.match(/(\d+)\s+month/);
    return monthsMatch ? parseInt(monthsMatch[1]) * 30 : 30; // Default to 1 month
  } else if (lastSeenText.includes('day')) {
    const daysMatch = lastSeenText.match(/(\d+)\s+day/);
    return daysMatch ? parseInt(daysMatch[1]) : 3; // Default to 3 days
  }
  
  return 30; // Default if format is unknown
}

// Display score widget with improved styling
function displayScoreWidget(score, thresholds, container) {
  // Create score widget element with proper styling
  const widget = document.createElement('div');
  widget.className = 'upwork-analyzer-widget';
  
  // Determine rating category and color
  let category, color;
  if (score >= thresholds.good) {
    category = 'Good';
    color = '#14a800'; // Green
  } else if (score >= thresholds.average) {
    category = 'Average';
    color = '#f39c12'; // Orange
  } else {
    category = 'Poor';
    color = '#e74c3c'; // Red
  }
  
  // Add styles to widget
  widget.style.display = 'inline-block';
  widget.style.marginLeft = '10px';
  widget.style.position = 'relative';
  widget.style.fontFamily = 'Arial, sans-serif';
  widget.style.fontSize = '14px';
  
  // Create badge
  const badge = document.createElement('div');
  badge.style.backgroundColor = color;
  badge.style.color = 'white';
  badge.style.padding = '4px 8px';
  badge.style.borderRadius = '4px';
  badge.style.fontWeight = 'bold';
  badge.style.cursor = 'pointer';
  badge.textContent = `Score: ${score}`;
  
  // Create tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'upwork-analyzer-tooltip';
  tooltip.style.position = 'absolute';
  tooltip.style.top = '100%';
  tooltip.style.left = '0';
  tooltip.style.zIndex = '1000';
  tooltip.style.backgroundColor = 'white';
  tooltip.style.border = '1px solid #ddd';
  tooltip.style.borderRadius = '4px';
  tooltip.style.padding = '10px';
  tooltip.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
  tooltip.style.width = '220px';
  tooltip.style.display = 'none';
  
  tooltip.innerHTML = `
    <div style="margin-bottom: 5px; font-weight: bold;">Client Score: ${score}/100</div>
    <div style="margin-bottom: 5px;">Category: <span style="color:${color}; font-weight: bold;">${category}</span></div>
    <div style="margin-bottom: 5px; font-size: 12px;">This score is based on available client data.</div>
    <div style="margin-top: 10px; font-size: 11px; color: #777; text-align: right;">Upwork Client Analyzer</div>
  `;
  
  // Add hover behavior for tooltip
  badge.addEventListener('mouseenter', () => {
    tooltip.style.display = 'block';
  });
  
  badge.addEventListener('mouseleave', () => {
    tooltip.style.display = 'none';
  });
  
  // Assemble and add widget to container
  widget.appendChild(badge);
  widget.appendChild(tooltip);
  container.appendChild(widget);
}