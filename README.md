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

### Hostinger VPS Deployment

Deploy Wallestars to a Hostinger VPS with one command:

```bash
wget -O - https://raw.githubusercontent.com/Wallesters-org/Wallestars/main/deploy-vps.sh | bash
```

Or manually:

```bash
git clone https://github.com/Wallesters-org/Wallestars.git
cd Wallestars
chmod +x deploy-vps.sh
./deploy-vps.sh
```

The script will:
- ✅ Install Node.js 20.x and dependencies
- ✅ Build and configure Wallestars
- ✅ Setup PM2 process manager
- ✅ Optionally install n8n automation
- ✅ Configure firewall and Nginx
- ✅ Setup SSL with Let's Encrypt

**📚 Full Guide**: [DEPLOYMENT_HOSTINGER.md](DEPLOYMENT_HOSTINGER.md)  
**⚡ Quick Start**: [QUICKSTART_VPS.md](QUICKSTART_VPS.md)

### Docker Deployment

```bash
# Using Docker Compose
docker-compose up -d

# This will start:
# - Wallestars Control Center (port 3000)
# - n8n Automation Platform (port 5678)
# - Optional: Nginx reverse proxy (ports 80/443)
```

### Azure Web Apps

The project includes GitHub Actions workflow for Azure Web Apps deployment.

---

## 🔗 n8n Workflow Automation

Integrate Wallestars with **n8n** to create powerful automation workflows:

- 🤖 **Automate Claude AI** - Schedule AI interactions
- 📸 **Scheduled Screenshots** - Capture desktop periodically
- 🔄 **Multi-Service Integration** - Connect with 100+ apps
- 📊 **Build Dashboards** - Monitor system metrics
- ⚡ **Event-Driven Actions** - React to external triggers

### Quick n8n Setup

1. **Install n8n**:
   ```bash
   npm install -g n8n
   pm2 start n8n --name "n8n"
   ```

2. **Access n8n**: Open `http://localhost:5678`

3. **Create Workflow**: Add HTTP Request node to Wallestars API
   - URL: `http://localhost:3000/api/computer/screenshot`
   - Method: GET

4. **Use Claude Console**: Connect to [https://console.anthropic.com/claude-code](https://console.anthropic.com/claude-code)

**📚 Complete Guide**: [N8N_INTEGRATION.md](N8N_INTEGRATION.md)

### Example n8n Workflows

- **Screenshot Bot**: Capture desktop every hour → Save to Google Drive
- **Claude Webhook**: Expose Claude AI via webhook for external apps
- **System Monitor**: Check system health → Alert via Slack/Email
- **Automation Chain**: Click → Type → Wait → Verify with AI

---

## 📄 License

MIT License

---

<div align="center">

**Built with ❤️ by Wallestars Team**

⭐ Star us on GitHub if you find this useful!

</div>