# 🔗 WALLESTARS NEXUS - UNIFIED INTEGRATION MAP
## Интеграция на Wallestars + Registry-Stagehand-Worker + MCP SuperAssistant

**Дата**: 2026-01-11 01:00  
**Agent**: Antigravity AI  
**Версия**: 1.0.0

---

## 📊 ОБЗОР НА СИСТЕМИТЕ

### 1. Wallestars Control Center
**Описание**: Платформа за Claude AI автоматизация на Linux и Android
**Repo**: https://github.com/Wallesters-org/Wallestars
**Stack**: React, Express, Socket.io, Anthropic Claude API

### 2. Registry-Stagehand-Worker
**Описание**: Bulgarian Business Verification System с CompanyBook API
**Repo**: https://github.com/kirkomrk2-web/registry-stagehand-worker
**Stack**: Stagehand (BrowserBase), Supabase, Node.js

### 3. MCP SuperAssistant
**Описание**: MCP Proxy за свързване на AI асистенти
**Проблем**: SSE връзка не работи на `http://localhost:3006/sse`
**Решение**: Виж секция "MCP Integration Fix"

---

## 🏗️ АРХИТЕКТУРНА КАРТА

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                        WALLESTARS NEXUS ARCHITECTURE                       ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║    ┌─────────────────────────────────────────────────────────────────┐     ║
║    │                    FRONTEND LAYER (React)                       │     ║
║    │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │     ║
║    │  │Dashboard │ │ClaudeChat│ │ Settings │ │ Business Verify  │   │     ║
║    │  │          │ │          │ │          │ │ (NEW from RSW)   │   │     ║
║    │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────────┬─────────┘   │     ║
║    └───────┼────────────┼────────────┼─────────────────┼────────────┘     ║
║            │            │            │                 │                   ║
║            ▼            ▼            ▼                 ▼                   ║
║    ┌─────────────────────────────────────────────────────────────────┐     ║
║    │                    API LAYER (Express.js)                        │     ║
║    │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │     ║
║    │  │/api/claude│ │/api/computer│ │/api/android│ │/api/registry │   │     ║
║    │  │          │ │            │ │           │ │ (NEW)          │   │     ║
║    │  └────┬─────┘ └─────┬──────┘ └─────┬─────┘ └────────┬───────┘   │     ║
║    └───────┼─────────────┼──────────────┼─────────────────┼──────────┘     ║
║            │             │              │                 │                 ║
║            ▼             ▼              ▼                 ▼                 ║
║    ┌───────────────────────────────────────────────────────────────────┐   ║
║    │                     INTEGRATION LAYER                              │   ║
║    │                                                                    │   ║
║    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐   │   ║
║    │  │ Anthropic   │  │   n8n VPS   │  │    Stagehand + BBase   │   │   ║
║    │  │ Claude API  │  │  Workflows  │  │   (Business Registry)   │   │   ║
║    │  └──────┬──────┘  └──────┬──────┘  └───────────┬──────────────┘   │   ║
║    │         │                │                     │                  │   ║
║    │         ▼                ▼                     ▼                  │   ║
║    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐   │   ║
║    │  │  Computer   │  │  Supabase   │  │     CompanyBook API    │   │   ║
║    │  │  Use API    │  │  Database   │  │   (External Bulgarian)  │   │   ║
║    │  └─────────────┘  └─────────────┘  └─────────────────────────┘   │   ║
║    │                                                                    │   ║
║    └────────────────────────────────────────────────────────────────────┘   ║
║                                                                            ║
║    ┌─────────────────────────────────────────────────────────────────┐     ║
║    │                     MCP PROTOCOL LAYER                          │     ║
║    │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │     ║
║    │  │Claude Desktop│  │MCP Superasst │  │   AI Agents Pool     │  │     ║
║    │  │   (stdio)    │  │  (SSE/HTTP)  │  │  (Antigravity etc.)  │  │     ║
║    │  └──────────────┘  └──────────────┘  └──────────────────────┘  │     ║
║    └─────────────────────────────────────────────────────────────────┘     ║
║                                                                            ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## 🔴 КЛЮЧОВИ КОМПОНЕНТИ ОТ REGISTRY-STAGEHAND-WORKER ЗА ИНТЕГРИРАНЕ

### 1. Stagehand Browser Automation 🌐
**Файл**: `worker.mjs`
**Какво прави**: Автоматизирано търсене в Bulgarian Business Registry
**Ползи за Wallestars**:
- Добавя Business Verification функционалност
- Интегрира се с Computer Use API
- Автоматизира KYC процеси

```javascript
// Ключов код за интеграция
import { Stagehand } from "@browserbasehq/stagehand";

const stagehand = new Stagehand({
  env: "BROWSERBASE", // или "LOCAL" за Wallestars
});

await stagehand.init();
```

### 2. CompanyBook Proxy 🔌
**Файл**: `server/companybook_proxy.mjs`
**Какво прави**: CORS proxy за CompanyBook API
**Endpoints**:
- `/person-search?name=` - Търсене на лица
- `/person/:indent` - Детайли за лице
- `/company/:uic` - Детайли за компания
- `/relationships/:identifier` - Връзки между субекти

### 3. Supabase Integration 💾
**Таблици**:
- `users_pending` - Опашка за проверка
- `user_registry_checks` - Резултати от проверки

---

## 🟡 MCP SUPERASSISTANT INTEGRATION FIX

### Проблем
```
Грешка SSE: Неуспешно изтегляне
URI: http://localhost:3006/sse
```

### Решение 1: Стартирай MCP Proxy
```bash
npx @srbhptl39/mcp-superassistant-proxy@latest \
  --config ./config.json \
  --outputTransport sse
```

### Решение 2: config.json за Wallestars
```json
{
  "mcpServers": {
    "wallestars": {
      "command": "node",
      "args": ["/home/administrator/Documents/Cline/MCP/Wallestars/server/index.js"],
      "env": {
        "ANTHROPIC_API_KEY": "${ANTHROPIC_API_KEY}",
        "PORT": "3000"
      }
    },
    "registry-worker": {
      "command": "node",
      "args": ["/path/to/registry-stagehand-worker/worker.mjs"],
      "env": {
        "SUPABASE_URL": "${SUPABASE_URL}",
        "SUPABASE_SERVICE_ROLE_KEY": "${SUPABASE_SERVICE_ROLE_KEY}",
        "BROWSERBASE_API_KEY": "${BROWSERBASE_API_KEY}"
      }
    }
  }
}
```

### Решение 3: Wallestars като SSE endpoint
Добави в `server/index.js`:
```javascript
import { EventSource } from 'eventsource';

// SSE endpoint за MCP SuperAssistant
app.get('/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  res.write('data: {"status": "connected"}\n\n');
  
  // Keep-alive ping
  const interval = setInterval(() => {
    res.write('data: {"ping": true}\n\n');
  }, 30000);
  
  req.on('close', () => clearInterval(interval));
});
```

---

## 🟢 НОВИ ФУНКЦИОНАЛНОСТИ ЗА ДОБАВЯНЕ

### Phase 1: Registry Integration (Priority: HIGH)

| # | Функция | Описание | Файлове |
|---|---------|----------|---------|
| 1 | Business Verify Page | Нова страница за проверка на фирми | `src/pages/BusinessVerify.jsx` |
| 2 | Registry API Route | Backend за registry проверки | `server/routes/registry.js` |
| 3 | CompanyBook Proxy | Интегриран proxy | `server/services/companybook.js` |
| 4 | Stagehand Service | Browser automation | `server/services/stagehand.js` |

### Phase 2: MCP Enhancement (Priority: MEDIUM)

| # | Функция | Описание | Файлове |
|---|---------|----------|---------|
| 5 | SSE Endpoint | MCP SuperAssistant support | `server/routes/sse.js` |
| 6 | Tool Registry | MCP tools registration | `server/mcp/tools.js` |
| 7 | Multi-Agent Support | Координация между агенти | `server/agents/coordinator.js` |

### Phase 3: Supabase Integration (Priority: MEDIUM)

| # | Функция | Описание | Файлове |
|---|---------|----------|---------|
| 8 | Supabase Client | DB connection | `server/db/supabase.js` |
| 9 | Users Table | User management | `supabase/migrations/` |
| 10 | Registry Checks | Check history | `supabase/migrations/` |

---

## 📈 MASTER PLAN TIMELINE

### Week 1: Foundation
```
Day 1-2: Registry Integration
├── Add BusinessVerify page
├── Create registry API route
└── Port CompanyBook proxy

Day 3-4: Stagehand Setup
├── Install @browserbasehq/stagehand
├── Create stagehand service
└── Test browser automation

Day 5-7: Testing & Polish
├── Write tests for new features
├── Update documentation
└── CI/CD for new services
```

### Week 2: MCP & Supabase
```
Day 8-9: MCP SuperAssistant Fix
├── Add SSE endpoint
├── Configure MCP proxy
└── Test with browser extension

Day 10-11: Supabase Integration
├── Setup Supabase project
├── Create migrations
└── Connect to Wallestars

Day 12-14: Multi-Agent Coordination
├── Agent coordinator service
├── Task queue system
└── Status dashboard
```

---

## 🔧 IMMEDIATE ACTIONS

### За MCP SuperAssistant Fix:

```bash
# 1. Инсталирай MCP proxy
cd /home/administrator/Documents/Cline/MCP/Wallestars
npm install eventsource --save

# 2. Стартирай MCP proxy на port 3006
npx @srbhptl39/mcp-superassistant-proxy@latest \
  --port 3006 \
  --config ./mcp-proxy-config.json \
  --outputTransport sse

# 3. Или добави SSE endpoint директно в Wallestars
# (виж Решение 3 по-горе)
```

### За Registry Integration:

```bash
# 1. Инсталирай зависимости
npm install @browserbasehq/stagehand @supabase/supabase-js zod

# 2. Копирай worker logic
cp /path/to/registry-stagehand-worker/worker.mjs \
   server/services/registry-worker.js

# 3. Добави нов route
# Създай server/routes/registry.js
```

---

## 📊 СРАВНИТЕЛНА ТАБЛИЦА

| Функционалност | Wallestars | Registry-Stagehand | Combined |
|----------------|------------|-------------------|----------|
| Claude AI Chat | ✅ | ❌ | ✅ |
| Computer Use | ✅ | ❌ | ✅ |
| Android Control | ✅ | ❌ | ✅ |
| Browser Automation | ❌ | ✅ (Stagehand) | ✅ |
| Business Registry | ❌ | ✅ | ✅ |
| CompanyBook API | ❌ | ✅ | ✅ |
| Supabase DB | ❌ | ✅ | ✅ |
| MCP Server | ✅ | ❌ | ✅ |
| SSE Endpoint | ❌ | ❌ | ✅ (NEW) |
| Real-time UI | ✅ (Socket.io) | ❌ | ✅ |
| VPS Deploy | ✅ (Hostinger) | ✅ (Railway) | ✅ |

---

## 🎯 NEXT STEPS FOR GEMINI

Създай визуална диаграма за:

1. **System Integration Flow** - Как трите системи комуникират
2. **Data Flow Diagram** - Потока на данни от User → AI → Registry → DB
3. **Deployment Architecture** - VPS, Railway, Supabase инфраструктура
4. **MCP Protocol Map** - stdio, SSE, WebSocket connections

**Prompt за Gemini**:
```
Create a professional system architecture diagram showing:
- Wallestars Control Center (React + Express)
- Registry-Stagehand-Worker (Stagehand + Supabase)
- MCP SuperAssistant (SSE proxy)
- Hostinger VPS (n8n, PM2, Nginx)
- External APIs (Claude, CompanyBook, Supabase)

Use modern dark theme colors matching the Wallestars NEXUS design.
Include data flow arrows and protocol annotations.
```

---

**Статус**: Анализът е завършен. Готов за имплементация.
**Следваща стъпка**: Избери коя фаза искаш да започнем първо.
