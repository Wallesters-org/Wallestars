# 📊 Wallestars Repository Analysis & Export

## Дата на анализ / Analysis Date
**Generated:** 2026-01-04

---

## 🎯 Обобщение / Executive Summary

**Wallestars Control Center** е професионална платформа за автоматизация на Claude AI на Linux и Android, с красив интерфейс за реално време визуализация. Репозиторито съдържа пълна екосистема от чат агенти, MCP интеграция, компютърно управление и Android автоматизация.

**Wallestars Control Center** is a professional platform for Claude AI automation on Linux and Android with beautiful real-time visualization. The repository contains a complete ecosystem of chat agents, MCP integration, computer control, and Android automation.

---

## 📁 Структура на Репозиторито / Repository Structure

### Основни Компоненти / Main Components

```
Wallestars/
├── 📄 Documentation Files (9 MD files)
│   ├── ARCHITECTURE.md
│   ├── HOW_TO_USE_PROMPT_GENERATOR.md
│   ├── MCP_INTEGRATION_SUMMARY.md
│   ├── MCP_SETUP.md
│   ├── PROMPT_GENERATOR_DOCS.md
│   ├── QUICKSTART.md
│   └── README.md
│
├── ⚙️ Configuration Files
│   ├── .mcp.json (MCP Server Configuration)
│   ├── .env.example (Environment Template)
│   ├── claude_desktop_config.json.example
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── 🖥️ Backend Server (server/)
│   ├── index.js (Main Server Entry)
│   ├── routes/
│   │   ├── claude.js (Claude AI API Routes)
│   │   ├── computerUse.js (Linux Desktop Control)
│   │   └── android.js (Android Device Control)
│   └── socket/
│       └── handlers.js (WebSocket Real-time Handlers)
│
├── 🎨 Frontend Application (src/)
│   ├── App.jsx (Main Application)
│   ├── main.jsx (Entry Point)
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   └── PlatformLinks.jsx
│   ├── context/
│   │   └── SocketContext.jsx (WebSocket State Management)
│   └── pages/
│       ├── Dashboard.jsx
│       ├── ClaudeChat.jsx
│       ├── ComputerControl.jsx
│       ├── AndroidControl.jsx
│       ├── PromptGenerator.jsx
│       └── Settings.jsx
│
├── 📝 Prompt Templates (prompts/)
│   ├── spark-app-generator-prompt.md (English)
│   └── spark-app-generator-prompt-bg.md (Bulgarian)
│
├── 🚀 Setup Scripts
│   ├── setup-mcp.sh (Linux/Mac Setup)
│   └── setup-mcp.ps1 (Windows PowerShell Setup)
│
└── 🔧 DevContainer & CI/CD
    ├── .devcontainer/devcontainer.json
    └── .github/workflows/azure-webapps-node.yml
```

---

## 🌿 Клонове / Branches

### Активни Клонове / Active Branches

| Branch Name | Purpose | Status |
|-------------|---------|--------|
| `copilot/analyze-and-export-repository` | Repository analysis and export feature | Current |
| `main` (implied) | Main production branch | Stable |

### История на Клонове / Branch History

- **copilot/analyze-and-export-repository** - Създаден за автоматичен анализ и експорт на репозиторито
- Previous branch: **copilot/generate-prompt-for-ai-chat** - PR #45 (merged)

---

## 💬 Чат Система / Chat System

### Claude AI Chat Agent

**Файл:** `server/routes/claude.js`

#### Възможности / Capabilities

1. **Chat Interface** - Разговорен интерфейс с Claude Sonnet 4.5
   - Endpoint: `POST /api/claude/chat`
   - Conversation history management
   - Max tokens: 4096

2. **Computer Use** - AI-управлявана автоматизация на десктоп
   - Endpoint: `POST /api/claude/computer-use`
   - Vision-based screenshot analysis
   - Action planning (click, type, key)

3. **Capabilities Query** - Запитване за възможности на модела
   - Endpoint: `GET /api/claude/capabilities`
   - Returns available models and features

#### Модели / Models

```javascript
Models Supported:
- claude-sonnet-4-5-20250929 (Latest)
  - Capabilities: chat, computer-use, vision, coding

- claude-opus-4-5-20251101 (Advanced)
  - Capabilities: chat, computer-use, vision, coding, advanced-reasoning
```

#### Conversation History Storage

Conversation history is managed in memory per request:
```javascript
conversationHistory: [
  { role: 'user', content: message },
  { role: 'assistant', content: response }
]
```

---

## 🤖 Агентски Сесии / Agent Sessions

### WebSocket Session Management

**Файл:** `server/socket/handlers.js`

#### Active Session Tracking

```javascript
activeStreams = Map {
  [socketId]: intervalHandle,         // Screen streaming
  ['metrics-' + socketId]: interval   // Metrics streaming
}
```

#### Session Types

1. **Screen Streaming Sessions**
   - Event: `start-screen-stream`
   - Configurable interval (default: 1000ms)
   - Real-time screenshot delivery via `screen-frame` event
   - Automatic cleanup on disconnect

2. **Metrics Sessions**
   - Event: `start-metrics`
   - Interval: 5000ms (default)
   - Provides: memory usage, uptime
   - Emit via: `metrics-update`

3. **Action Logging Sessions**
   - Event: `action-log`
   - Broadcast to all clients via `action-broadcast`
   - Includes: socketId, timestamp, action data

#### Session Lifecycle

```
Client Connect → Socket ID Assigned
    ↓
Start Stream/Metrics → Active Stream Created
    ↓
Real-time Data Flow → Continuous Updates
    ↓
Stop Stream/Disconnect → Cleanup & Remove from Map
```

### Frontend Session Context

**Файл:** `src/context/SocketContext.jsx`

- Maintains socket connection state
- Stores last 100 action logs
- Provides React hooks: `useSocket()`
- Auto-reconnection with 5 attempts

---

## 🔌 MCP (Model Context Protocol) Конфигурация

### Server Configuration

**Файл:** `.mcp.json`

```json
{
  "mcpServers": {
    "wallestars-control": {
      "command": "node",
      "args": ["server/index.js"],
      "env": {
        "ANTHROPIC_API_KEY": "${ANTHROPIC_API_KEY}",
        "PORT": "3000",
        "NODE_ENV": "production",
        "ENABLE_COMPUTER_USE": "true",
        "ENABLE_ANDROID": "false",
        "SCREENSHOT_INTERVAL": "2000",
        "ADB_HOST": "localhost",
        "ADB_PORT": "5037",
        "WS_PORT": "3001"
      }
    }
  }
}
```

### MCP Integration Points

1. **Claude Desktop Integration**
   - Configuration: `claude_desktop_config.json.example`
   - Communication: JSON-RPC over stdio
   - Tool invocation support

2. **Available Tools/Capabilities**
   - Computer use (screenshot, click, type, key)
   - Android control (via ADB)
   - System information queries
   - Safe command execution

---

## 🛣️ API Routes / Маршрути

### 1. Health Check
```
GET /api/health
Response: Service status, timestamp, enabled features
```

### 2. Claude AI Routes (`/api/claude/*`)

| Method | Endpoint | Purpose | Input | Output |
|--------|----------|---------|-------|--------|
| POST | `/chat` | Chat with Claude | `{ message, conversationHistory }` | `{ response, usage, conversationHistory }` |
| POST | `/computer-use` | AI automation | `{ task, screenshot }` | `{ action, explanation }` |
| GET | `/capabilities` | Model info | - | `{ models, features }` |

### 3. Computer Use Routes (`/api/computer/*`)

**Файл:** `server/routes/computerUse.js`

| Method | Endpoint | Purpose | Parameters |
|--------|----------|---------|------------|
| GET | `/screenshot` | Desktop screenshot | - |
| POST | `/click` | Mouse click | `{ x, y, button }` |
| POST | `/type` | Keyboard input | `{ text }` |
| POST | `/key` | Key press | `{ key }` |
| GET | `/info` | System info | - |
| POST | `/execute` | Safe commands | `{ command }` |

### 4. Android Routes (`/api/android/*`)

**Файл:** `server/routes/android.js`

| Method | Endpoint | Purpose | Parameters |
|--------|----------|---------|------------|
| GET | `/devices` | List devices | - |
| POST | `/screenshot` | Device screen | `{ deviceId }` |
| POST | `/tap` | Touch event | `{ deviceId, x, y }` |
| POST | `/type` | Text input | `{ deviceId, text }` |
| POST | `/key` | Hardware button | `{ deviceId, key }` |
| GET | `/info` | Device info | `{ deviceId }` |
| POST | `/install` | Install APK | `{ deviceId, apkPath }` |

---

## 🎨 UI Компоненти / UI Components

### Pages (src/pages/)

1. **Dashboard.jsx** - Главно табло с метрики и логове
2. **ClaudeChat.jsx** - Чат интерфейс с Claude AI
3. **ComputerControl.jsx** - Linux десктоп контрол с екранен поток
4. **AndroidControl.jsx** - Android устройство автоматизация
5. **PromptGenerator.jsx** - Генератор на промпти за Spark apps
6. **Settings.jsx** - Настройки на системата

### Components (src/components/)

1. **Header.jsx** - Горен навигационен бар
2. **Sidebar.jsx** - Странична навигация с икони
3. **PlatformLinks.jsx** - Бързи линкове към платформи

### Context Providers

1. **SocketContext.jsx** - WebSocket state management
   - Connection status
   - Screen streaming
   - Action logs
   - Real-time updates

---

## 📦 Зависимости / Dependencies

### Backend Dependencies

```json
{
  "@anthropic-ai/sdk": "^0.30.1",
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "dotenv": "^16.4.1",
  "axios": "^1.6.5",
  "screenshot-desktop": "^1.15.0",
  "socket.io": "^4.6.1",
  "socket.io-client": "^4.6.1"
}
```

### Frontend Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "framer-motion": "^11.0.3",
  "lucide-react": "^0.312.0",
  "tailwindcss": "^3.4.1",
  "vite": "^5.0.11"
}
```

---

## 🔐 Конфигурация на Околната Среда / Environment Configuration

### Required Environment Variables

```bash
# Core Configuration
ANTHROPIC_API_KEY=sk-ant-your-key-here
PORT=3000
NODE_ENV=development

# Feature Flags
ENABLE_COMPUTER_USE=true
ENABLE_ANDROID=true

# Computer Use Settings
SCREENSHOT_INTERVAL=2000

# Android Settings
ADB_HOST=localhost
ADB_PORT=5037

# WebSocket
WS_PORT=3001

# Frontend (Production)
FRONTEND_URL=https://your-domain.com
```

---

## 📊 Git История / Git History

### Recent Commits

```
0303240 - 2026-01-04 - Initial plan
a9aa065 - 2026-01-03 - Merge pull request #45 from Wallesters-org/copilot/generate-prompt-for-ai-chat
```

### Repository Information

- **Organization:** Wallesters-org
- **Repository:** Wallestars
- **Remote:** https://github.com/Wallesters-org/Wallestars
- **Current Branch:** copilot/analyze-and-export-repository

---

## 🚀 Deployment & CI/CD

### GitHub Actions Workflow

**Файл:** `.github/workflows/azure-webapps-node.yml`

- Azure Web Apps deployment
- Node.js application build
- Automated deployment pipeline

### Development Commands

```bash
# Development
npm run dev          # Start both server and client
npm run server       # Backend only
npm run client       # Frontend only

# Production
npm run build        # Build for production
npm start           # Start production server

# Testing
npm test            # Run tests
```

---

## 🛡️ Сигурност / Security Considerations

### Implemented Security Measures

1. **API Key Protection**
   - Environment variables
   - No hardcoded keys
   - .env in .gitignore

2. **Command Execution Safety**
   - Whitelisted commands only
   - Input sanitization
   - No arbitrary shell access

3. **Network Security**
   - Server binds to localhost (127.0.0.1)
   - CORS configured for local frontend
   - No external exposure by default

4. **ADB Security**
   - Trusted devices only
   - Device authorization required
   - Development environment restricted

5. **Screenshot Privacy**
   - Temporary storage
   - Automatic cleanup
   - No persistent logging

---

## 📈 Performance Metrics

### Operation Latencies

| Operation | Typical Latency | Notes |
|-----------|----------------|-------|
| Screenshot | ~100ms | Depends on resolution |
| Mouse click | ~50ms | xdotool execution |
| Keyboard input | ~10ms/char | Typing speed |
| ADB screenshot | ~500ms | Device connection |
| Claude API call | 2-5s | Network + inference |
| Health check | ~1ms | Simple status |

### Scalability Limits

- **Concurrent Requests:** Node.js event loop limited
- **Screenshot Rate:** Configurable via `SCREENSHOT_INTERVAL`
- **Android Devices:** Multiple via device ID
- **Claude API:** Subject to Anthropic rate limits

---

## 🔮 Функционални Възможности / Feature Capabilities

### 1. Claude AI Integration
- ✅ Chat with Claude Sonnet 4.5
- ✅ Computer Use API
- ✅ Vision capabilities
- ✅ Conversation history

### 2. Linux Computer Control
- ✅ Real-time screen streaming
- ✅ Mouse control (click, drag)
- ✅ Keyboard input (type, keys)
- ✅ System information
- ✅ Safe command execution

### 3. Android Device Control
- ✅ ADB integration
- ✅ Screenshot capture
- ✅ Touch simulation
- ✅ Text input
- ✅ Navigation buttons
- ✅ Device information

### 4. Prompt Generator
- ✅ Spark app prompts
- ✅ Bilingual support (EN/BG)
- ✅ Copy to clipboard
- ✅ Download as markdown

### 5. Real-time Features
- ✅ WebSocket communication
- ✅ Live screen streaming
- ✅ System metrics monitoring
- ✅ Action logging

---

## 📝 Промпт Шаблони / Prompt Templates

### Available Templates

1. **spark-app-generator-prompt.md** (English)
   - Comprehensive Spark app generation
   - UI/UX specifications
   - Technical requirements

2. **spark-app-generator-prompt-bg.md** (Bulgarian)
   - Same as above in Bulgarian
   - Localized for BG users

---

## 🔄 WebSocket Event Flow

### Client → Server Events

```javascript
// Screen Streaming
'start-screen-stream' { interval: 1000 }
'stop-screen-stream'

// Metrics
'start-metrics' { interval: 5000 }
'stop-metrics'

// Actions
'action-log' { type, data, timestamp }
```

### Server → Client Events

```javascript
// Screen Streaming
'screen-frame' { screenshot, timestamp }
'screen-error' { error }
'stream-started' { interval }
'stream-stopped'

// Metrics
'metrics-update' { memory, uptime, timestamp }

// Actions
'action-broadcast' { ...data, socketId, timestamp }
```

---

## 📚 Документация / Documentation Files

### Complete Documentation Set

1. **README.md** - Main project overview and quick start
2. **ARCHITECTURE.md** - MCP architecture and system design
3. **MCP_SETUP.md** - Detailed MCP setup instructions
4. **MCP_INTEGRATION_SUMMARY.md** - MCP integration summary
5. **QUICKSTART.md** - Quick start guide
6. **PROMPT_GENERATOR_DOCS.md** - Prompt generator documentation
7. **HOW_TO_USE_PROMPT_GENERATOR.md** - Prompt generator usage guide

---

## 🎯 Заключение / Conclusion

**Wallestars Control Center** представлява пълнофункционална екосистема за AI автоматизация с:

- ✅ Модерна React архитектура
- ✅ Real-time WebSocket комуникация
- ✅ Claude AI интеграция (Sonnet 4.5)
- ✅ MCP (Model Context Protocol) поддръжка
- ✅ Linux десктоп контрол
- ✅ Android устройство автоматизация
- ✅ Професионален UI с Tailwind CSS
- ✅ Comprehensive документация

Репозиторито е добре структурирано, документирано и готово за производство с множество функционални възможности за AI-управлявана автоматизация.

---

**Анализирано от:** Wallestars Repository Analyzer  
**Версия:** 1.0  
**Дата:** 2026-01-04
