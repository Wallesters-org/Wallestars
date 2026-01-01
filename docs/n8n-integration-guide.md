# n8n Integration Guide for DJ Workflow Multi-Chain App

## Overview
This guide provides step-by-step instructions for integrating n8n workflows with GitHub automation and Claude AI for the DJ Workflow multi-chain application.

## Prerequisites
- n8n VPS (KVM2) instance running
- GitHub account with repository access
- Claude AI API access (Team or Enterprise plan)
- Node.js 20.x or higher

## Step 1: Setup n8n VPS (KVM2)

### Install n8n on VPS
```bash
# Install n8n globally
npm install -g n8n

# Or use Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### Configure n8n Environment
```bash
# Set environment variables
export N8N_BASIC_AUTH_ACTIVE=true
export N8N_BASIC_AUTH_USER=admin
export N8N_BASIC_AUTH_PASSWORD=your-secure-password
export N8N_HOST=your-vps-domain.com
export N8N_PORT=5678
export N8N_PROTOCOL=https
export WEBHOOK_URL=https://your-vps-domain.com
```

## Step 2: Connect GitHub with n8n

### GitHub Credentials Setup
1. Go to GitHub Settings > Developer Settings > Personal Access Tokens
2. Generate new token with permissions:
   - `repo` (full control)
   - `workflow` (update workflows)
   - `write:discussion` (for user interactions)
3. Add token to n8n credentials:
   - Name: `GitHub API`
   - Access Token: `your-github-token`

### Webhook Configuration
1. In your GitHub repository, go to Settings > Webhooks
2. Add webhook:
   - Payload URL: `https://your-vps-domain.com/webhook/github`
   - Content type: `application/json`
   - Events: Select `Issues`, `Pull requests`, `Discussions`

## Step 3: Configure Claude AI Integration

### Claude API Setup
Based on [Claude Code for Teams/Enterprise](https://support.claude.com/en/articles/11845131-using-claude-code-with-your-team-or-enterprise-plan):

1. Obtain Claude API key from Anthropic Console
2. Add to n8n credentials:
   - Name: `Claude AI API`
   - API Key: `your-claude-api-key`
   - Model: `claude-3-5-sonnet-20241022` (recommended)

### Claude Integration Best Practices
- Use system prompts to define AI behavior
- Implement rate limiting (respect API limits)
- Cache frequently used contexts
- Monitor token usage

## Step 4: Import n8n Workflow Templates

### Available Templates
1. **GitHub Issue Auto-Responder** - Automatically responds to new issues
2. **Pull Request Reviewer** - AI-powered code review assistant
3. **User Contact Automation** - Manages user interactions
4. **Multi-Chain App Workflow** - DJ Workflow orchestration

### Import Instructions
1. Open n8n interface: `https://your-vps-domain.com:5678`
2. Click "Workflows" > "Import from File"
3. Select the JSON file from `/workflows/` directory
4. Configure credentials for each node
5. Activate the workflow

## Step 5: DJ Workflow Multi-Chain App Configuration

### Workflow Components
1. **GitHub Trigger** - Monitors repository events
2. **Claude AI Node** - Processes requests with AI
3. **Response Handler** - Formats and sends responses
4. **Multi-Chain Router** - Routes to appropriate blockchain

### Configuration Steps
```javascript
// Example workflow configuration
{
  "nodes": [
    {
      "name": "GitHub Webhook",
      "type": "n8n-nodes-base.githubTrigger",
      "credentials": "GitHub API"
    },
    {
      "name": "Claude AI Processing",
      "type": "n8n-nodes-base.httpRequest",
      "credentials": "Claude AI API"
    },
    {
      "name": "GitHub Response",
      "type": "n8n-nodes-base.github"
    }
  ]
}
```

## Step 6: Automate User Contacts

### Contact Automation Features
- **Auto-reply to issues** with AI-generated responses
- **Smart categorization** of user requests
- **Automated follow-ups** for pending issues
- **User onboarding** with personalized messages

### Workflow Setup
1. Import `user-contact-automation.json`
2. Configure GitHub webhook trigger
3. Set up Claude AI prompt templates
4. Test with sample issue

## Testing the Integration

### Test Checklist
- [ ] GitHub webhook receives events
- [ ] n8n workflow triggers successfully
- [ ] Claude AI responds with relevant content
- [ ] GitHub actions are executed correctly
- [ ] Error handling works properly

### Test Commands
```bash
# Test webhook endpoint
curl -X POST https://your-vps-domain.com/webhook/github \
  -H "Content-Type: application/json" \
  -d '{"action": "opened", "issue": {"title": "Test issue"}}'

# Check n8n logs
docker logs n8n

# Verify workflow execution
# Access n8n UI and check execution history
```

## Monitoring and Maintenance

### Key Metrics to Monitor
- Workflow execution success rate
- API response times
- Claude AI token usage
- GitHub API rate limits

### Maintenance Tasks
- Regular credential rotation
- Workflow optimization
- Log cleanup
- Backup workflow configurations

## Troubleshooting

### Common Issues

**Webhook not triggering:**
- Verify webhook URL is accessible
- Check GitHub webhook delivery status
- Ensure n8n is running and port is open

**Claude AI errors:**
- Verify API key is valid
- Check rate limits
- Review prompt token count

**GitHub API limits:**
- Implement exponential backoff
- Use conditional requests with ETags
- Cache responses when possible

## Security Considerations

- Store all credentials in n8n credential store
- Use environment variables for sensitive data
- Enable HTTPS for all connections
- Implement IP whitelisting for webhooks
- Regular security audits

## Additional Resources

- [n8n Documentation](https://docs.n8n.io)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Claude AI API Documentation](https://docs.anthropic.com)
- [n8n Community Workflows](https://n8n.io/workflows)

## Support

For issues and questions:
- GitHub Issues: Create an issue in this repository
- n8n Community: [community.n8n.io](https://community.n8n.io)
- Claude Support: [support.claude.com](https://support.claude.com)
