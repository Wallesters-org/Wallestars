# Visual Categorization Feature - Deployment Checklist

## Pre-Deployment Checklist

Use this checklist to ensure Visual Categorization feature is ready for production deployment.

### ✅ Code & Build
- [x] Feature code completed
- [x] Backend API routes implemented
- [x] Frontend components created
- [x] Navigation integration complete
- [x] Production build successful (`npm run build`)
- [x] No build errors or warnings
- [x] All dependencies installed

### ✅ Documentation
- [x] Feature documentation created (VISUAL_CATEGORIZATION_DOCS.md)
- [x] Deployment guide created (VISUAL_CATEGORIZATION_DEPLOYMENT.md)
- [x] Quick start guide created (VISUAL_CATEGORIZATION_QUICKSTART.md)
- [x] README.md updated
- [x] API endpoints documented

### ⚙️ Configuration
- [ ] `.env` file configured with production values
- [ ] `ANTHROPIC_API_KEY` set and verified
- [ ] API key has sufficient credits
- [ ] Environment variables validated
- [ ] CORS settings configured for production domain
- [ ] File size limits configured appropriately

### 🔒 Security
- [ ] API keys stored securely (not in code)
- [ ] `.env` file in `.gitignore`
- [ ] No secrets committed to repository
- [ ] Rate limiting configured (if needed)
- [ ] Input validation implemented
- [ ] HTTPS enabled for production
- [ ] Firewall rules configured

### 🌐 Infrastructure (VPS Deployment)

#### Server Setup
- [ ] VPS provisioned and accessible
- [ ] Node.js 20.x installed
- [ ] npm installed
- [ ] PM2 installed globally
- [ ] Nginx installed
- [ ] Certbot installed (for SSL)
- [ ] Firewall configured (UFW)

#### Application Deployment
- [ ] Application directory created (`/var/www/wallestars`)
- [ ] Code deployed to VPS
- [ ] Dependencies installed (`npm install`)
- [ ] Production build created (`npm run build`)
- [ ] PM2 configuration set up
- [ ] Application running via PM2
- [ ] PM2 startup script configured

#### Web Server Configuration
- [ ] Nginx site configuration created
- [ ] SSL certificate obtained (Let's Encrypt)
- [ ] SSL auto-renewal configured
- [ ] Nginx site enabled
- [ ] Nginx configuration tested
- [ ] Nginx restarted successfully
- [ ] HTTP to HTTPS redirect configured

#### Network Configuration
- [ ] Domain DNS configured
- [ ] DNS propagation verified
- [ ] Ports 80, 443 open in firewall
- [ ] WebSocket connections allowed

### 🧪 Testing

#### Local Testing
- [x] Development server starts without errors
- [x] Feature accessible via navigation
- [ ] File upload works
- [ ] AI categorization functions (with API key)
- [ ] Fallback categorization works (without API key)
- [ ] Grid view displays correctly
- [ ] List view displays correctly
- [ ] Search functionality works
- [ ] Multi-select works
- [ ] Export functionality works
- [ ] Delete functionality works

#### Production Testing
- [ ] Application accessible via production URL
- [ ] HTTPS working correctly
- [ ] SSL certificate valid
- [ ] Visual Categorization page loads
- [ ] File uploads work in production
- [ ] AI categorization works
- [ ] All UI features functional
- [ ] Mobile responsive
- [ ] Cross-browser compatible

### 📊 Monitoring

- [ ] Health check endpoint working (`/api/health`)
- [ ] Categorization service shows as healthy
- [ ] PM2 monitoring active
- [ ] Application logs configured
- [ ] Error logging in place
- [ ] Performance monitoring set up (optional)
- [ ] Uptime monitoring configured (optional)

### 📝 Final Checks

- [ ] All environment variables set
- [ ] No placeholder values in config
- [ ] API keys rotated if exposed during development
- [ ] Backup strategy in place
- [ ] Rollback plan prepared
- [ ] Team notified of deployment
- [ ] Documentation accessible to team
- [ ] Support contacts updated

## Deployment Steps

### Step 1: Prepare VPS

```bash
# SSH into VPS
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

# Install Certbot
sudo apt install -y certbot python3-certbot-nginx
```

**Verification**: ✅
- [ ] Node version: `node --version` (should be 20.x)
- [ ] PM2 installed: `pm2 --version`
- [ ] Nginx installed: `nginx -v`
- [ ] Certbot installed: `certbot --version`

### Step 2: Deploy Application

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
nano .env  # Add production values

# Build application
npm run build
```

**Verification**: ✅
- [ ] Repository cloned successfully
- [ ] Dependencies installed: `ls node_modules/`
- [ ] `.env` file configured
- [ ] Build completed: `ls dist/`

### Step 3: Configure PM2

```bash
# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 startup
pm2 startup
# Run the command it outputs

# Check status
pm2 status
```

**Verification**: ✅
- [ ] Application running in PM2
- [ ] Status shows "online"
- [ ] No errors in logs: `pm2 logs`

### Step 4: Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/wallestars
```

Paste configuration from VISUAL_CATEGORIZATION_DEPLOYMENT.md

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/wallestars /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

**Verification**: ✅
- [ ] Nginx config syntax valid
- [ ] Nginx restarted successfully
- [ ] Site accessible via HTTP

### Step 5: Configure SSL

```bash
# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

**Verification**: ✅
- [ ] SSL certificate obtained
- [ ] HTTPS working
- [ ] HTTP redirects to HTTPS
- [ ] Auto-renewal configured

### Step 6: Configure Firewall

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

**Verification**: ✅
- [ ] Firewall enabled
- [ ] SSH allowed
- [ ] HTTP/HTTPS allowed
- [ ] Application accessible

### Step 7: Test Production Deployment

```bash
# Test health endpoint
curl https://your-domain.com/api/health

# Test categorization endpoint (requires auth)
curl -X POST https://your-domain.com/api/categorization/classify \
  -H "Content-Type: application/json" \
  -d '{"item":{"name":"test.pdf","type":"application/pdf","size":1024}}'
```

**Verification**: ✅
- [ ] Health check returns 200 OK
- [ ] Categorization service listed as healthy
- [ ] Categorization endpoint responds correctly
- [ ] No errors in PM2 logs

### Step 8: Monitor Application

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs wallestars

# Monitor resources
pm2 monit

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

**Verification**: ✅
- [ ] Application running smoothly
- [ ] No errors in logs
- [ ] Resource usage normal
- [ ] Requests being served

## Post-Deployment

### Verification

Visit your production site and test:

- [ ] Homepage loads
- [ ] Navigation works
- [ ] Visual Categorization page accessible
- [ ] Can upload files
- [ ] AI categorization works
- [ ] All views (grid/list) work
- [ ] Search works
- [ ] Export works
- [ ] Multi-select works
- [ ] Mobile responsive

### Monitoring Setup

- [ ] Set up uptime monitoring (UptimeRobot, Pingdom, etc.)
- [ ] Configure error alerting
- [ ] Set up log aggregation (optional)
- [ ] Monitor API usage
- [ ] Track performance metrics

### Documentation

- [ ] Update team wiki/docs with production URL
- [ ] Document any production-specific configurations
- [ ] Create runbook for common issues
- [ ] Update support contacts
- [ ] Share deployment notes with team

### Backup & Disaster Recovery

- [ ] Database backup configured (if applicable)
- [ ] Code repository backed up
- [ ] Environment configuration backed up
- [ ] SSL certificates backed up
- [ ] Recovery procedures documented
- [ ] Rollback plan tested

## Troubleshooting

### Common Issues

**Issue: Application won't start**
- [ ] Check PM2 logs: `pm2 logs`
- [ ] Verify environment variables
- [ ] Check port availability
- [ ] Verify Node.js version

**Issue: SSL not working**
- [ ] Check Certbot logs
- [ ] Verify domain DNS
- [ ] Check Nginx configuration
- [ ] Ensure ports 80/443 open

**Issue: AI categorization fails**
- [ ] Verify API key in `.env`
- [ ] Check API key credits
- [ ] Review application logs
- [ ] Test API endpoint directly

**Issue: File uploads fail**
- [ ] Check file size limits
- [ ] Verify disk space
- [ ] Check Nginx upload limits
- [ ] Review browser console errors

## Success Criteria

Deployment is successful when:

- ✅ Application accessible via HTTPS
- ✅ All features functional
- ✅ No errors in logs
- ✅ Performance acceptable
- ✅ Security measures in place
- ✅ Monitoring active
- ✅ Team notified and trained
- ✅ Documentation complete

## Rollback Plan

If deployment fails:

1. **Stop application**: `pm2 stop wallestars`
2. **Restore previous version**: `git checkout previous-tag`
3. **Rebuild**: `npm install && npm run build`
4. **Restart**: `pm2 restart wallestars`
5. **Verify**: Test critical functionality
6. **Notify**: Inform team of rollback
7. **Investigate**: Review logs and errors
8. **Plan**: Schedule re-deployment

## Support Contacts

- **Technical Lead**: [Contact Info]
- **DevOps**: [Contact Info]
- **Support**: [Contact Info]
- **Emergency**: [Contact Info]

## Notes

- Deployment Date: ______________
- Deployed By: ______________
- Version: 1.0.0
- Environment: Production
- Domain: ______________
- Server: ______________

---

**Checklist Version**: 1.0.0  
**Last Updated**: January 2026  
**For**: Visual Categorization Feature
