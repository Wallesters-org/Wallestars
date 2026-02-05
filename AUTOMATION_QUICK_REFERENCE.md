# 🚀 Wallestars Automation - Quick Reference

## 📋 At a Glance

**Status:** ✅ Production Ready  
**Workflows:** 9 Active  
**Documentation:** 4 Guides  
**Scripts:** 3 Tools  

---

## ⚡ Quick Commands

### Developer Commands
```bash
# Your PR is automatically tracked!
gh pr create

# Enable auto-merge
gh pr edit NUMBER --add-label auto-merge

# Check status
gh pr view NUMBER
```

### Maintainer Commands
```bash
# Setup
./scripts/setup-automation.sh

# List workflows
./scripts/manage-workflows.sh list

# Validate
./scripts/manage-workflows.sh validate

# Health check
gh workflow run master-automation-orchestrator.yml
```

---

## 🔄 Active Workflows

| Name | Schedule | Purpose |
|------|----------|---------|
| pr-session-management | 5 min | PR lifecycle |
| pr-automation | 15 min | Delegation |
| agent-monitoring | 10 min | Health |
| testing-automation | 30 min | Tests |
| mcp-enhanced-automation | 1 hour | MCP |
| master-automation-orchestrator | Daily | Coordination |
| ci | On push | CI/CD |
| deploy-github-pages | On push | Deploy |
| azure-webapps-node | On push | Azure |

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [AUTOMATION_STATUS.md](AUTOMATION_STATUS.md) | Live dashboard |
| [COMPLETE_AUTOMATION_GUIDE.md](COMPLETE_AUTOMATION_GUIDE.md) | Full guide |
| [AUTOMATION_IMPLEMENTATION_SUMMARY.md](AUTOMATION_IMPLEMENTATION_SUMMARY.md) | Overview |
| [REPOSITORY_CONSOLIDATION_ROADMAP.md](REPOSITORY_CONSOLIDATION_ROADMAP.md) | Multi-repo plan |
| [scripts/README.md](scripts/README.md) | Scripts docs |

---

## 🎯 Features

✅ Automatic PR session tracking  
✅ Full CI/CD pipeline  
✅ Health monitoring  
✅ Auto-merge capability  
✅ MCP integration testing  
✅ Daily health reports  
✅ Stale PR detection  
✅ Agent activity tracking  
✅ Workflow orchestration  

---

## 🔧 Configuration

### GitHub Secrets
- `ANTHROPIC_API_KEY` - Claude AI
- `N8N_WEBHOOK_URL` - N8N endpoint

### Environment
- `NODE_ENV=production`
- `PORT=3000`
- `ENABLE_COMPUTER_USE=true`

---

## 📊 System Health

**Check Live Status:**
```bash
cat AUTOMATION_STATUS.md
gh run list --limit 10
```

**Trigger Health Check:**
```bash
gh workflow run master-automation-orchestrator.yml
```

---

## 🆘 Troubleshooting

**PR not tracked?**  
→ Check if draft (drafts are skipped)  
→ View Actions tab for errors  

**Workflow not running?**  
→ Validate YAML: `./scripts/manage-workflows.sh validate`  
→ Check permissions in Settings  

**MCP tests failing?**  
→ Verify `ANTHROPIC_API_KEY` secret  
→ Check server startup logs  

**Need help?**  
→ Read [COMPLETE_AUTOMATION_GUIDE.md](COMPLETE_AUTOMATION_GUIDE.md#troubleshooting)  
→ Open issue with `automation` label  

---

## 🎓 Learning Path

**New User?**
1. Read [AUTOMATION_IMPLEMENTATION_SUMMARY.md](AUTOMATION_IMPLEMENTATION_SUMMARY.md)
2. Try creating a PR
3. Watch automation work!

**Want Details?**
1. Read [COMPLETE_AUTOMATION_GUIDE.md](COMPLETE_AUTOMATION_GUIDE.md)
2. Explore workflow files
3. Try helper scripts

**Planning Migration?**
1. Read [REPOSITORY_CONSOLIDATION_ROADMAP.md](REPOSITORY_CONSOLIDATION_ROADMAP.md)
2. Review 3-repo design
3. Follow migration timeline

---

## 💡 Tips

**For Best Results:**
- Keep PRs small and focused
- Respond to automation feedback
- Use `auto-merge` label when ready
- Monitor session tracking issues

**For Maintainers:**
- Review daily health reports
- Address stale PRs promptly
- Keep workflows updated
- Monitor system health score

---

## 🎉 What's Automated

✅ **PR Created** → Session initialized  
✅ **Code Pushed** → Tests run  
✅ **Tests Pass** → Ready for review  
✅ **Approved** → Auto-merge (optional)  
✅ **Merged** → Session closed  

All automatic. Zero manual work needed!

---

## 📞 Quick Links

- [Actions Tab](../../actions) - View runs
- [Pull Requests](../../pulls) - Active PRs
- [Issues](../../issues) - Tracking & alerts
- [Settings](../../settings/secrets/actions) - Secrets

---

**Last Updated:** January 17, 2026  
**Version:** 2.0.0  
**Status:** 🟢 Operational

---

*For complete documentation, see [COMPLETE_AUTOMATION_GUIDE.md](COMPLETE_AUTOMATION_GUIDE.md)*
