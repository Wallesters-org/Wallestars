#!/bin/bash
# Workflow Management Helper Script

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
WORKFLOWS_DIR="$REPO_ROOT/.github/workflows"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; }

check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI (gh) not installed"
        exit 1
    fi
}

list_workflows() {
    echo "Available workflows:"
    for workflow in "$WORKFLOWS_DIR"/*.yml; do
        echo "  • $(basename "$workflow" .yml)"
    done
}

trigger_workflow() {
    check_gh_cli
    print_info "Triggering: $1"
    gh workflow run "$1.yml" "${@:2}" && print_success "Triggered!"
}

show_help() {
    cat << EOF
Wallestars Workflow Manager

Commands:
  list                List workflows
  trigger WORKFLOW    Trigger workflow
  validate           Validate YAML

Examples:
  $0 list
  $0 trigger pr-session-management
EOF
}

case "$1" in
    list) list_workflows ;;
    trigger) shift; trigger_workflow "$@" ;;
    validate) 
        for f in "$WORKFLOWS_DIR"/*.yml; do
            python3 -c "import yaml; yaml.safe_load(open('$f'))" && print_success "$(basename $f)" || print_error "$(basename $f)"
        done
        ;;
    *) show_help ;;
esac
