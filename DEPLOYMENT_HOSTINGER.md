# 🚀 Hostinger VPS Deployment Guide

This guide explains how to deploy Wallestars Control Center on a Hostinger VPS and integrate it with n8n workflow automation.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [VPS Setup](#vps-setup)
- [Installation](#installation)
- [Configuration](#configuration)
- [n8n Integration](#n8n-integration)
- [Security](#security)
- [Maintenance](#maintenance)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### Hostinger VPS Requirements

- **VPS Plan**: At least 2GB RAM (recommended 4GB for n8n + Wallestars)
- **OS**: Ubuntu 22.04 LTS or higher
- **Node.js**: 20.x or higher
- **Domain**: Optional but recommended for HTTPS
- **Firewall**: Configured ports (3000, 5678 for n8n)

### Required Accounts

- ✅ Hostinger VPS account ([hostinger.com](https://hostinger.com))
- ✅ Anthropic API key ([console.anthropic.com](https://console.anthropic.com))
- ✅ Domain name (optional, for HTTPS and custom URLs)

## 🖥️ VPS Setup

### Step 1: Access Your Hostinger VPS

1. **Login to Hostinger hPanel**:
   ```
   https://hpanel.hostinger.com
   ```

2. **Navigate to VPS**:
   - Go to "VPS" section
   - Select your VPS instance
   - Click "Access" or "SSH Details"

3. **Connect via SSH**:
   ```bash
   ssh root@your-vps-ip
   # Or use the provided username
   ssh username@your-vps-ip
   ```

### Step 2: Initial Server Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git build-essential

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 9.x.x or higher

# Install PM2 for process management
sudo npm install -g pm2

# Install nginx (optional, for reverse proxy)
sudo apt install -y nginx
```

### Step 3: Configure Firewall

```bash
# Allow SSH (if not already allowed)
sudo ufw allow 22

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow Wallestars port
sudo ufw allow 3000

# Allow n8n port (if using)
sudo ufw allow 5678

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## 📦 Installation

### Step 1: Clone Repository

```bash
# Navigate to home directory or /opt
cd /opt

# Clone the repository
sudo git clone https://github.com/Wallesters-org/Wallestars.git
cd Wallestars

# Change ownership (if needed)
sudo chown -R $USER:$USER /opt/Wallestars
```

### Step 2: Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Build the frontend
npm run build
```

### Step 3: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit environment file
nano .env
```

Edit `.env` with your VPS-specific configuration:

```env
# Anthropic API Configuration
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here

# Server Configuration
PORT=3000
NODE_ENV=production
FRONTEND_URL=http://your-domain.com

# Linux Computer Use (enable on Linux VPS)
ENABLE_COMPUTER_USE=true
SCREENSHOT_INTERVAL=3000

# Android ADB Configuration (usually false on VPS)
ENABLE_ANDROID=false

# WebSocket Configuration
WS_PORT=3001
```

## 🔄 Running with PM2

PM2 is a production process manager for Node.js applications.

### Start the Application

```bash
# Start with PM2
pm2 start npm --name "wallestars" -- start

# Or use the server directly
pm2 start server/index.js --name "wallestars"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the instructions provided by the command
```

### PM2 Management Commands

```bash
# View logs
pm2 logs wallestars

# Monitor status
pm2 monit

# Restart application
pm2 restart wallestars

# Stop application
pm2 stop wallestars

# Delete from PM2
pm2 delete wallestars

# List all processes
pm2 list
```

## 🌐 Nginx Reverse Proxy (Recommended)

Set up nginx as a reverse proxy for better security and HTTPS support.

### Step 1: Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/wallestars
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Wallestars
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
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 2: Enable Configuration

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/wallestars /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### Step 3: Setup HTTPS with Let's Encrypt (Optional)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow the prompts

# Test auto-renewal
sudo certbot renew --dry-run
```

## 🔗 n8n Integration

n8n is a powerful workflow automation tool that can interact with Wallestars.

### Option 1: Install n8n on Same VPS

```bash
# Install n8n globally
sudo npm install -g n8n

# Create n8n data directory
mkdir -p ~/.n8n

# Start n8n with PM2
pm2 start n8n --name "n8n" -- start

# Access n8n at http://your-vps-ip:5678
```

### Option 2: Use n8n Cloud

Sign up at [n8n.cloud](https://n8n.cloud) and use webhooks to connect to your VPS.

### Configure n8n Workflows

Create workflows in n8n to interact with Wallestars:

#### Example 1: Screenshot Workflow

1. **Webhook Trigger** (GET/POST)
2. **HTTP Request** to `http://your-vps-ip:3000/api/computer/screenshot`
3. **Process Response** (optional: save to cloud storage)

#### Example 2: Claude Chat Workflow

1. **Webhook Trigger** with message parameter
2. **HTTP Request** (POST) to `http://your-vps-ip:3000/api/claude/chat`
   ```json
   {
     "message": "{{$json.message}}",
     "conversationHistory": []
   }
   ```
3. **Return Response** with Claude's answer

#### Example 3: Automated Computer Control

1. **Schedule Trigger** (cron)
2. **HTTP Request** to execute computer actions
3. **Notification** (email/slack) with results

### n8n Webhook URLs

After creating workflows, n8n provides webhook URLs:
```
https://your-n8n-instance.com/webhook/screenshot-capture
https://your-n8n-instance.com/webhook/claude-chat
```

These can be called from external applications.

## 🔐 Security Configuration

### Environment Variables Security

```bash
# Restrict .env file permissions
chmod 600 .env

# Never commit .env to git
echo ".env" >> .gitignore
```

### API Key Protection

1. **Use environment variables** for all sensitive data
2. **Rotate API keys** regularly
3. **Monitor usage** in Anthropic Console
4. **Set rate limits** if possible

### Network Security

```bash
# Only allow specific IPs (optional)
sudo ufw allow from your-ip-address to any port 3000

# Or use nginx access control
# Edit /etc/nginx/sites-available/wallestars
# Add inside server block:
# allow your-ip-address;
# deny all;
```

### CORS Configuration

For production, update server CORS settings in `server/index.js`:

```javascript
const io = new Server(httpServer, {
  cors: {
    origin: 'https://your-domain.com',  // Your actual domain
    methods: ['GET', 'POST']
  }
});
```

### SSL/TLS

- Always use HTTPS in production
- Use Let's Encrypt for free SSL certificates
- Configure certificate auto-renewal

## 🔄 Maintenance

### Update Application

```bash
cd /opt/Wallestars

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build frontend
npm run build

# Restart with PM2
pm2 restart wallestars
```

### Backup Configuration

```bash
# Backup .env file
cp .env .env.backup

# Backup PM2 configuration
pm2 save

# Backup nginx configuration
sudo cp /etc/nginx/sites-available/wallestars /opt/backups/
```

### Monitor Logs

```bash
# PM2 logs
pm2 logs wallestars

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# System logs
journalctl -u nginx -f
```

### Resource Monitoring

```bash
# Check CPU and memory usage
pm2 monit

# Check disk space
df -h

# Check system resources
htop  # Install with: sudo apt install htop
```

## 🔍 Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs wallestars

# Check if port is already in use
sudo lsof -i :3000

# Check Node.js version
node --version  # Should be 20.x

# Check environment variables
cat .env
```

### Cannot Access from Browser

1. **Check firewall**:
   ```bash
   sudo ufw status
   ```

2. **Check nginx**:
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

3. **Check application**:
   ```bash
   pm2 list
   pm2 logs wallestars
   ```

### API Key Errors

- Verify `ANTHROPIC_API_KEY` in `.env`
- Check API key validity in [Anthropic Console](https://console.anthropic.com)
- Ensure no extra spaces or quotes in `.env`

### n8n Connection Issues

- Verify n8n is running: `pm2 list`
- Check n8n logs: `pm2 logs n8n`
- Ensure firewall allows port 5678
- Test webhook URLs manually with curl

### High Memory Usage

```bash
# Restart the application
pm2 restart wallestars

# Increase memory limit (if needed)
pm2 delete wallestars
pm2 start server/index.js --name "wallestars" --max-memory-restart 1G
```

## 🎯 Post-Deployment Checklist

- [ ] Application is running (`pm2 list`)
- [ ] Can access via browser (http://your-vps-ip:3000)
- [ ] API health check works (`/api/health`)
- [ ] Nginx reverse proxy configured (if using)
- [ ] HTTPS certificate installed (if using domain)
- [ ] Firewall configured correctly
- [ ] PM2 startup configured
- [ ] n8n is running (if installed)
- [ ] n8n workflows created and tested
- [ ] Backups configured
- [ ] Monitoring setup
- [ ] Documentation updated with your URLs

## 📚 Additional Resources

- **Hostinger VPS Docs**: [hostinger.com/tutorials/vps](https://www.hostinger.com/tutorials/vps)
- **n8n Documentation**: [docs.n8n.io](https://docs.n8n.io)
- **PM2 Documentation**: [pm2.keymetrics.io](https://pm2.keymetrics.io)
- **Nginx Documentation**: [nginx.org/en/docs](http://nginx.org/en/docs/)
- **Let's Encrypt**: [letsencrypt.org](https://letsencrypt.org)
- **Claude API Docs**: [docs.anthropic.com](https://docs.anthropic.com)

## 🆘 Support

For issues specific to:
- **Wallestars**: [GitHub Issues](https://github.com/Wallesters-org/Wallestars/issues)
- **Hostinger VPS**: Hostinger Support Portal
- **n8n**: [n8n Community Forum](https://community.n8n.io)

---

**Built with ❤️ by Wallestars Team**

🌟 Now your Wallestars Control Center is running on Hostinger VPS with n8n integration!
