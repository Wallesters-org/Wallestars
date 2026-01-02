#!/bin/bash
# platform-manager.sh - Manage platform integrations

set -e

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

PLATFORMS_DIR="/workspaces/Wallestars/platforms"

# Functions
list_platforms() {
    echo -e "${BLUE}📱 Available Platforms:${NC}"
    echo "======================="
    
    for platform in "$PLATFORMS_DIR"/*; do
        if [ -d "$platform" ]; then
            name=$(basename "$platform")
            if [ -f "$platform/README.md" ]; then
                desc=$(head -3 "$platform/README.md" | tail -1)
                echo -e "${GREEN}✓${NC} $name - $desc"
            else
                echo -e "${YELLOW}○${NC} $name - (No documentation)"
            fi
        fi
    done
    echo ""
}

setup_platform() {
    platform=$1
    
    if [ -z "$platform" ]; then
        echo -e "${RED}❌ Error: Platform name required${NC}"
        echo "Usage: $0 setup <platform-name>"
        exit 1
    fi
    
    platform_dir="$PLATFORMS_DIR/$platform"
    
    if [ ! -d "$platform_dir" ]; then
        echo -e "${RED}❌ Error: Platform '$platform' not found${NC}"
        list_platforms
        exit 1
    fi
    
    echo -e "${YELLOW}🔧 Setting up platform: $platform${NC}"
    
    # Check for setup script
    if [ -f "$platform_dir/setup.sh" ]; then
        echo -e "${BLUE}Running setup script...${NC}"
        bash "$platform_dir/setup.sh"
    else
        echo -e "${YELLOW}No setup script found${NC}"
    fi
    
    # Check for dependencies
    if [ -f "$platform_dir/package.json" ]; then
        echo -e "${BLUE}Installing dependencies...${NC}"
        cd "$platform_dir"
        npm install
    fi
    
    # Check for .env template
    if [ -f "$platform_dir/.env.example" ]; then
        if [ ! -f "$platform_dir/.env" ]; then
            echo -e "${BLUE}Creating .env from template...${NC}"
            cp "$platform_dir/.env.example" "$platform_dir/.env"
            echo -e "${YELLOW}⚠️  Please configure $platform_dir/.env${NC}"
        fi
    fi
    
    echo -e "${GREEN}✅ Platform '$platform' setup complete!${NC}"
}

test_platform() {
    platform=$1
    
    if [ -z "$platform" ]; then
        echo -e "${RED}❌ Error: Platform name required${NC}"
        exit 1
    fi
    
    platform_dir="$PLATFORMS_DIR/$platform"
    
    if [ ! -d "$platform_dir" ]; then
        echo -e "${RED}❌ Error: Platform '$platform' not found${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}🧪 Testing platform: $platform${NC}"
    
    if [ -f "$platform_dir/test.js" ]; then
        cd "$platform_dir"
        node test.js
    elif [ -f "$platform_dir/package.json" ]; then
        cd "$platform_dir"
        npm test
    else
        echo -e "${YELLOW}No tests found for $platform${NC}"
    fi
}

# Main
case "$1" in
    list)
        list_platforms
        ;;
    setup)
        setup_platform "$2"
        ;;
    test)
        test_platform "$2"
        ;;
    *)
        echo "Usage: $0 {list|setup|test} [platform-name]"
        echo ""
        echo "Commands:"
        echo "  list          - List all available platforms"
        echo "  setup <name>  - Setup specific platform"
        echo "  test <name>   - Test specific platform"
        echo ""
        list_platforms
        exit 1
        ;;
esac
