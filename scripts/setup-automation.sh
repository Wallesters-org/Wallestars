#!/bin/bash
# Setup automation environment

set -e

echo "🔧 Setting up Wallestars Automation System..."

# Check requirements
echo "Checking requirements..."
command -v node >/dev/null 2>&1 || { echo "❌ Node.js required"; exit 1; }
command -v gh >/dev/null 2>&1 || echo "⚠️  GitHub CLI recommended (optional)"

# Install dependencies
echo "Installing dependencies..."
npm ci --legacy-peer-deps

# Validate workflows
echo "Validating workflows..."
for workflow in .github/workflows/*.yml; do
    if python3 -c "import yaml; yaml.safe_load(open('$workflow'))" 2>/dev/null; then
        echo "✓ $(basename $workflow)"
    else
        echo "✗ $(basename $workflow) - Invalid YAML"
        exit 1
    fi
done

# Check secrets
echo "Checking configuration..."
if [ -f ".env" ]; then
    echo "✓ .env file exists"
else
    echo "⚠️  .env file not found - copy from .env.example"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure GitHub secrets (N8N_WEBHOOK_URL, ANTHROPIC_API_KEY)"
echo "2. Review workflows in .github/workflows/"
echo "3. Read COMPLETE_AUTOMATION_GUIDE.md"
echo ""
