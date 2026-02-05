# 🚀 Wallestars Control Center - Quick Start Guide

Get up and running with Wallestars in under 5 minutes! This guide provides comprehensive examples for all modules and features.

## 📋 Prerequisites Checklist

- [ ] **Node.js** 20.x or higher installed ([Download](https://nodejs.org/))
- [ ] **npm** 10.x or higher (comes with Node.js)
- [ ] **Anthropic API key** ([Get one](https://console.anthropic.com))
- [ ] **Linux**: `xdotool` installed (`sudo apt install xdotool`)
- [ ] **Android** (optional): `adb` in PATH ([Setup Guide](https://developer.android.com/tools/adb))
- [ ] **Claude Desktop** (optional, for MCP integration) ([Download](https://anthropic.com))

## 🎯 Quick Setup (3 Steps)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

```bash
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

### Step 3a: Standalone Mode (No Claude Desktop)

```bash
npm start
# Server runs at http://localhost:3000
```

### Step 3b: Claude Desktop Integration

**macOS/Linux:**
```bash
./setup-mcp.sh
# Restart Claude Desktop
```

**Windows:**
```powershell
.\setup-mcp.ps1
# Restart Claude Desktop
```

**Manual Setup:**
1. Open Claude Desktop config:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

2. Add this configuration:
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

3. Restart Claude Desktop

## Try It Out!

Ask Claude in Claude Desktop:
- "Take a screenshot of my desktop"
- "What's my system information?"
- "Click at coordinates 500, 300"
- "Type 'Hello World' on my computer"

---

## 📦 Module-by-Module Guide

### 🤖 Module 1: Claude Chat

The Claude Chat module provides an interactive interface for conversing with Claude Sonnet 4.5.

#### Using the Web Interface

1. **Navigate to Claude Chat**:
   - Click "Claude Chat" in the sidebar
   - You'll see the chat interface with session management

2. **Start a Conversation**:
   ```
   Type: "What can you help me with?"
   Press: Enter or click Send
   ```

3. **Save Sessions**:
   - Click "Save Session" button after chatting
   - Enter a title: "My First Chat"
   - Enter a description: "Testing Claude integration"
   - Click "Save Session"

4. **Load Previous Sessions**:
   - Click on any saved session in the sidebar
   - Continue the conversation from where you left off

#### Using the API

**Simple Chat Request:**
```bash
curl -X POST http://localhost:3000/api/claude/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explain quantum computing in simple terms"
  }'
```

**Chat with Conversation History:**
```bash
curl -X POST http://localhost:3000/api/claude/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What did I ask about before?",
    "conversationHistory": [
      {"role": "user", "content": "What is quantum computing?"},
      {"role": "assistant", "content": "Quantum computing is..."}
    ]
  }'
```

**Response Example:**
```json
{
  "success": true,
  "response": "Quantum computing uses quantum bits (qubits)...",
  "usage": {
    "input_tokens": 15,
    "output_tokens": 250
  },
  "conversationHistory": [...]
}
```

#### JavaScript Example

```javascript
// Chat with Claude
async function chatWithClaude(message, history = []) {
  const response = await fetch('http://localhost:3000/api/claude/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: message,
      conversationHistory: history
    })
  });
  
  const data = await response.json();
  return data;
}

// Usage
const result = await chatWithClaude("Tell me a joke");
console.log(result.response);
```

---

### 🖥️ Module 2: Computer Use (Linux Control)

Control your Linux desktop programmatically using xdotool and screenshot capabilities.

#### Prerequisites

```bash
# Install xdotool on Ubuntu/Debian
sudo apt update
sudo apt install xdotool

# Install xdotool on Fedora
sudo dnf install xdotool

# Install xdotool on Arch
sudo pacman -S xdotool

# Verify installation
which xdotool
xdotool --version
```

#### Screenshot Capture

**Take a Screenshot:**
```bash
curl http://localhost:3000/api/computer/screenshot > screenshot.json

# Extract base64 image (requires jq)
curl -s http://localhost:3000/api/computer/screenshot | \
  jq -r '.screenshot' | \
  base64 -d > screenshot.png
```

**JavaScript Example:**
```javascript
async function takeScreenshot() {
  const response = await fetch('http://localhost:3000/api/computer/screenshot');
  const data = await response.json();
  
  // Display in browser
  const img = document.createElement('img');
  img.src = `data:image/png;base64,${data.screenshot}`;
  document.body.appendChild(img);
  
  return data;
}
```

#### Mouse Control

**Click at Coordinates:**
```bash
# Left click at (500, 300)
curl -X POST http://localhost:3000/api/computer/click \
  -H "Content-Type: application/json" \
  -d '{"x": 500, "y": 300, "button": 1}'

# Right click at (800, 400)
curl -X POST http://localhost:3000/api/computer/click \
  -H "Content-Type: application/json" \
  -d '{"x": 800, "y": 400, "button": 3}'

# Middle click
curl -X POST http://localhost:3000/api/computer/click \
  -H "Content-Type: application/json" \
  -d '{"x": 600, "y": 350, "button": 2}'
```

**Mouse Movement:**
```bash
# Move mouse to position
curl -X POST http://localhost:3000/api/computer/mousemove \
  -H "Content-Type: application/json" \
  -d '{"x": 1000, "y": 500}'
```

#### Keyboard Control

**Type Text:**
```bash
# Type a string
curl -X POST http://localhost:3000/api/computer/type \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, Wallestars!"}'

# Type with special characters
curl -X POST http://localhost:3000/api/computer/type \
  -H "Content-Type: application/json" \
  -d '{"text": "user@example.com"}'
```

**Press Special Keys:**
```bash
# Press Enter
curl -X POST http://localhost:3000/api/computer/key \
  -H "Content-Type: application/json" \
  -d '{"key": "Return"}'

# Press Escape
curl -X POST http://localhost:3000/api/computer/key \
  -H "Content-Type: application/json" \
  -d '{"key": "Escape"}'

# Press Ctrl+C
curl -X POST http://localhost:3000/api/computer/key \
  -H "Content-Type: application/json" \
  -d '{"key": "ctrl+c"}'

# Arrow keys
curl -X POST http://localhost:3000/api/computer/key \
  -H "Content-Type: application/json" \
  -d '{"key": "Up"}'
```

**Common Key Codes:**
- `Return` - Enter key
- `Escape` - Esc key
- `Tab` - Tab key
- `BackSpace` - Backspace
- `Delete` - Delete key
- `Up`, `Down`, `Left`, `Right` - Arrow keys
- `Home`, `End`, `Page_Up`, `Page_Down` - Navigation
- `ctrl+c`, `ctrl+v`, `ctrl+x` - Keyboard shortcuts

#### System Information

```bash
# Get system info
curl http://localhost:3000/api/computer/info

# Example response:
{
  "success": true,
  "hostname": "my-laptop",
  "platform": "linux",
  "arch": "x64",
  "uptime": 123456,
  "memory": {
    "total": 16777216000,
    "free": 8388608000
  }
}
```

#### Automation Example

**Automated Workflow:**
```bash
#!/bin/bash
# Example: Open Firefox and navigate to a website

# 1. Take initial screenshot
curl http://localhost:3000/api/computer/screenshot > before.json

# 2. Press Super key (open application menu)
curl -X POST http://localhost:3000/api/computer/key \
  -H "Content-Type: application/json" \
  -d '{"key": "Super_L"}'

# 3. Wait a moment
sleep 1

# 4. Type "firefox"
curl -X POST http://localhost:3000/api/computer/type \
  -H "Content-Type: application/json" \
  -d '{"text": "firefox"}'

# 5. Press Enter
curl -X POST http://localhost:3000/api/computer/key \
  -H "Content-Type: application/json" \
  -d '{"key": "Return"}'

# 6. Wait for Firefox to open
sleep 3

# 7. Type URL in address bar
curl -X POST http://localhost:3000/api/computer/type \
  -H "Content-Type: application/json" \
  -d '{"text": "github.com"}'

# 8. Press Enter
curl -X POST http://localhost:3000/api/computer/key \
  -H "Content-Type: application/json" \
  -d '{"key": "Return"}'

# 9. Take final screenshot
sleep 2
curl http://localhost:3000/api/computer/screenshot > after.json
```

---

### 📱 Module 3: Android Control (ADB)

Control Android devices via Android Debug Bridge (ADB).

#### Prerequisites

1. **Install ADB:**

   **Ubuntu/Debian:**
   ```bash
   sudo apt update
   sudo apt install android-tools-adb
   ```

   **macOS:**
   ```bash
   brew install android-platform-tools
   ```

   **Windows:**
   - Download [Platform Tools](https://developer.android.com/tools/releases/platform-tools)
   - Extract and add to PATH

2. **Enable Developer Options on Android:**
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings → Developer Options
   - Enable "USB Debugging"

3. **Connect Device:**
   ```bash
   # Connect via USB and verify
   adb devices
   
   # You should see:
   # List of devices attached
   # ABC123456789    device
   ```

4. **Enable Android in Wallestars:**
   ```bash
   # Edit .env file
   echo "ENABLE_ANDROID=true" >> .env
   
   # Restart server
   npm run dev
   ```

#### List Devices

```bash
# List connected devices
curl http://localhost:3000/api/android/devices

# Response:
{
  "success": true,
  "devices": [
    {
      "id": "emulator-5554",
      "status": "device",
      "info": "product:sdk_gphone64_x86_64"
    }
  ],
  "count": 1
}
```

#### Screenshot Capture

```bash
# Take device screenshot
curl -X POST http://localhost:3000/api/android/screenshot \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "emulator-5554"}'

# Save screenshot to file
curl -X POST http://localhost:3000/api/android/screenshot \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "emulator-5554"}' | \
  jq -r '.screenshot' | \
  base64 -d > android_screen.png
```

#### Touch Control

**Tap at Coordinates:**
```bash
# Tap at position (500, 800)
curl -X POST http://localhost:3000/api/android/tap \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "emulator-5554",
    "x": 500,
    "y": 800
  }'
```

**Swipe Gestures:**
```bash
# Swipe up (scroll down)
curl -X POST http://localhost:3000/api/android/swipe \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "emulator-5554",
    "x1": 500,
    "y1": 1500,
    "x2": 500,
    "y2": 500,
    "duration": 300
  }'

# Swipe left (next screen)
curl -X POST http://localhost:3000/api/android/swipe \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "emulator-5554",
    "x1": 900,
    "y1": 800,
    "x2": 100,
    "y2": 800,
    "duration": 200
  }'
```

#### Text Input

```bash
# Type text on device
curl -X POST http://localhost:3000/api/android/type \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "emulator-5554",
    "text": "Hello from Wallestars"
  }'
```

#### Hardware Keys

```bash
# Press Home button
curl -X POST http://localhost:3000/api/android/key \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "emulator-5554",
    "key": "KEYCODE_HOME"
  }'

# Press Back button
curl -X POST http://localhost:3000/api/android/key \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "emulator-5554", "key": "KEYCODE_BACK"}'

# Press Power button
curl -X POST http://localhost:3000/api/android/key \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "emulator-5554", "key": "KEYCODE_POWER"}'

# Press Recent Apps
curl -X POST http://localhost:3000/api/android/key \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "emulator-5554", "key": "KEYCODE_APP_SWITCH"}'
```

**Common Key Codes:**
- `KEYCODE_HOME` - Home button
- `KEYCODE_BACK` - Back button
- `KEYCODE_POWER` - Power button
- `KEYCODE_APP_SWITCH` - Recent apps
- `KEYCODE_VOLUME_UP` - Volume up
- `KEYCODE_VOLUME_DOWN` - Volume down
- `KEYCODE_MENU` - Menu button
- `KEYCODE_CAMERA` - Camera button

#### Device Information

```bash
# Get device info
curl http://localhost:3000/api/android/info \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "emulator-5554"}'

# Response:
{
  "success": true,
  "model": "sdk_gphone64_x86_64",
  "androidVersion": "13",
  "sdkVersion": "33",
  "battery": "50",
  "screenResolution": "1080x2400"
}
```

#### App Management

```bash
# Install APK
curl -X POST http://localhost:3000/api/android/install \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "emulator-5554",
    "apkPath": "/path/to/app.apk"
  }'

# Launch app
curl -X POST http://localhost:3000/api/android/launch \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "emulator-5554",
    "package": "com.example.app"
  }'
```

#### Automation Example

**Automated Test Script:**
```bash
#!/bin/bash
DEVICE="emulator-5554"

# 1. Take screenshot
curl -X POST http://localhost:3000/api/android/screenshot \
  -H "Content-Type: application/json" \
  -d "{\"deviceId\": \"$DEVICE\"}" > screen1.json

# 2. Tap on search icon (coordinates may vary)
curl -X POST http://localhost:3000/api/android/tap \
  -H "Content-Type: application/json" \
  -d "{\"deviceId\": \"$DEVICE\", \"x\": 500, \"y\": 100}"

sleep 1

# 3. Type search query
curl -X POST http://localhost:3000/api/android/type \
  -H "Content-Type: application/json" \
  -d "{\"deviceId\": \"$DEVICE\", \"text\": \"Wallestars\"}"

# 4. Press Enter
curl -X POST http://localhost:3000/api/android/key \
  -H "Content-Type: application/json" \
  -d "{\"deviceId\": \"$DEVICE\", \"key\": \"KEYCODE_ENTER\"}"

sleep 2

# 5. Take final screenshot
curl -X POST http://localhost:3000/api/android/screenshot \
  -H "Content-Type: application/json" \
  -d "{\"deviceId\": \"$DEVICE\"}" > screen2.json
```

---

### ✨ Module 4: Prompt Generator

Generate comprehensive prompts for creating Spark visual applications.

#### Using the Web Interface

1. **Navigate to Prompt Generator**:
   - Click "Prompt Generator" in the sidebar
   - Choose your language (English or Bulgarian)

2. **Copy Prompt**:
   - Click "Copy to Clipboard" button
   - You'll see a success message
   - Paste into Anthropic Console Workbench

3. **Download Prompt**:
   - Click "Download as Markdown"
   - File is saved as `spark-app-prompt-en.md` or `spark-app-prompt-bg.md`

4. **Use with Anthropic Workbench**:
   - Click "Open Anthropic Workbench" link
   - Paste your copied prompt
   - Generate your Spark application

#### Prompt Features

The generated prompts include:
- **Multi-input Support**: URLs, files, sessions, GitHub issues
- **Visual Components**: Cards, charts, timelines, mind maps
- **Interactive Buttons**: Contextual decision-making options
- **State Management**: Progress tracking and completion status
- **Export Options**: JSON, Markdown, YAML, PDF, HTML
- **QR Code Generation**: Easy access to results

#### Example Use Cases

1. **Project Planning App**:
   - Input: Project requirements document
   - Output: Interactive decision tree for project phases

2. **Code Review App**:
   - Input: GitHub pull request URL
   - Output: Visual analysis with decision points

3. **Learning Path App**:
   - Input: Course syllabus
   - Output: Interactive learning roadmap with milestones

---

### 📊 Module 5: Dashboard

Monitor system metrics and manage quick actions.

#### Features

1. **System Metrics**:
   - Total Actions performed
   - Claude API requests count
   - System uptime
   - Success rate percentage

2. **Connected Platforms**:
   - View integrated services
   - Quick access links
   - Status indicators

3. **Microsoft 365 Integration**:
   - License usage overview
   - Application shortcuts
   - Setup steps tracker

4. **Quick Actions**:
   - One-click common tasks
   - Keyboard shortcuts
   - Custom action buttons

#### Navigation

```
Dashboard → View metrics and status
Claude Chat → Start conversations
Computer Use → Control desktop
Android Control → Manage devices
Prompt Generator → Create prompts
Settings → Configure application
```

---

### ⚙️ Module 6: Settings

Configure application behavior and preferences.

#### Environment Variables

Edit `.env` file to configure:

```env
# Required
ANTHROPIC_API_KEY=sk-ant-your-api-key-here

# Server Configuration
PORT=3000                    # HTTP server port
NODE_ENV=production          # Environment (development/production)

# Features
ENABLE_COMPUTER_USE=true     # Enable Linux control
ENABLE_ANDROID=false         # Enable Android control

# Performance
SCREENSHOT_INTERVAL=2000     # Screenshot interval (ms)

# Android ADB
ADB_HOST=localhost           # ADB server host
ADB_PORT=5037               # ADB server port

# WebSocket
WS_PORT=3001                # WebSocket port
```

#### Configuration via UI

1. Navigate to Settings page
2. Adjust preferences:
   - Theme settings
   - Feature toggles
   - Performance options
   - Default behaviors

3. Click "Save Settings"
4. Restart server if needed

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| `xdotool: command not found` | `sudo apt install xdotool` |
| API key error | Check `.env` or MCP config |
| Server won't start | Run `npm install` again |
| Claude can't connect | Verify absolute path in config |

---

## 📚 Environment Variables Quick Reference

### Required Variables

```env
# Get from https://console.anthropic.com
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### Optional Variables (with defaults)

```env
# Server Configuration
PORT=3000                    # HTTP server port
NODE_ENV=development         # development | production

# Feature Toggles
ENABLE_COMPUTER_USE=true     # Enable Linux desktop control
ENABLE_ANDROID=false         # Enable Android ADB control

# Performance Tuning
SCREENSHOT_INTERVAL=2000     # Milliseconds between screenshots

# Android Configuration
ADB_HOST=localhost           # ADB server hostname
ADB_PORT=5037               # ADB server port

# WebSocket Configuration
WS_PORT=3001                # WebSocket server port
```

---

## 📖 API Endpoints Quick Reference

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Claude AI
```bash
# Chat
curl -X POST http://localhost:3000/api/claude/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, Claude!"}'

# Computer Use (with screenshot)
curl -X POST http://localhost:3000/api/claude/computer-use \
  -H "Content-Type: application/json" \
  -d '{"task": "Click on Firefox icon", "screenshot": "base64..."}'
```

### Computer Control
```bash
# Screenshot
curl http://localhost:3000/api/computer/screenshot

# Click
curl -X POST http://localhost:3000/api/computer/click \
  -H "Content-Type: application/json" \
  -d '{"x": 500, "y": 300, "button": 1}'

# Type text
curl -X POST http://localhost:3000/api/computer/type \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, World!"}'

# Press key
curl -X POST http://localhost:3000/api/computer/key \
  -H "Content-Type: application/json" \
  -d '{"key": "Return"}'

# System info
curl http://localhost:3000/api/computer/info
```

### Android Control
```bash
# List devices
curl http://localhost:3000/api/android/devices

# Screenshot
curl -X POST http://localhost:3000/api/android/screenshot \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "emulator-5554"}'

# Tap
curl -X POST http://localhost:3000/api/android/tap \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "emulator-5554", "x": 500, "y": 800}'

# Swipe
curl -X POST http://localhost:3000/api/android/swipe \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "emulator-5554", "x1": 500, "y1": 1500, "x2": 500, "y2": 500, "duration": 300}'

# Type
curl -X POST http://localhost:3000/api/android/type \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "emulator-5554", "text": "Hello"}'

# Hardware key
curl -X POST http://localhost:3000/api/android/key \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "emulator-5554", "key": "KEYCODE_HOME"}'

# Device info
curl http://localhost:3000/api/android/info \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "emulator-5554"}'
```

---

## 📦 What's Included

- ✅ **`.mcp.json`** - Base MCP server configuration
- ✅ **`claude_desktop_config.json.example`** - Claude Desktop template
- ✅ **`MCP_SETUP.md`** - Detailed MCP integration guide
- ✅ **`setup-mcp.sh`** - Auto-setup script (Unix/macOS)
- ✅ **`setup-mcp.ps1`** - Auto-setup script (Windows)
- ✅ **`.env.example`** - Environment configuration template
- ✅ **`ARCHITECTURE.md`** - System architecture documentation
- ✅ **`TESTING_GUIDE.md`** - Comprehensive testing guide
- ✅ **`PROMPT_GENERATOR_DOCS.md`** - Prompt Generator documentation

---

## 🎓 Learning Resources

### Documentation
- 📚 [Full README](README.md) - Complete project overview
- 🏗️ [Architecture Guide](ARCHITECTURE.md) - System design and components
- 🔌 [MCP Setup Guide](MCP_SETUP.md) - Claude Desktop integration
- 🧪 [Testing Guide](TESTING_GUIDE.md) - Testing instructions in English & Bulgarian
- ✨ [Prompt Generator Docs](PROMPT_GENERATOR_DOCS.md) - Spark app generation

### External Resources
- 🤖 [Anthropic Documentation](https://docs.anthropic.com/) - Claude API docs
- 🔗 [Model Context Protocol](https://modelcontextprotocol.io/) - MCP specification
- 🛠️ [xdotool Manual](https://www.semicomplete.com/projects/xdotool/) - Linux automation
- 📱 [ADB Documentation](https://developer.android.com/tools/adb) - Android debugging

### Community
- 🐛 [GitHub Issues](https://github.com/Wallesters-org/Wallestars/issues) - Report bugs
- 💬 [Discussions](https://github.com/Wallesters-org/Wallestars/discussions) - Ask questions
- ⭐ [Star the Project](https://github.com/Wallesters-org/Wallestars) - Show support

---

## 🎯 Quick Start Checklist

Use this checklist to ensure everything is set up correctly:

- [ ] Node.js 20.x+ installed (`node --version`)
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created and configured
- [ ] Anthropic API key added to `.env`
- [ ] (Linux) xdotool installed (`which xdotool`)
- [ ] (Android) ADB installed (`which adb`)
- [ ] (Android) Device connected and authorized
- [ ] Server starts without errors (`npm run dev`)
- [ ] Frontend loads at `http://localhost:5173`
- [ ] API health check succeeds (`curl http://localhost:3000/api/health`)
- [ ] Can take screenshot (test Computer Use module)
- [ ] (Optional) Claude Desktop configured
- [ ] (Optional) MCP connection tested

---

## 💡 Pro Tips

1. **Use Environment Files**: Create `.env.development` and `.env.production` for different environments

2. **Monitor Logs**: Use `npm run dev | tee app.log` to save logs while developing

3. **Test API Endpoints**: Use tools like [Postman](https://postman.com) or [Insomnia](https://insomnia.rest) for testing

4. **Keyboard Shortcuts**: Learn common xdotool key names for faster automation

5. **ADB over WiFi**: Connect Android devices wirelessly:
   ```bash
   adb tcpip 5555
   adb connect <device-ip>:5555
   ```

6. **Session Persistence**: Save Claude chat sessions locally for future reference

7. **Batch Operations**: Chain multiple API calls in shell scripts for complex workflows

8. **Error Handling**: Always check API response `success` field before processing data

9. **Rate Limiting**: Respect Claude API rate limits to avoid throttling

10. **Security**: Never commit `.env` file or expose API keys in public repositories

---

## 🚀 Next Steps

1. **Explore the UI**: Navigate through all pages (Dashboard, Claude Chat, Computer Use, Android Control, Prompt Generator, Settings)

2. **Try the Modules**: Test each module with the examples provided in this guide

3. **Read the Docs**: Review the detailed documentation files for deeper understanding

4. **Integrate with Claude Desktop**: Set up MCP for seamless Claude Desktop integration

5. **Build Automation**: Create scripts combining multiple API calls for complex tasks

6. **Contribute**: Found a bug or have an idea? Open an issue or pull request!

---

**🌟 Happy automating with Wallestars!**

Built with ❤️ by the Wallestars Team
