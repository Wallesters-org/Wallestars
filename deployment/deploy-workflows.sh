#!/bin/bash
# deploy-workflows.sh
# Deploy n8n workflows and integration services

set -e
echo "🔧 Deploying Wallestars Workflows and Services"

INSTALL_DIR="/opt/wallestars"
cd $INSTALL_DIR

# Activate Python virtual environment
source venv/bin/activate

# 1. Start n8n with PM2
echo "🔄 Starting n8n workflow engine..."
pm2 start "n8n start --tunnel" --name n8n --cwd $INSTALL_DIR
pm2 save

# Wait for n8n to start
echo "⏳ Waiting for n8n to initialize..."
sleep 10

# 2. Import workflows (if they exist)
if [ -d "workflows" ] && [ -n "$N8N_API_KEY" ]; then
    echo "📥 Importing n8n workflows..."
    
    for workflow_file in workflows/*.json; do
        if [ -f "$workflow_file" ]; then
            echo "Importing $(basename $workflow_file)..."
            curl -X POST http://localhost:5678/api/v1/workflows \
              -H "X-N8N-API-KEY: $N8N_API_KEY" \
              -H "Content-Type: application/json" \
              -d @"$workflow_file" || echo "⚠️  Failed to import $(basename $workflow_file)"
        fi
    done
else
    echo "⚠️  No workflows directory found or N8N_API_KEY not set"
fi

# 3. Start Wallestars core services
echo "🚀 Starting Wallestars services..."

# Main API server
pm2 start npm --name "wallestars-api" --cwd $INSTALL_DIR -- start

# Python integration services (if they exist)
if [ -f "platforms/hostinger-vps/hostinger-vps-manager.py" ]; then
    pm2 start "python3 platforms/hostinger-vps/hostinger-vps-manager.py" --name "vps-manager" --cwd $INSTALL_DIR
fi

if [ -f "platforms/33mail-integration/33mail-manager.py" ]; then
    pm2 start "python3 platforms/33mail-integration/33mail-manager.py" --name "email-manager" --cwd $INSTALL_DIR
fi

# Eva Core (if exists)
if [ -f "eva-core/eva-core.js" ]; then
    pm2 start eva-core/eva-core.js --name "eva-core" --cwd $INSTALL_DIR
fi

# 4. Save PM2 configuration
pm2 save
pm2 startup

# 5. Display status
echo ""
echo "✅ Workflows and services deployed!"
echo ""
pm2 status
echo ""
echo "📊 View logs with:"
echo "   pm2 logs wallestars-api"
echo "   pm2 logs n8n"
echo "   pm2 monit"
