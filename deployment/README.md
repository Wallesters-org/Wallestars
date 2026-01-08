# Deployment Scripts for Wallestars VPS

This directory contains all deployment scripts and configuration files for deploying Wallestars Control Center to a VPS.

## 📁 Contents

### Shell Scripts

- **`setup-vps-complete.sh`** - Initial VPS setup (Node.js, Python, Docker, Redis, PostgreSQL, Nginx, etc.)
- **`setup-wallestars.sh`** - Clone and setup Wallestars application
- **`deploy-workflows.sh`** - Deploy n8n workflows and start integration services
- **`start-all-services.sh`** - Start all Wallestars services with PM2

### Configuration Files

- **`nginx-wallestars.conf`** - Nginx reverse proxy configuration
- **`health-check.py`** - Health monitoring script for 24/7 service monitoring

## 🚀 Quick Start

### 1. Initial Setup

```bash
# Copy scripts to VPS
scp -r deployment/ root@your-vps:/tmp/

# SSH into VPS
ssh root@your-vps

# Run VPS setup
cd /tmp/deployment
chmod +x setup-vps-complete.sh
./setup-vps-complete.sh
```

### 2. Install Wallestars

```bash
chmod +x setup-wallestars.sh
./setup-wallestars.sh
```

### 3. Configure Environment

```bash
nano /opt/wallestars/.env
# Add your API keys and configuration
```

### 4. Setup Nginx

```bash
sudo cp nginx-wallestars.conf /etc/nginx/sites-available/wallestars
sudo nano /etc/nginx/sites-available/wallestars  # Replace your-domain.com
sudo ln -s /etc/nginx/sites-available/wallestars /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. Get SSL Certificate

```bash
sudo certbot certonly --nginx -d your-domain.com
```

### 6. Start Services

```bash
cd /opt/wallestars
./deployment/start-all-services.sh
```

## 📊 Service Management

### View Status

```bash
pm2 status
pm2 monit
```

### View Logs

```bash
pm2 logs
pm2 logs wallestars-api
pm2 logs n8n
```

### Restart Services

```bash
pm2 restart all
pm2 restart wallestars-api
```

## 🔍 Health Monitoring

The health check script monitors all services and sends email alerts when services are down.

```bash
# Start monitoring
pm2 start deployment/health-check.py --name health-monitor --interpreter python3

# Manual check
python3 deployment/health-check.py
```

## 📖 Full Documentation

See [VPS_DEPLOYMENT_PLAN.md](../VPS_DEPLOYMENT_PLAN.md) for complete deployment guide.

## 🔧 Troubleshooting

### Check Service Logs

```bash
pm2 logs <service-name> --lines 100
```

### Check System Logs

```bash
sudo journalctl -u nginx -n 50
sudo journalctl -u redis -n 50
```

### Test Nginx Config

```bash
sudo nginx -t
```

### Check Ports

```bash
sudo netstat -tlnp | grep -E '(3000|5678|80|443)'
```

## 🛡️ Security

- Firewall (UFW) is configured to allow only necessary ports
- SSL/TLS encryption via Let's Encrypt
- Nginx security headers enabled
- PM2 process isolation

## 📝 Notes

- All scripts assume installation directory: `/opt/wallestars`
- Logs are stored in: `/opt/wallestars/logs/`
- Services run as the current user
- PM2 startup on boot is configured automatically
