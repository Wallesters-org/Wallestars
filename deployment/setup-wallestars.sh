#!/bin/bash
# setup-wallestars.sh
# Wallestars Application Setup Script

set -e
echo "🌟 Wallestars Application Setup"

# Configuration
INSTALL_DIR="/opt/wallestars"
REPO_URL="https://github.com/Wallesters-org/Wallestars.git"

# 1. Create installation directory
echo "📁 Creating installation directory..."
sudo mkdir -p $INSTALL_DIR
sudo chown $USER:$USER $INSTALL_DIR

# 2. Clone repository
cd $INSTALL_DIR
if [ -d ".git" ]; then
    echo "📦 Repository exists, pulling latest changes..."
    git pull origin main
else
    echo "📦 Cloning repository..."
    git clone $REPO_URL .
fi

# 3. Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# 4. Install n8n globally
echo "📦 Installing n8n workflow automation..."
sudo npm install -g n8n

# 5. Python environment setup
echo "🐍 Setting up Python environment..."
python3 -m venv venv
source venv/bin/activate
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
fi

# 6. Environment configuration
echo "⚙️  Setting up environment variables..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚠️  Please edit .env file with your credentials:"
    echo "   nano $INSTALL_DIR/.env"
else
    echo "✅ .env file already exists"
fi

# 7. Database initialization (if applicable)
echo "🗄️  Database setup..."
# Uncomment if you have database migration scripts
# npm run migrate

# 8. Build frontend
echo "🏗️  Building frontend..."
npm run build

# 9. Set up logs directory
mkdir -p logs

echo "✅ Wallestars application setup complete!"
echo ""
echo "Installation directory: $INSTALL_DIR"
echo ""
echo "Next steps:"
echo "1. Edit .env file: nano $INSTALL_DIR/.env"
echo "2. Configure Nginx: sudo nano /etc/nginx/sites-available/wallestars"
echo "3. Start services: ./deployment/start-all-services.sh"
