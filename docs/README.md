# 🚀 Wallestars Deployment Guide - Quick Start

## 📚 Документация

Този проект включва пълна документация за deploy в различни среди:

### 📄 Налични ръководства:

1. **🇧🇬 [Настройка на Български](./НАСТРОЙКА_BG.md)** ⭐ ЗАПОЧНЕТЕ ТУК!

   - Къде да поставите `.env` файла
   - Как да решите проблеми с портовете
   - Пълна диагностика и troubleshooting
   - Стъпка по стъпка инструкции

2. **[Azure Web Apps Deployment](./AZURE_DEPLOYMENT.md)**

   - Конфигуриране на Azure Web App
   - GitHub Actions CI/CD setup
   - Environment variables
   - Troubleshooting

3. **[Docker + VPS Deployment](./DOCKER_VPS_DEPLOYMENT.md)**

   - Docker контейнеризация
   - VPS/VMS Ubuntu Pro setup
   - Hostinger интеграция
   - Production best practices

4. **[Architecture Diagrams](./ARCHITECTURE_DIAGRAMS.md)**
   - Системна архитектура
   - Data flow диаграми
   - Security layers
   - Monitoring setup

---

## ⚡ Бърз старт

### Опция 1: Azure Web Apps (препоръчително за production)

```bash
# 1. Създайте Azure Web App
az webapp create --name wallestars-control-center --resource-group wallestars-rg --plan wallestars-plan --runtime "NODE:20-lts"

# 2. Конфигурирайте GitHub Secrets
# Settings → Secrets → AZURE_WEBAPP_PUBLISH_PROFILE

# 3. Push към main branch
git push origin main

# 4. GitHub Actions автоматично ще deploy приложението
```

### Опция 2: Docker на VPS

```bash
# 1. Свържете се към VPS
ssh root@your-vps-ip

# 2. Клонирайте проекта
git clone https://github.com/Wallesters-org/Wallestars.git
cd Wallestars

# 3. Конфигурирайте .env
cp .env.example .env
nano .env  # Добавете вашите API keys

# 4. Build и Start
docker compose up -d --build

# 5. Проверете
curl http://localhost:3000/api/health
```

---

## 🔧 Конфигурация

### Environment Variables

```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
NODE_ENV=production
PORT=3000
WS_PORT=3001
ENABLE_COMPUTER_USE=true
ENABLE_ANDROID=false
```

---

## 📊 Архитектура

```
GitHub → GitHub Actions → Azure/Docker → Production
   │
   └─► Build → Test → Deploy → Monitor
```

---

## 🎯 Deployment Options

| Feature      | Azure Web Apps  | Docker on VPS       |
| ------------ | --------------- | ------------------- |
| **Setup**    | ⭐⭐⭐⭐⭐ Easy | ⭐⭐⭐ Medium       |
| **Cost**     | $$              | $                   |
| **Scaling**  | Auto            | Manual              |
| **Control**  | Medium          | Full                |
| **SSL**      | Auto            | Manual              |
| **Best for** | Production      | Development/Testing |

---

## 📞 Поддръжка

За въпроси относно deployment:

- 📖 Прегледайте подробните ръководства в `/docs`
- 🐛 Отворете issue в GitHub
- 💬 Консултирайте се с екипа

---

## ✅ Checklist

Преди production deployment:

- [ ] Конфигурирани API keys
- [ ] SSL сертификат
- [ ] Firewall правила
- [ ] Backup стратегия
- [ ] Monitoring setup
- [ ] Environment variables
- [ ] Health checks
- [ ] Error logging

---

🎉 **Готови сте за deployment!**
