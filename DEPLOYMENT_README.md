# Deployment Scripts

This directory contains scripts and configurations for deploying Wallestars to production.

## 📁 Files Overview

### Deployment Scripts

- **`deploy-vps.sh`** - Automated VPS setup script
  - Installs Node.js, Nginx, PM2, Certbot
  - Configures firewall, users, and directories
  - Sets up Nginx reverse proxy for both Wallestars and N8N
  - Run on VPS with: `sudo ./deploy-vps.sh`

- **`health-check.sh`** - Service health monitoring script
  - Checks Wallestars and N8N health endpoints
  - Monitors system resources (disk, memory)
  - Auto-restarts failed services
  - Checks SSL certificate expiration
  - Add to crontab: `*/5 * * * * /var/www/wallestars/health-check.sh`

### Configuration Files

- **`ecosystem.config.js`** - PM2 process configuration
  - Defines process management settings
  - Configures logging and auto-restart
  - Includes deployment configuration
  - Use with: `pm2 start ecosystem.config.js`

- **`validate-env.js`** - Environment validation script
  - Validates required environment variables
  - Checks for placeholder values
  - Ensures proper configuration before startup
  - Run with: `npm run validate-env`

### Documentation

- **`VPS_DEPLOYMENT.md`** - Comprehensive deployment guide
  - Step-by-step deployment instructions
  - Security hardening procedures
  - Nginx and SSL configuration
  - Troubleshooting guide

- **`DEPLOYMENT_CHECKLIST.md`** - Quick deployment checklist
  - Pre-deployment verification
  - Step-by-step deployment tasks
  - Post-deployment verification
  - Update procedures

- **`SECURITY.md`** - Security policy and best practices
  - Vulnerability reporting process
  - Security best practices
  - Credential rotation procedures
  - Known limitations

- **`SECURITY_CHECKLIST.md`** - Security audit checklist
  - Pre-deployment security checks
  - Code security verification
  - Infrastructure security
  - Compliance verification

## 🚀 Quick Start

### For Fresh VPS Deployment

1. **Upload deployment script to VPS:**
   ```bash
   scp deploy-vps.sh user@72.61.154.188:~/
   ```

2. **Run deployment script on VPS:**
   ```bash
   ssh user@72.61.154.188
   chmod +x deploy-vps.sh
   sudo ./deploy-vps.sh
   ```

3. **Deploy application code:**
   ```bash
   sudo su - wallestars
   cd /var/www/wallestars
   git clone https://github.com/Wallesters-org/Wallestars.git .
   ```

4. **Configure and build:**
   ```bash
   cp .env.example .env
   nano .env  # Add ANTHROPIC_API_KEY
   npm install
   npm run build
   ```

5. **Start with PM2:**
   ```bash
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

6. **Setup SSL:**
   ```bash
   sudo certbot --nginx -d srv1201204.hstgr.cloud
   sudo certbot --nginx -d n8n.srv1201204.hstgr.cloud
   ```

7. **Setup monitoring:**
   ```bash
   chmod +x health-check.sh
   crontab -e
   # Add: */5 * * * * /var/www/wallestars/health-check.sh >> /var/log/wallestars-health.log 2>&1
   ```

### For Updates

```bash
cd /var/www/wallestars
git pull origin main
npm install
npm run build
pm2 reload wallestars
```

## 📋 Deployment Checklist

Follow the detailed checklist in `DEPLOYMENT_CHECKLIST.md`:

- [ ] Pre-deployment verification
- [ ] VPS initial setup
- [ ] Application deployment
- [ ] SSL configuration
- [ ] Health monitoring setup
- [ ] Security hardening
- [ ] Final testing

## 🔒 Security

Before deployment:

1. **Run security audit:**
   ```bash
   npm audit
   npm run validate-env
   ```

2. **Review security checklist:**
   - See `SECURITY_CHECKLIST.md`
   - Verify no exposed credentials
   - Check firewall configuration

3. **Rotate credentials:**
   - Generate new production API keys
   - Change VPS passwords
   - Update .env file

## 🔍 Monitoring

After deployment:

- **Check PM2 status:** `pm2 status`
- **View logs:** `pm2 logs wallestars --lines 50`
- **Check health:** `curl https://srv1201204.hstgr.cloud/api/health`
- **Monitor resources:** `pm2 monit`
- **Review health logs:** `tail -f /var/log/wallestars-health.log`

## 🚨 Troubleshooting

Common issues and solutions:

1. **Service not starting:**
   - Check logs: `pm2 logs wallestars --err`
   - Verify .env file exists and is valid
   - Check port availability: `sudo lsof -i :3000`

2. **502 Bad Gateway:**
   - Ensure application is running: `pm2 list`
   - Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
   - Restart services: `pm2 restart all && sudo systemctl restart nginx`

3. **SSL issues:**
   - Check certificates: `sudo certbot certificates`
   - View Let's Encrypt logs: `sudo tail -f /var/log/letsencrypt/letsencrypt.log`
   - Test renewal: `sudo certbot renew --dry-run`

## 📚 Documentation

- [VPS_DEPLOYMENT.md](VPS_DEPLOYMENT.md) - Full deployment guide
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Step-by-step checklist
- [SECURITY.md](SECURITY.md) - Security policy
- [SECURITY_CHECKLIST.md](SECURITY_CHECKLIST.md) - Security audit
- [README.md](README.md) - Project overview

## 📞 Support

For deployment assistance:
- GitHub Issues: https://github.com/Wallesters-org/Wallestars/issues
- Documentation: See files listed above
- Logs: Check PM2 and Nginx logs

---

**Target VPS**: 72.61.154.188 (srv1201204.hstgr.cloud)  
**Domains**: 
- Wallestars: https://srv1201204.hstgr.cloud
- N8N: https://n8n.srv1201204.hstgr.cloud
