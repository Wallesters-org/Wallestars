# Wallestars

GitHub Browser Automation - Open Browser Session and Login

**Система за Изпълнение на GitHub Задачи** | **GitHub Task Execution System**

## 🌟 Най-лесен начин: Web GUI Platform (v3.0)

**НОВО!** Използвайте браузър-базиран интерфейс - без командна линия, без credentials, на български език!

```bash
# Стартирай веднага
npm start

# Отвори в браузър
http://localhost:3000
```

**Виж [WEB-GUI-GUIDE-BG.md](WEB-GUI-GUIDE-BG.md) за пълно ръководство на български!**

### ✨ Защо Web GUI?

- 🖱️ **Интерактивни бутони** - без командна линия
- 🇧🇬 **На български език** - пълен превод
- 🔓 **Без credentials** - работи без GitHub парола (опционални)
- 📊 **Real-time статус** - виждаш прогреса в реално време
- 🎨 **Красив интерфейс** - модерен дизайн
- 👶 **Лесен за начинаещи** - просто добави задачи и натисни Старт

## Overview

This project provides browser automation to open a new browser session and login to GitHub web interface using Playwright. Now includes a **task execution system** with Bulgarian language support and a **web-based GUI** for easy task management.

## 🆕 New Features

### v3.0 - Web GUI Platform
- 🖥️ **Browser-based Interface** - No command line needed
- 🎮 **Interactive Buttons** - Add, remove, start, stop tasks with clicks
- 📊 **Real-time Progress** - Visual progress bar and live logs
- 🔓 **Optional Credentials** - Works without GitHub login
- 🇧🇬 **Bulgarian UI** - Complete Bulgarian interface

### v2.0 - Task Execution System
- 🇧🇬 **Bulgarian Language Support** - Full interface in Bulgarian (Български език)
- 📋 **Task-Based System** - Read tasks from JSON files or interactive input
- 📊 **Structured Planning** - Automatic task structuring with step-by-step breakdown
- ✅ **Confirmation Workflow** - Review and confirm execution plan before running
- 🎯 **Codespace Integration** - Automated GitHub Codespace setup
- 🔄 **Multi-Task Execution** - Execute multiple tasks in sequence

## Features

- ✨ Automated browser session creation
- 🔐 GitHub web login automation (optional)
- 🎭 Playwright-based browser control
- 📝 Interactive and environment variable credential input
- 🖥️ Visual browser mode (non-headless) to see the login process
- 🇧🇬 Bulgarian language interface for task execution
- 📋 JSON-based task definition system
- ✅ Plan confirmation before execution
- 🌐 Web GUI for easy task management

## Installation

```bash
# Quick setup (includes browsers)
npm run setup

# Or step by step
npm install
npm run install-browsers
```

## Usage

### 🌟 Recommended: Web GUI Platform

**Най-лесния начин / The easiest way:**

```bash
npm start
# или / or
npm run gui
```

Then open your browser at: `http://localhost:3000`

**No credentials required!** The platform works without GitHub login.

See [WEB-GUI-GUIDE-BG.md](WEB-GUI-GUIDE-BG.md) for complete Bulgarian guide.

### 🆕 Task Execution System (Command Line)

#### Interactive Mode:
```bash
GITHUB_PASSWORD=your_password npm run tasks-interactive
```

Then enter tasks one by one in Bulgarian or English.

#### With JSON File:
```bash
GITHUB_PASSWORD=your_password npm run tasks tasks.json
```

#### Direct Execution:
```bash
GITHUB_EMAIL=your_email@example.com GITHUB_PASSWORD=your_password node task-executor.js tasks.json
```

See `CODESPACE-SETUP-BG.md` for detailed Bulgarian instructions.

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
- `task-executor.js` - 🆕 Task execution system with Bulgarian interface
- `tasks.json` - 🆕 Example task definitions
- `package.json` - Node.js project configuration with dependencies
- `CODESPACE-SETUP-BG.md` - 🆕 Bulgarian setup guide for Codespaces

## Task Definition Format

Create a `tasks.json` file:

```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Create Codespace",
      "description": "Create a new GitHub Codespace",
      "type": "codespace",
      "status": "pending"
    },
    {
      "id": 2,
      "title": "Install Dependencies",
      "description": "Install npm packages",
      "type": "setup",
      "status": "pending"
    }
  ]
}
```

## How It Works

### Simple Login:
1. **Launch Browser**: Opens a Chromium browser instance in non-headless mode
2. **Create Context**: Creates a new browser context (like an incognito window)
3. **Open Page**: Opens a new page/tab
4. **Navigate**: Goes to `https://github.com/login`
5. **Fill Credentials**: Enters username and password
6. **Submit**: Clicks the sign-in button
7. **Verify**: Checks if login was successful

### Task Execution System:
1. **Read Tasks**: Load from JSON file or interactive input
2. **Structure Plan**: Automatically break down tasks into steps
3. **Show Plan**: Display complete execution plan in Bulgarian
4. **Confirm**: Request user confirmation (да/не)
5. **Execute**: Run all tasks sequentially with visual feedback
6. **Report**: Show completion status for each task

## Security Notes

- ⚠️ Never commit credentials to version control
- ⚠️ Use environment variables for credentials
- ⚠️ Consider using GitHub tokens or OAuth for production use
- ⚠️ This is a demonstration - use appropriate security measures for real implementations
- ⚠️ The `.env` file is already in `.gitignore`

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

### Task Execution Issues

See `CODESPACE-SETUP-BG.md` for detailed troubleshooting in Bulgarian.

## Documentation

- `README.md` - This file (English + Bulgarian info)
- `EXAMPLES.md` - Usage examples and advanced scenarios
- `IMPLEMENTATION.md` - Technical implementation details
- `CODESPACE-SETUP-BG.md` - Bulgarian setup guide (🆕)

## License

ISC

