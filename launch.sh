#!/bin/bash

# Wallestars Launch Script
# This script automates the setup and launch process

set -e  # Exit on error

echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║   🌟 WALLESTARS CONTROL CENTER - LAUNCHER 🌟         ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Check Node.js
echo "🔍 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20.x or higher."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "⚠️  Node.js version is $NODE_VERSION. Version 20 or higher is recommended."
fi
echo "✅ Node.js $(node -v) detected"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi
echo "✅ npm $(npm -v) detected"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo ""
    echo "⚙️  Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env and add your Anthropic API key!"
    echo "   File location: $(pwd)/.env"
    echo "   Get your API key from: https://console.anthropic.com"
    echo ""
    read -p "Press Enter after you've added your API key, or Ctrl+C to exit..."
else
    echo "✅ .env file exists"
fi

# Check if API key is set
if grep -q "your_api_key_here" .env; then
    echo ""
    echo "⚠️  WARNING: API key not configured in .env file!"
    echo "   The server will start, but Claude features won't work."
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Please edit .env and add your API key, then run this script again."
        exit 0
    fi
fi

# Check optional dependencies
echo ""
echo "🔍 Checking optional features..."

if command -v xdotool &> /dev/null; then
    echo "✅ xdotool installed - Computer Use (Linux) available"
else
    echo "ℹ️  xdotool not found - Computer Use features disabled"
    echo "   Install with: sudo apt install xdotool"
fi

if command -v adb &> /dev/null; then
    echo "✅ adb installed - Android Control available"
else
    echo "ℹ️  adb not found - Android Control features disabled"
    echo "   Install Android SDK Platform Tools to enable"
fi

# Launch the application
echo ""
echo "🚀 Launching Wallestars Control Center..."
echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║   Frontend: http://localhost:5173                    ║"
echo "║   Backend:  http://localhost:3000                    ║"
echo "║   Health:   http://localhost:3000/api/health         ║"
echo "║                                                       ║"
echo "║   Press Ctrl+C to stop the servers                   ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Start the application
npm run dev
