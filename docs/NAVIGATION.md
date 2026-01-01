# 🗺️ Wallestars Project Navigation Guide

Бърз навигационен гид за Wallestars проекта.

## 🏠 Къде да започна?

### Първо посещение
👉 **Започнете тук:** [README.md](../README.md)

### Искам да разбера Eva
👉 **Eva основи:** [eva-core/README.md](../eva-core/README.md)  
👉 **Eva детайли:** [eva-core/docs/EVA-DOCUMENTATION.md](../eva-core/docs/EVA-DOCUMENTATION.md)

### Искам да setup-на проекта
👉 **Getting Started:** [docs/guides/GETTING-STARTED.md](./GETTING-STARTED.md)

### Искам да видя структурата
👉 **Project Structure:** [docs/PROJECT-STRUCTURE.md](./PROJECT-STRUCTURE.md)

### Искам да видя какво остава
👉 **Task Tracking:** [docs/TASK-TRACKING.md](./TASK-TRACKING.md)

## 📚 Документация по компоненти

### Eva Core
```
eva-core/
├── 📄 README.md                    → Основно описание
├── 📁 config/
│   └── eva-config.template.json    → Конфигурация template
├── 📁 docs/
│   └── EVA-DOCUMENTATION.md        → Детайлна документация (5200+ думи)
└── 📁 workflows/
    └── instagram-daily-example.json → Примерен workflow
```

**Ключови теми в Eva документацията:**
- Архитектура (Context Processor, Decision Engine, Response Generator)
- Конфигуриране (Roles, Personality)
- Функционалности (Social automations, Content generation)
- Use Cases (Instagram management, Telegram automation, Multi-platform)
- Testing scenarios
- Best practices

### Platforms Overview

#### 🏆 Top 3 най-обширни platforms

1. **Website Builder** (10,800+ думи)
   - 📄 [platforms/website-builder/README.md](../platforms/website-builder/README.md)
   - Hostinger Horizon integration
   - 4-phase workflow
   - Prompt generation engine

2. **Telegram Messages** (9,000+ думи)
   - 📄 [platforms/telegram-messages/README.md](../platforms/telegram-messages/README.md)
   - 5 core features (Summary, Download, KeyLooker, Context Agent, Agent Helper)
   - Message extraction & analysis

3. **Task Automation Web** (6,600+ думи)
   - 📄 [platforms/task-automation-web/README.md](../platforms/task-automation-web/README.md)
   - AI-powered task management
   - Bulk import & organization

#### 🔧 Utility Platforms

4. **Free Trial Automation** (4,800+ думи)
   - 📄 [platforms/free-trial-automation/README.md](../platforms/free-trial-automation/README.md)
   - 3-phase система (Create, Monitor, Renew)

5. **Phone Numbers** (2,600+ думи)
   - 📄 [platforms/phone-numbers/README.md](../platforms/phone-numbers/README.md)
   - Multi-number management, OTP handling

6. **VPS Monitor** (2,300+ думи)
   - 📄 [platforms/vps-monitor/README.md](../platforms/vps-monitor/README.md)
   - Real-time monitoring, Quick actions

7. **Email Processor** (1,400+ думи)
   - 📄 [platforms/email-processor/README.md](../platforms/email-processor/README.md)
   - Email extraction & classification

### Shared Components
```
shared/
├── 📁 utils/
│   └── 📄 README.md                → Utility functions
├── 📁 integrations/
│   └── 📄 README.md                → API integrations guide
└── 📁 api-clients/
    └── (реусабилни API клиенти)
```

## 🎯 Бързи връзки по цел

### Искам да работя с Eva

| Задача | Документ |
|--------|----------|
| Разбиране на Eva | [eva-core/README.md](../eva-core/README.md) |
| Конфигурация | [eva-config.template.json](../eva-core/config/eva-config.template.json) |
| Архитектура | [EVA-DOCUMENTATION.md](../eva-core/docs/EVA-DOCUMENTATION.md) |
| Примерен workflow | [instagram-daily-example.json](../eva-core/workflows/instagram-daily-example.json) |

### Искам да имплементирам платформа

| Платформа | README | Сложност | Приоритет |
|-----------|--------|----------|-----------|
| Task Automation | [README](../platforms/task-automation-web/README.md) | Medium | HIGH ⭐ |
| Telegram Messages | [README](../platforms/telegram-messages/README.md) | Medium | HIGH ⭐ |
| Free Trial Auto | [README](../platforms/free-trial-automation/README.md) | High | Medium |
| Email Processor | [README](../platforms/email-processor/README.md) | Low | Medium |
| VPS Monitor | [README](../platforms/vps-monitor/README.md) | Medium | Low |
| Phone Numbers | [README](../platforms/phone-numbers/README.md) | Medium | Low |
| Website Builder | [README](../platforms/website-builder/README.md) | High | Medium |

### Искам да setup-на среда

| Стъпка | Документ |
|--------|----------|
| 1. Prerequisites | [GETTING-STARTED.md - Prerequisites](./guides/GETTING-STARTED.md#-предварителни-изисквания) |
| 2. Clone & Install | [GETTING-STARTED.md - Първи стъпки](./guides/GETTING-STARTED.md#-първи-стъпки) |
| 3. Environment | [.env.example](../.env.example) |
| 4. Database | [GETTING-STARTED.md - Database Setup](./guides/GETTING-STARTED.md#database-setup) |
| 5. Eva Config | [eva-config.template.json](../eva-core/config/eva-config.template.json) |

### Искам да разбера архитектурата

| Тема | Документ |
|------|----------|
| Общ преглед | [README.md](../README.md) |
| Структура | [PROJECT-STRUCTURE.md](./PROJECT-STRUCTURE.md) |
| Eva архитектура | [EVA-DOCUMENTATION.md](../eva-core/docs/EVA-DOCUMENTATION.md#архитектура) |
| Naming conventions | [PROJECT-STRUCTURE.md - Conventions](./PROJECT-STRUCTURE.md#naming-conventions) |
| Git strategy | [PROJECT-STRUCTURE.md - Git Strategy](./PROJECT-STRUCTURE.md#git-strategy) |

## 📊 Roadmap & Planning

### Текущ статус
👉 [TASK-TRACKING.md](./TASK-TRACKING.md)

### Фази на разработка

| Фаза | Описание | Статус |
|------|----------|--------|
| Фаза 1 | Eva Core Implementation | 🔄 Next |
| Фаза 2 | Core Integrations | ⏳ Planned |
| Фаза 3 | Platform Implementations | ⏳ Planned |
| Фаза 4 | Social Automations | ⏳ Planned |
| Фаза 5 | Testing & QA | ⏳ Planned |
| Фаза 6 | Deployment | ⏳ Planned |
| Фаза 7 | Advanced Features | ⏳ Future |

## 🔍 Търсене на информация

### По функционалност

| Търся информация за... | Намирам в... |
|------------------------|--------------|
| AI/LLM integration | Eva Documentation |
| Social media automation | Eva Documentation, Platform READMEs |
| Task management | Task Automation Web README |
| Message extraction | Telegram Messages README |
| Website creation | Website Builder README |
| Account management | Free Trial Automation README |
| Server monitoring | VPS Monitor README |
| Email processing | Email Processor README |
| Phone/OTP handling | Phone Numbers README |

### По технология

| Технология | Документ |
|------------|----------|
| Supabase | GETTING-STARTED.md, Integrations README |
| OpenAI | GETTING-STARTED.md, Eva Documentation |
| Telegram API | Telegram Messages README |
| Instagram API | Eva Documentation (use cases) |
| Hostinger Horizon | Website Builder README |
| Node.js/npm | package.json, PROJECT-STRUCTURE.md |

## 🎨 Концепции и patterns

### Eva Patterns
- **Session Management** → [EVA-DOCUMENTATION.md](../eva-core/docs/EVA-DOCUMENTATION.md)
- **Personality System** → [EVA-DOCUMENTATION.md](../eva-core/docs/EVA-DOCUMENTATION.md#personality-setup)
- **Workflow Automation** → [instagram-daily-example.json](../eva-core/workflows/instagram-daily-example.json)

### Platform Patterns
- **Multi-platform присъствие** → [Eva Use Cases](../eva-core/docs/EVA-DOCUMENTATION.md#use-cases)
- **Bulk operations** → [Task Automation README](../platforms/task-automation-web/README.md)
- **Real-time monitoring** → [VPS Monitor README](../platforms/vps-monitor/README.md)

## 🛠️ Development Resources

### Configuration Files
- [package.json](../package.json) - Root package config
- [.env.example](../.env.example) - Environment variables template
- [eva-config.template.json](../eva-core/config/eva-config.template.json) - Eva config
- [.gitignore](../.gitignore) - Git ignore rules

### Documentation Standards
👉 [PROJECT-STRUCTURE.md - Documentation Standards](./PROJECT-STRUCTURE.md#documentation-standards)

### Testing Strategy
👉 [PROJECT-STRUCTURE.md - Testing Strategy](./PROJECT-STRUCTURE.md#testing-strategy)

### Security
👉 [PROJECT-STRUCTURE.md - Security](./PROJECT-STRUCTURE.md#security)

## 📞 Help & Support

### Имам проблем
1. Проверете [GETTING-STARTED.md - Troubleshooting](./guides/GETTING-STARTED.md#-troubleshooting)
2. Прегледайте [Eva Documentation - Troubleshooting](../eva-core/docs/EVA-DOCUMENTATION.md#troubleshooting)
3. Проверете GitHub Issues

### Искам да contribute
1. Прочетете [PROJECT-STRUCTURE.md](./PROJECT-STRUCTURE.md)
2. Следвайте [Git Strategy](./PROJECT-STRUCTURE.md#git-strategy)
3. Спазвайте [Naming Conventions](./PROJECT-STRUCTURE.md#naming-conventions)

### Искам нова feature
1. Проверете [TASK-TRACKING.md](./TASK-TRACKING.md)
2. Вижте дали вече е планирана
3. Създайте GitHub Issue с предложение

## 📈 Metrics & Progress

### Текущ прогрес
- **Eva Core:** 15% готовност
- **Platforms:** 10% готовност (документация готова)
- **Integrations:** 5% готовност
- **Documentation:** 80% готовност

### Следващи 3 задачи
1. Eva Core Context Processor имплементация
2. Supabase schema и setup
3. Task Automation Web - basic UI

## 🗂️ Файлова структура (Quick Reference)

```
Wallestars/
├── 📄 README.md                        ← Start here
├── 📄 package.json
├── 📄 .env.example
├── 📄 .gitignore
│
├── 📁 eva-core/                        ← Eva алгоритъм
│   ├── README.md
│   ├── config/eva-config.template.json
│   ├── docs/EVA-DOCUMENTATION.md
│   └── workflows/instagram-daily-example.json
│
├── 📁 platforms/                       ← 7 платформи
│   ├── email-processor/README.md
│   ├── vps-monitor/README.md
│   ├── phone-numbers/README.md
│   ├── free-trial-automation/README.md
│   ├── task-automation-web/README.md
│   ├── telegram-messages/README.md
│   └── website-builder/README.md
│
├── 📁 shared/                          ← Споделени компоненти
│   ├── utils/README.md
│   └── integrations/README.md
│
└── 📁 docs/                            ← Документация
    ├── PROJECT-STRUCTURE.md
    ├── TASK-TRACKING.md
    ├── STRUCTURE-SUMMARY.md
    ├── NAVIGATION.md                   ← You are here
    └── guides/GETTING-STARTED.md
```

---

**💡 Tip:** Bookmark този файл за бърз достъп до всички ресурси!

**Last Updated:** 2025-12-31
