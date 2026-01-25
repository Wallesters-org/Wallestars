# 🚀 Wallestars - GitHub Codespaces Setup Guide

Complete setup instructions for running Wallestars Control Center in GitHub Codespaces.

## 📋 Prerequisites

- GitHub account with Codespaces access
- Anthropic API key ([Get one here](https://console.anthropic.com))

## 🔧 Quick Start (3 Steps)

### 1. **Create .env File**

```bash
# Copy the example file
cp .env.example .env

# Edit with your real API keys
code .env
```

**Required Configuration:**
```env
# Anthropic API (REQUIRED) - Get yours at https://console.anthropic.com
ANTHROPIC_API_KEY=sk-ant-your-api-key-here

# External Services (OPTIONAL - Contact admin for keys)
CONTEXTSTREAM_API_KEY=your_contextstream_key
GITHUB_TOKEN=ghp_your_github_token
HOSTINGER_API_KEY=your_hostinger_key
N8N_MCP_API_KEY=your_n8n_jwt_token
```

### 2. **Install Dependencies**

```bash
npm install
```

### 3. **Start Development Server**

```bash
npm run dev
```

## 🌐 Access Your Application

### In Codespaces:

1. Wait for the server to start (you'll see):
   ```
   ✅ Backend API:  http://localhost:3000
   ✅ Frontend:     http://localhost:5173
   ```

2. Look for the **PORTS** tab at the bottom of VS Code

3. Find port **5173** (Frontend)

4. Click the 🌐 globe icon to open in browser

5. **Public URL format:**
   ```
   https://[codespace-name]-5173.preview.app.github.dev
   ```

## 📦 What's Included

### Features:
- ✅ **Dashboard** - Real-time metrics & platform links
- ✅ **Claude Chat** - AI-powered conversations
- ✅ **Computer Use** - Linux desktop automation
- ✅ **Android Control** - Mobile device management
- ✅ **QR Scanner** - Image analysis & QR generation
- ✅ **Settings** - Platform configuration

### Tech Stack:
- React 18.2 + Vite
- Node.js 20.x + Express
- Socket.IO for real-time
- Tailwind CSS + Framer Motion
- Anthropic Claude API

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill processes on ports
killall node
npm run dev
```

### API Key Not Working
1. Verify key in `.env` file
2. Restart dev server: `Ctrl+C` then `npm run dev`
3. Check console for API errors

### Codespaces Container Issues
1. Open Command Palette: `Cmd/Ctrl + Shift + P`
2. Type: "Codespaces: Rebuild Container"
3. Wait for rebuild to complete

### Frontend Not Loading
1. Check PORTS tab shows port 5173
2. Try different port forward visibility (Public/Private)
3. Clear browser cache and reload

## 📝 Environment Variables Explained

| Variable | Purpose | Required |
|----------|---------|----------|
| `ANTHROPIC_API_KEY` | Claude AI access | ✅ Yes |
| `PORT` | Backend port | No (default: 3000) |
| `ENABLE_COMPUTER_USE` | Linux automation | No (default: true) |
| `ENABLE_ANDROID` | Android control | No (default: false) |
| `CONTEXTSTREAM_API_KEY` | Context management | No |
| `GITHUB_TOKEN` | GitHub API access | No |
| `HOSTINGER_API_KEY` | Hosting management | No |
| `N8N_MCP_API_KEY` | n8n workflows | No |

## 🔒 Security Notes

- ⚠️ **NEVER** commit `.env` file to Git
- ✅ `.env` is in `.gitignore` by default
- ✅ Use GitHub Secrets for production
- ✅ Rotate API keys regularly

## 🚀 Production Deployment

### Azure Web Apps (Configured):
```bash
# Build for production
npm run build

# Deploy via GitHub Actions
git push origin main
```

### Manual Deployment:
```bash
# Build
npm run build

# Set environment variables in hosting platform
# Start with:
npm start
```

## 💡 Pro Tips

1. **Faster Startup**: Keep Codespace running (don't stop)
2. **Better Performance**: Use "Prebuild" feature for instant startup
3. **Debug Mode**: Check browser DevTools Console for errors
4. **Live Reload**: Changes auto-reload in dev mode

## 📚 Additional Resources

- [Wallestars Documentation](README.md)
- [Claude API Docs](https://docs.anthropic.com)
- [GitHub Codespaces Docs](https://docs.github.com/codespaces)
- [Vite Documentation](https://vitejs.dev)

---

**Need Help?** Open an issue on GitHub or check the logs:
```bash
# Backend logs
npm run server

# Frontend logs
npm run client
```

**Built with ❤️ by Wallestars Team**
