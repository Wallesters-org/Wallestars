# n8n Workflow Configuration Template

## Required Configuration

Before importing the workflows, you need to configure the following:

### 1. GitHub Integration

- **Repository**: Update `owner/repo` in workflow triggers to your actual repository
- **GitHub OAuth2 API**: Configure in n8n credentials
- **GitHub API Token**: Personal access token with repo permissions

### 2. Claude AI Integration

- **API Key**: Obtain from https://console.anthropic.com
- **Model**: Default is `claude-3-5-sonnet-20241022`
- **Max Tokens**: Configured as 1024-2048 per request

### 3. Blockchain RPC Endpoints

**IMPORTANT**: The workflow templates contain placeholder RPC endpoints that must be replaced with your actual endpoints.

Replace these URLs in `dj-workflow-multichain.json`:

```json
// Ethereum Network Node
"url": "https://ethereum-rpc-endpoint.com/notify"
// Replace with your actual Ethereum RPC or notification endpoint
// Examples: 
// - Infura: https://mainnet.infura.io/v3/YOUR-PROJECT-ID
// - Alchemy: https://eth-mainnet.g.alchemy.com/v2/YOUR-API-KEY
// - Custom: https://your-ethereum-node.com/notify

// Polygon Network Node
"url": "https://polygon-rpc-endpoint.com/notify"
// Replace with your actual Polygon RPC or notification endpoint
// Examples:
// - Polygon RPC: https://polygon-rpc.com
// - Alchemy: https://polygon-mainnet.g.alchemy.com/v2/YOUR-API-KEY
// - Custom: https://your-polygon-node.com/notify

// Solana Network Node
"url": "https://solana-rpc-endpoint.com/notify"
// Replace with your actual Solana RPC or notification endpoint
// Examples:
// - Solana Mainnet: https://api.mainnet-beta.solana.com
// - Custom: https://your-solana-node.com/notify
```

### 4. Environment-Specific Configuration

For different environments, consider using n8n environment variables:

1. In n8n, go to Settings → Environment Variables
2. Add the following variables:

```
ETHEREUM_RPC_URL=https://your-ethereum-endpoint.com
POLYGON_RPC_URL=https://your-polygon-endpoint.com
SOLANA_RPC_URL=https://your-solana-endpoint.com
```

3. Update the workflow to use these variables:
   - Replace hardcoded URLs with: `={{$env.ETHEREUM_RPC_URL}}`

### 5. Workflow-Specific Settings

#### User Contact Automation Workflow

- **AI Prompt Template**: Located in "Claude AI - Generate Response" node
- **Auto-Labels**: Configure in "GitHub - Add Labels" node (default: `ai-responded`, `needs-triage`)
- **Response Language**: Claude AI auto-detects from issue content

#### DJ Workflow Multi-Chain

- **Branch Filter**: Default filters for `main` branch only
- **Network Selection Logic**: Configured in "Claude AI - Analyze Commit" node
- **Status Context**: Set in "GitHub - Update Status" node

### 6. Security Best Practices

- ✅ Store all sensitive credentials in n8n credential store
- ✅ Never commit API keys or RPC endpoints to git
- ✅ Use environment variables for configuration
- ✅ Enable webhook signature verification (GitHub webhook secret)
- ✅ Regularly rotate API keys
- ✅ Monitor API usage and set up alerts

### 7. Testing Configuration

Before activating workflows in production:

1. **Test with sample data**: Use n8n's "Execute Workflow" with test JSON
2. **Verify API connections**: Check each node connects successfully
3. **Test error handling**: Simulate failures to ensure graceful degradation
4. **Monitor first executions**: Watch logs for the first real triggers

### 8. Monitoring Setup

Configure monitoring for:

- Workflow execution success rate
- API response times
- Error rates by node
- Claude AI token usage
- GitHub API rate limits

### Need Help?

Refer to:
- [n8n Integration Guide](./n8n-integration-guide.md)
- [VPS Setup Guide](./vps-setup-guide.md)
- [Project Summary](./summary.md)

For blockchain RPC providers:
- **Infura**: https://infura.io
- **Alchemy**: https://www.alchemy.com
- **QuickNode**: https://www.quicknode.com
- **Ankr**: https://www.ankr.com
