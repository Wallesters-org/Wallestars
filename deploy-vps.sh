#!/bin/bash

###############################################################################
# Wallestars Hostinger VPS Deployment Script
# This script automates the deployment of Wallestars Control Center on a
# Hostinger VPS with optional n8n integration.
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
WALLESTARS_DIR="/opt/Wallestars"
SERVICE_NAME="wallestars"
N8N_SERVICE="n8n"

# Functions
print_header() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════╗"
    echo "║                                                       ║"
    echo "║   🌟 WALLESTARS VPS DEPLOYMENT SCRIPT 🌟            ║"
    echo "║                                                       ║"
    echo "╚═══════════════════════════════════════════════════════╝"
    echo -e "${NC}"
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

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_warning "This script should not be run as root. Use sudo when necessary."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

check_requirements() {
    print_info "Checking system requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found. Please install Node.js 20.x first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 20 ]; then
        print_error "Node.js 20.x or higher required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) found"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm not found"
        exit 1
    fi
    
    print_success "npm $(npm --version) found"
    
    # Check PM2
    if ! command -v pm2 &> /dev/null; then
        print_warning "PM2 not found. Installing PM2..."
        sudo npm install -g pm2
        print_success "PM2 installed"
    else
        print_success "PM2 $(pm2 --version) found"
    fi
}

install_system_dependencies() {
    print_info "Installing system dependencies..."
    
    sudo apt update
    
    # Install essential tools
    sudo apt install -y curl wget git build-essential
    
    # Install xdotool for computer use
    if [ "$ENABLE_COMPUTER_USE" = "true" ]; then
        sudo apt install -y xdotool
        print_success "xdotool installed"
    fi
    
    print_success "System dependencies installed"
}

clone_or_update_repo() {
    print_info "Setting up Wallestars repository..."
    
    if [ -d "$WALLESTARS_DIR" ]; then
        print_info "Directory exists. Updating repository..."
        cd "$WALLESTARS_DIR"
        git pull origin main || print_warning "Git pull failed. Continuing anyway..."
    else
        print_info "Cloning repository..."
        sudo git clone https://github.com/Wallesters-org/Wallestars.git "$WALLESTARS_DIR"
        sudo chown -R $USER:$USER "$WALLESTARS_DIR"
    fi
    
    cd "$WALLESTARS_DIR"
    print_success "Repository ready"
}

install_dependencies() {
    print_info "Installing Node.js dependencies..."
    cd "$WALLESTARS_DIR"
    
    npm install
    print_success "Dependencies installed"
}

build_application() {
    print_info "Building frontend..."
    cd "$WALLESTARS_DIR"
    
    npm run build
    print_success "Frontend built successfully"
}

configure_environment() {
    print_info "Configuring environment..."
    cd "$WALLESTARS_DIR"
    
    if [ ! -f .env ]; then
        cp .env.example .env
        print_warning ".env file created. You need to configure it!"
        
        # Prompt for API key
        read -p "Enter your Anthropic API key (or press Enter to configure later): " api_key
        if [ ! -z "$api_key" ]; then
            sed -i "s/your_api_key_here/$api_key/" .env
        fi
        
        # Prompt for computer use
        read -p "Enable Computer Use? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sed -i "s/ENABLE_COMPUTER_USE=true/ENABLE_COMPUTER_USE=true/" .env
            ENABLE_COMPUTER_USE=true
        else
            sed -i "s/ENABLE_COMPUTER_USE=true/ENABLE_COMPUTER_USE=false/" .env
            ENABLE_COMPUTER_USE=false
        fi
        
        # Set production mode
        sed -i "s/NODE_ENV=development/NODE_ENV=production/" .env
        
        print_success "Environment configured"
    else
        print_info ".env file already exists. Skipping configuration."
    fi
    
    # Set proper permissions
    chmod 600 .env
}

setup_pm2() {
    print_info "Setting up PM2 process manager..."
    cd "$WALLESTARS_DIR"
    
    # Stop existing process if running
    pm2 delete "$SERVICE_NAME" 2>/dev/null || true
    
    # Start the application
    pm2 start server/index.js --name "$SERVICE_NAME"
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 startup script
    pm2 startup | tail -n 1 | bash || print_warning "PM2 startup setup may require manual configuration"
    
    print_success "PM2 configured"
}

install_n8n() {
    read -p "Do you want to install n8n? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Installing n8n..."
        
        # Install n8n globally
        sudo npm install -g n8n
        
        # Configure n8n environment
        read -p "Enter n8n username (default: admin): " n8n_user
        n8n_user=${n8n_user:-admin}
        
        read -sp "Enter n8n password: " n8n_pass
        echo
        
        # Start n8n with PM2
        pm2 delete "$N8N_SERVICE" 2>/dev/null || true
        
        pm2 start n8n --name "$N8N_SERVICE" -- start \
            --env N8N_BASIC_AUTH_ACTIVE=true \
            --env N8N_BASIC_AUTH_USER="$n8n_user" \
            --env N8N_BASIC_AUTH_PASSWORD="$n8n_pass" \
            --env N8N_PORT=5678
        
        pm2 save
        
        print_success "n8n installed and started on port 5678"
    else
        print_info "Skipping n8n installation"
    fi
}

configure_firewall() {
    if command -v ufw &> /dev/null; then
        print_info "Configuring firewall..."
        
        # Allow SSH
        sudo ufw allow 22 2>/dev/null || true
        
        # Allow Wallestars
        sudo ufw allow 3000 2>/dev/null || true
        
        # Allow n8n
        read -p "Open port 5678 for n8n? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sudo ufw allow 5678 2>/dev/null || true
        fi
        
        # Allow HTTP/HTTPS
        read -p "Open ports 80 and 443 for web traffic? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sudo ufw allow 80 2>/dev/null || true
            sudo ufw allow 443 2>/dev/null || true
        fi
        
        print_success "Firewall configured"
    else
        print_warning "UFW not found. Please configure firewall manually."
    fi
}

setup_nginx() {
    read -p "Do you want to setup Nginx reverse proxy? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Setting up Nginx..."
        
        # Install nginx if not present
        if ! command -v nginx &> /dev/null; then
            sudo apt install -y nginx
        fi
        
        read -p "Enter your domain name (e.g., example.com): " domain
        
        # Create nginx configuration
        sudo tee /etc/nginx/sites-available/wallestars > /dev/null <<EOF
server {
    listen 80;
    server_name $domain www.$domain;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
        
        # Enable the site
        sudo ln -sf /etc/nginx/sites-available/wallestars /etc/nginx/sites-enabled/
        
        # Test configuration
        sudo nginx -t && sudo systemctl restart nginx
        
        print_success "Nginx configured for $domain"
        
        # Offer SSL setup
        read -p "Do you want to setup SSL with Let's Encrypt? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if ! command -v certbot &> /dev/null; then
                sudo apt install -y certbot python3-certbot-nginx
            fi
            
            sudo certbot --nginx -d "$domain" -d "www.$domain"
            print_success "SSL certificate installed"
        fi
    fi
}

print_summary() {
    echo -e "\n${GREEN}"
    echo "╔═══════════════════════════════════════════════════════╗"
    echo "║                                                       ║"
    echo "║   🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉           ║"
    echo "║                                                       ║"
    echo "╚═══════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"
    
    print_info "Wallestars Control Center Status:"
    pm2 list
    
    echo -e "\n${BLUE}📝 Next Steps:${NC}"
    echo "1. Edit .env file if needed: nano $WALLESTARS_DIR/.env"
    echo "2. Restart service: pm2 restart $SERVICE_NAME"
    echo "3. View logs: pm2 logs $SERVICE_NAME"
    echo "4. Access Wallestars: http://$(hostname -I | awk '{print $1}'):3000"
    
    if pm2 list | grep -q "$N8N_SERVICE"; then
        echo "5. Access n8n: http://$(hostname -I | awk '{print $1}'):5678"
    fi
    
    echo -e "\n${BLUE}📚 Documentation:${NC}"
    echo "- Deployment Guide: $WALLESTARS_DIR/DEPLOYMENT_HOSTINGER.md"
    echo "- n8n Integration: $WALLESTARS_DIR/N8N_INTEGRATION.md"
    echo "- MCP Setup: $WALLESTARS_DIR/MCP_SETUP.md"
    
    echo -e "\n${GREEN}Happy automating! 🚀${NC}\n"
}

# Main execution
main() {
    print_header
    check_root
    check_requirements
    install_system_dependencies
    clone_or_update_repo
    install_dependencies
    build_application
    configure_environment
    setup_pm2
    install_n8n
    configure_firewall
    setup_nginx
    print_summary
}

# Run main function
main
