#!/bin/bash

###############################################################################
# Wallestars VPS Deployment Script
# 
# This script automates the deployment of Wallestars Control Center to a VPS
# Run this script on the target VPS: 72.61.154.188 (srv1201204.hstgr.cloud)
#
# Prerequisites:
# - Ubuntu/Debian Linux
# - Root or sudo access
# - Internet connection
#
# Usage:
#   chmod +x deploy-vps.sh
#   sudo ./deploy-vps.sh
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="wallestars"
APP_DIR="/var/www/wallestars"
APP_USER="wallestars"
DOMAIN="srv1201204.hstgr.cloud"
N8N_DOMAIN="n8n.srv1201204.hstgr.cloud"
NODE_VERSION="20"

# Functions
print_header() {
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                                                       ║${NC}"
    echo -e "${CYAN}║   🌟 Wallestars VPS Deployment Script 🌟            ║${NC}"
    echo -e "${CYAN}║                                                       ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_step() {
    echo -e "\n${BLUE}▶ $1${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

check_root() {
    if [ "$EUID" -ne 0 ]; then 
        print_error "Please run as root or with sudo"
        exit 1
    fi
}

# Main deployment steps
main() {
    print_header
    check_root
    
    # Step 1: System update
    print_step "Step 1: Updating system packages"
    apt update && apt upgrade -y
    print_success "System updated"
    
    # Step 2: Install Node.js
    print_step "Step 2: Installing Node.js ${NODE_VERSION}.x"
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
        apt install -y nodejs
        print_success "Node.js installed: $(node --version)"
    else
        print_success "Node.js already installed: $(node --version)"
    fi
    
    # Step 3: Install Nginx
    print_step "Step 3: Installing Nginx"
    if ! command -v nginx &> /dev/null; then
        apt install -y nginx
        systemctl start nginx
        systemctl enable nginx
        print_success "Nginx installed and started"
    else
        print_success "Nginx already installed"
    fi
    
    # Step 4: Install PM2
    print_step "Step 4: Installing PM2"
    if ! command -v pm2 &> /dev/null; then
        npm install -g pm2
        print_success "PM2 installed: $(pm2 --version)"
    else
        print_success "PM2 already installed: $(pm2 --version)"
    fi
    
    # Step 5: Install Certbot
    print_step "Step 5: Installing Certbot for SSL"
    if ! command -v certbot &> /dev/null; then
        apt install -y certbot python3-certbot-nginx
        print_success "Certbot installed"
    else
        print_success "Certbot already installed"
    fi
    
    # Step 6: Create application user
    print_step "Step 6: Creating application user"
    if ! id "$APP_USER" &>/dev/null; then
        useradd -m -s /bin/bash $APP_USER
        print_success "User '$APP_USER' created"
    else
        print_success "User '$APP_USER' already exists"
    fi
    
    # Step 7: Create application directory
    print_step "Step 7: Setting up application directory"
    mkdir -p $APP_DIR
    chown -R $APP_USER:$APP_USER $APP_DIR
    print_success "Application directory created: $APP_DIR"
    
    # Step 8: Configure firewall
    print_step "Step 8: Configuring firewall"
    ufw --force enable
    ufw allow ssh
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 3000/tcp  # Application port
    ufw allow 5678/tcp  # N8N port
    print_success "Firewall configured"
    
    # Step 9: Configure Nginx for Wallestars
    print_step "Step 9: Configuring Nginx for Wallestars"
    cat > /etc/nginx/sites-available/wallestars <<'EOF'
# Wallestars Control Center
server {
    listen 80;
    listen [::]:80;
    server_name srv1201204.hstgr.cloud;

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

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1000;

    # Logs
    access_log /var/log/nginx/wallestars_access.log;
    error_log /var/log/nginx/wallestars_error.log;
}
EOF
    
    # Enable site
    ln -sf /etc/nginx/sites-available/wallestars /etc/nginx/sites-enabled/
    
    # Test and reload Nginx
    nginx -t && systemctl reload nginx
    print_success "Nginx configured for Wallestars"
    
    # Step 10: Configure Nginx for N8N
    print_step "Step 10: Configuring Nginx for N8N"
    cat > /etc/nginx/sites-available/n8n <<'EOF'
# N8N Automation Platform
server {
    listen 80;
    listen [::]:80;
    server_name n8n.srv1201204.hstgr.cloud;

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
EOF
    
    # Enable N8N site
    ln -sf /etc/nginx/sites-available/n8n /etc/nginx/sites-enabled/
    
    # Test and reload Nginx
    nginx -t && systemctl reload nginx
    print_success "Nginx configured for N8N"
    
    # Step 11: Setup PM2 startup
    print_step "Step 11: Configuring PM2 startup"
    env PATH=$PATH:/usr/bin pm2 startup systemd -u $APP_USER --hp /home/$APP_USER
    print_success "PM2 startup configured"
    
    # Final instructions
    echo ""
    print_header
    print_success "Base system setup complete!"
    echo ""
    print_warning "Next steps (to be run as user '$APP_USER'):"
    echo ""
    echo "1. Clone or upload Wallestars code to $APP_DIR"
    echo "   cd $APP_DIR"
    echo "   git clone https://github.com/Wallesters-org/Wallestars.git ."
    echo ""
    echo "2. Install dependencies and build:"
    echo "   npm install"
    echo "   npm run build"
    echo ""
    echo "3. Create .env file:"
    echo "   cp .env.example .env"
    echo "   nano .env  # Add your ANTHROPIC_API_KEY"
    echo ""
    echo "4. Start with PM2:"
    echo "   pm2 start server/index.js --name wallestars"
    echo "   pm2 save"
    echo ""
    echo "5. Setup SSL certificates:"
    echo "   sudo certbot --nginx -d $DOMAIN"
    echo "   sudo certbot --nginx -d $N8N_DOMAIN"
    echo ""
    echo "6. Test deployment:"
    echo "   curl https://$DOMAIN/api/health"
    echo ""
    print_success "Deployment preparation complete! 🎉"
}

# Run main function
main
