#!/bin/bash
set -e

echo "🚀 Running post-start.sh script..."

# Start services in background if needed
cd /workspaces/Wallestars

# Check if Docker is available
if command -v docker &> /dev/null; then
  echo "🐳 Docker is available"
fi

# Display environment info
echo "📊 Environment Information:"
echo "  - Node version: $(node --version)"
echo "  - npm version: $(npm --version)"
echo "  - Git version: $(git --version)"

if command -v python3 &> /dev/null; then
  echo "  - Python version: $(python3 --version)"
fi

if command -v gh &> /dev/null; then
  echo "  - GitHub CLI version: $(gh --version | head -1)"
fi

echo "✅ post-start.sh completed successfully!"
