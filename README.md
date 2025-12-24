# Wallestars

Browser automation script to open ChatGPT.com

## Description
This project contains a simple Node.js script that uses Playwright to automatically open a new browser window and navigate to ChatGPT.com.

## Prerequisites
- Node.js (v14 or higher)
- npm

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install chromium
```

## Usage

Run the script:
```bash
npm start
```

This will:
1. Open a new Chromium browser window
2. Navigate to https://chatgpt.com
3. Keep the browser open for you to use

Press Ctrl+C to exit the script (or just close the browser window manually).

## Project Structure
- `index.js` - Main script that opens browser and navigates to ChatGPT
- `package.json` - Project dependencies and configuration
