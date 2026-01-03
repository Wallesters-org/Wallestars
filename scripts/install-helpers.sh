#!/bin/bash
# Wallestars Helper Scripts
# Convenient aliases and shortcuts for development

# Make Python scripts executable
chmod +x platforms/33mail-integration/33mail-manager.py
chmod +x platforms/hostinger-vps/hostinger-vps-manager.py
chmod +x shared/orchestrator/multi-agent-orchestrator.py

echo "🔧 Wallestars Helper Scripts Installer"
echo "======================================"
echo ""

# Create ~/.wallestars-aliases if it doesn't exist
ALIAS_FILE="$HOME/.wallestars-aliases"
cat > "$ALIAS_FILE" << 'EOF'
# Wallestars Helper Aliases
# Source this file in your ~/.bashrc or ~/.zshrc:
# echo "source ~/.wallestars-aliases" >> ~/.bashrc

# Project root (update this if needed)
export WALLESTARS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# === 33mail Aliases ===
alias 33mail="python $WALLESTARS_ROOT/platforms/33mail-integration/33mail-manager.py"
alias 33m="33mail"
alias email-gen="33mail generate"
alias email-list="33mail list"

# === VPS Management Aliases ===
alias vps="python $WALLESTARS_ROOT/platforms/hostinger-vps/hostinger-vps-manager.py"
alias vps-health="vps health"
alias vps-status="vps status all"
alias vps-deploy="vps deploy"
alias vps-logs="vps logs"
alias vps-restart="vps restart"

# === Multi-Agent Orchestrator ===
alias orchestrator="python $WALLESTARS_ROOT/shared/orchestrator/multi-agent-orchestrator.py"
alias agents="orchestrator"

# === Eva Core Aliases ===
alias eva="cd $WALLESTARS_ROOT/eva-core && npm start"
alias eva-demo="cd $WALLESTARS_ROOT/eva-core && npm run demo"
alias eva-test="cd $WALLESTARS_ROOT/eva-core && npm test"

# === n8n Aliases ===
alias n8n-start="n8n start"
alias n8n-stop="pkill -f n8n"
alias n8n-open="open http://localhost:5678"

# === Docker Aliases ===
alias dc="docker-compose"
alias dcu="docker-compose up -d"
alias dcd="docker-compose down"
alias dcl="docker-compose logs -f"
alias dcp="docker-compose ps"

# === Git Aliases ===
alias gs="git status"
alias ga="git add"
alias gc="git commit -m"
alias gp="git push"
alias gl="git log --oneline -10"
alias gd="git diff"

# === Quick Navigation ===
alias wroot="cd $WALLESTARS_ROOT"
alias weva="cd $WALLESTARS_ROOT/eva-core"
alias wplat="cd $WALLESTARS_ROOT/platforms"
alias wdocs="cd $WALLESTARS_ROOT/docs"
alias wwork="cd $WALLESTARS_ROOT/workflows"

# === Helper Functions ===

# Quick deploy
wdeploy() {
    echo "🚀 Deploying to VPS..."
    vps deploy
}

# Full health check
whealth() {
    echo "🏥 Running comprehensive health check..."
    echo ""
    echo "=== VPS Health ==="
    vps health
    echo ""
    echo "=== Eva Status ==="
    cd "$WALLESTARS_ROOT/eva-core" && npm run test 2>/dev/null || echo "Eva tests not available"
}

# Generate email for service
wemail() {
    if [ -z "$1" ]; then
        echo "Usage: wemail <service-name> [description]"
        return 1
    fi
    33mail generate "$1" "${2:-Email for $1}"
}

# Quick VPS SSH
wssh() {
    ssh root@72.61.154.188
}

# View VPS logs
wlogs() {
    local service="${1:-n8n}"
    local lines="${2:-50}"
    vps logs "$service" --lines "$lines"
}

# Start all services
wstart() {
    echo "🚀 Starting Wallestars services..."
    echo ""
    echo "1. Starting Eva Core..."
    cd "$WALLESTARS_ROOT/eva-core" && npm start &
    echo "2. Starting n8n..."
    n8n start &
    echo ""
    echo "✅ Services started!"
    echo "   - Eva Core: http://localhost:3000"
    echo "   - n8n: http://localhost:5678"
}

# Stop all services
wstop() {
    echo "🛑 Stopping Wallestars services..."
    pkill -f "eva-core"
    pkill -f "n8n"
    echo "✅ Services stopped!"
}

# Show quick help
whelp() {
    echo "🌟 Wallestars Quick Reference"
    echo "============================="
    echo ""
    echo "33mail Management:"
    echo "  33mail generate <service>    - Generate disposable email"
    echo "  33mail list                  - List all emails"
    echo "  wemail <service>             - Quick email generation"
    echo ""
    echo "VPS Management:"
    echo "  vps-health                   - Run health check"
    echo "  vps-status                   - Check all services"
    echo "  vps-deploy                   - Deploy updates"
    echo "  vps-logs <service>           - View logs"
    echo "  wssh                         - SSH to VPS"
    echo ""
    echo "Development:"
    echo "  eva-demo                     - Run Eva demo"
    echo "  n8n-start                    - Start n8n"
    echo "  wstart                       - Start all services"
    echo "  wstop                        - Stop all services"
    echo ""
    echo "Navigation:"
    echo "  wroot                        - Go to project root"
    echo "  weva                         - Go to Eva Core"
    echo "  wplat                        - Go to platforms"
    echo ""
    echo "For full documentation, see: $WALLESTARS_ROOT/docs/"
}

EOF

echo "✅ Created alias file: $ALIAS_FILE"
echo ""
echo "📝 To use these aliases, add to your ~/.bashrc or ~/.zshrc:"
echo ""
echo "   echo 'source ~/.wallestars-aliases' >> ~/.bashrc"
echo "   source ~/.bashrc"
echo ""
echo "Or for immediate use:"
echo ""
echo "   source ~/.wallestars-aliases"
echo ""
echo "🎯 Quick commands available:"
echo "   - 33mail (manage disposable emails)"
echo "   - vps (manage VPS)"
echo "   - eva-demo (run Eva demo)"
echo "   - whelp (show quick reference)"
echo ""
echo "✨ Run 'whelp' after sourcing to see all available commands!"
