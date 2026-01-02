#!/bin/bash
# post-start.sh - Runs each time the container starts

set -e

echo "🔄 Wallestars Dev Container - Post Start"
echo "======================================="

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if services are running
echo -e "${YELLOW}🔍 Checking services status...${NC}"

# Check PostgreSQL
if command -v pg_isready &> /dev/null; then
    if pg_isready -h localhost -p 5432 -U postgres &> /dev/null; then
        echo -e "${GREEN}✅ PostgreSQL is ready${NC}"
    else
        echo -e "${YELLOW}⏳ PostgreSQL is starting...${NC}"
    fi
fi

# Check Redis
if command -v redis-cli &> /dev/null; then
    if redis-cli -h localhost -a redis_dev_password ping &> /dev/null; then
        echo -e "${GREEN}✅ Redis is ready${NC}"
    else
        echo -e "${YELLOW}⏳ Redis is starting...${NC}"
    fi
fi

# Display useful information
echo ""
echo -e "${BLUE}📊 Services Information:${NC}"
echo "  • Main App: http://localhost:3000"
echo "  • n8n: http://localhost:5678"
echo "  • Supabase Studio: http://localhost:3001"
echo "  • pgAdmin: http://localhost:5050"
echo "  • Redis Commander: http://localhost:8081"
echo "  • Mailhog: http://localhost:8025"
echo ""
echo -e "${BLUE}🔑 Quick Commands:${NC}"
echo "  • eva-demo    - Run Eva Core demo"
echo "  • eva-test    - Run Eva Core tests"
echo "  • ws          - Go to workspace root"
echo "  • psql-local  - Connect to PostgreSQL"
echo "  • dlogs       - Show Docker logs"
echo ""

# Check for updates
cd /workspaces/Wallestars
if [ -d ".git" ]; then
    echo -e "${YELLOW}🔄 Checking for updates...${NC}"
    git fetch origin --quiet || true
    
    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse @{u} 2>/dev/null) || REMOTE=$LOCAL
    
    if [ "$LOCAL" != "$REMOTE" ]; then
        echo -e "${BLUE}ℹ️  Updates available! Run 'git pull' to update.${NC}"
    fi
fi

echo -e "${GREEN}✅ Container is ready!${NC}"
