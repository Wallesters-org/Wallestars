# 🪟 WSL (Windows Subsystem for Linux) Setup Guide

This guide explains how to run Wallestars Control Center on Windows using Windows Subsystem for Linux (WSL), providing a native Linux environment on Windows for optimal compatibility.

## 📋 Table of Contents

- [Why WSL?](#why-wsl)
- [Prerequisites](#prerequisites)
- [WSL Installation](#wsl-installation)
- [WSL Configuration](#wsl-configuration)
- [Wallestars Installation on WSL](#wallestars-installation-on-wsl)
- [GUI Applications in WSL](#gui-applications-in-wsl)
- [File System Best Practices](#file-system-best-practices)
- [MCP Integration with Claude Desktop](#mcp-integration-with-claude-desktop)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

## 🤔 Why WSL?

Wallestars Control Center is designed for Linux environments and uses native Linux tools like `xdotool` for desktop automation. WSL provides several advantages for Windows users:

- **Native Linux Environment** - Run Linux binaries natively on Windows
- **File System Integration** - Access Windows files from WSL and vice versa
- **GPU Acceleration** - WSLg provides GPU support for GUI applications
- **Network Integration** - Seamless networking between Windows and WSL
- **Performance** - Near-native Linux performance on Windows
- **No Dual Boot** - Run Linux and Windows applications side by side

## 🔧 Prerequisites

- **Windows 10 version 2004+** (Build 19041+) or **Windows 11**
- **Administrator privileges** on Windows
- **Virtualization enabled** in BIOS/UEFI
- **At least 4GB RAM** (8GB+ recommended)
- **10GB+ free disk space**

## 🚀 WSL Installation

### Option 1: Quick Install (Recommended)

Open **PowerShell** or **Windows Terminal** as Administrator and run:

```powershell
wsl --install
```

This command will:
- Enable WSL feature
- Install WSL 2
- Install Ubuntu (default distribution)
- Set WSL 2 as default version

**Restart your computer** when prompted.

### Option 2: Manual Install

If the quick install doesn't work, follow these steps:

1. **Enable WSL Feature:**
   ```powershell
   dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
   ```

2. **Enable Virtual Machine Platform:**
   ```powershell
   dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
   ```

3. **Restart your computer**

4. **Download and install WSL2 Linux kernel update:**
   - Visit: https://aka.ms/wsl2kernel
   - Download and run the update package

5. **Set WSL 2 as default:**
   ```powershell
   wsl --set-default-version 2
   ```

6. **Install Ubuntu from Microsoft Store:**
   - Open Microsoft Store
   - Search for "Ubuntu 22.04 LTS" or "Ubuntu"
   - Click "Get" or "Install"

### Verify Installation

```powershell
wsl --list --verbose
```

You should see Ubuntu running with VERSION 2.

## ⚙️ WSL Configuration

### Create .wslconfig (Optional but Recommended)

Create a file at `C:\Users\<YourUsername>\.wslconfig` to optimize WSL performance:

```ini
[wsl2]
# Limits VM memory to 4GB (adjust based on your system)
memory=4GB

# Sets the VM to use 2 processors (adjust based on your CPU)
processors=2

# Enable swap space
swap=2GB

# Disable page reporting (can improve performance)
pageReporting=false

# Enable nested virtualization (for Docker, etc.)
nestedVirtualization=true

# Enable GUI app support (WSLg)
guiApplications=true
```

After creating/editing `.wslconfig`, restart WSL:

```powershell
wsl --shutdown
wsl
```

### Enable systemd (Ubuntu 22.04+)

Edit `/etc/wsl.conf` in your WSL distribution:

```bash
sudo nano /etc/wsl.conf
```

Add:

```ini
[boot]
systemd=true

[network]
generateResolvConf=true

[interop]
enabled=true
appendWindowsPath=true
```

Restart WSL:

```powershell
wsl --shutdown
wsl
```

## 📦 Wallestars Installation on WSL

### 1. Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Node.js 20.x

```bash
# Install Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x
npm --version
```

### 3. Install Required Dependencies

```bash
# For Computer Use features
sudo apt install -y xdotool x11-utils

# For Android Control (optional)
sudo apt install -y android-tools-adb

# For screenshots
sudo apt install -y scrot imagemagick

# Build tools
sudo apt install -y build-essential git
```

### 4. Clone Wallestars Repository

**Important:** Clone to WSL filesystem, not Windows mount (`/mnt/c/`)

```bash
# Clone to WSL home directory (RECOMMENDED)
cd ~
git clone https://github.com/Wallesters-org/Wallestars.git
cd Wallestars

# Or use a specific directory
mkdir -p ~/projects
cd ~/projects
git clone https://github.com/Wallesters-org/Wallestars.git
cd Wallestars
```

### 5. Install Dependencies

```bash
npm install
```

### 6. Configure Environment

```bash
cp .env.example .env
nano .env
```

Set your configuration:

```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
ENABLE_COMPUTER_USE=true
ENABLE_ANDROID=false
PORT=3000
```

### 7. Test Installation

```bash
# Start in development mode
npm run dev

# Or production mode
npm start
```

Open your Windows browser at `http://localhost:3000`

## 🖥️ GUI Applications in WSL

WSL 2 with WSLg supports running GUI applications directly!

### Enable X11 Display

WSLg should work out of the box on Windows 11 and recent Windows 10 builds. If you have issues:

```bash
# Check DISPLAY variable
echo $DISPLAY

# Should output something like :0 or :1

# If empty, add to ~/.bashrc
echo 'export DISPLAY=:0' >> ~/.bashrc
source ~/.bashrc
```

### Test X11 Applications

```bash
# Install a simple GUI app to test
sudo apt install -y x11-apps

# Try running xclock
xclock
```

If a clock window appears on Windows, X11 is working!

### xdotool with WSL

Since Wallestars uses `xdotool` for computer control:

```bash
# Install xdotool
sudo apt install -y xdotool

# Test (this should work if X11 is configured)
xdotool getdisplaygeometry
```

**Note:** `xdotool` in WSL controls the WSL X server, not Windows directly. For Windows desktop control from WSL, see [Advanced Integration](#advanced-integration) below.

## 📁 File System Best Practices

### Understanding WSL File Systems

WSL provides two file system types:

1. **WSL Native (ext4)** - `/home/`, `/root/`, etc.
   - Fast performance
   - Native Linux permissions
   - **Recommended for projects**

2. **Windows Mount (NTFS)** - `/mnt/c/`, `/mnt/d/`, etc.
   - Slower performance (especially npm/git)
   - Windows file permissions
   - Good for accessing Windows files

### Best Practices

✅ **DO:**
- Store your Wallestars project in WSL filesystem (`~/Wallestars`)
- Run `npm install` in WSL filesystem
- Keep `.git` directory in WSL filesystem
- Use WSL terminal for git operations

❌ **DON'T:**
- Clone to `/mnt/c/Users/...` (slow performance)
- Run `npm install` on Windows-mounted drives
- Mix Windows and WSL git operations

### Accessing Files

**From WSL to Windows:**
```bash
# Access Windows C: drive
cd /mnt/c/Users/YourName/

# Access Windows desktop
cd /mnt/c/Users/YourName/Desktop/
```

**From Windows to WSL:**
```
# In Windows File Explorer, use:
\\wsl$\Ubuntu\home\yourusername\Wallestars

# Or use the path directly:
\\wsl.localhost\Ubuntu\home\yourusername\Wallestars
```

**VS Code Integration:**
```bash
# Open project in VS Code (Windows) from WSL
code .
```

Install "Remote - WSL" extension in VS Code for seamless integration.

## 🔌 MCP Integration with Claude Desktop

### Connecting Claude Desktop (Windows) to Wallestars (WSL)

Since Claude Desktop runs on Windows and Wallestars runs in WSL, you need to bridge them:

#### Method 1: Access WSL Server from Windows (Recommended)

WSL 2 provides network integration. Windows can access WSL services via `localhost`.

1. **Start Wallestars in WSL:**
   ```bash
   cd ~/Wallestars
   npm start
   ```

2. **Configure Claude Desktop on Windows:**
   
   Edit `%APPDATA%\Claude\claude_desktop_config.json`:

   ```json
   {
     "mcpServers": {
       "wallestars-control": {
         "command": "wsl",
         "args": [
           "bash", "-c",
           "cd /home/yourusername/Wallestars && node server/index.js"
         ],
         "env": {
           "ANTHROPIC_API_KEY": "sk-ant-your-key-here",
           "PORT": "3000",
           "ENABLE_COMPUTER_USE": "true"
         }
       }
     }
   }
   ```

   **Important:** Replace `yourusername` with your actual WSL username.

#### Method 2: Run via WSL Command

Alternatively, use the included setup script adapted for WSL:

```bash
# In WSL
cd ~/Wallestars
./setup-wsl.sh
```

This script will:
- Detect WSL environment
- Create appropriate configuration
- Guide you through setup

### Verify MCP Connection

1. Restart Claude Desktop (Windows)
2. Open Claude Desktop
3. Try: "Take a screenshot" or "What's my system info?"
4. Claude should be able to communicate with Wallestars in WSL

## 🚀 Performance Optimization

### 1. Use WSL 2 (Not WSL 1)

Verify you're using WSL 2:
```powershell
wsl --list --verbose
```

If showing VERSION 1, upgrade:
```powershell
wsl --set-version Ubuntu 2
```

### 2. Disable Windows Defender for WSL Files

Add exclusion for WSL directories to improve performance:

1. Open Windows Security
2. Go to "Virus & threat protection"
3. Click "Manage settings"
4. Scroll to "Exclusions"
5. Add: `%LOCALAPPDATA%\Packages\CanonicalGroupLimited.Ubuntu*`

### 3. Allocate Sufficient Resources

Edit `.wslconfig` (see [WSL Configuration](#wsl-configuration)) to allocate:
- At least 4GB RAM
- At least 2 CPU cores

### 4. Use Windows Terminal

For best experience, use **Windows Terminal** instead of the default console:
- Download from Microsoft Store
- Better performance
- Multiple tabs
- Customizable

### 5. Enable Git Performance Optimizations

```bash
# In WSL
git config --global core.fsmonitor true
git config --global core.untrackedcache true
git config --global feature.manyFiles true
```

## 🔧 Troubleshooting

### Issue: "Cannot connect to X server"

**Solution:**
```bash
# Check DISPLAY variable
echo $DISPLAY

# If empty, set it
export DISPLAY=:0

# Add to ~/.bashrc for persistence
echo 'export DISPLAY=:0' >> ~/.bashrc
source ~/.bashrc
```

### Issue: "xdotool: command not found"

**Solution:**
```bash
sudo apt update
sudo apt install -y xdotool
```

### Issue: "Network error" or "Cannot reach localhost:3000"

**Solutions:**

1. **Check if server is running:**
   ```bash
   # In WSL
   curl http://localhost:3000/api/health
   ```

2. **Check Windows firewall:**
   - Open Windows Defender Firewall
   - Allow Node.js through firewall

3. **Restart WSL networking:**
   ```powershell
   # In PowerShell (Admin)
   wsl --shutdown
   wsl
   ```

### Issue: "npm install" is very slow

**Solution:**
- Ensure you're in WSL filesystem, not `/mnt/c/`
- Move project to `~/Wallestars`
- Re-clone if necessary

### Issue: "Permission denied" errors

**Solution:**
```bash
# Fix node_modules permissions
cd ~/Wallestars
sudo chown -R $USER:$USER .
chmod -R u+w .

# Reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Claude Desktop can't connect to Wallestars

**Solutions:**

1. **Verify WSL is running:**
   ```powershell
   wsl --list --running
   ```

2. **Check if Wallestars server is accessible from Windows:**
   - Open `http://localhost:3000/api/health` in Windows browser
   - Should see `{"status": "ok"}`

3. **Verify MCP configuration path:**
   - In `claude_desktop_config.json`, use:
     ```json
     "args": ["bash", "-c", "cd /home/yourusername/Wallestars && node server/index.js"]
     ```
   - Not Windows paths like `C:\Users\...`

4. **Check Windows Event Viewer:**
   - Look for errors related to Claude Desktop or WSL

### Issue: "ADB devices not found"

**Solution:**

ADB in WSL needs special configuration to access USB devices:

1. **Install USB/IP support:**
   ```bash
   # In WSL
   sudo apt install -y usbip hwdata
   ```

2. **Use usbipd-win on Windows:**
   - Download from: https://github.com/dorssel/usbipd-win/releases
   - Follow instructions to share USB devices with WSL

3. **Or use ADB over WiFi:**
   - Enable WiFi debugging on Android
   - Connect via: `adb connect <device-ip>:5555`

### Issue: GUI apps not displaying

**Solution:**

1. **Verify WSLg is installed:**
   ```bash
   ls /mnt/wslg/
   ```

2. **Update WSL:**
   ```powershell
   wsl --update
   ```

3. **Restart WSL:**
   ```powershell
   wsl --shutdown
   wsl
   ```

## 🌟 Advanced Integration

### Using Windows Desktop Control from WSL

Since `xdotool` only controls WSL's X server, for actual Windows desktop control:

1. **Option A:** Use Windows tools via PowerShell
   ```bash
   # Call Windows PowerShell from WSL
   powershell.exe -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(500, 300)"
   ```

2. **Option B:** Use a Windows automation bridge
   - Install AutoHotkey on Windows
   - Create an HTTP API in Windows
   - Call from Wallestars in WSL

3. **Option C:** Hybrid approach
   - Run the web UI in WSL
   - Use Windows-native automation tools
   - Bridge via HTTP/WebSocket

### Docker Support in WSL

If you want to containerize Wallestars:

```bash
# Install Docker in WSL
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Restart WSL
exit
# (from PowerShell) wsl --shutdown
wsl
```

## 📚 Additional Resources

### WSL Documentation
- [Microsoft WSL Documentation](https://learn.microsoft.com/windows/wsl/)
- [WSL File System Guide](https://learn.microsoft.com/windows/wsl/filesystems)
- [WSL Networking](https://learn.microsoft.com/windows/wsl/networking)
- [WSLg (GUI Apps)](https://github.com/microsoft/wslg)

### Wallestars Documentation
- [Main README](README.md)
- [MCP Setup Guide](MCP_SETUP.md)
- [Quick Start Guide](QUICKSTART.md)
- [Architecture Documentation](ARCHITECTURE.md)

### Useful Tools
- [Windows Terminal](https://aka.ms/terminal) - Modern terminal for Windows
- [VS Code Remote - WSL](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl)
- [usbipd-win](https://github.com/dorssel/usbipd-win) - USB device sharing with WSL

## 🤝 Support

If you encounter issues specific to WSL:

1. Check this guide's [Troubleshooting](#troubleshooting) section
2. Review [WSL GitHub Issues](https://github.com/microsoft/WSL/issues)
3. Open an issue on [Wallestars GitHub](https://github.com/Wallesters-org/Wallestars/issues) with `[WSL]` tag

---

**Built with ❤️ by Wallestars Team**

**🪟 Bringing Linux automation to Windows with WSL!**
