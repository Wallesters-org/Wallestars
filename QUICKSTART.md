# 🚀 Wallestars MCP Quick Start

Get up and running with Wallestars Model Context Protocol integration in under 5 minutes!

## Prerequisites Checklist

- [ ] Node.js 20.x or higher installed
- [ ] Anthropic API key ([Get one](https://console.anthropic.com/settings/keys))
- [ ] Claude Desktop installed (optional, for MCP integration)
- [ ] Linux: `xdotool` installed (`sudo apt install xdotool`)
- [ ] Android: `adb` in PATH (if using Android control)

## Quick Setup (3 Steps)

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

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `xdotool: command not found` | `sudo apt install xdotool` |
| API key error | Check `.env` or MCP config |
| Server won't start | Run `npm install` again |
| Claude can't connect | Verify absolute path in config |

## Environment Variables Quick Reference

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Optional (with defaults)
PORT=3000
ENABLE_COMPUTER_USE=true
ENABLE_ANDROID=false
SCREENSHOT_INTERVAL=2000
```

## API Endpoints (Standalone Mode)

```bash
# Health check
curl http://localhost:3000/api/health

# Chat with Claude
curl -X POST http://localhost:3000/api/claude/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!"}'

# Take screenshot
curl http://localhost:3000/api/computer/screenshot

# List Android devices
curl http://localhost:3000/api/android/devices
```

## What's Included

- ✅ `.mcp.json` - Base MCP configuration
- ✅ `claude_desktop_config.json.example` - Claude Desktop template
- ✅ `MCP_SETUP.md` - Detailed setup documentation
- ✅ `setup-mcp.sh` - Auto-setup script (Unix/macOS)
- ✅ `setup-mcp.ps1` - Auto-setup script (Windows)
- ✅ `.env.example` - Environment template

## Need More Help?

📚 **Full Documentation**: [MCP_SETUP.md](MCP_SETUP.md)  
🐛 **Issues**: [GitHub Issues](https://github.com/Wallesters-org/Wallestars/issues)  
📖 **README**: [README.md](README.md)

---

**🌟 Happy automating with Wallestars!**
