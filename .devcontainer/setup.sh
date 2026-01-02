#!/bin/bash

# Wallestars Dev Container Setup Script
# Executed after container is created

set -e

echo "🚀 Starting Wallestars development environment setup..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install additional tools
echo "🔧 Installing additional development tools..."
sudo apt-get install -y \
    curl \
    wget \
    jq \
    htop \
    vim \
    nano \
    net-tools \
    iputils-ping \
    dnsutils \
    postgresql-client \
    redis-tools \
    build-essential \
    libssl-dev \
    pkg-config \
    ca-certificates \
    gnupg \
    lsb-release

# Install KeePassXC CLI tools (for password management)
echo "🔐 Installing KeePassXC CLI tools..."
sudo apt-get install -y keepassxc-cli || echo "⚠️  KeePassXC CLI not available, skipping..."

# Setup Node.js global packages
echo "📦 Installing global Node.js packages..."
npm install -g \
    n8n \
    yarn \
    pnpm \
    pm2 \
    nodemon \
    ts-node \
    typescript \
    @nestjs/cli \
    @angular/cli \
    create-react-app \
    next \
    vercel \
    netlify-cli \
    supabase \
    prisma \
    hardhat \
    truffle \
    ganache \
    @solana/web3.js \
    eslint \
    prettier

# Install Python packages
echo "🐍 Installing Python packages..."
pip3 install --upgrade pip
pip3 install \
    numpy \
    pandas \
    requests \
    python-dotenv \
    pykeepass \
    cryptography \
    psycopg2-binary \
    redis \
    celery \
    fastapi \
    uvicorn \
    sqlalchemy \
    alembic \
    black \
    pylint \
    pytest \
    web3 \
    solana

# Install Rust packages
echo "🦀 Installing Rust tools..."
cargo install --locked \
    cargo-watch \
    cargo-edit \
    cargo-outdated \
    sccache || echo "⚠️  Some Rust tools failed to install"

# Setup Git configuration
echo "⚙️  Configuring Git..."
git config --global core.editor "code --wait"
git config --global init.defaultBranch main
git config --global pull.rebase false
git config --global fetch.prune true

# Setup GitHub CLI extensions
echo "🔌 Installing GitHub CLI extensions..."
gh extension install github/gh-copilot || echo "⚠️  Copilot extension already installed"
gh extension install dlvhdr/gh-dash || echo "⚠️  Dashboard extension not available"

# Create project directories
echo "📁 Creating project directories..."
mkdir -p ~/workspace/projects
mkdir -p ~/workspace/temp
mkdir -p ~/workspace/logs
mkdir -p ~/.secrets
mkdir -p ~/.config/n8n
mkdir -p ~/.local/share/supabase

# Setup n8n configuration
echo "🔄 Configuring n8n..."
mkdir -p ~/.n8n
cat > ~/.n8n/config <<EOF
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_HOST=localhost
N8N_PORT=5678
N8N_PROTOCOL=https
WEBHOOK_URL=https://localhost:5678
N8N_ENCRYPTION_KEY=\$(openssl rand -base64 32)
EOF

# Setup Supabase CLI
echo "🗄️  Initializing Supabase..."
supabase --version || echo "⚠️  Supabase CLI check..."

# Setup blockchain development tools
echo "⛓️  Setting up blockchain development environment..."
mkdir -p ~/.ethereum
mkdir -p ~/.solana

# Install Hardhat sample project structure
echo "🏗️  Setting up Hardhat sample structure..."
mkdir -p ~/workspace/blockchain-samples
cd ~/workspace/blockchain-samples
npx hardhat init --yes 2>/dev/null || echo "⚠️  Hardhat init skipped"
cd -

# Setup ZSH plugins
echo "🎨 Enhancing ZSH configuration..."
git clone https://github.com/zsh-users/zsh-autosuggestions ~/.oh-my-zsh/custom/plugins/zsh-autosuggestions 2>/dev/null || echo "✓ zsh-autosuggestions already installed"
git clone https://github.com/zsh-users/zsh-syntax-highlighting ~/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting 2>/dev/null || echo "✓ zsh-syntax-highlighting already installed"

# Update .zshrc
if [ -f ~/.zshrc ]; then
    if ! grep -q "zsh-autosuggestions" ~/.zshrc; then
        sed -i 's/plugins=(git)/plugins=(git zsh-autosuggestions zsh-syntax-highlighting docker docker-compose kubectl npm node python vscode)/g' ~/.zshrc
    fi
fi

# Setup environment variables template
echo "📝 Creating environment variables template..."
cat > ~/.env.template <<'EOF'
# GitHub Configuration
GITHUB_TOKEN=your_github_token_here
GITHUB_ENTERPRISE=true
GITHUB_SPARKS_ENABLED=true

# Anthropic Claude AI
ANTHROPIC_API_KEY=your_anthropic_api_key_here
CLAUDE_MODEL=claude-sonnet-4-20250514
CLAUDE_MAX_TOKENS=1000000

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_PROJECT_REF=your_project_ref
SUPABASE_DB_HOST=db.your-project.supabase.co
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your_db_password

# n8n Configuration
N8N_HOST=localhost
N8N_PORT=5678
N8N_PROTOCOL=https
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=generate_secure_password

# Ubuntu Pro & VPS
UBUNTU_PRO_TOKEN=your_ubuntu_pro_token
VPS_COUNT=15
VPS_FREE_COUNT=5
VPS_BONUS_COUNT=10

# Blockchain RPCs
ETHEREUM_RPC=https://mainnet.infura.io/v3/YOUR-PROJECT-ID
POLYGON_RPC=https://polygon-rpc.com
SOLANA_RPC=https://api.mainnet-beta.solana.com
BSC_RPC=https://bsc-dataseed.binance.org

# Security & Secrets
KEEPASS_DB_PATH=/home/vscode/.keepass/wallestars.kdbx
KEEPASS_PASSWORD=your_master_password
TAILS_PERSISTENT_STORAGE=/home/vscode/.tails-persistent

# Additional Services
REDIS_URL=redis://localhost:6379
MONGODB_URI=mongodb://localhost:27017/wallestars
JWT_SECRET=generate_jwt_secret_here
ENCRYPTION_KEY=generate_encryption_key_here
EOF

# Create helpful aliases
echo "🔗 Creating helpful aliases..."
cat >> ~/.zshrc <<'EOF'

# Wallestars Custom Aliases
alias ws-start='cd /workspaces/Wallestars && code .'
alias ws-n8n='n8n start'
alias ws-logs='pm2 logs'
alias ws-status='pm2 status'
alias ws-rebuild='npm run build && npm test'
alias ws-clean='rm -rf node_modules dist build .next && npm install'
alias ws-secrets='code ~/.secrets/'
alias ws-env='code ~/.env'

# Git Aliases
alias gst='git status'
alias gco='git checkout'
alias gaa='git add --all'
alias gcm='git commit -m'
alias gp='git push'
alias gl='git pull'
alias glog='git log --oneline --graph --decorate'

# Docker Aliases
alias dps='docker ps'
alias dpa='docker ps -a'
alias di='docker images'
alias dcu='docker-compose up -d'
alias dcd='docker-compose down'
alias dcl='docker-compose logs -f'

# Supabase Aliases
alias sb-start='supabase start'
alias sb-stop='supabase stop'
alias sb-status='supabase status'
alias sb-logs='supabase logs'

# Blockchain Development
alias hardhat-node='npx hardhat node'
alias hardhat-compile='npx hardhat compile'
alias hardhat-test='npx hardhat test'
alias ganache-start='ganache-cli'

# Utility Aliases
alias ll='ls -alh'
alias ports='netstat -tulanp'
alias myip='curl ifconfig.me'
alias weather='curl wttr.in'
EOF

# Create welcome message
echo "💡 Creating welcome message..."
cat > ~/.welcome.sh <<'EOF'
#!/bin/bash
echo ""
echo "🌟 Welcome to Wallestars Development Environment!"
echo "=================================================="
echo ""
echo "📚 Quick Start:"
echo "  ws-start      - Open Wallestars project"
echo "  ws-n8n        - Start n8n workflow engine"
echo "  ws-status     - Check service status"
echo "  ws-logs       - View application logs"
echo ""
echo "🔐 Security:"
echo "  - KeePassXC database: ~/.keepass/wallestars.kdbx"
echo "  - Environment template: ~/.env.template"
echo "  - Secrets directory: ~/.secrets/"
echo ""
echo "🔗 Ports:"
echo "  3000  - Frontend (React/Next.js)"
echo "  5000  - Backend API"
echo "  5678  - n8n Workflow Engine"
echo "  8545  - Local Blockchain"
echo "  54321 - Supabase Local"
echo ""
echo "📖 Documentation:"
echo "  /workspaces/Wallestars/docs/"
echo ""
echo "🚀 Ready to develop!"
echo ""
EOF
chmod +x ~/.welcome.sh

# Add welcome message to .zshrc
if ! grep -q "~/.welcome.sh" ~/.zshrc; then
    echo "~/.welcome.sh" >> ~/.zshrc
fi

# Install workspace dependencies if package.json exists
if [ -f "package.json" ]; then
    echo "📦 Installing workspace dependencies..."
    npm install || echo "⚠️  npm install will be run later"
fi

# Final permissions setup
echo "🔒 Setting up permissions..."
chmod 700 ~/.secrets
chmod 700 ~/.keepass 2>/dev/null || true
chmod 600 ~/.env.template

# Success message
echo ""
echo "✅ Wallestars development environment setup complete!"
echo "🎉 Ready for development!"
echo ""
echo "Run '~/.welcome.sh' to see quick start guide."
echo ""
