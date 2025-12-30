# Getting Started with Wallestars

Добре дошли в Wallestars! Това ръководство ще ви помогне да започнете работа с проекта.

## 📋 Предварителни изисквания

### Софтуер
- **Node.js** версия 20.x или по-нова
- **npm** версия 9.x или по-нова
- **Git** за version control
- **Python 3.9+** (опционално, за някои модули)

### Accounts
- **Supabase account** (безплатен tier е достатъчен)
- **OpenAI API key** (за AI функционалности)
- **Social media accounts** (според нуждите)

## 🚀 Първи стъпки

### 1. Clone на repository

```bash
git clone https://github.com/Wallesters-org/Wallestars.git
cd Wallestars
```

### 2. Environment Setup

Създайте `.env` файл в root директорията:

```bash
cp .env.example .env
```

Попълнете с вашите credentials:

```bash
# Database
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key

# AI Services
OPENAI_API_KEY=sk-your-openai-api-key

# Optional: Social Media
TELEGRAM_API_ID=your_telegram_api_id
TELEGRAM_API_HASH=your_telegram_api_hash
INSTAGRAM_USERNAME=your_username
INSTAGRAM_PASSWORD=your_password

# Hostinger Horizon (за website builder)
HORIZON_API_KEY=your_horizon_key
```

### 3. Install Dependencies

```bash
# Install root dependencies
npm install

# Install Eva Core dependencies
cd eva-core
npm install
cd ..

# Install platform-specific dependencies (example)
cd platforms/task-automation-web
npm install
cd ../..
```

### 4. Database Setup

#### Supabase Schema

1. Влезте в Supabase Dashboard
2. Отидете на SQL Editor
3. Изпълнете следния SQL за създаване на основни таблици:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Eva sessions
CREATE TABLE eva_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  platform VARCHAR(50),
  config JSONB,
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Social accounts
CREATE TABLE social_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  platform VARCHAR(50),
  username VARCHAR(255),
  credentials JSONB,
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Messages log
CREATE TABLE messages_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES eva_sessions(id),
  direction VARCHAR(10), -- 'incoming' or 'outgoing'
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5. Eva Configuration

Конфигурирайте Eva алгоритъма:

```bash
cd eva-core/config
cp eva-config.template.json eva-config.json
```

Редактирайте `eva-config.json` според вашите нужди:

```json
{
  "eva": {
    "version": "1.0.0",
    "name": "My Eva Instance"
  },
  "settings": {
    "language": "bg",
    "personality": {
      "type": "friendly",
      "tone": "professional"
    }
  }
}
```

## 🎯 Избор на платформа за начало

### Препоръка: Task Automation Web

Най-лесната платформа за начало е Task Automation Web:

```bash
cd platforms/task-automation-web
npm install
npm run dev
```

Отворете браузър на `http://localhost:3000`

### Алтернатива: Telegram Messages

За работа с Telegram съобщения:

```bash
cd platforms/telegram-messages
npm install

# Configure Telegram credentials in .env
npm run start
```

## 📚 Основни концепции

### Eva Sessions

Eva работи на базата на sessions:

```javascript
const eva = require('./eva-core');

// Create session
const session = await eva.createSession({
  platform: 'instagram',
  account: 'myaccount',
  personality: 'friendly'
});

// Use session
await session.processMessage(incomingMessage);
```

### Platform Integration

Всяка платформа се интегрира с Eva:

```javascript
const platform = require('./platforms/email-processor');

// Initialize
await platform.initialize({
  evaSession: session,
  config: platformConfig
});

// Run
await platform.run();
```

## 🔧 Development Workflow

### 1. Избор на feature/задача
```bash
git checkout -b feature/my-new-feature
```

### 2. Development
```bash
# Start dev server with hot reload
npm run dev
```

### 3. Testing
```bash
# Run tests
npm test

# Run specific test
npm test -- platforms/task-automation-web
```

### 4. Commit changes
```bash
git add .
git commit -m "feat(task-automation): add new feature"
```

### 5. Push & Pull Request
```bash
git push origin feature/my-new-feature
# Create PR on GitHub
```

## 📱 Platform-specific Guides

### Email Processor
```bash
cd platforms/email-processor
# Follow platforms/email-processor/README.md
```

### VPS Monitor
```bash
cd platforms/vps-monitor
# Follow platforms/vps-monitor/README.md
```

### Free Trial Automation
```bash
cd platforms/free-trial-automation
# Follow platforms/free-trial-automation/README.md
```

## 🐛 Troubleshooting

### Common Issues

#### "Cannot find module"
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### "Database connection failed"
- Проверете Supabase credentials в `.env`
- Проверете internet connection
- Проверете Supabase project status

#### "API rate limit exceeded"
- Проверете rate limiting настройки
- Използвайте caching
- Добавете delays между requests

### Debug Mode

Enable debug logging:

```bash
DEBUG=wallestars:* npm run dev
```

### Logs Location

Logs се записват в:
```
logs/
├── error.log
├── combined.log
└── debug.log
```

## 📖 Next Steps

След успешен setup:

1. **Explore Documentation**
   - [Eva Documentation](../eva-core/docs/EVA-DOCUMENTATION.md)
   - [Project Structure](./PROJECT-STRUCTURE.md)
   - Platform-specific READMEs

2. **Start with a Simple Task**
   - Import tasks в Task Automation
   - Extract messages от Telegram
   - Setup VPS monitoring

3. **Experiment with Eva**
   - Try different personalities
   - Test social automations
   - Create custom workflows

4. **Build Your First Integration**
   - Choose a new platform
   - Follow integration guide
   - Test thoroughly

## 🆘 Getting Help

### Resources
- 📖 [Full Documentation](./README.md)
- 🐛 [Issue Tracker](https://github.com/Wallesters-org/Wallestars/issues)
- 💬 [Discussions](https://github.com/Wallesters-org/Wallestars/discussions)

### Community
- Join our community (details TBA)
- Share your use cases
- Contribute improvements

## ✅ Checklist

Преди да започнете development:

- [ ] Node.js и npm са инсталирани
- [ ] Repository е клониран
- [ ] Dependencies са инсталирани
- [ ] `.env` файлът е конфигуриран
- [ ] Supabase database е setup-нат
- [ ] Eva config е адаптиран
- [ ] Dev server работи успешно
- [ ] Прочетена основна документация

## 🎉 Success!

Ако всичко е минало гладко, вие сте готови да започнете работа с Wallestars!

Започнете с експериментиране на една от платформите или създайте първия си Eva session.

Happy coding! 🚀
