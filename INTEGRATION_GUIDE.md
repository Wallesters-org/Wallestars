# 🌟 Complete Integration Guide: Claude Console + Hostinger VPS + n8n

This guide provides a complete overview of integrating Wallestars Control Center with Claude Console, Hostinger VPS, and n8n automation.

## 📊 Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Claude Console                            │
│          https://console.anthropic.com/claude-code          │
│                  (API Key Management)                       │
└────────────────────┬────────────────────────────────────────┘
                     │ API Key
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Hostinger VPS (Ubuntu)                     │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │         Wallestars Control Center (Port 3000)         │ │
│  │  - Claude AI Integration                              │ │
│  │  - Computer Use (Linux)                               │ │
│  │  - REST API                                           │ │
│  └──────────────────────┬────────────────────────────────┘ │
│                         │                                   │
│  ┌──────────────────────▼────────────────────────────────┐ │
│  │         n8n Automation Platform (Port 5678)           │ │
│  │  - Workflow Automation                                │ │
│  │  - Webhooks                                           │ │
│  │  - Integrations                                       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │         Nginx Reverse Proxy (Ports 80/443)            │ │
│  │  - HTTPS/SSL                                          │ │
│  │  - Domain routing                                     │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                     │
                     ▼
          External Services & Users
     (Slack, Telegram, Email, Google Drive, etc.)
```

## 🎯 What This Integration Enables

### 1. Claude AI via Anthropic Console
- **Get API Key**: [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
- **Use Claude Code**: [console.anthropic.com/claude-code](https://console.anthropic.com/claude-code)
- **Features**:
  - Chat with Claude Sonnet 4.5
  - Computer Use capabilities
  - Vision and multi-modal AI
  - API usage monitoring

### 2. Hostinger VPS Hosting
- **Manage VPS**: [hpanel.hostinger.com](https://hpanel.hostinger.com)
- **Benefits**:
  - 24/7 availability
  - Public internet access
  - Custom domain support
  - Professional hosting
  - Scalable resources

### 3. n8n Workflow Automation
- **Access Platform**: Your VPS at port 5678
- **Alternative**: [n8n.cloud](https://n8n.cloud)
- **Capabilities**:
  - Scheduled tasks
  - Webhook endpoints
  - Connect 100+ services
  - No-code automation
  - Visual workflow builder

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get Your API Key (1 min)
```bash
# Visit: https://console.anthropic.com/settings/keys
# Click "Create Key"
# Copy the key (starts with sk-ant-)
```

### Step 2: Access Your Hostinger VPS (1 min)
```bash
# Login to: https://hpanel.hostinger.com
# Navigate to VPS → Access → SSH
# Or connect via terminal:
ssh root@your-vps-ip
```

### Step 3: Deploy Wallestars (2 min)
```bash
# Run the automated deployment script:
curl -o deploy-vps.sh https://raw.githubusercontent.com/Wallesters-org/Wallestars/main/deploy-vps.sh
chmod +x deploy-vps.sh
./deploy-vps.sh

# Script will ask for:
# - Anthropic API key
# - Enable Computer Use? (y/N)
# - Install n8n? (y/N)
# - Setup Nginx? (y/N)
```

### Step 4: Access Your Services (1 min)
```bash
# Wallestars: http://your-vps-ip:3000
# n8n: http://your-vps-ip:5678
# API Health: http://your-vps-ip:3000/api/health
```

## 📖 Detailed Documentation

### For VPS Deployment
📄 **[DEPLOYMENT_HOSTINGER.md](DEPLOYMENT_HOSTINGER.md)** (11KB)
- Complete VPS setup guide
- Nginx reverse proxy
- SSL/HTTPS configuration
- Firewall setup
- Security best practices
- Maintenance procedures
- Troubleshooting

### For Quick Reference
📄 **[QUICKSTART_VPS.md](QUICKSTART_VPS.md)** (7KB)
- One-line deployment
- Essential commands
- Common issues
- Quick configurations

### For n8n Integration
📄 **[N8N_INTEGRATION.md](N8N_INTEGRATION.md)** (14KB)
- Complete n8n setup
- Workflow examples
- Webhook configuration
- API reference
- Use cases
- Advanced patterns

### For Docker Deployment
📄 **[docker-compose.yml](docker-compose.yml)** (2KB)
```bash
# Deploy with Docker:
docker-compose up -d
```

## 🎮 Common Use Cases

### 1. Remote Desktop Control
**Scenario**: Control your computer from anywhere

**Setup**:
1. Deploy Wallestars on Hostinger VPS
2. Create n8n webhook: `/remote-control`
3. Send commands via HTTP/Telegram/Slack

**Example**:
```bash
# Take screenshot
curl https://your-domain.com/webhook/screenshot

# Click at coordinates
curl -X POST https://your-domain.com/webhook/click \
  -d '{"x": 500, "y": 300}'
```

### 2. AI-Powered Automation
**Scenario**: Let Claude AI control tasks automatically

**Setup**:
1. Create n8n workflow with schedule trigger
2. Connect to Wallestars Claude API
3. Execute actions based on AI decisions

**Example Workflow**:
```
Schedule (every hour)
  → Get system info
  → Send to Claude for analysis
  → If issues detected → Take screenshot
  → Send alert with context
```

### 3. Multi-Platform Bot
**Scenario**: Control everything from Telegram/Slack

**Setup**:
1. Create Telegram bot in n8n
2. Parse commands
3. Route to Wallestars API
4. Return results

**Commands**:
- `/screenshot` - Capture desktop
- `/ask [question]` - Ask Claude AI
- `/status` - System information

### 4. Scheduled Monitoring
**Scenario**: Monitor system health automatically

**Setup**:
1. Schedule n8n workflow
2. Collect metrics from Wallestars
3. Store in database/sheets
4. Alert on anomalies

**Monitoring**:
- CPU/Memory usage
- Screenshot changes
- AI-based anomaly detection
- Automated reporting

### 5. Development Automation
**Scenario**: Automate development tasks

**Setup**:
1. GitHub webhook triggers n8n
2. n8n executes commands on VPS
3. Wallestars runs tests/builds
4. Results sent to Slack

**Flow**:
```
GitHub Push
  → n8n webhook
  → Run tests via Wallestars
  → Screenshot test results
  → Post to Slack/Discord
```

## 🔐 Security Considerations

### API Key Protection
✅ Store in `.env` file (chmod 600)
✅ Never commit to git
✅ Rotate regularly
✅ Monitor usage in console.anthropic.com

### VPS Security
✅ Use SSH keys (not passwords)
✅ Configure firewall (UFW)
✅ Enable HTTPS with Let's Encrypt
✅ Keep system updated
✅ Use strong passwords for n8n

### Network Security
✅ Bind services to localhost when possible
✅ Use nginx reverse proxy
✅ Implement rate limiting
✅ Monitor access logs
✅ Use webhook tokens

## 📊 Resource Requirements

### Minimum VPS Specs
- **RAM**: 2GB (4GB recommended with n8n)
- **CPU**: 2 cores
- **Storage**: 20GB SSD
- **OS**: Ubuntu 22.04 LTS
- **Network**: 1TB bandwidth

### Hostinger VPS Plans
- **VPS 1**: 2GB RAM, 2 cores - €4.99/month
- **VPS 2**: 4GB RAM, 2 cores - €8.99/month
- **VPS 3**: 8GB RAM, 4 cores - €12.99/month

*Wallestars + n8n recommended: VPS 2 or higher*

## 🛠️ Management Commands

### Service Management
```bash
# Check all services
pm2 list

# View logs
pm2 logs wallestars
pm2 logs n8n

# Restart services
pm2 restart wallestars
pm2 restart n8n

# Stop services
pm2 stop all
```

### System Monitoring
```bash
# Check resources
pm2 monit

# Check disk space
df -h

# Check memory
free -h

# Check network
netstat -tulpn
```

### Updates
```bash
# Update Wallestars
cd /opt/Wallestars
git pull
npm install
npm run build
pm2 restart wallestars

# Update system
sudo apt update && sudo apt upgrade -y

# Update n8n
sudo npm update -g n8n
pm2 restart n8n
```

## 📈 Monitoring & Analytics

### Built-in Monitoring
- **PM2 Monitoring**: `pm2 monit`
- **Health Endpoint**: `/api/health`
- **n8n Execution History**: Built-in UI

### External Monitoring (Optional)
- **UptimeRobot**: Monitor uptime
- **Grafana**: Visualize metrics
- **Prometheus**: Collect metrics
- **Sentry**: Error tracking

## 🎓 Learning Resources

### Wallestars Documentation
- [README.md](README.md) - Project overview
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [MCP_SETUP.md](MCP_SETUP.md) - Claude Desktop integration

### External Resources
- [Anthropic Docs](https://docs.anthropic.com) - Claude API
- [n8n Docs](https://docs.n8n.io) - Automation platform
- [Hostinger Tutorials](https://hostinger.com/tutorials) - VPS guides
- [Nginx Docs](https://nginx.org/en/docs/) - Web server

## 🆘 Troubleshooting

### Quick Diagnostics
```bash
# Check if services are running
pm2 list

# Check logs for errors
pm2 logs --lines 50

# Test API
curl http://localhost:3000/api/health

# Check ports
sudo netstat -tulpn | grep -E '3000|5678'

# Check firewall
sudo ufw status
```

### Common Issues

**Issue**: Cannot access from browser
```bash
# Solution: Open firewall ports
sudo ufw allow 3000
sudo ufw allow 5678
```

**Issue**: API key not working
```bash
# Solution: Check .env file
cat /opt/Wallestars/.env | grep ANTHROPIC
# Restart service
pm2 restart wallestars
```

**Issue**: n8n workflows not triggering
```bash
# Solution: Check n8n logs
pm2 logs n8n
# Ensure workflow is activated in n8n UI
```

## 🎯 Next Steps

After completing setup:

1. ✅ **Test the Health Endpoint**
   ```bash
   curl http://your-vps-ip:3000/api/health
   ```

2. ✅ **Create Your First n8n Workflow**
   - Open n8n at `http://your-vps-ip:5678`
   - Import examples from `n8n-workflows.json`
   - Test with simple screenshot workflow

3. ✅ **Setup Domain & HTTPS**
   - Point domain to VPS
   - Run certbot for SSL
   - Configure nginx

4. ✅ **Build Your Automation**
   - Connect external services
   - Create custom workflows
   - Test thoroughly

5. ✅ **Monitor & Maintain**
   - Check logs regularly
   - Update dependencies
   - Backup configurations

## 🌟 Example Projects

### Project 1: Personal Assistant Bot
- Telegram bot for desktop control
- Screenshot on demand
- Ask Claude questions
- System status reports

### Project 2: Automated Testing
- Schedule UI tests
- Screenshot comparison
- AI-powered verification
- Automated reports

### Project 3: Monitoring Dashboard
- Collect system metrics
- Store in database
- Visualize with Grafana
- Alert on issues

### Project 4: Multi-Service Integration
- Combine 5+ services
- Complex workflows
- Event-driven actions
- Business automation

## 📞 Support & Community

### Get Help
- **GitHub Issues**: [Report bugs or request features](https://github.com/Wallesters-org/Wallestars/issues)
- **n8n Community**: [community.n8n.io](https://community.n8n.io)
- **Hostinger Support**: Available 24/7
- **Anthropic Support**: [support.anthropic.com](https://support.anthropic.com)

### Contribute
- Fork the repository
- Submit pull requests
- Share your workflows
- Improve documentation

---

## 🎉 Congratulations!

You now have a complete understanding of how to integrate Claude Console, Hostinger VPS, and n8n with Wallestars Control Center.

**Your setup enables**:
- ✅ Professional cloud hosting on Hostinger VPS
- ✅ AI-powered automation with Claude
- ✅ Workflow orchestration with n8n
- ✅ Remote computer control
- ✅ Multi-service integration
- ✅ Scalable architecture

**Start building amazing automations today!** 🚀

---

**Built with ❤️ by Wallestars Team**

*Need help? Check the documentation or open an issue on GitHub!*
