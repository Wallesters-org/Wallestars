# Replit Deployment Guide for Wallestars

This guide provides step-by-step instructions for deploying the Wallestars SAAS platform on Replit.

## Prerequisites

- Replit account credentials: krasavetsa1@icloud.com
- GitHub repository access: https://github.com/Wallesters-org/Wallestars

## Deployment Steps

### Step 1: Access Replit

1. Open a new browser window
2. Navigate to [https://replit.com/login](https://replit.com/login)
3. Log in with:
   - Email: krasavetsa1@icloud.com
   - Password: MagicBoyy24#

### Step 2: Create New Repl from GitHub

1. After logging in, click the "+ Create" button or "Create Repl"
2. Select "Import from GitHub" tab
3. Authorize GitHub if prompted
4. Enter repository URL: `https://github.com/Wallesters-org/Wallestars`
5. Click "Import from GitHub"

### Step 3: Automatic Configuration

Replit will automatically:
- Detect the `.replit` configuration file
- Set up the Node.js 20 environment using `replit.nix`
- Install dependencies from `package.json`
- Configure the run command: `npm start`
- Set environment variables (PORT=3000, NODE_ENV=production)

### Step 4: Initial Run

1. Once import is complete, click the "Run" button (green play button)
2. Replit will:
   - Install npm packages
   - Start the Express server
   - Open a preview window with your app

### Step 5: Test the Deployment

1. Check the console output for:
   ```
   🌟 Wallestars SAAS Platform running on port 3000
   🚀 Environment: production
   📡 Server ready at http://0.0.0.0:3000
   ```

2. The preview pane should show the Wallestars landing page

3. Test the health endpoint by visiting: `https://your-repl-url.repl.co/api/health`

### Step 6: Deploy to Production

1. Click the "Deploy" button in the Replit interface
2. Choose deployment options:
   - **Autoscale**: Recommended for SAAS applications
   - **Reserved VM**: For consistent performance
   - **Static**: Not applicable for this Node.js app

3. Configure deployment settings:
   - Select "Autoscale" deployment
   - Enable "Always On" if needed
   - Set custom domain (optional)

4. Click "Deploy" to push to production

### Step 7: Configure Custom Domain (Optional)

1. In the deployment settings, click "Add custom domain"
2. Enter your domain name
3. Update DNS records as instructed by Replit:
   - Add CNAME record pointing to Replit's servers
   - Wait for DNS propagation (can take up to 48 hours)

4. Enable HTTPS (automatically provided by Replit)

## Configuration Details

### .replit File

The `.replit` file configures:
- Run command: `npm start`
- Entry point: `index.js`
- Node.js modules: nodejs-20
- Deployment target: cloudrun
- Environment variables

### replit.nix File

Defines system dependencies:
- Node.js 20.x
- npm package manager
- TypeScript language server
- Yarn (alternative package manager)
- Jest (testing framework)

### Environment Variables

To add custom environment variables:
1. Go to the "Secrets" tab in your Repl
2. Click "+ New Secret"
3. Add key-value pairs (e.g., DATABASE_URL, API_KEY)
4. Secrets are encrypted and not visible in code

## Troubleshooting

### Issue: Repl won't start

**Solution**: 
- Check console for errors
- Ensure all dependencies are installed: run `npm install` in Shell
- Verify Node.js version: run `node --version` (should be 20.x)

### Issue: Port already in use

**Solution**:
- The `.replit` file is configured to use PORT from environment
- Replit automatically assigns available ports
- Don't hardcode port numbers

### Issue: Dependencies not installing

**Solution**:
- Clear cache: delete `node_modules` and `.cache` folders
- Run `npm install` manually in the Shell
- Check `package.json` for syntax errors

### Issue: Deployment fails

**Solution**:
- Ensure the app runs successfully in development first
- Check deployment logs in the Deployments tab
- Verify all required files are committed to GitHub
- Make sure `.replit` and `replit.nix` are present

## Updating the Deployment

To update your deployed app:

1. Make changes to your code in the Repl editor
2. Test changes by clicking "Run"
3. Once satisfied, the changes are automatically saved
4. For GitHub sync: commit and push changes
5. Redeploy by clicking "Deploy" again

Or update via GitHub:

1. Push changes to the GitHub repository
2. In Replit, pull the latest changes from the Git panel
3. Replit will automatically detect changes
4. Click "Run" to test, then "Deploy" to update production

## Monitoring and Logs

- **Console**: Real-time logs appear in the console pane
- **Deployment Logs**: Access via the Deployments tab
- **Health Check**: Monitor `/api/health` endpoint
- **Replit Dashboard**: View usage metrics and performance

## Security Best Practices

1. **Never commit credentials**: Use Replit Secrets for sensitive data
2. **Use HTTPS**: Enabled by default on Replit deployments
3. **Environment Variables**: Store API keys and tokens in Secrets
4. **Keep Dependencies Updated**: Regularly update `package.json`
5. **Monitor Access**: Review Replit access logs regularly

## Support Resources

- **Replit Documentation**: https://docs.replit.com
- **Replit Community**: https://replit.com/talk
- **Express.js Docs**: https://expressjs.com
- **GitHub Repository**: https://github.com/Wallesters-org/Wallestars

## Cost Considerations

- **Free Tier**: Basic hosting with sleep after inactivity
- **Hacker Plan** ($7/month): Always-on, more resources
- **Pro Plan** ($20/month): Priority support, more power
- **Deployments**: Additional cost for production deployments

For SAAS applications, consider at least the Hacker plan for reliable uptime.

## Next Steps

After deployment:

1. ✅ Verify the app is running at your Repl URL
2. ✅ Test all endpoints and functionality
3. ✅ Set up custom domain (if needed)
4. ✅ Configure monitoring and alerts
5. ✅ Share the URL with stakeholders
6. ✅ Plan for scaling based on usage

---

**Deployment Date**: Created for initial deployment
**Platform**: Replit Cloud Run
**Repository**: https://github.com/Wallesters-org/Wallestars
