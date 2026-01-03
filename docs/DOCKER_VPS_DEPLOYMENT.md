# 🐳 Docker Контейнери - VPS/VMS Ubuntu Pro Деплоймънт

## 📋 Съдържание

1. [Какво е Docker и защо го използваме](#какво-е-docker)
2. [Изисквания за системата](#изисквания-за-системата)
3. [Инсталация на VPS/VMS](#инсталация-на-vpsvms)
4. [Конфигуриране на контейнера](#конфигуриране-на-контейнера)
5. [Деплоймънт и управление](#деплоймънт-и-управление)
6. [Мониторинг и поддръжка](#мониторинг-и-поддръжка)

---

## 🐋 Какво е Docker?

**Docker** е платформа за контейнеризация, която позволява опаковане на приложението и всички негови зависимости в изолирани контейнери.

### ✨ Предимства:

- 📦 **Портативност** - работи навсякъде еднакво
- 🔒 **Изолация** - всяко приложение в отделен контейнер
- ⚡ **Ефективност** - по-лек от виртуални машини
- 🔄 **Лесно скалиране** - бързо разгръщане на нови инстанции
- 🛠️ **Consistency** - идентична среда за dev, test, production

### 🎯 Архитектура на Wallestars в Docker:

```
┌─────────────────────────────────────────────────────────┐
│  HOST SYSTEM (Ubuntu Pro VPS/VMS)                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🐳 Docker Engine                                       │
│     │                                                   │
│     ├─ 📦 Wallestars Container                         │
│     │   ├─ Node.js 20 Alpine                           │
│     │   ├─ Express Server (Port 3000)                  │
│     │   ├─ Socket.IO (Port 3001)                       │
│     │   ├─ React Frontend (dist/)                      │
│     │   ├─ xdotool (Computer Use)                      │
│     │   └─ ADB (Android Control)                       │
│     │                                                   │
│     └─ 🌐 Network Bridge                               │
│         ├─ Port 3000 → HTTP                            │
│         └─ Port 3001 → WebSocket                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 💻 Изисквания за системата

### Минимални изисквания:

```
CPU:     2 cores (препоръчително 4)
RAM:     2 GB (препоръчително 4 GB)
DISK:    20 GB свободно пространство
OS:      Ubuntu Pro 22.04 LTS или по-нова
Network: Публичен IP адрес
```

### Софтуер:

- Docker Engine 24.0+
- Docker Compose 2.20+
- Git
- SSH достъп

---

## 🚀 Инсталация на VPS/VMS

### Стъпка 1: Свързване към сървъра

```bash
# SSH връзка
ssh username@your-vps-ip

# Например:
ssh root@45.123.456.789
```

### Стъпка 2: Актуализация на системата

```bash
# Актуализиране на пакетите
sudo apt update && sudo apt upgrade -y

# Инсталиране на необходими инструменти
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw
```

### Стъпка 3: Инсталация на Docker

```bash
# Добавяне на Docker GPG ключ
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Добавяне на Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Инсталиране на Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Стартиране на Docker
sudo systemctl start docker
sudo systemctl enable docker

# Проверка
docker --version
docker compose version
```

### Стъпка 4: Конфигуриране на потребителски достъп

```bash
# Добавяне на потребител към docker група
sudo usermod -aG docker $USER

# Излезте и влезте отново за да приложите промените
exit
ssh username@your-vps-ip

# Тест без sudo
docker ps
```

### Стъпка 5: Конфигуриране на Firewall

```bash
# Активиране на UFW
sudo ufw enable

# Разрешаване на SSH
sudo ufw allow 22/tcp

# Разрешаване на HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Разрешаване на Wallestars портове
sudo ufw allow 3000/tcp
sudo ufw allow 3001/tcp

# Проверка
sudo ufw status
```

---

## 📦 Конфигуриране на контейнера

### Стъпка 1: Клониране на проекта

```bash
# Създаване на директория за проекти
mkdir -p ~/apps
cd ~/apps

# Клониране на repository
git clone https://github.com/Wallesters-org/Wallestars.git
cd Wallestars

# Checkout на правилния branch (ако е необходимо)
git checkout main
```

### Стъпка 2: Конфигуриране на environment variables

```bash
# Копиране на example файла
cp .env.example .env

# Редактиране на .env файла
nano .env
```

**Попълнете следните стойности:**

```env
# Anthropic API Configuration
ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here

# Server Configuration
PORT=3000
NODE_ENV=production

# Linux Computer Use
ENABLE_COMPUTER_USE=true
SCREENSHOT_INTERVAL=2000

# Android ADB Configuration
ADB_HOST=localhost
ADB_PORT=5037
ENABLE_ANDROID=false

# WebSocket Configuration
WS_PORT=3001

# Frontend URL (your VPS public IP or domain)
FRONTEND_URL=http://your-vps-ip:3000
```

### Стъпка 3: Преглед на Docker файловете

```bash
# Структура на Docker конфигурацията
ls -la
```

Трябва да видите:

- ✅ `Dockerfile` - Дефиниция на контейнера
- ✅ `docker-compose.yml` - Оркестрация
- ✅ `.dockerignore` - Игнорирани файлове

---

## 🔨 Build и Deploy

### Визуален процес:

```
┌─────────────────────────────────────────────────────────┐
│  DEPLOYMENT FLOW                                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1️⃣  BUILD IMAGE                                        │
│     docker compose build                                │
│          ↓                                              │
│     • Изтегляне на base image (node:20-alpine)         │
│     • Build на React frontend                          │
│     • Инсталиране на dependencies                      │
│     • Копиране на server файлове                       │
│          ↓                                              │
│  2️⃣  START CONTAINERS                                   │
│     docker compose up -d                                │
│          ↓                                              │
│     • Създаване на network                             │
│     • Стартиране на контейнер                          │
│     • Mapping на портове                               │
│     • Health check                                     │
│          ↓                                              │
│  3️⃣  VERIFY                                             │
│     http://your-vps-ip:3000                            │
│          ↓                                              │
│     ✅ Приложението работи!                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Команди за деплоймънт:

```bash
# Build на Docker image
docker compose build

# Стартиране на контейнерите (detached mode)
docker compose up -d

# Проверка на статуса
docker compose ps

# Преглед на логовете
docker compose logs -f

# Проверка дали контейнерът е healthy
docker ps
```

### Тестване:

```bash
# Health check
curl http://localhost:3000/api/health

# Или от браузър
# http://your-vps-ip:3000
```

---

## 🎛️ Управление на контейнерите

### Основни команди:

```bash
# Стартиране
docker compose up -d

# Спиране
docker compose down

# Рестартиране
docker compose restart

# Преглед на логове
docker compose logs -f wallestars

# Влизане в контейнера (за debugging)
docker compose exec wallestars sh

# Проверка на ресурсите
docker stats wallestars-control-center

# Премахване на контейнери и volumes
docker compose down -v
```

### Update на приложението:

```bash
# Pull на последните промени
cd ~/apps/Wallestars
git pull origin main

# Rebuild и restart
docker compose down
docker compose build --no-cache
docker compose up -d

# Проверка
docker compose logs -f
```

---

## 📊 Мониторинг и поддръжка

### Автоматично рестартиране:

Добавено в `docker-compose.yml`:

```yaml
restart: unless-stopped
```

### Health checks:

```bash
# Ръчна проверка
docker inspect --format='{{.State.Health.Status}}' wallestars-control-center

# Continuous health monitoring
watch -n 5 'docker inspect --format="{{.State.Health.Status}}" wallestars-control-center'
```

### Логове:

```bash
# Real-time логове
docker compose logs -f

# Последните 100 реда
docker compose logs --tail=100

# Логове само за грешки
docker compose logs | grep -i error

# Експортиране на логове
docker compose logs > logs/wallestars-$(date +%Y%m%d).log
```

### Backup:

```bash
# Създаване на backup script
cat > ~/apps/backup-wallestars.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=~/backups/wallestars

mkdir -p $BACKUP_DIR

# Backup на .env файл
cp ~/apps/Wallestars/.env $BACKUP_DIR/.env.$DATE

# Backup на логове
docker compose logs > $BACKUP_DIR/logs.$DATE.txt

# Backup на volumes (ако има)
docker run --rm -v wallestars_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/volumes.$DATE.tar.gz /data

echo "Backup completed: $DATE"
EOF

# Правене на изпълним
chmod +x ~/apps/backup-wallestars.sh

# Тест
~/apps/backup-wallestars.sh
```

### Автоматизиране на backup с cron:

```bash
# Редактиране на crontab
crontab -e

# Добавяне на ежедневен backup в 2:00 AM
0 2 * * * ~/apps/backup-wallestars.sh
```

---

## 🔒 Сигурност

### SSL/TLS с Let's Encrypt (препоръчително):

```bash
# Инсталиране на Certbot
sudo apt install -y certbot

# Получаване на сертификат (ако имате домейн)
sudo certbot certonly --standalone -d yourdomain.com

# Автоматично обновяване
sudo systemctl enable certbot.timer
```

### Reverse Proxy с Nginx:

```bash
# Инсталиране на Nginx
sudo apt install -y nginx

# Конфигурация
sudo nano /etc/nginx/sites-available/wallestars
```

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
# Активиране
sudo ln -s /etc/nginx/sites-available/wallestars /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🌐 Интеграция с Hostinger VPS

### Специфични настройки за Hostinger:

```bash
# 1. SSH връзка към Hostinger VPS
ssh root@your-hostinger-vps-ip

# 2. Следвайте стъпките за инсталация по-горе

# 3. Конфигуриране на DNS (в Hostinger панела)
# A Record: @ → your-vps-ip
# A Record: www → your-vps-ip

# 4. SSL чрез Hostinger (автоматично) или Let's Encrypt
```

### Оптимизация за производителност:

```bash
# Увеличаване на file descriptor limits
sudo nano /etc/security/limits.conf
```

Добавете:

```
* soft nofile 65535
* hard nofile 65535
```

```bash
# Swap file (ако нямате достатъчно RAM)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 🎯 Архитектура на пълната система

```
┌──────────────────────────────────────────────────────────┐
│  INTERNET                                                │
└────────────┬─────────────────────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────────────────────┐
│  CLOUDFLARE / DNS                                        │
│  yourdomain.com → VPS IP                                 │
└────────────┬─────────────────────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────────────────────┐
│  HOSTINGER VPS (Ubuntu Pro 22.04)                        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  🔒 UFW Firewall                                         │
│     ├─ Port 22 (SSH)                                    │
│     ├─ Port 80 (HTTP)                                   │
│     ├─ Port 443 (HTTPS)                                 │
│     └─ Ports 3000, 3001 (Wallestars)                    │
│          ↓                                               │
│  🌐 Nginx Reverse Proxy (optional)                      │
│     ├─ SSL/TLS Termination                              │
│     └─ Load Balancing                                   │
│          ↓                                               │
│  🐳 Docker Engine                                        │
│     └─ 📦 Wallestars Container                          │
│         ├─ Express Server :3000                         │
│         ├─ Socket.IO :3001                              │
│         ├─ React Frontend                               │
│         └─ Claude AI Integration                        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 📞 Полезни ресурси

- 📖 [Docker Documentation](https://docs.docker.com/)
- 🎓 [Docker Compose Guide](https://docs.docker.com/compose/)
- 💬 [Ubuntu Pro](https://ubuntu.com/pro)
- 🔧 [Hostinger VPS Tutorials](https://www.hostinger.com/tutorials/vps)
- 🐳 [Docker Hub](https://hub.docker.com/)

---

## ⚡ Бързи команди (Cheat Sheet)

```bash
# Build & Start
docker compose up -d --build

# Stop & Remove
docker compose down -v

# Logs
docker compose logs -f

# Restart
docker compose restart

# Update & Redeploy
git pull && docker compose up -d --build

# Clean everything
docker system prune -a --volumes

# Check health
curl http://localhost:3000/api/health

# Enter container
docker compose exec wallestars sh
```

---

✅ **Готово!** Вашето Wallestars Control Center е deploynato и работи в Docker контейнер на вашия VPS! 🎉
