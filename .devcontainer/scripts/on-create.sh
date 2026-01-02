#!/bin/bash
# on-create.sh - Runs once when container is first created
# This script sets up the basic environment and structure

set -e

echo "🚀 Wallestars Dev Container - Initial Setup"
echo "=========================================="

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create necessary directories
echo -e "${YELLOW}📁 Creating workspace directories...${NC}"
mkdir -p \
    /workspace/.secrets \
    /workspace/.cache \
    /workspace/.logs \
    /workspace/.keepass \
    /workspace/Wallestars/.vscode \
    /workspace/Wallestars/scripts/db

# Set permissions
chmod 700 /workspace/.secrets
chmod 700 /workspace/.keepass

# Create .gitignore additions
echo -e "${YELLOW}🔒 Setting up security ignore patterns...${NC}"
cat >> /workspace/Wallestars/.gitignore.devcontainer << 'EOF'
# Dev Container specific
.devcontainer/.secrets/
.devcontainer/.cache/
.devcontainer/.logs/
.devcontainer/.keepass/

# Database dumps
*.sql.gz
*.dump

# Local dev files
*.local
.env.*.local

# IDE
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
EOF

# Create VS Code workspace settings
echo -e "${YELLOW}⚙️  Creating VS Code workspace settings...${NC}"
cat > /workspace/Wallestars/.vscode/settings.json << 'EOF'
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/.env": true,
    "**/.env.local": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/package-lock.json": true,
    "**/.secrets": true
  }
}
EOF

# Create helper scripts directory
mkdir -p /workspace/Wallestars/.devcontainer/helpers

# Git configuration
echo -e "${YELLOW}🔧 Configuring Git...${NC}"
git config --global core.autocrlf input
git config --global init.defaultBranch main
git config --global pull.rebase false
git config --global credential.helper store

# Setup git hooks directory
mkdir -p /workspace/Wallestars/.git/hooks

echo -e "${GREEN}✅ Initial setup complete!${NC}"
