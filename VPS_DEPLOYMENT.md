# VPS Deployment Guide

## 🚀 Deploying Wallestars to VPS

This guide covers deploying Wallestars Control Center to a VPS with Nginx, SSL, and PM2.

**Target VPS**: 72.61.154.188 (srv1201204.hstgr.cloud)

---

## 📋 Prerequisites

### On Your VPS
- Ubuntu/Debian Linux
- Node.js 20.x or higher
- Nginx installed
- PM2 installed globally
- SSL certificate (Let's Encrypt)
- Domain configured (srv1201204.hstgr.cloud, n8n.srv1201204.hstgr.cloud)

### Required Access
- SSH access to VPS
- Sudo privileges
- Domain DNS configured

---

## 🔐 Security First: Initial VPS Setup

### 1. SSH into VPS

```bash
ssh user@72.61.154.188
```

### 2. Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Create Deployment User

```bash
# Create wallestars user
sudo adduser wallestars

# Add to sudo group (optional)
sudo usermod -aG sudo wallestars

# Switch to user
su - wallestars
```

### 4. Setup SSH Key Authentication

```bash
# On your local machine
ssh-keygen -t ed25519 -C "wallestars-deploy"

# Copy to VPS
ssh-copy-id wallestars@72.61.154.188

# Test login
ssh wallestars@72.61.154.188
```

### 5. Configure Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow Node.js app port (if needed externally)
sudo ufw allow 3000

# Allow N8N port
sudo ufw allow 5678

# Check status
sudo ufw status
```

---

## 📦 Installation

### 1. Install Node.js 20.x

```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x
npm --version
```

### 2. Install PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

### 3. Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### 4. Install Certbot (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Verify installation
certbot --version
```

---

## 🏗️ Deploy Wallestars Frontend

### 1. Clone Repository

```bash
# Create app directory
sudo mkdir -p /var/www/wallestars
sudo chown wallestars:wallestars /var/www/wallestars

# Clone repository
cd /var/www/wallestars
git clone https://github.com/Wallesters-org/Wallestars.git .

# Or upload files via SCP/SFTP
```

### 2. Install Dependencies

```bash
cd /var/www/wallestars
npm install
```

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

**Production .env:**
```env
# Anthropic API
ANTHROPIC_API_KEY=sk-ant-your-production-key-here

# Server Configuration
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://srv1201204.hstgr.cloud

# Features
ENABLE_COMPUTER_USE=true
ENABLE_ANDROID=false

# WebSocket
WS_PORT=3001
```

**Security Note**: Ensure `.env` has proper permissions:
```bash
chmod 600 .env
```

### 4. Validate Environment

```bash
# Run validation script
npm run validate-env
```

### 5. Build Frontend

```bash
# Build production bundle
npm run build

# Verify dist folder created
ls -la dist/
```

### 6. Setup PM2

```bash
# Start application with PM2
pm2 start server/index.js --name wallestars

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd

# Follow the command it outputs (usually needs sudo)
```

**PM2 Configuration File** (optional: `ecosystem.config.js`):
```javascript
module.exports = {
  apps: [{
    name: 'wallestars',
    script: 'server/index.js',
    cwd: '/var/www/wallestars',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

To use config file:
```bash
pm2 start ecosystem.config.js
pm2 save
```

---

## 🌐 Configure Nginx

### 1. Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/wallestars
```

**Nginx Configuration:**
```nginx
# Wallestars Control Center
server {
    listen 80;
    listen [::]:80;
    server_name srv1201204.hstgr.cloud;

    # Redirect HTTP to HTTPS (after SSL is configured)
    # return 301 https://$server_name$request_uri;

    root /var/www/wallestars/dist;
    index index.html;

    # Static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket proxy
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logs
    access_log /var/log/nginx/wallestars_access.log;
    error_log /var/log/nginx/wallestars_error.log;
}
```

### 2. Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/wallestars /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🔒 Setup SSL with Let's Encrypt

### 1. Obtain SSL Certificate

```bash
# Get certificate for Wallestars domain
sudo certbot --nginx -d srv1201204.hstgr.cloud

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (recommended)
```

### 2. Verify SSL Configuration

Certbot automatically modifies your Nginx config. Verify it:

```bash
sudo nano /etc/nginx/sites-available/wallestars
```

Should now include SSL configuration:
```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name srv1201204.hstgr.cloud;

    ssl_certificate /etc/letsencrypt/live/srv1201204.hstgr.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/srv1201204.hstgr.cloud/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Rest of configuration...
}
```

### 3. Test SSL Renewal

```bash
# Dry run renewal
sudo certbot renew --dry-run

# Certbot auto-renewal is configured via systemd timer
sudo systemctl status certbot.timer
```

---

## 🔧 Setup N8N Reverse Proxy

### 1. Create N8N Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/n8n
```

**N8N Nginx Configuration:**
```nginx
# N8N Automation Platform
server {
    listen 80;
    listen [::]:80;
    server_name n8n.srv1201204.hstgr.cloud;

    # Redirect HTTP to HTTPS (after SSL)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeouts for long-running workflows
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logs
    access_log /var/log/nginx/n8n_access.log;
    error_log /var/log/nginx/n8n_error.log;
}
```

### 2. Enable N8N Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/n8n /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 3. Setup N8N SSL

```bash
# Get certificate for N8N domain
sudo certbot --nginx -d n8n.srv1201204.hstgr.cloud
```

### 4. Configure N8N with PM2

Assuming N8N is already installed:

```bash
# Start N8N with PM2
pm2 start n8n --name n8n -- start

# Or with custom configuration
pm2 start n8n --name n8n -- start \
  --tunnel \
  -p 5678

# Save process
pm2 save
```

---

## 📊 PM2 Management

### Monitoring

```bash
# View all processes
pm2 list

# Monitor in real-time
pm2 monit

# View logs
pm2 logs wallestars
pm2 logs n8n

# View logs in real-time
pm2 logs --lines 100

# View specific process logs
pm2 logs wallestars --lines 50
```

### Process Control

```bash
# Restart processes
pm2 restart wallestars
pm2 restart n8n
pm2 restart all

# Stop processes
pm2 stop wallestars
pm2 stop all

# Delete process
pm2 delete wallestars

# Reload with zero downtime
pm2 reload wallestars
```

### Health Checks

Create a health check script: `/var/www/wallestars/health-check.sh`

```bash
#!/bin/bash

# Check if Wallestars is responding
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Wallestars is healthy"
else
    echo "❌ Wallestars is down, restarting..."
    pm2 restart wallestars
fi

# Check if N8N is responding
if curl -f http://localhost:5678/healthz > /dev/null 2>&1; then
    echo "✅ N8N is healthy"
else
    echo "❌ N8N is down, restarting..."
    pm2 restart n8n
fi
```

Make executable:
```bash
chmod +x /var/www/wallestars/health-check.sh
```

Add to crontab:
```bash
crontab -e

# Add line:
*/5 * * * * /var/www/wallestars/health-check.sh >> /var/log/health-check.log 2>&1
```

---

## ✅ Testing & Verification

### 1. Test Wallestars Frontend

```bash
# Test HTTP (before SSL)
curl http://srv1201204.hstgr.cloud

# Test HTTPS (after SSL)
curl https://srv1201204.hstgr.cloud

# Test API endpoint
curl https://srv1201204.hstgr.cloud/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-11T00:00:00.000Z",
  "services": {
    "claude": true,
    "computerUse": true,
    "android": false
  }
}
```

### 2. Test N8N Dashboard

```bash
# Test HTTP
curl http://n8n.srv1201204.hstgr.cloud

# Test HTTPS
curl https://n8n.srv1201204.hstgr.cloud

# Visit in browser
# https://n8n.srv1201204.hstgr.cloud
```

### 3. Test SSL Certificates

```bash
# Check certificate
echo | openssl s_client -servername srv1201204.hstgr.cloud -connect srv1201204.hstgr.cloud:443 2>/dev/null | openssl x509 -noout -dates

# Or use online tool: https://www.ssllabs.com/ssltest/
```

### 4. Test PM2 Processes

```bash
# Check process status
pm2 status

# Check logs for errors
pm2 logs --err --lines 50

# Monitor CPU/Memory
pm2 monit
```

### 5. Smoke Tests Checklist

- [ ] Frontend loads at https://srv1201204.hstgr.cloud
- [ ] No console errors in browser
- [ ] API health check returns 200
- [ ] N8N dashboard loads at https://n8n.srv1201204.hstgr.cloud
- [ ] SSL certificate is valid (green padlock)
- [ ] HTTP redirects to HTTPS
- [ ] PM2 shows all processes as "online"
- [ ] Logs show no critical errors
- [ ] WebSocket connection established (check browser network tab)

---

## 🔄 Deployment Updates

### Update Application

```bash
# Navigate to app directory
cd /var/www/wallestars

# Pull latest changes
git pull origin main

# Install new dependencies (if any)
npm install

# Rebuild frontend
npm run build

# Restart with zero downtime
pm2 reload wallestars

# Or restart (brief downtime)
pm2 restart wallestars

# Check logs
pm2 logs wallestars --lines 50
```

### Rollback

```bash
# Check git history
git log --oneline -5

# Rollback to previous commit
git reset --hard <commit-hash>

# Rebuild and restart
npm run build
pm2 reload wallestars
```

---

## 🚨 Troubleshooting

### Nginx Issues

```bash
# Check Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/wallestars_error.log

# Restart Nginx
sudo systemctl restart nginx
```

### PM2 Issues

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs wallestars --err --lines 100

# Restart process
pm2 restart wallestars

# Reset PM2
pm2 kill
pm2 resurrect
```

### SSL Issues

```bash
# Test certificate
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal

# Check Certbot logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

### Common Issues

**1. Port Already in Use**
```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

**2. Permission Denied**
```bash
# Fix ownership
sudo chown -R wallestars:wallestars /var/www/wallestars

# Fix permissions
chmod 755 /var/www/wallestars
```

**3. Node Module Issues**
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📈 Performance Optimization

### Enable Nginx Caching

Add to Nginx config:
```nginx
# Cache static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Enable Gzip Compression

Add to Nginx config:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
gzip_min_length 1000;
```

### PM2 Cluster Mode

For better performance:
```bash
pm2 start server/index.js --name wallestars -i max
```

---

## 🔐 Security Hardening

### 1. Firewall Rules

```bash
# Only allow necessary ports
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Fail2Ban

```bash
# Install Fail2Ban
sudo apt install -y fail2ban

# Configure
sudo nano /etc/fail2ban/jail.local

# Add Nginx protection
[nginx-http-auth]
enabled = true

[nginx-noscript]
enabled = true

[nginx-badbots]
enabled = true

# Restart Fail2Ban
sudo systemctl restart fail2ban
```

### 3. Regular Updates

```bash
# Setup unattended upgrades
sudo apt install -y unattended-upgrades

# Enable
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

---

## 📝 Maintenance Schedule

- **Daily**: Check PM2 logs for errors
- **Weekly**: Review Nginx logs, check disk space
- **Monthly**: Update dependencies, security patches
- **Quarterly**: Review and rotate credentials, SSL renewal check

---

## 📞 Support

For deployment issues:
- Check logs: `/var/log/nginx/` and `pm2 logs`
- Review documentation: [SECURITY.md](SECURITY.md)
- GitHub Issues: https://github.com/Wallesters-org/Wallestars/issues

---

**Last Updated**: January 11, 2026
