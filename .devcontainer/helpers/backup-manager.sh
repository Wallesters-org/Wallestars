#!/bin/bash
# backup-manager.sh - Database and configuration backup

set -e

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

BACKUP_DIR="/workspace/.backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

backup_database() {
    echo -e "${YELLOW}💾 Backing up PostgreSQL database...${NC}"
    
    # Wallestars database
    docker exec wallestars-postgres pg_dump -U postgres wallestars | gzip > "$BACKUP_DIR/wallestars_${TIMESTAMP}.sql.gz"
    echo -e "${GREEN}✅ Wallestars DB backed up${NC}"
    
    # n8n database
    docker exec wallestars-postgres pg_dump -U postgres n8n | gzip > "$BACKUP_DIR/n8n_${TIMESTAMP}.sql.gz"
    echo -e "${GREEN}✅ n8n DB backed up${NC}"
}

backup_configs() {
    echo -e "${YELLOW}📝 Backing up configurations...${NC}"
    
    CONFIG_BACKUP="$BACKUP_DIR/configs_${TIMESTAMP}.tar.gz"
    
    tar -czf "$CONFIG_BACKUP" \
        /workspaces/Wallestars/.env \
        /workspaces/Wallestars/eva-core/config/eva-config.json \
        /workspaces/Wallestars/workflows/*.json \
        2>/dev/null || true
    
    echo -e "${GREEN}✅ Configs backed up${NC}"
}

backup_volumes() {
    echo -e "${YELLOW}📦 Backing up Docker volumes...${NC}"
    
    # n8n data
    docker run --rm \
        -v wallestars-n8n-data:/data \
        -v "$BACKUP_DIR":/backup \
        alpine tar czf /backup/n8n-volume_${TIMESTAMP}.tar.gz /data
    
    echo -e "${GREEN}✅ Volumes backed up${NC}"
}

restore_database() {
    backup_file=$1
    
    if [ -z "$backup_file" ]; then
        echo -e "${RED}❌ Error: Backup file required${NC}"
        echo "Usage: $0 restore-db <backup-file.sql.gz>"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        echo -e "${RED}❌ Error: Backup file not found${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}🔄 Restoring database from $backup_file...${NC}"
    
    gunzip -c "$backup_file" | docker exec -i wallestars-postgres psql -U postgres wallestars
    
    echo -e "${GREEN}✅ Database restored${NC}"
}

list_backups() {
    echo -e "${BLUE}📋 Available Backups:${NC}"
    echo "===================="
    
    if [ -d "$BACKUP_DIR" ]; then
        ls -lh "$BACKUP_DIR" | tail -n +2
    else
        echo "No backups found"
    fi
}

cleanup_old_backups() {
    days=${1:-7}
    
    echo -e "${YELLOW}🧹 Cleaning backups older than $days days...${NC}"
    
    find "$BACKUP_DIR" -type f -mtime +$days -delete
    
    echo -e "${GREEN}✅ Cleanup complete${NC}"
}

# Main
case "$1" in
    backup)
        echo -e "${BLUE}🚀 Starting full backup...${NC}"
        backup_database
        backup_configs
        backup_volumes
        echo ""
        echo -e "${GREEN}✅ Full backup complete!${NC}"
        echo -e "${BLUE}Location: $BACKUP_DIR${NC}"
        ;;
    backup-db)
        backup_database
        ;;
    backup-configs)
        backup_configs
        ;;
    restore-db)
        restore_database "$2"
        ;;
    list)
        list_backups
        ;;
    cleanup)
        cleanup_old_backups "$2"
        ;;
    *)
        echo "Usage: $0 {backup|backup-db|backup-configs|restore-db|list|cleanup}"
        echo ""
        echo "Commands:"
        echo "  backup              - Full backup (DB + configs + volumes)"
        echo "  backup-db           - Backup databases only"
        echo "  backup-configs      - Backup configs only"
        echo "  restore-db <file>   - Restore database from backup"
        echo "  list                - List available backups"
        echo "  cleanup [days]      - Remove backups older than N days (default: 7)"
        echo ""
        exit 1
        ;;
esac
