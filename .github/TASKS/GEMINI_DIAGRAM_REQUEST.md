# 🎨 GEMINI VISUAL DIAGRAM REQUEST
## Wallestars NEXUS System Architecture

---

## 📋 PROMPT FOR GEMINI (Copy-Paste This)

```
Create a professional, modern system architecture diagram for "Wallestars NEXUS" with the following specifications:

## DESIGN STYLE:
- Dark theme with gradient background (#0f1729 to #1a1f2e)
- Accent colors: Cyan (#0ea5e9), Purple (#8b5cf6), Orange (#f97316)
- Glassmorphism effect on component boxes
- Clean lines with glow effects
- Modern tech aesthetic similar to Vercel/Linear design

## MAIN COMPONENTS TO INCLUDE:

### 1. FRONTEND LAYER (Top)
Box: "Wallestars Control Center (React 18)"
Sub-boxes:
- Dashboard
- Claude Chat  
- Computer Control
- Android Control
- Business Verify (NEW)
- Prompt Generator

### 2. API GATEWAY LAYER (Middle-Upper)
Box: "Express.js Backend + Socket.io"
Endpoints:
- /api/claude
- /api/computer
- /api/android
- /api/registry (NEW)
- /sse (MCP endpoint)

### 3. INTEGRATION SERVICES (Middle)
Three parallel boxes:
- "Anthropic Claude API" (with Sonnet 4.5 badge)
- "Stagehand Browser Automation" (BrowserBase)
- "n8n Workflow Engine" (VPS)

### 4. DATA LAYER (Middle-Lower)
Two boxes:
- "Supabase PostgreSQL"
  - users_pending
  - user_registry_checks
  - activity_logs
- "CompanyBook API"
  - /person-search
  - /company/:uic
  - /relationships

### 5. INFRASTRUCTURE LAYER (Bottom)
Three boxes:
- "Hostinger VPS" (srv1201204.hstgr.cloud)
  - PM2 Process Manager
  - Nginx Reverse Proxy
  - SSL/HTTPS
- "Railway" (Container Deploy)
- "Netlify" (Frontend CDN)

### 6. MCP PROTOCOL LAYER (Side panel)
Vertical stack:
- "Claude Desktop (stdio)"
- "MCP SuperAssistant (SSE)"
- "AI Agents Pool"
  - Antigravity
  - Copilot
  - Custom Agents

## DATA FLOW ARROWS:
1. User → Frontend → API Gateway (cyan arrows)
2. API Gateway → Claude API (purple arrow, bidirectional)
3. API Gateway → Stagehand → Registry Portal → CompanyBook (orange flow)
4. API Gateway → Supabase (data persistence arrows)
5. MCP Layer → API Gateway (dashed connection)

## ANNOTATIONS:
- WebSocket connections: use lightning bolt icon
- REST APIs: use standard HTTP method badges
- Real-time updates: use pulse/wave animation indicator

## SIZE & FORMAT:
- Landscape orientation
- 1920x1080 pixels recommended
- PNG or SVG output
- High contrast for presentations

## ADDITIONAL ELEMENTS:
- Small status indicators (green dots = active, orange = pending)
- Version badges (v1.0.0)
- Technology logos where appropriate
- Legend in bottom-right corner
```

---

## 🖼️ ALTERNATIVE: MERMAID DIAGRAM

```mermaid
graph TB
    subgraph Frontend["🖥️ Frontend Layer"]
        UI[Wallestars Control Center<br/>React 18 + Vite]
        UI --> D[Dashboard]
        UI --> CC[Claude Chat]
        UI --> PC[Computer Control]
        UI --> AC[Android Control]
        UI --> BV[Business Verify]
        UI --> PG[Prompt Generator]
    end

    subgraph API["⚡ API Gateway"]
        Express[Express.js + Socket.io]
        Express --> RouteC[/api/claude]
        Express --> RouteP[/api/computer]
        Express --> RouteA[/api/android]
        Express --> RouteR[/api/registry]
        Express --> SSE[/sse]
    end

    subgraph Integration["🔗 Integration Services"]
        Claude[Anthropic Claude API<br/>Sonnet 4.5]
        Stagehand[Stagehand<br/>BrowserBase]
        N8N[n8n Workflows<br/>VPS]
    end

    subgraph Data["💾 Data Layer"]
        Supabase[(Supabase<br/>PostgreSQL)]
        CompanyBook[CompanyBook API<br/>Bulgarian Registry]
    end

    subgraph Infra["☁️ Infrastructure"]
        VPS[Hostinger VPS<br/>PM2 + Nginx]
        Railway[Railway<br/>Container]
        Netlify[Netlify<br/>CDN]
    end

    subgraph MCP["🤖 MCP Protocol"]
        Desktop[Claude Desktop<br/>stdio]
        SuperAss[MCP SuperAssistant<br/>SSE]
        Agents[AI Agents Pool]
    end

    Frontend --> API
    API --> Integration
    Integration --> Data
    API --> Infra
    MCP -.-> API

    style Frontend fill:#0f1729,stroke:#0ea5e9
    style API fill:#1a1f2e,stroke:#8b5cf6
    style Integration fill:#0f1729,stroke:#f97316
    style Data fill:#1a1f2e,stroke:#22c55e
    style Infra fill:#0f1729,stroke:#6366f1
    style MCP fill:#1a1f2e,stroke:#ec4899
```

---

## 📊 ASCII DIAGRAM (Simple Version)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         WALLESTARS NEXUS                                 │
│                    System Architecture v1.0.0                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ╔═══════════════════════════════════════════════════════════════════╗  │
│  ║                    FRONTEND (React + Vite)                        ║  │
│  ╠══════════╦══════════╦══════════╦══════════╦═══════════╦══════════╣  │
│  ║Dashboard ║ Claude   ║ Computer ║ Android  ║ Business  ║ Prompt   ║  │
│  ║          ║ Chat     ║ Control  ║ Control  ║ Verify    ║ Generator║  │
│  ╚════╤═════╩════╤═════╩════╤═════╩════╤═════╩═════╤═════╩════╤═════╝  │
│       │          │          │          │           │          │         │
│       └──────────┴──────────┴────┬─────┴───────────┴──────────┘         │
│                                  │                                       │
│  ╔═══════════════════════════════▼═══════════════════════════════════╗  │
│  ║              API GATEWAY (Express.js + Socket.io)                  ║  │
│  ║  /api/claude  /api/computer  /api/android  /api/registry  /sse    ║  │
│  ╚═══════╤═══════════╤════════════════╤════════════════╤════════════╝  │
│          │           │                │                │                │
│    ┌─────▼─────┐ ┌───▼───┐    ┌──────▼───────┐  ┌─────▼─────┐          │
│    │ Anthropic │ │  n8n  │    │  Stagehand   │  │   MCP     │          │
│    │ Claude API│ │ VPS   │    │ BrowserBase  │  │SuperAssist│          │
│    └─────┬─────┘ └───┬───┘    └──────┬───────┘  └─────┬─────┘          │
│          │           │               │                │                 │
│    ┌─────▼───────────▼───────────────▼────────────────┘                │
│    │                                                                    │
│    │  ╔═════════════════════╗    ╔═════════════════════╗               │
│    │  ║    Supabase DB      ║    ║  CompanyBook API    ║               │
│    │  ║  - users_pending    ║    ║  - person-search    ║               │
│    │  ║  - registry_checks  ║    ║  - company/:uic     ║               │
│    │  ╚═════════════════════╝    ╚═════════════════════╝               │
│    │                                                                    │
│    └────────────────────────────────────────────────────────────────   │
│                                                                          │
│  ╔═══════════════════════════════════════════════════════════════════╗  │
│  ║                    INFRASTRUCTURE                                  ║  │
│  ╠══════════════════╦═══════════════════╦════════════════════════════╣  │
│  ║  Hostinger VPS   ║     Railway       ║        Netlify             ║  │
│  ║  PM2 + Nginx     ║   Container       ║      CDN + Build           ║  │
│  ╚══════════════════╩═══════════════════╩════════════════════════════╝  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 USAGE INSTRUCTIONS

1. **За Gemini AI Studio**:
   - Копирай prompt-а от секция "PROMPT FOR GEMINI"
   - Paste в Gemini с image generation enabled
   - Или използвай Google Slides + Gemini integration

2. **За Mermaid**:
   - Копирай Mermaid кода
   - Paste в https://mermaid.live
   - Export като SVG/PNG

3. **За ASCII**:
   - Директно използване в markdown документи
   - Terminal презентации

---

**Създадено от Antigravity AI**
**Дата**: 2026-01-11
