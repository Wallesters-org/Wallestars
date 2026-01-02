# 🚀 Wallestars Dev Container - Complete Setup Guide

**Дата**: 2026-01-02  
**Версия**: 1.0.0  
**Статус**: Production Ready ✅

---

## 📋 Съдържание

1. [Преглед](#преглед)
2. [Какво Включва](#какво-включва)
3. [Предварителни Изисквания](#предварителни-изисквания)
4. [Бърз Старт](#бърз-старт)
5. [Services Overview](#services-overview)
6. [Secrets Management](#secrets-management)
7. [Development Workflow](#development-workflow)
8. [Troubleshooting](#troubleshooting)
9. [Advanced Configuration](#advanced-configuration)

---

## 🎯 Преглед

Този dev container предоставя **пълна development среда** за Wallestars платформата с:

- ✅ **Eva Core AI** готов за разработка
- ✅ **n8n Workflow Automation** локално
- ✅ **PostgreSQL + Redis** за база данни и кеш
- ✅ **Supabase Studio** за database management
- ✅ **KeePassXC Integration** за secrets management
- ✅ **All development tools** предварително инсталирани
- ✅ **Auto-setup scripts** за zero-config experience

---

## 📦 Какво Включва

### Development Tools

| Category | Tools |
|----------|-------|
| **Languages** | Node.js 22, Python 3.12 |
| **Package Managers** | npm, pip |
| **Version Control** | Git, Git LFS, GitHub CLI |
| **Containers** | Docker, Docker Compose, kubectl |
| **Databases** | PostgreSQL 16, Redis, Supabase CLI |
| **Security** | age, sops, keepassxc-cli |
| **CLI Utilities** | curl, wget, jq, yq, httpie |
| **Cloud** | Azure CLI, AWS CLI |
| **Automation** | n8n, act (GitHub Actions locally) |
| **Testing** | Jest, Playwright |

### VS Code Extensions (35+)

- GitHub Copilot & Copilot Chat
- Python, ESLint, Prettier
- Docker, Kubernetes
- GitLens, GitHub PR/Actions
- n8n extension
- Supabase extension
- Snyk Security Scanner
- Continue AI, Claude Dev
- Markdown, YAML, TOML support
- And many more...

### Docker Services (10)

1. **app** - Main application container
2. **postgres** - PostgreSQL 15 (Supabase compatible)
3. **redis** - Redis 7 with persistence
4. **n8n** - Workflow automation
5. **supabase-studio** - Database GUI
6. **pgadmin** - Advanced PostgreSQL management
7. **redis-commander** - Redis GUI
8. **mailhog** - Email testing
9. **nginx** - Reverse proxy
10. **Dev container** - Your development environment

---

## 🔧 Предварителни Изисквания

### 1. Software Requirements

- **VS Code** (latest version)
- **Docker Desktop** или Docker Engine
- **Git** (за клониране на repo)

### 2. Hardware Requirements

- **RAM**: 8GB минимум, 16GB препоръчително
- **Disk**: 20GB свободно пространство
- **CPU**: 4 cores препоръчително

### 3. Optional: Tails OS + KeePassXC

- Tails OS на USB-C flash drive
- KeePassXC database с credentials
- Persistent storage configured

---

## 🚀 Бърз Старт

### Стъпка 1: Клониране на Repo

```bash
git clone https://github.com/Wallesters-org/Wallestars.git
cd Wallestars
```

### Стъпка 2: Отваряне в VS Code

```bash
code .
```

### Стъпка 3: Reopen in Container

1. VS Code ще предложи "Reopen in Container"
2. Натиснете "Reopen in Container"
3. Изчакайте build и setup (първия път ~10-15 мин)

**Или с команда палитра**:
- `Ctrl+Shift+P` → `Dev Containers: Reopen in Container`

### Стъпка 4: Изчакайте Auto-Setup

Container ще изпълни автоматично:
- ✅ Install dependencies (npm install)
- ✅ Setup directories (.secrets, .cache, etc.)
- ✅ Create .env from .env.example
- ✅ Setup Eva config
- ✅ Initialize database schema
- ✅ Start background services

### Стъпка 5: Configure Secrets

```bash
# Option 1: Manual edit
code .env

# Option 2: From KeePassXC (ако имате Tails USB)
keepass-sync

# Option 3: Import from CSV
./devcontainer/helpers/import-from-keepass.sh export.csv
```

### Стъпка 6: Verify Setup

```bash
# Check services
docker-compose ps

# Test database
psql-local

# Test Eva Core
eva-demo

# Run tests
eva-test
```

### Стъпка 7: Start Development! 🎉

```bash
# Navigate to Eva Core
eva

# Or to platforms
platforms

# Or workflows
workflows
```

---

## 🌐 Services Overview

### Access URLs

| Service | URL | Default Credentials |
|---------|-----|---------------------|
| **Main App** | http://localhost:3000 | - |
| **n8n** | http://localhost:5678 | admin / admin |
| **Supabase Studio** | http://localhost:3001 | - |
| **pgAdmin** | http://localhost:5050 | admin@wallestars.local / admin |
| **Redis Commander** | http://localhost:8081 | - |
| **Mailhog** | http://localhost:8025 | - |
| **Nginx** | http://localhost:8080 | - |

### Database Connections

#### PostgreSQL

```bash
Host: localhost
Port: 5432
Database: wallestars
Username: postgres
Password: postgres_dev_password

# CLI connection
psql-local

# Or
psql -h localhost -U postgres -d wallestars
```

#### Redis

```bash
Host: localhost
Port: 6379
Password: redis_dev_password

# CLI connection
redis-cli-local

# Or
redis-cli -h localhost -a redis_dev_password
```

---

## 🔐 Secrets Management

### Quick Setup

```bash
# Load secrets from KeePassXC
load-secrets

# Or manually edit
code .env

# Verify
printenv | grep CLAUDE_API_KEY
```

### KeePassXC Integration

Виж пълната документация: [SECRETS-MANAGEMENT.md](./SECRETS-MANAGEMENT.md)

**Бърз преглед**:

1. Mount Tails USB
2. Setup KeePassXC database path
3. Run sync script
4. Credentials автоматично се зареждат

```bash
# Sync from KeePassXC
keepass-sync

# Check status
ls -la /workspace/.keepass/

# Audit secrets
secrets-audit
```

---

## 💻 Development Workflow

### Daily Workflow

```bash
# 1. Start container
# VS Code: Reopen in Container

# 2. Check services status
docker-compose ps

# 3. Load secrets (if needed)
load-secrets

# 4. Navigate to project
ws              # Go to root
eva             # Go to Eva Core
platforms       # Go to platforms
workflows       # Go to workflows

# 5. Development
eva-dev         # Start Eva in watch mode
npm run test    # Run tests
eva-demo        # Run demo

# 6. Git workflow
gs              # git status
gc -m "message" # git commit
gp              # git push

# 7. Check logs
dlogs           # Docker compose logs
n8n-logs        # n8n specific logs
```

### Testing Workflow

```bash
# Eva Core tests
eva-test

# Or manually
cd eva-core
npm test

# Run specific test
node --test test/eva-core.test.js

# With coverage
npm test -- --coverage
```

### Database Workflow

```bash
# Connect to PostgreSQL
psql-local

# List databases
\l

# Connect to wallestars
\c wallestars

# List tables
\dt eva.*

# Query
SELECT * FROM eva.users LIMIT 10;

# Exit
\q

# GUI option: Open pgAdmin
open http://localhost:5050
```

### n8n Workflow Development

```bash
# Start n8n (if not running)
docker-compose up -d n8n

# Access UI
open http://localhost:5678

# Import workflows
# UI: Settings → Import from File
# Select: workflows/*.json

# Check logs
n8n-logs

# Restart n8n
docker-compose restart n8n
```

---

## 🐛 Troubleshooting

### Container Won't Start

```bash
# Rebuild container
# VS Code: Ctrl+Shift+P → Dev Containers: Rebuild Container

# Or command line
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Services Not Running

```bash
# Check all services
docker-compose ps

# Start specific service
docker-compose up -d postgres

# Restart all
docker-compose restart

# Check logs
docker-compose logs -f
```

### Dependencies Issues

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Eva Core
cd eva-core
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Restart
docker-compose restart postgres

# Test connection
pg_isready -h localhost -p 5432 -U postgres
```

### Secrets Not Loading

```bash
# Check .env exists
ls -la /workspaces/Wallestars/.env

# Check content (careful!)
cat /workspaces/Wallestars/.env | head -5

# Reload
load-secrets

# Verify in environment
printenv | grep -E "(CLAUDE|OPENAI|GITHUB)"
```

### Port Already in Use

```bash
# Find what's using port
sudo lsof -i :5678

# Kill process
sudo kill -9 <PID>

# Or change port in docker-compose.yml
```

---

## ⚙️ Advanced Configuration

### Custom Dockerfile

Uncomment в `devcontainer.json`:

```json
{
  "build": {
    "dockerfile": "Dockerfile",
    "context": ".."
  }
}
```

### Add Custom Features

В `devcontainer.json`:

```json
{
  "features": {
    "ghcr.io/devcontainers/features/your-feature:1": {}
  }
}
```

### Mount Additional Directories

```json
{
  "mounts": [
    "source=/path/on/host,target=/path/in/container,type=bind"
  ]
}
```

### Environment-Specific Configs

```bash
# Create environment-specific compose file
cp docker-compose.yml docker-compose.prod.yml

# Use specific file
docker-compose -f docker-compose.prod.yml up -d
```

### Custom Scripts

Добавете scripts в `.devcontainer/helpers/`:

```bash
#!/bin/bash
# custom-script.sh

echo "Your custom logic here"
```

Направете го executable:

```bash
chmod +x .devcontainer/helpers/custom-script.sh
```

---

## 📚 Additional Resources

### Documentation

- [README.md](../README.md) - Project overview
- [SECRETS-MANAGEMENT.md](./SECRETS-MANAGEMENT.md) - Security guide
- [Eva Documentation](../eva-core/docs/EVA-DOCUMENTATION.md)
- [n8n Integration Guide](../docs/n8n-integration-guide.md)

### Quick Access

- [QUICK-ACCESS.md](../docs/QUICK-ACCESS.md) - All resources

### Helper Scripts

Location: `.devcontainer/helpers/`

- `aliases.sh` - Quick navigation aliases
- `keepass-sync.sh` - Sync from KeePassXC
- `load-secrets.sh` - Load environment secrets
- `secrets-audit.sh` - Security audit
- `rotate-secrets.sh` - Credential rotation

---

## 🎯 Quick Commands Reference

```bash
# Navigation
ws              # Workspace root
eva             # Eva Core
platforms       # Platforms directory
workflows       # Workflows directory
scripts         # Scripts directory

# Eva Commands
eva-demo        # Run demo
eva-test        # Run tests
eva-dev         # Development mode

# Docker
dc              # docker-compose
dps             # docker ps
dlogs           # docker-compose logs -f

# Database
psql-local      # Connect to PostgreSQL
redis-cli-local # Connect to Redis

# n8n
n8n-start       # Start n8n standalone
n8n-logs        # n8n container logs

# Git
gs              # git status
gp              # git pull
gc              # git commit
gco             # git checkout
glog            # git log (pretty)

# Environment
env-show        # Show .env
env-edit        # Edit .env

# Security
load-secrets    # Load secrets
secrets-audit   # Run security audit
keepass-sync    # Sync from KeePassXC
```

---

## ✅ Setup Checklist

- [ ] Dev container built successfully
- [ ] All services running (`docker-compose ps`)
- [ ] Database initialized
- [ ] Eva Core dependencies installed
- [ ] `.env` file configured
- [ ] KeePassXC integration setup (optional)
- [ ] n8n workflows imported
- [ ] Test Eva demo working (`eva-demo`)
- [ ] VS Code extensions installed
- [ ] Git configured
- [ ] Secrets audit passed

---

## 🤝 Support & Contributing

### Issues

- GitHub Issues: https://github.com/Wallesters-org/Wallestars/issues
- GitHub Discussions: https://github.com/Wallesters-org/Wallestars/discussions

### Contributing

1. Fork repository
2. Create feature branch
3. Make changes in dev container
4. Test thoroughly
5. Submit pull request

---

## 📝 License

ISC License - Wallesters-org

---

**Създадено от**: Wallestars Team  
**Последна актуализация**: 2026-01-02  
**Версия**: 1.0.0  
**Статус**: ✅ Production Ready

🎉 **Enjoy developing with Wallestars!** 🎉
