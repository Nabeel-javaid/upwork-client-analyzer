# Upwork Client Analyzer

A Chrome extension and Python-based tool for analyzing Upwork client data.

## Features

- Chrome extension for data collection
- Python backend for data processing
- Gmail integration for notifications

## Setup

1. Install the required Python packages:
```bash
pip install -r requirements.txt
```

2. Load the Chrome extension:
   - Open Chrome and go to `chrome://extensions/`
   - Enable Developer Mode
   - Click 'Load unpacked' and select the extension directory

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your credentials and API keys

## Project Structure

- `/popup` - Chrome extension popup interface
- `/content-scripts` - Chrome extension content scripts
- `background.js` - Chrome extension background script
- `manifest.json` - Chrome extension manifest
- `gmail.py` - Gmail integration module