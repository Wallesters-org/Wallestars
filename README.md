# Wallestars

This repository contains configuration and setup instructions for connecting Claude Code to a Hostinger VPS.

## Quick Start

### Option 1: Automated Setup (Recommended)

Run the setup script to automatically configure your connection:

```bash
./setup.sh
```

The script will:
- Copy the configuration template
- Prompt you for your Hostinger API key
- Create the properly configured `.claude-code.json` file

### Option 2: Manual Setup

Follow the detailed setup guide:

👉 **[Hostinger VPS Setup Guide](HOSTINGER_SETUP.md)**

## What's Included

- `setup.sh` - Automated setup script for quick configuration
- `.claude-code.template.json` - Configuration template for Claude Code with Hostinger MCP
- `HOSTINGER_SETUP.md` - Comprehensive setup instructions
- `SECURITY.md` - Important security notices and best practices
- `.gitignore` - Security configuration to prevent accidental API key commits

## Security First 🔒

This repository is configured with security best practices:
- API keys are never committed to version control
- Template files use placeholders
- Documentation emphasizes secure credential handling

## Need Help?

Refer to the [setup guide](HOSTINGER_SETUP.md) for detailed instructions, troubleshooting tips, and security best practices.
