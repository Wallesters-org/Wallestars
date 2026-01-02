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

# === Ubuntu VMs Setup ===
echo -e "${YELLOW}☁️  Initializing VM templates...${NC}"
if [ -f "/workspaces/Wallestars/.devcontainer/helpers/ubuntu-vm-manager.sh" ]; then
    bash /workspaces/Wallestars/.devcontainer/helpers/ubuntu-vm-manager.sh init || echo -e "${BLUE}ℹ️  VM setup skipped${NC}"
fi

echo -e "${GREEN}✅ Post-create setup complete!${NC}"
echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo -e "  1. Configure your .env file with secrets"
echo -e "  2. Configure eva-config.json"
echo -e "  3. Start services: docker-compose up -d"
echo -e "  4. Run Eva demo: eva-demo"
echo ""
