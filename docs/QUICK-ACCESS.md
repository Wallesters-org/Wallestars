# 🚀 QUICK ACCESS TO ALL RESOURCES

**Последна актуализация**: 2026-01-01  
**Статус**: Обединена структура - Eva Core + DJ Workflow + n8n Integration

---

## 📑 Съдържание

1. [Бърз Преглед](#бърз-преглед)
2. [Eva Core Ресурси](#eva-core-ресурси)
3. [DJ Workflow & n8n](#dj-workflow--n8n)
4. [Платформи](#платформи)
5. [Конфигурация](#конфигурация)
6. [Документация](#документация)
7. [Външни Връзки](#външни-връзки)

---

## 🎯 Бърз Преглед

### Главни Файлове
- 📖 **[README.md](../README.md)** - Главно ръководство на български
- 🗂️ **[PROJECT-STRUCTURE.md](./PROJECT-STRUCTURE.md)** - Архитектура
- 📋 **[TASK-TRACKING.md](./TASK-TRACKING.md)** - Roadmap и задачи
- 🇧🇬 **[FINAL-SUMMARY-BG.md](./FINAL-SUMMARY-BG.md)** - Резюме на български

### Setup Ръководства
- 🚀 **[GETTING-STARTED.md](./guides/GETTING-STARTED.md)** - Първи стъпки
- 🖥️ **[VPS Setup Guide](./vps-setup-guide.md)** - KVM2 VPS настройка
- 📖 **[n8n Integration Guide](./n8n-integration-guide.md)** - n8n + Claude AI

---

## 🧠 Eva Core Ресурси

### Документация
- 📘 **[EVA-DOCUMENTATION.md](../eva-core/docs/EVA-DOCUMENTATION.md)** - Пълна Eva документация (5,200+ думи)
- 📖 **[Eva README](../eva-core/README.md)** - Основно описание на Eva

### Конфигурация
- ⚙️ **[eva-config.template.json](../eva-core/config/eva-config.template.json)** - Config шаблон
- 📊 **[instagram-daily-example.json](../eva-core/workflows/instagram-daily-example.json)** - Примерен workflow

### Eva Основни Концепции
```
Eva = Context Processor + Decision Engine + Action Executor
```

**Характеристики**:
- 🧠 Анализира контекст от снимки/текст
- 🎭 Персонализира взаимодействията
- 📱 Управлява 10-15 социални профила
- 🔄 Интегрира се с n8n workflows
- 📊 Мониторинг и оптимизация

---

## 🔄 DJ Workflow & n8n

### n8n Workflows
- 🤖 **[user-contact-automation.json](../workflows/user-contact-automation.json)** - Автоматично отговаряне на GitHub issues
- 🔗 **[dj-workflow-multichain.json](../workflows/dj-workflow-multichain.json)** - Multi-chain deployment automation
- 📝 **[Workflow README](../workflows/README.md)** - Обяснение на workflows
- ⚙️ **[CONFIG.md](../workflows/CONFIG.md)** - Конфигурация на workflows

### Документация
- 📖 **[n8n Integration Guide](./n8n-integration-guide.md)** - Пълно ръководство за интеграция
- 🖥️ **[VPS Setup Guide](./vps-setup-guide.md)** - VPS KVM2 настройка
- 📊 **[Summary](./summary.md)** - Общ преглед на DJ Workflow

### Setup Scripts
- 🛠️ **[setup-n8n.sh](../scripts/setup-n8n.sh)** - Автоматичен n8n setup скрипт

### GitHub Actions
- ⚙️ **[n8n-sync.yml](../.github/workflows/n8n-sync.yml)** - Автоматична синхронизация на workflows

---

## 📦 Платформи

### 1. Website Builder
**Път**: `platforms/website-builder/README.md`  
**Описание**: Hostinger Horizon интеграция (10,800 думи)  
**Линк**: [README](../platforms/website-builder/README.md)

### 2. Telegram Messages
**Път**: `platforms/telegram-messages/README.md`  
**Описание**: Extraction & analysis с 5 features (9,000 думи)  
**Линк**: [README](../platforms/telegram-messages/README.md)

### 3. Task Automation Web
**Път**: `platforms/task-automation-web/README.md`  
**Описание**: AI-powered task management (6,600 думи)  
**Линк**: [README](../platforms/task-automation-web/README.md)

### 4. Free Trial Automation
**Път**: `platforms/free-trial-automation/README.md`  
**Описание**: 3-phase automation система (4,800 думи)  
**Линк**: [README](../platforms/free-trial-automation/README.md)

### 5. Phone Numbers
**Път**: `platforms/phone-numbers/README.md`  
**Описание**: Multi-number management (2,600 думи)  
**Линк**: [README](../platforms/phone-numbers/README.md)

### 6. VPS Monitor
**Път**: `platforms/vps-monitor/README.md`  
**Описание**: Real-time monitoring (2,300 думи)  
**Линк**: [README](../platforms/vps-monitor/README.md)

### 7. Email Processor
**Път**: `platforms/email-processor/README.md`  
**Описание**: Email extraction & processing (1,400 думи)  
**Линк**: [README](../platforms/email-processor/README.md)

---

## ⚙️ Конфигурация

### Environment Variables
**Файл**: [.env.example](../.env.example)

**Основни секции**:
```bash
# Database (Supabase)
SUPABASE_URL=
SUPABASE_KEY=

# AI Services
OPENAI_API_KEY=
CLAUDE_API_KEY=

# Social Media
INSTAGRAM_USERNAME=
TELEGRAM_API_ID=
TELEGRAM_API_HASH=

# n8n
N8N_BASIC_AUTH_USER=
N8N_BASIC_AUTH_PASSWORD=
N8N_HOST=

# Eva
REPORT_EMAIL=
```

### Package Configuration
**Файл**: [package.json](../package.json)

**Workspaces**:
- `eva-core`
- `platforms/*`
- `shared/*`

**Requirements**:
- Node.js >= 22.0.0
- npm >= 10.0.0

### Git Configuration
**Файл**: [.gitignore](../.gitignore)

**Игнорирани**:
- node_modules/
- .env файлове
- SSL certificates
- SSH keys
- secrets/

---

## 📚 Документация

### Структура и Навигация
- 🗂️ **[PROJECT-STRUCTURE.md](./PROJECT-STRUCTURE.md)** - Цялостна архитектура
- 🧭 **[NAVIGATION.md](./NAVIGATION.md)** - Навигационно ръководство
- 📑 **[INDEX.md](./INDEX.md)** - Пълен индекс
- 📖 **[STRUCTURE-SUMMARY.md](./STRUCTURE-SUMMARY.md)** - Кратко резюме

### Task Management
- 📋 **[TASK-TRACKING.md](./TASK-TRACKING.md)** - Roadmap и фази
- 🇧🇬 **[FINAL-SUMMARY-BG.md](./FINAL-SUMMARY-BG.md)** - Български резюме

### Guides
- 🚀 **[GETTING-STARTED.md](./guides/GETTING-STARTED.md)** - Complete setup guide
- 🖥️ **[VPS Setup Guide](./vps-setup-guide.md)** - VPS KVM2 configuration
- 📖 **[n8n Integration Guide](./n8n-integration-guide.md)** - n8n + Claude AI + GitHub

### Technical Docs
- 📘 **[EVA-DOCUMENTATION.md](../eva-core/docs/EVA-DOCUMENTATION.md)** - Eva архитектура
- 📊 **[Project Summary](./summary.md)** - DJ Workflow overview

### Shared Components
- 🔧 **[Integrations README](../shared/integrations/README.md)** - API интеграции
- 🛠️ **[Utils README](../shared/utils/README.md)** - Помощни функции

---

## 🔗 Външни Връзки

### AI Services
- **Claude AI**: https://docs.anthropic.com/
  - API Keys: https://console.anthropic.com/
  - AUP: https://www.anthropic.com/legal/aup
  - Team/Enterprise: https://support.claude.com/en/articles/11845131-using-claude-code-with-your-team-or-enterprise-plan

- **OpenAI**: https://platform.openai.com/docs

### Automation Tools
- **n8n Documentation**: https://docs.n8n.io/
- **n8n Community**: https://community.n8n.io/

### Database & Backend
- **Supabase**: https://supabase.io/docs
- **PostgreSQL**: https://www.postgresql.org/docs/

### Hosting & Infrastructure
- **Hostinger VPS**: https://www.hostinger.com/vps-hosting
- **Hostinger Horizon**: https://www.hostinger.com/horizon
- **Ubuntu Server**: https://ubuntu.com/server/docs

### Development Tools
- **GitHub Actions**: https://docs.github.com/en/actions
- **Node.js**: https://nodejs.org/docs/
- **npm Workspaces**: https://docs.npmjs.com/cli/v7/using-npm/workspaces

### Social Media APIs
- **Instagram Graph API**: https://developers.facebook.com/docs/instagram-api
- **Telegram Bot API**: https://core.telegram.org/bots/api
- **YouTube Data API**: https://developers.google.com/youtube/v3

---

## 🎯 Често Използвани Команди

### Setup
```bash
# Clone repo
git clone https://github.com/Wallesters-org/Wallestars.git
cd Wallestars

# Install dependencies
npm install

# Configure environment
cp .env.example .env
```

### n8n
```bash
# Install n8n globally
npm install -g n8n

# Start n8n
n8n start

# Docker alternative
docker run -d --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n
```

### Eva
```bash
# Copy Eva config
cp eva-core/config/eva-config.template.json eva-core/config/eva-config.json

# Import Eva workflow to n8n
# Navigate to http://localhost:5678 and import eva-core/workflows/instagram-daily-example.json
```

### Development
```bash
# Check status
git status

# View project structure
tree -L 2

# Validate JSON configs
node -e "console.log(JSON.parse(require('fs').readFileSync('package.json')))"
```

---

## 📊 Статистика

- **Файлове**: 35+ документационни и конфигурационни
- **Директории**: 25+ организирани структури
- **Документация**: 70,000+ думи
- **Platforms**: 7 напълно документирани
- **Workflows**: 3 готови за използване
- **Languages**: Български + English (mixed)

---

## 🆘 Помощ и Поддръжка

### GitHub
- 🐛 **Issues**: https://github.com/Wallesters-org/Wallestars/issues
- 💬 **Discussions**: https://github.com/Wallesters-org/Wallestars/discussions
- 📖 **Wiki**: https://github.com/Wallesters-org/Wallestars/wiki

### Internal Resources
- Всички markdown файлове в `/docs`
- Platform-specific READMEs в `/platforms/*`
- Eva документация в `/eva-core/docs`
- Workflow guides в `/workflows`

---

**Това е централно място за навигация към всички ресурси в Wallestars проекта.**  
**Всички линкове са тествани и актуални към 2026-01-01.**

✨ **Happy automating!** ✨
