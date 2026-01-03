# Hostinger VPS Management

Python-based management tool for Hostinger VPS infrastructure.

## Overview

Manages the Wallestars VPS deployment on Hostinger:
- **Hostname**: srv1201204.hstgr.cloud
- **IPv4**: 72.61.154.188
- **IPv6**: 2a02:4780:41:e7b1::1
- **Services**: n8n, Docker, Nginx, Eva Core

## Features

- ✅ Health monitoring and checks
- ✅ Service management (start/stop/restart)
- ✅ Deployment automation
- ✅ Log retrieval
- ✅ SSH command execution
- ✅ Resource monitoring

## Installation

```bash
# Make executable
chmod +x platforms/hostinger-vps/hostinger-vps-manager.py

# Install dependencies
pip install requests

# Create alias
alias vps="python platforms/hostinger-vps/hostinger-vps-manager.py"
```

## Configuration

Set environment variables:

```bash
export VPS_HOST="srv1201204.hstgr.cloud"
export VPS_IP="72.61.154.188"
export VPS_USER="root"
export SSH_KEY_PATH="~/.ssh/id_rsa"
export N8N_URL="https://n8n.srv1201204.hstgr.cloud"
export N8N_API_KEY="your-n8n-api-key"
```

Or add to `.env`:

```bash
cp .env.example .env
# Edit .env with your values
```

## Usage

### Health Check

```bash
# Full health check
python hostinger-vps-manager.py health

# JSON output
python hostinger-vps-manager.py health --json
```

Health check includes:
- SSH connectivity
- System uptime
- Disk usage
- Memory usage
- Docker status
- Running containers
- n8n service availability

### Service Management

```bash
# Check service status
python hostinger-vps-manager.py status all
python hostinger-vps-manager.py status docker
python hostinger-vps-manager.py status nginx
python hostinger-vps-manager.py status n8n

# Restart service
python hostinger-vps-manager.py restart docker
python hostinger-vps-manager.py restart nginx
python hostinger-vps-manager.py restart n8n
```

### Deployment

```bash
# Deploy latest updates
python hostinger-vps-manager.py deploy

# Deploy to custom path
python hostinger-vps-manager.py deploy --path /opt/custom-path
```

Deployment process:
1. Pull latest code from Git
2. Update Docker images
3. Restart services
4. Verify deployment

### Log Retrieval

```bash
# Get n8n logs (last 50 lines)
python hostinger-vps-manager.py logs n8n

# Get more lines
python hostinger-vps-manager.py logs n8n --lines 200

# Get system logs
python hostinger-vps-manager.py logs nginx
```

### Custom Commands

```bash
# Execute any SSH command
python hostinger-vps-manager.py exec "docker ps -a"
python hostinger-vps-manager.py exec "df -h"
python hostinger-vps-manager.py exec "free -m"
```

## Integration with GitHub Actions

The VPS manager is integrated with GitHub Actions for automated deployments:

```yaml
# .github/workflows/deploy-to-vps.yml
- name: Deploy to VPS
  run: |
    python platforms/hostinger-vps/hostinger-vps-manager.py deploy
```

See [deploy-to-vps.yml](../../.github/workflows/deploy-to-vps.yml) for full workflow.

## Health Check Output

```
============================================================
VPS Health Check: srv1201204.hstgr.cloud
============================================================

ssh_connectivity........................... ✅ OK
system_uptime.............................. ✅ OK
  data: 15:30:01 up 10 days, 3:45, 1 user
disk_usage................................. ✅ OK
  total: 50G
  used: 15G
  available: 32G
  percent: 32%
memory_usage............................... ✅ OK
  total: 4.0G
  used: 2.1G
  available: 1.5G
docker..................................... ✅ OK
  version: Docker version 24.0.5
docker_containers.......................... ✅ OK
  count: 3
  containers:
    - n8n: Up 2 days
    - postgres: Up 2 days
    - nginx: Up 2 days
n8n_service................................ ✅ OK
  status_code: 401
  url: https://n8n.srv1201204.hstgr.cloud

============================================================
Overall: ✅ HEALTHY
============================================================
```

## Monitoring

### Automated Health Checks

Set up cron job for regular monitoring:

```bash
# Add to crontab
0 */6 * * * /path/to/python /path/to/hostinger-vps-manager.py health --json > /var/log/vps-health.log 2>&1
```

### Integration with n8n

Create n8n workflow to:
1. Run health check every hour
2. Alert on failures
3. Auto-restart failed services

## Security

- ✅ SSH key authentication (no passwords)
- ✅ SSH key stored securely (not in repo)
- ✅ Timeouts on all operations
- ✅ No sensitive data in logs
- ✅ SSL/TLS for n8n connections

## Troubleshooting

### SSH Connection Failed

```bash
# Check SSH key
ls -la ~/.ssh/id_rsa

# Test SSH manually
ssh -i ~/.ssh/id_rsa root@72.61.154.188

# Check key permissions
chmod 600 ~/.ssh/id_rsa
```

### n8n Service Unreachable

```bash
# Check Docker container
python hostinger-vps-manager.py exec "docker ps | grep n8n"

# Restart n8n
python hostinger-vps-manager.py restart n8n

# Check logs
python hostinger-vps-manager.py logs n8n --lines 100
```

### Deployment Failed

```bash
# Check Git status on VPS
python hostinger-vps-manager.py exec "cd /opt/wallestars && git status"

# Check Docker status
python hostinger-vps-manager.py status docker

# View deployment logs
python hostinger-vps-manager.py logs docker
```

## API Reference

See [hostinger-vps-manager.py](./hostinger-vps-manager.py) for full API documentation.

## Architecture

```
┌────────────────────────────────────────┐
│     Local Development Machine          │
│                                        │
│  ┌──────────────────────────────┐    │
│  │  hostinger-vps-manager.py    │    │
│  └────────────┬─────────────────┘    │
└───────────────┼──────────────────────┘
                │ SSH
                │
┌───────────────▼──────────────────────┐
│   VPS: srv1201204.hstgr.cloud        │
│   IP: 72.61.154.188                  │
│                                       │
│  ┌─────────────────────────────┐    │
│  │  Docker Compose             │    │
│  │  ├─ n8n                     │    │
│  │  ├─ PostgreSQL              │    │
│  │  └─ Nginx                   │    │
│  └─────────────────────────────┘    │
└───────────────────────────────────────┘
```

## Related

- [VPS Setup Guide](../../docs/vps-setup-guide.md)
- [GitHub Actions Deployment](../../.github/workflows/deploy-to-vps.yml)
- [n8n Integration Guide](../../docs/n8n-integration-guide.md)
