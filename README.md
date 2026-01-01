# Wallestars

## DJ Workflow - Multi-Chain App with AI Automation

Wallestars is an intelligent workflow automation system that integrates GitHub, n8n, and Claude AI to manage multi-chain blockchain applications and automate user interactions.

## 🚀 Features

- **AI-Powered User Contact Automation**: Automatically respond to GitHub issues and discussions using Claude AI
- **Multi-Chain Blockchain Integration**: Intelligent routing and deployment across Ethereum, Polygon, Solana, and more
- **n8n Workflow Automation**: Self-hosted workflow engine on VPS (KVM2)
- **GitHub Actions Integration**: Automated workflow synchronization and deployment
- **Enterprise-Grade Security**: SSL/TLS encryption, credential management, and audit logging

## 📚 Documentation

- [n8n Integration Guide](./docs/n8n-integration-guide.md) - Complete guide for integrating n8n with GitHub and Claude AI
- [VPS Setup Guide](./docs/vps-setup-guide.md) - Step-by-step instructions for setting up n8n on KVM2 VPS
- [Project Summary](./docs/summary.md) - Comprehensive overview of architecture, features, and implementation

## 🎯 Quick Start

### Prerequisites

- VPS server (KVM2) with Ubuntu 22.04+
- GitHub repository access
- Claude AI API key ([Get started](https://support.claude.com/en/articles/11845131-using-claude-code-with-your-team-or-enterprise-plan))
- Node.js 20.x or higher

### Installation

1. **Setup n8n on VPS**
   ```bash
   npm install -g n8n
   # or use Docker
   docker run -d --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n
   ```

2. **Configure GitHub Integration**
   - Generate GitHub Personal Access Token
   - Setup webhook in repository settings
   - Configure credentials in n8n

3. **Add Claude AI Integration**
   - Obtain API key from Anthropic Console
   - Configure Claude API credentials in n8n

4. **Import Workflows**
   ```bash
   # Import workflow templates from /workflows directory
   - user-contact-automation.json
   - dj-workflow-multichain.json
   ```

5. **Deploy**
   - Activate workflows in n8n
   - Test with sample GitHub issue
   - Monitor execution logs

For detailed instructions, see the [VPS Setup Guide](./docs/vps-setup-guide.md).

## 🔧 Available Workflows

### 1. User Contact Automation
**Location**: `workflows/user-contact-automation.json`

Automatically handles user interactions:
- Responds to new issues with AI-generated messages
- Categorizes and labels issues
- Provides instant support 24/7

### 2. DJ Workflow Multi-Chain
**Location**: `workflows/dj-workflow-multichain.json`

Manages multi-chain deployments:
- Analyzes commits with Claude AI
- Routes to appropriate blockchain networks
- Updates deployment status on GitHub

## 🏗️ Architecture

```
GitHub Repository → Webhook → n8n VPS (KVM2) → Claude AI
                                      ↓
                          Multi-Chain Networks
                      (Ethereum, Polygon, Solana)
```

## 🔐 Security

- SSL/TLS encryption for all communications
- Secure credential storage in n8n
- Environment variable management
- IP whitelisting support
- Regular security audits

## 📋 Configuration

### Required GitHub Secrets

```
N8N_VPS_HOST        # VPS domain or IP
N8N_VPS_USER        # SSH username
N8N_VPS_SSH_KEY     # SSH private key for deployment
```

### Required n8n Credentials

```
GitHub API          # GitHub Personal Access Token
Claude AI API       # Anthropic API key
```

## 🧪 Testing

Test the integration:

```bash
# Test GitHub webhook
curl -X POST https://your-domain.com/webhook/github \
  -H "Content-Type: application/json" \
  -d '{"action": "opened", "issue": {"title": "Test"}}'

# Check n8n logs
docker logs n8n -f
```

## 📊 Monitoring

Key metrics to monitor:
- Workflow execution success rate
- API response times
- Claude AI token usage
- GitHub API rate limits

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📖 Resources

- [n8n Documentation](https://docs.n8n.io)
- [Claude AI Documentation](https://docs.anthropic.com)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [GitHub Webhooks Guide](https://docs.github.com/webhooks)

## 💬 Support

- **Documentation**: Check `/docs` directory
- **Issues**: Create an issue in this repository
- **Community**: [n8n Community Forum](https://community.n8n.io)

## 📄 License

This project is part of the Wallestars ecosystem.

---

**Built with** ❤️ **using n8n, GitHub Actions, and Claude AI**
