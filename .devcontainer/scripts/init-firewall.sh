#!/bin/bash
# init-firewall.sh - Initialize firewall rules for devcontainer
# This script should be placed in /usr/local/bin/ and run with sudo

set -e

echo "🔥 Initializing firewall rules..."

# Check if iptables is available
if ! command -v iptables &> /dev/null; then
    echo "⚠️  iptables not found, skipping firewall initialization"
    exit 0
fi

# Allow loopback traffic
iptables -A INPUT -i lo -j ACCEPT || true
iptables -A OUTPUT -o lo -j ACCEPT || true

# Allow established connections
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT || true

# Allow development ports
iptables -A INPUT -p tcp --dport 3000 -j ACCEPT || true  # Frontend
iptables -A INPUT -p tcp --dport 5000 -j ACCEPT || true  # Backend API
iptables -A INPUT -p tcp --dport 5678 -j ACCEPT || true  # n8n
iptables -A INPUT -p tcp --dport 5432 -j ACCEPT || true  # PostgreSQL
iptables -A INPUT -p tcp --dport 6379 -j ACCEPT || true  # Redis
iptables -A INPUT -p tcp --dport 8080 -j ACCEPT || true  # Alt HTTP
iptables -A INPUT -p tcp --dport 9229 -j ACCEPT || true  # Node debugger

echo "✅ Firewall rules initialized successfully!"
