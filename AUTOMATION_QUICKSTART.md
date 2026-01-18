# 🚀 Quick Start: Automation & Workflows

This guide helps you quickly understand and use the Wallestars automation system.

## For PR Authors

### Creating a PR

1. **Open your PR** - It will be automatically assigned to an agent
2. **Check the comment** - Auto-generated instructions appear
3. **Review the labels** - You'll see `agent:copilot-agent-X` and `automated`

### Getting it Merged

```
┌─────────────────────────────────────┐
│  Create PR                         │
│  ↓                                 │
│  Auto-assigned to Agent            │
│  ↓                                 │
│  Request Reviews                   │
│  ↓                                 │
│  Wait for Approval                 │
│  ↓                                 │
│  All Checks Pass ✅                │
│  ↓                                 │
│  Add "auto-merge" label            │
│  ↓                                 │
│  Auto-merged in ~10 min 🚀         │
└─────────────────────────────────────┘
```

### Auto-Merge Checklist

Add the `auto-merge` label when:
- ✅ At least 1 approval received
- ✅ All CI checks passing
- ✅ No changes requested
- ✅ No merge conflicts
- ✅ Ready to merge!

**Merge happens automatically within 10 minutes!**

## For Reviewers

### Your Responsibilities

1. **Check assigned PRs** - Look for your agent label
2. **Review code** - Focus on quality and correctness
3. **Approve or request changes** - Use GitHub review system
4. **Monitor your workload** - Check daily reports

### Quick Review Commands

```bash
# Get your assigned PRs
gh pr list --label "agent:copilot-agent-1"

# Review a PR
gh pr checkout <number>
gh pr review --approve
# or
gh pr review --request-changes --body "Please fix X"
```

## For Maintainers

### Daily Tasks

**Morning (09:00 UTC):**
- Check daily report issue (auto-generated)
- Review agent activity
- Check for stale PRs

**Throughout the day:**
- Monitor health alerts
- Respond to merge conflicts
- Address system issues

### Quick Commands

```bash
# Trigger workflows manually
gh workflow run pr-automation.yml
gh workflow run agent-monitoring.yml
gh workflow run pr-active-session-manager.yml

# Check workflow status
gh run list --workflow=pr-automation.yml

# View workflow logs
gh run view <run-id> --log
```

## Workflow Overview

| Workflow | Frequency | Purpose |
|----------|-----------|---------|
| CI | On PR/Push | Build & test |
| PR Automation | Every 15 min | Assign agents |
| Agent Monitoring | Every 10 min | Track activity |
| Testing | Every 30 min | Run tests |
| PR Session Manager | Every 10 min | Auto-merge |
| MCP Orchestrator | Every 20 min | Coordinate all |

## Common Scenarios

### Scenario 1: PR is Stuck

**Symptoms:** PR not moving forward

**Check:**
1. Is agent active? (Check agent-monitoring)
2. Are checks passing? (Check Actions tab)
3. Any reviews requested? (Check PR page)
4. Merge conflicts? (Check PR status)

**Action:**
- Ping agent in comments
- Request additional review
- Resolve conflicts
- Check workflow logs

### Scenario 2: Auto-Merge Not Working

**Symptoms:** PR not auto-merged despite approval

**Check:**
1. Does PR have `auto-merge` label?
2. All checks passing?
3. At least 1 approval?
4. No changes requested?
5. Mergeable (no conflicts)?

**Action:**
- Add missing label
- Wait for checks
- Get approval
- Resolve conflicts
- Wait 10 minutes for next run

### Scenario 3: Tests Failing

**Symptoms:** CI showing red X

**Check:**
1. View workflow logs
2. Identify failing test
3. Check recent changes

**Action:**
- Fix the failing test
- Push fix to PR
- Wait for re-run

### Scenario 4: Agent Inactive

**Symptoms:** No agent activity, health alert created

**Check:**
1. Agent's last activity (agent-monitoring)
2. Assigned PR count
3. Recent comments

**Action:**
- Reassign PR to another agent
- Contact team lead
- Adjust agent workload

## Labels Reference

| Label | Meaning | Added By |
|-------|---------|----------|
| `agent:copilot-agent-X` | Assigned agent | Automation |
| `automated` | Automated system | Automation |
| `auto-merge` | Ready for auto-merge | Manual |
| `ready-to-merge` | Alternative to auto-merge | Manual |
| `stale` | No activity >7 days | Automation |
| `needs-attention` | Action required | Automation |
| `health-alert` | System issue | Automation |
| `merge-conflict` | Has conflicts | Automation |
| `test-session` | Test tracking | Automation |

## Health Indicators

### System Health Score

| Score | Status | Meaning |
|-------|--------|---------|
| 90-100 | 🟢 Excellent | All systems optimal |
| 70-89 | 🟡 Good | Minor issues |
| 50-69 | 🟠 Fair | Several issues |
| 0-49 | 🔴 Poor | Action needed |

### PR Health

- **Healthy:** Active, reviewed, checks passing
- **Warning:** Stale (>7 days) or changes requested
- **Critical:** Merge conflicts or blocked

### Agent Health

- **Active:** Activity within 1 hour
- **Idle:** 1-4 hours since activity
- **Inactive:** >4 hours (alert generated)

## N8N Integration

### Available Webhooks

If you have N8N configured:

- **PR Delegated:** Notifies when PR assigned
- **Agent Status:** Updates agent activity
- **Test Results:** Shares test outcomes
- **Session Updates:** PR status changes
- **Orchestration:** Workflow coordination

### Setup

Add to repository secrets:

```bash
N8N_WEBHOOK_URL=https://your-n8n-instance.com
```

## MCP Tools

The system validates these tools:

- ✅ **claude_ai** - Claude AI integration
- ✅ **computer_use** - Linux automation
- ✅ **android_control** - Android devices
- ✅ **github_api** - GitHub operations
- ✅ **n8n_webhooks** - N8N integration
- ✅ **supabase_db** - Database access

Check status: Actions → MCP Orchestrator → Latest run

## Troubleshooting

### Quick Fixes

| Problem | Solution |
|---------|----------|
| Workflow not running | Check Actions tab, ensure enabled |
| Auto-merge not working | Verify all criteria met, check logs |
| Agent not assigned | Manually add label, trigger PR automation |
| Tests failing | Check logs, fix code, push update |
| Stale PR alert | Review PR, request update, or close |

### Getting Help

1. **Check documentation:**
   - WORKFLOW_STATUS.md (detailed status)
   - AUTOMATION_SYSTEM.md (system overview)
   - GitHub Actions logs

2. **Ask for help:**
   - Comment on PR
   - Create issue with `support` label
   - Contact maintainers

3. **Manual intervention:**
   - Trigger workflows manually
   - Reassign PR to different agent
   - Merge manually if needed

## Best Practices

### For PR Authors

✅ DO:
- Write clear PR descriptions
- Respond to reviews promptly
- Keep PRs small and focused
- Add `auto-merge` when ready
- Check CI status regularly

❌ DON'T:
- Force push after reviews
- Ignore failing checks
- Create huge PRs
- Skip PR templates
- Leave PRs unattended

### For Reviewers

✅ DO:
- Review within 24 hours
- Provide constructive feedback
- Approve when satisfied
- Comment on assigned PRs
- Check daily reports

❌ DON'T:
- Ignore assigned PRs
- Request changes without details
- Approve without review
- Skip automated checks
- Leave reviews incomplete

### For Maintainers

✅ DO:
- Monitor daily reports
- Respond to health alerts
- Keep workflows updated
- Balance agent workload
- Document changes

❌ DON'T:
- Ignore automation issues
- Skip security updates
- Overload single agent
- Disable workflows without notice
- Forget to configure secrets

## Quick Reference Commands

### GitHub CLI

```bash
# List workflows
gh workflow list

# Run workflow
gh workflow run <workflow-name>

# View runs
gh run list

# View specific run
gh run view <run-id>

# List PRs
gh pr list

# List with filters
gh pr list --label "auto-merge" --state open

# View PR details
gh pr view <number>
```

### Git

```bash
# Update branch
git fetch origin
git merge origin/main

# Check status
git status

# Push changes
git push origin <branch>
```

## Next Steps

1. **Read full documentation:**
   - WORKFLOW_STATUS.md
   - AUTOMATION_SYSTEM.md
   - CONSOLIDATION_ROADMAP.md

2. **Configure your environment:**
   - Set up GitHub CLI
   - Configure webhooks (if using N8N)
   - Set repository secrets

3. **Start contributing:**
   - Create your first PR
   - Experience the automation
   - Provide feedback

---

**Need Help?**

- 📖 [Full Documentation](./WORKFLOW_STATUS.md)
- 🐛 [Report Issue](https://github.com/Wallesters-org/Wallestars/issues)
- 💬 [Discussions](https://github.com/Wallesters-org/Wallestars/discussions)

**Happy Automating! 🚀**
