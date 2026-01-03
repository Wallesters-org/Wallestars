#!/bin/bash
# Post-start script runs every time the container starts

echo "🔄 Running post-start tasks..."

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found - copy .env.example to .env and configure"
fi

# Check for updates
npm outdated || true

# Display welcome message
source ~/.welcome.sh 2>/dev/null || true

echo "✅ Container ready!"
