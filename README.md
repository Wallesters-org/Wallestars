# Wallestars

Интелигентна екосистема от платформи и автоматизации с AI в центъра.

## 🎯 Визия

Wallestars е проект, който обединява множество автоматизирани платформи и системи, управлявани от централния Eva алгоритъм за персонализирана потребителска интеракция и социални автоматизации.

## 📁 Структура на проекта

```
Wallestars/
├── eva-core/                      # Eva алгоритъм - сърцето на системата
│   ├── config/                    # Конфигурации
│   ├── workflows/                 # Workflow дефиниции
│   ├── social-automations/        # Социални автоматизации
│   ├── docs/                      # Документация
│   └── tests/                     # Тестове
│
├── platforms/                     # Индивидуални платформи
│   ├── email-processor/           # Email обработка
│   ├── vps-monitor/              # VPS мониторинг
│   ├── phone-numbers/            # Phone numbers management
│   ├── free-trial-automation/    # Free trial автоматизации
│   ├── task-automation-web/      # Task & Project management
│   ├── telegram-messages/        # Telegram съобщения
│   └── website-builder/          # Website builder & remix
│
├── shared/                        # Споделени компоненти
│   ├── utils/                     # Utility functions
│   ├── integrations/             # API интеграции
│   └── api-clients/              # API клиенти
│
└── docs/                         # Глобална документация
    ├── platforms/                # Документация за платформи
    ├── eva/                      # Eva документация
    └── guides/                   # Ръководства
```

## 🌟 Ключови компоненти

### Eva Core
Централен алгоритъм за:
- Персонализирана потребителска интеракция
- Социални автоматизации
- Multi-platform управление
- AI-powered decision making

[Виж детайли →](./eva-core/README.md)

### Platforms

#### 1. Email Processor
Автоматизирано извличане и обработка на имейли от различни източници.
[Документация →](./platforms/email-processor/README.md)

#### 2. VPS Monitor
Real-time мониторинг на VPS сървъри с quick actions и shortcuts.
[Документация →](./platforms/vps-monitor/README.md)

#### 3. Phone Numbers Management
Управление на множество телефонни номера с OTP обработка.
[Документация →](./platforms/phone-numbers/README.md)

#### 4. Free Trial Automation
Интелигентна система за управление на free trial accounts.
[Документация →](./platforms/free-trial-automation/README.md)

#### 5. Task Automation Web
AI-powered платформа за управление на задачи и проекти.
[Документация →](./platforms/task-automation-web/README.md)

#### 6. Telegram Messages
Система за извличане и анализ на Telegram съобщения.
[Документация →](./platforms/telegram-messages/README.md)

#### 7. Website Builder
Платформа за изграждане и remix на уебсайтове с Hostinger Horizon.
[Документация →](./platforms/website-builder/README.md)

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x или по-нова версия
- Python 3.9+ (за някои модули)
- Supabase account (за database)
- API keys за интеграции

### Quick Start

```bash
# Clone repository
git clone https://github.com/Wallesters-org/Wallestars.git
cd Wallestars

# Setup Eva Core
cd eva-core
npm install
cp config/eva-config.template.json config/eva-config.json
# Edit eva-config.json with your settings

# Setup specific platform (example: Task Automation)
cd ../platforms/task-automation-web
npm install
npm run dev
```

## 🔧 Конфигурация

Всяка платформа има собствена конфигурация. Вижте README файловете в съответните директории за детайли.

### Общи environment variables

```bash
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# AI Services
OPENAI_API_KEY=your_openai_key

# Social Platforms (example)
TELEGRAM_API_ID=your_telegram_id
TELEGRAM_API_HASH=your_telegram_hash

# Hostinger Horizon
HORIZON_API_KEY=your_horizon_key
```

## 📚 Документация

Детайлна документация е налична в следните места:

- [Eva Core Documentation](./eva-core/docs/EVA-DOCUMENTATION.md)
- [Platform-specific docs](./platforms/) - Виж README в всяка платформа
- [API Reference](./docs/API.md) (upcoming)
- [Deployment Guides](./docs/guides/) (upcoming)

## 🎯 Roadmap

### Текущи приоритети
- [x] Създаване на основна структура
- [x] Документация за Eva алгоритъм
- [x] Документация за всички платформи
- [ ] Имплементация на Eva Core
- [ ] Базови API endpoints
- [ ] Supabase интеграции

### Фаза 2
- [ ] UI/UX за всяка платформа
- [ ] Social media API интеграции
- [ ] Testing framework
- [ ] Deployment automation

### Фаза 3
- [ ] Advanced AI features
- [ ] Analytics dashboard
- [ ] Multi-user support
- [ ] Mobile applications

## 🤝 Contributing

За момента проектът е в активна разработка. Contribution guidelines ще бъдат добавени скоро.

## 📄 License

[License details to be added]

## 📧 Contact

За въпроси и предложения: [Contact details to be added]

---

**Note:** Този проект е в активна разработка. Структурата и функционалностите могат да се променят.
