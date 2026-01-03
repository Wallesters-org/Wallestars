#!/bin/bash
set -e

echo "🚀 Setting up Wallestars Development Environment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================
# 1. System Updates and Essential Tools
# ============================================
echo -e "${BLUE}📦 Installing system dependencies...${NC}"
sudo apt-get update
sudo apt-get install -y \
    curl \
    wget \
    git \
    vim \
    nano \
    jq \
    htop \
    tree \
    net-tools \
    postgresql-client \
    build-essential \
    python3-pip \
    python3-venv \
    redis-tools \
    ca-certificates \
    gnupg \
    lsb-release

# ============================================
# 2. Node.js Dependencies
# ============================================
echo -e "${BLUE}📦 Installing Node.js dependencies...${NC}"
npm install -g npm@latest
npm install -g n8n
npm install -g typescript
npm install -g ts-node
npm install -g nodemon
npm install -g pm2
npm install -g pnpm
npm install -g yarn

# ============================================
# 3. Python Tools for AI/ML
# ============================================
echo -e "${BLUE}🐍 Installing Python tools...${NC}"
pip3 install --upgrade pip
pip3 install \
    openai \
    anthropic \
    supabase \
    python-dotenv \
    requests \
    pandas \
    numpy \
    jupyter \
    jupyterlab

# ============================================
# 4. Supabase CLI
# ============================================
echo -e "${BLUE}🗄️  Installing Supabase CLI...${NC}"
if ! command -v supabase &> /dev/null; then
    npm install -g supabase
fi

# ============================================
# 5. KeePassXC CLI Tools (for secret management)
# ============================================
echo -e "${BLUE}🔐 Installing secret management tools...${NC}"
sudo apt-get install -y keepassxc-cli

# ============================================
# 6. Docker Compose (for n8n and services)
# ============================================
echo -e "${BLUE}🐳 Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# ============================================
# 7. GitHub CLI Extensions
# ============================================
echo -e "${BLUE}🐙 Configuring GitHub CLI...${NC}"
if command -v gh &> /dev/null; then
    gh extension install github/gh-copilot || true
fi

# ============================================
# 8. Oh My Zsh Plugins
# ============================================
echo -e "${BLUE}🎨 Configuring Zsh plugins...${NC}"
if [ -d "$HOME/.oh-my-zsh" ]; then
    # Install zsh-autosuggestions
    git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions 2>/dev/null || true
    
    # Install zsh-syntax-highlighting
    git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting 2>/dev/null || true
    
    # Install powerlevel10k theme
    git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/themes/powerlevel10k 2>/dev/null || true
    
    # Update .zshrc with plugins
    sed -i 's/plugins=(git)/plugins=(git docker docker-compose npm node python zsh-autosuggestions zsh-syntax-highlighting)/g' ~/.zshrc || true
fi

# ============================================
# 9. Project Dependencies
# ============================================
echo -e "${BLUE}📦 Installing project dependencies...${NC}"
if [ -f "package.json" ]; then
    npm install
fi

# ============================================
# 10. Environment Setup
# ============================================
echo -e "${BLUE}⚙️  Setting up environment...${NC}"
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Created .env from .env.example - Please configure your API keys${NC}"
fi

# ============================================
# 11. Git Configuration
# ============================================
echo -e "${BLUE}🔧 Configuring Git...${NC}"
git config --global core.editor "code --wait"
git config --global init.defaultBranch main
git config --global pull.rebase false

# ============================================
# 12. Create Workspace Directories
# ============================================
echo -e "${BLUE}📁 Creating workspace directories...${NC}"
mkdir -p ~/workspace/{secrets,backups,logs,temp}
mkdir -p ~/.local/bin

# ============================================
# 13. Security Setup
# ============================================
echo -e "${BLUE}🔒 Setting up security configurations...${NC}"

# Create gitignore for secrets
cat > ~/workspace/secrets/.gitignore << 'EOFGITIGNORE'
# Ignore all files in secrets directory
*
# Except this gitignore
!.gitignore
EOFGITIGNORE

# Create script for KeePassXC integration
cat > ~/.local/bin/keepass-get << 'EOFKEEPASS'
#!/bin/bash
# KeePassXC CLI integration script
# Usage: keepass-get <entry-name>
# Requires KeePassXC database path and key file

KEEPASS_DB="${KEEPASS_DB_PATH:-/mnt/persistent/keepass.kdbx}"
KEEPASS_KEY="${KEEPASS_KEY_FILE:-/mnt/persistent/keepass.key}"

if [ -z "$1" ]; then
    echo "Usage: keepass-get <entry-name>"
    exit 1
fi

if [ ! -f "$KEEPASS_DB" ]; then
    echo "Error: KeePassXC database not found at $KEEPASS_DB"
    echo "Set KEEPASS_DB_PATH environment variable to the correct path"
    exit 1
fi

# Use keepassxc-cli to extract password
keepassxc-cli show -s "$KEEPASS_DB" "$1" -k "$KEEPASS_KEY"
EOFKEEPASS

chmod +x ~/.local/bin/keepass-get

# ============================================
# 14. Create Helper Scripts
# ============================================
echo -e "${BLUE}📝 Creating helper scripts...${NC}"

# Eva start script
cat > ~/.local/bin/eva-start << 'EOFEVA'
#!/bin/bash
echo "🤖 Starting Eva Core..."
cd eva-core
npm start
EOFEVA

# n8n start script
cat > ~/.local/bin/n8n-start << 'EOFN8N'
#!/bin/bash
echo "🔄 Starting n8n..."
export N8N_HOST=0.0.0.0
export N8N_PORT=5678
n8n start
EOFN8N

# Supabase local setup
cat > ~/.local/bin/supabase-local << 'EOFSUPA'
#!/bin/bash
echo "🗄️  Starting Supabase locally..."
supabase start
EOFSUPA

chmod +x ~/.local/bin/{eva-start,n8n-start,supabase-local}

# Add to PATH
if ! grep -q '~/.local/bin' ~/.zshrc; then
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
fi

# ============================================
# 15. Azure VM Management Scripts
# ============================================
echo -e "${BLUE}☁️  Setting up Azure VM management...${NC}"

cat > ~/.local/bin/azure-vm-list << 'EOFAZURE'
#!/bin/bash
# List all Ubuntu Pro VMs
az vm list --output table
EOFAZURE

cat > ~/.local/bin/azure-vm-start << 'EOFAZURESTART'
#!/bin/bash
# Start VM: azure-vm-start <vm-name> <resource-group>
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: azure-vm-start <vm-name> <resource-group>"
    exit 1
fi
az vm start --name "$1" --resource-group "$2"
EOFAZURESTART

cat > ~/.local/bin/azure-vm-stop << 'EOFAZURESTOP'
#!/bin/bash
# Stop VM: azure-vm-stop <vm-name> <resource-group>
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: azure-vm-stop <vm-name> <resource-group>"
    exit 1
fi
az vm stop --name "$1" --resource-group "$2"
EOFAZURESTOP

chmod +x ~/.local/bin/azure-vm-*

# ============================================
# 16. Create Documentation
# ============================================
echo -e "${BLUE}📚 Creating development documentation...${NC}"

cat > ~/workspace/DEVCONTAINER-GUIDE.md << 'EOFDOC'
# Wallestars Development Container Guide

## 🎯 Quick Start

### Starting Services

```bash
# Start Eva Core
eva-start

# Start n8n
n8n-start

# Start Supabase locally
supabase-local
```

### Secret Management with KeePassXC

```bash
# Get a secret from KeePassXC
keepass-get "GitHub Token"

# Set environment variable from KeePassXC
export GITHUB_TOKEN=$(keepass-get "GitHub Token")
```

### Azure VM Management

```bash
# List all VMs
azure-vm-list

# Start a VM
azure-vm-start my-vm my-resource-group

# Stop a VM
azure-vm-stop my-vm my-resource-group
```

## 🔐 Security Best Practices

1. **Never commit secrets** - Use .env files (gitignored)
2. **Use KeePassXC** for credential storage
3. **Rotate API keys** regularly
4. **Enable 2FA** on all services
5. **Use SSH keys** for Git authentication

## 🛠️ Available Tools

- **Node.js 22**: Latest LTS
- **Python 3.11**: AI/ML tools
- **Docker**: Container management
- **n8n**: Workflow automation
- **Supabase CLI**: Database management
- **GitHub CLI**: Repository management
- **Azure CLI**: VM management (15 Ubuntu Pro VMs)
- **KeePassXC CLI**: Secret management

## 📦 VS Code Extensions

### AI Assistants
- Claude Dev (Cline) - 1M context model
- GitHub Copilot
- Continue.dev

### Development
- ESLint, Prettier
- GitLens
- Thunder Client (API testing)
- Supabase extension

### Database
- SQLTools with PostgreSQL driver
- Supabase extension

## 🔗 Important URLs

- n8n: http://localhost:5678
- Supabase Studio: http://localhost:54321
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🌟 Cline (Claude Dev) Features

- **1M Token Context**: Full codebase understanding
- **File Operations**: Read, write, edit files
- **Terminal Access**: Execute commands
- **Browser Control**: Test UI changes
- **Multi-step Tasks**: Complex workflow automation

### Recommended Cline Permissions
- ✅ Read files
- ✅ Write files
- ✅ Execute commands
- ✅ Use browser
- ✅ Access secrets (with approval)

## 🤖 Eva Core Integration

Eva is integrated with:
- Claude AI (Anthropic)
- OpenAI GPT-4
- n8n workflows
- Supabase database
- Multiple social platforms

## 📚 Additional Resources

- Main README: `/README.md`
- Quick Access: `/docs/QUICK-ACCESS.md`
- Eva Integration: `/docs/EVA-DJ-INTEGRATION.md`
- File Structure: `/docs/FILE-STRUCTURE.md`

EOFDOC

# ============================================
# 17. Final Setup
# ============================================
echo -e "${BLUE}🎨 Finalizing setup...${NC}"

# Create welcome message
cat > ~/.welcome.sh << 'EOFWELCOME'
#!/bin/bash
echo ""
echo "🌟 =============================================== 🌟"
echo "   Welcome to Wallestars Development Environment"
echo "🌟 =============================================== 🌟"
echo ""
echo "📚 Documentation: ~/workspace/DEVCONTAINER-GUIDE.md"
echo "🔐 Secrets: ~/workspace/secrets/"
echo "📝 Logs: ~/workspace/logs/"
echo ""
echo "🚀 Quick Commands:"
echo "   eva-start      - Start Eva Core"
echo "   n8n-start      - Start n8n"
echo "   supabase-local - Start Supabase"
echo "   keepass-get    - Get secret from KeePassXC"
echo ""
echo "🔗 Services:"
echo "   n8n:           http://localhost:5678"
echo "   Supabase:      http://localhost:54321"
echo "   Frontend:      http://localhost:3000"
echo ""
EOFWELCOME

chmod +x ~/.welcome.sh

# Add welcome message to .zshrc
if ! grep -q '.welcome.sh' ~/.zshrc; then
    echo 'source ~/.welcome.sh' >> ~/.zshrc
fi

echo -e "${GREEN}✅ Setup complete!${NC}"
echo -e "${GREEN}🎉 Wallestars Development Environment is ready!${NC}"
echo ""
echo "📝 Next steps:"
echo "   1. Configure .env with your API keys"
echo "   2. Run 'npm install' if not done automatically"
echo "   3. Start Eva: eva-start"
echo "   4. Start n8n: n8n-start"
echo ""
