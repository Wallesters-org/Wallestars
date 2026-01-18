# Visual Categorization Deployment Guide

## Quick Deployment Checklist

This guide covers deploying the Visual Categorization feature as part of Wallestars Control Center.

## 🚀 Prerequisites

### Required
- ✅ Wallestars Control Center v1.0.0+
- ✅ Anthropic API Key with Claude Sonnet 4.5 access
- ✅ Node.js 20.x or higher
- ✅ npm or yarn package manager

### Optional (for production)
- VPS server (Ubuntu/Debian recommended)
- Domain name configured
- SSL certificate (Let's Encrypt)
- Nginx web server
- PM2 process manager

---

## 📦 Installation

### 1. Clone or Update Repository

```bash
# If new installation
git clone https://github.com/Wallesters-org/Wallestars.git
cd Wallestars

# If updating existing installation
cd Wallestars
git pull origin main
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- `@anthropic-ai/sdk` - Claude AI integration
- `express` - Backend server
- `react` - Frontend framework
- `framer-motion` - UI animations
- `lucide-react` - Icon library

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit environment file
nano .env  # or use your preferred editor
```

**Required Environment Variables:**

```env
# Anthropic API Key (Required for AI categorization)
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Optional Configuration
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-domain.com

# Feature Flags
ENABLE_COMPUTER_USE=true
ENABLE_ANDROID=true
```

**Important**: The Visual Categorization feature requires a valid `ANTHROPIC_API_KEY`. Without it, the feature will use fallback rule-based categorization only.

---

## 🔨 Build Process

### Development Build

```bash
# Start development server (hot reload enabled)
npm run dev
```

This starts:
- Frontend on `http://localhost:5173`
- Backend on `http://localhost:3000`

### Production Build

```bash
# Build frontend for production
npm run build

# This creates optimized files in dist/ directory
```

Verify build output:
```bash
ls -la dist/
# Should show:
# - index.html
# - assets/index-[hash].js
# - assets/index-[hash].css
```

---

## 🌐 Deployment Options

### Option 1: Local Development

**Best for**: Testing and development

```bash
# Start both frontend and backend
npm run dev

# Access at: http://localhost:5173
```

### Option 2: VPS Deployment (Recommended)

**Best for**: Production use with full features

Follow these steps:

#### A. Prepare VPS

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

#### B. Deploy Application

```bash
# Create application directory
sudo mkdir -p /var/www/wallestars
sudo chown $USER:$USER /var/www/wallestars

# Clone repository
cd /var/www/wallestars
git clone https://github.com/Wallesters-org/Wallestars.git .

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env  # Add your API key

# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### C. Configure Nginx

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/wallestars
```

Add configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration (Certbot will add these)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Frontend static files
    location / {
        root /var/www/wallestars/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable site and obtain SSL:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/wallestars /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Restart Nginx
sudo systemctl restart nginx
```

#### D. Configure Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow necessary ports
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

### Option 3: Netlify Deployment

**Best for**: Static frontend hosting (limited functionality)

**Note**: Visual Categorization requires backend API access. Netlify deployment will have limited functionality without a separate backend server.

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

**Important**: Set environment variables in Netlify dashboard:
- `ANTHROPIC_API_KEY`
- `NODE_ENV=production`

---

## ✅ Verification

### Test API Endpoints

```bash
# Health check
curl http://localhost:3000/api/health

# Should return:
# {
#   "status": "healthy",
#   "timestamp": "...",
#   "services": {
#     "categorization": true,
#     ...
#   }
# }
```

### Test Visual Categorization

1. Access application at `http://localhost:5173` (dev) or `https://your-domain.com` (prod)
2. Navigate to "Visual Categorization" in sidebar
3. Upload a test file
4. Click "Auto-Categorize"
5. Verify AI categorization works

### Check Logs

```bash
# PM2 logs (production)
pm2 logs wallestars

# Or check application logs
tail -f /var/www/wallestars/logs/combined.log
```

---

## 🔧 Configuration

### API Rate Limits

Claude API has rate limits. Configure appropriately:

```javascript
// server/routes/categorization.js
// Add rate limiting if needed
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

router.use(limiter);
```

### File Size Limits

Default is 10MB. Increase if needed:

```javascript
// server/index.js
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
```

### Category Customization

Edit categories in frontend:

```javascript
// src/pages/VisualCategorization.jsx
const [categories, setCategories] = useState([
  { id: 'custom', name: 'Custom Category', color: '#ff6b6b', count: 0 },
  // Add more custom categories
]);
```

---

## 🐛 Troubleshooting

### Issue: AI Categorization Not Working

**Symptoms**: Files remain in "pending" status

**Solutions**:
1. Check API key is correctly set in `.env`
2. Verify API key has credits: https://console.anthropic.com/
3. Check server logs for errors
4. Test API manually: `curl https://api.anthropic.com/v1/messages -H "x-api-key: YOUR_KEY"`

### Issue: Build Fails

**Symptoms**: `npm run build` errors

**Solutions**:
1. Clear cache: `rm -rf node_modules package-lock.json`
2. Reinstall: `npm install`
3. Check Node.js version: `node --version` (should be 20.x+)
4. Check for syntax errors in recent changes

### Issue: Server Won't Start

**Symptoms**: `npm start` fails

**Solutions**:
1. Check port 3000 is available: `lsof -i :3000`
2. Kill existing process: `kill -9 <PID>`
3. Check environment variables are set
4. Review server logs for specific error

### Issue: WebSocket Connection Failed

**Symptoms**: "WebSocket connection failed" in console

**Solutions**:
1. Ensure Socket.IO routes are properly configured
2. Check Nginx WebSocket proxy settings
3. Verify firewall allows WebSocket connections
4. Test with direct backend connection first

---

## 📊 Monitoring

### PM2 Monitoring

```bash
# Status
pm2 status

# Monitor in real-time
pm2 monit

# Logs
pm2 logs

# Restart if needed
pm2 restart wallestars
```

### Application Health

```bash
# Check health endpoint
curl http://localhost:3000/api/health

# Monitor specific service
curl http://localhost:3000/api/health | jq '.services.categorization'
```

---

## 🔄 Updates

### Updating the Feature

```bash
# Pull latest changes
cd /var/www/wallestars
git pull origin main

# Install new dependencies
npm install

# Rebuild
npm run build

# Restart with PM2
pm2 restart wallestars
```

### Database Migrations

Visual Categorization doesn't use a database currently. All data is client-side. If future versions add database support, migration scripts will be provided.

---

## 🔒 Security Checklist

- [ ] API key stored in `.env` (not committed to git)
- [ ] Firewall configured (UFW or iptables)
- [ ] SSL certificate installed and auto-renewing
- [ ] File upload size limits configured
- [ ] Rate limiting enabled for API endpoints
- [ ] CORS configured for production domain
- [ ] Regular security updates: `npm audit fix`
- [ ] Access logs monitored regularly
- [ ] Backup strategy in place

---

## 📈 Performance Optimization

### Frontend Optimization

```bash
# Analyze bundle size
npm run build -- --mode analyze

# Optimize images before upload
# Use compressed formats (WebP, optimized PNG/JPEG)
```

### Backend Optimization

```javascript
// Enable compression
import compression from 'compression';
app.use(compression());

// Cache static assets
app.use(express.static('dist', {
  maxAge: '1y',
  etag: true
}));
```

### API Optimization

- Implement caching for repeated categorization requests
- Use batch processing for multiple files
- Consider adding a queue system for large batches

---

## 📞 Support

For issues or questions:

1. Check documentation: [VISUAL_CATEGORIZATION_DOCS.md](VISUAL_CATEGORIZATION_DOCS.md)
2. Review [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
3. Open an issue on GitHub: https://github.com/Wallesters-org/Wallestars/issues
4. Contact support: support@wallestars.com

---

**Deployment Guide Version**: 1.0.0  
**Last Updated**: January 2026  
**Compatible with**: Wallestars Control Center v1.0.0+
