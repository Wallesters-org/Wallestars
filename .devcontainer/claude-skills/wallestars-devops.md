---
name: wallestars-devops
description: Comprehensive DevOps management for Wallestars Hostinger VPS infrastructure. Use when managing VPS health checks, deploying applications, monitoring services (n8n, Docker, PostgreSQL), performing backups, or troubleshooting infrastructure issues on srv1201204.hstgr.cloud (72.61.154.188).
---

# Wallestars DevOps Management

Comprehensive toolkit for managing Wallestars Hostinger VPS infrastructure including health monitoring, deployment automation, service management, and backup operations.

## VPS Infrastructure

**Primary VPS:**
- Hostname: `srv1201204.hstgr.cloud`
- IPv4: `72.61.154.188`
- IPv6: `2a02:4780:41:e7b1::1`
- n8n URL: `https://n8n.srv1201204.hstgr.cloud`

**Key Services:**
- n8n workflow automation
- Docker containers
- PostgreSQL database
- Nginx reverse proxy

## Commands Reference

### Health Monitoring

```bash
vps health              # Full comprehensive health check
vps health --json       # JSON output for automation
vps-health             # Quick alias
```

Health checks include:
- SSH connectivity
- Disk space usage
- Memory usage
- CPU load
- Docker service status
- n8n service status
- Database connectivity

### Service Management

```bash
vps status              # All services status
vps status n8n          # Specific service status
vps restart n8n         # Restart service
vps logs n8n            # View service logs
vps logs n8n --lines 100  # More log lines
```

### Deployment

```bash
vps deploy main         # Deploy from main branch
vps deploy production   # Deploy from production branch
vps-deploy [branch]     # Quick deployment alias
```

Deployment process:
1. SSH to VPS
2. Git pull from specified branch
3. Docker-compose build
4. Docker-compose up -d
5. Health check verification
6. Cleanup old images

### Database Operations

```bash
vps backup              # Create database backup
```

Backup includes:
- PostgreSQL dump
- Timestamp naming
- Compression
- Storage in `/backups` directory

### System Information

```bash
vps info                # System information
vps network             # Network connectivity test
```

## Environment Variables Required

```bash
export VPS_SSH_KEY="~/.ssh/id_rsa"
export VPS_IP="72.61.154.188"
export VPS_USER="root"
```

## GitHub Actions Integration

Two automated workflows:

### deploy-to-vps.yml
- Triggers: Push to main/production branches
- Actions: SSH deployment, container updates, health checks
- Cleanup: Removes old Docker images

### test-integrations.yml
- Triggers: Pull requests
- Tests: VPS connectivity, service health
- Reports: Comments on PRs with test results

## Troubleshooting

Common issues and solutions:

**SSH Connection Failed:**
- Verify VPS_SSH_KEY is set correctly
- Check SSH key permissions (chmod 600)
- Confirm VPS IP is reachable

**Service Not Starting:**
- Check Docker daemon: `vps status docker`
- Review logs: `vps logs <service> --lines 200`
- Verify disk space: `vps health`

**Deployment Failures:**
- Ensure branch exists on remote
- Check Docker compose syntax
- Verify environment variables

## Best Practices

1. **Always run health check before deployment**
   ```bash
   vps-health && vps deploy main
   ```

2. **Create backup before major changes**
   ```bash
   vps backup && vps deploy production
   ```

3. **Monitor logs after deployment**
   ```bash
   vps deploy main && sleep 30 && vps logs n8n
   ```

4. **Use JSON output for automation**
   ```bash
   vps health --json | jq '.services.n8n.status'
   ```
