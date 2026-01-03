#!/bin/bash

# 🔧 Wallestars Port Troubleshooting Script
# This script helps diagnose and fix port conflicts

echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║   🔍 Wallestars Port Diagnostics 🔍                  ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    local port=$1
    local name=$2
    
    echo -e "${BLUE}Checking $name (port $port)...${NC}"
    
    if lsof -i :$port > /dev/null 2>&1; then
        echo -e "${RED}❌ Port $port is IN USE${NC}"
        echo "   Process details:"
        lsof -i :$port
        echo ""
        return 1
    else
        echo -e "${GREEN}✅ Port $port is FREE${NC}"
        echo ""
        return 0
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    echo -e "${YELLOW}Attempting to free port $port...${NC}"
    
    PID=$(lsof -ti :$port)
    if [ ! -z "$PID" ]; then
        kill -9 $PID 2>/dev/null
        sleep 1
        
        if lsof -i :$port > /dev/null 2>&1; then
            echo -e "${RED}❌ Failed to free port $port${NC}"
            return 1
        else
            echo -e "${GREEN}✅ Port $port freed successfully${NC}"
            return 0
        fi
    else
        echo -e "${GREEN}✅ Port $port is already free${NC}"
        return 0
    fi
}

echo "═══════════════════════════════════════════════════════"
echo "📊 Step 1: Checking required ports..."
echo "═══════════════════════════════════════════════════════"
echo ""

# Check required ports
BACKEND_FREE=0
FRONTEND_FREE=0
WS_FREE=0

if check_port 3000 "Backend Server"; then
    BACKEND_FREE=1
fi

if check_port 5173 "Vite Frontend"; then
    FRONTEND_FREE=1
fi

if check_port 3001 "WebSocket"; then
    WS_FREE=1
fi

echo "═══════════════════════════════════════════════════════"
echo "📋 Step 2: Summary"
echo "═══════════════════════════════════════════════════════"
echo ""

if [ $BACKEND_FREE -eq 1 ] && [ $FRONTEND_FREE -eq 1 ]; then
    echo -e "${GREEN}✅ All ports are free! Ready to start.${NC}"
    echo ""
    echo "To start the application, run:"
    echo "  npm run dev"
    exit 0
else
    echo -e "${RED}❌ Some ports are in use.${NC}"
    echo ""
    
    read -p "Do you want to free the busy ports? (y/n): " answer
    
    if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
        echo ""
        echo "═══════════════════════════════════════════════════════"
        echo "🔧 Step 3: Freeing ports..."
        echo "═══════════════════════════════════════════════════════"
        echo ""
        
        if [ $BACKEND_FREE -eq 0 ]; then
            kill_port 3000
        fi
        
        if [ $FRONTEND_FREE -eq 0 ]; then
            kill_port 5173
        fi
        
        if [ $WS_FREE -eq 0 ]; then
            kill_port 3001
        fi
        
        echo ""
        echo "═══════════════════════════════════════════════════════"
        echo "✅ Done! Verifying..."
        echo "═══════════════════════════════════════════════════════"
        echo ""
        
        sleep 2
        
        # Verify again
        ALL_CLEAR=1
        if lsof -i :3000 > /dev/null 2>&1; then
            echo -e "${RED}❌ Port 3000 still in use${NC}"
            ALL_CLEAR=0
        fi
        
        if lsof -i :5173 > /dev/null 2>&1; then
            echo -e "${RED}❌ Port 5173 still in use${NC}"
            ALL_CLEAR=0
        fi
        
        if [ $ALL_CLEAR -eq 1 ]; then
            echo -e "${GREEN}✅ All ports are now free!${NC}"
            echo ""
            echo "To start the application, run:"
            echo "  npm run dev"
        else
            echo -e "${RED}❌ Some ports couldn't be freed.${NC}"
            echo ""
            echo "You can:"
            echo "1. Manually stop the processes shown above"
            echo "2. Change the ports in .env file:"
            echo "   PORT=3001  # Instead of 3000"
        fi
    else
        echo ""
        echo "Ports not cleared. You can:"
        echo "1. Stop the processes manually"
        echo "2. Change the ports in .env file"
    fi
    
    exit 1
fi
