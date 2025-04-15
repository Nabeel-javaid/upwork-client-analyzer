# Upwork Client Analyzer

A Chrome extension to help freelancers analyze potential clients on Upwork by providing a "worthiness" score directly on job and search pages.

## Features

*   **Client Scoring:** Automatically analyzes client data on Upwork job pages and search results.
*   **Injects Score Badge:** Displays a score (Good, Average, Poor) with a color-coded badge next to job titles or on job cards.
*   **Customizable Weights:** Adjust the importance of different client metrics (Hiring Rate, Payment Verified, Recent Activity, Job History, Total Spending) via the popup.
*   **Popup Interface:** Easily enable/disable the extension and manage settings through the extension popup.
*   **Dynamic Loading Support:** Handles jobs loaded dynamically on search results pages.

## How Scoring Works

The extension calculates a score out of 100 based on the following client data points found on their profile or job posting:

1.  **Hiring Rate:** Percentage of jobs posted that resulted in a hire.
2.  **Payment Method Verified:** Whether the client has a verified payment method.
3.  **Recent Activity:** How recently the client was last active or viewed the job posting.
4.  **Job History:** The number of jobs the client has posted previously.
5.  **Total Spending:** The approximate total amount the client has spent on Upwork.

The weight given to each factor can be adjusted in the extension popup. On search result pages, where less data is available, a partial score is calculated and adjusted downwards.

## Setup

1.  Clone or download this repository.
2.  Open Chrome and navigate to `chrome://extensions/`.
3.  Enable "Developer mode" using the toggle switch in the top-right corner.
4.  Click the "Load unpacked" button.
5.  Select the directory where you cloned or downloaded this repository.

The extension icon should now appear in your Chrome toolbar.

## Usage

1.  Navigate to an Upwork job posting page or a job search results page.
2.  The extension will automatically analyze client data and display a score badge near the job title.
3.  Click the extension icon in your toolbar to open the popup.
4.  From the popup, you can:
    *   Enable or disable the extension.
    *   Adjust the sliders to change the weight of each scoring factor.
    *   Adjust the sliders to change the score thresholds for "Good" and "Average".
    *   Reset settings to their defaults.

## Project Structure

*   `/popup` - Files for the extension's popup interface (`popup.html`, `popup.js`).
*   `/content-scripts` - Scripts injected into Upwork pages (`job-page.js`, `search-page.js`, `utils.js`).
*   `background.js` - The extension's background service worker.
*   `manifest.json` - The extension's manifest file.
*   `README.md` - This file.