#!/bin/bash
set -e

echo "🚀 Running on-create.sh script..."

# Set up proper permissions
echo "📝 Setting up file permissions..."
sudo chown -R node:node /workspaces/Wallestars

# Install global npm packages
echo "📦 Installing global npm packages..."
npm install -g npm@latest
npm install -g pnpm yarn

# Set up git configuration
echo "🔧 Configuring git..."
git config --global --add safe.directory /workspaces/Wallestars
git config --global init.defaultBranch main

# Create necessary directories
echo "📁 Creating project directories..."
mkdir -p /home/node/.cache
mkdir -p /home/node/.npm
mkdir -p /home/node/.config

echo "✅ on-create.sh completed successfully!"
