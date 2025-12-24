# GitHub Codespaces Quick Start Guide

Welcome to Wallestars in GitHub Codespaces! This guide will help you get started quickly.

## 🚀 Quick Setup

This repository is configured to work seamlessly with GitHub Codespaces. When you open this repository in a Codespace, everything is pre-configured and ready to go.

### Step 1: Run the Setup

Simply run the setup script:

```bash
./setup.sh
```

### Step 2: Choose Your Setup Method

The script will detect that you're in Codespaces and offer two options:

1. **Web Interface (Recommended)** - A user-friendly web form
2. **Command Line** - Traditional terminal-based setup

### Step 3: Configure Your API Token

**If using Web Interface:**
- Press `Y` or `Enter` when prompted
- The web server will start automatically
- Look for the forwarded port notification or check the "PORTS" panel
- Open the URL (usually `https://<your-codespace>-8000.app.github.dev`)
- Fill in your Hostinger API token
- Click "Save Configuration"

**If using Command Line:**
- Press `N` when prompted
- Follow the terminal prompts
- Enter your Hostinger API token when requested

### Step 4: Start Using Claude Code

Once configured:
1. Open Claude Code in your Codespace
2. The configuration will be automatically detected from `.claude-code.json`
3. You can now manage your Hostinger VPS through Claude Code

## 📋 What's Pre-Configured

The `.devcontainer/devcontainer.json` file provides:

- **Node.js 20** - For running the Hostinger MCP server
- **Python 3.11** - For the web setup interface
- **Port Forwarding** - Ports 8000 and 3000 are automatically forwarded
- **Post-Create Setup** - Makes scripts executable automatically

## 🔧 Manual Web Server Start

If you want to start the web interface manually at any time:

```bash
python3 web-setup.py
```

Then check your Ports panel for port 8000 and click the globe icon to open it.

## 🛡️ Security Notes

- Your API token is stored locally in `.claude-code.json`
- This file is in `.gitignore` and will never be committed
- Your token stays private within your Codespace
- Each Codespace has its own isolated configuration

## 📚 Additional Resources

- [Full Setup Guide](HOSTINGER_SETUP.md)
- [Security Best Practices](SECURITY.md)
- [Main README](README.md)

## 🆘 Troubleshooting

### Web interface not opening?
1. Check the "PORTS" panel in VS Code (usually at the bottom)
2. Find port 8000
3. Click the globe icon to open it in your browser
4. Make sure the port visibility is set to "Public"

### Configuration not working?
1. Verify your API token is correct
2. Check that `.claude-code.json` was created
3. Restart Claude Code if it's already running

### Need to reconfigure?
Simply run `./setup.sh` again and choose to overwrite the existing configuration.

---

Happy coding! 🌟
