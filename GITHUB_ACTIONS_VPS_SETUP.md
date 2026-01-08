# GitHub Actions VPS Deployment Setup

This guide explains how to set up automated VPS deployment using GitHub Actions.

## Overview

The GitHub Actions workflow (`.github/workflows/deploy-vps.yml`) automatically deploys your application to a VPS whenever you push to the `main` branch or trigger it manually.

## Prerequisites

1. A VPS server with SSH access
2. GitHub repository with admin access
3. Node.js 20.x and PM2 installed on VPS
4. SSH key pair for authentication

## Setup Instructions

### 1. Generate SSH Key for GitHub Actions

On your local machine:

```bash
# Generate a dedicated SSH key for GitHub Actions
ssh-keygen -t rsa -b 4096 -C "github-actions@wallestars" -f ~/.ssh/wallestars_deploy_key

# Copy the public key to your VPS
ssh-copy-id -i ~/.ssh/wallestars_deploy_key.pub your_username@your.vps.host.com

# Test the connection
ssh -i ~/.ssh/wallestars_deploy_key your_username@your.vps.host.com
```

### 2. Configure GitHub Secrets

Go to your GitHub repository: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

Add the following secrets:

#### Required Secrets:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `VPS_SSH_KEY` | Content of private SSH key | Contents of `~/.ssh/wallestars_deploy_key` |
| `VPS_HOST` | VPS hostname or IP address | `123.45.67.89` or `your.domain.com` |
| `VPS_USER` | SSH username | `root` or `your_username` |
| `VPS_PATH` | Deployment path on VPS | `/var/www/wallestars` |
| `VPS_PORT` | SSH port (optional, default: 22) | `22` |

#### How to Get SSH Private Key Content:

```bash
# Display private key content
cat ~/.ssh/wallestars_deploy_key

# Copy to clipboard (Linux)
cat ~/.ssh/wallestars_deploy_key | xclip -selection clipboard

# Copy to clipboard (macOS)
cat ~/.ssh/wallestars_deploy_key | pbcopy
```

Then paste the entire content (including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`) into the `VPS_SSH_KEY` secret.

### 3. Prepare VPS

SSH to your VPS and prepare the deployment directory:

```bash
# Connect to VPS
ssh your_username@your.vps.host.com

# Create deployment directory
sudo mkdir -p /var/www/wallestars
sudo chown -R your_username:your_username /var/www/wallestars

# Install PM2 if not already installed
sudo npm install -g pm2

# Verify installations
node --version  # Should be 20.x or higher
pm2 --version
```

### 4. Configure Environment on VPS

After the first deployment, configure your environment:

```bash
# SSH to VPS
ssh your_username@your.vps.host.com

# Navigate to deployment directory
cd /var/www/wallestars

# Edit .env file
nano .env
```

Add your configuration:

```env
ANTHROPIC_API_KEY=your_api_key_here
PORT=3000
NODE_ENV=production
ENABLE_COMPUTER_USE=true
ENABLE_ANDROID=true

# Email Configuration (if needed)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### 5. Test Deployment

#### Automatic Deployment (Push to main):

```bash
# On your local machine
git checkout main
git add .
git commit -m "Test deployment"
git push origin main
```

The workflow will automatically trigger.

#### Manual Deployment:

1. Go to your GitHub repository
2. Click on `Actions` tab
3. Select `Deploy to VPS` workflow
4. Click `Run workflow` button
5. Select the branch and click `Run workflow`

### 6. Monitor Deployment

1. Go to `Actions` tab in your GitHub repository
2. Click on the latest workflow run
3. Watch the deployment progress in real-time
4. Check for any errors or warnings

## Workflow Stages

The deployment workflow consists of the following stages:

1. **Checkout code** - Gets the latest code from repository
2. **Setup Node.js** - Installs Node.js 20.x
3. **Install dependencies** - Runs `npm install`
4. **Build application** - Runs `npm run build`
5. **Setup SSH** - Configures SSH connection to VPS
6. **Deploy to VPS** - Syncs files and restarts application
7. **Deployment Summary** - Shows deployment status

## Troubleshooting

### SSH Connection Failed

**Error**: `Permission denied (publickey)`

**Solution**:
- Verify `VPS_SSH_KEY` secret contains the correct private key
- Ensure public key is added to `~/.ssh/authorized_keys` on VPS
- Check SSH port is correct (default: 22)

### Build Failed

**Error**: Build process fails

**Solution**:
- Check if all dependencies are in `package.json`
- Verify Node.js version is compatible
- Review build logs in GitHub Actions

### PM2 Not Found

**Error**: `PM2 not found`

**Solution**:
```bash
# SSH to VPS
ssh your_username@your.vps.host.com

# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

### Application Not Restarting

**Error**: Application doesn't restart after deployment

**Solution**:
```bash
# SSH to VPS
ssh your_username@your.vps.host.com

# Check PM2 status
pm2 status

# Manually restart
pm2 restart wallestars

# Or start if not running
pm2 start server/index.js --name wallestars
pm2 save
```

### Port Already in Use

**Error**: `EADDRINUSE: address already in use`

**Solution**:
```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill the process (replace PID with actual process ID)
kill -9 <PID>

# Restart application
pm2 restart wallestars
```

## Security Considerations

1. **Protect SSH Keys**
   - Never commit private keys to repository
   - Use GitHub Secrets for sensitive data
   - Rotate keys periodically

2. **Limit SSH Access**
   - Use dedicated SSH key for deployments
   - Consider IP whitelisting for GitHub Actions
   - Disable password authentication on VPS

3. **Environment Variables**
   - Never commit `.env` files
   - Store sensitive data in VPS `.env` file
   - Don't expose API keys in logs

4. **Monitor Deployments**
   - Review deployment logs regularly
   - Set up notifications for failed deployments
   - Monitor application logs on VPS

## Advanced Configuration

### Deploy to Multiple Environments

Create separate workflows for different environments:

- `.github/workflows/deploy-staging.yml` (for staging)
- `.github/workflows/deploy-production.yml` (for production)

Use different secrets for each environment:
- `STAGING_VPS_HOST`, `STAGING_VPS_USER`, etc.
- `PRODUCTION_VPS_HOST`, `PRODUCTION_VPS_USER`, etc.

### Deployment Notifications

Add notification steps to the workflow:

```yaml
- name: Notify on Success
  if: success()
  run: |
    curl -X POST -H 'Content-type: application/json' \
      --data '{"text":"✅ Deployment successful!"}' \
      ${{ secrets.SLACK_WEBHOOK_URL }}

- name: Notify on Failure
  if: failure()
  run: |
    curl -X POST -H 'Content-type: application/json' \
      --data '{"text":"❌ Deployment failed!"}' \
      ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Rollback Strategy

In case of failed deployment:

```bash
# SSH to VPS
ssh your_username@your.vps.host.com

# View PM2 logs to identify issue
pm2 logs wallestars --lines 100

# If needed, restore from backup (if you have one)
# Or revert to previous commit and redeploy
```

## Best Practices

1. **Test Locally First** - Always test changes locally before pushing
2. **Use Staging Environment** - Test deployments on staging before production
3. **Monitor Logs** - Regularly check application and deployment logs
4. **Backup Data** - Regularly backup your VPS data and configuration
5. **Update Dependencies** - Keep dependencies and Node.js updated
6. **Version Control** - Tag releases for easy rollback
7. **Health Checks** - Implement health check endpoints
8. **Automated Testing** - Add tests to workflow before deployment

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [SSH Key Authentication](https://www.ssh.com/academy/ssh/public-key-authentication)
- [VPS Deployment Guide](VPS_DEPLOYMENT.md)
- [Main README](README.md)

## Support

If you encounter issues:
1. Check GitHub Actions logs
2. Review PM2 logs on VPS: `pm2 logs wallestars`
3. Test SSH connection manually
4. Verify all secrets are correctly configured
5. Check VPS system logs: `sudo journalctl -xe`
