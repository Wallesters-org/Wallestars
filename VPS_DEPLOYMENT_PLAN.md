# 🚀 COMPREHENSIVE VPS DEPLOYMENT PLAN FOR WALLESTARS

**Complete Production Deployment Guide for Wallestars Control Center on VPS**

---

## 📊 PROJECT STATUS (2026-01-08)

### ✅ Completed Components:
- **87 Pull Requests** (Development in Progress)
- **Eva Core** - AI context analysis algorithm
- **DJ Workflow** - n8n multi-chain automation
- **7 Platforms** - Email, VPS Monitor, Telegram, Phone Numbers, Task Automation, Website Builder, Free Trial
- **33mail Manager** - Email integration
- **Hostinger VPS** - Hosting solution
- **Docker & DevContainer** - Complete configuration
- **MCP Integration** - Claude Desktop integration

---

## 🏗️ ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                    WALLESTARS VPS STACK                     │
└─────────────────────────────────────────────────────────────┘

          Internet (443 HTTPS + 80 HTTP)
                      ↓
          ┌──────────────────────┐
          │    Nginx Proxy       │ (Reverse Proxy + SSL/TLS)
          └──────────────────────┘
                      ↓
        ┌─────────────┼─────────────┐
        ↓             ↓             ↓
    ┌────────┐   ┌────────┐   ┌────────┐
    │ API    │   │n8n     │   │Static  │
    │:3000   │   │:5678   │   │Files   │
    └────────┘   └────────┘   └────────┘
        ↓             ↓             ↓
    ┌─────────────────────────────────────┐
    │      Express.js Backend Stack       │
    │  ├─ Eva Core (Context Processor)   │
    │  ├─ Claude AI Integration          │
    │  ├─ Webhook Handlers               │
    │  └─ API Routes                     │
    └─────────────────────────────────────┘
        ↓             ↓             ↓
    ┌────────┐   ┌────────┐   ┌────────┐
    │PostgreSQL  │ Redis  │  │Supabase│
    │:5432       │:6379   │  │Remote  │
    └────────┘   └────────┘   └────────┘

┌─────────────────────────────────────────────────────────────┐
│              INTEGRATION MODULES (Python)                   │
├─────────────────────────────────────────────────────────────┤
│  ├─ 33mail Manager        (Email Automation)               │
│  ├─ Hostinger VPS Manager (VPS Health)                     │
│  ├─ Multi-Agent Orchestrator (Task Routing)                │
│  └─ Health Check Monitor (24/7 Uptime)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 DEPLOYMENT PHASES

### **Phase 1: VPS Preparation (Day 1-2)**

#### Step 1.1: Run VPS Setup Script

```bash
# Copy deployment scripts to VPS
scp -r deployment/ root@your-vps-ip:/tmp/

# SSH into VPS
ssh root@your-vps-ip

# Run VPS setup
cd /tmp/deployment
chmod +x setup-vps-complete.sh
./setup-vps-complete.sh
```

**What gets installed:**
- ✅ Node.js 22 LTS
- ✅ Python 3.11+
- ✅ Docker
- ✅ PM2 Process Manager
- ✅ Redis
- ✅ PostgreSQL 16
- ✅ Nginx
- ✅ Certbot (Let's Encrypt)
- ✅ UFW Firewall

---

### **Phase 2: Application Installation (Day 2)**

#### Step 2.1: Run Wallestars Setup

```bash
cd /tmp/deployment
chmod +x setup-wallestars.sh
./setup-wallestars.sh
```

This will:
- Clone repository to `/opt/wallestars`
- Install Node.js dependencies
- Install n8n globally
- Setup Python virtual environment
- Create .env from template
- Build frontend

#### Step 2.2: Configure Environment Variables

```bash
nano /opt/wallestars/.env
```

**Critical Variables:**

```env
# API Keys
ANTHROPIC_API_KEY=sk-ant-your-key-here
N8N_API_KEY=your-n8n-api-key

# Server
PORT=3000
NODE_ENV=production

# Database
DB_HOST=localhost
DB_NAME=wallestars
DB_USER=wallestars_user
DB_PASSWORD=secure_password_here

# Services
REDIS_URL=redis://localhost:6379
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key

# VPS Configuration
VPS_HOST=srv1201204.hstgr.cloud
VPS_USER=root

# 33mail Integration
AUTOPILOT_API_KEY=your-33mail-key

# Email Monitoring
REPORT_EMAIL=your-email@example.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Claude Configuration
ENABLE_COMPUTER_USE=true
ENABLE_ANDROID=false
```

---

### **Phase 3: Nginx Configuration (Day 3)**

#### Step 3.1: Copy and Configure Nginx

```bash
# Copy nginx configuration
sudo cp /opt/wallestars/deployment/nginx-wallestars.conf /etc/nginx/sites-available/wallestars

# Edit with your domain
sudo nano /etc/nginx/sites-available/wallestars
# Replace 'your-domain.com' with actual domain

# Create symlink
sudo ln -s /etc/nginx/sites-available/wallestars /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### Step 3.2: Setup SSL Certificate

```bash
# Get SSL certificate
sudo certbot certonly --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal test
sudo certbot renew --dry-run

# Add renewal cron job
sudo crontab -e
# Add: 0 3 * * * certbot renew --quiet
```

---

### **Phase 4: Start Services (Day 3)**

#### Step 4.1: Start All Services

```bash
cd /opt/wallestars
chmod +x deployment/start-all-services.sh
./deployment/start-all-services.sh
```

This starts:
- ✅ Wallestars API (:3000)
- ✅ n8n Workflow Engine (:5678)
- ✅ VPS Manager (if exists)
- ✅ Email Manager (if exists)
- ✅ Eva Core (if exists)

#### Step 4.2: Verify Services

```bash
# Check PM2 status
pm2 status

# Check individual logs
pm2 logs wallestars-api
pm2 logs n8n

# Real-time monitoring
pm2 monit

# Check Nginx
sudo systemctl status nginx

# Test API endpoint
curl http://localhost:3000/api/health
```

---

### **Phase 5: Workflow Deployment (Day 3)**

```bash
cd /opt/wallestars
chmod +x deployment/deploy-workflows.sh

# Set N8N_API_KEY in environment
export N8N_API_KEY=your-n8n-api-key

./deployment/deploy-workflows.sh
```

---

### **Phase 6: GitHub Actions CI/CD (Day 4)**

#### Step 6.1: Generate SSH Key for GitHub Actions

```bash
# On VPS
ssh-keygen -t ed25519 -C "github-actions@wallestars" -f ~/.ssh/github_actions
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys

# Copy private key (will be added to GitHub Secrets)
cat ~/.ssh/github_actions
```

#### Step 6.2: Configure GitHub Secrets

Go to your repository → Settings → Secrets and variables → Actions

Add these secrets:
- `VPS_HOST` = your-vps-ip-or-domain
- `VPS_USER` = root (or your user)
- `VPS_SSH_KEY` = (paste private key from above)
- `VPS_PORT` = 22

#### Step 6.3: Test Deployment

```bash
# Push to main branch triggers automatic deployment
git push origin main

# Or manually trigger from GitHub Actions tab
```

---

### **Phase 7: Health Monitoring (Day 4-5)**

#### Step 7.1: Setup Health Check Service

```bash
# Start health check with PM2
cd /opt/wallestars
pm2 start deployment/health-check.py --name "health-monitor" --interpreter python3
pm2 save
```

#### Step 7.2: Manual Health Check

```bash
# Run once
python3 deployment/health-check.py
```

---

## 🔧 MAINTENANCE COMMANDS

### PM2 Management

```bash
# View all services
pm2 status

# View logs
pm2 logs
pm2 logs wallestars-api
pm2 logs n8n --lines 100

# Restart services
pm2 restart all
pm2 restart wallestars-api
pm2 restart n8n

# Stop services
pm2 stop all
pm2 stop wallestars-api

# Delete services
pm2 delete all

# Save configuration
pm2 save

# Resurrect after reboot
pm2 resurrect
```

### Application Updates

```bash
# Manual update
cd /opt/wallestars
git pull origin main
npm install
npm run build
pm2 restart all

# Or use GitHub Actions for automatic deployment
```

### Database Management

```bash
# PostgreSQL
sudo -u postgres psql

# Connect to database
\c wallestars

# List tables
\dt

# Exit
\q

# Redis
redis-cli
PING
KEYS *
```

---

## 🎯 DEPLOYMENT CHECKLIST

- [ ] VPS prepared with all dependencies
- [ ] Wallestars cloned and installed
- [ ] Environment variables configured
- [ ] Nginx configured and tested
- [ ] SSL certificates installed
- [ ] PM2 services started
- [ ] n8n workflows imported
- [ ] GitHub Actions configured
- [ ] Health monitoring active
- [ ] Firewall rules configured
- [ ] DNS pointed to VPS
- [ ] Application accessible via domain
- [ ] All services responding correctly

---

## 🔍 TROUBLESHOOTING

### Service Won't Start

```bash
# Check PM2 logs
pm2 logs wallestars-api --err

# Check system logs
sudo journalctl -u nginx -n 50
sudo journalctl -u redis -n 50

# Check ports
sudo netstat -tlnp | grep -E '(3000|5678|80|443)'
```

### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check Redis status
sudo systemctl status redis-server
redis-cli PING
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log

# Restart
sudo systemctl restart nginx
```

---

## 📞 SUPPORT

For issues or questions:
1. Check PM2 logs: `pm2 logs`
2. Check service health: `curl http://localhost:3000/api/health`
3. Review deployment logs in `/opt/wallestars/logs/`
4. Check GitHub Issues: https://github.com/Wallesters-org/Wallestars/issues

---

**Last Updated:** 2026-01-08
**Status:** ✅ READY FOR DEPLOYMENT
