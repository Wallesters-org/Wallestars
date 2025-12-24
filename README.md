# Wallestars

Browser automation script to open ChatGPT.com using Airtop cloud browsers

## Description
This project contains a Node.js script that uses Airtop and Playwright to automatically open a cloud browser window and navigate to ChatGPT.com. Airtop provides scalable, cloud-based browser infrastructure that's perfect for automation tasks.

## Prerequisites
- Node.js (v14 or higher)
- npm
- Airtop API key (sign up at https://www.airtop.ai/)

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

## Configuration

Set your Airtop API key as an environment variable:

```bash
export AIRTOP_API_KEY=your_api_key_here
```

Or on Windows:
```cmd
set AIRTOP_API_KEY=your_api_key_here
```

You can also create a `.env` file in the project root:
```
AIRTOP_API_KEY=your_api_key_here
```

Note: To use `.env` files, you'll need to install and configure the `dotenv` package separately, or manually export the variables before running the script.

## Usage

Run the script:
```bash
npm start
```

This will:
1. Initialize an Airtop client
2. Create a new Airtop browser session
3. Open a window navigating to https://chatgpt.com
4. Connect Playwright to the Airtop browser via CDP
5. Display a Live View URL where you can watch the browser

The console will display:
- Session ID
- Window ID
- Live View URL (open this in your browser to see the automation)

Press Ctrl+C to exit the script and clean up resources.

## Features

- **Cloud-based browsers**: Uses Airtop's scalable cloud infrastructure
- **Live View**: Watch your automation in real-time via the provided URL
- **CDP Integration**: Playwright connects to Airtop browsers via Chrome DevTools Protocol
- **Graceful shutdown**: Proper cleanup of browser connections and sessions

## Project Structure
- `index.js` - Main script that creates Airtop session and connects Playwright
- `package.json` - Project dependencies and configuration
