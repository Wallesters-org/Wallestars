# n8n Workflow Templates

## ⚠️ IMPORTANT: Configuration Required Before Use

These are **TEMPLATE** workflows that require configuration before they will function. Do not import and activate them without completing the configuration steps below.

## Required Configuration Steps

### Before importing ANY workflow:

1. **Read the Configuration Guide**: See [CONFIG.md](./CONFIG.md) for detailed instructions

2. **Replace Placeholder Values**:
   - `owner/repo` → Your actual GitHub repository (e.g., `Wallesters-org/Wallestars`)
   - RPC endpoint URLs → Your actual blockchain node endpoints
   - Webhook IDs → Will be auto-generated on import

3. **Configure Credentials in n8n**:
   - GitHub API credentials
   - Claude AI API credentials
   - Any additional authentication needed

## Available Workflows

### 1. User Contact Automation (`user-contact-automation.json`)

**Purpose**: Automatically respond to GitHub issues and discussions with AI-generated messages

**Required Configuration**:
- ✅ Update `repository` parameter in "GitHub Webhook Trigger" node (line 12)
- ✅ Configure GitHub OAuth2 API credentials in n8n
- ✅ Configure Claude AI API credentials in n8n
- ✅ Adjust AI prompt template if needed (line 86)
- ✅ Customize auto-labels (line 124)

**Placeholders to Replace**:
```json
"repository": "owner/repo" → "repository": "Wallesters-org/Wallestars"
```

### 2. DJ Workflow Multi-Chain (`dj-workflow-multichain.json`)

**Purpose**: Intelligent multi-chain blockchain deployment routing

**Required Configuration**:
- ✅ Update `repository` parameter in "GitHub Events Trigger" node (line 11)
- ✅ Replace placeholder RPC endpoints (lines 180, 210, 240):
  - `https://ethereum-rpc-endpoint.com/notify`
  - `https://polygon-rpc-endpoint.com/notify`
  - `https://solana-rpc-endpoint.com/notify`
- ✅ Configure GitHub and Claude AI credentials
- ✅ Adjust network detection logic if needed

**Placeholders to Replace**:
```json
"repository": "owner/repo" → "repository": "Your-Org/Your-Repo"
"url": "https://ethereum-rpc-endpoint.com/notify" → Your actual Ethereum endpoint
"url": "https://polygon-rpc-endpoint.com/notify" → Your actual Polygon endpoint
"url": "https://solana-rpc-endpoint.com/notify" → Your actual Solana endpoint
```

## How to Use These Templates

### Step 1: Configure Credentials in n8n

1. Open n8n web interface
2. Go to **Settings** → **Credentials**
3. Add credentials for:
   - GitHub API (Personal Access Token)
   - Claude AI API (API Key from Anthropic)

### Step 2: Edit the JSON Files

**Option A**: Edit before importing (Recommended)
```bash
# Make a copy of the template
cp user-contact-automation.json user-contact-automation-configured.json

# Edit with your values
nano user-contact-automation-configured.json
# Replace all placeholders with actual values
```

**Option B**: Import then edit in n8n UI
1. Import the template file
2. Click on each node
3. Update placeholder values
4. Save the workflow

### Step 3: Import to n8n

1. In n8n, click **Workflows** → **Import from File**
2. Select the configured JSON file
3. Review all nodes for correct values
4. Assign credentials to appropriate nodes

### Step 4: Test Before Activating

1. Click **Execute Workflow** to test manually
2. Verify all nodes execute successfully
3. Check execution logs for errors
4. Test with sample GitHub event

### Step 5: Activate

Once tested and verified:
1. Click the **Active** toggle
2. Monitor first few real executions
3. Review logs regularly

## Common Configuration Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Repository not found" | `owner/repo` not updated | Replace with actual repository |
| "Connection refused" | Placeholder RPC URL | Replace with actual endpoint |
| "Invalid credentials" | Credentials not configured | Add credentials in n8n settings |
| "Webhook not triggering" | Webhook not set up in GitHub | Configure webhook in repo settings |

## Security Checklist

Before deploying to production:

- [ ] All placeholder values replaced with actual values
- [ ] Credentials stored securely in n8n (not hardcoded)
- [ ] API keys have appropriate permissions (not over-privileged)
- [ ] GitHub webhook has secret token configured
- [ ] n8n instance has SSL/TLS enabled
- [ ] Basic authentication enabled on n8n
- [ ] Firewall rules configured
- [ ] Regular backups scheduled

## RPC Endpoint Providers

If you need blockchain RPC endpoints:

### Ethereum
- **Infura**: https://infura.io (Free tier available)
- **Alchemy**: https://alchemy.com (Free tier available)
- **QuickNode**: https://quicknode.com

### Polygon
- **Alchemy**: https://alchemy.com/polygon
- **QuickNode**: https://quicknode.com/chains/matic
- **Public RPC**: https://polygon-rpc.com (Free but rate limited)

### Solana
- **QuickNode**: https://quicknode.com/chains/solana
- **Alchemy**: https://alchemy.com/solana
- **GenesysGo**: https://genesysgo.com

## Testing Checklist

Before activating workflows:

- [ ] All placeholders replaced
- [ ] Credentials configured
- [ ] Manual execution successful
- [ ] GitHub webhook configured
- [ ] Webhook test delivery successful
- [ ] Claude AI responding correctly
- [ ] Error handling tested (with invalid data)
- [ ] Logs reviewed
- [ ] Monitoring set up

## Support

For issues:
1. Check [CONFIG.md](./CONFIG.md) for configuration details
2. Review [n8n Integration Guide](../docs/n8n-integration-guide.md)
3. Consult [VPS Setup Guide](../docs/vps-setup-guide.md)
4. Create an issue in the repository

## Version History

- **v1.0** (2026-01): Initial release with user contact automation and multi-chain support

---

**Remember**: These are templates! They will NOT work without proper configuration.
