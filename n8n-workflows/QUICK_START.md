# N8N Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Access N8N (2 min)
```bash
# Open in browser
https://n8n.srv1201204.hstgr.cloud

# Create admin account if first time
# Username: your-email@example.com
# Password: [secure-password]
```

### Step 2: Import Workflows (2 min)
1. **Import System Health Monitor:**
   - Click "Workflows" → "Add workflow"
   - Click ⋮ menu → "Import from File"
   - Upload: `system-health-monitor.json`
   - Click "Save" → Name: "System Health Monitor"
   - Toggle "Active" ON

2. **Import GitHub Automation:**
   - Repeat above for `github-automation.json`
   - Name: "GitHub Automation"
   - Toggle "Active" ON

### Step 3: Test Integration (1 min)
```bash
# Test health endpoint
curl http://localhost:3000/api/webhooks/n8n/test

# Wait 5 minutes and check health report
curl http://localhost:3000/api/webhooks/n8n/health-report/latest

# View dashboard
curl http://localhost:3000/api/webhooks/n8n/dashboard
```

## ✅ That's It!

Your automation is now running:
- 🔍 Health monitoring every 5 minutes
- 🤖 GitHub events tracked
- 🔄 Auto-restart on failures
- 📊 Real-time dashboard data

## 📚 Next Steps

- Read [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for detailed configuration
- Set up GitHub webhook (required for GitHub automation)
- Add GitHub credentials in n8n
- Create custom workflows

## 🐛 Having Issues?

**Workflow not running?**
```bash
pm2 status n8n
pm2 logs n8n
```

**Can't access n8n?**
```bash
sudo systemctl status nginx
curl http://localhost:5678/healthz
```

**API not responding?**
```bash
pm2 status wallestars
pm2 logs wallestars
curl http://localhost:3000/api/health
```

## 📞 Support

- Documentation: [README.md](./README.md)
- Full guide: [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
- Issues: https://github.com/Wallesters-org/Wallestars/issues
