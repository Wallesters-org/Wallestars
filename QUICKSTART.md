# Quick Reference Guide

## Initial Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Wallesters-org/Wallestars.git
   cd Wallestars
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Create configuration:**
   ```bash
   cp config.example.py config.py
   ```

4. **Edit config.py with your credentials:**
   ```python
   N8N_URL = "https://your-n8n-instance.com"
   N8N_EMAIL = "your-email@example.com"
   N8N_PASSWORD = "your-password"
   HOSTINGER_API_TOKEN = "your-api-token"
   MAIL33_USERNAME = "your-33mail-username"  # Placeholder for future use
   MAIL33_PASSWORD = "your-33mail-password"  # Placeholder for future use
   ```

## Available Commands

### Check n8n Workflows
```bash
python3 check_n8n_workflows.py
```
Shows all n8n workflows with their status, last execution, and timestamps.

### Check Hostinger VPS
```bash
python3 check_hostinger_vps.py
```
Shows all VPS instances with specifications, status, and account information.

### Check 33Mail Aliases
```bash
python3 check_33mail.py
```
Note: Placeholder implementation. 33Mail does not have a public API yet.

### Unified Dashboard
```bash
python3 check_all.py
```
Shows everything in one consolidated view.

### Using Environment Variables
```bash
export N8N_URL="https://your-n8n-instance.com"
export N8N_EMAIL="your-email@example.com"
export N8N_PASSWORD="your-password"
python3 example_usage.py
```

## What Each Script Does

| Script | Purpose |
|--------|---------|
| `check_n8n_workflows.py` | Monitor n8n automation workflows |
| `check_hostinger_vps.py` | Monitor Hostinger VPS instances |
| `check_33mail.py` | Monitor 33Mail aliases (placeholder) |
| `check_all.py` | Unified dashboard for all systems |
| `example_usage.py` | Example using environment variables |

## Troubleshooting

### "config.py not found"
Run: `cp config.example.py config.py` and edit with your credentials.

### "Authentication failed"
Check your credentials in `config.py` are correct.

### "Connection error"
Verify your network connection and that the services are accessible.

## Security Best Practices

✅ **DO:**
- Keep `config.py` private (it's gitignored)
- Use environment variables in shared environments
- Regularly rotate your API tokens

❌ **DON'T:**
- Commit `config.py` to version control
- Share your `config.py` file
- Use production credentials in test environments
