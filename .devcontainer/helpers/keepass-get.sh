#!/bin/bash
# keepass-get.sh - Quick access to KeePassXC secrets
# Usage: keepass-get <entry-name>

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
KEEPASS_DB="${KEEPASS_DB_PATH:-/mnt/tails/persistent/Wallestars.kdbx}"
KEEPASS_KEY="${KEEPASS_KEY_FILE:-/mnt/tails/persistent/wallestars.key}"

# Check arguments
if [ -z "$1" ]; then
    echo -e "${RED}❌ Usage: keepass-get <entry-name>${NC}"
    echo ""
    echo "Examples:"
    echo "  keepass-get 'Claude API Key'"
    echo "  keepass-get 'GitHub Token'"
    echo "  keepass-get 'Anthropic API Key'"
    echo ""
    echo "Environment Variables:"
    echo "  KEEPASS_DB_PATH    - Path to KeePassXC database"
    echo "  KEEPASS_KEY_FILE   - Path to key file (optional)"
    exit 1
fi

# Check if database exists
if [ ! -f "$KEEPASS_DB" ]; then
    echo -e "${RED}❌ KeePassXC database not found: $KEEPASS_DB${NC}"
    echo ""
    echo "Tips:"
    echo "1. Mount your Tails persistent storage:"
    echo "   sudo mount /dev/disk/by-label/TailsData /mnt/tails"
    echo ""
    echo "2. Set environment variable:"
    echo "   export KEEPASS_DB_PATH=/path/to/your/database.kdbx"
    exit 1
fi

ENTRY_NAME="$1"

echo -e "${BLUE}🔐 Accessing KeePassXC database...${NC}"
echo -e "${BLUE}📁 Database: $KEEPASS_DB${NC}"

# Method 1: Using key file if available
if [ -f "$KEEPASS_KEY" ]; then
    echo -e "${BLUE}🔑 Using key file: $KEEPASS_KEY${NC}"
    echo -e "${BLUE}🔒 Enter master password:${NC}"
    
    # Extract password field
    PASSWORD=$(keepassxc-cli show -q -s -k "$KEEPASS_KEY" "$KEEPASS_DB" "$ENTRY_NAME" 2>/dev/null | grep -i "^Password:" | cut -d' ' -f2-)
    
    if [ -n "$PASSWORD" ]; then
        echo -e "${GREEN}✅ Retrieved: $ENTRY_NAME${NC}"
        echo "$PASSWORD"
    else
        echo -e "${RED}❌ Entry not found: $ENTRY_NAME${NC}"
        echo ""
        echo "Available groups and entries:"
        keepassxc-cli ls -q -k "$KEEPASS_KEY" "$KEEPASS_DB" 2>/dev/null || true
        exit 1
    fi
else
    # Method 2: Password only
    echo -e "${BLUE}🔒 Enter master password:${NC}"
    
    PASSWORD=$(keepassxc-cli show -q -s "$KEEPASS_DB" "$ENTRY_NAME" 2>/dev/null | grep -i "^Password:" | cut -d' ' -f2-)
    
    if [ -n "$PASSWORD" ]; then
        echo -e "${GREEN}✅ Retrieved: $ENTRY_NAME${NC}"
        echo "$PASSWORD"
    else
        echo -e "${RED}❌ Entry not found: $ENTRY_NAME${NC}"
        echo ""
        echo "Available groups and entries:"
        keepassxc-cli ls -q "$KEEPASS_DB" 2>/dev/null || true
        exit 1
    fi
fi

# Optional: Cache in environment for session
if [ "$2" == "--export" ]; then
    SAFE_NAME=$(echo "$ENTRY_NAME" | tr '[:lower:] ' '[:upper:]_')
    echo ""
    echo -e "${BLUE}💾 To export as environment variable, run:${NC}"
    echo "export ${SAFE_NAME}='${PASSWORD}'"
fi
