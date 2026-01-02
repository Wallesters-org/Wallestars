#!/bin/bash
# health-check.sh - Check all services health

set -e

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🏥 Wallestars Health Check${NC}"
echo "=========================="
echo ""

# Check PostgreSQL
echo -n "PostgreSQL ... "
if pg_isready -h localhost -p 5432 -U postgres &> /dev/null; then
    echo -e "${GREEN}✅ Healthy${NC}"
else
    echo -e "${RED}❌ Down${NC}"
fi

# Check Redis
echo -n "Redis ... "
if redis-cli -h localhost -p 6379 -a redis_dev_password ping &> /dev/null; then
    echo -e "${GREEN}✅ Healthy${NC}"
else
    echo -e "${RED}❌ Down${NC}"
fi

# Check n8n
echo -n "n8n ... "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5678 | grep -q "200\|401"; then
    echo -e "${GREEN}✅ Healthy${NC}"
else
    echo -e "${RED}❌ Down${NC}"
fi

# Check Supabase Studio
echo -n "Supabase Studio ... "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 | grep -q "200\|301"; then
    echo -e "${GREEN}✅ Healthy${NC}"
else
    echo -e "${RED}❌ Down${NC}"
fi

# Check pgAdmin
echo -n "pgAdmin ... "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5050 | grep -q "200\|302"; then
    echo -e "${GREEN}✅ Healthy${NC}"
else
    echo -e "${RED}❌ Down${NC}"
fi

# Check Mailhog
echo -n "Mailhog ... "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8025 | grep -q "200"; then
    echo -e "${GREEN}✅ Healthy${NC}"
else
    echo -e "${RED}❌ Down${NC}"
fi

echo ""
echo -e "${BLUE}📊 Resource Usage:${NC}"
echo "==================="

# Docker stats (one-shot)
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | grep wallestars

echo ""
echo -e "${BLUE}💾 Database Size:${NC}"
echo "================="
psql -h localhost -U postgres -d wallestars -c "
    SELECT 
        pg_size_pretty(pg_database_size('wallestars')) as database_size,
        pg_size_pretty(pg_database_size('n8n')) as n8n_size;
" 2>/dev/null || echo "Database not accessible"

echo ""
echo -e "${GREEN}✅ Health check complete!${NC}"
