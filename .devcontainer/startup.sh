#!/bin/bash

# Wallestars Dev Container Startup Script
# Executed each time the container starts

set -e

echo "🔄 Starting Wallestars services..."

# Load environment variables if .env exists
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✓ Environment variables loaded"
fi

# Start n8n in background if configured
if [ "$N8N_AUTO_START" = "true" ]; then
    echo "🔄 Starting n8n workflow engine..."
    pm2 start n8n --name "n8n-workflow" -- start --tunnel
    echo "✓ n8n started on port 5678"
fi

# Start Supabase local if configured
if [ "$SUPABASE_LOCAL" = "true" ]; then
    echo "🗄️  Starting Supabase local..."
    cd /workspaces/Wallestars && supabase start || echo "⚠️  Supabase local start skipped"
fi

# Start local blockchain for development
if [ "$LOCAL_BLOCKCHAIN" = "true" ]; then
    echo "⛓️  Starting local blockchain..."
    pm2 start "npx hardhat node" --name "hardhat-node"
    echo "✓ Local blockchain started on port 8545"
fi

echo "✅ Services started successfully!"
echo ""
