# 🚀 VPS Deployment Guide - Wallestars Control Center

**Версия:** 1.0.0  
**Дата:** 2026-01-03  
**За:** 15 Ubuntu Pro VPS Сървъри

---

## 📋 Съдържание

1. [Общ Преглед](#общ-преглед)
2. [Предварителни Изисквания](#предварителни-изисквания)
3. [Single VPS Setup](#single-vps-setup)
4. [Multi-VPS Automation](#multi-vps-automation)
5. [Docker Container Setup](#docker-container-setup)
6. [Nginx Configuration](#nginx-configuration)
7. [SSL/TLS Setup](#ssltls-setup)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Multi-Site Hosting](#multi-site-hosting)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Общ Преглед

Този guide описва как да deploy-нете Wallestars Control Center на:
- **Single VPS** - Един сайт на един сървър
- **Multiple VPS** - Automation за 15 сървъра
- **Multi-site** - Множество сайтове на един VPS
- **Load Balanced** - Разпределение на натоварването

### Архитектура

```
Internet
    ↓
[Domain DNS] → Your VPS IP
    ↓
[Nginx Reverse Proxy] :80, :443
    ↓
[Wallestars Backend] :3000
    ↓
[WebSocket] :3000
```

Или с Docker:

```
Internet
    ↓
[Nginx]
    ↓
[Docker Container: Wallestars] :3000
    ↓
[Docker Network]
```

---

## 🔧 Предварителни Изисквания

### За всеки VPS

#### Hardware Requirements (Minimum)
- **CPU:** 2 cores
- **RAM:** 2 GB
- **Storage:** 20 GB
- **Network:** 100 Mbps

#### Software Requirements
- **OS:** Ubuntu 20.04+ или Ubuntu Pro
- **Node.js:** 20.x LTS
- **npm:** 9.x+
- **Git:** 2.x+
- **Nginx:** 1.18+
- **Certbot:** Latest (за SSL)

#### Optional (за advanced features)
- **Docker:** 24.x+ & Docker Compose 2.x
- **xdotool:** За Linux desktop control
- **adb:** За Android control
- **PM2:** За process management

---

## 🖥️ Single VPS Setup

### Стъпка 1: Initial Server Setup

```bash
# SSH в сървъра
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install essential tools
apt install -y curl wget git build-essential

# Create deployment user
adduser wallestars
usermod -aG sudo wallestars

# Switch to wallestars user
su - wallestars
```

### Стъпка 2: Install Node.js

```bash
# Install Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should be v20.x.x
npm --version   # Should be 9.x or higher
```

### Стъпка 3: Install Wallestars

```bash
# Clone repository
cd ~
git clone https://github.com/Wallesters-org/Wallestars.git
cd Wallestars

# Install dependencies
npm install

# Build frontend
npm run build
```

### Стъпка 4: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

**Production `.env` configuration:**
```bash
# Anthropic API
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here

# Server Configuration
PORT=3000
NODE_ENV=production

# Features
ENABLE_COMPUTER_USE=false  # За VPS без GUI
ENABLE_ANDROID=false       # За VPS без Android devices

# Performance
SCREENSHOT_INTERVAL=2000

# Production settings
FRONTEND_URL=https://yourdomain.com
```

### Стъпка 5: Install PM2 Process Manager

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start Wallestars with PM2
pm2 start npm --name "wallestars" -- start

# Enable PM2 startup on boot
pm2 startup systemd
# Copy and run the command it outputs

# Save PM2 configuration
pm2 save

# Check status
pm2 status
pm2 logs wallestars
```

### Стъпка 6: Install and Configure Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/wallestars
```

**Nginx configuration (`/etc/nginx/sites-available/wallestars`):**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/wallestars-access.log;
    error_log /var/log/nginx/wallestars-error.log;

    # Main application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Static assets caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Enable site and restart Nginx:**
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/wallestars /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx on boot
sudo systemctl enable nginx
```

### Стъпка 7: Configure Firewall

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### Стъпка 8: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

**Certbot автоматично ще обнови Nginx config за HTTPS.**

### Стъпка 9: Verify Deployment

```bash
# Check PM2 status
pm2 status

# Check Nginx status
sudo systemctl status nginx

# Check logs
pm2 logs wallestars --lines 50

# Test health endpoint
curl http://localhost:3000/api/health

# Test from outside
curl https://yourdomain.com/api/health
```

---

## 🔄 Multi-VPS Automation

### Automation за 15 VPS Сървъра

#### Стъпка 1: Подготовка

**Създайте файл `vps-list.txt` с IP адресите:**
```
192.168.1.10
192.168.1.11
192.168.1.12
...
192.168.1.24
```

**Създайте SSH key за automation:**
```bash
# На вашата локална машина
ssh-keygen -t ed25519 -f ~/.ssh/wallestars_deploy -C "wallestars-deployment"

# Copy public key to all VPS (за всеки VPS)
ssh-copy-id -i ~/.ssh/wallestars_deploy.pub root@VPS_IP
```

#### Стъпка 2: Deployment Script

Създайте `deploy-to-vps.sh`:

```bash
#!/bin/bash

# deploy-to-vps.sh - Automated VPS deployment script
# Usage: ./deploy-to-vps.sh

set -e

# Configuration
REPO_URL="https://github.com/Wallesters-org/Wallestars.git"
DEPLOY_USER="wallestars"
NODE_VERSION="20"
DOMAIN_SUFFIX="wallestars.com"  # Adjust as needed

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Read VPS list
VPS_LIST="vps-list.txt"

if [ ! -f "$VPS_LIST" ]; then
    echo -e "${RED}Error: $VPS_LIST not found${NC}"
    exit 1
fi

# Function to deploy to single VPS
deploy_to_vps() {
    local VPS_IP=$1
    local VPS_NUM=$2
    
    echo -e "${YELLOW}=== Deploying to VPS #$VPS_NUM ($VPS_IP) ===${NC}"
    
    # SSH and execute deployment commands
    ssh -i ~/.ssh/wallestars_deploy root@$VPS_IP << 'ENDSSH'
        set -e
        
        # Update system
        echo "Updating system..."
        apt update && apt upgrade -y
        
        # Install essentials
        apt install -y curl wget git build-essential nginx ufw certbot python3-certbot-nginx
        
        # Install Node.js 20.x
        if ! command -v node &> /dev/null; then
            echo "Installing Node.js..."
            curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
            apt install -y nodejs
        fi
        
        # Install PM2
        npm install -g pm2
        
        # Create wallestars user if doesn't exist
        if ! id "wallestars" &>/dev/null; then
            echo "Creating wallestars user..."
            adduser --disabled-password --gecos "" wallestars
            usermod -aG sudo wallestars
        fi
        
        # Switch to wallestars user for deployment
        sudo -u wallestars bash << 'ENDUSER'
            cd ~
            
            # Clone or update repository
            if [ -d "Wallestars" ]; then
                echo "Updating existing repository..."
                cd Wallestars
                git pull
            else
                echo "Cloning repository..."
                git clone https://github.com/Wallesters-org/Wallestars.git
                cd Wallestars
            fi
            
            # Install dependencies
            echo "Installing dependencies..."
            npm install
            
            # Build frontend
            echo "Building frontend..."
            npm run build
            
            # Setup environment
            if [ ! -f ".env" ]; then
                cp .env.example .env
                echo "⚠️ Remember to edit .env with your API key!"
            fi
            
            # Start with PM2
            echo "Starting application with PM2..."
            pm2 delete wallestars 2>/dev/null || true
            pm2 start npm --name "wallestars" -- start
            pm2 save
            
            echo "✅ Application deployed successfully"
ENDUSER
        
        # Configure Nginx
        echo "Configuring Nginx..."
        cat > /etc/nginx/sites-available/wallestars << 'ENDNGINX'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
ENDNGINX
        
        # Enable site
        ln -sf /etc/nginx/sites-available/wallestars /etc/nginx/sites-enabled/
        rm -f /etc/nginx/sites-enabled/default
        
        # Test and restart Nginx
        nginx -t && systemctl restart nginx
        systemctl enable nginx
        
        # Configure firewall
        echo "Configuring firewall..."
        ufw --force enable
        ufw allow 22/tcp
        ufw allow 80/tcp
        ufw allow 443/tcp
        
        echo "✅ VPS setup complete!"
        
        # Print status
        sudo -u wallestars pm2 status
ENDSSH
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ VPS #$VPS_NUM ($VPS_IP) deployed successfully${NC}"
    else
        echo -e "${RED}❌ VPS #$VPS_NUM ($VPS_IP) deployment failed${NC}"
    fi
    
    echo ""
}

# Main deployment loop
echo -e "${GREEN}Starting deployment to multiple VPS servers${NC}"
echo "Reading VPS list from $VPS_LIST"
echo ""

VPS_NUM=1
while IFS= read -r VPS_IP; do
    # Skip empty lines and comments
    [[ -z "$VPS_IP" || "$VPS_IP" =~ ^#.* ]] && continue
    
    deploy_to_vps "$VPS_IP" "$VPS_NUM"
    VPS_NUM=$((VPS_NUM + 1))
    
    # Add small delay between deployments
    sleep 2
done < "$VPS_LIST"

echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo "Total VPS servers processed: $((VPS_NUM - 1))"
```

**Направете скрипта изпълним:**
```bash
chmod +x deploy-to-vps.sh
```

**Изпълнете deployment:**
```bash
./deploy-to-vps.sh
```

#### Стъпка 3: Bulk Configuration Update

Създайте `update-env-bulk.sh` за update на `.env` на всички VPS:

```bash
#!/bin/bash

# update-env-bulk.sh - Update .env on all VPS servers
# Usage: ./update-env-bulk.sh

VPS_LIST="vps-list.txt"
API_KEY="$1"

if [ -z "$API_KEY" ]; then
    echo "Usage: ./update-env-bulk.sh <ANTHROPIC_API_KEY>"
    exit 1
fi

while IFS= read -r VPS_IP; do
    [[ -z "$VPS_IP" || "$VPS_IP" =~ ^#.* ]] && continue
    
    echo "Updating $VPS_IP..."
    
    ssh -i ~/.ssh/wallestars_deploy root@$VPS_IP << ENDSSH
        sudo -u wallestars bash << 'ENDUSER'
            cd ~/Wallestars
            sed -i "s/ANTHROPIC_API_KEY=.*/ANTHROPIC_API_KEY=$API_KEY/" .env
            pm2 restart wallestars
            echo "✅ Updated and restarted"
ENDUSER
ENDSSH
    
done < "$VPS_LIST"

echo "All VPS servers updated!"
```

```bash
chmod +x update-env-bulk.sh
./update-env-bulk.sh sk-ant-your-api-key-here
```

#### Стъпка 4: Monitoring Script

Създайте `monitor-all-vps.sh`:

```bash
#!/bin/bash

# monitor-all-vps.sh - Check status of all VPS servers
# Usage: ./monitor-all-vps.sh

VPS_LIST="vps-list.txt"

echo "=== Wallestars VPS Cluster Status ==="
echo ""

VPS_NUM=1
ONLINE=0
OFFLINE=0

while IFS= read -r VPS_IP; do
    [[ -z "$VPS_IP" || "$VPS_IP" =~ ^#.* ]] && continue
    
    printf "VPS #%-2d (%s): " "$VPS_NUM" "$VPS_IP"
    
    # Check if SSH is accessible
    if timeout 5 ssh -i ~/.ssh/wallestars_deploy -o ConnectTimeout=5 -o BatchMode=yes root@$VPS_IP "echo 2>&1" &>/dev/null; then
        # Check if Wallestars is running
        STATUS=$(ssh -i ~/.ssh/wallestars_deploy root@$VPS_IP "sudo -u wallestars pm2 jlist 2>/dev/null" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
        
        if [ "$STATUS" == "online" ]; then
            echo "✅ ONLINE"
            ONLINE=$((ONLINE + 1))
        else
            echo "⚠️  PM2 status: $STATUS"
            OFFLINE=$((OFFLINE + 1))
        fi
    else
        echo "❌ UNREACHABLE"
        OFFLINE=$((OFFLINE + 1))
    fi
    
    VPS_NUM=$((VPS_NUM + 1))
done < "$VPS_LIST"

echo ""
echo "=== Summary ==="
echo "Total VPS: $((VPS_NUM - 1))"
echo "Online: $ONLINE"
echo "Offline/Unreachable: $OFFLINE"
```

```bash
chmod +x monitor-all-vps.sh
./monitor-all-vps.sh
```

---

## 🐳 Docker Container Setup

### Dockerfile

Създайте `Dockerfile` в root на проекта:

```dockerfile
# Dockerfile для Wallestars Control Center
FROM node:20-alpine

# Install system dependencies for screenshots (optional)
# RUN apk add --no-cache xdotool scrot

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build frontend
RUN npm run build

# Expose ports
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["npm", "start"]
```

### Docker Compose

Създайте `docker-compose.yml`:

```yaml
version: '3.8'

services:
  wallestars:
    build: .
    container_name: wallestars
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - ENABLE_COMPUTER_USE=false
      - ENABLE_ANDROID=false
    volumes:
      - ./logs:/app/logs
    networks:
      - wallestars-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    image: nginx:alpine
    container_name: wallestars-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - wallestars
    networks:
      - wallestars-network

networks:
  wallestars-network:
    driver: bridge
```

### .dockerignore

Създайте `.dockerignore`:

```
node_modules
.git
.github
.env
.env.*
npm-debug.log
*.md
.vscode
.idea
dist
```

### Build и Deploy с Docker

```bash
# Build image
docker build -t wallestars:latest .

# Run with docker-compose
docker-compose up -d

# Check logs
docker-compose logs -f wallestars

# Check status
docker-compose ps

# Stop
docker-compose down

# Update and restart
git pull
docker-compose up -d --build
```

### Docker Deployment Script за VPS

Създайте `deploy-docker-bulk.sh`:

```bash
#!/bin/bash

# deploy-docker-bulk.sh - Deploy Docker containers to all VPS
# Usage: ./deploy-docker-bulk.sh

VPS_LIST="vps-list.txt"

deploy_docker() {
    local VPS_IP=$1
    
    echo "Deploying Docker to $VPS_IP..."
    
    ssh -i ~/.ssh/wallestars_deploy root@$VPS_IP << 'ENDSSH'
        # Install Docker
        if ! command -v docker &> /dev/null; then
            curl -fsSL https://get.docker.com | sh
            systemctl enable docker
            systemctl start docker
        fi
        
        # Install Docker Compose
        if ! command -v docker-compose &> /dev/null; then
            curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
            chmod +x /usr/local/bin/docker-compose
        fi
        
        # Clone/update repository
        cd /opt
        if [ -d "Wallestars" ]; then
            cd Wallestars && git pull
        else
            git clone https://github.com/Wallesters-org/Wallestars.git
            cd Wallestars
        fi
        
        # Setup environment
        if [ ! -f ".env" ]; then
            cp .env.example .env
        fi
        
        # Build and start
        docker-compose up -d --build
        
        echo "✅ Docker deployment complete"
ENDSSH
}

while IFS= read -r VPS_IP; do
    [[ -z "$VPS_IP" || "$VPS_IP" =~ ^#.* ]] && continue
    deploy_docker "$VPS_IP"
done < "$VPS_LIST"
```

---

## 🌐 Multi-Site Hosting

### Hosting на множество сайтове на един VPS

#### Nginx Multi-Site Configuration

Всеки site на различен порт или subdomain:

**Option 1: Different Ports**
```nginx
# Site 1 на порт 3001
server {
    listen 80;
    server_name site1.yourdomain.com;
    location / {
        proxy_pass http://localhost:3001;
        # ... proxy settings
    }
}

# Site 2 на порт 3002
server {
    listen 80;
    server_name site2.yourdomain.com;
    location / {
        proxy_pass http://localhost:3002;
        # ... proxy settings
    }
}
```

**Option 2: Different Subdomains**
```bash
# Start multiple instances with PM2
pm2 start npm --name "wallestars-site1" -- start -- --port 3001
pm2 start npm --name "wallestars-site2" -- start -- --port 3002
pm2 start npm --name "wallestars-site3" -- start -- --port 3003
```

#### Multi-Site Management Script

Създайте `manage-sites.sh`:

```bash
#!/bin/bash

# manage-sites.sh - Manage multiple Wallestars instances
# Usage: ./manage-sites.sh [start|stop|restart|status] [site-name]

ACTION=$1
SITE=$2

SITES_DIR="/opt/wallestars-sites"

start_site() {
    local site=$1
    local port=$((3000 + $(echo $site | sed 's/site//') ))
    
    cd "$SITES_DIR/$site"
    PORT=$port pm2 start npm --name "wallestars-$site" -- start
    echo "Started $site on port $port"
}

stop_site() {
    local site=$1
    pm2 stop "wallestars-$site"
    echo "Stopped $site"
}

case "$ACTION" in
    start)
        if [ -n "$SITE" ]; then
            start_site "$SITE"
        else
            # Start all sites
            for site in $(ls "$SITES_DIR"); do
                start_site "$site"
            done
        fi
        ;;
    stop)
        if [ -n "$SITE" ]; then
            stop_site "$SITE"
        else
            pm2 stop all
        fi
        ;;
    restart)
        pm2 restart ${SITE:+wallestars-$SITE}
        ;;
    status)
        pm2 status
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status} [site-name]"
        exit 1
        ;;
esac
```

---

## 📊 Monitoring & Maintenance

### System Monitoring

#### Install Monitoring Tools

```bash
# Install htop for resource monitoring
sudo apt install -y htop

# Install netdata for comprehensive monitoring (optional)
bash <(curl -Ss https://my-netdata.io/kickstart.sh)

# Access netdata at http://your-vps-ip:19999
```

#### Custom Monitoring Script

Създайте `health-check.sh`:

```bash
#!/bin/bash

# health-check.sh - Health check for Wallestars
# Add to crontab: */5 * * * * /path/to/health-check.sh

HEALTH_URL="http://localhost:3000/api/health"
LOG_FILE="/var/log/wallestars-health.log"

# Check if service responds
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

if [ "$HTTP_CODE" -eq 200 ]; then
    echo "[$TIMESTAMP] ✅ Service is healthy (HTTP $HTTP_CODE)" >> $LOG_FILE
else
    echo "[$TIMESTAMP] ❌ Service is down (HTTP $HTTP_CODE)" >> $LOG_FILE
    
    # Attempt to restart
    pm2 restart wallestars
    
    echo "[$TIMESTAMP] 🔄 Attempted restart" >> $LOG_FILE
    
    # Send alert (optional - integrate with your notification system)
    # curl -X POST https://your-webhook-url -d "Wallestars service down, restarted"
fi

# Keep only last 1000 lines of log
tail -n 1000 $LOG_FILE > $LOG_FILE.tmp && mv $LOG_FILE.tmp $LOG_FILE
```

**Add to crontab:**
```bash
chmod +x health-check.sh
crontab -e

# Add this line:
*/5 * * * * /home/wallestars/health-check.sh
```

### Log Management

```bash
# PM2 log rotation
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### Backup Script

Създайте `backup.sh`:

```bash
#!/bin/bash

# backup.sh - Backup Wallestars configuration
# Usage: ./backup.sh

BACKUP_DIR="/backups/wallestars"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/wallestars_backup_$TIMESTAMP.tar.gz"

mkdir -p $BACKUP_DIR

# Backup important files
tar -czf $BACKUP_FILE \
    ~/Wallestars/.env \
    ~/Wallestars/package.json \
    ~/Wallestars/package-lock.json \
    /etc/nginx/sites-available/wallestars \
    ~/.pm2/dump.pm2

echo "Backup created: $BACKUP_FILE"

# Keep only last 7 backups
ls -t $BACKUP_DIR/wallestars_backup_*.tar.gz | tail -n +8 | xargs -r rm

echo "Old backups cleaned"
```

**Add to crontab for daily backups:**
```bash
0 2 * * * /home/wallestars/backup.sh
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Service won't start
```bash
# Check logs
pm2 logs wallestars --lines 100

# Check port availability
sudo netstat -tulpn | grep :3000

# Kill process on port 3000 if needed
sudo fuser -k 3000/tcp

# Restart service
pm2 restart wallestars
```

#### 2. Nginx errors
```bash
# Test configuration
sudo nginx -t

# Check error log
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

#### 3. SSL certificate issues
```bash
# Renew certificate manually
sudo certbot renew --force-renewal

# Check certificate status
sudo certbot certificates

# Restart Nginx after renewal
sudo systemctl restart nginx
```

#### 4. High memory usage
```bash
# Check memory usage
pm2 monit

# Restart application
pm2 restart wallestars

# Check system resources
htop
free -h
df -h
```

#### 5. API key not working
```bash
# Verify .env file
cat ~/Wallestars/.env | grep ANTHROPIC_API_KEY

# Update .env
nano ~/Wallestars/.env

# Restart application
pm2 restart wallestars
```

### Performance Optimization

```bash
# Enable PM2 cluster mode for better CPU utilization
pm2 start npm --name "wallestars" -i max -- start

# Set Node.js memory limit
pm2 start npm --name "wallestars" --node-args="--max-old-space-size=2048" -- start

# Enable HTTP/2 in Nginx
# Add to Nginx config: listen 443 ssl http2;
```

---

## 📝 Maintenance Checklist

### Daily
- [ ] Check PM2 status: `pm2 status`
- [ ] Review logs: `pm2 logs wallestars --lines 50`
- [ ] Check disk space: `df -h`

### Weekly
- [ ] Review error logs: `tail -100 /var/log/nginx/error.log`
- [ ] Check security updates: `apt list --upgradable`
- [ ] Verify SSL certificates: `sudo certbot certificates`
- [ ] Review health check logs

### Monthly
- [ ] Update system packages: `sudo apt update && sudo apt upgrade`
- [ ] Update Node.js dependencies: `npm outdated && npm update`
- [ ] Review and rotate logs
- [ ] Test backup restoration
- [ ] Security audit: `npm audit`

---

## 🎯 Quick Commands Reference

```bash
# PM2
pm2 status                    # Check status
pm2 restart wallestars        # Restart app
pm2 logs wallestars           # View logs
pm2 monit                     # Monitor resources
pm2 save                      # Save configuration
pm2 list                      # List all processes

# Nginx
sudo systemctl status nginx   # Check status
sudo systemctl restart nginx  # Restart
sudo nginx -t                 # Test configuration
sudo tail -f /var/log/nginx/access.log  # Access logs

# System
htop                          # System monitor
netstat -tulpn               # Check ports
du -sh /home/wallestars/*    # Check disk usage
journalctl -u nginx -f       # System logs

# Docker
docker-compose ps            # Check containers
docker-compose logs -f       # View logs
docker-compose restart       # Restart all
docker-compose down && docker-compose up -d  # Full restart
```

---

## 🚀 Next Steps

1. **Setup първи VPS** - Следвайте Single VPS Setup
2. **Test deployment** - Проверете че всичко работи
3. **Configure monitoring** - Setup health checks и alerts
4. **Deploy на останалите VPS** - Използвайте automation scripts
5. **Setup SSL** - Конфигурирайте certificates за всички domains
6. **Configure backups** - Setup автоматични backups
7. **Document** - Запазете IP адреси, passwords, domains

---

**Вижте също:**
- [PLATFORM_STATUS.md](./PLATFORM_STATUS.md) - Текущо състояние
- [CONTAINER_SETUP.md](./CONTAINER_SETUP.md) - Docker orchestration
- [AUTOMATION_GUIDE.md](./AUTOMATION_GUIDE.md) - Advanced automation

---

*Този guide е част от Wallestars Platform Documentation Suite*
