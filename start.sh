#!/bin/bash

# 🚀 Wallestars Quick Start Script
# Автоматична настройка на Wallestars Control Center

echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║   🌟 Wallestars Control Center - Quick Start 🌟     ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo ""
    echo "Creating .env from .env.example..."
    
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ .env file created${NC}"
        echo ""
        echo -e "${YELLOW}📝 IMPORTANT:${NC}"
        echo "Please edit .env file and add your Anthropic API key:"
        echo ""
        echo "  nano .env"
        echo ""
        echo "Then add your key:"
        echo "  ANTHROPIC_API_KEY=sk-ant-your-key-here"
        echo ""
        read -p "Press Enter after you've updated the .env file..."
    else
        echo -e "${RED}❌ .env.example not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ .env file found${NC}"
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "📦 Checking dependencies..."
echo "═══════════════════════════════════════════════════════"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Installing dependencies...${NC}"
    npm install
    echo ""
fi

echo "═══════════════════════════════════════════════════════"
echo "🔍 Checking ports..."
echo "═══════════════════════════════════════════════════════"
echo ""

# Check ports
if lsof -i :3000 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 3000 is in use${NC}"
    echo "Run this command to free it:"
    echo "  ./check-ports.sh"
    echo ""
    read -p "Do you want to free port 3000 now? (y/n): " answer
    if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
        PID=$(lsof -ti :3000)
        kill -9 $PID 2>/dev/null
        echo -e "${GREEN}✅ Port 3000 freed${NC}"
    fi
fi

if lsof -i :5173 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 5173 is in use${NC}"
    echo "Run this command to free it:"
    echo "  ./check-ports.sh"
    echo ""
    read -p "Do you want to free port 5173 now? (y/n): " answer
    if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
        PID=$(lsof -ti :5173)
        kill -9 $PID 2>/dev/null
        echo -e "${GREEN}✅ Port 5173 freed${NC}"
    fi
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "🚀 Starting Wallestars Control Center..."
echo "═══════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}✅ All checks passed!${NC}"
echo ""
echo "Starting development server..."
echo ""
echo "Frontend will be available at: http://localhost:5173"
echo "Backend API will be at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
npm run dev
