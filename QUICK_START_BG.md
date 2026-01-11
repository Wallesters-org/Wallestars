# 🎯 Wallestars - Quick Start Guide (Български / English)

Най-лесният начин да стартирате Wallestars Control Center.

---

## 🚀 Бърз Старт (Quick Start)

### Вариант 1: Локален Компютър / Antigravity Terminal

#### Стъпка 1: Клониране на проекта
```bash
git clone https://github.com/Wallesters-org/Wallestars.git
cd Wallestars
```

#### Стъпка 2: Инсталиране на зависимости
```bash
npm install
```

#### Стъпка 3: Конфигуриране
```bash
cp .env.example .env
nano .env  # или използвайте вашия текстов редактор
```

Добавете вашия API ключ:
```env
ANTHROPIC_API_KEY=sk-ant-вашият-ключ-тук
ENABLE_COMPUTER_USE=true
ENABLE_ANDROID=true
```

#### Стъпка 4: Стартиране
```bash
npm run dev
```

✅ **Готово!** Отворете в браузър:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

---

## 📱 Достъп от Други Устройства

### От Телефон или Таблет в Същата Мрежа:

1. Намерете IP адреса на компютъра:
   ```bash
   # Linux/Mac:
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Windows:
   ipconfig | findstr IPv4
   ```

2. Отворете в мобилния браузър:
   ```
   http://192.168.X.X:5173
   ```
   (замените с вашия IP адрес)

---

## 🌐 Публично Излагане (Ngrok)

За достъп отвън от мрежата ви:

```bash
# Инсталирайте ngrok
npm install -g ngrok

# Изложете порт 5173
ngrok http 5173
```

Ще получите публичен URL като: `https://xyz123.ngrok.io`

---

## 🏢 Hostinger VPS Деплоймънт

### Опция А: Автоматизиран Скрипт

Използвайте browser agent за автоматизация:

```bash
# SSH в VPS
ssh root@YOUR_VPS_IP

# Изпълнете auto-deploy скрипт
curl -sSL https://raw.githubusercontent.com/Wallesters-org/Wallestars/main/deploy-vps.sh | bash
```

### Опция Б: Ръчна Инсталация

Вижте пълното ръководство: [HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md)

---

## 🤖 Browser Agent Automation

За автоматизация с browser agents, използвайте този workflow:

### 1. VPS Достъп
```javascript
// Browser agent script за VPS login
await page.goto('https://hpanel.hostinger.com');
await page.fill('#username', 'YOUR_EMAIL');
await page.fill('#password', 'YOUR_PASSWORD');
await page.click('button[type="submit"]');
```

### 2. SSH Terminal
```javascript
// Отворете SSH терминал
await page.click('text=VPS');
await page.click('text=Access');
await page.click('text=Open SSH Terminal');
```

### 3. Изпълнение на Команди
```javascript
// Изпълнете deployment команди
await page.keyboard.type('git clone https://github.com/Wallesters-org/Wallestars.git');
await page.keyboard.press('Enter');
// ... повтаряйте за всяка команда
```

Пълният browser agent скрипт е в: [browser-agent-deploy.js](./scripts/browser-agent-deploy.js)

---

## 📋 Основни Команди

### Разработка (Development)
```bash
npm run dev       # Стартира frontend + backend
npm run client    # Само frontend
npm run server    # Само backend
```

### Продукция (Production)
```bash
npm run build     # Компилира за продукция
npm start         # Стартира продукционния сървър
```

### PM2 (на VPS)
```bash
pm2 start server/index.js --name wallestars  # Стартира
pm2 status                                   # Проверява статус
pm2 logs wallestars                         # Показва логове
pm2 restart wallestars                      # Рестартира
pm2 stop wallestars                         # Спира
```

---

## 🔧 Конфигурация

### Environment Variables (.env)

**Минимална конфигурация:**
```env
ANTHROPIC_API_KEY=sk-ant-your-key
```

**Пълна конфигурация:**
```env
# API Keys
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Features
ENABLE_COMPUTER_USE=true
ENABLE_ANDROID=true

# Server
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://yourdomain.com
```

---

## 🎨 Smart Scan Функция

Новата Smart Scan функция поддържа:

### Мобилни Устройства ✅
- Оптимизирани бутони за докосване
- Responsive дизайн за всички екрани
- Scrollable прогрес стъпки
- Touch-friendly контроли

### Използване:
1. Отворете **Smart Scan** от менюто
2. **Upload Document** - качете снимка на фактура/документ
3. **Classify** - AI класифицира документа
4. **Extract** - Извлича данните автоматично
5. **Validate** - Проверява за грешки
6. **Review** - Редактирайте ако е нужно
7. **Export** - Изтеглете в Delta BG или TRZ формат

---

## 🌍 Достъп до Приложението

### Локално:
- Development: http://localhost:5173
- Production: http://localhost:3000

### Мрежа:
- Local Network: http://YOUR_LOCAL_IP:5173
- Ngrok: https://your-subdomain.ngrok.io

### Hostinger VPS:
- Domain: https://yourdomain.com
- IP: http://YOUR_VPS_IP (redirect към HTTPS)

---

## 🔒 SSL Сертификат (Let's Encrypt)

Автоматично инсталиране на VPS:

```bash
# Инсталирайте Certbot
sudo apt install certbot python3-certbot-nginx

# Получете сертификат
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal е настроен автоматично
```

Проверка:
```bash
sudo certbot certificates
```

---

## 📊 Мониторинг

### PM2 Monitoring
```bash
pm2 monit  # Real-time monitoring
pm2 plus   # Advanced monitoring (optional)
```

### Nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### Application Logs
```bash
pm2 logs wallestars --lines 100
```

---

## 🆘 Чести Проблеми

### Порт вече е зает
```bash
# Намерете процеса на порт 3000
sudo lsof -i :3000

# Спрете го
kill -9 PID
```

### Module not found
```bash
# Изтрийте node_modules и преинсталирайте
rm -rf node_modules package-lock.json
npm install
```

### Build грешки
```bash
# Изчистете cache
npm cache clean --force
rm -rf node_modules dist .vite
npm install
npm run build
```

### Nginx не стартира
```bash
# Проверете конфигурацията
sudo nginx -t

# Вижте грешките
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

---

## 📚 Допълнителни Ресурси

### Документация:
- [README.md](./README.md) - Общ преглед
- [HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md) - Пълно VPS ръководство
- [SMART_SCAN_DOCS.md](./SMART_SCAN_DOCS.md) - Smart Scan API
- [VPS_DEPLOYMENT.md](./VPS_DEPLOYMENT.md) - VPS deployment

### API Endpoints:
```
GET  /api/health              - Health check
POST /api/claude/chat         - Claude AI chat
POST /api/document-scanner/*  - Smart Scan API
```

### Полезни Връзки:
- 🌐 GitHub: https://github.com/Wallesters-org/Wallestars
- 🔑 Anthropic API: https://console.anthropic.com
- 🏢 Hostinger Panel: https://hpanel.hostinger.com
- 📖 Docs: В `/docs` директорията

---

## ✅ Checklist за Production

Преди да пуснете в продукция:

- [ ] `.env` файл с валиден API ключ
- [ ] Build завършен успешно (`npm run build`)
- [ ] PM2 стартиран и save-нат
- [ ] Nginx конфигуриран правилно
- [ ] SSL сертификат инсталиран
- [ ] Firewall настроен (ports 80, 443)
- [ ] DNS записи настроени
- [ ] Тестван достъп от мобилно
- [ ] Логове проверени за грешки
- [ ] Backup скрипт настроен (optional)

---

## 💡 Съвети

### Разработка:
- Използвайте `npm run dev` за hot-reload
- Проверявайте логовете в конзолата
- Използвайте Chrome DevTools за debugging

### Продукция:
- Винаги билдвайте преди deploy (`npm run build`)
- Използвайте PM2 за process management
- Настройте логове и мониторинг
- Правете редовни backup-и

### Сигурност:
- Никога не commit-вайте `.env` файл
- Използвайте силни пароли
- Актуализирайте редовно зависимостите
- Настройте firewall правилно

---

## 🤝 Поддръжка

За въпроси и проблеми:

1. Проверете документацията
2. Прегледайте логовете
3. Отворете Issue в GitHub
4. Консултирайте се с екипа

---

**Създадено с ❤️ от Wallestars Team**

**Версия**: 1.0.0  
**Последна актуализация**: Януари 2026  
**Статус**: ✅ Production Ready
