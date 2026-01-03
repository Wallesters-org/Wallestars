# 🚀 Wallestars - Complete Startup Instructions

**Дата:** 2026-01-03  
**Версия:** 1.0.0  
**За:** Developers, DevOps, End Users

---

## 📋 Съдържание

1. [Quick Start (5 минути)](#quick-start-5-минути)
2. [Detailed Setup](#detailed-setup)
3. [Different Startup Modes](#different-startup-modes)
4. [Environment Configuration](#environment-configuration)
5. [Troubleshooting Startup](#troubleshooting-startup)
6. [Verification Steps](#verification-steps)

---

## ⚡ Quick Start (5 минути)

### За Linux/macOS

```bash
# 1. Clone repository
git clone https://github.com/Wallesters-org/Wallestars.git
cd Wallestars

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
nano .env  # Add your ANTHROPIC_API_KEY

# 4. Start application
npm run dev

# ✅ Done! Open http://localhost:5173
```

### За Windows

```powershell
# 1. Clone repository
git clone https://github.com/Wallesters-org/Wallestars.git
cd Wallestars

# 2. Install dependencies
npm install

# 3. Configure environment
copy .env.example .env
notepad .env  # Add your ANTHROPIC_API_KEY

# 4. Start application
npm run dev

# ✅ Done! Open http://localhost:5173
```

---

## 📖 Detailed Setup

### Prerequisites Check

**Преди да започнете, проверете:**

```bash
# Check Node.js version (need 20.x or higher)
node --version

# Check npm version (need 9.x or higher)
npm --version

# Check git
git --version
```

**Ако нямате Node.js 20.x:**

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# macOS (with Homebrew)
brew install node@20

# Windows
# Download from https://nodejs.org/
```

### Step-by-Step Installation

#### Стъпка 1: Clone Repository

```bash
# Clone from GitHub
git clone https://github.com/Wallesters-org/Wallestars.git

# Navigate to directory
cd Wallestars

# Check current branch
git branch

# Should show: * copilot/fix-errors-and-documentation or main
```

#### Стъпка 2: Install Dependencies

```bash
# Install all dependencies (frontend + backend)
npm install

# This will install:
# - Express.js, Socket.IO (backend)
# - React, Vite, Tailwind CSS (frontend)
# - Anthropic SDK, axios, etc.
#
# Expected output:
# added 298 packages in ~16s
```

**Note:** You may see some warnings about deprecated packages - това е нормално.

#### Стъпка 3: System Dependencies (Optional)

**За Linux Desktop Control:**
```bash
# Ubuntu/Debian
sudo apt install xdotool

# Fedora/RHEL
sudo yum install xdotool

# Arch Linux
sudo pacman -S xdotool
```

**За Android Control:**
```bash
# Ubuntu/Debian
sudo apt install android-tools-adb

# macOS
brew install android-platform-tools

# Windows
# Download Platform Tools from:
# https://developer.android.com/studio/releases/platform-tools
```

#### Стъпка 4: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit with your favorite editor
nano .env
# or
vim .env
# or
code .env  # VS Code
```

**Минимална конфигурация (.env):**
```bash
# REQUIRED - Get from https://console.anthropic.com
ANTHROPIC_API_KEY=sk-ant-your-key-here

# OPTIONAL - Usually defaults are fine
PORT=3000
NODE_ENV=development
ENABLE_COMPUTER_USE=true
ENABLE_ANDROID=false
```

**Как да получите Anthropic API Key:**
1. Отидете на https://console.anthropic.com
2. Sign up или Log in
3. Navigate to API Keys section
4. Create new API key
5. Copy ключа (започва с `sk-ant-`)
6. Paste в `.env` file

#### Стъпка 5: Verify Configuration

```bash
# Check that .env exists and has API key
cat .env | grep ANTHROPIC_API_KEY

# Should output something like:
# ANTHROPIC_API_KEY=sk-ant-api03-...

# Make sure there are NO spaces around =
# ✅ Correct: ANTHROPIC_API_KEY=sk-ant-...
# ❌ Wrong:   ANTHROPIC_API_KEY = sk-ant-...
```

---

## 🎮 Different Startup Modes

### Mode 1: Development Mode (Recommended for Development)

**Какво прави:**
- Стартира backend (Express) на порт 3000
- Стартира frontend (Vite) на порт 5173
- Hot reload за frontend промени
- Auto-restart backend при промени (nodemon)

**Команда:**
```bash
npm run dev
```

**Expected output:**
```
> concurrently "npm run server" "npm run client"

[0] [nodemon] starting `node server/index.js`
[0] 
[0] ╔═══════════════════════════════════════════════════════╗
[0] ║   🌟 WALLESTARS CONTROL CENTER 🌟                    ║
[0] ║   Server running on: http://localhost:3000           ║
[0] ╚═══════════════════════════════════════════════════════╝
[1] 
[1] VITE v5.0.11  ready in 432 ms
[1] ➜  Local:   http://localhost:5173/
```

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api/health
- WebSocket: ws://localhost:3000

**When to use:**
- 👨‍💻 Developing new features
- 🐛 Debugging issues
- 🎨 Working on UI/UX
- 🧪 Testing changes locally

### Mode 2: Production Build + Start

**Какво прави:**
- Build на frontend за production (minified, optimized)
- Стартира само backend сървър
- Сървър служи static files от /dist
- Готово за production deployment

**Команди:**
```bash
# Build frontend
npm run build

# Start production server
npm start
```

**Expected output:**
```bash
# Build output:
✓ built in 3.41s
dist/index.html                   0.62 kB
dist/assets/index-*.css          24.33 kB
dist/assets/index-*.js          354.50 kB

# Server output:
╔═══════════════════════════════════════════════════════╗
║   🌟 WALLESTARS CONTROL CENTER 🌟                    ║
║   Server running on: http://localhost:3000           ║
╚═══════════════════════════════════════════════════════╝
```

**Access:**
- Everything: http://localhost:3000

**When to use:**
- 🚀 Production deployment
- 📦 Building for distribution
- 🔒 Secure production environment
- 🌐 Serving from single port

### Mode 3: Backend Only

**Команда:**
```bash
npm run server
```

**When to use:**
- 🔧 Testing API endpoints
- 🤖 Using with external frontend
- 🧪 API integration testing
- 📡 Using as headless server

### Mode 4: Frontend Only

**Команда:**
```bash
npm run client
```

**When to use:**
- 🎨 UI development without backend
- 🖼️ Working on static components
- 🎭 Mock API data testing

### Mode 5: Claude Desktop Integration (MCP Mode)

**Setup:**
```bash
# Run setup script
./setup-mcp.sh  # Unix/Linux/macOS
# or
.\setup-mcp.ps1  # Windows

# Restart Claude Desktop
```

**Какво прави:**
- Claude Desktop automatically стартира Wallestars
- Server runs when Claude Desktop е активен
- Интегрира се като MCP tool provider

**When to use:**
- 🤖 Using Claude Desktop as main interface
- 🎯 AI-powered computer automation
- 🔗 Integration with Claude workflows

---

## ⚙️ Environment Configuration

### Complete .env Reference

```bash
# ============================================
# REQUIRED CONFIGURATION
# ============================================

# Anthropic Claude API Key
# Get from: https://console.anthropic.com/account/keys
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# ============================================
# SERVER CONFIGURATION
# ============================================

# Server port (default: 3000)
PORT=3000

# Environment mode: development, production, test
NODE_ENV=development

# ============================================
# FEATURE FLAGS
# ============================================

# Enable Linux desktop control (requires xdotool)
# Options: true, false
ENABLE_COMPUTER_USE=true

# Enable Android device control (requires adb)
# Options: true, false
ENABLE_ANDROID=false

# ============================================
# PERFORMANCE SETTINGS
# ============================================

# Screenshot capture interval in milliseconds
# Higher = less CPU usage, lower = more responsive
SCREENSHOT_INTERVAL=2000

# ============================================
# ANDROID ADB CONFIGURATION
# ============================================

# ADB server host
ADB_HOST=localhost

# ADB server port
ADB_PORT=5037

# ============================================
# WEBSOCKET CONFIGURATION
# ============================================

# WebSocket server port (usually same as PORT)
WS_PORT=3001

# ============================================
# PRODUCTION ONLY
# ============================================

# Frontend URL for CORS in production
# Example: https://wallestars.yourdomain.com
FRONTEND_URL=

# ============================================
# ADVANCED (OPTIONAL)
# ============================================

# Custom screenshot tool command (advanced)
# SCREENSHOT_COMMAND=scrot

# Maximum screenshot resolution (width x height)
# SCREENSHOT_MAX_WIDTH=1920
# SCREENSHOT_MAX_HEIGHT=1080

# Enable verbose logging
# DEBUG=wallestars:*
```

### Configuration Examples

**Example 1: Local Development (Full Features)**
```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
PORT=3000
NODE_ENV=development
ENABLE_COMPUTER_USE=true
ENABLE_ANDROID=true
SCREENSHOT_INTERVAL=2000
```

**Example 2: Production Server (No GUI)**
```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
PORT=3000
NODE_ENV=production
ENABLE_COMPUTER_USE=false
ENABLE_ANDROID=false
FRONTEND_URL=https://wallestars.example.com
```

**Example 3: API Only (Headless)**
```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
PORT=3000
NODE_ENV=production
ENABLE_COMPUTER_USE=false
ENABLE_ANDROID=false
```

**Example 4: Development with Android**
```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
PORT=3000
NODE_ENV=development
ENABLE_COMPUTER_USE=false
ENABLE_ANDROID=true
ADB_HOST=localhost
ADB_PORT=5037
```

---

## 🔍 Troubleshooting Startup

### Issue 1: "Cannot find module"

**Error:**
```
Error: Cannot find module '@anthropic-ai/sdk'
```

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue 2: "ANTHROPIC_API_KEY not found"

**Error:**
```
Error: ANTHROPIC_API_KEY environment variable is required
```

**Solution:**
```bash
# Make sure .env file exists
ls -la .env

# If not, copy from example
cp .env.example .env

# Edit and add your API key
nano .env
```

### Issue 3: Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Find what's using port 3000
lsof -i :3000
# or
netstat -tulpn | grep :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### Issue 4: "xdotool: command not found"

**Error:**
```
Error: Command failed: xdotool
```

**Solution:**
```bash
# Install xdotool
sudo apt install xdotool

# Or disable computer use feature
# Edit .env:
ENABLE_COMPUTER_USE=false
```

### Issue 5: Permission Denied

**Error:**
```
EACCES: permission denied, open '/path/to/Wallestars/.env'
```

**Solution:**
```bash
# Fix file permissions
chmod 644 .env

# Fix directory permissions
chmod 755 .
```

### Issue 6: Build Fails

**Error:**
```
Error: Build failed
```

**Solution:**
```bash
# Check Node.js version
node --version  # Must be 20.x or higher

# Clear cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try build again
npm run build
```

### Issue 7: "Cannot connect to backend"

**Error in Browser Console:**
```
Failed to fetch http://localhost:3000/api/health
```

**Solution:**
```bash
# Make sure backend is running
curl http://localhost:3000/api/health

# If not, start backend
npm run server

# Check if both are running
ps aux | grep node
```

### Issue 8: WebSocket Connection Failed

**Error in Browser Console:**
```
WebSocket connection to 'ws://localhost:3000' failed
```

**Solution:**
```bash
# Check if server supports WebSocket
curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  http://localhost:3000/socket.io/

# Restart server
npm run dev
```

---

## ✅ Verification Steps

### После успешен startup, проверете:

#### 1. Health Check

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2026-01-03T12:00:00.000Z",
  "services": {
    "claude": true,
    "computerUse": true,
    "android": false
  }
}
```

#### 2. Frontend Access

```bash
# Open in browser
open http://localhost:5173  # macOS
xdg-open http://localhost:5173  # Linux
start http://localhost:5173  # Windows

# You should see:
# - Wallestars Control Center homepage
# - Navigation menu
# - Dashboard with metrics
```

#### 3. Claude API Connection

```bash
# Test Claude chat endpoint
curl -X POST http://localhost:3000/api/claude/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, Claude!",
    "conversationHistory": []
  }'

# Expected: Response from Claude (не error)
```

#### 4. Computer Use Features (if enabled)

```bash
# Test screenshot
curl http://localhost:3000/api/computer/screenshot

# Expected: JSON with base64 screenshot data
```

#### 5. WebSocket Connection

**In browser console (F12):**
```javascript
// Test WebSocket connection
const socket = io('http://localhost:3000');
socket.on('connect', () => {
  console.log('✅ WebSocket connected');
});
```

#### 6. Check Logs

```bash
# Backend logs should show:
# ✅ Server running on: http://localhost:3000
# ✅ Claude API: enabled
# ✅ Computer Use: enabled

# No errors should be visible
```

---

## 🎯 Quick Command Reference

```bash
# Installation
npm install                   # Install dependencies
npm audit fix                 # Fix vulnerabilities

# Development
npm run dev                   # Start dev mode (frontend + backend)
npm run server                # Start backend only
npm run client                # Start frontend only

# Production
npm run build                 # Build for production
npm start                     # Start production server
npm run preview               # Preview production build

# Testing
npm test                      # Run tests
curl http://localhost:3000/api/health  # Health check

# Maintenance
npm update                    # Update dependencies
npm outdated                  # Check outdated packages
npm audit                     # Security audit

# Cleanup
rm -rf node_modules           # Remove dependencies
rm -rf dist                   # Remove build files
npm cache clean --force       # Clear npm cache
```

---

## 📊 Startup Checklist

### Pre-Startup
- [ ] Node.js 20.x installed
- [ ] npm 9.x+ installed
- [ ] Git installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created and configured
- [ ] Anthropic API key added to `.env`
- [ ] System dependencies installed (xdotool, adb if needed)

### During Startup
- [ ] No error messages in terminal
- [ ] Backend starts on port 3000
- [ ] Frontend starts on port 5173 (dev mode)
- [ ] Services status shows all green ✅

### Post-Startup
- [ ] Frontend loads in browser
- [ ] Health endpoint responds: `curl http://localhost:3000/api/health`
- [ ] No console errors in browser (F12)
- [ ] WebSocket connects successfully
- [ ] Navigation between pages works
- [ ] Claude chat responds to messages

### Optional Features
- [ ] Screenshot capture works (if enabled)
- [ ] Mouse/keyboard control works (if enabled)
- [ ] Android devices detected (if enabled)
- [ ] MCP integration with Claude Desktop (if configured)

---

## 🚀 Next Steps After Startup

1. **Explore the UI**
   - Navigate to Dashboard
   - Try Claude Chat
   - Test Computer Use features
   - Experiment with Android Control

2. **Read Documentation**
   - [README.md](./README.md) - Overview
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical details
   - [MCP_SETUP.md](./MCP_SETUP.md) - Claude Desktop integration
   - [PLATFORM_STATUS.md](./PLATFORM_STATUS.md) - Complete status

3. **Configure for Your Use Case**
   - Customize `.env` settings
   - Configure features you need
   - Disable features you don't use

4. **Deploy (if needed)**
   - [VPS_DEPLOYMENT.md](./VPS_DEPLOYMENT.md) - VPS deployment guide
   - [CONTAINER_SETUP.md](./CONTAINER_SETUP.md) - Docker deployment

5. **Automate (advanced)**
   - [AUTOMATION_GUIDE.md](./AUTOMATION_GUIDE.md) - Automation scripts
   - Setup monitoring and alerts
   - Configure backups

---

## 🆘 Getting Help

### If you're stuck:

1. **Check logs:**
   ```bash
   # Backend logs
   npm run server

   # Build errors
   npm run build
   ```

2. **Verify configuration:**
   ```bash
   cat .env | grep ANTHROPIC_API_KEY
   ```

3. **Test connectivity:**
   ```bash
   curl http://localhost:3000/api/health
   ```

4. **Review documentation:**
   - README.md
   - TROUBLESHOOTING section in this file
   - GitHub Issues

5. **Common solutions:**
   - Restart: `Ctrl+C` then `npm run dev`
   - Reinstall: `rm -rf node_modules && npm install`
   - Check ports: `lsof -i :3000`
   - Update Node.js: Use version 20.x+

---

## 💡 Tips for Success

1. **Always use Node.js 20.x+** - Други versions може да имат compatibility issues
2. **Keep .env secure** - Never commit to git
3. **Start with dev mode** - Easier to debug
4. **Check health endpoint** - First thing after startup
5. **Monitor logs** - They tell you everything
6. **Use production build for deployment** - Not dev mode
7. **Enable only features you need** - Better performance

---

## 🎉 Success!

Ако всичко работи:
- ✅ Frontend loads на http://localhost:5173
- ✅ Backend responds на http://localhost:3000/api/health
- ✅ No errors в console или terminal
- ✅ Можете да chat с Claude
- ✅ Features работят както се очаква

**Congratulations! Wallestars е успешно стартиран! 🌟**

---

*Този guide е част от Wallestars Platform Documentation Suite*
