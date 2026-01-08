#!/bin/bash
# start-all-services.sh
# Start all Wallestars services with PM2

set -e
echo "🚀 Starting Wallestars Complete Stack"

INSTALL_DIR="/opt/wallestars"
cd $INSTALL_DIR

# 1. Activate Python environment
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# 2. Start Redis
sudo systemctl start redis-server

# 3. Start PostgreSQL
sudo systemctl start postgresql

# 4. Start Wallestars main API server
echo "🌐 Starting Wallestars API server..."
pm2 start npm --name "wallestars-api" --cwd $INSTALL_DIR -- start

# 5. Start n8n workflow automation
echo "🔄 Starting n8n workflow engine..."
pm2 start "n8n start --tunnel" --name "n8n" --cwd $INSTALL_DIR

# 6. Start integration services (if they exist)
if [ -f "platforms/hostinger-vps/hostinger-vps-manager.py" ]; then
    echo "📡 Starting VPS Manager..."
    pm2 start "python3 platforms/hostinger-vps/hostinger-vps-manager.py" --name "vps-manager" --cwd $INSTALL_DIR
fi

if [ -f "platforms/33mail-integration/33mail-manager.py" ]; then
    echo "📧 Starting Email Manager..."
    pm2 start "python3 platforms/33mail-integration/33mail-manager.py" --name "email-manager" --cwd $INSTALL_DIR
fi

# 7. Start Eva Core (if exists)
if [ -f "eva-core/eva-core.js" ]; then
    echo "🤖 Starting Eva Core..."
    pm2 start eva-core/eva-core.js --name "eva-core" --cwd $INSTALL_DIR
fi

# 8. Save PM2 configuration
pm2 save
pm2 startup | tail -n 1 | sh || true

# 9. Show status
echo ""
echo "✅ All services started!"
echo ""
pm2 status
echo ""
echo "📋 Useful commands:"
echo "   pm2 status         - View all services"
echo "   pm2 logs           - View all logs"
echo "   pm2 monit          - Real-time monitoring"
echo "   pm2 restart all    - Restart all services"
