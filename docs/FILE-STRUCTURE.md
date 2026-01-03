# 📁 Wallestars - Пълна Файлова Структура

**Генериран на**: 2026-01-01  
**Версия**: 1.0.0

---

## 📊 Обща Статистика

| Категория | Брой |
|-----------|------|
| **Общо файлове** | 35+ |
| **Директории** | 23 |
| **Документация (думи)** | 22,386 |
| **JSON конфигурации** | 5 |
| **Shell scripts** | 1 |
| **GitHub Actions** | 2 |
| **Общ размер** | 1.1 MB |

---

## 🌳 Директорна Структура

```
Wallestars/
│
├── 📄 README.md                           # Главно ръководство (български)
├── ⚙️ .env.example                        # Environment variables template
├── 🚫 .gitignore                          # Git ignore rules
├── 📦 package.json                        # NPM workspace configuration
│
├── 📂 .github/
│   └── workflows/
│       ├── azure-webapps-node.yml         # Azure deployment workflow
│       └── n8n-sync.yml                   # n8n synchronization workflow
│
├── 📂 docs/                               # Документация
│   ├── 📖 EVA-DJ-INTEGRATION.md          # Eva + DJ Workflow интеграция
│   ├── 📖 QUICK-ACCESS.md                # Бърз достъп до ресурси
│   ├── 📖 FINAL-SUMMARY-BG.md            # Финално резюме (български)
│   ├── 📖 INDEX.md                       # Индекс на документацията
│   ├── 📖 NAVIGATION.md                  # Навигационно ръководство
│   ├── 📖 PROJECT-STRUCTURE.md           # Проектна архитектура
│   ├── 📖 STRUCTURE-SUMMARY.md           # Кратко резюме
│   ├── 📖 TASK-TRACKING.md               # Roadmap и задачи
│   ├── 📖 n8n-integration-guide.md       # n8n интеграция
│   ├── 📖 summary.md                     # DJ Workflow резюме
│   ├── 📖 vps-setup-guide.md             # VPS setup инструкции
│   └── guides/
│       └── 📖 GETTING-STARTED.md         # Стартово ръководство
│
├── 📂 eva-core/                          # Eva AI Algorithm
│   ├── 📄 README.md                      # Eva описание
│   ├── config/
│   │   └── ⚙️ eva-config.template.json  # Eva конфигурация
│   ├── docs/
│   │   └── 📖 EVA-DOCUMENTATION.md      # Пълна Eva документация
│   └── workflows/
│       └── 🔄 instagram-daily-example.json # Instagram workflow пример
│
├── 📂 platforms/                         # 7 Основни Платформи
│   ├── email-processor/
│   │   └── 📖 README.md                 # Email обработка (1.9KB)
│   ├── free-trial-automation/
│   │   └── 📖 README.md                 # Free trial automation (6KB)
│   ├── phone-numbers/
│   │   └── 📖 README.md                 # Phone number management (3KB)
│   ├── task-automation-web/
│   │   └── 📖 README.md                 # Task automation (8.2KB)
│   ├── telegram-messages/
│   │   └── 📖 README.md                 # Telegram integration (11.9KB)
│   ├── vps-monitor/
│   │   └── 📖 README.md                 # VPS monitoring (2.6KB)
│   └── website-builder/
│       └── 📖 README.md                 # Website builder (13.8KB)
│
├── 📂 workflows/                         # n8n Workflows
│   ├── 📖 README.md                      # Workflows описание
│   ├── 📖 CONFIG.md                      # Workflow конфигурация
│   ├── 🔄 user-contact-automation.json   # User contact automation
│   └── 🔄 dj-workflow-multichain.json    # Multi-chain workflow
│
├── 📂 scripts/                           # Setup Scripts
│   └── 🔧 setup-n8n.sh                  # n8n setup script
│
└── 📂 shared/                            # Споделени компоненти
    ├── integrations/
    │   └── 📖 README.md                 # API интеграции
    └── utils/
        └── 📖 README.md                 # Utility функции
```

---

## 📖 Документация по Категории

### 🎯 Главни Документи

| Файл | Размер | Описание |
|------|--------|----------|
| **README.md** | 14.1 KB | Главно ръководство на български |
| **QUICK-ACCESS.md** | 10.2 KB | Бърз достъп до всички ресурси |
| **EVA-DJ-INTEGRATION.md** | 14.7 KB | Интеграционно ръководство |

### 🧠 Eva Core Документация

| Файл | Размер | Описание |
|------|--------|----------|
| **eva-core/README.md** | 3.6 KB | Eva основно описание |
| **EVA-DOCUMENTATION.md** | 7.9 KB | Пълна Eva документация |
| **eva-config.template.json** | 2.2 KB | Конфигурационен шаблон |
| **instagram-daily-example.json** | 3.4 KB | Примерен workflow |

### �� Workflow Документация

| Файл | Размер | Описание |
|------|--------|----------|
| **workflows/README.md** | 5.7 KB | Workflows общо описание |
| **workflows/CONFIG.md** | 3.9 KB | Конфигурация guide |
| **user-contact-automation.json** | 5.2 KB | GitHub automation |
| **dj-workflow-multichain.json** | 10.5 KB | Multi-chain deployment |

### 📦 Platform Документация

| Platform | Размер | Описание |
|----------|--------|----------|
| **Website Builder** | 13.8 KB | Hostinger Horizon integration |
| **Telegram Messages** | 11.9 KB | Message extraction & analysis |
| **Task Automation** | 8.2 KB | AI-powered task management |
| **Free Trial** | 6.0 KB | Trial automation система |
| **Phone Numbers** | 3.0 KB | Multi-number management |
| **VPS Monitor** | 2.6 KB | Real-time monitoring |
| **Email Processor** | 1.9 KB | Email processing |

### 📚 Guides & Setup

| Файл | Размер | Описание |
|------|--------|----------|
| **GETTING-STARTED.md** | 8.2 KB | Пълно setup ръководство |
| **n8n-integration-guide.md** | 5.9 KB | n8n + Claude AI integration |
| **vps-setup-guide.md** | 10.2 KB | VPS KVM2 setup |
| **setup-n8n.sh** | 10.9 KB | Автоматичен n8n setup |

### 🗂️ Проектна Структура

| Файл | Размер | Описание |
|------|--------|----------|
| **PROJECT-STRUCTURE.md** | 6.6 KB | Архитектура и organization |
| **STRUCTURE-SUMMARY.md** | 9.6 KB | Кратко резюме |
| **TASK-TRACKING.md** | 8.5 KB | Roadmap и фази |
| **NAVIGATION.md** | 11.6 KB | Навигационен guide |
| **INDEX.md** | 14.1 KB | Пълен индекс |

---

## ⚙️ Конфигурационни Файлове

### Environment Variables (.env.example)

**Категории**:
- 🗄️ Database (Supabase)
- 🤖 AI Services (OpenAI, Claude)
- 📱 Social Media (Instagram, Telegram, Facebook)
- 🌐 Hostinger Horizon
- 📊 Google Services
- 📧 Email Services
- 🖥️ VPS Monitoring
- 📱 Phone Numbers (Twilio, SMS Activate)
- ⚙️ n8n Configuration
- 🔐 GitHub Integration
- 🧠 Eva Configuration
- 🔒 Security & Rate Limiting

**Общо променливи**: 70+

### Package Configuration (package.json)

**Workspaces**:
- `eva-core`
- `platforms/*`
- `shared/*`

**Requirements**:
- Node.js >= 22.0.0
- npm >= 10.0.0

### Git Configuration (.gitignore)

**Игнорирани категории**:
- Node modules & dependencies
- Environment files
- SSL certificates & SSH keys
- Secrets & credentials
- Logs & temporary files
- Build artifacts
- Cache directories
- Database files

---

## 🔄 Workflows (n8n)

### 1. User Contact Automation
- **Файл**: `workflows/user-contact-automation.json`
- **Размер**: 5.2 KB
- **Функции**:
  - Автоматично отговаряне на GitHub issues
  - AI-генерирани персонализирани отговори
  - Issue categorization & labeling
  - 24/7 support automation

### 2. DJ Workflow Multi-Chain
- **Файл**: `workflows/dj-workflow-multichain.json`
- **Размер**: 10.5 KB
- **Функции**:
  - Multi-chain deployment routing
  - Claude AI code analysis
  - Ethereum, Polygon, Solana support
  - GitHub status updates

### 3. Eva Instagram Daily
- **Файл**: `eva-core/workflows/instagram-daily-example.json`
- **Размер**: 3.4 KB
- **Функции**:
  - Ежедневно content публикуване
  - Автоматично DM отговаряне
  - Story posting & scheduling
  - Engagement optimization

---

## 🛠️ Scripts

### setup-n8n.sh
- **Размер**: 10.9 KB
- **Функции**:
  - Automated n8n installation
  - SSL/TLS configuration
  - Credential setup
  - Workflow import
  - System service configuration

---

## 🚀 GitHub Actions

### 1. n8n-sync.yml
- **Размер**: 4.7 KB
- **Triggers**: Push to main, workflow changes
- **Functions**:
  - Auto-sync workflows to VPS
  - Credential management
  - Deployment verification

### 2. azure-webapps-node.yml
- **Размер**: 2.9 KB
- **Triggers**: Manual workflow_dispatch
- **Functions**:
  - Azure Web App deployment
  - Node.js build & test
  - Production deployment

---

## 📊 Статистика по Тип

| Тип файл | Брой | Общ размер |
|----------|------|------------|
| **Markdown (.md)** | 25 | ~170 KB |
| **JSON** | 5 | ~25 KB |
| **Shell (.sh)** | 1 | ~11 KB |
| **YAML (.yml)** | 2 | ~8 KB |
| **Конфигурация** | 3 | ~3 KB |

---

## 🎯 Използване

### Навигация до документация
```bash
# Главно ръководство
cat README.md

# Бърз достъп
cat docs/QUICK-ACCESS.md

# Eva документация
cat eva-core/docs/EVA-DOCUMENTATION.md

# n8n setup
cat docs/n8n-integration-guide.md
```

### Преглед на workflows
```bash
# List workflows
ls -lh workflows/

# Validate JSON
node -e "JSON.parse(require('fs').readFileSync('workflows/user-contact-automation.json'))"

# Import to n8n
# Open http://localhost:5678 and import workflow files
```

### Setup
```bash
# Copy environment variables
cp .env.example .env

# Copy Eva config
cp eva-core/config/eva-config.template.json eva-core/config/eva-config.json

# Run n8n setup
bash scripts/setup-n8n.sh
```

---

## 🔗 Връзки

- **Repository**: https://github.com/Wallesters-org/Wallestars
- **n8n Documentation**: https://docs.n8n.io/
- **Claude AI**: https://docs.anthropic.com/
- **Supabase**: https://supabase.io/docs

---

**Файлова структура актуализирана и валидирана на 2026-01-01** ✅
