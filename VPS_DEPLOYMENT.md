# VPS Deployment Guide for Wallestars Control Center

## Overview

This guide explains how to deploy the Wallestars Control Center to a VPS (Virtual Private Server) for full backend functionality including Computer Use, Android Control, and real-time WebSocket features.

## Quick Start

### Prerequisites

- A VPS server (DigitalOcean, Linode, AWS EC2, etc.) running Linux
- SSH access to your VPS
- Node.js 20.x or higher installed on VPS
- rsync installed locally and on VPS
- Your VPS IP address or domain name

### Deployment Script

The repository includes an automated deployment script `deploy-vps.sh` that handles:
- Building the application
- Syncing files to VPS via rsync
- Installing dependencies
- Restarting the application (with PM2 if available)

## Configuration

### 1. Configure Local Environment

Add VPS configuration to your `.env` file:

```env
# VPS Deployment Configuration
VPS_HOST=your.vps.host.com       # Your VPS IP or domain
VPS_USER=your_username            # SSH username (default: root)
VPS_PORT=22                       # SSH port (default: 22)
VPS_PATH=/var/www/wallestars      # Remote deployment path
VPS_SSH_KEY_PATH=~/.ssh/id_rsa    # Path to SSH private key
```

### 2. Set Up SSH Access

Ensure you can SSH to your VPS without password:

```bash
# Generate SSH key if you don't have one
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Copy SSH key to VPS
ssh-copy-id -p 22 your_username@your.vps.host.com

# Test connection
ssh -p 22 your_username@your.vps.host.com
```

## VPS Server Setup

### 1. Install Node.js on VPS

```bash
# Connect to VPS
ssh your_username@your.vps.host.com

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

### 3. Install System Dependencies

For Computer Use features:
```bash
sudo apt-get update
sudo apt-get install -y xdotool scrot
```

For Android Control (if needed):
```bash
sudo apt-get install -y android-tools-adb
```

### 4. Configure Firewall

```bash
# Allow SSH (if not already allowed)
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Allow Node.js application port
sudo ufw allow 3000/tcp

# Enable firewall
sudo ufw enable
```

## Deployment

### Using the Deployment Script

1. **Configure your .env file** with VPS details (see Configuration section above)

2. **Run the deployment script:**
   ```bash
   ./deploy-vps.sh
   ```

The script will:
- ✅ Test SSH connection
- ✅ Build the application locally
- ✅ Sync files to VPS (excluding node_modules, .git, etc.)
- ✅ Install dependencies on VPS
- ✅ Restart application with PM2

### Manual Deployment

If you prefer manual deployment:

```bash
# 1. Build locally
npm run build

# 2. Sync to VPS
rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.env' \
  -e "ssh -p 22" \
  . your_username@your.vps.host.com:/var/www/wallestars/

# 3. SSH to VPS
ssh your_username@your.vps.host.com

# 4. Install dependencies
cd /var/www/wallestars
npm install --production

# 5. Configure environment
cp .env.example .env
nano .env  # Edit with your configuration

# 6. Start with PM2
pm2 start server/index.js --name wallestars
pm2 save
pm2 startup
```

## VPS Environment Configuration

Edit `.env` on your VPS:

```env
# Anthropic API Configuration
ANTHROPIC_API_KEY=your_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=production

# Linux Computer Use
ENABLE_COMPUTER_USE=true
SCREENSHOT_INTERVAL=2000

# Android ADB Configuration
ENABLE_ANDROID=true
ADB_HOST=localhost
ADB_PORT=5037

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@wallestars.com
```

## PM2 Commands

### Basic Operations

```bash
# Start application
pm2 start server/index.js --name wallestars

# Stop application
pm2 stop wallestars

# Restart application
pm2 restart wallestars

# View logs
pm2 logs wallestars

# Monitor
pm2 monit

# List all processes
pm2 list

# Delete process
pm2 delete wallestars
```

### Auto-Start on System Reboot

```bash
# Save current PM2 processes
pm2 save

# Generate startup script
pm2 startup

# Follow the instructions provided by the command
```

## Nginx Reverse Proxy (Optional)

For production, use Nginx as a reverse proxy:

### 1. Install Nginx

```bash
sudo apt-get install -y nginx
```

### 2. Configure Nginx

Create `/etc/nginx/sites-available/wallestars`:

```nginx
server {
    listen 80;
    server_name your.domain.com;

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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 3. Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/wallestars /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 4. SSL with Let's Encrypt (Recommended)

```bash
# Install certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your.domain.com

# Auto-renewal is configured automatically
```

## Updating Your Deployment

### Quick Update

Simply run the deployment script again:

```bash
./deploy-vps.sh
```

### Manual Update

```bash
# Build locally
npm run build

# Sync to VPS
rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.env' \
  -e "ssh -p 22" \
  . your_username@your.vps.host.com:/var/www/wallestars/

# SSH and restart
ssh your_username@your.vps.host.com "cd /var/www/wallestars && npm install --production && pm2 restart wallestars"
```

## GitHub Actions CI/CD (Optional)

Create `.github/workflows/deploy-vps.yml`:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm install
    
    - name: Build application
      run: npm run build
    
    - name: Deploy to VPS
      env:
        SSH_PRIVATE_KEY: ${{ secrets.VPS_SSH_KEY }}
        VPS_HOST: ${{ secrets.VPS_HOST }}
        VPS_USER: ${{ secrets.VPS_USER }}
        VPS_PORT: ${{ secrets.VPS_PORT }}
        VPS_PATH: ${{ secrets.VPS_PATH }}
      run: |
        # Setup SSH
        mkdir -p ~/.ssh
        echo "$SSH_PRIVATE_KEY" > ~/.ssh/id_rsa
        chmod 600 ~/.ssh/id_rsa
        ssh-keyscan -p $VPS_PORT $VPS_HOST >> ~/.ssh/known_hosts
        
        # Deploy
        rsync -avz --delete \
          --exclude='node_modules' \
          --exclude='.git' \
          --exclude='.env' \
          -e "ssh -p $VPS_PORT" \
          . $VPS_USER@$VPS_HOST:$VPS_PATH/
        
        # Restart application
        ssh -p $VPS_PORT $VPS_USER@$VPS_HOST \
          "cd $VPS_PATH && npm install --production && pm2 restart wallestars"
```

Add these secrets to your GitHub repository:
- `VPS_SSH_KEY`: Your SSH private key
- `VPS_HOST`: Your VPS hostname/IP
- `VPS_USER`: SSH username
- `VPS_PORT`: SSH port (usually 22)
- `VPS_PATH`: Deployment path on VPS

## Monitoring and Maintenance

### View Application Logs

```bash
# Real-time logs
pm2 logs wallestars

# Last 100 lines
pm2 logs wallestars --lines 100

# Error logs only
pm2 logs wallestars --err
```

### Monitor Resources

```bash
# PM2 monitoring
pm2 monit

# System resources
htop
```

### Check Application Status

```bash
# PM2 status
pm2 status

# Application health endpoint
curl http://localhost:3000/api/health
```

## Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs wallestars --lines 50

# Check if port is in use
sudo netstat -tulpn | grep :3000

# Verify Node.js version
node --version  # Should be 20.x or higher
```

### SSH Connection Issues

```bash
# Test connection
ssh -v -p 22 your_username@your.vps.host.com

# Check SSH key permissions
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub
chmod 700 ~/.ssh
```

### rsync Fails

```bash
# Ensure rsync is installed locally and on VPS
rsync --version

# On VPS:
sudo apt-get install rsync
```

### PM2 Not Found After Installation

```bash
# Add to PATH
export PATH=$PATH:$(npm root -g)/pm2/bin

# Or use full path
$(npm root -g)/pm2/bin/pm2 start server/index.js --name wallestars
```

## Security Best Practices

1. **Use SSH keys** instead of passwords
2. **Configure firewall** to only allow necessary ports
3. **Keep Node.js and dependencies updated**
4. **Use environment variables** for sensitive data
5. **Enable HTTPS** with SSL certificates
6. **Regular backups** of your application and data
7. **Monitor logs** for suspicious activity
8. **Use strong passwords** for all services
9. **Keep VPS system updated**: `sudo apt-get update && sudo apt-get upgrade`

## Support

For issues specific to VPS deployment:
- Check the deployment logs
- Review PM2 logs: `pm2 logs wallestars`
- Check system logs: `sudo journalctl -xe`
- Verify firewall settings: `sudo ufw status`
- Test API health: `curl http://localhost:3000/api/health`

## Additional Resources

- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [DigitalOcean Tutorials](https://www.digitalocean.com/community/tutorials)
- [Main README](README.md)
