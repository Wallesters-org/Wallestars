# Quick Deployment Checklist

## 🚀 VPS Deployment - Step-by-Step Guide

Use this checklist when deploying Wallestars to production VPS.

**Target VPS**: 72.61.154.188 (srv1201204.hstgr.cloud)

---

## 📋 Pre-Deployment

### Access Verification
- [ ] SSH access to VPS confirmed: `ssh user@72.61.154.188`
- [ ] Sudo privileges verified: `sudo -v`
- [ ] Domain DNS configured and propagated
  - [ ] srv1201204.hstgr.cloud → 72.61.154.188
  - [ ] n8n.srv1201204.hstgr.cloud → 72.61.154.188
  - [ ] GitHub Pages TXT record (if using custom domain) - see [DNS_CONFIGURATION.md](DNS_CONFIGURATION.md)

### Credentials Ready
- [ ] Anthropic API key (production key, not dev)
- [ ] GitHub access (if using private repo)
- [ ] VPS root password (new/rotated)
- [ ] Email for SSL certificates

---

## 🔧 Initial VPS Setup

### 1. Run Deployment Script

```bash
# Upload deployment script to VPS
scp deploy-vps.sh user@72.61.154.188:~/

# SSH into VPS
ssh user@72.61.154.188

# Make executable and run
chmod +x deploy-vps.sh
sudo ./deploy-vps.sh
```

**Verifications:**
- [ ] Script completed without errors
- [ ] Node.js 20.x installed: `node --version`
- [ ] Nginx installed: `nginx -v`
- [ ] PM2 installed: `pm2 --version`
- [ ] Certbot installed: `certbot --version`
- [ ] User 'wallestars' created: `id wallestars`
- [ ] Firewall configured: `sudo ufw status`

---

## 📦 Application Deployment

### 2. Deploy Application Code

```bash
# Switch to wallestars user
sudo su - wallestars

# Navigate to app directory
cd /var/www/wallestars

# Clone repository
git clone https://github.com/Wallesters-org/Wallestars.git .

# Or upload via SCP from local machine:
# scp -r /path/to/Wallestars/* wallestars@72.61.154.188:/var/www/wallestars/
```

**Verifications:**
- [ ] Code downloaded/uploaded successfully
- [ ] All files present: `ls -la`
- [ ] Git working if cloned: `git status`

### 3. Install Dependencies

```bash
cd /var/www/wallestars
npm install
```

**Verifications:**
- [ ] `npm install` completed without errors
- [ ] `node_modules/` directory created
- [ ] All dependencies installed: `npm list --depth=0`

### 4. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit environment file
nano .env
```

**Required Configuration:**
```env
ANTHROPIC_API_KEY=sk-ant-your-production-key-here
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://srv1201204.hstgr.cloud
ENABLE_COMPUTER_USE=true
ENABLE_ANDROID=false
WS_PORT=3001
```

**Verifications:**
- [ ] `.env` file created
- [ ] All required variables set
- [ ] API key is production key (not dev/test)
- [ ] File permissions: `chmod 600 .env`
- [ ] Validate env: `npm run validate-env`

### 5. Build Application

```bash
# Build frontend
npm run build
```

**Verifications:**
- [ ] Build completed successfully
- [ ] `dist/` directory created
- [ ] Check dist contents: `ls -la dist/`
- [ ] index.html exists: `test -f dist/index.html`

---

## 🔄 Process Management

### 6. Start with PM2

```bash
# Start application
pm2 start ecosystem.config.js --env production

# Or start manually
pm2 start server/index.js --name wallestars

# Save PM2 process list
pm2 save

# Check status
pm2 status
pm2 logs wallestars --lines 50
```

**Verifications:**
- [ ] PM2 process running: `pm2 list`
- [ ] Status shows "online"
- [ ] No errors in logs: `pm2 logs wallestars --lines 20 --err`
- [ ] Application listening on port 3000: `curl http://localhost:3000/api/health`

### 7. Configure PM2 Startup

```bash
# Setup PM2 to start on boot
pm2 startup systemd

# Follow the command it outputs (run with sudo)
# Example: sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u wallestars --hp /home/wallestars
```

**Verifications:**
- [ ] Startup command executed successfully
- [ ] PM2 will start on reboot
- [ ] Test: `sudo reboot` and verify processes restart

---

## 🌐 Web Server Configuration

### 8. Verify Nginx Configuration

```bash
# Check Nginx config
sudo nginx -t

# View Wallestars config
sudo cat /etc/nginx/sites-available/wallestars

# View N8N config
sudo cat /etc/nginx/sites-available/n8n

# Restart Nginx if needed
sudo systemctl restart nginx
```

**Verifications:**
- [ ] Nginx config test passes: `sudo nginx -t`
- [ ] Wallestars site enabled
- [ ] N8N site enabled
- [ ] Nginx running: `sudo systemctl status nginx`

---

## 🔒 SSL Configuration

### 9. Setup SSL Certificates

```bash
# Get certificate for Wallestars domain
sudo certbot --nginx -d srv1201204.hstgr.cloud

# Get certificate for N8N domain
sudo certbot --nginx -d n8n.srv1201204.hstgr.cloud
```

**During Setup:**
- [ ] Enter email address for urgent renewal and security notices
- [ ] Agree to Let's Encrypt Terms of Service
- [ ] Choose to redirect HTTP to HTTPS (recommended: Yes)

**Verifications:**
- [ ] Certificates obtained successfully
- [ ] Nginx auto-configured for SSL
- [ ] Test renewal: `sudo certbot renew --dry-run`
- [ ] Auto-renewal timer active: `sudo systemctl status certbot.timer`

---

## ✅ Testing & Verification

### 10. Test Deployment

**Wallestars Tests:**
```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test HTTPS
curl https://srv1201204.hstgr.cloud/api/health

# Check response
# Expected: {"status":"healthy","timestamp":"...","services":{...}}
```

**N8N Tests:**
```bash
# Test N8N locally (if running)
curl http://localhost:5678/healthz

# Test N8N via domain
curl https://n8n.srv1201204.hstgr.cloud
```

**Browser Tests:**
- [ ] Visit https://srv1201204.hstgr.cloud
  - [ ] Frontend loads correctly
  - [ ] No console errors
  - [ ] Green padlock (valid SSL)
  - [ ] All assets load
  
- [ ] Visit https://n8n.srv1201204.hstgr.cloud
  - [ ] N8N dashboard loads
  - [ ] Can log in
  - [ ] Green padlock (valid SSL)

**System Tests:**
- [ ] PM2 status all green: `pm2 status`
- [ ] No errors in logs: `pm2 logs --err --lines 50`
- [ ] Nginx running: `sudo systemctl status nginx`
- [ ] Firewall active: `sudo ufw status`
- [ ] Disk space OK: `df -h`
- [ ] Memory OK: `free -h`

---

## 🔍 Monitoring Setup

### 11. Setup Health Monitoring

```bash
# Upload health check script
cd /var/www/wallestars
chmod +x health-check.sh

# Test health check
./health-check.sh

# Add to crontab for automatic monitoring
crontab -e

# Add line (runs every 5 minutes):
*/5 * * * * /var/www/wallestars/health-check.sh >> /var/log/wallestars-health.log 2>&1
```

**Verifications:**
- [ ] Health check script runs successfully
- [ ] All checks pass
- [ ] Crontab configured
- [ ] Log file created: `tail /var/log/wallestars-health.log`

---

## 📝 Post-Deployment Tasks

### 12. Documentation & Cleanup

- [ ] Document deployment date and version
- [ ] Save configuration backups
- [ ] Clean up temporary files
- [ ] Remove installation scripts from home directory
- [ ] Update team with deployment status

### 13. Security Hardening

- [ ] Change default SSH port (optional but recommended)
- [ ] Setup Fail2Ban: `sudo apt install fail2ban`
- [ ] Review Nginx security headers
- [ ] Enable automatic security updates
- [ ] Setup log rotation
- [ ] Configure backup strategy

### 14. Monitoring & Alerts

- [ ] Setup uptime monitoring (e.g., UptimeRobot, Pingdom)
- [ ] Configure Slack/email alerts for downtime
- [ ] Setup log aggregation (optional)
- [ ] Configure performance monitoring (optional)

---

## 🚨 Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Find what's using port 3000
sudo lsof -i :3000

# Kill process if needed
sudo kill -9 <PID>
```

**PM2 Process Not Starting:**
```bash
# Check logs
pm2 logs wallestars --lines 100

# Try starting manually
cd /var/www/wallestars
node server/index.js

# Check for missing .env
test -f .env && echo "OK" || echo "Missing .env file"
```

**Nginx 502 Bad Gateway:**
```bash
# Check if application is running
curl http://localhost:3000/api/health

# Check Nginx error logs
sudo tail -50 /var/log/nginx/error.log

# Restart services
pm2 restart wallestars
sudo systemctl restart nginx
```

**SSL Certificate Issues:**
```bash
# Check certificate status
sudo certbot certificates

# View Let's Encrypt logs
sudo tail -50 /var/log/letsencrypt/letsencrypt.log

# Manually renew
sudo certbot renew --force-renewal
```

---

## 🔄 Update Procedure

### How to Update After Deployment

```bash
# SSH into VPS
ssh wallestars@72.61.154.188

# Navigate to app directory
cd /var/www/wallestars

# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Rebuild frontend
npm run build

# Restart with zero downtime
pm2 reload wallestars

# Or regular restart
pm2 restart wallestars

# Verify
pm2 logs wallestars --lines 50
curl https://srv1201204.hstgr.cloud/api/health
```

---

## ✅ Deployment Complete Checklist

### Final Verification

- [ ] Frontend accessible via HTTPS
- [ ] N8N dashboard accessible via HTTPS
- [ ] SSL certificates valid and auto-renewing
- [ ] PM2 processes running and monitored
- [ ] Health checks passing
- [ ] No errors in logs
- [ ] Firewall configured correctly
- [ ] Automatic backups configured
- [ ] Monitoring and alerts set up
- [ ] Team notified of deployment
- [ ] Documentation updated

### Success Criteria

✅ **Wallestars Frontend**
- Accessible at https://srv1201204.hstgr.cloud
- HTTPS with valid certificate
- All features working
- No console errors

✅ **N8N Dashboard**
- Accessible at https://n8n.srv1201204.hstgr.cloud
- HTTPS with valid certificate
- Can create and run workflows

✅ **Infrastructure**
- PM2 monitoring both services
- Auto-restart on failure
- Auto-start on reboot
- Health checks running every 5 minutes

✅ **Security**
- No exposed credentials
- Firewall properly configured
- SSL auto-renewal enabled
- Regular security updates enabled

---

## 📞 Support

**If you encounter issues:**
1. Check logs: `pm2 logs` and `/var/log/nginx/`
2. Review troubleshooting section above
3. Consult VPS_DEPLOYMENT.md for detailed instructions
4. Check GitHub Issues: https://github.com/Wallesters-org/Wallestars/issues

---

**Deployment Date**: _________________  
**Deployed By**: _________________  
**Version**: _________________  
**Notes**: _________________
