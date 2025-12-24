# Replit Deployment Quick Start Guide

## Step-by-Step Instructions for Deploying via ChatGPT & Replit

### Phase 1: ChatGPT Login & Setup

1. **Open New Browser Window**
   - Use incognito/private mode for clean session
   - Navigate to: `https://chatgpt.com/login`

2. **Login Credentials**
   - Use the provided account credentials
   - Complete any 2FA if prompted

> **Security Warning**: These credentials are for deployment purposes only. Never share or commit credentials to public repositories.

3. **Access Replit Tool**
   - In ChatGPT, request: "Help me deploy to Replit"
   - ChatGPT will activate the Replit integration tool
   - Follow prompts to connect your Replit account

### Phase 2: Replit Configuration

#### Import Project
Ask ChatGPT to help you:
1. Import from GitHub: `https://github.com/Wallesters-org/Wallestars`
2. Select branch: `main`
3. Repl name: `Wallestars-SAAS`

#### Configure Environment
Provide these details to ChatGPT for Replit setup:

**Basic Settings:**
```
Language: Node.js
Node Version: 18.x
Run Command: npm start
Entry Point: index.js
```

**Environment Variables (non-sensitive):**
```
NODE_ENV=production
PORT=3000
APP_NAME=Wallestars
LOG_LEVEL=info
```

**Secrets (sensitive - set via Replit Secrets panel):**
```
DATABASE_URL=<your_database_url>
JWT_SECRET=<generate_random_string>
SESSION_SECRET=<generate_random_string>
API_KEY=<your_api_key>
```

### Phase 3: Deployment Execution

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Test Locally**
   ```bash
   npm start
   ```
   - Verify application starts without errors
   - Check health endpoint: `https://<your-repl>.repl.co/health`

3. **Deploy to Production**
   - Click "Deploy" button in Replit
   - Select "Autoscale deployment"
   - Configure:
     - CPU: 0.5 vCPU
     - Memory: 512 MB
     - Autoscaling: Enabled
   - Click "Deploy"

### Phase 4: Verification

1. **Check Deployment Status**
   - Monitor deployment logs
   - Wait for "Deployment successful" message

2. **Test Endpoints**
   - Health check: `https://<your-repl>.repl.co/health`
   - Root: `https://<your-repl>.repl.co/`
   - API: `https://<your-repl>.repl.co/api`

3. **Verify Response**
   Expected response from `/health`:
   ```json
   {
     "status": "healthy",
     "timestamp": "2025-12-24T...",
     "service": "Wallestars SAAS Platform",
     "version": "1.0.0"
   }
   ```

### Troubleshooting

**Issue: ChatGPT can't access Replit tool**
- Solution: Ensure you're using ChatGPT Plus or Team account
- Try: "Enable Replit integration" or check ChatGPT plugins

**Issue: Import from GitHub fails**
- Solution: Make repository public temporarily
- Or: Provide GitHub personal access token to Replit

**Issue: Application won't start**
- Check: Node.js version compatibility
- Verify: All environment variables are set
- Review: Replit console logs for errors

**Issue: Port binding error**
- Solution: Ensure using `process.env.PORT` in index.js
- Check: No hardcoded port in application code

### Next Steps After Deployment

1. **Configure Custom Domain** (optional)
   - Go to Replit deployment settings
   - Add custom domain
   - Update DNS records

2. **Set Up Monitoring**
   - Enable Replit monitoring
   - Configure alert notifications
   - Set up uptime checks

3. **Configure Auto-Deploy**
   - Enable GitHub auto-deploy in Replit
   - Push to main branch triggers deployment

4. **Security Hardening**
   - Review all secrets are in Replit Secrets
   - Enable HTTPS (auto-enabled by Replit)
   - Configure CORS settings if needed

### Support Resources

- **Replit Docs**: https://docs.replit.com
- **ChatGPT Plugins**: Help > Plugins
- **GitHub Repo**: https://github.com/Wallesters-org/Wallestars
- **Deployment Guide**: See DEPLOYMENT.md for details

### Required Tools & Accounts

- ✅ ChatGPT account (with Replit tool access)
- ✅ Replit account (free tier works)
- ✅ GitHub account (for repository access)
- ✅ Web browser (Chrome, Firefox, or Edge recommended)

### Estimated Time

- Initial setup: 5-10 minutes
- Deployment: 3-5 minutes
- Total: 10-15 minutes

---

**Quick Reference**

Login URL: https://chatgpt.com/login
Credentials: See secure documentation
Repository: https://github.com/Wallesters-org/Wallestars
Run Command: `npm start`
Health Check: `/health`

---

For detailed documentation, refer to [DEPLOYMENT.md](DEPLOYMENT.md)
