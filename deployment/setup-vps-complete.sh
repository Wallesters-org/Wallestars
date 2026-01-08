#!/bin/bash
# setup-vps-complete.sh
# Complete VPS Setup Script for Wallestars Deployment

set -e
echo "🚀 Wallestars Complete Deployment Setup"

# 1. System Updates
echo "📦 Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y git curl wget ntp htop vim ufw

# 2. Node.js 22 LTS
echo "📦 Installing Node.js 22 LTS..."
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Python 3.11+
echo "🐍 Installing Python 3.11+..."
sudo apt-get install -y python3 python3-pip python3-venv

# 4. Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# 5. PM2 Process Manager
echo "⚙️  Installing PM2..."
sudo npm install -g pm2
pm2 startup | tail -n 1 | sh
pm2 save

# 6. Redis (for caching/queues)
echo "💾 Installing Redis..."
sudo apt-get install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

# 7. PostgreSQL 16
echo "🗄️  Installing PostgreSQL..."
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql

# 8. Nginx (Reverse Proxy)
echo "🌐 Installing Nginx..."
sudo apt-get install -y nginx
sudo systemctl enable nginx

# 9. Let's Encrypt SSL
echo "🔒 Installing Certbot for SSL..."
sudo apt-get install -y certbot python3-certbot-nginx

# 10. Firewall Configuration
echo "🔥 Configuring UFW firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 5678/tcp
sudo ufw --force enable

echo "✅ VPS setup complete!"
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo "Python version: $(python3 --version)"
echo "Docker version: $(docker --version)"
echo "PM2 version: $(pm2 --version)"
echo ""
echo "Next steps:"
echo "1. Run: ./setup-wallestars.sh"
echo "2. Configure environment variables in .env"
echo "3. Setup domain DNS to point to this server"
