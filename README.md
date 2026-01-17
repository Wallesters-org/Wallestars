# 🌟 Wallestars Control Center

<div align="center">

![Wallestars Banner](https://img.shields.io/badge/Wallestars-Control_Center-0ea5e9?style=for-the-badge)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-43853d?style=flat-square&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb?style=flat-square&logo=react)](https://reactjs.org/)
[![Claude AI](https://img.shields.io/badge/Claude-Sonnet_4.5-8b5cf6?style=flat-square)](https://anthropic.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![MCP](https://img.shields.io/badge/MCP-Compatible-orange?style=flat-square)](MCP_SETUP.md)

**Professional platform for Claude AI automation on Linux and Android**

*Beautiful real-time visualization • Computer Use • Device Control • MCP Support*

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [MCP Setup](#-mcp-model-context-protocol) • **[Site Access](SITE_ACCESS_INSTRUCTIONS.md)**

</div>

---

## 🌐 Live Site Access

**Important**: For instructions on how to access the deployed site, please see **[SITE_ACCESS_INSTRUCTIONS.md](SITE_ACCESS_INSTRUCTIONS.md)** (Available in Bulgarian and English).

### Quick Links:
- **Custom Domain**: https://workmail.pro (after DNS configuration)
- **GitHub Pages**: https://wallesters-org.github.io/Wallestars (static frontend only)
- **VPS Deployment**: https://srv1201204.hstgr.cloud (full functionality)

> **Note**: GitHub Pages deployment hosts only the static frontend. For full backend functionality (Claude AI, Computer Use, Android Control), use the VPS deployment.

---

## 🎯 Overview

**Wallestars Control Center** is a cutting-edge platform that brings Claude AI's powerful capabilities to Linux desktop control and Android device automation. With a beautiful, professional UI and real-time visualization, you can:

- 💬 Chat with Claude AI using the latest Sonnet 4.5 model
- 🖥️ Control your Linux desktop with Computer Use API
- 📱 Automate Android devices via ADB
- 📊 Monitor system metrics in real-time
- 🎨 Enjoy a stunning, responsive interface

---

## ✨ Features

### 🤖 Claude AI Integration
- **Claude Sonnet 4.5** - Latest AI model with advanced reasoning
- **Chat Interface** - Beautiful conversational UI
- **Computer Use** - AI-powered desktop automation
- **Vision Capabilities** - Screenshot analysis and action planning

### 🖥️ Linux Computer Use
- **Screen Streaming** - Real-time desktop visualization
- **Mouse Control** - Click, drag, and interact via `xdotool`
- **Keyboard Input** - Type text and press keys
- **System Information** - Monitor hostname, uptime, memory
- **Safe Command Execution** - Whitelisted shell commands

### 📱 Android Control
- **ADB Integration** - Control devices via Android Debug Bridge
- **Screenshot Capture** - View device screen in real-time
- **Touch Simulation** - Tap, swipe, and interact
- **Text Input** - Type on device keyboard
- **Navigation** - Home, Back, Power buttons
- **Device Info** - Model, Android version, battery level

### 📄 Smart Scan
- **AI Document Classification** - Automatically identify invoices, receipts, notes, and more
- **Intelligent Data Extraction** - Extract structured data using Claude Vision API
- **Invoice Processing** - Extract vendor info, line items, totals, and tax details
- **Validation System** - Automatic validation with human-in-the-loop checkpoints
- **Microsoft Delta BG Export** - Generate CSV files for Bulgarian accounting software
- **Microsoft TRZ Export** - Generate XML files for financial data import
- **USB Transfer Ready** - Files validated for seamless cross-computer transfer
- **Edit & Correct** - Manual correction mode for extracted data

### ✨ Prompt Generator
- **Spark App Prompts** - Generate prompts for creating Spark visual applications
- **Bilingual Support** - Available in English and Bulgarian
- **Copy & Download** - Easy clipboard copy and markdown file export
- **Quick Links** - Direct access to Anthropic Console Workbench
- **Comprehensive Templates** - Detailed specifications for AI-powered apps

### 🎨 Professional UI/UX
- **Modern Design** - Tailwind CSS with custom components
- **Smooth Animations** - Framer Motion for fluid transitions
- **Responsive Layout** - Works on all screen sizes
- **Dark Theme** - Easy on the eyes with glassmorphism effects
- **Real-time Updates** - WebSocket for live data streaming

---

## 🚀 Installation

### Prerequisites

- **Node.js** 20.x or higher
- **npm** or **yarn**
- **Anthropic API Key** ([Get one here](https://console.anthropic.com))
- **Linux** (for Computer Use features)
  - `xdotool` installed: `sudo apt install xdotool`
- **Android SDK Platform Tools** (for Android control)
  - `adb` available in PATH

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Wallesters-org/Wallestars.git
   cd Wallestars
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Anthropic API key:
   ```env
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ENABLE_COMPUTER_USE=true
   ENABLE_ANDROID=true
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   ```
   http://localhost:5173
   ```

---

## 📖 Usage

### Dashboard
- View system metrics and activity logs
- Quick access to all features
- Real-time status indicators

### Claude Chat
1. Navigate to "Claude Chat"
2. Type your message in the input field
3. Press Enter or click Send
4. Receive intelligent responses from Claude Sonnet 4.5

### Computer Use (Linux)
1. Go to "Computer Use" page
2. Click "Start Stream" to view your desktop
3. Use AI Control to automate tasks
4. Or use Quick Actions for manual control

### Android Control
1. Connect your Android device via ADB
2. Navigate to "Android Control"
3. Select your device from the dropdown
4. Take screenshots to view device screen
5. Use Navigation controls or Quick Actions

### Smart Scan
1. Navigate to "Smart Scan"
2. Click "Upload Document" or drag & drop an image
3. Click "Classify Document" to identify the document type
4. Click "Extract Data" to extract structured information
5. Review validation results and edit if needed
6. Choose export format (Delta BG CSV or TRZ XML)
7. Click "Export & Download" to save the validated file

📚 **For detailed documentation, see [SMART_SCAN_DOCS.md](SMART_SCAN_DOCS.md)**

### Prompt Generator
1. Navigate to "Prompt Generator"
2. Choose your preferred language (English or Bulgarian)
3. Click "Copy to Clipboard" to copy the prompt
4. Visit [Anthropic Console Workbench](https://console.anthropic.com/workbench/)
5. Paste the prompt to generate your Spark app specification
6. Optionally download the prompt as a markdown file

📚 **For detailed documentation, see [PROMPT_GENERATOR_DOCS.md](PROMPT_GENERATOR_DOCS.md)**

---

## 🔌 MCP (Model Context Protocol)

Wallestars Control Center supports the **Model Context Protocol (MCP)**, enabling integration with Claude Desktop and other MCP-compatible AI clients. This allows Claude to directly access and control your computer through natural language commands.

### What is MCP?

MCP is an open protocol that standardizes how AI applications interact with local services and tools. With MCP support, you can:

- 🤖 **Use Claude Desktop** to control your computer naturally
- 🔗 **Connect AI assistants** to Wallestars capabilities
- 🛠️ **Extend Claude's abilities** with computer and Android control
- 🔒 **Maintain security** with controlled, permission-based access

### Quick MCP Setup

1. **Copy the example configuration:**
   ```bash
   cp claude_desktop_config.json.example ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

2. **Edit the configuration** with your API key and absolute path:
   ```json
   {
     "mcpServers": {
       "wallestars-control": {
         "command": "node",
         "args": ["/absolute/path/to/Wallestars/server/index.js"],
         "env": {
           "ANTHROPIC_API_KEY": "sk-ant-your-key-here",
           "ENABLE_COMPUTER_USE": "true"
         }
       }
     }
   }
   ```

3. **Restart Claude Desktop** and start using Wallestars!

📚 **For detailed setup instructions, see [MCP_SETUP.md](MCP_SETUP.md)**

---

## 🤖 Automation System

Wallestars includes a **comprehensive automation system** for PR management, CI/CD, and workflow orchestration:

### Features
- 🔄 **Automated PR Sessions** - Complete lifecycle management
- 🧪 **Continuous Testing** - Automated test execution
- 🔍 **Health Monitoring** - System and agent monitoring
- 🎯 **Auto-Merge** - Conditional automatic merging
- 📊 **Daily Reports** - Comprehensive metrics and health checks

### Quick Start
```bash
# Setup automation
./scripts/setup-automation.sh

# Manage workflows
./scripts/manage-workflows.sh list
```

### Documentation
- [Automation Status Dashboard](AUTOMATION_STATUS.md) - Live system status
- [Complete Automation Guide](COMPLETE_AUTOMATION_GUIDE.md) - Full documentation
- [Repository Consolidation Roadmap](REPOSITORY_CONSOLIDATION_ROADMAP.md) - Multi-repo strategy
- [Scripts Documentation](scripts/README.md) - Helper scripts

**New to automation?** Check out the [Automation Implementation Summary](AUTOMATION_IMPLEMENTATION_SUMMARY.md) for an overview.

---

## 🛠️ Development

### Scripts

```bash
npm run dev          # Start both server and client
npm run server       # Start backend only
npm run client       # Start frontend only
npm run build        # Build for production
npm start            # Start production server
```

### Workflow Management

```bash
./scripts/manage-workflows.sh list      # List workflows
./scripts/manage-workflows.sh validate  # Validate YAML
gh workflow run pr-session-management   # Trigger workflow
```

---

## 🚢 Deployment

### Netlify Deployment

The project is configured for easy deployment on Netlify:

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Wallesters-org/Wallestars)

📚 **For detailed Netlify deployment instructions, see [NETLIFY_DEPLOYMENT.md](NETLIFY_DEPLOYMENT.md)**

**Quick Deploy:** Click the button above for one-click deployment to Netlify.

#### Manual Deployment

1. **Fork or clone this repository**

2. **Connect to Netlify:**
   - Sign up or log in to [Netlify](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository

3. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - These are already configured in `netlify.toml`

4. **Set environment variables:**
   - Go to Site settings → Environment variables
   - Add the following environment variables:
     - `ANTHROPIC_API_KEY` = `your_api_key_here`
     - `NODE_ENV` = `production`

5. **Deploy:**
   - Click "Deploy site"
   - Your site will be live at `https://your-site-name.netlify.app`

#### Netlify CLI Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy to Netlify
netlify deploy --prod
```

**Note:** For full functionality including Computer Use and Android Control features, consider using a VPS or dedicated server deployment, as these features require system-level access that is not available on Netlify's serverless platform.

### Azure Web Apps Deployment

The project also includes GitHub Actions workflow for Azure Web Apps deployment.

### Custom Domain & DNS Configuration

If you're deploying with a custom domain or GitHub Pages:

📚 **For DNS configuration details, see [DNS_CONFIGURATION.md](DNS_CONFIGURATION.md)**

This guide includes:
- GitHub Pages TXT record verification
- Custom domain setup instructions
- VPS DNS configuration
- Verification and troubleshooting steps

---

## 🔒 Security

Security is a top priority for Wallestars Control Center. We follow industry best practices to protect your data and credentials.

### Security Documentation
- **[SECURITY.md](SECURITY.md)** - Security policy and vulnerability reporting
- **[SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md)** - Pre-deployment security checklist
- **[VPS_DEPLOYMENT.md](VPS_DEPLOYMENT.md)** - Secure deployment guide

### Quick Security Tips
- Never commit `.env` files or API keys
- Use `npm run validate-env` before deployment
- Rotate credentials if exposed
- Keep dependencies updated with `npm audit`

For security concerns, see our [Security Policy](SECURITY.md).

---

## 📄 License

MIT License

---

<div align="center">

**Built with ❤️ by Wallestars Team**

⭐ Star us on GitHub if you find this useful!

</div>