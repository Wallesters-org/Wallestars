# 🔌 MCP (Model Context Protocol) Setup Guide

This guide explains how to configure Wallestars Control Center as an MCP server for use with Claude Desktop and other MCP-compatible clients.

## 📋 Table of Contents

- [What is MCP?](#what-is-mcp)
- [Prerequisites](#prerequisites)
- [Configuration for Claude Desktop](#configuration-for-claude-desktop)
- [Environment Variables](#environment-variables)
- [Capabilities](#capabilities)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)

## 🤔 What is MCP?

The Model Context Protocol (MCP) is an open protocol that standardizes how applications provide context to LLMs. It enables Claude Desktop and other AI assistants to securely connect to local services and tools on your computer.

Wallestars Control Center exposes powerful capabilities through its REST API that can be accessed by Claude:
- **Linux Computer Control** - Mouse, keyboard, screenshots
- **Android Device Control** - ADB integration for mobile automation
- **Claude AI Integration** - Direct access to Claude Sonnet 4.5
- **System Information** - Real-time system metrics

## 🔧 Prerequisites

Before configuring MCP, ensure you have:

1. **Node.js 20.x or higher** installed
2. **Wallestars dependencies** installed:
   ```bash
   npm install
   ```

3. **System dependencies** (for computer use):
   - Linux: `xdotool` - Install with `sudo apt install xdotool`
   - Android: `adb` (Android Debug Bridge) in your PATH

4. **Environment configured**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Claude Desktop** (optional, for Claude Desktop integration)
   - Download from [anthropic.com](https://www.anthropic.com)

## ⚙️ Configuration for Claude Desktop

### Option 1: Using the Included Configuration File

The repository includes a `.mcp.json` file with the recommended configuration. To use it with Claude Desktop:

1. **Locate your Claude Desktop config file:**
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. **Add Wallestars to your Claude Desktop configuration:**

   ```json
   {
     "mcpServers": {
       "wallestars-control": {
         "command": "node",
         "args": [
           "/absolute/path/to/Wallestars/server/index.js"
         ],
         "env": {
           "ANTHROPIC_API_KEY": "sk-ant-your-key-here",
           "PORT": "3000",
           "NODE_ENV": "production",
           "ENABLE_COMPUTER_USE": "true",
           "ENABLE_ANDROID": "false",
           "SCREENSHOT_INTERVAL": "2000",
           "ADB_HOST": "localhost",
           "ADB_PORT": "5037",
           "WS_PORT": "3001"
         }
       }
     }
   }
   ```

   **Important**: Replace `/absolute/path/to/Wallestars` with the actual absolute path to your Wallestars installation.

3. **Restart Claude Desktop** to load the new configuration

### Option 2: Standalone Server Mode

Instead of running via Claude Desktop, you can run Wallestars as a standalone HTTP server:

```bash
# Start the server
npm start

# Or in development mode
npm run dev
```

The server will be available at `http://localhost:3000` with the following endpoints:
- `/api/health` - Health check
- `/api/claude/chat` - Claude chat interface
- `/api/computer/*` - Computer control endpoints
- `/api/android/*` - Android control endpoints

## 🌍 Environment Variables

Configure these in your `.env` file or in the MCP configuration:

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key | `sk-ant-api03-...` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `ENABLE_COMPUTER_USE` | Enable Linux computer control | `true` |
| `ENABLE_ANDROID` | Enable Android device control | `false` |
| `SCREENSHOT_INTERVAL` | Screenshot refresh rate (ms) | `2000` |
| `ADB_HOST` | ADB server host | `localhost` |
| `ADB_PORT` | ADB server port | `5037` |
| `WS_PORT` | WebSocket port | `3001` |
| `FRONTEND_URL` | Frontend URL (production) | - |

### Getting an Anthropic API Key

1. Sign up at [console.anthropic.com](https://console.anthropic.com)
2. Navigate to API Keys section
3. Create a new API key
4. Copy the key (starts with `sk-ant-`)

⚠️ **Security Warning**: Never commit your API key to version control!

## 🚀 Capabilities

Once configured, Wallestars provides these capabilities to Claude:

### 1. Linux Computer Control (when `ENABLE_COMPUTER_USE=true`)

- **Take screenshots** - Capture current desktop state
- **Mouse control** - Click, move, drag
- **Keyboard input** - Type text, press keys
- **System information** - Hostname, uptime, memory usage
- **Safe command execution** - Whitelisted shell commands

### 2. Android Device Control (when `ENABLE_ANDROID=true`)

- **Device detection** - List connected ADB devices
- **Screenshots** - Capture device screen
- **Touch simulation** - Tap, swipe, gestures
- **Text input** - Type on device keyboard
- **Navigation** - Home, Back, Power, Menu buttons
- **APK installation** - Install applications
- **Device info** - Model, Android version, battery level

### 3. Claude AI Integration

- **Chat interface** - Conversation with Claude Sonnet 4.5
- **Computer Use API** - Vision-based desktop automation
- **Multi-modal** - Text and image understanding

## 💡 Usage Examples

### Example 1: Basic Chat with Claude (via HTTP)

```bash
curl -X POST http://localhost:3000/api/claude/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, Claude! Can you help me automate my desktop?",
    "conversationHistory": []
  }'
```

### Example 2: Take a Screenshot (Linux)

```bash
curl http://localhost:3000/api/computer/screenshot
```

### Example 3: Control Android Device

```bash
# List devices
curl http://localhost:3000/api/android/devices

# Take screenshot
curl -X POST http://localhost:3000/api/android/screenshot \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "your-device-id"}'

# Tap on screen
curl -X POST http://localhost:3000/api/android/tap \
  -H "Content-Type: application/json" \
  -d '{"x": 500, "y": 800, "deviceId": "your-device-id"}'
```

### Example 4: Using with Claude Desktop

Once configured, you can ask Claude in the Claude Desktop app:

- "Take a screenshot of my desktop"
- "Click at coordinates 500, 300"
- "Type 'Hello World' on my computer"
- "What Android devices are connected?"
- "Open the app menu on my Android phone"

## 🔍 Troubleshooting

### Server won't start

**Issue**: `Error: ANTHROPIC_API_KEY not found`
**Solution**: Ensure your `.env` file has a valid API key or set it in the MCP configuration

### Computer control not working

**Issue**: `xdotool: command not found`
**Solution**: Install xdotool:
```bash
sudo apt install xdotool  # Debian/Ubuntu
sudo yum install xdotool  # RHEL/CentOS
```

### Android control not working

**Issue**: `adb: command not found`
**Solution**: Install Android SDK Platform Tools:
```bash
# Ubuntu/Debian
sudo apt install android-tools-adb

# Or download from: https://developer.android.com/studio/releases/platform-tools
```

**Issue**: No devices found
**Solution**: 
1. Enable USB debugging on your Android device
2. Connect via USB and authorize the computer
3. Run `adb devices` to verify connection

### Claude Desktop doesn't see Wallestars

**Issue**: Wallestars not appearing in Claude Desktop
**Solution**:
1. Verify the path in `claude_desktop_config.json` is absolute, not relative
2. Check that Node.js is in your PATH
3. Restart Claude Desktop completely
4. Check Claude Desktop logs for errors

### Permission denied errors

**Issue**: Cannot take screenshots or control mouse
**Solution**: Ensure proper X11 display permissions. You may need to run:
```bash
xhost +local:
```

## 🛡️ Security Considerations

1. **API Key Protection**: Never expose your Anthropic API key in code or version control
2. **Command Whitelisting**: Shell command execution is limited to safe commands only
3. **Local Only**: The server should only be accessible from localhost (127.0.0.1)
4. **ADB Security**: Only connect trusted Android devices
5. **Production Use**: Set `NODE_ENV=production` for production deployments

## 📚 Additional Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [Claude API Documentation](https://docs.anthropic.com)
- [Anthropic Computer Use Guide](https://docs.anthropic.com/computer-use)
- [Wallestars Repository](https://github.com/Wallesters-org/Wallestars)

## 🤝 Support

If you encounter issues:
1. Check the [Troubleshooting](#troubleshooting) section above
2. Review server logs for error messages
3. Open an issue on the [GitHub repository](https://github.com/Wallesters-org/Wallestars/issues)

---

**Built with ❤️ by Wallestars Team**
