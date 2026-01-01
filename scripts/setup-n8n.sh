#!/bin/bash

# n8n Quick Setup Script for VPS (KVM2)
# This script automates the installation and configuration of n8n on a VPS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if running as root
check_root() {
    if [ "$EUID" -eq 0 ]; then 
        print_warning "Running as root. Consider using a regular user for n8n."
    fi
}

# Function to check system requirements
check_requirements() {
    print_info "Checking system requirements..."
    
    # Check RAM
    total_ram=$(free -m | awk '/^Mem:/{print $2}')
    if [ "$total_ram" -lt 2000 ]; then
        print_warning "System has less than 2GB RAM. n8n may run slowly."
    else
        print_success "RAM check passed: ${total_ram}MB"
    fi
    
    # Check disk space
    free_space=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')
    if [ "$free_space" -lt 10 ]; then
        print_warning "Less than 10GB free disk space available."
    else
        print_success "Disk space check passed: ${free_space}GB free"
    fi
}

# Function to install Node.js
install_nodejs() {
    print_info "Installing Node.js 20.x..."
    
    if command -v node &> /dev/null; then
        node_version=$(node -v)
        print_info "Node.js is already installed: $node_version"
        read -p "Do you want to reinstall? (y/N): " reinstall
        if [ "$reinstall" != "y" ] && [ "$reinstall" != "Y" ]; then
            return
        fi
    fi
    
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    print_success "Node.js installed: $(node -v)"
    print_success "npm installed: $(npm -v)"
}

# Function to install n8n via npm
install_n8n_npm() {
    print_info "Installing n8n via npm..."
    
    if command -v n8n &> /dev/null; then
        print_warning "n8n is already installed"
        read -p "Do you want to reinstall? (y/N): " reinstall
        if [ "$reinstall" != "y" ] && [ "$reinstall" != "Y" ]; then
            return
        fi
    fi
    
    sudo npm install -g n8n
    print_success "n8n installed successfully"
}

# Function to install Docker
install_docker() {
    print_info "Installing Docker..."
    
    if command -v docker &> /dev/null; then
        print_info "Docker is already installed: $(docker -v)"
        return
    fi
    
    curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
    sudo sh /tmp/get-docker.sh
    sudo usermod -aG docker $USER
    
    print_success "Docker installed successfully"
    print_warning "You may need to log out and back in for docker group changes to take effect"
}

# Function to install n8n via Docker
install_n8n_docker() {
    print_info "Setting up n8n with Docker..."
    
    # Check if n8n container already exists
    if docker ps -a --format '{{.Names}}' | grep -q '^n8n$'; then
        print_warning "n8n container already exists"
        read -p "Do you want to remove and recreate it? (y/N): " recreate
        if [ "$recreate" = "y" ] || [ "$recreate" = "Y" ]; then
            docker stop n8n 2>/dev/null || true
            docker rm n8n 2>/dev/null || true
        else
            return
        fi
    fi
    
    # Create n8n data directory
    mkdir -p ~/.n8n
    
    # Get configuration from user
    read -p "Enter n8n admin username (default: admin): " admin_user
    admin_user=${admin_user:-admin}
    
    read -s -p "Enter n8n admin password: " admin_pass
    echo
    
    read -p "Enter your domain name (e.g., n8n.example.com): " domain_name
    
    # Run n8n container
    docker run -d \
        --name n8n \
        --restart unless-stopped \
        -p 5678:5678 \
        -v ~/.n8n:/home/node/.n8n \
        -e N8N_BASIC_AUTH_ACTIVE=true \
        -e N8N_BASIC_AUTH_USER="$admin_user" \
        -e N8N_BASIC_AUTH_PASSWORD="$admin_pass" \
        -e N8N_HOST="$domain_name" \
        -e N8N_PORT=5678 \
        -e N8N_PROTOCOL=https \
        -e WEBHOOK_URL="https://$domain_name" \
        -e GENERIC_TIMEZONE="Europe/Sofia" \
        n8nio/n8n
    
    print_success "n8n Docker container started"
}

# Function to configure firewall
configure_firewall() {
    print_info "Configuring firewall..."
    
    if ! command -v ufw &> /dev/null; then
        print_info "UFW not installed. Installing..."
        sudo apt-get install -y ufw
    fi
    
    # Allow SSH
    sudo ufw allow ssh
    
    # Allow n8n port
    sudo ufw allow 5678/tcp
    
    # Allow HTTP and HTTPS
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    
    # Enable firewall
    sudo ufw --force enable
    
    print_success "Firewall configured"
    sudo ufw status
}

# Function to setup systemd service for n8n (npm method)
setup_systemd_service() {
    print_info "Setting up systemd service for n8n..."
    
    cat << EOF | sudo tee /etc/systemd/system/n8n.service
[Unit]
Description=n8n Workflow Automation
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$HOME
ExecStart=$(which n8n) start
Restart=on-failure
Environment=N8N_BASIC_AUTH_ACTIVE=true
Environment=N8N_BASIC_AUTH_USER=admin
Environment=N8N_BASIC_AUTH_PASSWORD=changeme123
Environment=N8N_HOST=localhost
Environment=N8N_PORT=5678

[Install]
WantedBy=multi-user.target
EOF
    
    sudo systemctl daemon-reload
    sudo systemctl enable n8n
    sudo systemctl start n8n
    
    print_success "Systemd service created and started"
    print_warning "Remember to change the default password!"
}

# Function to install SSL certificate
install_ssl() {
    print_info "Installing SSL certificate with Let's Encrypt..."
    
    read -p "Enter your domain name: " domain
    read -p "Enter your email address: " email
    
    if ! command -v certbot &> /dev/null; then
        sudo apt-get install -y certbot
    fi
    
    sudo certbot certonly --standalone -d "$domain" --email "$email" --agree-tos --non-interactive
    
    if [ $? -eq 0 ]; then
        print_success "SSL certificate installed for $domain"
        print_info "Certificate location: /etc/letsencrypt/live/$domain/"
    else
        print_error "Failed to install SSL certificate"
    fi
}

# Function to display final instructions
show_final_instructions() {
    print_success "Setup completed!"
    echo
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}Next Steps:${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo
    echo "1. Access n8n interface:"
    echo "   - URL: https://your-domain.com:5678"
    echo "   - Username: admin (or what you configured)"
    echo "   - Password: (what you configured)"
    echo
    echo "2. Configure credentials in n8n:"
    echo "   - GitHub API (Personal Access Token)"
    echo "   - Claude AI API (from Anthropic Console)"
    echo
    echo "3. Import workflows:"
    echo "   - Go to Workflows > Import from File"
    echo "   - Import from /workflows directory"
    echo
    echo "4. Setup GitHub webhook:"
    echo "   - Repository Settings > Webhooks > Add webhook"
    echo "   - Payload URL: https://your-domain.com/webhook/github"
    echo "   - Content type: application/json"
    echo
    echo "5. Review documentation:"
    echo "   - docs/n8n-integration-guide.md"
    echo "   - docs/vps-setup-guide.md"
    echo "   - docs/summary.md"
    echo
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo
    echo "For support, visit: https://github.com/Wallesters-org/Wallestars"
}

# Main menu
main_menu() {
    echo
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}   n8n Quick Setup Script for VPS (KVM2)${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo
    echo "1) Full automated setup (Recommended)"
    echo "2) Install Node.js only"
    echo "3) Install n8n via npm"
    echo "4) Install n8n via Docker"
    echo "5) Configure firewall"
    echo "6) Setup systemd service (for npm installation)"
    echo "7) Install SSL certificate"
    echo "8) Exit"
    echo
    read -p "Select option [1-8]: " option
    
    case $option in
        1)
            check_root
            check_requirements
            read -p "Install method (npm/docker): " method
            if [ "$method" = "docker" ]; then
                install_docker
                install_n8n_docker
            else
                install_nodejs
                install_n8n_npm
                setup_systemd_service
            fi
            configure_firewall
            read -p "Do you want to install SSL certificate? (y/N): " install_ssl_opt
            if [ "$install_ssl_opt" = "y" ] || [ "$install_ssl_opt" = "Y" ]; then
                install_ssl
            fi
            show_final_instructions
            ;;
        2)
            install_nodejs
            ;;
        3)
            install_nodejs
            install_n8n_npm
            ;;
        4)
            install_docker
            install_n8n_docker
            ;;
        5)
            configure_firewall
            ;;
        6)
            setup_systemd_service
            ;;
        7)
            install_ssl
            ;;
        8)
            print_info "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid option"
            main_menu
            ;;
    esac
}

# Run main menu
main_menu
