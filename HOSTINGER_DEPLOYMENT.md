# 🚀 Hostinger VPS Deployment Guide for Wallestars

Complete step-by-step guide for deploying Wallestars Control Center to your Hostinger VPS with SSL certificates and domain configuration.

## 📋 Prerequisites

You mentioned you have:
- ✅ Hostinger VPS (active)
- ✅ Domain (configured)
- ✅ Hostinger API access
- ✅ Everything paid and ready

---

## 🎯 Deployment Options

### Option 1: Quick Start from Antigravity Terminal (Recommended)
The easiest way to start the server for testing and development.

### Option 2: Production VPS Deployment
Full production setup with Nginx, SSL, and PM2 for 24/7 operation.

---

## 🚀 Option 1: Quick Start (Antigravity Terminal or Local)

### Step 1: Clone Repository

```bash
# From your Antigravity terminal or local machine
git clone https://github.com/Wallesters-org/Wallestars.git
cd Wallestars
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit with your API key
nano .env
```

Add your Anthropic API key:
```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
ENABLE_COMPUTER_USE=true
ENABLE_ANDROID=true
```

### Step 4: Start Development Server

```bash
# Start both frontend and backend
npm run dev
```

The server will start on:
- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:5173

### Step 5: Access from Other Devices

To access from other devices on your network:

```bash
# Get your local IP address
# On Linux/Mac:
ifconfig | grep "inet " | grep -v 127.0.0.1

# On Windows:
ipconfig | findstr IPv4

# Start with host flag (already configured)
npm run dev
```

Access from other devices: `http://YOUR_LOCAL_IP:5173`

---

## 🏢 Option 2: Production Hostinger VPS Deployment

### Phase 1: Connect to Your Hostinger VPS

#### Method 1: Hostinger Control Panel
1. Log in to https://hpanel.hostinger.com
2. Go to **VPS** → Select your VPS
3. Click **Access** → **Open SSH Terminal**

#### Method 2: SSH from Terminal
```bash
ssh root@YOUR_VPS_IP
# Or if you have a username:
ssh your_username@YOUR_VPS_IP
```

### Phase 2: Server Preparation

#### 1. Update System
```bash
sudo apt update && sudo apt upgrade -y
```

#### 2. Install Node.js 20.x
```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version
```

#### 3. Install PM2 (Process Manager)
```bash
sudo npm install -g pm2

# Verify
pm2 --version
```

#### 4. Install Nginx (Web Server)
```bash
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify
sudo systemctl status nginx
```

### Phase 3: Deploy Application

#### 1. Create Deployment Directory
```bash
# Create directory for the app
sudo mkdir -p /var/www/wallestars
sudo chown -R $USER:$USER /var/www/wallestars
cd /var/www/wallestars
```

#### 2. Clone Repository
```bash
git clone https://github.com/Wallesters-org/Wallestars.git .

# Or if you have SSH key configured:
git clone git@github.com:Wallesters-org/Wallestars.git .
```

#### 3. Install Dependencies
```bash
npm install
```

#### 4. Configure Environment
```bash
cp .env.example .env
nano .env
```

Add your configuration:
```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
ENABLE_COMPUTER_USE=true
ENABLE_ANDROID=false
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://yourdomain.com
```

#### 5. Build for Production
```bash
npm run build
```

This creates optimized files in the `dist/` directory.

#### 6. Start with PM2
```bash
# Start the application
pm2 start server/index.js --name wallestars

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the command it outputs
```

#### 7. Verify Application
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs wallestars

# Monitor in real-time
pm2 monit
```

### Phase 4: Configure Nginx as Reverse Proxy

#### 1. Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/wallestars
```

Add this configuration (replace `yourdomain.com`):
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Serve static files from dist
    location / {
        root /var/www/wallestars/dist;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
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

    # WebSocket support for Socket.io
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 2. Enable Site
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/wallestars /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Phase 5: Configure Domain in Hostinger

#### 1. Update DNS Records
In Hostinger control panel (hpanel.hostinger.com):

1. Go to **Domains** → Select your domain
2. Click **DNS / Name Servers**
3. Add/Update these records:

| Type | Name | Points to | TTL |
|------|------|-----------|-----|
| A | @ | YOUR_VPS_IP | 14400 |
| A | www | YOUR_VPS_IP | 14400 |

Wait 15-30 minutes for DNS propagation.

### Phase 6: Install SSL Certificate (Let's Encrypt)

#### 1. Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

#### 2. Obtain Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts:
- Enter your email
- Agree to terms
- Choose to redirect HTTP to HTTPS (recommended)

#### 3. Auto-renewal Test
```bash
# Test renewal
sudo certbot renew --dry-run
```

Certbot automatically sets up auto-renewal via cron.

### Phase 7: Configure Firewall

```bash
# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## 🔧 Server Management Commands

### PM2 Commands
```bash
# View status
pm2 status

# View logs
pm2 logs wallestars

# Restart application
pm2 restart wallestars

# Stop application
pm2 stop wallestars

# Start application
pm2 start wallestars

# Monitor resources
pm2 monit

# View detailed info
pm2 show wallestars
```

### Update Application
```bash
cd /var/www/wallestars

# Pull latest changes
git pull origin main

# Install new dependencies (if any)
npm install

# Rebuild
npm run build

# Restart
pm2 restart wallestars
```

### Nginx Commands
```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx

# View error logs
sudo tail -f /var/log/nginx/error.log

# View access logs
sudo tail -f /var/log/nginx/access.log
```

---

## 📱 Accessing Your Application

### After Full Deployment:

1. **Via Domain**: https://yourdomain.com
2. **Via IP**: http://YOUR_VPS_IP (redirects to HTTPS)
3. **From Mobile**: Same URLs work on mobile devices

### Testing:

```bash
# Test from command line
curl -I https://yourdomain.com

# Test API
curl https://yourdomain.com/api/health
```

---

## 🔍 Troubleshooting

### Application Won't Start
```bash
# Check PM2 logs
pm2 logs wallestars --lines 100

# Check if port 3000 is in use
sudo lsof -i :3000

# Kill process if needed
kill -9 PID
```

### Nginx Issues
```bash
# Check Nginx error log
sudo tail -100 /var/log/nginx/error.log

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Domain Not Working
```bash
# Check DNS propagation
nslookup yourdomain.com

# Check if Nginx is listening
sudo netstat -tlnp | grep nginx

# Check firewall
sudo ufw status
```

### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal

# Check Nginx SSL config
sudo nano /etc/nginx/sites-available/wallestars
```

---

## 🎯 Quick Reference

### Essential URLs
- **Hostinger Panel**: https://hpanel.hostinger.com
- **Your Application**: https://yourdomain.com
- **API Health Check**: https://yourdomain.com/api/health

### Essential Files
- **Application**: `/var/www/wallestars/`
- **Environment**: `/var/www/wallestars/.env`
- **Nginx Config**: `/etc/nginx/sites-available/wallestars`
- **PM2 Logs**: `~/.pm2/logs/`

### Essential Commands
```bash
# Application Management
pm2 status                    # Check status
pm2 logs wallestars          # View logs
pm2 restart wallestars       # Restart app

# Server Management
sudo systemctl status nginx  # Check Nginx
sudo systemctl reload nginx  # Reload config
sudo certbot renew          # Renew SSL

# Updates
cd /var/www/wallestars
git pull && npm install && npm run build
pm2 restart wallestars
```

---

## 🤖 Automated Deployment Script

Create a deployment script for easy updates:

```bash
nano /var/www/wallestars/deploy.sh
```

Add this content:
```bash
#!/bin/bash
set -e

echo "🚀 Deploying Wallestars..."

# Navigate to app directory
cd /var/www/wallestars

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build application
echo "🔨 Building application..."
npm run build

# Restart PM2
echo "♻️ Restarting application..."
pm2 restart wallestars

# Show status
echo "✅ Deployment complete!"
pm2 status
```

Make it executable:
```bash
chmod +x /var/www/wallestars/deploy.sh
```

Use it:
```bash
cd /var/www/wallestars
./deploy.sh
```

---

## 💡 Tips for Mobile Optimization

The Smart Scan feature is now optimized for mobile devices with:
- ✅ Responsive layouts that adapt to screen size
- ✅ Touch-friendly buttons and controls
- ✅ Scrollable progress steps on small screens
- ✅ Optimized text sizes for readability
- ✅ Proper spacing for touch targets

Test on mobile by accessing: https://yourdomain.com

---

## 🆘 Need Help?

If you encounter any issues:

1. **Check PM2 logs**: `pm2 logs wallestars`
2. **Check Nginx logs**: `sudo tail -f /var/log/nginx/error.log`
3. **Verify DNS**: `nslookup yourdomain.com`
4. **Test SSL**: https://www.ssllabs.com/ssltest/
5. **Check firewall**: `sudo ufw status`

---

## 📚 Next Steps

After deployment:
1. ✅ Test all features work correctly
2. ✅ Setup automated backups
3. ✅ Configure monitoring (optional)
4. ✅ Setup email notifications (optional)
5. ✅ Document your specific configuration

---

**Last Updated**: January 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅
