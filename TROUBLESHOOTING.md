# 🔧 Troubleshooting Guide

Common issues and solutions for Wallestars Control Center.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Launch Issues](#launch-issues)
- [API Key Issues](#api-key-issues)
- [Connection Issues](#connection-issues)
- [Feature-Specific Issues](#feature-specific-issues)

---

## Installation Issues

### npm install fails

**Symptoms:**
- Error during `npm install`
- Module download failures

**Solutions:**

1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check Node.js version:**
   ```bash
   node -v
   ```
   Ensure it's 20.x or higher. Update if needed from [nodejs.org](https://nodejs.org/)

3. **Check npm version:**
   ```bash
   npm -v
   ```
   Update npm: `npm install -g npm@latest`

4. **Try with sudo (Linux/Mac):**
   ```bash
   sudo npm install
   ```

5. **Network issues:**
   - Check your internet connection
   - Try using a different npm registry:
     ```bash
     npm config set registry https://registry.npmjs.org/
     ```

### Package vulnerabilities

**Symptoms:**
- Warning about `2 moderate severity vulnerabilities`
- `esbuild` and `vite` vulnerabilities

**Note:** These are development-only dependencies related to the dev server. They don't affect production builds.

**Optional fix** (may introduce breaking changes):
```bash
npm audit fix --force
```

---

## Launch Issues

### Port already in use

**Symptoms:**
- Error: `EADDRINUSE: address already in use`
- Port 3000 or 5173 already occupied

**Solutions:**

1. **Find and kill the process:**
   
   **Linux/Mac:**
   ```bash
   # Find process using port 3000
   lsof -i :3000
   kill -9 <PID>
   
   # Find process using port 5173
   lsof -i :5173
   kill -9 <PID>
   ```
   
   **Windows:**
   ```cmd
   # Find process
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

2. **Change the port in .env:**
   ```env
   PORT=3001
   ```
   
   Vite will automatically use the next available port (5174, 5175, etc.)

### Server starts but shows errors

**Symptoms:**
- Server runs but features don't work
- Console shows errors

**Check:**

1. **Review .env configuration:**
   ```bash
   cat .env
   ```

2. **Verify API key format:**
   - Should start with `sk-ant-`
   - No extra spaces or quotes
   - Complete key copied

3. **Check file permissions:**
   ```bash
   chmod 644 .env
   ```

### Client (Vite) won't start

**Symptoms:**
- Vite build errors
- Module not found errors

**Solutions:**

1. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules
   npm install
   ```

2. **Clear Vite cache:**
   ```bash
   rm -rf node_modules/.vite
   npm run client
   ```

---

## API Key Issues

### API key not working

**Symptoms:**
- ❌ Claude API shows as disabled
- Requests fail with authentication error

**Check:**

1. **Key format:**
   ```env
   # ✅ Correct
   ANTHROPIC_API_KEY=sk-ant-api03-xxx...
   
   # ❌ Wrong (has quotes)
   ANTHROPIC_API_KEY="sk-ant-api03-xxx..."
   
   # ❌ Wrong (has spaces)
   ANTHROPIC_API_KEY= sk-ant-api03-xxx...
   ```

2. **Key validity:**
   - Visit [console.anthropic.com](https://console.anthropic.com)
   - Check if key exists and is active
   - Generate new key if needed

3. **Environment loaded:**
   ```bash
   # Restart server after changing .env
   # Stop with Ctrl+C, then:
   npm run dev
   ```

### Where to get API key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign in or create account
3. Navigate to **API Keys** section
4. Click **Create Key**
5. Copy the key (starts with `sk-ant-`)
6. Paste in `.env` file

---

## Connection Issues

### Frontend can't connect to backend

**Symptoms:**
- Frontend loads but API calls fail
- CORS errors in browser console

**Check:**

1. **Both services running:**
   ```bash
   # Should show both processes
   ps aux | grep node
   ```

2. **Correct URLs:**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

3. **Check backend health:**
   ```bash
   curl http://localhost:3000/api/health
   ```
   
   Expected response:
   ```json
   {
     "status": "healthy",
     "services": {
       "claude": true,
       "computerUse": true,
       "android": false
     }
   }
   ```

### WebSocket connection failed

**Symptoms:**
- Real-time features not working
- WebSocket errors in console

**Solutions:**

1. **Check WebSocket port:**
   - Default is same as HTTP port (3000)
   - Verify in `.env`: `WS_PORT=3001` if needed

2. **Firewall blocking:**
   - Allow Node.js through firewall
   - Check security software settings

---

## Feature-Specific Issues

### Computer Use (Linux) not working

**Symptoms:**
- ❌ Computer Use shows disabled
- Screenshot capture fails

**Requirements:**
- Linux OS
- `xdotool` installed

**Install xdotool:**

```bash
# Debian/Ubuntu
sudo apt update
sudo apt install xdotool

# Fedora
sudo dnf install xdotool

# Arch
sudo pacman -S xdotool
```

**Enable in .env:**
```env
ENABLE_COMPUTER_USE=true
```

**Check X11 display:**
```bash
echo $DISPLAY
# Should show :0 or :1
```

### Android Control not working

**Symptoms:**
- ❌ Android Control disabled
- Can't detect devices

**Requirements:**
- Android SDK Platform Tools installed
- `adb` in PATH
- USB debugging enabled on device

**Install adb:**

**Linux:**
```bash
sudo apt install android-tools-adb
```

**Mac:**
```bash
brew install android-platform-tools
```

**Windows:**
- Download [SDK Platform Tools](https://developer.android.com/tools/releases/platform-tools)
- Add to PATH

**Check adb:**
```bash
adb version
adb devices
```

**Enable in .env:**
```env
ENABLE_ANDROID=true
```

**Device setup:**
1. Enable Developer Options on Android
2. Enable USB Debugging
3. Connect via USB
4. Accept debugging prompt on device
5. Run `adb devices` to verify

### Screenshots not displaying

**Symptoms:**
- Screenshots folder empty
- Images not loading in UI

**Check:**

1. **Permissions:**
   ```bash
   mkdir -p screenshots
   chmod 755 screenshots
   ```

2. **Disk space:**
   ```bash
   df -h
   ```

3. **screenshot-desktop module:**
   ```bash
   npm list screenshot-desktop
   ```

---

## General Debugging

### Enable verbose logging

Add to `.env`:
```env
DEBUG=*
NODE_ENV=development
```

### Check all services status

```bash
# Health endpoint
curl http://localhost:3000/api/health | json_pp

# Test Claude endpoint
curl -X POST http://localhost:3000/api/claude/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

### View server logs

Server outputs to console. Keep terminal open to see logs in real-time.

### Browser console

Open browser DevTools (F12):
- **Console tab**: Check for JavaScript errors
- **Network tab**: Monitor API requests
- **Application tab**: Check WebSocket connections

---

## Still Having Issues?

1. **Check existing issues:** [GitHub Issues](https://github.com/Wallesters-org/Wallestars/issues)
2. **Create new issue:** Include:
   - OS and version
   - Node.js version (`node -v`)
   - npm version (`npm -v`)
   - Error messages
   - Steps to reproduce
   - Relevant logs

3. **Review documentation:**
   - [LAUNCH_GUIDE.md](LAUNCH_GUIDE.md)
   - [README.md](README.md)
   - [MCP_SETUP.md](MCP_SETUP.md)
   - [QUICKSTART.md](QUICKSTART.md)

---

## Quick Fixes Checklist

- [ ] Node.js 20.x or higher installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file exists
- [ ] Valid API key in `.env`
- [ ] No port conflicts
- [ ] Firewall allows Node.js
- [ ] For Computer Use: `xdotool` installed (Linux)
- [ ] For Android: `adb` installed and device connected
- [ ] Server running on port 3000
- [ ] Client running on port 5173
- [ ] Health endpoint returns `{"status":"healthy"}`

---

**💡 Tip:** Run `./launch.sh` (Linux/Mac) or `launch.bat` (Windows) for automated setup!
