# 🚀 Quick Start: Hostinger VPS + n8n

This is a quick reference for deploying Wallestars to Hostinger VPS with n8n integration.

## ⚡ One-Line Deployment

```bash
wget -O - https://raw.githubusercontent.com/Wallesters-org/Wallestars/main/deploy-vps.sh | bash
```

Or clone first:

```bash
git clone https://github.com/Wallesters-org/Wallestars.git
cd Wallestars
chmod +x deploy-vps.sh
./deploy-vps.sh
```

## 📋 Prerequisites Checklist

- [ ] Hostinger VPS with Ubuntu 22.04+
- [ ] SSH access to your VPS
- [ ] Anthropic API key from [console.anthropic.com](https://console.anthropic.com)
- [ ] Domain name (optional, for HTTPS)

## 🔑 Get Your API Key

1. Visit [https://console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
2. Click "Create Key"
3. Copy the key (starts with `sk-ant-`)
4. Save it securely

## 🖥️ Connect to Your VPS

### Via Hostinger hPanel

1. Login to [https://hpanel.hostinger.com](https://hpanel.hostinger.com)
2. Go to VPS section
3. Click "Access" → "Browser SSH"

### Via Terminal

```bash
ssh root@your-vps-ip
# Or with custom username:
ssh username@your-vps-ip
```

## 🎯 Installation Steps

### 1. Run Deployment Script

```bash
# Download and run
curl -o deploy-vps.sh https://raw.githubusercontent.com/Wallesters-org/Wallestars/main/deploy-vps.sh
chmod +x deploy-vps.sh
./deploy-vps.sh
```

The script will:
- ✅ Check system requirements
- ✅ Install Node.js 20.x (if needed)
- ✅ Clone Wallestars repository
- ✅ Install dependencies
- ✅ Build the application
- ✅ Configure environment
- ✅ Setup PM2 process manager
- ✅ Optionally install n8n
- ✅ Configure firewall
- ✅ Optionally setup Nginx

### 2. Configure Environment

During installation, you'll be asked:

```
Enter your Anthropic API key: sk-ant-your-key-here
Enable Computer Use? (y/N): y
Install n8n? (y/N): y
Enter n8n username (default: admin): admin
Enter n8n password: ********
Open port 5678 for n8n? (y/N): y
Setup Nginx reverse proxy? (y/N): y
Enter your domain name: your-domain.com
Setup SSL with Let's Encrypt? (y/N): y
```

## 🔗 Access Your Services

After installation:

### Wallestars Control Center
- **HTTP**: `http://your-vps-ip:3000`
- **With domain**: `https://your-domain.com`

### n8n Automation
- **HTTP**: `http://your-vps-ip:5678`
- **With Nginx**: `https://your-domain.com/n8n`

### Claude Console
- **Web**: [https://console.anthropic.com/claude-code](https://console.anthropic.com/claude-code)

## 🎮 Quick Commands

### Check Status
```bash
pm2 list
pm2 status wallestars
pm2 status n8n
```

### View Logs
```bash
pm2 logs wallestars
pm2 logs n8n
pm2 logs --lines 100
```

### Restart Services
```bash
pm2 restart wallestars
pm2 restart n8n
pm2 restart all
```

### Stop Services
```bash
pm2 stop wallestars
pm2 stop n8n
```

### Update Application
```bash
cd /opt/Wallestars
git pull
npm install
npm run build
pm2 restart wallestars
```

## 🔧 Manual Configuration

If you skipped automatic configuration:

### Edit Environment File
```bash
nano /opt/Wallestars/.env
```

Required variables:
```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
NODE_ENV=production
ENABLE_COMPUTER_USE=true
```

### Restart After Changes
```bash
pm2 restart wallestars
```

## 🌐 Setup Domain (Optional)

### Point Domain to VPS

In your domain registrar (e.g., Hostinger Domains):

1. Go to DNS settings
2. Add A record:
   - **Type**: A
   - **Name**: @ (or subdomain)
   - **Value**: your-vps-ip
   - **TTL**: 3600

3. Add CNAME for www:
   - **Type**: CNAME
   - **Name**: www
   - **Value**: your-domain.com
   - **TTL**: 3600

Wait 5-30 minutes for DNS propagation.

### Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/wallestars
```

Change `server_name` to your domain, then:

```bash
sudo nginx -t
sudo systemctl restart nginx
```

### Add SSL Certificate

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 🔗 n8n Integration Setup

### 1. Access n8n

Open `http://your-vps-ip:5678` in browser.

### 2. Create Workflow

Click "Add workflow" → Start from scratch

### 3. Add Wallestars HTTP Request

**Example: Get Screenshot**

1. Add "HTTP Request" node
2. Configure:
   - Method: GET
   - URL: `http://localhost:3000/api/computer/screenshot`
3. Execute to test

**Example: Chat with Claude**

1. Add "Webhook" node (trigger)
2. Add "HTTP Request" node:
   - Method: POST
   - URL: `http://localhost:3000/api/claude/chat`
   - Body JSON:
     ```json
     {
       "message": "{{$json.body.message}}",
       "conversationHistory": []
     }
     ```
3. Add "Respond to Webhook" node
4. Activate workflow

### 4. Test Webhook

Copy webhook URL from n8n, then test:

```bash
curl -X POST https://your-n8n-url/webhook/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello Claude!"}'
```

## 🔐 Security Checklist

- [ ] Changed default SSH port (optional)
- [ ] Setup SSH key authentication
- [ ] Configured firewall (UFW)
- [ ] Set strong n8n password
- [ ] Enabled HTTPS with SSL certificate
- [ ] Restricted API access (if needed)
- [ ] Regular backups configured
- [ ] Kept .env file permissions at 600

## 🐛 Common Issues

### Port 3000 already in use
```bash
sudo lsof -i :3000
# Kill the process or change PORT in .env
```

### Cannot access from browser
```bash
# Check firewall
sudo ufw status
sudo ufw allow 3000

# Check service
pm2 list
pm2 logs wallestars
```

### API Key not working
```bash
# Check .env file
cat /opt/Wallestars/.env | grep ANTHROPIC_API_KEY

# Verify at console.anthropic.com
# Restart service
pm2 restart wallestars
```

### n8n not accessible
```bash
# Check if running
pm2 list | grep n8n

# Check logs
pm2 logs n8n

# Restart
pm2 restart n8n
```

## 📚 Full Documentation

- **Deployment Guide**: [DEPLOYMENT_HOSTINGER.md](DEPLOYMENT_HOSTINGER.md)
- **n8n Integration**: [N8N_INTEGRATION.md](N8N_INTEGRATION.md)
- **MCP Setup**: [MCP_SETUP.md](MCP_SETUP.md)
- **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)

## 🆘 Get Help

- **GitHub Issues**: [github.com/Wallesters-org/Wallestars/issues](https://github.com/Wallesters-org/Wallestars/issues)
- **n8n Community**: [community.n8n.io](https://community.n8n.io)
- **Hostinger Support**: [hostinger.com/contact](https://www.hostinger.com/contact)
- **Claude API Docs**: [docs.anthropic.com](https://docs.anthropic.com)

## ⚡ Quick Reference

### Essential URLs
- Claude Console: https://console.anthropic.com
- Hostinger Panel: https://hpanel.hostinger.com
- n8n Workflows: https://n8n.io/workflows

### Essential Files
- Environment: `/opt/Wallestars/.env`
- Nginx Config: `/etc/nginx/sites-available/wallestars`
- PM2 Logs: `~/.pm2/logs/`

### Essential Commands
```bash
pm2 list                    # List all services
pm2 logs                    # View all logs
pm2 restart all             # Restart everything
pm2 save                    # Save configuration
sudo systemctl status nginx # Check nginx status
sudo ufw status            # Check firewall
```

---

**Built with ❤️ by Wallestars Team**

🚀 Your VPS is ready! Start automating with Wallestars + n8n!
