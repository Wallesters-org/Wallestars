# Workflow Configuration Guide

## Общ Преглед

Този документ описва конфигурационните параметри за всички workflows в Wallestars проекта.

## User Contact Automation Configuration

### Environment Variables

```bash
# GitHub Configuration
GITHUB_TOKEN=your-github-personal-access-token
GITHUB_OWNER=Wallesters-org
GITHUB_REPO=Wallestars

# Claude AI Configuration
CLAUDE_API_KEY=your-claude-api-key
CLAUDE_MODEL=claude-3-5-sonnet-20241022
CLAUDE_MAX_TOKENS=4096

# Workflow Behavior
AUTO_REPLY_ENABLED=true
AUTO_LABEL_ENABLED=true
RESPONSE_DELAY_SECONDS=5
MAX_RETRIES=3
```

### Workflow Parameters

```json
{
  "triggerOn": ["issues.opened", "issues.labeled", "issue_comment.created"],
  "ignoreLabels": ["wontfix", "duplicate", "invalid"],
  "autoLabels": {
    "bug": ["bug", "needs-triage"],
    "feature": ["enhancement"],
    "question": ["question", "needs-info"]
  },
  "aiPromptTemplate": "You are a helpful assistant for the Wallestars project. Respond to the following issue: {{issue_body}}"
}
```

## DJ Workflow Multi-Chain Configuration

### Environment Variables

```bash
# Blockchain RPC Endpoints
ETHEREUM_RPC=https://mainnet.infura.io/v3/YOUR-PROJECT-ID
POLYGON_RPC=https://polygon-rpc.com
SOLANA_RPC=https://api.mainnet-beta.solana.com
BSC_RPC=https://bsc-dataseed.binance.org

# Testnet Endpoints (for testing)
ETHEREUM_TESTNET_RPC=https://sepolia.infura.io/v3/YOUR-PROJECT-ID
POLYGON_TESTNET_RPC=https://rpc-mumbai.maticvigil.com

# Deployment Keys (NEVER commit these!)
DEPLOYER_PRIVATE_KEY=your-private-key-here
GAS_PRICE_GWEI=auto
GAS_LIMIT=auto

# Claude AI for Commit Analysis
CLAUDE_API_KEY=your-claude-api-key
ANALYZE_COMMITS=true
```

### Chain Detection Rules

```json
{
  "commitMessagePatterns": {
    "[ethereum]": "ethereum",
    "[eth]": "ethereum",
    "[polygon]": "polygon",
    "[matic]": "polygon",
    "[solana]": "solana",
    "[sol]": "solana",
    "[bsc]": "bsc",
    "[binance]": "bsc",
    "[test]": "testnet",
    "[all]": "multichain"
  },
  "defaultChain": "ethereum",
  "allowedChains": ["ethereum", "polygon", "solana", "bsc"]
}
```

## Common Configuration Options

### Credentials Setup

#### GitHub Credentials
```json
{
  "name": "GitHub API",
  "type": "githubApi",
  "data": {
    "accessToken": "ghp_xxxxxxxxxxxxxxxxxxxx",
    "server": "https://api.github.com"
  }
}
```

#### Claude AI Credentials
```json
{
  "name": "Claude AI API",
  "type": "httpHeaderAuth",
  "data": {
    "name": "x-api-key",
    "value": "sk-ant-xxxxxxxxxxxxxxxxxxxx"
  }
}
```

### Webhook Configuration

```json
{
  "webhookPath": "/webhook/github",
  "authentication": "none",
  "respondWith": "allEntries",
  "responseMode": "onReceived"
}
```

### Error Handling

```json
{
  "continueOnFail": false,
  "retryOnFail": true,
  "maxRetries": 3,
  "retryInterval": 1000,
  "errorWorkflow": "error-notification-workflow"
}
```

### Rate Limiting

```json
{
  "requestsPerSecond": 10,
  "requestsPerMinute": 100,
  "requestsPerHour": 5000,
  "enableBackoff": true,
  "backoffStrategy": "exponential"
}
```

## Advanced Configuration

### AI Prompt Customization

#### Issue Response Template
```
System: You are a helpful assistant for the Wallestars project, an AI-powered automation platform.

Context:
- Project: {{repository_name}}
- Issue #{{issue_number}}: {{issue_title}}
- Created by: {{issue_author}}

User Message:
{{issue_body}}

Instructions:
1. Provide a clear, helpful response
2. Be professional and friendly
3. If this is a bug, acknowledge it and suggest possible solutions
4. If this is a feature request, thank them and explain the review process
5. If this is a question, answer thoroughly
6. Keep response under 500 words
7. Use Bulgarian language if the issue is in Bulgarian

Response:
```

#### Commit Analysis Template
```
System: You are a blockchain deployment expert analyzing Git commits.

Commit Information:
- SHA: {{commit_sha}}
- Message: {{commit_message}}
- Author: {{commit_author}}
- Files changed: {{files_changed}}

Task: Analyze this commit and determine:
1. Which blockchain network(s) should this be deployed to?
2. Are there any security concerns?
3. What is the estimated gas cost?
4. Should this go to mainnet or testnet?

Provide your analysis in JSON format:
{
  "targetChain": "ethereum|polygon|solana|bsc",
  "environment": "mainnet|testnet",
  "securityRisk": "low|medium|high",
  "estimatedGas": number,
  "recommendation": "string"
}
```

### Monitoring Configuration

```json
{
  "enableMetrics": true,
  "metricsInterval": 60000,
  "logLevel": "info",
  "logFormat": "json",
  "enableAlerts": true,
  "alertChannels": ["email", "slack"],
  "alertThresholds": {
    "errorRate": 0.05,
    "responseTime": 5000,
    "apiQuota": 0.8
  }
}
```

### Backup Configuration

```json
{
  "enableAutoBackup": true,
  "backupInterval": "daily",
  "backupPath": "~/.n8n/backups",
  "retentionDays": 30,
  "backupIncludes": [
    "workflows",
    "credentials",
    "settings"
  ]
}
```

## Security Best Practices

### Credential Management
1. **Never hardcode credentials** in workflows
2. **Use n8n credential store** exclusively
3. **Rotate credentials** every 90 days
4. **Use environment variables** for configuration
5. **Limit token permissions** to minimum required

### Network Security
1. **Always use HTTPS** for webhooks
2. **Implement webhook secrets** for verification
3. **Use IP whitelisting** when possible
4. **Enable rate limiting** on all endpoints
5. **Monitor failed authentication attempts**

### Data Protection
1. **Encrypt sensitive data** at rest
2. **Use secure connections** for all APIs
3. **Implement audit logging** for all operations
4. **Regular security audits** of workflows
5. **GDPR compliance** for user data

## Testing Configuration

### Test Environment Setup

```bash
# Create test environment file
cp .env.example .env.test

# Set test-specific values
TEST_MODE=true
USE_TESTNET=true
MOCK_CLAUDE_AI=true
GITHUB_TEST_REPO=Wallestars-test
```

### Test Scenarios

1. **GitHub Webhook Test**
   - Create test issue
   - Verify workflow triggers
   - Check AI response
   - Validate labels

2. **Multi-Chain Deployment Test**
   - Create test commit
   - Verify chain detection
   - Check deployment status
   - Validate transaction

3. **Error Handling Test**
   - Invalid credentials
   - API rate limit
   - Network timeout
   - Invalid input

## Performance Optimization

### Workflow Optimization
```json
{
  "enableCaching": true,
  "cacheTimeout": 3600,
  "batchRequests": true,
  "batchSize": 10,
  "parallelExecution": true,
  "maxParallel": 5
}
```

### Resource Limits
```json
{
  "maxExecutionTime": 300,
  "maxMemoryMB": 512,
  "maxConcurrentWorkflows": 10,
  "queueLimit": 100
}
```

## Troubleshooting

### Common Configuration Issues

**Issue**: Workflow не се изпълнява
**Check**:
- Workflow е активиран
- Credentials са валидни
- Webhook е правилно конфигуриран
- n8n има достъп до интернет

**Issue**: Claude AI грешки
**Check**:
- API key е валиден
- Model name е правилен
- Token limits не са надвишени
- Request format е коректен

**Issue**: GitHub API errors
**Check**:
- Token има необходимите права
- Rate limits не са достигнати
- Repository permissions са правилни
- Webhook secret е правилен (ако е конфигуриран)

## Migration Guide

### Upgrading Workflows

```bash
# 1. Backup current workflows
n8n export:workflow --all --output=./backups/

# 2. Update n8n version
npm update -g n8n

# 3. Import updated workflows
n8n import:workflow --input=./workflows/user-contact-automation.json

# 4. Test workflows
n8n workflow:test --id=workflow-id

# 5. Activate workflows
n8n workflow:activate --id=workflow-id
```

## Appendix

### Environment Variable Reference

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `GITHUB_TOKEN` | string | Yes | - | GitHub API token |
| `CLAUDE_API_KEY` | string | Yes | - | Claude AI API key |
| `N8N_PROTOCOL` | string | No | https | Protocol (http/https) |
| `N8N_HOST` | string | Yes | - | n8n host domain |
| `N8N_PORT` | number | No | 5678 | n8n port |
| `WEBHOOK_URL` | string | Yes | - | Base webhook URL |

### API Rate Limits

| Service | Limit | Period | Notes |
|---------|-------|--------|-------|
| GitHub API | 5000 | Hour | Authenticated |
| GitHub Webhook | N/A | - | No limit |
| Claude AI | Varies | Minute | Depends on plan |
| Ethereum RPC | 100000 | Day | Infura free tier |

### Support Resources

- [n8n Documentation](https://docs.n8n.io)
- [GitHub API Docs](https://docs.github.com)
- [Claude AI Docs](https://docs.anthropic.com)
- [Project Issues](https://github.com/Wallesters-org/Wallestars/issues)

---

**Last Updated**: 2026-01-01  
**Version**: 1.0.0  
**Maintained by**: Wallestars Team
