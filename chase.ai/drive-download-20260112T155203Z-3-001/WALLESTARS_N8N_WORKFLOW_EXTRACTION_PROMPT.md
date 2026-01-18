# 🎯 УНИВЕРСАЛЕН ПРОМПТ ЗА ИЗВЛИЧАНЕ НА WALLESTARS n8n WORKFLOWS

> **Цел:** Този промпт да бъде даден на различни AI системи (Claude, ChatGPT, Cline, Cursor) за генериране на всичко свързано с n8n workflows за проекта Wallestars.

---

## 📋 ПРОМПТ (КОПИРАЙ И ИЗПРАТИ)

```
# ЗАДАЧА: Генериране на Wallestars n8n Workflow Система

## КОНТЕКСТ НА ПРОЕКТА

Работя по **Wallestars v2.2** - многоагентна AI система за автоматизация на бизнес верификация и картова регистрация в България. 

### Технически Stack:
- **n8n** (self-hosted на Hostinger VPS: srv1201204.hstgr.cloud)
- **Supabase** (PostgreSQL + pgvector + Edge Functions)
- **AI Orchestration** (Claude + OpenAI + Cline)
- **Redis** (MCP tools storage)
- **GitHub** (version control + webhooks)

### Ключови Бизнес Процеси:
1. **Registry Worker** - Извличане на български бизнес данни от CompanyBook API
2. **SMS Verification** - Мониторинг на smstome.com за OTP кодове
3. **Email Integration** - Hostinger IMAP + 33mail aliases
4. **Wallester Registration** - Автоматизирана регистрация за бизнес карти

---

## ИСКАНЕ

Генерирай **пълна n8n workflow система** за следните компоненти:

### 1. 🔄 MCP Server Workflow
n8n workflow който работи като MCP server с операции:
- `addWorkflow` - Добавяне на workflow към tools
- `removeWorkflow` - Премахване
- `listWorkflows` - Списък на активни tools
- `searchWorkflows` - Търсене по keyword
- `executeWorkflow` - Изпълнение с параметри

**Изисквания:**
- Redis node за съхранение на `mcp_n8n_tools`
- AI Agent node с OpenAI Chat Model
- Simple Memory за conversation context
- Филтриране на workflows по `mcp` tag

### 2. 📊 Quality Scoring Workflow
Система за автоматична оценка на AI отговори:

**Scoring Formula:**
```
Final Score = (Relevance × 0.4) + (Confidence × 0.3) + (Completeness × 0.3) × 100
```

**Penalties:**
- Execution time > threshold → score × 0.95
- Tokens > limit → score × 0.90

**Workflow Logic:**
1. Webhook trigger (приема AI response)
2. Code node за изчисляване на scores
3. IF node: score < 75 → retry с различен подход
4. Supabase insert на резултатите
5. Slack/Telegram notification при нисък score

### 3. 📧 Email Monitor Workflow
Мониторинг на Hostinger IMAP за verification codes:

**Connection Details:**
- IMAP: imap.hostinger.com:993 (SSL)
- SMTP: smtp.hostinger.com:465 (SSL)
- Pattern: `{business_name}@madoff.33mail.com` → forwards to Hostinger

**Workflow:**
1. Schedule Trigger (every 5 min)
2. IMAP node: Check for new emails
3. Code node: Extract verification code (regex: `/\b\d{4,6}\b/`)
4. Supabase update: `email_confirmation_code`, `email_confirmation_received_at`
5. Telegram notification: "✅ Code received for {business_name}"

### 4. 📱 SMS Monitor Workflow
Мониторинг на smstome.com за SMS codes:

**Phone Pool:**
- Finnish numbers: +3584573999024 to +3584573999015
- Table: `sms_numbers_pool` (phone_number, sms_url, status, assigned_to)

**Workflow:**
1. Schedule Trigger (every 2 min)
2. HTTP Request: Scrape assigned phone pages
3. Code node: Parse SMS text, extract OTP
4. Supabase update: `last_verification_code`, `last_message_at`
5. IF node: New code detected → trigger next step in registration

### 5. 🏢 CompanyBook Data Enrichment Workflow
Обогатяване на бизнес профили с данни от API:

**API Endpoints:**
- `/api/people/search?name={name}` - Търсене на лица
- `/api/people/{indent}?with_data=true` - Детайли за лице
- `/api/companies/{uic}?with_data=true` - Детайли за компания
- `/api/relationships/{identifier}?type=ownership&depth=2` - Собственост

**Data to Extract:**
- `business_name_en` (от companyNameTransliteration.name)
- `eik`, `vat_number` (BG + eik)
- `owner_first_name_en`, `owner_last_name_en`
- `owner_birthdate`, `owner_ident`
- `street_en`, `city_en`, `region_en`, `postal_code`

**Workflow:**
1. Webhook trigger (profile_id)
2. HTTP Request → CompanyBook API
3. Code node: Parse Bulgarian address format
4. Code node: Transliterate owner name
5. Supabase upsert: `verified_business_profiles`

### 6. 🧠 Knowledge Indexer Workflow
Автоматично индексиране на документи в vector DB:

**On GitHub Commit:**
1. Webhook trigger (push event)
2. Filter: Only `.md`, `.json` files in `docs/`, `n8n_workflows/`
3. HTTP Request: Get file content
4. OpenAI Embeddings: `text-embedding-3-large`
5. Supabase insert: `project_knowledge` table

**Schema:**
```sql
project_knowledge (
  id UUID,
  repo_org TEXT,
  repo_name TEXT,
  file_path TEXT,
  content TEXT,
  embedding VECTOR(1536),
  source_type TEXT, -- 'docs', 'workflow', 'code'
  updated_at TIMESTAMPTZ
)
```

### 7. 🤖 Multi-Agent Orchestrator Workflow
Координация на 3-5 паралелни AI сесии:

**Agent Pool:**
- Session 1: Claude (coordinator) - task decomposition
- Session 2-3: Cline (executor) - code execution
- Session 4: Airtop (browser) - web automation
- Session 5: Claude (reviewer) - quality review

**Task Routing Logic:**
```javascript
function selectAgents(task) {
  const complexity = analyzeComplexity(task);
  if (complexity.score < 30) return [{ agent: 'claude', sessions: 1 }];
  if (complexity.score < 70) return [
    { agent: 'claude', role: 'coordinator', sessions: 1 },
    { agent: 'cline', role: 'executor', sessions: 2 }
  ];
  return [/* full 5-session pool */];
}
```

**Workflow:**
1. Telegram Bot trigger (user command)
2. Code node: Analyze complexity, select agents
3. Split In Batches: Create parallel executions
4. Wait node: Gather all results
5. Code node: Aggregate + calculate quality scores
6. IF: score < 75 → retry loop
7. Supabase: Store final result
8. Telegram: Send response

### 8. 📈 System Health Monitor Workflow
Мониторинг на инфраструктурата:

**Checks:**
- Supabase: `SELECT * FROM system_health`
- VPS: Docker containers status
- n8n: Active workflows count
- Redis: MCP tools availability

**Alerts (Telegram):**
- ⚠️ Items without embeddings > 10
- ⚠️ No new items in 24 hours
- ⚠️ Last sync > 6 hours ago

**Schedule:** Every 1 hour

---

## ФОРМАТ НА ИЗХОДА

За всеки workflow генерирай:

### A. JSON Export
Пълен n8n workflow JSON, готов за import:
```json
{
  "name": "Workflow Name",
  "nodes": [...],
  "connections": {...},
  "settings": {...}
}
```

### B. Документация (Markdown)
- **Цел:** Какво прави workflow-а
- **Trigger:** Как се стартира
- **Nodes:** Списък на всички nodes
- **Credentials needed:** Какви credentials трябват
- **Environment variables:** Required env vars
- **Testing:** Как да се тества

### C. Supabase Migrations
SQL за необходимите таблици и функции

### D. Setup Script
Bash script за автоматизиран deploy:
```bash
#!/bin/bash
# import-workflows.sh
```

---

## ПРИОРИТЕТ НА WORKFLOWS

1. **CRITICAL:** Quality Scoring + Email/SMS Monitor
2. **HIGH:** CompanyBook Enrichment + MCP Server
3. **MEDIUM:** Knowledge Indexer + Multi-Agent Orchestrator
4. **LOW:** System Health Monitor

---

## ДОПЪЛНИТЕЛНИ ИЗИСКВАНИЯ

- Всички workflows да са с `mcp` tag за лесно филтриране
- Error handling с Telegram notifications
- Logging в Supabase `workflow_logs` table
- Retry logic за HTTP requests (max 3 attempts)
- Webhook secret validation (`x-webhook-secret: wallestars-secret-123`)

---

## РЕФЕРЕНЦИИ

- VPS: srv1201204.hstgr.cloud (72.61.154.188)
- n8n URL: https://n8n.srv1201204.hstgr.cloud
- Supabase Project: ansiaiuaygcfztabtknl
- GitHub: Wallesters-org/Wallestars, kirkomrk2-web/registry-stagehand-worker
```

---

## 🚀 КАК ДА ИЗПОЛЗВАШ ТОЗИ ПРОМПТ

### За Claude (claude.ai):
1. Копирай целия промпт от секцията по-горе
2. Paste в нов chat
3. Claude ще генерира детайлни JSON workflows

### За ChatGPT:
1. Същият промпт
2. Ако е твърде дълъг, раздели по секции (по един workflow наведнъж)

### За Cline/Cursor:
1. Използвай промпта като task description
2. Добави: "Create these as files in `/n8n_workflows/` directory"

### За n8n AI Agent:
1. Използвай като system prompt за AI Agent node
2. User input: "Generate {workflow_name} workflow"

---

## 📁 ОЧАКВАН ИЗХОД

```
n8n_workflows/
├── mcp-server.json
├── quality-scoring.json
├── email-monitor.json
├── sms-monitor.json
├── companybook-enrichment.json
├── knowledge-indexer.json
├── multi-agent-orchestrator.json
├── system-health-monitor.json
├── README.md
└── setup/
    ├── import-workflows.sh
    ├── migrations.sql
    └── credentials-template.json
```

---

## ⚠️ ВАЖНИ БЕЛЕЖКИ

1. **Security:** Никога не commit-вай credentials в repo
2. **Testing:** Тествай всеки workflow в sandbox преди production
3. **Monitoring:** Следи execution logs за errors
4. **Versioning:** Запазвай JSON exports при всяка промяна

---

**Създаден:** 2026-01-11
**Версия:** 1.0
**Автор:** Wallestars Team
