# 🌟 Wallestars - Complete Guide (Всичко на Едно Място)

**Дата:** 2026-01-03  
**Версия:** 1.0.0  
**Език:** Български + English  
**За:** Всички потребители - от начинаещи до експерти

---

## 📖 За Какво е Този Guide?

Това е **централният comprehensive guide** за Wallestars Control Center платформата. Той съдържа:

✅ Пълен преглед на платформата  
✅ Стъпка-по-стъпка инструкции за всичко  
✅ Референции към детайлни документи  
✅ Troubleshooting и best practices  
✅ Future roadmap и идеи  

---

## 🎯 Бърза Навигация

### За Начинаещи
1. [Какво е Wallestars?](#какво-е-wallestars)
2. [Quick Start (5 минути)](#quick-start-5-минути)
3. [Основни Концепции](#основни-концепции)
4. [Първи Стъпки](#първи-стъпки)

### За Разработчици
1. [Development Setup](#development-setup)
2. [Архитектура](#архитектура)
3. [API Reference](#api-reference)
4. [Extending Wallestars](#extending-wallestars)

### За DevOps/Admins
1. [Production Deployment](#production-deployment)
2. [VPS Setup (15 servers)](#vps-setup-15-servers)
3. [Monitoring & Maintenance](#monitoring--maintenance)
4. [Automation Scripts](#automation-scripts)

### За AI Enthusiasts
1. [Claude Integration](#claude-integration)
2. [MCP Setup](#mcp-setup)
3. [AI Prompts Library](#ai-prompts-library)
4. [Advanced Workflows](#advanced-workflows)

---

## 🌟 Какво е Wallestars?

**Wallestars Control Center** е професионална платформа за:

🤖 **AI Automation** - Интеграция с Claude Sonnet 4.5  
🖥️ **Desktop Control** - Linux computer automation (mouse, keyboard)  
📱 **Mobile Control** - Android device automation през ADB  
🌐 **Web Interface** - Beautiful React UI с real-time updates  
🔌 **MCP Support** - Model Context Protocol за Claude Desktop  
🚀 **Production Ready** - Deployment на multiple VPS servers  

### Ключови Features

| Feature | Status | Описание |
|---------|--------|----------|
| 💬 Claude Chat | ✅ | Chat с Claude Sonnet 4.5 |
| 🖥️ Computer Use | ✅ | Vision-based desktop automation |
| 📸 Screenshots | ✅ | Desktop & Android screenshots |
| 🖱️ Mouse Control | ✅ | Click, drag, move (Linux) |
| ⌨️ Keyboard | ✅ | Type text, press keys (Linux) |
| 📱 Android ADB | ✅ | Touch, type, navigate на devices |
| 🔌 MCP Protocol | ✅ | Claude Desktop integration |
| 🌐 REST API | ✅ | Full HTTP API |
| 🔄 WebSocket | ✅ | Real-time streaming |
| 🎨 Modern UI | ✅ | React + Tailwind CSS |

---

## ⚡ Quick Start (5 минути)

### Стъпка 1: Изисквания

```bash
# Проверете Node.js (трябва 20.x+)
node --version

# Ако няма Node.js 20.x, инсталирайте:
# Ubuntu/Debian:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# macOS:
brew install node@20

# Windows: https://nodejs.org/
```

### Стъпка 2: Clone & Install

```bash
# Clone repository
git clone https://github.com/Wallesters-org/Wallestars.git
cd Wallestars

# Install dependencies
npm install
```

### Стъпка 3: Configure

```bash
# Copy environment template
cp .env.example .env

# Edit .env и добавете вашия API key
nano .env

# Минимална конфигурация:
ANTHROPIC_API_KEY=sk-ant-your-key-here
PORT=3000
NODE_ENV=development
ENABLE_COMPUTER_USE=true
ENABLE_ANDROID=false
```

**Получаване на API Key:**
1. https://console.anthropic.com → Sign up/Login
2. API Keys → Create new key
3. Copy ключа (започва с `sk-ant-`)
4. Paste в `.env`

### Стъпка 4: Start

```bash
# Development mode (препоръчително за начало)
npm run dev

# ✅ Готово! Отворете:
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
```

### Стъпка 5: Verify

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Трябва да видите:
{
  "status": "healthy",
  "services": {
    "claude": true,
    "computerUse": true,
    "android": false
  }
}
```

**🎉 Success! Wallestars е running!**

---

## 📚 Документация Suite

Wallestars има comprehensive documentation система:

### Основна Документация

| Документ | Описание | За Кого |
|----------|----------|---------|
| [README.md](./README.md) | Overview, features, quick start | Всички |
| [QUICKSTART.md](./QUICKSTART.md) | 5-минутен бърз старт | Начинаещи |
| **[COMPLETE_GUIDE.md](./COMPLETE_GUIDE.md)** | **Този документ** - всичко на едно място | Всички |

### Технична Документация

| Документ | Описание | За Кого |
|----------|----------|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System архитектура, компоненти | Developers |
| [PLATFORM_STATUS.md](./PLATFORM_STATUS.md) | Пълен status на платформата | Developers, Admins |
| [STARTUP_INSTRUCTIONS.md](./STARTUP_INSTRUCTIONS.md) | Детайлни startup инструкции | Developers |

### MCP & AI Integration

| Документ | Описание | За Кого |
|----------|----------|---------|
| [MCP_SETUP.md](./MCP_SETUP.md) | MCP setup guide | AI Enthusiasts |
| [MCP_INTEGRATION_SUMMARY.md](./MCP_INTEGRATION_SUMMARY.md) | MCP integration summary | Developers |

### Deployment & Operations

| Документ | Описание | За Кого |
|----------|----------|---------|
| [VPS_DEPLOYMENT.md](./VPS_DEPLOYMENT.md) | VPS deployment (15 servers) | DevOps, Admins |
| [AUTOMATION_GUIDE.md](./AUTOMATION_GUIDE.md) | Automation scripts & AI prompts | DevOps, Advanced |

---

## 🏗️ Архитектура

### High-Level Overview

```
┌─────────────────────────────────────────────┐
│         Users / Claude Desktop              │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│         Nginx Reverse Proxy (80/443)        │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│    Wallestars Control Center (Port 3000)    │
│                                             │
│  ┌──────────────┐  ┌──────────────┐       │
│  │ React Frontend│  │ Express API  │       │
│  │  (Vite Build) │  │ + Socket.IO  │       │
│  └──────────────┘  └──────┬───────┘       │
│                           │                │
│  ┌────────────────────────┴──────────────┐ │
│  │        Service Layer                  │ │
│  │  - Claude AI                          │ │
│  │  - Computer Use (xdotool)             │ │
│  │  - Android (ADB)                      │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│   External Services                         │
│   - Anthropic Claude API                    │
│   - Linux X11 (xdotool)                     │
│   - Android Devices (ADB)                   │
└─────────────────────────────────────────────┘
```

### Tech Stack

**Frontend:**
- React 18.2
- Vite 5.0 (build tool)
- Tailwind CSS 3.4
- Framer Motion (animations)
- Socket.IO Client (real-time)
- Lucide React (icons)

**Backend:**
- Node.js 20.x
- Express.js 4.18
- Socket.IO 4.6 (WebSocket)
- Anthropic SDK 0.30
- Axios (HTTP client)
- screenshot-desktop (captures)

**System Tools:**
- xdotool (Linux control)
- adb (Android control)
- PM2 (process management)
- Nginx (reverse proxy)

---

## 🔌 API Reference

### Base URL

```
Development: http://localhost:3000
Production:  https://yourdomain.com
```

### Authentication

**Currently:** API key в `.env` (server-side)  
**Future:** JWT tokens, API keys per user

### Endpoints

#### Health Check

```http
GET /api/health

Response 200:
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

#### Claude Chat

```http
POST /api/claude/chat
Content-Type: application/json

Body:
{
  "message": "Hello, Claude!",
  "conversationHistory": []
}

Response 200:
{
  "response": "Hello! How can I help you today?",
  "timestamp": "2026-01-03T12:00:00.000Z"
}
```

#### Desktop Screenshot

```http
GET /api/computer/screenshot

Response 200:
{
  "success": true,
  "screenshot": "iVBORw0KGgoAAAANSUhEUg...",  // base64
  "timestamp": "2026-01-03T12:00:00.000Z",
  "dimensions": {
    "width": 1920,
    "height": 1080
  }
}
```

#### Mouse Click

```http
POST /api/computer/click
Content-Type: application/json

Body:
{
  "x": 500,
  "y": 300,
  "button": "left"
}

Response 200:
{
  "success": true,
  "action": "clicked at (500, 300)"
}
```

**Вижте [PLATFORM_STATUS.md](./PLATFORM_STATUS.md) за complete API reference.**

---

## 🚀 Production Deployment

### Option 1: Single VPS

**Препоръчано за:** 1 site, малка до средна traffic

**Steps:**
1. Следвайте [VPS_DEPLOYMENT.md](./VPS_DEPLOYMENT.md) - Single VPS Setup
2. Install Node.js, npm, nginx, certbot
3. Clone repo, configure, build
4. Setup PM2 for process management
5. Configure Nginx reverse proxy
6. Setup SSL with Let's Encrypt

**Quick command:**
```bash
# On VPS:
curl -fsSL https://raw.githubusercontent.com/Wallesters-org/Wallestars/main/deploy-single-vps.sh | bash
```

### Option 2: Multi-VPS (15 Servers)

**Препоръчано за:** Multiple sites, high availability, load balancing

**Steps:**
1. Създайте `vps-list.txt` с IP addresses
2. Setup SSH keys за automation
3. Използвайте `master-deploy.sh` script
4. Configure load balancer (nginx/haproxy)

**Quick command:**
```bash
# From your local machine:
./master-deploy.sh deploy
```

**Вижте [VPS_DEPLOYMENT.md](./VPS_DEPLOYMENT.md) за complete guide.**

### Option 3: Docker Container

**Препоръчано за:** Containerized environments, Kubernetes

**Quick start:**
```bash
# Build image
docker build -t wallestars:latest .

# Run with docker-compose
docker-compose up -d

# Check status
docker-compose ps
```

**Вижте [AUTOMATION_GUIDE.md](./AUTOMATION_GUIDE.md) за Docker Swarm и Kubernetes.**

### Option 4: Cloud Platforms

**Azure Web Apps** (mentioned в README):
- GitHub Actions workflow готов
- Automatic deployments
- Managed infrastructure

**AWS / GCP / DigitalOcean:**
- Use Docker container
- Deploy to ECS / Cloud Run / Droplets
- Configure load balancer

---

## 🤖 Claude Integration & MCP

### Какво е MCP?

**Model Context Protocol (MCP)** е open protocol, който позволява на AI assistants (като Claude Desktop) да се свързват със local services и tools.

### Setup за Claude Desktop

**Стъпка 1: Install Claude Desktop**
```
Download from: https://www.anthropic.com
```

**Стъпка 2: Configure MCP**
```bash
# Automatic setup (Unix/macOS):
./setup-mcp.sh

# Automatic setup (Windows):
.\setup-mcp.ps1

# Manual setup:
# Edit: ~/Library/Application Support/Claude/claude_desktop_config.json (macOS)
# или: %APPDATA%\Claude\claude_desktop_config.json (Windows)
```

**Стъпка 3: Add Configuration**
```json
{
  "mcpServers": {
    "wallestars-control": {
      "command": "node",
      "args": ["/absolute/path/to/Wallestars/server/index.js"],
      "env": {
        "ANTHROPIC_API_KEY": "sk-ant-your-key-here",
        "ENABLE_COMPUTER_USE": "true"
      }
    }
  }
}
```

**Стъпка 4: Restart Claude Desktop**

**Стъпка 5: Test**
```
Ask Claude: "Take a screenshot of my desktop"
```

**Детайли:** [MCP_SETUP.md](./MCP_SETUP.md)

---

## 🎯 AI Prompts Library

### Computer Automation

```
"Take a screenshot and tell me what's on my screen"

"Open Firefox and navigate to GitHub"

"Click on the address bar and type 'example.com'"

"Show me my system information"

"Take a screenshot every 30 seconds and describe changes"
```

### Development Workflows

```
"Review the code on my screen and suggest improvements"

"Check if my development server is running"

"Open VS Code and my project folder"

"Run git status and tell me about uncommitted changes"
```

### Android Control

```
"List my connected Android devices"

"Take a screenshot of my phone"

"Open the settings app on my device"

"Check the battery level"
```

### System Monitoring

```
"Monitor my system and alert me if CPU > 80%"

"Check if Wallestars server is healthy"

"Review server logs for errors"

"Generate a status report for all services"
```

**Повече в [AUTOMATION_GUIDE.md](./AUTOMATION_GUIDE.md)** - AI Prompts section

---

## 🛠️ Development Guide

### Local Development Setup

```bash
# 1. Clone & Install
git clone https://github.com/Wallesters-org/Wallestars.git
cd Wallestars
npm install

# 2. Configure
cp .env.example .env
# Edit .env with your settings

# 3. Start development mode
npm run dev

# This runs:
# - Backend: http://localhost:3000 (with nodemon auto-restart)
# - Frontend: http://localhost:5173 (with hot reload)
```

### Project Structure

```
Wallestars/
├── src/                    # Frontend React app
│   ├── components/         # React components
│   ├── pages/              # Page components
│   ├── context/            # React context
│   ├── App.jsx             # Main app
│   └── main.jsx            # Entry point
├── server/                 # Backend Node.js app
│   ├── routes/             # API routes
│   │   ├── claude.js       # Claude AI endpoints
│   │   ├── computerUse.js  # Computer control
│   │   └── android.js      # Android control
│   ├── socket/             # WebSocket handlers
│   └── index.js            # Server entry
├── .env                    # Environment config
├── package.json            # Dependencies
├── vite.config.js          # Vite config
└── tailwind.config.js      # Tailwind config
```

### Adding New Features

**Example: Add new API endpoint**

1. Create route handler:
```javascript
// server/routes/myFeature.js
import { Router } from 'express';

export const myFeatureRouter = Router();

myFeatureRouter.get('/hello', (req, res) => {
  res.json({ message: 'Hello from my feature!' });
});
```

2. Register route:
```javascript
// server/index.js
import { myFeatureRouter } from './routes/myFeature.js';

app.use('/api/myfeature', myFeatureRouter);
```

3. Test:
```bash
curl http://localhost:3000/api/myfeature/hello
```

### Testing

```bash
# Run tests (when available)
npm test

# Lint code (when configured)
npm run lint

# Build for production
npm run build
```

---

## 📊 Monitoring & Maintenance

### Health Monitoring

```bash
# Check health endpoint
curl http://localhost:3000/api/health

# Check PM2 status (production)
pm2 status

# View logs
pm2 logs wallestars

# Monitor resources
pm2 monit
```

### Log Management

```bash
# Backend logs (development)
npm run server

# PM2 logs (production)
pm2 logs wallestars --lines 100

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
journalctl -u wallestars.service -f
```

### Automated Monitoring

**Setup health check cron:**
```bash
# Create health-check.sh
chmod +x health-check.sh

# Add to crontab (check every 5 minutes)
crontab -e
*/5 * * * * /path/to/health-check.sh
```

**Детайли:** [VPS_DEPLOYMENT.md](./VPS_DEPLOYMENT.md) - Monitoring section

---

## 🔒 Security Best Practices

### API Key Protection

✅ **DO:**
- Store в `.env` file
- Use environment variables
- Rotate keys регулярно
- Use different keys за dev/prod

❌ **DON'T:**
- Commit в git
- Share publicly
- Hardcode в source
- Use същия key навсякъде

### Server Security

```bash
# Firewall configuration
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# SSL/TLS
sudo certbot --nginx -d yourdomain.com

# Regular updates
sudo apt update && sudo apt upgrade

# Security audit
npm audit
npm audit fix
```

### Production Checklist

- [ ] API keys в environment variables
- [ ] Firewall configured
- [ ] SSL certificates installed
- [ ] Regular backups configured
- [ ] Monitoring setup
- [ ] Error logging enabled
- [ ] Rate limiting (future)
- [ ] Authentication (future)

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

#### 2. "Port already in use"
```bash
# Find process on port 3000
lsof -i :3000
# Kill it
kill -9 <PID>
# Or use different port
PORT=3001 npm run dev
```

#### 3. "API key not found"
```bash
# Check .env exists
cat .env | grep ANTHROPIC_API_KEY
# If missing, add it
echo "ANTHROPIC_API_KEY=sk-ant-your-key" >> .env
```

#### 4. "xdotool: command not found"
```bash
# Ubuntu/Debian
sudo apt install xdotool

# Or disable feature
# In .env:
ENABLE_COMPUTER_USE=false
```

#### 5. Frontend won't load
```bash
# Check if both servers running
ps aux | grep node

# Restart dev mode
npm run dev

# Clear cache
rm -rf node_modules/.vite
```

**Повече в [STARTUP_INSTRUCTIONS.md](./STARTUP_INSTRUCTIONS.md)** - Troubleshooting section

---

## 🚦 Какво Липсва? (Missing Features)

### Текущо Не е Имплементирано

1. **Authentication/Authorization**
   - Няма user management
   - Няма login system
   - Всеки с достъп може да използва

2. **Database**
   - Всичко е in-memory
   - Няма persistence
   - Conversation history се губи при restart

3. **Tests**
   - Няма unit tests
   - Няма integration tests
   - Няма E2E tests

4. **Rate Limiting**
   - Няма API rate limits
   - Възможен е abuse

5. **Logging System**
   - Няма structured logging
   - Няма log aggregation
   - Console output само

6. **Windows Support**
   - Computer control work само на Linux
   - Няма Windows automation

7. **Multi-language UI**
   - UI е само на английски
   - Няма i18n support

### В Разработка (Roadmap)

**Q1 2026:**
- [ ] Docker Swarm / Kubernetes orchestration
- [ ] Comprehensive test suite
- [ ] Structured logging (Winston/Pino)
- [ ] Basic authentication

**Q2 2026:**
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] User management system
- [ ] API rate limiting
- [ ] Windows automation support

**Q3 2026:**
- [ ] Multi-language UI (i18n)
- [ ] Advanced monitoring (Prometheus/Grafana)
- [ ] Auto-scaling capabilities
- [ ] ML-based optimization

**Q4 2026:**
- [ ] Enterprise features
- [ ] Multi-tenancy support
- [ ] Advanced security (RBAC)
- [ ] Compliance automation

**Детайли:** [AUTOMATION_GUIDE.md](./AUTOMATION_GUIDE.md) - Future Ideas section

---

## 💡 Best Practices

### Development

1. **Always use Node.js 20.x+**
2. **Keep dependencies updated** (npm update)
3. **Test locally before deploy**
4. **Use environment variables**
5. **Comment complex code**
6. **Follow existing code style**

### Deployment

1. **Build for production** (npm run build)
2. **Use process manager** (PM2)
3. **Setup monitoring**
4. **Configure backups**
5. **Use SSL/HTTPS**
6. **Keep logs**

### Security

1. **Never commit secrets**
2. **Rotate API keys**
3. **Update regularly**
4. **Monitor access**
5. **Use firewall**
6. **Audit dependencies** (npm audit)

---

## 📞 Support & Community

### Getting Help

1. **Read Documentation:**
   - Start with [README.md](./README.md)
   - Check [QUICKSTART.md](./QUICKSTART.md)
   - Review specific guides

2. **Check Troubleshooting:**
   - [STARTUP_INSTRUCTIONS.md](./STARTUP_INSTRUCTIONS.md)
   - Common issues section

3. **GitHub Issues:**
   - https://github.com/Wallesters-org/Wallestars/issues
   - Search existing issues
   - Create new issue with details

4. **Community:**
   - GitHub Discussions (if enabled)
   - Discord/Slack (if available)

### Contributing

Contributions are welcome!

1. Fork repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

---

## 🎓 Learning Resources

### For Beginners

- **Node.js Tutorial:** https://nodejs.org/en/learn
- **React Tutorial:** https://react.dev/learn
- **Express.js Guide:** https://expressjs.com/en/guide/routing.html

### For AI Integration

- **Claude API Docs:** https://docs.anthropic.com
- **MCP Protocol:** https://modelcontextprotocol.io
- **Computer Use Guide:** https://docs.anthropic.com/computer-use

### For DevOps

- **PM2 Guide:** https://pm2.keymetrics.io/docs/usage/quick-start/
- **Nginx Tutorial:** https://nginx.org/en/docs/beginners_guide.html
- **Docker Docs:** https://docs.docker.com/get-started/

---

## 🎉 Успех!

Ако сте стигнали до тук, вече имате complete understanding на Wallestars platform!

### Следващи Стъпки:

1. ✅ **Start local development:** `npm run dev`
2. ✅ **Explore the UI:** http://localhost:5173
3. ✅ **Test Claude integration:** Try some prompts
4. ✅ **Deploy to production:** Follow VPS guide
5. ✅ **Automate everything:** Use automation scripts
6. ✅ **Contribute:** Add features, fix bugs
7. ✅ **Share:** Tell others about Wallestars

### Remember:

- 📚 Documentation е твоят приятел
- 🐛 Bugs са opportunities за learning
- 🤝 Community е важна
- 🚀 Keep building и experimenting

**Happy automating with Wallestars! 🌟**

---

## 📋 Quick Reference Card

```bash
# Installation
npm install

# Development
npm run dev                # Start dev mode
npm run server             # Backend only
npm run client             # Frontend only

# Production
npm run build              # Build
npm start                  # Start production

# Deployment
./master-deploy.sh deploy  # Deploy all VPS
./master-deploy.sh status  # Check status

# Monitoring
pm2 status                 # PM2 status
pm2 logs wallestars        # View logs
curl localhost:3000/api/health  # Health check

# MCP Setup
./setup-mcp.sh            # Unix/macOS
.\setup-mcp.ps1           # Windows
```

---

## 📚 Documentation Index

| Doc | Съдържание | Link |
|-----|-----------|------|
| README | Overview, features, quick start | [README.md](./README.md) |
| QUICKSTART | 5-minute setup guide | [QUICKSTART.md](./QUICKSTART.md) |
| **COMPLETE_GUIDE** | **This doc - everything** | **[COMPLETE_GUIDE.md](./COMPLETE_GUIDE.md)** |
| ARCHITECTURE | Technical architecture | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| PLATFORM_STATUS | Current state, API reference | [PLATFORM_STATUS.md](./PLATFORM_STATUS.md) |
| STARTUP_INSTRUCTIONS | Detailed startup guide | [STARTUP_INSTRUCTIONS.md](./STARTUP_INSTRUCTIONS.md) |
| MCP_SETUP | MCP configuration | [MCP_SETUP.md](./MCP_SETUP.md) |
| MCP_INTEGRATION_SUMMARY | MCP summary | [MCP_INTEGRATION_SUMMARY.md](./MCP_INTEGRATION_SUMMARY.md) |
| VPS_DEPLOYMENT | VPS deployment (15 servers) | [VPS_DEPLOYMENT.md](./VPS_DEPLOYMENT.md) |
| AUTOMATION_GUIDE | Automation & AI prompts | [AUTOMATION_GUIDE.md](./AUTOMATION_GUIDE.md) |

---

## 🏁 Заключение

Wallestars Control Center е **мощна платформа** за AI automation и computer control. С правилната документация, tools и automation, можете да:

✅ Control вашия computer с natural language  
✅ Automate Android devices  
✅ Deploy на множество VPS servers  
✅ Build AI-powered workflows  
✅ Scale и manage infrastructure  

**Платформата е ready за production и чака вашите идеи и contributions!**

---

*Този документ е централната comprehensive reference за Wallestars Platform.*  
*Last Updated: 2026-01-03*  
*Version: 1.0.0*  
*License: MIT*

**Built with ❤️ by Wallestars Team**

🌟 **Star us on GitHub!** 🌟
