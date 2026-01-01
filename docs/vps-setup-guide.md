# n8n VPS Setup and Configuration

## Quick Start Guide

This document provides step-by-step instructions for setting up n8n on a KVM2 VPS and integrating it with GitHub and Claude AI.

## Table of Contents

1. [VPS Requirements](#vps-requirements)
2. [Installation Steps](#installation-steps)
3. [Configuration](#configuration)
4. [GitHub Integration](#github-integration)
5. [Claude AI Setup](#claude-ai-setup)
6. [Workflow Import](#workflow-import)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

## VPS Requirements

- **OS**: Ubuntu 22.04 LTS or higher
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: Minimum 20GB
- **Network**: Public IP address
- **Ports**: 5678 (n8n), 443 (HTTPS)

## Installation Steps

### Step 1: Connect to Your VPS

```bash
ssh root@your-vps-ip
```

### Step 2: Install Node.js

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 3: Install n8n

Choose one of the following methods:

#### Option A: NPM Installation (Recommended for development)

```bash
# Install n8n globally
npm install -g n8n

# Create n8n data directory
mkdir -p ~/.n8n
```

#### Option B: Docker Installation (Recommended for production)

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Run n8n container
docker run -d \
  --name n8n \
  --restart unless-stopped \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=changeme123 \
  n8nio/n8n
```

### Step 4: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install -y certbot

# Get SSL certificate
sudo certbot certonly --standalone -d your-domain.com

# Note the certificate paths:
# Certificate: /etc/letsencrypt/live/your-domain.com/fullchain.pem
# Private Key: /etc/letsencrypt/live/your-domain.com/privkey.pem
```

## Configuration

### Environment Variables

Create an environment file:

```bash
cat > ~/.n8n/env << EOF
# Basic Configuration
N8N_PROTOCOL=https
N8N_HOST=your-domain.com
N8N_PORT=5678

# Authentication
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your-secure-password

# SSL Configuration
N8N_SSL_KEY=/etc/letsencrypt/live/your-domain.com/privkey.pem
N8N_SSL_CERT=/etc/letsencrypt/live/your-domain.com/fullchain.pem

# Webhook URL
WEBHOOK_URL=https://your-domain.com

# Timezone
GENERIC_TIMEZONE=Europe/Sofia

# Execution Configuration
EXECUTIONS_DATA_SAVE_ON_ERROR=all
EXECUTIONS_DATA_SAVE_ON_SUCCESS=all
EXECUTIONS_DATA_SAVE_MANUAL_EXECUTIONS=true

# Security
N8N_SECURE_COOKIE=true
EOF
```

### Start n8n with Configuration

```bash
# NPM method
n8n start --env-file=~/.n8n/env

# Docker method
docker run -d \
  --name n8n \
  --restart unless-stopped \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  --env-file ~/.n8n/env \
  n8nio/n8n
```

### Setup as System Service (NPM method)

```bash
# Create systemd service file
sudo cat > /etc/systemd/system/n8n.service << EOF
[Unit]
Description=n8n Workflow Automation
After=network.target

[Service]
Type=simple
User=$USER
EnvironmentFile=/home/$USER/.n8n/env
ExecStart=/usr/bin/n8n start
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable n8n
sudo systemctl start n8n

# Check status
sudo systemctl status n8n
```

## GitHub Integration

### Step 1: Generate GitHub Personal Access Token

1. Go to GitHub Settings → Developer Settings → Personal Access Tokens
2. Click "Generate new token (classic)"
3. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
   - ✅ `write:discussion` (Write access to discussions)
   - ✅ `admin:repo_hook` (Full control of repository hooks)
4. Generate and copy the token

### Step 2: Configure GitHub Credentials in n8n

1. Open n8n: `https://your-domain.com:5678`
2. Login with admin credentials
3. Go to Settings → Credentials
4. Click "Add Credential"
5. Select "GitHub API"
6. Enter:
   - **Name**: GitHub API
   - **Access Token**: Your generated token
7. Click "Save"

### Step 3: Setup GitHub Webhook

1. In your GitHub repository, go to Settings → Webhooks
2. Click "Add webhook"
3. Configure:
   - **Payload URL**: `https://your-domain.com/webhook/github`
   - **Content type**: `application/json`
   - **Secret**: (optional, but recommended)
   - **Events**: Select individual events:
     - ✅ Issues
     - ✅ Issue comments
     - ✅ Pull requests
     - ✅ Pull request reviews
     - ✅ Pushes
     - ✅ Releases
4. Click "Add webhook"

## Claude AI Setup

### Step 1: Get Claude API Key

Based on the [Claude Enterprise Guide](https://support.claude.com/en/articles/11845131-using-claude-code-with-your-team-or-enterprise-plan):

1. Access Anthropic Console: https://console.anthropic.com
2. Navigate to API Keys section
3. Create a new API key
4. Copy the key (it will only be shown once)

### Step 2: Configure Claude API in n8n

1. In n8n, go to Settings → Credentials
2. Click "Add Credential"
3. Select "HTTP Header Auth" (for custom API integration)
4. Configure:
   - **Name**: Claude AI API
   - **Name**: `x-api-key`
   - **Value**: Your Claude API key
5. Click "Save"

### Step 3: Test Claude Integration

Use the HTTP Request node in a test workflow:

```json
{
  "url": "https://api.anthropic.com/v1/messages",
  "method": "POST",
  "headers": {
    "x-api-key": "{{credentials}}",
    "anthropic-version": "2023-06-01",
    "content-type": "application/json"
  },
  "body": {
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 1024,
    "messages": [
      {
        "role": "user",
        "content": "Hello, Claude!"
      }
    ]
  }
}
```

## Workflow Import

### Step 1: Clone Repository

```bash
cd ~
git clone https://github.com/Wallesters-org/Wallestars.git
cd Wallestars
```

### Step 2: Import Workflows

1. In n8n web interface, click "Workflows"
2. Click "Import from File"
3. Select workflow files from `workflows/` directory:
   - `user-contact-automation.json`
   - `dj-workflow-multichain.json`
4. Configure credentials for each node
5. Activate the workflow

### Step 3: Configure Workflow Variables

For each imported workflow:

1. Open the workflow
2. Click on each node that requires credentials
3. Select the appropriate credential from dropdown
4. Update any repository-specific values (owner, repo name)
5. Save the workflow

## Testing

### Test GitHub Webhook

```bash
# Test webhook delivery
curl -X POST https://your-domain.com/webhook/github \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: issues" \
  -d '{
    "action": "opened",
    "issue": {
      "number": 1,
      "title": "Test Issue",
      "body": "This is a test issue"
    },
    "repository": {
      "owner": {"login": "your-username"},
      "name": "your-repo"
    }
  }'
```

### Test Claude AI Response

1. Create a test workflow with HTTP Request node
2. Use the Claude AI endpoint
3. Execute the workflow manually
4. Check execution log for response

### Test Complete Flow

1. Create a real GitHub issue in your repository
2. Check n8n execution log
3. Verify AI response was posted as comment
4. Confirm labels were added

## Troubleshooting

### n8n Won't Start

```bash
# Check logs (NPM method)
journalctl -u n8n -f

# Check logs (Docker method)
docker logs n8n -f
```

### Webhook Not Triggering

1. Check GitHub webhook delivery status
2. Verify n8n is accessible from internet
3. Check firewall rules: `sudo ufw status`
4. Test webhook URL: `curl https://your-domain.com/webhook-test/test`

### Claude API Errors

1. Verify API key is correct
2. Check rate limits in Anthropic Console
3. Review request body format
4. Check anthropic-version header

### Credential Issues

1. Re-save credentials in n8n
2. Check token expiration (GitHub)
3. Verify API key format (Claude)

## Security Best Practices

1. **Use HTTPS**: Always enable SSL/TLS
2. **Strong Passwords**: Use complex passwords for n8n
3. **Firewall**: Limit access to necessary ports only
4. **IP Whitelisting**: Restrict access to known IPs if possible
5. **Regular Updates**: Keep n8n and Node.js updated
6. **Backup**: Regular backup of `~/.n8n` directory
7. **Secrets**: Store sensitive data in n8n credentials, not in workflows

## Backup and Recovery

### Backup n8n Configuration

```bash
# Backup workflows and credentials
tar -czf n8n-backup-$(date +%Y%m%d).tar.gz ~/.n8n/

# Copy to secure location
scp n8n-backup-*.tar.gz user@backup-server:/backups/
```

### Restore from Backup

```bash
# Extract backup
tar -xzf n8n-backup-20260101.tar.gz -C ~/

# Restart n8n
sudo systemctl restart n8n  # or docker restart n8n
```

## Monitoring

### Setup Monitoring

```bash
# Install monitoring tools
sudo apt-get install -y htop iotop

# Monitor n8n resource usage
htop

# Check n8n logs
journalctl -u n8n -f  # NPM method
docker logs -f n8n     # Docker method
```

### Setup Alerts

Configure n8n to send alerts on workflow failures:

1. Create an "Error Trigger" workflow
2. Add email/Slack notification node
3. Activate workflow

## Additional Resources

- [n8n Documentation](https://docs.n8n.io)
- [n8n Community Forum](https://community.n8n.io)
- [Claude AI Documentation](https://docs.anthropic.com)
- [GitHub Webhooks Guide](https://docs.github.com/webhooks)

## Support

For issues specific to this setup:
- Create an issue in this repository
- Check existing documentation
- Review n8n community forums

## License

This configuration is part of the Wallestars project.
