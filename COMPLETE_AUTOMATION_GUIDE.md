# Complete Automation System Guide

**Version:** 2.0.0  
**Last Updated:** January 17, 2026  
**Status:** ✅ Active

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Workflow Architecture](#workflow-architecture)
3. [PR Session Management](#pr-session-management)
4. [MCP Integration](#mcp-integration)
5. [Monitoring & Health](#monitoring--health)
6. [Master Orchestrator](#master-orchestrator)
7. [Configuration](#configuration)
8. [Usage Guide](#usage-guide)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

---

## 🎯 Overview

The Wallestars automation system provides comprehensive CI/CD, PR management, testing, and monitoring through an integrated workflow ecosystem.

### Key Components

- **PR Session Management** - Complete PR lifecycle automation
- **Agent Monitoring** - Agent activity tracking and health checks
- **Testing Automation** - Automated test execution and reporting
- **MCP Enhanced Automation** - Claude AI integration testing
- **Master Orchestrator** - Central workflow coordination

### Benefits

✅ **Automated PR Management** - From creation to merge  
✅ **Real-time Monitoring** - Agent and system health tracking  
✅ **Comprehensive Testing** - Unit, integration, and E2E tests  
✅ **MCP Integration** - Claude Desktop connectivity  
✅ **Centralized Control** - Master orchestrator for all workflows  

---

## 🏗️ Workflow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Master Automation Orchestrator                  │
│  (Central coordination and health monitoring)               │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┼───────────┬──────────────┐
         │           │           │              │
┌────────▼─────┐ ┌──▼────────┐ ┌▼──────────┐  ┌▼────────────┐
│ PR Session   │ │  Agent    │ │  Testing  │  │    MCP      │
│ Management   │ │ Monitoring│ │Automation │  │ Enhanced    │
└────────┬─────┘ └──┬────────┘ └┬──────────┘  └┬────────────┘
         │          │            │               │
         └──────────┴────────────┴───────────────┘
                     │
         ┌───────────▼───────────┐
         │    N8N Webhooks       │
         │  Supabase Database    │
         └───────────────────────┘
```

### Workflow Hierarchy

1. **Master Orchestrator** (Top Level)
   - Triggers and coordinates all other workflows
   - Monitors system health
   - Generates daily reports

2. **Core Workflows** (Mid Level)
   - PR Session Management
   - Agent Monitoring
   - Testing Automation
   - MCP Enhanced Automation

3. **Support Services** (Base Level)
   - N8N webhook integration
   - Supabase data persistence
   - GitHub Actions API

---

## 🔄 PR Session Management

### Purpose
Manages the complete lifecycle of pull requests from creation to merge.

### Features

#### Session Initialization
- Creates tracking issue for each PR
- Assigns agent by rotation
- Sets up automation checklist
- Notifies n8n system

#### Automation Pipeline
- **Linting** - Code style checks
- **Testing** - Unit/integration/E2E tests
- **Security** - npm audit and dependency review
- **Build** - Production build verification

#### Health Monitoring
- Checks PR activity every 5 minutes
- Marks stale PRs (>24 hours inactive)
- Auto-closes inactive sessions (>48 hours)
- Sends alerts for attention needed

#### Auto-Merge
- Verifies all checks pass
- Ensures approvals received
- Checks for merge conflicts
- Executes merge with squash

### Workflow File
`.github/workflows/pr-session-management.yml`

### Triggers
- `pull_request` events (opened, synchronize, reopened, closed)
- `pull_request_review` events
- `issue_comment` events
- Schedule: Every 5 minutes
- Manual dispatch

### Configuration

```yaml
permissions:
  contents: write
  pull-requests: write
  issues: write
  checks: write
  statuses: write
```

### Usage

#### Automatic
PR sessions are automatically initialized when a PR is opened:

```
1. Developer opens PR
2. Workflow creates session tracking issue
3. Automation pipeline runs
4. Results posted to PR
5. Health monitoring begins
```

#### Manual Trigger
```bash
# Trigger for specific PR
gh workflow run pr-session-management.yml -f pr_number=123
```

### Session Tracking

Each PR session creates a tracking issue with:
- Session ID
- Automation checklist
- Activity log
- Health status
- Results summary

### Labels

- `pr-session` - Session tracking issue
- `active` - Currently active session
- `stale` - Inactive for >24 hours
- `auto-merge` - Enable automatic merge
- `completed` - Session closed
- `merged` - PR was merged
- `inactive` - Closed due to inactivity

---

## 🤖 MCP Integration

### Purpose
Ensures Model Context Protocol integration with Claude Desktop works correctly.

### Features

#### Integration Testing
- Tests MCP server startup
- Validates configuration files
- Checks endpoint availability
- Generates test reports

#### PR Synchronization
- Detects MCP-related changes
- Updates PR with MCP status
- Provides testing instructions
- Links documentation

#### Tool Documentation
- Auto-generates MCP tools reference
- Updates API documentation
- Creates usage examples
- Maintains changelog

#### Configuration Validation
- Validates `.mcp.json` structure
- Checks example configuration
- Verifies environment variables
- Tests JSON syntax

### Workflow File
`.github/workflows/mcp-enhanced-automation.yml`

### Triggers
- Manual dispatch with action selection
- Schedule: Every hour
- PR changes to MCP files

### Actions

#### `test-mcp-integration`
Comprehensive MCP server testing:
```bash
gh workflow run mcp-enhanced-automation.yml \
  -f action=test-mcp-integration
```

#### `sync-pr-with-mcp`
Update PR with MCP status:
```bash
gh workflow run mcp-enhanced-automation.yml \
  -f action=sync-pr-with-mcp \
  -f pr_number=123
```

#### `update-mcp-tools`
Generate tools documentation:
```bash
gh workflow run mcp-enhanced-automation.yml \
  -f action=update-mcp-tools
```

#### `validate-mcp-config`
Validate all MCP configurations:
```bash
gh workflow run mcp-enhanced-automation.yml \
  -f action=validate-mcp-config
```

### MCP Files Monitored

- `.mcp.json` - MCP server configuration
- `claude_desktop_config.json.example` - Example config
- `server/index.js` - MCP server implementation
- `server/routes/*` - API endpoints
- `MCP_SETUP.md` - Setup documentation

### Testing Checklist

- [x] Server starts successfully
- [x] Configuration is valid JSON
- [x] All endpoints respond
- [x] Environment variables documented
- [x] Example config has placeholders
- [x] Documentation is up to date

---

## 📊 Monitoring & Health

### Agent Monitoring

**Workflow:** `.github/workflows/agent-monitoring.yml`

#### Features
- Monitors 4 Copilot agents
- Tracks PR assignments
- Detects inactive agents
- Generates daily reports
- Creates alerts for issues

#### Schedule
- Every 10 minutes: Activity check
- Daily at 09:00 UTC: Full report
- Manual dispatch: On-demand

#### Agent Status

| Status | Criteria | Action |
|--------|----------|--------|
| 🟢 Active | Activity <1 hour | None |
| 🟡 Idle | Activity 1-24 hours | Monitor |
| 🔴 Inactive | Activity >24 hours | Alert |

#### Stale PR Detection
- Marks PRs inactive for >2 days
- Adds `stale` label
- Posts reminder comment
- Notifies assigned agent

### Testing Automation

**Workflow:** `.github/workflows/testing-automation.yml`

#### Test Matrix
- **Node Versions:** 20.x, 22.x
- **Test Suites:** Unit, Integration, E2E
- **Platforms:** Ubuntu latest

#### Checks
1. **Code Quality**
   - ESLint
   - Code formatting
   - Type checking

2. **Security**
   - npm audit
   - Dependency review
   - Vulnerability scanning

3. **Build Verification**
   - Production build
   - Artifact validation
   - Deploy readiness

#### Test Session
Creates issue for PR with:
- Test checklist
- Results tracking
- Status updates
- Links to reports

---

## 🎛️ Master Orchestrator

### Purpose
Central coordination point for all automation workflows.

### Workflow File
`.github/workflows/master-automation-orchestrator.yml`

### Capabilities

#### Workflow Coordination
Trigger workflows by category:
- `all-workflows` - Run everything
- `pr-workflows` - PR management only
- `monitoring-workflows` - Monitoring only
- `mcp-workflows` - MCP testing only
- `testing-workflows` - Testing only

#### System Health Check
Daily comprehensive health report:
- Open issues count
- Open PRs count
- Stale PRs detection
- Failed workflow runs
- Overall health score

Health scoring:
- **100 points** - Perfect health
- **-5 points** - Per failed workflow
- **-10 points** - Per stale PR
- **-20 points** - If >50 open issues

Status levels:
- 🟢 **Healthy** (>80 points)
- 🟡 **Fair** (60-80 points)
- 🔴 **Needs Attention** (<60 points)

#### Result Aggregation
- Collects all workflow results
- Calculates success rates
- Generates daily summaries
- Sends webhook notifications

#### Cleanup
- Deletes workflow runs >30 days
- Keeps failed runs for analysis
- Maintains recent history
- Frees GitHub storage

### Usage

#### Trigger All Workflows
```bash
gh workflow run master-automation-orchestrator.yml \
  -f target=all-workflows
```

#### Trigger PR Workflows Only
```bash
gh workflow run master-automation-orchestrator.yml \
  -f target=pr-workflows \
  -f pr_number=123
```

#### Manual Health Check
```bash
gh workflow run master-automation-orchestrator.yml \
  -f target=all-workflows
```

### Schedule
- **Daily at 00:00 UTC** - Complete health check
- **Manual dispatch** - On-demand execution

---

## ⚙️ Configuration

### GitHub Secrets

Required secrets in repository settings:

```bash
N8N_WEBHOOK_URL=https://your-n8n-instance.com
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### Environment Variables

In workflow files:

```yaml
env:
  ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
  N8N_WEBHOOK_URL: ${{ secrets.N8N_WEBHOOK_URL }}
  NODE_ENV: production
```

### N8N Webhook Endpoints

Configure these in your N8N instance:

```
/webhook/pr-session-start
/webhook/pr-session-end
/webhook/pr-delegated
/webhook/agent-status
/webhook/test-results
/webhook/automation-summary
```

### Supabase Tables

Required database tables:

- `pr_tracking` - PR session data
- `test_results` - Test execution results
- `agent_activity_log` - Agent activity
- `workflow_execution_log` - Workflow runs
- `alert_history` - System alerts

---

## 📖 Usage Guide

### For Developers

#### Creating a PR
1. Create PR as normal
2. Session automatically initialized
3. Automation pipeline runs
4. Review results in PR comments
5. Address any issues
6. Get approval
7. PR auto-merges (if enabled)

#### Enabling Auto-Merge
Add `auto-merge` label to PR:
```bash
gh pr edit 123 --add-label auto-merge
```

#### Checking PR Status
View session tracking issue linked in PR comments.

### For Maintainers

#### Running Health Checks
```bash
# Full system check
gh workflow run master-automation-orchestrator.yml

# PR workflows only
gh workflow run master-automation-orchestrator.yml \
  -f target=pr-workflows
```

#### Viewing Reports
Check Actions tab → Workflow runs → Job summaries

#### Managing Stale PRs
1. Review stale PR list
2. Contact PR author
3. Request updates
4. Close if abandoned

### For Agents

#### Checking Assignments
View issues with label `agent:copilot-agent-X`

#### Responding to Alerts
1. Review alert in issue
2. Check assigned PRs
3. Take action
4. Update status

---

## 🔧 Troubleshooting

### Common Issues

#### Workflow Not Triggering

**Problem:** Workflow doesn't run automatically

**Solutions:**
1. Check workflow file syntax: `yamllint workflow.yml`
2. Verify permissions in workflow file
3. Check branch protection rules
4. Review Actions tab for errors

#### PR Session Not Created

**Problem:** No tracking issue created for PR

**Solutions:**
1. Check if PR is draft (drafts skipped)
2. Verify workflow permissions
3. Check GitHub Actions logs
4. Manually trigger workflow

#### MCP Tests Failing

**Problem:** MCP integration tests fail

**Solutions:**
1. Verify `ANTHROPIC_API_KEY` secret set
2. Check server code syntax
3. Validate `.mcp.json` format
4. Review server startup logs

#### N8N Webhooks Not Working

**Problem:** N8N not receiving events

**Solutions:**
1. Verify `N8N_WEBHOOK_URL` secret
2. Test webhook URL manually
3. Check N8N workflow is active
4. Review N8N execution logs

### Debug Mode

Enable verbose logging:

```yaml
- name: Debug Step
  run: |
    set -x  # Enable debug output
    # Your commands
  env:
    DEBUG: true
```

### Getting Help

1. Check [Actions tab](../../actions) for workflow runs
2. Review job logs for errors
3. Check [Issues](../../issues) for known problems
4. Create issue with `support` label

---

## 💡 Best Practices

### For PR Authors

✅ **Do:**
- Write clear PR descriptions
- Keep PRs focused and small
- Respond to review comments
- Fix failing checks promptly
- Keep PRs up to date

❌ **Don't:**
- Leave PRs as draft indefinitely
- Ignore automated checks
- Force push without reason
- Merge without approval
- Remove automation labels

### For Reviewers

✅ **Do:**
- Review PRs within 24 hours
- Provide constructive feedback
- Use PR templates
- Check automated results
- Approve when ready

❌ **Don't:**
- Leave reviews incomplete
- Ignore test failures
- Skip security checks
- Bypass automation
- Merge with conflicts

### For Maintainers

✅ **Do:**
- Monitor system health daily
- Review automation reports
- Update workflows regularly
- Test changes in branches
- Document workflow changes

❌ **Don't:**
- Disable workflows without reason
- Skip health checks
- Ignore alerts
- Modify running workflows
- Delete workflow history

---

## 📈 Metrics & Analytics

### Key Metrics

Track these metrics in Supabase:

- **PR Cycle Time** - Time from open to merge
- **Test Pass Rate** - Percentage of tests passing
- **Workflow Success Rate** - Successful runs percentage
- **Agent Response Time** - Time to first response
- **Health Score** - Overall system health
- **Automation Coverage** - PRs with full automation

### Analytics Queries

```sql
-- Average PR cycle time
SELECT AVG(merged_at - created_at) as avg_cycle_time
FROM pr_tracking
WHERE merged = true;

-- Test success rate (last 30 days)
SELECT 
  COUNT(*) FILTER (WHERE all_passed = true) * 100.0 / COUNT(*) as success_rate
FROM test_results
WHERE timestamp > NOW() - INTERVAL '30 days';

-- Agent performance
SELECT 
  agent_name,
  total_prs_assigned,
  total_prs_completed,
  success_rate
FROM agent_metrics
ORDER BY success_rate DESC;
```

---

## 🚀 Future Enhancements

### Planned Features

- [ ] **AI-Powered Code Review** - Claude analyzes PRs
- [ ] **Automatic Conflict Resolution** - AI resolves merge conflicts
- [ ] **Predictive Health Monitoring** - ML-based issue prediction
- [ ] **Cross-Repository Workflows** - Multi-repo coordination
- [ ] **Advanced Metrics Dashboard** - Real-time visualization
- [ ] **Self-Healing Workflows** - Auto-fix common issues

### Roadmap

**Q1 2026:**
- Enhanced MCP integration
- Repository consolidation
- Advanced monitoring

**Q2 2026:**
- AI code review
- Automatic conflict resolution
- Metrics dashboard

**Q3 2026:**
- Cross-repo workflows
- Self-healing capabilities
- Advanced analytics

---

## 📞 Support

### Documentation
- [Architecture](ARCHITECTURE.md)
- [MCP Setup](MCP_SETUP.md)
- [Repository Consolidation](REPOSITORY_CONSOLIDATION_ROADMAP.md)
- [Automation System](/.github/AUTOMATION_SYSTEM.md)

### Contact
- **GitHub Issues:** For bugs and feature requests
- **GitHub Discussions:** For questions and ideas
- **Team Channel:** For urgent support

---

**Document Maintainer:** DevOps Team  
**Last Updated:** January 17, 2026  
**Next Review:** February 1, 2026
