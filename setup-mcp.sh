#!/bin/bash

# Wallestars MCP Setup Script
# This script helps configure Wallestars for use with Claude Desktop

set -e

echo "🌟 Wallestars MCP Configuration Setup"
echo "======================================"
echo ""

# Detect OS
OS="unknown"
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
    CLAUDE_CONFIG_DIR="$HOME/Library/Application Support/Claude"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
    CLAUDE_CONFIG_DIR="$HOME/.config/Claude"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    OS="windows"
    CLAUDE_CONFIG_DIR="$APPDATA/Claude"
fi

echo "Detected OS: $OS"
echo ""

# Get current directory
WALLESTARS_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "Wallestars path: $WALLESTARS_PATH"
echo ""

# Check if Claude Desktop config directory exists
if [ ! -d "$CLAUDE_CONFIG_DIR" ]; then
    echo "⚠️  Claude Desktop config directory not found at: $CLAUDE_CONFIG_DIR"
    echo "   Claude Desktop may not be installed or this is a custom installation."
    echo ""
    read -p "Would you like to create the directory? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        mkdir -p "$CLAUDE_CONFIG_DIR"
        echo "✅ Created directory: $CLAUDE_CONFIG_DIR"
    else
        echo "❌ Setup cancelled. Please install Claude Desktop first."
        exit 1
    fi
fi

CONFIG_FILE="$CLAUDE_CONFIG_DIR/claude_desktop_config.json"

# Check if config file exists
if [ -f "$CONFIG_FILE" ]; then
    echo "⚠️  Existing Claude Desktop config found at:"
    echo "   $CONFIG_FILE"
    echo ""
    read -p "Would you like to create a backup before modifying? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        BACKUP_FILE="${CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
        cp "$CONFIG_FILE" "$BACKUP_FILE"
        echo "✅ Backup created at: $BACKUP_FILE"
        echo ""
    fi
fi

# Get API key from user
echo "Enter your Anthropic API Key (or press Enter to use environment variable):"
read -r API_KEY

if [ -z "$API_KEY" ]; then
    if [ -f "$WALLESTARS_PATH/.env" ]; then
        # Extract value after first '=' and remove surrounding quotes
        API_KEY=$(grep "^ANTHROPIC_API_KEY=" "$WALLESTARS_PATH/.env" | cut -d '=' -f2- | sed 's/^["'"'"']//' | sed 's/["'"'"']$//')
        echo "✅ Using API key from .env file"
    else
        echo "⚠️  No API key provided and .env file not found"
        API_KEY="sk-ant-your-api-key-here"
    fi
fi

# Ask about computer use
echo ""
read -p "Enable Computer Use (Linux desktop control)? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ENABLE_COMPUTER_USE="true"
else
    ENABLE_COMPUTER_USE="false"
fi

# Ask about Android
echo ""
read -p "Enable Android Control? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ENABLE_ANDROID="true"
else
    ENABLE_ANDROID="false"
fi

# Create the configuration
echo ""
echo "Creating Claude Desktop configuration..."

# Check if existing config has other servers
if [ -f "$CONFIG_FILE" ]; then
    # Parse existing config and add our server
    # For simplicity, we'll create a new config and warn the user
    echo "⚠️  Note: This will replace your existing configuration."
    echo "   If you have other MCP servers configured, you'll need to manually merge them."
    echo ""
fi

cat > "$CONFIG_FILE" << EOF
{
  "mcpServers": {
    "wallestars-control": {
      "command": "node",
      "args": [
        "$WALLESTARS_PATH/server/index.js"
      ],
      "env": {
        "ANTHROPIC_API_KEY": "$API_KEY",
        "PORT": "3000",
        "NODE_ENV": "production",
        "ENABLE_COMPUTER_USE": "$ENABLE_COMPUTER_USE",
        "ENABLE_ANDROID": "$ENABLE_ANDROID",
        "SCREENSHOT_INTERVAL": "2000",
        "ADB_HOST": "localhost",
        "ADB_PORT": "5037",
        "WS_PORT": "3001"
      }
    }
  }
}
EOF

echo "✅ Configuration created successfully!"
echo ""
echo "📝 Configuration file: $CONFIG_FILE"
echo ""
echo "Next steps:"
echo "1. Restart Claude Desktop to load the new configuration"
echo "2. Try asking Claude: 'Take a screenshot of my desktop'"
echo "3. For more details, see MCP_SETUP.md"
echo ""
echo "🎉 Setup complete!"
