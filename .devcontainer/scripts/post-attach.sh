#!/bin/bash
set -e

echo "🚀 Running post-attach.sh script..."

# Display welcome message
cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   Welcome to Wallestars Development Container! 🌟          ║
║                                                              ║
║   Full Stack AI Platform with Claude Code Integration       ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

Quick Start Commands:
  📦 Install dependencies:    npm install
  🏗️  Build project:          npm run build
  🚀 Start development:       npm run dev
  🧪 Run tests:              npm test

Port Mappings:
  3000  - Frontend / Main Application
  5000  - Backend API
  5678  - n8n Workflow Automation
  5432  - PostgreSQL Database
  6379  - Redis Cache

EOF

# Check for required environment variables
echo "🔍 Checking environment variables..."
if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "⚠️  Warning: ANTHROPIC_API_KEY is not set"
  echo "   Set it in your .env file or system environment"
fi

echo "✅ post-attach.sh completed successfully!"
echo ""
