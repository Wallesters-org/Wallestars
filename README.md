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
- **Claude Sonnet 4.5** - Latest AI model (claude-sonnet-4-5-20250929) with advanced reasoning
- **Chat Interface** - Beautiful conversational UI with session management
- **Conversation History** - Maintain context across multiple messages
- **Session Management** - Save, load, and organize chat sessions with titles and descriptions
- **Computer Use API** - AI-powered desktop automation with vision capabilities
- **Vision Capabilities** - Screenshot analysis and intelligent action planning
- **Streaming Responses** - Real-time AI responses with token usage tracking
- **REST API Endpoints** - `/api/claude/chat` and `/api/claude/computer-use`

### 🖥️ Linux Computer Use
- **Screen Streaming** - Real-time desktop visualization with configurable intervals
- **Screenshot Capture** - High-quality PNG screenshots via `screenshot-desktop`
- **Mouse Control** - Precise click, drag, and movement via `xdotool`
  - Left, right, and middle button clicks
  - Coordinate-based positioning
  - Drag operations
- **Keyboard Input** - Type text and simulate key presses
  - Text input with special character support
  - Individual key events (Enter, Escape, Arrow keys, etc.)
  - Keyboard shortcuts
- **System Information** - Monitor hostname, OS version, uptime, memory, CPU
- **Safe Command Execution** - Whitelisted shell commands for system control
- **API Endpoints** - `/api/computer/screenshot`, `/api/computer/click`, `/api/computer/type`, `/api/computer/key`, `/api/computer/info`, `/api/computer/execute`

### 📱 Android Control (ADB)
- **ADB Integration** - Full Android Debug Bridge support
- **Device Management** - List, select, and manage multiple connected devices
- **Screenshot Capture** - Real-time device screen capture with base64 encoding
- **Touch Simulation** - Precise tap and swipe gestures
  - Coordinate-based taps
  - Swipe gestures with customizable paths
- **Text Input** - Type on device keyboard via ADB
- **Navigation Controls** - Home, Back, Power, Recent Apps buttons
- **Device Information** - Model name, Android version, battery level, screen resolution
- **App Management** - Install APK files, launch apps, manage packages
- **API Endpoints** - `/api/android/devices`, `/api/android/screenshot`, `/api/android/tap`, `/api/android/swipe`, `/api/android/type`, `/api/android/key`, `/api/android/info`, `/api/android/install`

### ✨ Prompt Generator
- **Spark App Prompts** - Generate comprehensive prompts for Spark visual applications
- **Bilingual Support** - Full interface in English and Bulgarian
  - Language toggle with instant switching
  - Culturally appropriate translations
- **Template System** - Detailed specifications for AI-powered decision-making apps
  - Multi-input type support (URLs, files, sessions, issues)
  - Visual presentation components (cards, charts, timelines, mind maps)
  - Interactive decision-making buttons
  - State management and progress tracking
- **Copy & Download** - One-click clipboard copy and markdown file export
  - Visual feedback with success animations
  - Automatic filename generation
- **Quick Links** - Direct access to Anthropic Console Workbench
- **Usage Instructions** - Built-in step-by-step guide

### 📊 Dashboard & Monitoring
- **System Metrics** - Real-time statistics display
  - Total actions counter
  - Claude API requests tracking
  - System uptime monitoring
  - Success rate calculation
- **Platform Integration** - Quick access to connected services
  - Microsoft 365 integration showcase
  - License management overview
  - Application quick links
- **Activity Logs** - Real-time event tracking and visualization
- **Quick Actions** - One-click shortcuts for common tasks
- **Status Indicators** - Live connection status for services

### ⚙️ Settings & Configuration
- **Environment Variables** - Comprehensive configuration management
  - API key configuration
  - Server port settings
  - Feature toggles (Computer Use, Android)
  - Performance tuning (screenshot intervals)
- **Theme Customization** - Dark mode with glassmorphism effects
- **System Preferences** - Customize behavior and defaults

### 🔌 MCP (Model Context Protocol) Server
- **Claude Desktop Integration** - First-class MCP server support
- **Tool Exposure** - All Wallestars capabilities accessible via MCP
- **JSON-RPC Protocol** - Standard MCP communication over stdio
- **Environment Configuration** - Flexible setup via Claude Desktop config
- **Automatic Lifecycle** - Starts/stops with Claude Desktop
- **Security** - Localhost-only binding, controlled access

### 🌐 Real-time Communication
- **Socket.io Integration** - WebSocket-based real-time updates
- **Live Streaming** - Desktop screen streaming at configurable intervals
- **Event Broadcasting** - System events pushed to connected clients
- **Connection Management** - Automatic reconnection and status tracking
- **Multi-client Support** - Multiple browsers can connect simultaneously

### 🎨 Professional UI/UX
- **Modern Design** - Tailwind CSS 3.4 with custom components
- **Smooth Animations** - Framer Motion 11.0 for fluid transitions
  - Page transitions
  - Hover effects
  - Loading states
  - Success/error feedback
- **Responsive Layout** - Optimized for all screen sizes (mobile, tablet, desktop)
- **Dark Theme** - Eye-friendly dark mode with glassmorphism effects
- **Accessibility** - Keyboard navigation and screen reader support
- **Icon System** - Lucide React icons throughout
- **Sidebar Navigation** - Collapsible menu with active page indicators

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

## 🔧 API Reference

Wallestars provides a comprehensive REST API for programmatic access to all features.

### Base URL
```
http://localhost:3000/api
```

### Claude AI Endpoints

#### POST `/claude/chat`
Chat with Claude Sonnet 4.5 model.

**Request Body:**
```json
{
  "message": "Hello, Claude!",
  "conversationHistory": []
}
```

**Response:**
```json
{
  "success": true,
  "response": "Hello! How can I help you?",
  "usage": {
    "input_tokens": 10,
    "output_tokens": 15
  },
  "conversationHistory": [...]
}
```

#### POST `/claude/computer-use`
Use Claude's Computer Use API for desktop automation.

**Request Body:**
```json
{
  "task": "Click on the Firefox icon",
  "screenshot": "base64_encoded_image"
}
```

### Computer Control Endpoints

#### GET `/computer/screenshot`
Capture a screenshot of the desktop.

**Response:**
```json
{
  "success": true,
  "screenshot": "base64_encoded_png",
  "timestamp": "2024-01-03T12:00:00.000Z"
}
```

#### POST `/computer/click`
Simulate a mouse click at specific coordinates.

**Request Body:**
```json
{
  "x": 500,
  "y": 300,
  "button": 1
}
```

#### POST `/computer/type`
Type text using the keyboard.

**Request Body:**
```json
{
  "text": "Hello, World!"
}
```

#### POST `/computer/key`
Press a specific keyboard key.

**Request Body:**
```json
{
  "key": "Return"
}
```

#### GET `/computer/info`
Get system information.

**Response:**
```json
{
  "success": true,
  "hostname": "my-computer",
  "platform": "linux",
  "uptime": 123456,
  "memory": {...}
}
```

#### POST `/computer/execute`
Execute a whitelisted shell command.

**Request Body:**
```json
{
  "command": "ls -la"
}
```

### Android Control Endpoints

#### GET `/android/devices`
List connected Android devices.

**Response:**
```json
{
  "success": true,
  "devices": [
    {
      "id": "emulator-5554",
      "status": "device",
      "info": "..."
    }
  ],
  "count": 1
}
```

#### POST `/android/screenshot`
Capture Android device screenshot.

**Request Body:**
```json
{
  "deviceId": "emulator-5554"
}
```

#### POST `/android/tap`
Simulate a tap on the device screen.

**Request Body:**
```json
{
  "deviceId": "emulator-5554",
  "x": 500,
  "y": 300
}
```

#### POST `/android/swipe`
Simulate a swipe gesture.

**Request Body:**
```json
{
  "deviceId": "emulator-5554",
  "x1": 500,
  "y1": 800,
  "x2": 500,
  "y2": 200,
  "duration": 300
}
```

#### POST `/android/type`
Type text on the device.

**Request Body:**
```json
{
  "deviceId": "emulator-5554",
  "text": "Hello"
}
```

#### POST `/android/key`
Press a hardware key (KEYCODE_HOME, KEYCODE_BACK, etc.).

**Request Body:**
```json
{
  "deviceId": "emulator-5554",
  "key": "KEYCODE_HOME"
}
```

#### GET `/android/info`
Get device information.

**Request Body:**
```json
{
  "deviceId": "emulator-5554"
}
```

#### POST `/android/install`
Install an APK on the device.

**Request Body:**
```json
{
  "deviceId": "emulator-5554",
  "apkPath": "/path/to/app.apk"
}
```

### Health Check

#### GET `/health`
Check server health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-03T12:00:00.000Z"
}
```

### cURL Examples

```bash
# Chat with Claude
curl -X POST http://localhost:3000/api/claude/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is 2+2?"}'

# Take screenshot
curl http://localhost:3000/api/computer/screenshot

# Click at coordinates
curl -X POST http://localhost:3000/api/computer/click \
  -H "Content-Type: application/json" \
  -d '{"x": 500, "y": 300, "button": 1}'

# List Android devices
curl http://localhost:3000/api/android/devices

# Tap on Android screen
curl -X POST http://localhost:3000/api/android/tap \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "emulator-5554", "x": 500, "y": 300}'
```

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