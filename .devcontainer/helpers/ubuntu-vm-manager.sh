#!/bin/bash
# ubuntu-vm-manager.sh - Ubuntu Pro VMs Management

set -e

echo "☁️  Ubuntu Pro VMs Manager"
echo "========================"

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

VM_CONFIG_DIR="/workspace/.vms"
mkdir -p "$VM_CONFIG_DIR"

# VM Templates
create_vm_config() {
    local vm_name=$1
    local vm_purpose=$2
    
    cat > "$VM_CONFIG_DIR/${vm_name}.yml" << EOF
name: ${vm_name}
purpose: ${vm_purpose}
specs:
  vcpus: 2
  memory: 4096  # MB
  disk: 40      # GB
  os: ubuntu-22.04-lts
  
network:
  type: bridged
  ip: auto
  
ubuntu_pro:
  enabled: true
  services:
    - esm-infra
    - esm-apps
    - livepatch
    
packages:
  - docker.io
  - docker-compose
  - nodejs
  - npm
  
scripts:
  post_install: |
    # Update system
    sudo apt update && sudo apt upgrade -y
    
    # Install Node.js 22
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    # Setup Docker
    sudo usermod -aG docker \$USER
    
    # Install n8n (if needed)
    # sudo npm install -g n8n
    
created_at: $(date -Iseconds)
EOF
    
    echo -e "${GREEN}✅ VM configuration created: ${vm_name}${NC}"
}

# Predefined VM templates for Wallestars
init_vm_templates() {
    echo -e "${YELLOW}📦 Creating Wallestars VM templates...${NC}"
    
    # VM 1: n8n Workflow Server
    create_vm_config "wallestars-n8n" "n8n Workflow Automation Server"
    
    # VM 2: Eva Core Processing
    create_vm_config "wallestars-eva" "Eva Core AI Processing"
    
    # VM 3: Database Server
    create_vm_config "wallestars-db" "PostgreSQL + Redis Database"
    
    # VM 4: Supabase Instance
    create_vm_config "wallestars-supabase" "Supabase Self-hosted"
    
    # VM 5: Platform Services
    create_vm_config "wallestars-platforms" "Social Media Platform Services"
    
    # VM 6-10: Reserved for scaling
    for i in {6..10}; do
        create_vm_config "wallestars-worker-${i}" "Worker Node ${i}"
    done
    
    # Bonus VMs 11-15: Development & Testing
    for i in {11..15}; do
        create_vm_config "wallestars-dev-${i}" "Development Environment ${i}"
    done
}

# Multipass integration (for local VM management)
setup_multipass() {
    echo -e "${YELLOW}🔧 Setting up Multipass for VM management...${NC}"
    
    if ! command -v multipass &> /dev/null; then
        echo -e "${RED}❌ Multipass not found${NC}"
        echo -e "${BLUE}Install: https://multipass.run/${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Multipass installed${NC}"
}

# Launch VM from config
launch_vm() {
    local vm_name=$1
    
    if [ ! -f "$VM_CONFIG_DIR/${vm_name}.yml" ]; then
        echo -e "${RED}❌ VM configuration not found: ${vm_name}${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}🚀 Launching VM: ${vm_name}${NC}"
    
    # Read config
    local vcpus=$(yq e '.specs.vcpus' "$VM_CONFIG_DIR/${vm_name}.yml")
    local memory=$(yq e '.specs.memory' "$VM_CONFIG_DIR/${vm_name}.yml")
    local disk=$(yq e '.specs.disk' "$VM_CONFIG_DIR/${vm_name}.yml")
    
    # Launch with multipass
    multipass launch \
        --name "$vm_name" \
        --cpus "$vcpus" \
        --memory "${memory}M" \
        --disk "${disk}G" \
        22.04
    
    echo -e "${GREEN}✅ VM launched: ${vm_name}${NC}"
    
    # Run post-install script
    local post_install=$(yq e '.scripts.post_install' "$VM_CONFIG_DIR/${vm_name}.yml")
    if [ -n "$post_install" ]; then
        echo -e "${YELLOW}📦 Running post-install script...${NC}"
        multipass exec "$vm_name" -- bash -c "$post_install"
    fi
}

# List VMs
list_vms() {
    echo -e "${BLUE}📋 Wallestars VM Configurations:${NC}"
    echo "================================"
    
    if [ -d "$VM_CONFIG_DIR" ] && [ "$(ls -A $VM_CONFIG_DIR)" ]; then
        for config in "$VM_CONFIG_DIR"/*.yml; do
            local name=$(basename "$config" .yml)
            local purpose=$(yq e '.purpose' "$config")
            echo -e "${GREEN}○${NC} $name - $purpose"
        done
    else
        echo "No VM configurations found"
    fi
    
    echo ""
    echo -e "${BLUE}Running VMs (Multipass):${NC}"
    multipass list 2>/dev/null || echo "Multipass not available"
}

# Stop VM
stop_vm() {
    local vm_name=$1
    echo -e "${YELLOW}🛑 Stopping VM: ${vm_name}${NC}"
    multipass stop "$vm_name"
}

# Delete VM
delete_vm() {
    local vm_name=$1
    echo -e "${RED}🗑️  Deleting VM: ${vm_name}${NC}"
    multipass delete "$vm_name"
    multipass purge
}

# VM status
vm_status() {
    local vm_name=$1
    
    if [ -z "$vm_name" ]; then
        multipass list
    else
        multipass info "$vm_name"
    fi
}

# Shell into VM
vm_shell() {
    local vm_name=$1
    
    if [ -z "$vm_name" ]; then
        echo -e "${RED}❌ VM name required${NC}"
        echo "Usage: vm-manager shell <vm-name>"
        return 1
    fi
    
    multipass shell "$vm_name"
}

# Ubuntu Pro setup
setup_ubuntu_pro() {
    echo -e "${YELLOW}🔐 Ubuntu Pro Setup${NC}"
    echo "==================="
    echo ""
    echo "You have:"
    echo "  • 5 free VMs with Ubuntu Pro"
    echo "  • 10 bonus VMs"
    echo "  • Total: 15 VMs available"
    echo ""
    echo "Ubuntu Pro includes:"
    echo "  • Extended Security Maintenance (ESM)"
    echo "  • Kernel Livepatch"
    echo "  • FIPS compliance (if needed)"
    echo "  • Security certifications"
    echo ""
    echo -e "${BLUE}To attach Ubuntu Pro token to VM:${NC}"
    echo "  1. multipass shell <vm-name>"
    echo "  2. sudo pro attach <your-token>"
    echo ""
}

# Main command handler
case "$1" in
    init)
        init_vm_templates
        setup_multipass
        ;;
    list)
        list_vms
        ;;
    launch)
        launch_vm "$2"
        ;;
    stop)
        stop_vm "$2"
        ;;
    delete)
        delete_vm "$2"
        ;;
    status)
        vm_status "$2"
        ;;
    shell)
        vm_shell "$2"
        ;;
    pro)
        setup_ubuntu_pro
        ;;
    *)
        echo "Usage: vm-manager {init|list|launch|stop|delete|status|shell|pro}"
        echo ""
        echo "Commands:"
        echo "  init                  - Initialize VM templates"
        echo "  list                  - List all VMs"
        echo "  launch <name>         - Launch VM from template"
        echo "  stop <name>           - Stop running VM"
        echo "  delete <name>         - Delete VM"
        echo "  status [name]         - Show VM status"
        echo "  shell <name>          - Shell into VM"
        echo "  pro                   - Ubuntu Pro information"
        echo ""
        exit 1
        ;;
esac
