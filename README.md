# Wallestars

## 🌟 Интелигентна Екосистема с Eva AI и DJ Workflow

Wallestars е мощна платформа за автоматизация, която комбинира Eva AI алгоритъма с n8n workflow автоматизации, Claude AI интеграция и multi-chain blockchain управление. Системата обединява управление на социални мрежи, автоматизирани взаимодействия с потребители, и интелигентно разпределение на ресурси.

## 🎯 Основни Компоненти

### Eva AI Алгоритъм
**Eva** е централният AI алгоритъм за персонализирани потребителски взаимодействия и автоматизация на социални мрежи:

- 🧠 **Контекстна обработка** - Анализира снимки, текст и потребителски данни
- 🎭 **Персонализация** - Създава индивидуално отношение към всеки потребител
- 📱 **Multi-platform** - Управлява 10-15 профила в Instagram, Facebook, YouTube, Telegram, WhatsApp и др.
- 🔄 **Workflow интеграция** - Работи с предварително дефинирани правила и условия
- 📊 **Мониторинг и анализ** - Следи активността и оптимизира стратегиите

### DJ Workflow - Multi-Chain Automation
Автоматизирана система за управление на multi-chain blockchain приложения:

- 🔗 **Multi-chain поддръжка** - Ethereum, Polygon, Solana и други
- 🤖 **AI-базирано разпределение** - Интелигентен routing с Claude AI
- 📡 **n8n интеграция** - Self-hosted workflow engine на VPS (KVM2)
- 🔐 **Enterprise security** - SSL/TLS, credential management, audit logging

### n8n Workflow Automation
Self-hosted автоматизация на бизнес процеси:

- 🔄 **Автоматично реагиране** - GitHub issues и discussions с Claude AI
- 📬 **Webhook интеграция** - Real-time синхронизация
- 🎯 **Custom workflows** - Персонализирани автоматизации за всеки процес
- 📊 **Мониторинг** - Execution logs и status tracking

## 🏗️ Архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                      Wallestars Platform                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Eva Core   │◄──►│  n8n Engine  │◄──►│  Claude AI   │  │
│  │  Algorithm   │    │   (VPS KVM2) │    │  Integration │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         ▲                    ▲                    ▲         │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           GitHub Repository + Actions                │  │
│  └──────────────────────────────────────────────────────┘  │
│         ▲                                          ▲         │
│         │                                          │         │
│         ▼                                          ▼         │
│  ┌─────────────┐                          ┌─────────────┐  │
│  │   Social    │                          │Multi-Chain  │  │
│  │  Platforms  │                          │  Networks   │  │
│  │ (10-15 acc) │                          │(ETH,SOL,etc)│  │
│  └─────────────┘                          └─────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Платформи и Инструменти

### 7 Основни Платформи
1. **Website Builder** - Hostinger Horizon интеграция
2. **Telegram Messages** - Извличане и анализ на съобщения
3. **Task Automation Web** - AI-powered task management
4. **Free Trial Automation** - 3-фазна автоматизация
5. **Phone Numbers** - Multi-number management
6. **VPS Monitor** - Real-time monitoring
7. **Email Processor** - Email extraction & processing

## 🚀 Бърз Старт

### Предварителни Изисквания

- **Node.js** >= 22.0.0
- **npm** >= 10.0.0
- **VPS сървър** (KVM2) с Ubuntu 22.04+
- **GitHub** repository достъп
- **Claude AI** API key
- **Supabase** или PostgreSQL database

### Инсталация

#### 1. Клониране на репозиторито
```bash
git clone https://github.com/Wallesters-org/Wallestars.git
cd Wallestars
```

#### 2. Инсталиране на зависимости
```bash
npm install
```

#### 3. Конфигурация на environment variables
```bash
cp .env.example .env
# Редактирайте .env с вашите credentials
```

#### 4. Setup на n8n на VPS
```bash
# Ръчна инсталация
npm install -g n8n

# Или с Docker
docker run -d --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

Пълни инструкции: [VPS Setup Guide](./docs/vps-setup-guide.md)

#### 5. Import на workflows
```bash
# Импортирайте workflow файловете в n8n:
# - workflows/user-contact-automation.json
# - workflows/dj-workflow-multichain.json
# - eva-core/workflows/instagram-daily-example.json
```

#### 6. Конфигуриране на Eva
```bash
# Копирайте Eva config template
cp eva-core/config/eva-config.template.json eva-core/config/eva-config.json
# Редактирайте конфигурацията според нуждите
```

## 📚 Документация

### Ръководства за Начало
- 🚀 [Getting Started Guide](./docs/guides/GETTING-STARTED.md) - Пълно ръководство за setup
- 📖 [n8n Integration Guide](./docs/n8n-integration-guide.md) - Интеграция с n8n и Claude AI
- 🖥️ [VPS Setup Guide](./docs/vps-setup-guide.md) - Настройка на VPS сървър

### Eva Core Документация
- 📘 [Eva Documentation](./eva-core/docs/EVA-DOCUMENTATION.md) - Пълна Eva документация
- ⚙️ [Eva Config Template](./eva-core/config/eva-config.template.json) - Конфигурационен шаблон
- 📊 [Instagram Workflow Example](./eva-core/workflows/instagram-daily-example.json) - Примерен workflow

### Проектна Структура
- 🏗️ [Project Structure](./docs/PROJECT-STRUCTURE.md) - Архитектура и организация
- 📋 [Task Tracking](./docs/TASK-TRACKING.md) - Roadmap и задачи
- 🧭 [Navigation Guide](./docs/NAVIGATION.md) - Навигация в проекта
- 📑 [Index](./docs/INDEX.md) - Пълен индекс на документацията

### Платформи
- 🌐 [Website Builder](./platforms/website-builder/README.md)
- 💬 [Telegram Messages](./platforms/telegram-messages/README.md)
- ✅ [Task Automation](./platforms/task-automation-web/README.md)
- 🎁 [Free Trial Automation](./platforms/free-trial-automation/README.md)
- 📱 [Phone Numbers](./platforms/phone-numbers/README.md)
- 🖥️ [VPS Monitor](./platforms/vps-monitor/README.md)
- 📧 [Email Processor](./platforms/email-processor/README.md)

### Workflows и Автоматизации
- 🔄 [Workflow Config Guide](./workflows/CONFIG.md)
- 📝 [Workflow README](./workflows/README.md)
- 🤖 [User Contact Automation](./workflows/user-contact-automation.json)
- 🔗 [DJ Multi-Chain Workflow](./workflows/dj-workflow-multichain.json)

### Допълнителни Ресурси
- 📊 [Project Summary](./docs/summary.md) - Общ преглед
- ��🇬 [Bulgarian Summary](./docs/FINAL-SUMMARY-BG.md) - Резюме на български
- 📖 [Structure Summary](./docs/STRUCTURE-SUMMARY.md) - Кратко резюме

## 🔧 Налични Workflows

### 1. User Contact Automation
**Файл**: `workflows/user-contact-automation.json`

Автоматично обработва потребителски взаимодействия:
- Отговаря на нови issues с AI-генерирани съобщения
- Категоризира и етикетира issues
- Осигурява 24/7 поддръжка

### 2. DJ Workflow Multi-Chain
**Файл**: `workflows/dj-workflow-multichain.json`

Управлява multi-chain deployments:
- Анализира commits с Claude AI
- Routing към подходящи blockchain мрежи
- Актуализира deployment статус в GitHub

### 3. Eva Instagram Daily Workflow
**Файл**: `eva-core/workflows/instagram-daily-example.json`

Автоматизира Instagram активности:
- Ежедневно публикуване на content
- Обработка на съобщения
- Управление на коментари и likes

## 🌍 Eva Глобални Цели

- ✅ Завършване и пускане на Eva като алгоритъм - тест фаза
- 🔄 Имплементация на Eva в workflows
- 📱 Eva обединение на социални мрежи и канали
- 🤖 Eva автоматизирано създаване и публикуване на content
- 📊 Eva мониторинг и analytics
- 🗄️ Eva интеграция със Supabase/Google Sheets
- 📝 Документация за автоматизиране на имплементацията
- 🎯 Примери за имплементации в различни среди

## 🔐 Сигурност

- 🔒 SSL/TLS криптиране за всички комуникации
- 🔑 Сигурно съхранение на credentials в n8n
- 🌐 Environment variable управление
- 🛡️ IP whitelisting поддръжка
- 📋 Редовни security audits
- 🚫 Никога не commitвайте secrets в git

## ⚙️ Environment Variables

Основни променливи за конфигуриране:

```bash
# Database
SUPABASE_URL=
SUPABASE_KEY=

# OpenAI / Claude AI
OPENAI_API_KEY=
CLAUDE_API_KEY=

# Social Media
INSTAGRAM_USERNAME=
INSTAGRAM_PASSWORD=
TELEGRAM_API_ID=
TELEGRAM_API_HASH=

# n8n
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=
N8N_BASIC_AUTH_PASSWORD=
N8N_HOST=

# Eva Reporting
REPORT_EMAIL=
```

Пълен списък: [.env.example](./.env.example)

## 📋 Workflow Етапи

### Фаза 1: Foundation ✅
- [x] Основна структура създадена
- [x] Eva Core документация
- [x] 7 платформи организирани
- [x] n8n интеграция настроена

### Фаза 2: Имплементация (В процес)
- [ ] Eva Core имплементация (Context Processor, Decision Engine)
- [ ] Supabase database setup и schema
- [ ] Първа платформа имплементация
- [ ] API integrations (OpenAI, Telegram, Instagram)

### Фаза 3: Автоматизация
- [ ] GitHub Actions CI/CD
- [ ] n8n workflow активиране
- [ ] Eva testing и optimization
- [ ] Multi-chain deployment automation

### Фаза 4: Scale & Production
- [ ] Multi-account управление
- [ ] Advanced analytics
- [ ] Performance optimization
- [ ] Production deployment

## 🤝 Принос

Този проект е част от Wallesters-org екосистемата. За въпроси и предложения:

- 🐛 [GitHub Issues](https://github.com/Wallesters-org/Wallestars/issues)
- 💬 [GitHub Discussions](https://github.com/Wallesters-org/Wallestars/discussions)

## 📊 Статистика

- **Файлове**: 35+ документационни и конфигурационни
- **Директории**: 25+ организирани структури
- **Документация**: 70,000+ думи
- **Платформи**: 7 напълно документирани
- **Workflows**: 3 готови за използване
- **Coverage**: 100% Complete ✅

## 🔗 Полезни Връзки

- [Claude AI Documentation](https://docs.anthropic.com/)
- [n8n Documentation](https://docs.n8n.io/)
- [Supabase Documentation](https://supabase.io/docs)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Anthropic AUP](https://www.anthropic.com/legal/aup)

## 📝 Лиценз

ISC License - Wallesters-org

---

**Последна актуализация**: 2026-01-01  
**Статус**: Foundation Complete & Integration Phase 🚀  
**Версия**: 1.0.0
