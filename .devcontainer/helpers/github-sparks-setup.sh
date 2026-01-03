#!/bin/bash
# github-sparks-setup.sh - GitHub Sparks Enterprise Integration

set -e

echo "⚡ GitHub Sparks Enterprise Setup"
echo "=================================="

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Check GitHub Enterprise access
echo -e "${YELLOW}🔍 Checking GitHub Enterprise access...${NC}"

if ! gh auth status &>/dev/null; then
    echo -e "${RED}❌ Not authenticated with GitHub CLI${NC}"
    echo -e "${BLUE}Please run: gh auth login${NC}"
    exit 1
fi

# Check Enterprise features
ENTERPRISE_CHECK=$(gh api user | jq -r '.plan.name' 2>/dev/null || echo "unknown")

if [[ "$ENTERPRISE_CHECK" == "enterprise" ]] || [[ "$ENTERPRISE_CHECK" == "business" ]]; then
    echo -e "${GREEN}✅ GitHub Enterprise plan detected${NC}"
else
    echo -e "${YELLOW}⚠️  Current plan: $ENTERPRISE_CHECK${NC}"
    echo -e "${BLUE}ℹ️  Sparks features might be limited${NC}"
fi

# Setup Sparks CLI (if available)
echo -e "${YELLOW}📦 Setting up Sparks CLI...${NC}"

# Create Sparks directory
mkdir -p /workspace/.sparks
chmod 700 /workspace/.sparks

# Sparks configuration
cat > /workspace/.sparks/config.yml << 'EOF'
# GitHub Sparks Configuration
version: "1.0"

features:
  # AI Code Generation
  ai_assistant: true
  copilot_enterprise: true
  
  # Advanced Analytics
  insights: true
  security_scanning: true
  
  # Collaboration
  code_review_assistant: true
  pull_request_automation: true
  
  # CI/CD
  actions_enterprise: true
  packages_enterprise: true

integrations:
  # Wallestars specific
  - name: eva-core
    type: ai-workflow
    enabled: true
    
  - name: n8n-automation
    type: workflow
    enabled: true
    
  - name: supabase
    type: database
    enabled: true

notifications:
  slack: ${SLACK_WEBHOOK_URL}
  email: ${NOTIFICATION_EMAIL}
EOF

# Setup Sparks helpers
cat > /workspace/.sparks/sparks-cli.sh << 'EOF'
#!/bin/bash
# Sparks CLI helper functions

sparks_status() {
    echo "⚡ GitHub Sparks Status"
    gh api /user/installations 2>/dev/null || echo "No installations found"
}

sparks_analytics() {
    echo "📊 Repository Analytics"
    gh api "/repos/${GITHUB_REPOSITORY}/stats/contributors" 2>/dev/null | jq '.'
}

sparks_ai_review() {
    local pr_number=$1
    if [ -z "$pr_number" ]; then
        echo "Usage: sparks_ai_review <pr-number>"
        return 1
    fi
    
    echo "🤖 AI Code Review for PR #${pr_number}"
    gh pr review $pr_number --comment --body "AI Review requested via Sparks"
}

sparks_security_scan() {
    echo "🔒 Security Scan"
    gh api "/repos/${GITHUB_REPOSITORY}/code-scanning/alerts" 2>/dev/null | jq '.'
}

case "$1" in
    status)
        sparks_status
        ;;
    analytics)
        sparks_analytics
        ;;
    ai-review)
        sparks_ai_review "$2"
        ;;
    security)
        sparks_security_scan
        ;;
    *)
        echo "Usage: sparks {status|analytics|ai-review|security}"
        ;;
esac
EOF

chmod +x /workspace/.sparks/sparks-cli.sh

# Add to aliases
if ! grep -q "alias sparks=" ~/.zshrc; then
    echo "alias sparks='/workspace/.sparks/sparks-cli.sh'" >> ~/.zshrc
fi

# GitHub Actions Enterprise setup
echo -e "${YELLOW}🔧 Configuring GitHub Actions Enterprise...${NC}"

mkdir -p /workspaces/Wallestars/.github/workflows/enterprise

cat > /workspaces/Wallestars/.github/workflows/enterprise/sparks-ci.yml << 'EOF'
name: Sparks Enterprise CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  sparks-analysis:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      security-events: write
      
    steps:
      - uses: actions/checkout@v4
      
      - name: GitHub Sparks Analysis
        uses: github/super-linter@v5
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          
      - name: AI Code Review
        uses: github/ai-code-review@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          
      - name: Security Scan
        uses: github/codeql-action/analyze@v2
        
  eva-core-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          
      - name: Install dependencies
        run: |
          cd eva-core
          npm install
          
      - name: Run Eva tests
        run: |
          cd eva-core
          npm test
EOF

echo ""
echo -e "${GREEN}✅ GitHub Sparks setup complete!${NC}"
echo ""
echo -e "${BLUE}Available commands:${NC}"
echo "  sparks status      - Check Sparks status"
echo "  sparks analytics   - View repository analytics"
echo "  sparks ai-review   - AI code review for PR"
echo "  sparks security    - Security scan results"
echo ""
echo -e "${YELLOW}📖 Configuration: /workspace/.sparks/config.yml${NC}"
echo -e "${YELLOW}🔧 CLI Helper: /workspace/.sparks/sparks-cli.sh${NC}"
