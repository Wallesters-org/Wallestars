#!/bin/bash

# Wallestars Dev Container Attach Script
# Executed when attaching to a running container

echo "👋 Attached to Wallestars development container"
echo ""

# Show service status
if command -v pm2 &> /dev/null; then
    echo "📊 Service Status:"
    pm2 status 2>/dev/null || echo "  No services running"
    echo ""
fi

# Show quick tips
echo "💡 Quick Tips:"
echo "  - Run 'ws-start' to open the project"
echo "  - Run 'ws-n8n' to start n8n manually"
echo "  - Run 'ws-status' to check services"
echo "  - Run '~/.welcome.sh' for full guide"
echo ""
