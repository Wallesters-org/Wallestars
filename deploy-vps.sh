#!/bin/bash

# Wallestars VPS Deployment Script
# This script syncs the application to a remote VPS server

set -e  # Exit on error

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

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Load environment variables from .env if exists
if [ -f .env ]; then
    print_info "Loading configuration from .env file..."
    export $(cat .env | grep -E "^VPS_|^ANTHROPIC_" | xargs)
fi

# Configuration with defaults
VPS_HOST="${VPS_HOST:-}"
VPS_USER="${VPS_USER:-root}"
VPS_PORT="${VPS_PORT:-22}"
VPS_PATH="${VPS_PATH:-/var/www/wallestars}"
VPS_SSH_KEY_PATH="${VPS_SSH_KEY_PATH:-$HOME/.ssh/id_rsa}"

# Validate required configuration
if [ -z "$VPS_HOST" ]; then
    print_error "VPS_HOST is not set. Please set it in .env file or export VPS_HOST=your.server.com"
    exit 1
fi

print_info "╔═══════════════════════════════════════════════════════╗"
print_info "║                                                       ║"
print_info "║   🌟 WALLESTARS VPS DEPLOYMENT 🌟                    ║"
print_info "║                                                       ║"
print_info "╚═══════════════════════════════════════════════════════╝"
echo ""

print_info "Configuration:"
print_info "  Host: $VPS_HOST"
print_info "  User: $VPS_USER"
print_info "  Port: $VPS_PORT"
print_info "  Remote Path: $VPS_PATH"
echo ""

# Check if SSH key exists
if [ ! -f "$VPS_SSH_KEY_PATH" ]; then
    print_warning "SSH key not found at $VPS_SSH_KEY_PATH"
    print_info "Will attempt connection with password authentication"
fi

# Test SSH connection
print_info "Testing SSH connection..."
if ssh -p "$VPS_PORT" -o ConnectTimeout=10 -o BatchMode=yes "$VPS_USER@$VPS_HOST" "exit" 2>/dev/null; then
    print_success "SSH connection successful"
else
    print_error "Cannot connect to $VPS_USER@$VPS_HOST:$VPS_PORT"
    print_info "Please ensure:"
    print_info "  1. VPS is accessible"
    print_info "  2. SSH key is configured ($VPS_SSH_KEY_PATH)"
    print_info "  3. VPS_HOST, VPS_USER, and VPS_PORT are correct"
    exit 1
fi

# Build the project
print_info "Building the project..."
if npm run build; then
    print_success "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

# Create remote directory if it doesn't exist
print_info "Ensuring remote directory exists..."
ssh -p "$VPS_PORT" "$VPS_USER@$VPS_HOST" "mkdir -p $VPS_PATH"

# Sync files to VPS using rsync
print_info "Syncing files to VPS..."

# Files and directories to exclude
EXCLUDE_PATTERNS=(
    "node_modules"
    ".git"
    ".env"
    ".env.local"
    ".env.production"
    "tmp"
    "temp"
    "*.log"
    ".vscode"
    ".idea"
    "screenshots"
    "*.swp"
    "*.swo"
    ".DS_Store"
    "Thumbs.db"
)

# Build rsync exclude arguments
EXCLUDE_ARGS=""
for pattern in "${EXCLUDE_PATTERNS[@]}"; do
    EXCLUDE_ARGS="$EXCLUDE_ARGS --exclude=$pattern"
done

# Perform rsync
if rsync -avz --delete \
    -e "ssh -p $VPS_PORT" \
    $EXCLUDE_ARGS \
    --progress \
    . "$VPS_USER@$VPS_HOST:$VPS_PATH/"; then
    print_success "Files synced successfully"
else
    print_error "File sync failed"
    exit 1
fi

# Install dependencies on VPS
print_info "Installing dependencies on VPS..."
ssh -p "$VPS_PORT" "$VPS_USER@$VPS_HOST" "cd $VPS_PATH && npm install --production"

# Check if .env exists on VPS, if not create from example
print_info "Checking environment configuration on VPS..."
ssh -p "$VPS_PORT" "$VPS_USER@$VPS_HOST" "cd $VPS_PATH && if [ ! -f .env ]; then cp .env.example .env; echo 'Created .env from .env.example. Please configure it.'; fi"

# Restart the application (using PM2 if available, otherwise provide instructions)
print_info "Restarting application..."
if ssh -p "$VPS_PORT" "$VPS_USER@$VPS_HOST" "command -v pm2 >/dev/null 2>&1"; then
    print_info "PM2 detected, restarting application..."
    ssh -p "$VPS_PORT" "$VPS_USER@$VPS_HOST" "cd $VPS_PATH && pm2 restart wallestars || pm2 start server/index.js --name wallestars"
    print_success "Application restarted with PM2"
else
    print_warning "PM2 not found on VPS"
    print_info "To install PM2: npm install -g pm2"
    print_info "To start app: cd $VPS_PATH && pm2 start server/index.js --name wallestars"
    print_info "Manual restart required if app is already running"
fi

# Summary
echo ""
print_success "╔═══════════════════════════════════════════════════════╗"
print_success "║                                                       ║"
print_success "║   ✅ DEPLOYMENT COMPLETED SUCCESSFULLY                ║"
print_success "║                                                       ║"
print_success "╚═══════════════════════════════════════════════════════╝"
echo ""
print_info "Next steps:"
print_info "  1. SSH to VPS: ssh -p $VPS_PORT $VPS_USER@$VPS_HOST"
print_info "  2. Navigate to: cd $VPS_PATH"
print_info "  3. Configure .env file with your API keys"
print_info "  4. Start/restart the application if needed"
echo ""
print_info "Application should be accessible at: http://$VPS_HOST:3000"
echo ""
