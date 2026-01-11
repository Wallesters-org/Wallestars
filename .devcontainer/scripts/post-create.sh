#!/bin/bash
set -e

echo "🚀 Running post-create.sh script..."

# Navigate to workspace
cd /workspaces/Wallestars

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
  echo "📝 Creating .env file from .env.example..."
  cp .env.example .env
fi

# Install project dependencies
echo "📦 Installing project dependencies..."
if [ -f package.json ]; then
  npm install
fi

# Set up pre-commit hooks if pre-commit is available
if command -v pre-commit &> /dev/null; then
  echo "🪝 Installing pre-commit hooks..."
  pre-commit install || echo "⚠️ Pre-commit install failed, skipping..."
fi

# Initialize PostgreSQL if needed
if command -v pg_ctl &> /dev/null; then
  echo "🗄️ Initializing PostgreSQL..."
  mkdir -p /tmp/pgdata
  # PostgreSQL initialization handled by feature
fi

# Initialize Redis if needed
if command -v redis-server &> /dev/null; then
  echo "🔴 Redis is available"
fi

echo "✅ post-create.sh completed successfully!"
