# 📊 Workflow Status & Automation Guide

**Last Updated:** January 17, 2026  
**Status:** ✅ Fully Operational

## Overview

This document provides a comprehensive overview of all active GitHub Actions workflows, their purposes, schedules, and integration points.

## 🎯 Active Workflows

### 1. CI Workflow (`ci.yml`)
**Status:** ✅ Active  
**Purpose:** Core continuous integration for the application

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch

**Jobs:**
- **test**: Runs tests on Node.js 20.x and 22.x
- **security**: Runs npm audit for security vulnerabilities
- **build**: Builds production artifacts

**Duration:** ~3-5 minutes  
**Dependencies:** npm ci, vitest

---

### 2. PR Automation (`pr-automation.yml`)
**Status:** ✅ Active  
**Purpose:** Automatic PR delegation and code review

**Triggers:**
- PR opened, synchronized, reopened, labeled, ready_for_review
- PR review submitted
- Schedule: Every 15 minutes (`*/15 * * * *`)
- Manual: workflow_dispatch

**Jobs:**
- **delegate-to-agents**: Assigns PRs to agents in rotation
- **auto-review**: Automated code review for common issues
- **notify-n8n**: Sends webhook notifications

**Key Features:**
- 4 agent rotation: copilot-agent-1 through copilot-agent-4
- Detects console.log and debugger statements
- Auto-labels PRs with agent assignments
- Creates instruction comments

**Duration:** ~2-3 minutes  
**N8N Integration:** ✅ Webhooks enabled

---

### 3. Agent Monitoring (`agent-monitoring.yml`)
**Status:** ✅ Active  
**Purpose:** Monitor agent activity and PR health

**Triggers:**
- Schedule: Every 10 minutes (`*/10 * * * *`)
- Manual: workflow_dispatch

**Jobs:**
- **monitor-agents**: Tracks agent activity
- **check-stale-prs**: Identifies PRs without updates (>2 days)
- **create-daily-report**: Generates daily summary (09:00 UTC)

**Key Features:**
- Agent activity tracking
- Stale PR detection
- Automated alerts
- Daily reports as GitHub issues

**Duration:** ~1-2 minutes  
**N8N Integration:** ✅ Webhooks enabled

---

### 4. Testing Automation (`testing-automation.yml`)
**Status:** ✅ Active  
**Purpose:** Comprehensive testing across multiple environments

**Triggers:**
- PR opened, synchronized, reopened
- Push to `main` or `develop` branches
- Schedule: Every 30 minutes (`*/30 * * * *`)
- Manual: workflow_dispatch

**Jobs:**
- **run-tests**: Matrix testing (unit, integration, e2e) on Node.js 20.x and 22.x
- **code-quality**: ESLint and formatting checks
- **security-scan**: npm audit and dependency review
- **build-verification**: Validates production build
- **create-test-session**: Creates test session issues for PRs
- **notify-results**: Sends results to N8N

**Test Matrix:**
| Type | Status |
|------|--------|
| Unit | ✅ Configured |
| Integration | ⏳ Placeholder |
| E2E | ⏳ Placeholder |

**Duration:** ~5-7 minutes  
**N8N Integration:** ✅ Webhooks enabled

---

### 5. Active PR Session Manager (`pr-active-session-manager.yml`) 🆕
**Status:** ✅ Active  
**Purpose:** Real-time PR session tracking and auto-merge

**Triggers:**
- PR opened, synchronized, reopened, ready_for_review, review_requested
- PR review submitted or dismissed
- Check suite completed
- Schedule: Every 10 minutes (`*/10 * * * *`)
- Manual: workflow_dispatch (with optional PR number)

**Jobs:**
- **track-active-sessions**: Monitors all open PRs
- **auto-merge-ready-prs**: Automatically merges approved PRs
- **health-check**: Analyzes PR health metrics
- **notify-webhook**: Sends session data to N8N

**Auto-Merge Criteria:**
- ✅ Has `auto-merge` or `ready-to-merge` label
- ✅ At least 1 approving review
- ✅ No changes requested
- ✅ All checks passing
- ✅ PR is mergeable (no conflicts)

**Health Monitoring:**
- Stale PRs (>7 days)
- Merge conflicts
- PRs needing attention (changes requested >2 days)
- Automated health alert issues

**Duration:** ~3-4 minutes  
**N8N Integration:** ✅ Webhooks enabled  
**Auto-Merge:** ✅ Enabled (squash method)

---

### 6. MCP Workflow Orchestrator (`mcp-workflow-orchestrator.yml`) 🆕
**Status:** ✅ Active  
**Purpose:** Coordinate all workflows and MCP integration

**Triggers:**
- PR opened, synchronized, reopened, ready_for_review
- Push to `main` or `develop` branches
- Schedule: Every 20 minutes (`*/20 * * * *`)
- Manual: workflow_dispatch (with full_scan option)

**Jobs:**
- **orchestrate-workflows**: Coordinates all automation
- **mcp-integration-check**: Validates MCP configuration
- **notify-completion**: Sends orchestration summary

**MCP Tools Validated:**
- ✅ claude_ai (Claude AI integration)
- ✅ computer_use (Linux desktop control)
- ✅ android_control (Android device automation)
- ✅ github_api (GitHub API access)
- ✅ n8n_webhooks (N8N integration)
- ✅ supabase_db (Database access)

**Orchestration Features:**
- Agent workload balancing
- Code quality analysis
- System health scoring (0-100)
- Triggers dependent workflows
- MCP server validation

**Duration:** ~4-5 minutes  
**N8N Integration:** ✅ Webhooks enabled  
**MCP Integration:** ✅ Validated

---

### 7. Azure Web Apps Deployment (`azure-webapps-node.yml`)
**Status:** ⏸️ Conditional (requires Azure setup)  
**Purpose:** Deploy to Azure Web Apps

**Triggers:**
- Push to `main` branch
- Manual: workflow_dispatch

**Jobs:**
- Build and deploy to Azure

**Duration:** ~5-10 minutes  
**Status:** Ready but requires Azure credentials

---

### 8. GitHub Pages Deployment (`deploy-github-pages.yml`)
**Status:** ⏸️ Conditional (static site only)  
**Purpose:** Deploy static frontend to GitHub Pages

**Triggers:**
- Push to `main` branch
- Manual: workflow_dispatch

**Jobs:**
- Build and deploy to GitHub Pages

**Duration:** ~3-5 minutes  
**Note:** Frontend only, no backend functionality

---

## 📈 Workflow Execution Schedule

| Time (UTC) | Workflow | Action |
|------------|----------|--------|
| Every 10 min | Agent Monitoring | Monitor agents & PRs |
| Every 10 min | PR Session Manager | Track & auto-merge |
| Every 15 min | PR Automation | Delegate & review |
| Every 20 min | MCP Orchestrator | Coordinate workflows |
| Every 30 min | Testing Automation | Run test suite |
| 09:00 daily | Agent Monitoring | Generate daily report |

## 🔔 N8N Webhook Endpoints

All workflows integrate with N8N for advanced automation:

| Webhook | Purpose |
|---------|---------|
| `/webhook/pr-delegated` | PR delegation notifications |
| `/webhook/agent-status` | Agent activity updates |
| `/webhook/test-results` | Test execution results |
| `/webhook/github-pr-status` | PR automation status |
| `/webhook/pr-session-update` | PR session changes |
| `/webhook/orchestration-complete` | Orchestration summaries |

**Configuration:** Set `N8N_WEBHOOK_URL` in repository secrets

## 🎯 Auto-Merge Configuration

To enable auto-merge for a PR:

1. Ensure all checks are passing
2. Get at least 1 approving review
3. Add label: `auto-merge` or `ready-to-merge`
4. Wait for next workflow run (every 10 minutes)

**Merge Method:** Squash (preserves clean history)

## 🏥 Health Monitoring

The system monitors:

- **PR Health**
  - Stale PRs (>7 days)
  - Merge conflicts
  - Changes requested but not addressed
  
- **Agent Health**
  - Activity within 1 hour = Active
  - >4 hours = Idle (alert generated)
  
- **System Health**
  - Overall score: 0-100
  - 90-100: Excellent
  - 70-89: Good
  - 50-69: Fair
  - <50: Poor (action required)

## 🔧 Configuration Requirements

### GitHub Secrets

Required secrets for full functionality:

```bash
N8N_WEBHOOK_URL=https://your-n8n-instance.com
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Optional secrets:

```bash
AZURE_WEBAPP_PUBLISH_PROFILE=<azure-credentials>
```

### Repository Settings

Recommended settings:

- **Branch Protection** (main):
  - Require PR reviews (1 minimum)
  - Require status checks to pass
  - Require branches to be up to date
  
- **Actions Permissions**:
  - Allow all actions and reusable workflows
  - Read and write permissions for GitHub token

### Labels

Auto-created labels:

- `agent:copilot-agent-1` through `agent:copilot-agent-4`
- `automated`
- `auto-merge`
- `ready-to-merge`
- `stale`
- `needs-attention`
- `health-alert`
- `merge-conflict`
- `test-session`

## 📊 Monitoring & Reporting

### GitHub Actions Dashboard

View workflow status:
- **Repository → Actions tab**
- Filter by workflow name
- Check execution history
- Review job summaries

### Daily Reports

Automatically generated:
- **Time:** 09:00 UTC daily
- **Format:** GitHub issue
- **Labels:** `report`, `automated`
- **Content:**
  - Open PRs count
  - Merged PRs (last 24h)
  - Agent activity summary

### Health Alerts

Automatically created for:
- Merge conflicts
- Stale PRs
- Inactive agents
- System health issues

**Format:** GitHub issue with `health-alert` label

## 🚀 Getting Started

### For Developers

1. **Create a PR** - Workflow automatically assigns an agent
2. **Get Reviews** - Request reviews from team
3. **Pass Checks** - Ensure all tests pass
4. **Add Label** - Add `auto-merge` when ready
5. **Wait** - Auto-merge happens within 10 minutes

### For Maintainers

1. **Monitor Dashboard** - Check Actions tab regularly
2. **Review Reports** - Check daily report issues
3. **Respond to Alerts** - Address health alerts promptly
4. **Configure Secrets** - Ensure all secrets are set
5. **Adjust Schedules** - Modify cron schedules as needed

## 🔧 Troubleshooting

### Workflow Not Triggering

**Check:**
- Workflow file syntax (YAML)
- Trigger conditions met
- Actions enabled in repository
- No workflow run limits hit

### Auto-Merge Not Working

**Check:**
- PR has `auto-merge` label
- All checks passing
- At least 1 approval
- No changes requested
- PR is mergeable (no conflicts)

### N8N Webhooks Failing

**Check:**
- `N8N_WEBHOOK_URL` secret set
- N8N instance running
- Webhook endpoints configured
- Network connectivity

### Tests Failing

**Check:**
- Dependencies installed correctly
- Test scripts configured in package.json
- Test files present
- Environment variables set

## 📚 Additional Resources

- **AUTOMATION_SYSTEM.md** - Detailed system documentation
- **CONSOLIDATION_ROADMAP.md** - Repository structure plan
- **ARCHITECTURE.md** - System architecture
- **n8n-workflows/** - N8N workflow configurations
- **supabase/** - Database schemas

## 🎯 Future Enhancements

Planned improvements:

- [ ] Integration tests implementation
- [ ] E2E tests with Playwright
- [ ] AI-powered code review suggestions
- [ ] Automated dependency updates
- [ ] Performance benchmarking
- [ ] Visual regression testing
- [ ] Automated changelog generation
- [ ] Release automation

---

**Status Summary:**
- ✅ 6 Active Workflows
- ⏸️ 2 Conditional Workflows
- 🆕 2 New Workflows Added
- 📊 Full N8N Integration
- 🤖 MCP Integration Validated
- 🚀 Auto-Merge Enabled

**Last Validation:** January 17, 2026  
**Next Review:** Monthly
