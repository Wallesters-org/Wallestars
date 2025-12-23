#!/bin/bash
# Quick Setup Script for Hostinger VPS Connection
# This script helps you set up the Claude Code configuration safely

set -e

echo "=================================================="
echo "  Hostinger VPS Connection Setup"
echo "=================================================="
echo ""

# Check if .claude-code.json already exists
if [ -f ".claude-code.json" ]; then
    echo "⚠️  Warning: .claude-code.json already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
fi

# Copy the template
echo "📋 Copying template file..."
cp .claude-code.template.json .claude-code.json
echo "✅ Template copied to .claude-code.json"
echo ""

# Prompt for API key
echo "🔑 Please enter your Hostinger API key:"
echo "   (It will be saved to .claude-code.json)"
read -sp "API Key: " api_key
echo ""

if [ -z "$api_key" ]; then
    echo "❌ Error: API key cannot be empty"
    rm .claude-code.json
    exit 1
fi

# Replace the placeholder with actual API key
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/YOUR_HOSTINGER_API_KEY_HERE/$api_key/" .claude-code.json
else
    # Linux
    sed -i "s/YOUR_HOSTINGER_API_KEY_HERE/$api_key/" .claude-code.json
fi

echo ""
echo "=================================================="
echo "✅ Setup Complete!"
echo "=================================================="
echo ""
echo "Your configuration has been saved to: .claude-code.json"
echo ""
echo "⚠️  SECURITY REMINDER:"
echo "   - This file is in .gitignore and won't be committed"
echo "   - Never share this file or commit it to version control"
echo "   - Keep your API key secure"
echo ""
echo "Next steps:"
echo "  1. Open Claude Code"
echo "  2. The configuration will be automatically detected"
echo "  3. You can now manage your Hostinger VPS through Claude Code"
echo ""
echo "For more information, see HOSTINGER_SETUP.md"
echo "=================================================="
