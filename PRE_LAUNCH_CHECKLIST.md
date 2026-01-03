# ✅ Pre-Launch Checklist

Quick checklist to ensure everything is ready to launch Wallestars Control Center.

## 📋 System Requirements

- [ ] **Node.js 20.x or higher** installed
  ```bash
  node -v  # Should show v20.x or higher
  ```

- [ ] **npm** available
  ```bash
  npm -v  # Should show version number
  ```

- [ ] **Git** installed (for cloning)
  ```bash
  git --version
  ```

## 📦 Project Setup

- [ ] **Repository cloned**
  ```bash
  git clone https://github.com/Wallesters-org/Wallestars.git
  cd Wallestars
  ```

- [ ] **Dependencies installed**
  ```bash
  npm install
  # Should complete without errors
  ```

- [ ] **node_modules exists**
  ```bash
  ls node_modules  # Should list packages
  ```

## 🔑 Configuration

- [ ] **Environment file created**
  ```bash
  cp .env.example .env
  ```

- [ ] **.env file contains valid API key**
  ```bash
  # Edit .env and set:
  ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
  ```

- [ ] **API key format verified**
  - ✅ Starts with `sk-ant-`
  - ✅ No extra spaces
  - ✅ No quotes around the key
  - ✅ Complete key copied

- [ ] **Optional: Computer Use enabled**
  ```bash
  # In .env:
  ENABLE_COMPUTER_USE=true
  ```

- [ ] **Optional: Android Control configured**
  ```bash
  # In .env:
  ENABLE_ANDROID=true
  ```

## 🛠️ Optional Features

### Computer Use (Linux only)

- [ ] **Running on Linux**
- [ ] **xdotool installed**
  ```bash
  xdotool version
  # If not installed:
  sudo apt install xdotool
  ```
- [ ] **X11 display available**
  ```bash
  echo $DISPLAY  # Should show :0 or similar
  ```

### Android Control

- [ ] **ADB installed**
  ```bash
  adb version
  ```
- [ ] **Device connected**
  ```bash
  adb devices  # Should list your device
  ```
- [ ] **USB debugging enabled on device**

## 🚀 Launch Verification

- [ ] **Server starts without errors**
  ```bash
  npm run server
  # Should show "WALLESTARS CONTROL CENTER" banner
  # Check for ✅ next to Claude API
  ```

- [ ] **Client starts without errors**
  ```bash
  npm run client
  # Should show "VITE ready" message
  ```

- [ ] **Both services run together**
  ```bash
  npm run dev
  # Should start both server and client
  ```

- [ ] **Health endpoint responds**
  ```bash
  curl http://localhost:3000/api/health
  # Should return JSON with "status": "healthy"
  ```

- [ ] **Frontend accessible**
  - Open browser to http://localhost:5173
  - Dashboard loads correctly
  - No console errors in DevTools

## 🔍 Service Status

After starting with `npm run dev`, verify:

- [ ] **Claude API** - ✅ (if API key is valid)
- [ ] **Computer Use** - ✅ (if on Linux with xdotool)
- [ ] **Android Control** - ✅ (if adb configured)

## 🌐 Network Verification

- [ ] **Port 3000 available** (backend)
- [ ] **Port 5173 available** (frontend)
- [ ] **No firewall blocking Node.js**
- [ ] **No CORS errors in browser console**

## 📱 Feature Testing

### Basic Features
- [ ] Dashboard loads
- [ ] Navigation works
- [ ] No JavaScript errors

### Claude Chat (requires valid API key)
- [ ] Chat interface opens
- [ ] Can type messages
- [ ] Receives responses from Claude

### Computer Use (Linux + xdotool)
- [ ] Page loads
- [ ] Can start screen stream
- [ ] Screenshots display

### Android Control (requires adb)
- [ ] Page loads
- [ ] Devices listed
- [ ] Can take screenshots

### Prompt Generator
- [ ] Page loads
- [ ] Can switch languages
- [ ] Copy to clipboard works

## 🐛 Common Issues

If any checks fail, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for solutions.

### Quick Fixes

**Dependencies issue:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Port conflict:**
```bash
# Kill process on port 3000
lsof -i :3000  # Find PID
kill -9 <PID>
```

**API key not recognized:**
```bash
# Verify format in .env (no spaces, quotes)
cat .env | grep ANTHROPIC_API_KEY
```

**Environment not loaded:**
```bash
# Restart after .env changes
# Ctrl+C to stop, then:
npm run dev
```

## ✨ Ready to Launch!

Once all checkboxes are marked:

```bash
# Automated launch (recommended)
./launch.sh          # Linux/Mac
launch.bat           # Windows

# OR manual launch
npm run dev
```

Then open: **http://localhost:5173**

## 📚 Next Steps

After successful launch:

1. ✅ Test Claude chat functionality
2. ✅ Explore dashboard and metrics
3. ✅ Try Computer Use (if available)
4. ✅ Configure Android devices (if needed)
5. ✅ Generate Spark app prompts
6. ✅ Review [MCP_SETUP.md](MCP_SETUP.md) for Claude Desktop integration

---

**🎉 Enjoy Wallestars Control Center!**

For detailed help:
- 📖 [LAUNCH_GUIDE.md](LAUNCH_GUIDE.md) - Comprehensive setup
- 🔧 [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Problem solving
- 📘 [README.md](README.md) - Full documentation
