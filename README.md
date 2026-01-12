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

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [MCP Setup](#-mcp-model-context-protocol)

</div>

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

### 📱 Telegram Message Analysis
- **AI-Powered Classification** - Claude Sonnet 4.5 analyzes and categorizes messages
- **10 Categories** - GitHub content, project updates, URLs, contacts, and more
- **Priority Levels** - CRITICAL, HIGH, MEDIUM, LOW classifications
- **Data Extraction** - Automatic extraction of GitHub refs, action items, URLs, contacts
- **Multiple Formats** - Import/export JSON, CSV, Markdown
- **Statistical Reports** - Comprehensive analysis with visualizations
- **Batch Processing** - Handle large message sets efficiently

### 📧 Email Integration (Hostinger IMAP/SMTP)
- **Multi-Provider Support** - Gmail, Hostinger, AWS WorkMail
- **IMAP Support** - Fetch emails from any IMAP server
- **SMTP Sending** - Send emails via SMTP
- **Authentication Code Extraction** - Auto-extract verification codes from emails
- **Real-time Monitoring** - Wait for new auth codes (60s timeout)
- **Message Analysis** - Integrate with Telegram analysis system
- **n8n Workflow** - Automate email processing with workflows
- **33mail/WorkMail.pro** - Support for email alias forwarding
- **Multi-mailbox** - Access INBOX, Sent, and other folders
- **Secure Connection** - SSL/TLS encrypted connections
- **Export Capability** - Download emails as JSON
- **Click-to-Copy Codes** - Easy code extraction for automation

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

### Telegram Message Analysis
1. Navigate to "Telegram Analysis"
2. Upload messages (JSON, CSV, or TXT format)
3. Click "Analyze with Claude AI"
4. View results, statistics, and extracted insights
5. Export reports in JSON, CSV, or Markdown format

📚 **For detailed guide, see [TELEGRAM_ANALYSIS_README.md](TELEGRAM_ANALYSIS_README.md)**

### Email Integration
1. Navigate to "Email Integration"
2. Select provider (Gmail/Hostinger/AWS WorkMail)
3. Configure email credentials (use Gmail App Password for Gmail)
4. Click "Test Connection" to verify settings
5. **Extract Auth Codes** - Scan recent emails for verification codes
6. **Monitor for Codes** - Wait for new codes (60s timeout, perfect for automation)
7. Click any code to copy to clipboard
8. Use "Fetch for Analysis" to send emails to Telegram Analysis
9. Integrate with n8n workflows for automation

📚 **For detailed guide, see [EMAIL_INTEGRATION_DOCS.md](EMAIL_INTEGRATION_DOCS.md)**  
📚 **For auth code automation, see [AUTH_CODE_EXTRACTION_GUIDE.md](AUTH_CODE_EXTRACTION_GUIDE.md)**

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

## 🛠️ Development

### Scripts

```bash
npm run dev          # Start both server and client
npm run server       # Start backend only
npm run client       # Start frontend only
npm run build        # Build for production
npm start            # Start production server
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

---

## 📄 License

MIT License

---

<div align="center">

**Built with ❤️ by Wallestars Team**

⭐ Star us on GitHub if you find this useful!

</div>