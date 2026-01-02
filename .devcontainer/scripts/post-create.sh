#!/bin/bash
# post-create.sh - Runs after container is created (dependencies installation)

set -e

echo "📦 Wallestars Dev Container - Installing Dependencies"
echo "===================================================="

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

cd /workspaces/Wallestars

# Install root dependencies
echo -e "${YELLOW}📦 Installing root dependencies...${NC}"
if [ -f "package.json" ]; then
    npm install
fi

# Install Eva Core dependencies
echo -e "${YELLOW}🧠 Installing Eva Core dependencies...${NC}"
if [ -f "eva-core/package.json" ]; then
    cd eva-core
    npm install
    cd ..
fi

# Install Shared utilities dependencies
echo -e "${YELLOW}🔧 Installing Shared utilities dependencies...${NC}"
if [ -f "shared/package.json" ]; then
    cd shared
    npm install
    cd ..
fi

# Setup environment files
echo -e "${YELLOW}🔐 Setting up environment files...${NC}"
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    cp .env.example .env
    echo -e "${BLUE}ℹ️  Created .env from .env.example - please configure your secrets!${NC}"
fi

# Setup Eva config
echo -e "${YELLOW}🤖 Setting up Eva configuration...${NC}"
if [ ! -f "eva-core/config/eva-config.json" ] && [ -f "eva-core/config/eva-config.template.json" ]; then
    cp eva-core/config/eva-config.template.json eva-core/config/eva-config.json
    echo -e "${BLUE}ℹ️  Created eva-config.json from template${NC}"
fi

# Create database initialization script
echo -e "${YELLOW}🗄️  Creating database initialization script...${NC}"
cat > scripts/db/01-init.sql << 'EOF'
-- Wallestars Database Initialization

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS eva;
CREATE SCHEMA IF NOT EXISTS workflows;
CREATE SCHEMA IF NOT EXISTS platforms;

-- Eva tables
CREATE TABLE IF NOT EXISTS eva.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform VARCHAR(50) NOT NULL,
    platform_user_id VARCHAR(255) NOT NULL,
    username VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(platform, platform_user_id)
);

CREATE TABLE IF NOT EXISTS eva.interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES eva.users(id),
    platform VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    content TEXT,
    sentiment VARCHAR(20),
    priority INTEGER,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS eva.actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interaction_id UUID REFERENCES eva.interactions(id),
    action_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    executed_at TIMESTAMP WITH TIME ZONE,
    result JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Workflows tables
CREATE TABLE IF NOT EXISTS workflows.executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL,
    input JSONB,
    output JSONB,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_platform ON eva.users(platform);
CREATE INDEX IF NOT EXISTS idx_interactions_user ON eva.interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_created ON eva.interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_actions_status ON eva.actions(status);
CREATE INDEX IF NOT EXISTS idx_actions_scheduled ON eva.actions(scheduled_at);

GRANT ALL PRIVILEGES ON SCHEMA eva TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA workflows TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA platforms TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA eva TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA workflows TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA platforms TO postgres;

-- Create n8n database
CREATE DATABASE n8n;
EOF

# Setup pre-commit hooks (if available)
if command -v pre-commit &> /dev/null; then
    echo -e "${YELLOW}🔗 Installing pre-commit hooks...${NC}"
    pre-commit install || echo -e "${BLUE}ℹ️  Pre-commit not configured yet${NC}"
fi

# Create quick access aliases file
echo -e "${YELLOW}🔗 Creating quick access aliases...${NC}"
cat > /workspace/Wallestars/.devcontainer/helpers/aliases.sh << 'EOF'
#!/bin/bash
# Quick access aliases for Wallestars project

# Navigation
alias ws="cd /workspaces/Wallestars"
alias eva="cd /workspaces/Wallestars/eva-core"
alias platforms="cd /workspaces/Wallestars/platforms"
alias workflows="cd /workspaces/Wallestars/workflows"
alias scripts="cd /workspaces/Wallestars/scripts"

# Eva commands
alias eva-demo="cd /workspaces/Wallestars/eva-core && npm run demo"
alias eva-test="cd /workspaces/Wallestars/eva-core && npm test"
alias eva-dev="cd /workspaces/Wallestars/eva-core && npm run dev"

# Docker commands
alias dc="docker-compose"
alias dps="docker ps"
alias dlogs="docker-compose logs -f"

# Database commands
alias psql-local="psql -h localhost -U postgres -d wallestars"
alias redis-cli-local="redis-cli -h localhost -a redis_dev_password"

# n8n commands
alias n8n-start="cd /workspaces/Wallestars && n8n start"
alias n8n-logs="docker-compose logs -f n8n"

# Supabase commands
alias supa="/workspaces/Wallestars/.devcontainer/helpers/supabase-cli.sh"
alias supa-start="supa start"
alias supa-stop="supa stop"
alias supa-studio="supa studio"

# GitHub Sparks commands
alias sparks="/workspace/.sparks/sparks-cli.sh"

# VM Management
alias vm-manager="/workspaces/Wallestars/.devcontainer/helpers/ubuntu-vm-manager.sh"
alias vms="vm-manager list"
alias vm-launch="vm-manager launch"
alias vm-shell="vm-manager shell"

# Platform management
alias platform-manager="/workspaces/Wallestars/.devcontainer/helpers/platform-manager.sh"
alias platforms-list="platform-manager list"

# Git shortcuts
alias gs="git status"
alias gp="git pull"
alias gc="git commit"
alias gco="git checkout"
alias glog="git log --oneline --graph --decorate"

# Environment
alias env-show="cat /workspaces/Wallestars/.env"
alias env-edit="code /workspaces/Wallestars/.env"

# Security
alias secrets-list="ls -la /workspace/.secrets/"
alias keepass-status="ls -la /workspace/.keepass/"
alias load-secrets="source /workspaces/Wallestars/.devcontainer/helpers/load-secrets.sh"
alias secrets-audit="/workspaces/Wallestars/.devcontainer/helpers/secrets-audit.sh"

# Utilities
alias health-check="/workspaces/Wallestars/.devcontainer/helpers/health-check.sh"
alias backup="/workspaces/Wallestars/.devcontainer/helpers/backup-manager.sh backup"
alias backup-list="/workspaces/Wallestars/.devcontainer/helpers/backup-manager.sh list"

echo "🎯 Wallestars aliases loaded!"
EOF

chmod +x /workspace/Wallestars/.devcontainer/helpers/aliases.sh

# Add to shell config
echo "source /workspace/Wallestars/.devcontainer/helpers/aliases.sh" >> ~/.bashrc
echo "source /workspace/Wallestars/.devcontainer/helpers/aliases.sh" >> ~/.zshrc

# === GitHub Sparks Integration ===
echo -e "${YELLOW}⚡ Setting up GitHub Sparks...${NC}"
if [ -f "/workspaces/Wallestars/.devcontainer/helpers/github-sparks-setup.sh" ]; then
    bash /workspaces/Wallestars/.devcontainer/helpers/github-sparks-setup.sh || echo -e "${BLUE}ℹ️  Sparks setup skipped (requires GitHub auth)${NC}"
fi

# === Supabase Integration ===
echo -e "${YELLOW}🗄️  Setting up Supabase...${NC}"
if [ -f "/workspaces/Wallestars/.devcontainer/helpers/supabase-integration.sh" ]; then
    bash /workspaces/Wallestars/.devcontainer/helpers/supabase-integration.sh || echo -e "${BLUE}ℹ️  Supabase setup skipped${NC}"
fi

# === Install PM2 globally for process management ===
echo -e "${YELLOW}📦 Installing PM2 process manager...${NC}"
npm install -g pm2 || echo -e "${BLUE}ℹ️  PM2 already installed${NC}"

# === Ubuntu VMs Setup ===
echo -e "${YELLOW}☁️  Initializing VM templates...${NC}"
if [ -f "/workspaces/Wallestars/.devcontainer/helpers/ubuntu-vm-manager.sh" ]; then
    bash /workspaces/Wallestars/.devcontainer/helpers/ubuntu-vm-manager.sh init || echo -e "${BLUE}ℹ️  VM setup skipped${NC}"
fi

# === Create Azure VM helper aliases ===
echo -e "${YELLOW}☁️  Setting up Azure VM helpers...${NC}"
cat >> /workspace/Wallestars/.devcontainer/helpers/aliases.sh << 'EOF'

# Azure VM Management (15 Ubuntu Pro VMs)
alias azure-vm-list="az vm list --output table"
alias azure-vm-start="azure_vm_start"
alias azure-vm-stop="azure_vm_stop"
alias azure-vm-status="azure_vm_status"

azure_vm_start() {
    if [ -z "$1" ] || [ -z "$2" ]; then
        echo "Usage: azure-vm-start <vm-name> <resource-group>"
        return 1
    fi
    echo "🚀 Starting VM: $1..."
    az vm start --name "$1" --resource-group "$2"
    echo "✅ VM $1 started"
}

azure_vm_stop() {
    if [ -z "$1" ] || [ -z "$2" ]; then
        echo "Usage: azure-vm-stop <vm-name> <resource-group>"
        return 1
    fi
    echo "🛑 Stopping VM: $1..."
    az vm stop --name "$1" --resource-group "$2"
    echo "✅ VM $1 stopped"
}

azure_vm_status() {
    if [ -z "$1" ] || [ -z "$2" ]; then
        echo "Usage: azure-vm-status <vm-name> <resource-group>"
        return 1
    fi
    az vm show -d --name "$1" --resource-group "$2" --query "powerState" -o table
}

# PM2 process management
alias pm2-n8n="pm2 start n8n --name wallestars-n8n -- start"
alias pm2-list="pm2 list"
alias pm2-logs="pm2 logs"
alias pm2-stop-all="pm2 stop all"
alias pm2-restart-all="pm2 restart all"

# KeePassXC quick access
alias keepass-get="/workspaces/Wallestars/.devcontainer/helpers/keepass-get.sh"

# 33mail email management
alias 33mail="/workspaces/Wallestars/.devcontainer/helpers/33mail"
alias email-create="33mail create"
alias email-list="33mail list"
alias email-get="33mail get"

# VPS management
alias vps="/workspaces/Wallestars/.devcontainer/helpers/vps"
alias vps-health="/workspaces/Wallestars/.devcontainer/helpers/vps-health"
alias vps-deploy="vps deploy"
alias vps-logs="vps logs"
alias vps-restart="vps restart"

# Multi-agent AI
alias agent-run="python3 /workspaces/Wallestars/.devcontainer/agents/multi-agent-orchestrator.py"
alias agent-chat="python3 /workspaces/Wallestars/.devcontainer/agents/multi-agent-orchestrator.py --interactive"
alias agent-stats="python3 /workspaces/Wallestars/.devcontainer/agents/multi-agent-orchestrator.py --stats"

EOF

# Make integration scripts executable
echo -e "${YELLOW}🔧 Setting up integration tools...${NC}"
chmod +x /workspaces/Wallestars/.devcontainer/integrations/33mail/33mail-manager.py 2>/dev/null || true
chmod +x /workspaces/Wallestars/.devcontainer/integrations/hostinger/hostinger-vps-manager.py 2>/dev/null || true
chmod +x /workspaces/Wallestars/.devcontainer/agents/multi-agent-orchestrator.py 2>/dev/null || true
chmod +x /workspaces/Wallestars/.devcontainer/helpers/* 2>/dev/null || true

echo -e "${GREEN}✅ Post-create setup complete!${NC}"
echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo -e "  1. Configure your .env file with secrets"
echo -e "  2. Configure eva-config.json"
echo -e "  3. Start services: docker-compose up -d"
echo -e "  4. Run Eva demo: eva-demo"
echo ""
echo -e "${BLUE}🆕 New commands available:${NC}"
echo -e "  📧 Email: 33mail create <purpose>, email-list, email-get <purpose>"
echo -e "  🖥️  VPS: vps-health, vps-deploy, vps-logs <service>"
echo -e "  🤖 AI Agents: agent-run \"query\", agent-chat, agent-stats"
echo ""
