# VPS Monitoring Platform

## Описание

Централизирана платформа за мониторинг на VPS сървъри с quick actions, shortcuts и полезни функции за ежедневна употреба.

## Ключови функционалности

### 1. Real-time мониторинг
- CPU, RAM, Disk usage
- Network traffic
- Running processes
- System uptime

### 2. Quick Actions
- Restart services
- Clear cache
- Update packages
- Deploy applications

### 3. Shortcuts
- SSH direct connect
- File browser
- Log viewer
- Terminal access

### 4. Alerts & Notifications
- Threshold alerts (CPU > 80%, Disk > 90%)
- Service down notifications
- Security alerts
- Performance degradation warnings

## Dashboard Features

### Metrics Display
- Реално време графики
- Исторически данни
- Comparison views
- Predictive analytics

### Management Tools
- Bulk operations
- Scheduled tasks
- Automated backups
- Security scans

## Архитектура

```
VPS Servers → Monitoring Agents → Data Aggregator → API Server → Web Dashboard
                                          ↓
                                    Database (Metrics Storage)
```

## Setup

### 1. Install Monitoring Agent

```bash
# Replace YOUR_PLATFORM_URL with your deployment URL
# Options: wallesters.com, your Netlify URL, or your VPS hostname
curl -sSL https://YOUR_PLATFORM_URL/install.sh | bash
```

### 2. Configure Agent

```yaml
server_id: "vps-001"
monitoring_endpoint: "https://api.platform.example.com"
api_key: "${API_KEY}"
metrics_interval: 60 # seconds
```

### 3. Dashboard Access

Navigate to `https://dashboard.platform.example.com` and login.

## API Endpoints

```
GET /api/servers - List all servers
GET /api/servers/{id}/metrics - Get server metrics
POST /api/servers/{id}/action - Execute quick action
GET /api/alerts - List active alerts
```

## Quick Actions Reference

### Service Management
- `restart_nginx` - Restart Nginx
- `restart_pm2` - Restart PM2 processes
- `clear_cache` - Clear system cache

### System Maintenance
- `update_packages` - Update all packages
- `disk_cleanup` - Clean temporary files
- `log_rotate` - Rotate log files

### Deployment
- `deploy_app` - Deploy application
- `rollback` - Rollback to previous version
- `run_migrations` - Run database migrations

## Security

- End-to-end encryption
- Role-based access control
- Audit logging
- Two-factor authentication

## Pricing

- Free tier: Up to 3 VPS servers
- Pro: Unlimited servers, advanced analytics
- Enterprise: Custom solutions, dedicated support
