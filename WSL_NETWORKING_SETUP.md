# 🪟 WSL Networking Setup Guide for Wallestars

This guide provides comprehensive instructions for running Wallestars Control Center on Windows using Windows Subsystem for Linux (WSL 2) with proper networking configuration.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [WSL Installation](#wsl-installation)
- [WSL Networking Modes](#wsl-networking-modes)
- [Running Wallestars on WSL](#running-wallestars-on-wsl)
- [Accessing Services](#accessing-services)
- [Port Forwarding Configuration](#port-forwarding-configuration)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## 🎯 Overview

Windows Subsystem for Linux (WSL 2) allows you to run Wallestars Control Center natively in a Linux environment on Windows. This guide focuses on networking configuration to ensure seamless communication between Windows, WSL, and external networks.

### Why WSL for Wallestars?

- **Native Linux Tools**: Run `xdotool`, `adb`, and other Linux tools without compatibility issues
- **Performance**: WSL 2 offers near-native Linux performance
- **Integration**: Access Windows applications and files from Linux and vice versa
- **Development**: Full Linux development environment on Windows

## 🔧 Prerequisites

Before setting up WSL for Wallestars, ensure you have:

1. **Windows 10 version 2004+** or **Windows 11**
2. **Administrator access** to install WSL
3. **Virtualization enabled** in BIOS/UEFI
4. **At least 4GB RAM** available for WSL
5. **Anthropic API Key** ([Get one here](https://console.anthropic.com))

## 📦 WSL Installation

### Step 1: Install WSL

Open PowerShell or Windows Command Prompt as **Administrator** and run:

```powershell
wsl --install
```

This command will:
- Enable required Windows features
- Install the WSL 2 kernel
- Install Ubuntu as the default Linux distribution

**Alternative**: Install a specific distribution:
```powershell
# List available distributions
wsl --list --online

# Install specific distro (e.g., Ubuntu 22.04)
wsl --install -d Ubuntu-22.04
```

### Step 2: Set Up Linux User

After installation, restart your computer. Upon reboot, a terminal window will open automatically. Create your Linux username and password when prompted.

### Step 3: Update Linux System

```bash
sudo apt update && sudo apt upgrade -y
```

### Step 4: Install Required Dependencies

```bash
# Install essential build tools
sudo apt install build-essential git curl wget -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version

# Install xdotool for computer control
sudo apt install xdotool -y

# Install ADB for Android control (optional)
sudo apt install android-tools-adb -y
```

## 🌐 WSL Networking Modes

WSL 2 supports two networking modes that affect how Wallestars communicates:

### 1. NAT Mode (Default)

In NAT (Network Address Translation) mode, WSL runs in a separate network namespace with its own virtual network adapter.

**Characteristics:**
- WSL has a different IP address from Windows
- Linux apps can be accessed from Windows using `localhost`
- Windows apps require the Windows host IP from WSL
- External LAN access requires port forwarding

**Getting IP Addresses:**

From Windows, get WSL IP:
```powershell
wsl.exe hostname -I
```

From WSL, get Windows host IP:
```bash
ip route show | grep -i default | awk '{ print $3}'
# Or store in a variable
export WINDOWS_HOST=$(ip route show | grep -i default | awk '{ print $3}')
echo $WINDOWS_HOST
```

### 2. Mirrored Networking Mode (Experimental)

Mirrored mode provides direct bidirectional `localhost` communication between Windows and WSL.

**Enable Mirrored Mode:**

Create or edit `%USERPROFILE%\.wslconfig`:

```ini
[wsl2]
networkingMode=mirrored
```

Then restart WSL:
```powershell
wsl --shutdown
```

**Benefits:**
- Use `localhost` from both Windows and WSL
- Simplified networking configuration
- IPv6 support

**Note**: This is an experimental feature and may not be available in all WSL versions.

## 🚀 Running Wallestars on WSL

### Step 1: Clone and Set Up Wallestars

```bash
# Navigate to your preferred directory
cd ~

# Clone the repository
git clone https://github.com/Wallesters-org/Wallestars.git
cd Wallestars

# Install dependencies
npm install

# Configure environment
cp .env.example .env
```

### Step 2: Configure Environment Variables

Edit `.env` file:

```bash
nano .env
```

Add your configuration:
```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
PORT=3000
ENABLE_COMPUTER_USE=true
ENABLE_ANDROID=false
SCREENSHOT_INTERVAL=2000
```

### Step 3: Start Wallestars Server

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## 🔗 Accessing Services

### From Windows Browser to WSL Server

**Using NAT Mode (Default):**
```
http://localhost:3000
```
or
```
http://127.0.0.1:3000
```

WSL automatically forwards `localhost` requests from Windows to the WSL instance.

**Using WSL IP Address:**
```powershell
# Get WSL IP from PowerShell
wsl.exe hostname -I
# Example output: 172.20.0.2

# Access via browser
http://172.20.0.2:3000
```

### From WSL to Windows Services

If you need to access Windows applications from WSL (e.g., Windows-hosted databases):

```bash
# Get Windows host IP
export WINDOWS_HOST=$(ip route show | grep -i default | awk '{ print $3}')

# Access Windows service (examples)
# Web service on port 8080:
curl http://$WINDOWS_HOST:8080
# Database on port 3306:
# mysql -h $WINDOWS_HOST -P 3306 -u user -p
```

### From External Network (LAN)

By default, WSL services are not accessible from other devices on your network. You need to configure port forwarding.

## 🔀 Port Forwarding Configuration

To expose Wallestars running on WSL to your local network:

### Step 1: Find WSL IP Address

```powershell
wsl.exe hostname -I
# Example: 172.20.0.2
```

### Step 2: Configure Port Forwarding

Run in PowerShell as **Administrator**:

```powershell
# Forward port 3000 (Wallestars HTTP server)
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=172.20.0.2

# Forward port 3001 (WebSocket)
netsh interface portproxy add v4tov4 listenport=3001 listenaddress=0.0.0.0 connectport=3001 connectaddress=172.20.0.2
```

**Important**: Replace `172.20.0.2` with your actual WSL IP address.

### Step 3: Configure Windows Firewall

```powershell
# Allow incoming connections on port 3000
New-NetFirewallRule -DisplayName "Wallestars HTTP" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow

# Allow incoming connections on port 3001 (WebSocket)
New-NetFirewallRule -DisplayName "Wallestars WebSocket" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
```

### Step 4: Verify Port Forwarding

```powershell
# List all port forwarding rules
netsh interface portproxy show all
```

### Remove Port Forwarding (Optional)

```powershell
# Remove specific rule
netsh interface portproxy delete v4tov4 listenport=3000 listenaddress=0.0.0.0

# Remove all rules
netsh interface portproxy reset
```

## 🔍 Troubleshooting

### Issue: Cannot Access Wallestars from Windows Browser

**Symptoms**: `localhost:3000` not responding

**Solutions**:
1. Verify the server is running in WSL:
   ```bash
   curl http://localhost:3000/api/health
   ```

2. Check if the port is listening:
   ```bash
   sudo netstat -tulpn | grep 3000
   ```

3. Restart WSL:
   ```powershell
   wsl --shutdown
   ```

4. Check Windows Firewall settings

### Issue: xdotool Not Working in WSL

**Symptoms**: Computer control features fail

**Solution**: WSL doesn't have direct X11 display access. For computer control:
1. Install an X11 server on Windows (e.g., VcXsrv, X410)
2. Configure DISPLAY variable in WSL:
   ```bash
   export DISPLAY=$(ip route show | grep -i default | awk '{ print $3}'):0
   ```
3. Or run Wallestars directly on Windows with Git Bash or native Node.js

### Issue: Port Forwarding Not Persistent

**Symptoms**: Port forwarding rules disappear after reboot

**Solution**: Create a PowerShell script to set up forwarding on startup:

```powershell
# Save as setup-wsl-forwarding.ps1
$wslIP = (wsl.exe hostname -I).Trim()
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=$wslIP
netsh interface portproxy add v4tov4 listenport=3001 listenaddress=0.0.0.0 connectport=3001 connectaddress=$wslIP
```

Run this script after WSL starts or add it to Windows Task Scheduler.

### Issue: WSL IP Address Changes

**Symptoms**: Port forwarding stops working after restart

**Solution**: WSL assigns dynamic IP addresses. Use the script above to automatically update forwarding rules with the current WSL IP.

### Issue: Claude Desktop Cannot Connect to Wallestars

**Symptoms**: MCP server not responding

**Solutions**:
1. Ensure absolute paths in `claude_desktop_config.json`:
   ```json
   {
     "mcpServers": {
       "wallestars-control": {
         "command": "wsl",
         "args": [
           "bash",
           "-c",
           "cd /home/username/Wallestars && node server/index.js"
         ],
         "env": {
           "ANTHROPIC_API_KEY": "sk-ant-your-key-here",
           "ENABLE_COMPUTER_USE": "true"
         }
       }
     }
   }
   ```

2. Verify Node.js is in WSL PATH:
   ```bash
   which node
   ```

3. Check WSL is set as default version 2:
   ```powershell
   wsl --set-default-version 2
   ```

### Issue: ADB Cannot Find Android Devices

**Symptoms**: No devices listed with `adb devices`

**Solution**: ADB server runs on Windows, not accessible from WSL by default:

**Option 1**: Run ADB from Windows and use TCP/IP:
```powershell
# On Windows
adb tcpip 5555
adb connect 127.0.0.1:5555
```

**Option 2**: Forward ADB server from Windows to WSL:
```bash
# In WSL
export ADB_SERVER_SOCKET=tcp:$WINDOWS_HOST:5037
adb devices
```

## ✅ Best Practices

### 1. File Location

Store code in WSL file system for best performance:
```bash
# Good: WSL file system
cd ~/Wallestars

# Avoid: Windows file system (slow)
cd /mnt/c/Users/YourName/Wallestars
```

### 2. Development Workflow

Use VS Code with Remote - WSL extension:
```bash
# Open current directory in VS Code
code .
```

### 3. Resource Management

Configure WSL memory limits in `%USERPROFILE%\.wslconfig`:
```ini
[wsl2]
memory=4GB
processors=2
```

### 4. Regular Backups

Export your WSL distribution:
```powershell
wsl --export Ubuntu C:\backups\ubuntu-backup.tar
```

Restore if needed:
```powershell
wsl --import Ubuntu C:\WSL\Ubuntu C:\backups\ubuntu-backup.tar
```

### 5. Security

- Never expose port forwarding rules to the internet without proper authentication
- Use strong passwords for Linux user accounts
- Keep WSL and packages updated regularly
- Limit port forwarding to specific network interfaces if needed

### 6. Performance Optimization

- Use WSL 2 (not WSL 1) for better performance
- Store project files in WSL file system, not mounted Windows drives
- Close unused WSL instances to free resources:
  ```powershell
  wsl --shutdown
  ```

## 📚 Additional Resources

### Official Documentation
- [Microsoft WSL Networking Documentation](https://learn.microsoft.com/en-us/windows/wsl/networking) ([Bulgarian version](https://learn.microsoft.com/bg-bg/windows/wsl/networking))
- [WSL Best Practices Guide](https://learn.microsoft.com/en-us/windows/wsl/setup/environment)
- [WSL Configuration Settings](https://learn.microsoft.com/en-us/windows/wsl/wsl-config)

### Wallestars Documentation
- [README](README.md) - Main documentation
- [QUICKSTART](QUICKSTART.md) - Quick setup guide
- [MCP_SETUP](MCP_SETUP.md) - MCP integration guide

### Community Resources
- [WSL GitHub Repository](https://github.com/microsoft/WSL)
- [Wallestars Repository](https://github.com/Wallesters-org/Wallestars)
- [Anthropic Documentation](https://docs.anthropic.com)

## 🤝 Support

If you encounter issues:
1. Check the [Troubleshooting](#troubleshooting) section above
2. Review WSL networking logs: `wsl --debug-console`
3. Check Wallestars server logs for error messages
4. Open an issue on [GitHub](https://github.com/Wallesters-org/Wallestars/issues)

---

**Built with ❤️ by Wallestars Team**

*Running on WSL 2 for the best of both Windows and Linux worlds!*
