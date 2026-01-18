# N8N Workflows Architecture for Wallestars

## Overview
This directory contains n8n workflow definitions for automating Wallestars Control Center operations, including the complete **Registry & Verification Architecture** for business verification with Email and SMS OTP workflows.

## 📚 Documentation

### Core Guides
- **[VERIFICATION_WORKFLOWS_GUIDE.md](./VERIFICATION_WORKFLOWS_GUIDE.md)** - Complete guide for Registry & Verification workflows (SMS/Email OTP)
- **[WORKFLOW_VALIDATION_CHECKLIST.md](./WORKFLOW_VALIDATION_CHECKLIST.md)** - Pre-deployment validation checklist
- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - Step-by-step deployment guide
- **[QUICK_START.md](./QUICK_START.md)** - 5-minute quick start
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Implementation summary and status

### Quick Links
- 🔍 **Verification Workflows**: See [VERIFICATION_WORKFLOWS_GUIDE.md](./VERIFICATION_WORKFLOWS_GUIDE.md)
- ✅ **Validation Checklist**: See [WORKFLOW_VALIDATION_CHECKLIST.md](./WORKFLOW_VALIDATION_CHECKLIST.md)
- 🚀 **Deploy**: See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)

## Workflow Structure

### Main Workflows

#### 1. **GitHub Automation Workflow** (`github-automation.json`)
- **Purpose**: Monitor and automate GitHub operations
- **Triggers**:
  - Webhook from GitHub (PR created, issue opened, etc.)
  - Scheduled: Every 15 minutes
- **Actions**:
  - Monitor pull requests and auto-review
  - Track agent sessions in issues
  - Auto-label and categorize issues
  - Send notifications to Wallestars dashboard
  - Auto-approve PRs from trusted agents

#### 2. **Registry Local Worker Workflow** (`registry-local-worker.json`) ⭐ NEW
- **Purpose**: Validate business information via CompanyBook API
- **Triggers**: Webhook (`/webhook/registry-check`)
- **Actions**:
  - Read pending users from Supabase
  - Search CompanyBook API for business information
  - Validate business type (EOOD/ET only)
  - Generate VAT number and 33mail alias
  - Upsert to verified_business_profiles
  - Initiate SMS/Email verification flow
- **Status**: ✅ Fully implemented and documented

#### 3. **SMS Monitor Workflow** (`sms-monitor.json`) ⭐ NEW
- **Purpose**: Capture SMS OTP codes for verification
- **Triggers**: Scheduled every 30 seconds
- **Actions**:
  - Poll Smstome.com API for new SMS
  - Extract OTP codes using regex (4-6 digits)
  - Match phone numbers to pending verifications
  - Update Supabase with verification code
  - Mark SMS as verified
- **Status**: ✅ Fully implemented and documented

#### 4. **Email Monitor Workflow** (`email-monitor.json`) ⭐ NEW
- **Purpose**: Capture email verification codes and links
- **Triggers**: Real-time IMAP watcher (Hostinger)
- **Actions**:
  - Watch INBOX for new emails
  - Extract verification codes and links
  - Match 33mail aliases to profiles
  - Update Supabase with verification data
  - Mark email as verified
- **Status**: ✅ Fully implemented and documented

#### 5. **System Health Monitor Workflow** (`system-health-monitor.json`)
- **Purpose**: Monitor Wallestars and n8n health
- **Triggers**: Scheduled every 5 minutes
- **Actions**:
  - Check Wallestars API health endpoint
  - Check n8n health endpoint
  - Monitor system resources (CPU, memory, disk)
  - Send alerts on failures
  - Auto-restart services via PM2 API
  - Log health status to database

#### 6. **GitHub Automation Workflow** (`github-automation.json`)
- **Purpose**: Monitor and automate GitHub operations
- **Triggers**:
  - Webhook from GitHub (PR created, issue opened, etc.)
  - Scheduled: Every 15 minutes
- **Actions**:
  - Monitor pull requests and auto-review
  - Track agent sessions in issues
  - Auto-label and categorize issues
  - Send notifications to Wallestars dashboard
  - Auto-approve PRs from trusted agents

#### 7. **Deployment Automation Workflow** (`deployment-automation.json`)
- **Purpose**: Automate deployment processes
- **Triggers**:
  - Git push to main branch
  - Manual trigger via API
- **Actions**:
  - Run pre-deployment checks
  - Execute deployment script
  - Run post-deployment health checks
  - Send deployment notifications
  - Rollback on failure

#### 4. **User Activity Analytics Workflow** (`user-analytics.json`)
- **Purpose**: Track and analyze user activity
- **Triggers**: Webhook from Wallestars API
- **Actions**:
  - Log user actions
  - Generate usage metrics
  - Create daily/weekly reports
  - Identify usage patterns
  - Send analytics to dashboard

### Sub-Workflows

#### A. **GitHub PR Review Sub-workflow** (`sub-github-pr-review.json`)
- Called by: GitHub Automation Workflow
- **Actions**:
  - Fetch PR details
  - Check for merge conflicts
  - Validate CI/CD status
  - Check code quality metrics
  - Auto-approve or request changes

#### B. **Alert Notification Sub-workflow** (`sub-alert-notification.json`)
- Called by: Multiple workflows
- **Actions**:
  - Format alert message
  - Send to multiple channels (email, Slack, webhook)
  - Log to Wallestars dashboard
  - Create incident ticket if critical

#### C. **Service Restart Sub-workflow** (`sub-service-restart.json`)
- Called by: System Health Monitor
- **Actions**:
  - Execute PM2 restart command
  - Wait and verify restart
  - Log restart event
  - Send notification

#### D. **Metrics Collection Sub-workflow** (`sub-metrics-collection.json`)
- Called by: Multiple workflows
- **Actions**:
  - Collect system metrics
  - Store in database
  - Update dashboard
  - Trigger alerts on thresholds

## Workflow Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Repository                         │
│  (PRs, Issues, Agent Sessions, Commits)                     │
└────────────────┬────────────────────────────────────────────┘
                 │ Webhooks
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              GitHub Automation Workflow                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ PR Monitoring│  │Issue Tracking│  │Agent Sessions│      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                    Calls Sub-workflows                       │
│                            ▼                                 │
│  ┌────────────────────────────────────────────────────┐     │
│  │  PR Review  │  Alert Notification  │  Metrics      │     │
│  └────────────────────────────────────────────────────┘     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              Wallestars Control Center                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Dashboard   │  │  Alerts      │  │  Logs        │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│           System Health Monitor Workflow                     │
│  (Scheduled: Every 5 minutes)                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Wallestars   │  │  N8N Health  │  │  Resources   │      │
│  │ Health Check │  │  Check       │  │  Monitor     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                   On Failure ▼                               │
│         ┌─────────────────────────────────────┐             │
│         │   Service Restart Sub-workflow      │             │
│         └─────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

## API Endpoints for n8n Integration

### Wallestars API Endpoints
- `GET /api/health` - Health check
- `POST /api/webhooks/n8n/alert` - Receive alerts from n8n
- `POST /api/webhooks/n8n/metrics` - Receive metrics
- `GET /api/system/status` - Get system status
- `POST /api/deployments/trigger` - Trigger deployment

### N8N Webhook Endpoints
- `POST /webhook/github-event` - Receive GitHub webhooks
- `POST /webhook/health-alert` - Receive health alerts
- `POST /webhook/deployment` - Trigger deployment workflow
- `POST /webhook/user-activity` - Log user activity

## Environment Variables Required

```env
# N8N Configuration
N8N_PORT=5678
N8N_HOST=localhost
N8N_PROTOCOL=https
WEBHOOK_URL=https://n8n.srv1201204.hstgr.cloud/
GENERIC_TIMEZONE=UTC

# GitHub Integration
GITHUB_TOKEN=<github_personal_access_token>
GITHUB_OWNER=Wallesters-org
GITHUB_REPO=Wallestars

# Wallestars Integration
WALLESTARS_API_URL=https://srv1201204.hstgr.cloud/api
WALLESTARS_WEBHOOK_SECRET=<webhook_secret>

# PM2 Integration (for service management)
PM2_API_URL=http://localhost:9615

# Alert Channels
SLACK_WEBHOOK_URL=<slack_webhook_url>
EMAIL_SMTP_HOST=<smtp_host>
EMAIL_SMTP_PORT=587
EMAIL_FROM=<from_email>
EMAIL_TO=<to_email>
```

## Implementation Priority

### Phase 1: Foundation (Week 1)
1. ✅ System Health Monitor Workflow
2. ✅ Alert Notification Sub-workflow
3. ✅ Service Restart Sub-workflow

### Phase 2: GitHub Integration (Week 2)
4. GitHub Automation Workflow
5. PR Review Sub-workflow
6. Metrics Collection Sub-workflow

### Phase 3: Advanced Features (Week 3)
7. Deployment Automation Workflow
8. User Activity Analytics Workflow

## Testing Strategy

### 1. Unit Testing
- Test each node individually
- Verify API connections
- Validate data transformations

### 2. Integration Testing
- Test workflow end-to-end
- Verify sub-workflow calls
- Test error handling

### 3. Load Testing
- Simulate high webhook traffic
- Test concurrent executions
- Monitor resource usage

## Monitoring & Maintenance

### Metrics to Track
- Workflow execution count
- Success/failure rate
- Average execution time
- Resource usage
- Alert frequency

### Logs Location
- N8N logs: `/var/www/wallestars/logs/n8n-out.log`
- Error logs: `/var/www/wallestars/logs/n8n-err.log`
- Health check logs: `/var/log/wallestars-health.log`

## Backup & Recovery

### Workflow Backup
- Export workflows weekly
- Store in git repository
- Version control all changes

### Credentials Backup
- Store credentials securely
- Use environment variables
- Never commit secrets

## Next Steps

1. Create workflow JSON definitions
2. Configure GitHub webhooks
3. Set up Wallestars API endpoints
4. Test workflows in n8n UI
5. Deploy to production
6. Monitor and iterate
