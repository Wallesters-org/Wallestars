# 🚀 Wallestars Launch Guide

This guide will help you quickly launch the Wallestars Control Center project.

## Prerequisites

Before launching, ensure you have:

- ✅ **Node.js 20.x or higher** - [Download here](https://nodejs.org/)
- ✅ **npm** (comes with Node.js)
- ✅ **Anthropic API Key** - [Get one here](https://console.anthropic.com)

### Optional (for full functionality):
- **Linux**: `xdotool` for Computer Use features
  ```bash
  sudo apt install xdotool
  ```
- **Android**: `adb` (Android SDK Platform Tools) for Android control

## 🎯 Quick Launch (First Time)

Run this simple script to set everything up:

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env

# 3. Edit .env and add your API key
nano .env  # or use your favorite editor
# Replace 'your_api_key_here' with your actual Anthropic API key

# 4. Start the application
npm run dev
```

## 🔑 Configure Your API Key

Edit the `.env` file and replace the placeholder:

```env
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
```

**⚠️ Important**: Never commit your `.env` file to Git. It's already in `.gitignore`.

## 🚀 Launch Commands

### Development Mode (Recommended)
Starts both server and client with hot-reload:
```bash
npm run dev
```

This will:
- Start the backend server on `http://localhost:3000`
- Start the frontend on `http://localhost:5173`
- Enable hot-reload for both

### Production Mode
Build and run optimized version:
```bash
npm run build
npm start
```

### Separate Server/Client (Advanced)
Run in separate terminals:

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

## 🌐 Access the Application

Once running, open your browser to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health

## ✅ Verify Setup

Check that everything is working:

1. **Server Status**: Visit http://localhost:3000/api/health
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

2. **Frontend**: Open http://localhost:5173 and see the dashboard

## 🔧 Troubleshooting

### Dependencies Not Installed
```bash
npm install
```

### Port Already in Use
If port 3000 or 5173 is already in use, change it in `.env`:
```env
PORT=3001  # Change backend port
```

For Vite (frontend), it will auto-increment the port (5174, 5175, etc.).

### API Key Issues
- Ensure your API key starts with `sk-ant-`
- Check that `.env` file exists and is readable
- Verify no extra spaces around the key

### Missing xdotool (Linux Computer Use)
```bash
sudo apt update
sudo apt install xdotool
```

### Missing adb (Android Control)
Download Android SDK Platform Tools and add to PATH:
```bash
export PATH=$PATH:/path/to/platform-tools
```

## 📦 Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | - | Your Anthropic API key (required) |
| `PORT` | 3000 | Backend server port |
| `NODE_ENV` | development | Environment mode |
| `ENABLE_COMPUTER_USE` | true | Enable Linux desktop control |
| `SCREENSHOT_INTERVAL` | 2000 | Screenshot capture interval (ms) |
| `ENABLE_ANDROID` | false | Enable Android device control |
| `ADB_HOST` | localhost | ADB server host |
| `ADB_PORT` | 5037 | ADB server port |
| `WS_PORT` | 3001 | WebSocket port |

## 🔒 Security Notes

- Never commit `.env` file to version control
- Keep your API key secret
- Don't share your API key in logs or screenshots
- Use environment-specific API keys for production

## 📚 Next Steps

After launching:

1. **Dashboard**: View system metrics and status
2. **Claude Chat**: Test AI conversation
3. **Computer Use**: Try desktop automation (Linux only)
4. **Android Control**: Connect Android devices (requires ADB setup)
5. **Prompt Generator**: Create Spark app prompts

## 🆘 Need Help?

- 📖 Read the full [README.md](README.md)
- 🔌 Check [MCP_SETUP.md](MCP_SETUP.md) for Claude Desktop integration
- 📝 See [QUICKSTART.md](QUICKSTART.md) for more details
- 🐛 Report issues on GitHub

---

**Happy coding! 🌟**
