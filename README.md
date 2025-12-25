# Wallestars

GitHub Browser Automation - Open Browser Session and Login

## Overview

This project demonstrates browser automation to open a new browser session and login to GitHub web interface using Playwright.

## Features

- ✨ Automated browser session creation
- 🔐 GitHub web login automation
- 🎭 Playwright-based browser control
- 📝 Interactive and environment variable credential input
- 🖥️ Visual browser mode (non-headless) to see the login process

## Installation

```bash
npm install
npm run install-browsers
```

## Usage

### Option 1: Using Playwright (Full Automation)

```bash
# Set credentials as environment variables
export GITHUB_USERNAME=your_username
export GITHUB_PASSWORD=your_password

# Run the login script
npm run login
```

Or in one line:

```bash
GITHUB_USERNAME=your_username GITHUB_PASSWORD=your_password npm run login
```

### Option 2: Demo Mode (Workflow Simulation)

```bash
npm run login-demo
```

This will run an interactive demo that simulates the login workflow without actually opening a browser.

## Files

- `github-login-playwright.js` - Full Playwright implementation with actual browser automation
- `github-login.js` - Demo/simulation script showing the workflow
- `package.json` - Node.js project configuration with dependencies

## How It Works

1. **Launch Browser**: Opens a Chromium browser instance in non-headless mode
2. **Create Context**: Creates a new browser context (like an incognito window)
3. **Open Page**: Opens a new page/tab
4. **Navigate**: Goes to `https://github.com/login`
5. **Fill Credentials**: Enters username and password
6. **Submit**: Clicks the sign-in button
7. **Verify**: Checks if login was successful

## Security Notes

- ⚠️ Never commit credentials to version control
- ⚠️ Use environment variables for credentials
- ⚠️ Consider using GitHub tokens or OAuth for production use
- ⚠️ This is a demonstration - use appropriate security measures for real implementations

## Requirements

- Node.js 16+ recommended
- npm or yarn
- Internet connection
- Valid GitHub account credentials

## Troubleshooting

### Two-Factor Authentication (2FA)

If your GitHub account has 2FA enabled, you'll need to manually enter the verification code when prompted in the browser window.

### Browser Not Installing

If Playwright browsers don't install automatically, run:

```bash
npx playwright install chromium
```

## License

ISC

