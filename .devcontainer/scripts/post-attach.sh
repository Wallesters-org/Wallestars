#!/bin/bash
# post-attach.sh - Runs each time you attach to the container

echo "👋 Welcome to Wallestars Dev Container!"
echo ""

# Show current branch
if [ -d "/workspaces/Wallestars/.git" ]; then
    cd /workspaces/Wallestars
    BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
    echo "📍 Current branch: $BRANCH"
    
    # Show uncommitted changes
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        echo "⚠️  You have uncommitted changes"
    fi
fi

echo ""
echo "Type 'eva-demo' to run Eva Core demonstration"
echo "Type 'code /workspaces/Wallestars/.env' to configure secrets"
echo ""
