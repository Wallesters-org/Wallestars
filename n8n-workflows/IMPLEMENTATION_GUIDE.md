# N8N Workflows Implementation Guide

## Overview
This guide provides step-by-step instructions for implementing n8n workflows for Wallestars automation.

## Prerequisites

### 1. Verify Infrastructure
Ensure the following are running:
- ✅ N8N instance at `https://n8n.srv1201204.hstgr.cloud`
- ✅ Wallestars server at `https://srv1201204.hstgr.cloud`
- ✅ PM2 managing both services
- ✅ Nginx reverse proxy configured

### 2. Check Services Status
```bash
# Check PM2 processes
pm2 list

# Check service health
curl http://localhost:3000/api/health
curl http://localhost:5678/healthz

# Test n8n webhooks endpoint
curl http://localhost:3000/api/webhooks/n8n/test
```

## Implementation Steps

### Phase 1: Import Workflows to N8N

#### Step 1: Access N8N Dashboard
1. Open your browser and navigate to: `https://n8n.srv1201204.hstgr.cloud`
2. Log in with your n8n credentials
3. If first time setup:
   - Create admin account
   - Set secure password
   - Configure basic settings

#### Step 2: Import System Health Monitor Workflow
1. In n8n dashboard, click **"Workflows"** in the left sidebar
2. Click **"Add workflow"** button
3. Click the **three dots** menu (⋮) in top right
4. Select **"Import from File"**
5. Upload: `/home/user/Wallestars/n8n-workflows/system-health-monitor.json`
6. Review the workflow nodes
7. Click **"Save"** and name it: `System Health Monitor`

**Important Configurations:**
- The workflow runs every 5 minutes automatically
- Monitors: Wallestars, N8N, disk space, memory usage
- Auto-restarts services if they're down
- Sends alerts to Wallestars dashboard

#### Step 3: Import GitHub Automation Workflow
1. Click **"Add workflow"** again
2. Import: `/home/user/Wallestars/n8n-workflows/github-automation.json`
3. Name it: `GitHub Automation`

**Important Configurations:**
- Requires GitHub OAuth2 credentials (see Step 4)
- Listens for GitHub webhooks
- Runs scheduled check every 15 minutes
- Monitors agent PRs and issues

#### Step 4: Configure GitHub Credentials

##### Create GitHub Personal Access Token:
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click **"Generate new token (classic)"**
3. Name: `n8n-wallestars-automation`
4. Select scopes:
   - `repo` (Full control of private repositories)
   - `admin:repo_hook` (Full control of repository hooks)
   - `read:org` (Read org and team membership)
5. Generate and **copy the token**

##### Add to N8N:
1. In n8n, go to **"Credentials"** in left sidebar
2. Click **"Add credential"**
3. Search for **"GitHub OAuth2 API"**
4. Configure:
   - **Credential Name**: `GitHub OAuth2`
   - **Access Token**: Paste your GitHub token
   - **Test**: Click "Test credentials"
5. Save

#### Step 5: Configure GitHub Webhook

##### Get Webhook URL:
1. In n8n, open the **GitHub Automation** workflow
2. Click on the **"GitHub Webhook"** node
3. Copy the webhook URL (should look like: `https://n8n.srv1201204.hstgr.cloud/webhook/github-webhook`)

##### Set up in GitHub Repository:
1. Go to: `https://github.com/Wallesters-org/Wallestars`
2. Click **Settings** → **Webhooks** → **Add webhook**
3. Configure:
   - **Payload URL**: Your n8n webhook URL
   - **Content type**: `application/json`
   - **Secret**: (optional, for security)
   - **Events**: Select individual events:
     - ✅ Pull requests
     - ✅ Issues
     - ✅ Issue comments
     - ✅ Pull request reviews
4. Click **Add webhook**
5. Test the webhook

#### Step 6: Activate Workflows
1. Open each workflow in n8n
2. Toggle the **"Active"** switch in the top right
3. Confirm workflows are running:
   - System Health Monitor: Should show as "Active"
   - GitHub Automation: Should show as "Active"

### Phase 2: Verify Integration

#### Test System Health Monitor
```bash
# Wait 5 minutes for first execution or trigger manually in n8n
# Check if health data is being received
curl http://localhost:3000/api/webhooks/n8n/health-report/latest

# Check alerts
curl http://localhost:3000/api/webhooks/n8n/alerts

# View dashboard summary
curl http://localhost:3000/api/webhooks/n8n/dashboard
```

**Expected Response:**
```json
{
  "timestamp": "2026-01-12T...",
  "overallStatus": "healthy",
  "services": {
    "wallestars": {
      "status": "up",
      "statusCode": 200
    },
    "n8n": {
      "status": "up",
      "statusCode": 200
    }
  },
  "resources": {
    "disk": { "usage": 45, "status": "ok" },
    "memory": { "usage": 62, "status": "ok" }
  }
}
```

#### Test GitHub Automation
```bash
# Create a test issue on GitHub
gh issue create --title "Test n8n integration" --body "Testing automation" --label "test"

# Check if event was received
curl http://localhost:3000/api/webhooks/n8n/github-events?limit=5

# Check agent activity
curl http://localhost:3000/api/webhooks/n8n/agent-activity
```

#### Test Workflow Manually
1. Go to n8n dashboard
2. Open **System Health Monitor** workflow
3. Click **"Execute Workflow"** button
4. Monitor execution in real-time
5. Check for any errors
6. Verify data appears in Wallestars API

### Phase 3: Monitor and Debug

#### View Workflow Executions
1. In n8n, click **"Executions"** in left sidebar
2. See all workflow runs with status (success/error)
3. Click any execution to see detailed logs
4. Debug any failures

#### Check N8N Logs
```bash
# View n8n logs
pm2 logs n8n

# View error logs
tail -f /var/www/wallestars/logs/n8n-err.log

# View output logs
tail -f /var/www/wallestars/logs/n8n-out.log
```

#### Check Wallestars Logs
```bash
# View server logs
pm2 logs wallestars

# Check health monitoring
tail -f /var/log/wallestars-health.log
```

#### Common Issues and Solutions

**Issue 1: Workflow not executing**
- Check if workflow is activated (toggle switch)
- Verify schedule trigger is configured correctly
- Check n8n service status: `pm2 status n8n`

**Issue 2: GitHub webhook not triggering**
- Verify webhook URL in GitHub settings
- Check webhook delivery status in GitHub
- Ensure n8n is accessible at the webhook URL
- Check Nginx configuration for n8n

**Issue 3: API endpoint not receiving data**
- Verify Wallestars server is running: `pm2 status wallestars`
- Check endpoint URL in workflow nodes
- Test endpoint manually with curl
- Check server logs for errors

**Issue 4: Service restart not working**
- Verify PM2 is running
- Check PM2 process names match configuration
- Ensure workflow has permission to execute commands
- Check system logs: `journalctl -u pm2-*`

### Phase 4: Advanced Configuration

#### Add Email Notifications (Optional)
1. In n8n, add a new credential for SMTP
2. Create email notification sub-workflow
3. Modify workflows to send emails on critical alerts

#### Add Slack Integration (Optional)
1. Create Slack webhook URL in your workspace
2. Add Slack credential in n8n
3. Add Slack notification nodes to workflows

#### Database Integration (Optional)
For production, replace in-memory storage with database:
1. Set up PostgreSQL or MongoDB
2. Add database credential in n8n
3. Add database nodes to workflows
4. Store health reports, events, and alerts in DB

#### Custom Workflows
Create additional workflows for:
- **Deployment Automation**: Auto-deploy on git push
- **User Analytics**: Track user activity
- **Backup Automation**: Schedule regular backups
- **SSL Certificate Monitoring**: Alert before expiration
- **Performance Monitoring**: Track response times

### Phase 5: Production Checklist

Before going live:
- [ ] All workflows imported and activated
- [ ] GitHub webhook configured and tested
- [ ] Credentials securely stored
- [ ] Health monitor running every 5 minutes
- [ ] Alerts being sent to dashboard
- [ ] Service auto-restart working
- [ ] GitHub events being captured
- [ ] Agent activity tracked
- [ ] Logs properly configured
- [ ] Error handling tested
- [ ] Backup strategy in place
- [ ] Documentation updated
- [ ] Team trained on monitoring dashboards

## Monitoring Dashboard

### Access Real-time Data
- **Health Status**: `GET /api/webhooks/n8n/health-report/latest`
- **All Health Reports**: `GET /api/webhooks/n8n/health-report/all?limit=20`
- **Critical Alerts**: `GET /api/webhooks/n8n/alerts?severity=critical`
- **Recent GitHub Events**: `GET /api/webhooks/n8n/github-events?limit=10`
- **Agent Activity**: `GET /api/webhooks/n8n/agent-activity`
- **Dashboard Summary**: `GET /api/webhooks/n8n/dashboard`

### WebSocket Events
Connect to Wallestars WebSocket to receive real-time updates:
- `n8n:alert` - Fired when new alert received
- `n8n:github-event` - Fired when GitHub event received
- `n8n:agent-activity` - Fired when agent activity updated

## Security Considerations

### 1. Secure N8N Access
```bash
# Set strong admin password
# Enable 2FA if available
# Restrict access by IP (via Nginx)
# Use HTTPS only
# Regular security updates
```

### 2. Protect Webhook Endpoints
Add webhook verification in production:
- GitHub webhook secret
- Request signature validation
- Rate limiting
- IP whitelist

### 3. Credential Management
- Never commit credentials to git
- Use environment variables
- Rotate secrets regularly
- Use n8n's encrypted credential storage

### 4. Monitor Access
```bash
# Check Nginx access logs
tail -f /var/log/nginx/n8n_access.log

# Monitor failed login attempts
# Set up alerts for suspicious activity
```

## Backup and Recovery

### Backup N8N Data
```bash
# Backup workflows (automated in this repo)
# Run this weekly
cd /home/user/Wallestars/n8n-workflows
# Workflows are already exported as JSON files

# Backup n8n database (if using persistent storage)
# Check n8n data directory
ls -la ~/.n8n/

# Create backup
tar -czf n8n-backup-$(date +%Y%m%d).tar.gz ~/.n8n/
```

### Restore Workflows
1. Access n8n dashboard
2. Import workflow JSON files from `/home/user/Wallestars/n8n-workflows/`
3. Reconfigure credentials
4. Reactivate workflows

## Performance Optimization

### Monitor Resource Usage
```bash
# Check n8n memory usage
pm2 show n8n

# Monitor CPU usage
top -p $(pm2 pid n8n)
```

### Optimize Workflows
- Use sub-workflows for reusable logic
- Limit workflow execution history
- Clean up old execution data regularly
- Use appropriate timeout values
- Enable workflow queueing for high load

## Support and Troubleshooting

### Get Help
- N8N Documentation: https://docs.n8n.io/
- Community Forum: https://community.n8n.io/
- GitHub Issues: https://github.com/Wallesters-org/Wallestars/issues

### Debug Mode
Enable verbose logging in n8n:
```bash
# Edit ecosystem.config.js
# Add to n8n env:
N8N_LOG_LEVEL: 'debug'

# Restart n8n
pm2 restart n8n
```

## Next Steps

1. **Monitor workflows** for 24-48 hours to ensure stability
2. **Create custom dashboards** in Wallestars UI to visualize data
3. **Add more workflows** based on team needs
4. **Train team members** on using and monitoring the system
5. **Schedule regular reviews** of workflow performance
6. **Iterate and improve** based on real-world usage

## Conclusion

You now have a fully automated monitoring and management system for Wallestars using n8n. The system will:
- ✅ Monitor health of all services every 5 minutes
- ✅ Auto-restart failed services
- ✅ Track all GitHub activity
- ✅ Monitor agent sessions
- ✅ Send real-time alerts
- ✅ Provide comprehensive dashboard data

Continue to monitor, optimize, and expand the automation as needed!
