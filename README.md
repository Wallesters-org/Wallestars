# Wallestars - Infrastructure Monitoring Tools

This repository contains tools to monitor your cloud infrastructure and automation workflows.

## Overview

**Multiple monitoring scripts for your infrastructure:**
- `check_n8n_workflows.py` - Monitor n8n automation workflows
- `check_hostinger_vps.py` - Monitor Hostinger VPS instances
- `check_33mail.py` - Monitor 33Mail email aliases (placeholder)
- `check_all.py` - Unified dashboard for all systems
- `example_usage.py` - Example using environment variables

## Features

### n8n Workflow Monitoring
- 🔐 Secure authentication with n8n instance
- 📋 Lists all workflows with their current status (Active/Inactive)
- ⏱️ Shows last execution status and timestamp for each workflow
- 📊 Provides summary statistics (total workflows, active/inactive counts)

### Hostinger VPS Monitoring
- 🖥️ List all VPS instances
- 📊 Display VPS status, specifications, and details
- 💰 Show account information and balance
- 📍 View datacenter locations

### 33Mail Alias Monitoring
- 📧 Monitor email aliases (placeholder implementation)
- ⚠️ Note: 33Mail does not currently provide a public API
- 🔮 Framework in place for future integration when API becomes available

### Unified Dashboard
- 🚀 Single command to check all systems
- 📈 Consolidated status summary
- ✨ Color-coded output with emoji indicators for easy readability

## Prerequisites

- Python 3.7 or higher
- `requests` library (install via `pip install requests`)

## Installation

1. Clone this repository:
```bash
git clone https://github.com/Wallesters-org/Wallestars.git
cd Wallestars
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Usage

### Setup Configuration

First, create your configuration file with your credentials:

```bash
cp config.example.py config.py
```

Then edit `config.py` with your credentials:

```python
# n8n Configuration
N8N_URL = "https://your-n8n-instance.com"
N8N_EMAIL = "your-email@example.com"
N8N_PASSWORD = "your-password"

# Hostinger API Configuration
HOSTINGER_API_TOKEN = "your-hostinger-api-token"

# 33Mail Configuration (placeholder for future use)
MAIL33_USERNAME = "your-33mail-username"
MAIL33_PASSWORD = "your-33mail-password"
```

⚠️ **Important**: The `config.py` file is gitignored and will not be committed to version control to protect your credentials.

### Basic Usage

Once configured, you can run individual checks or a unified dashboard:

**Check n8n workflows only:**
```bash
python3 check_n8n_workflows.py
```

**Check Hostinger VPS only:**
```bash
python3 check_hostinger_vps.py
```

**Check 33Mail aliases (placeholder):**
```bash
python3 check_33mail.py
```

**Check everything (unified dashboard):**
```bash
python3 check_all.py
```

### Using Environment Variables (Alternative)

For better security in shared environments, use the `example_usage.py` script with environment variables:

```bash
export N8N_URL="https://your-n8n-instance.com"
export N8N_EMAIL="your-email@example.com"
export N8N_PASSWORD="your-password"
python3 example_usage.py
```

This approach keeps credentials out of the source code.

### Sample Output

```
================================================================================
n8n Workflow Status Checker
================================================================================

Connecting to: https://your-n8n-instance.com
User: user@example.com

✓ Successfully authenticated with n8n

Fetching workflows...

================================================================================
📋 WORKFLOW STATUS REPORT
================================================================================

Total Workflows: 5

Active: 3 | Inactive: 2

--------------------------------------------------------------------------------

1. 🟢 Customer Onboarding Flow
   ID: 1
   Status: ACTIVE
   Last Execution: ✓ SUCCESS - 2025-12-23 15:30:45 UTC
   Last Updated: 2025-12-22 10:15:20 UTC

2. 🔴 Data Backup Workflow
   ID: 2
   Status: INACTIVE
   Last Execution: ✓ SUCCESS - 2025-12-20 08:00:12 UTC
   Last Updated: 2025-12-15 14:22:33 UTC

3. 🟢 Email Campaign Sender
   ID: 3
   Status: ACTIVE
   Last Execution: ✗ ERROR - 2025-12-23 16:45:01 UTC
   Last Updated: 2025-12-23 09:30:15 UTC

================================================================================
✓ Report complete
================================================================================
```

## Output Explanation

### Status Indicators

- 🟢 **Green Circle**: Workflow is ACTIVE
- 🔴 **Red Circle**: Workflow is INACTIVE

### Execution Status

- ✓ **Checkmark**: Last execution was successful
- ✗ **X Mark**: Last execution had an error
- ⚠ **Warning**: Execution is in progress or has an unknown status

## Troubleshooting

### Authentication Failed

If you see an authentication error:
1. Verify your email and password are correct
2. Check that your n8n instance URL is correct and accessible
3. Ensure your user account has the necessary permissions

### Connection Errors

If you see connection errors:
1. Check your internet connection
2. Verify the n8n instance is running and accessible
3. Check if there are any firewall rules blocking the connection

### No Workflows Found

If no workflows are displayed:
1. Verify workflows exist in your n8n instance
2. Check that your user has permissions to view workflows

## Getting Your API Credentials

### n8n API
The scripts use your n8n login credentials (email and password) to authenticate via the REST API.

### Hostinger API Token
To get your Hostinger API token:
1. Log in to your Hostinger account
2. Go to the API section in your account settings
3. Generate a new API token
4. Copy the token and add it to your `config.py` file

### 33Mail Credentials
33Mail integration is currently a placeholder:
- 33Mail does not provide a public API at this time
- The script is structured to support future API integration
- For now, manage your aliases at https://www.33mail.com/
- Your credentials in `config.py` are reserved for future use

## Security Note

⚠️ **Important**: Credentials are stored in the gitignored `config.py` file. For production use, consider:
- Using environment variables for credentials
- Implementing a secure credential storage solution
- Using API keys instead of username/password authentication

Example with environment variables:
```python
import os

N8N_URL = os.getenv('N8N_URL')  # No default - must be explicitly set
N8N_EMAIL = os.getenv('N8N_EMAIL')
N8N_PASSWORD = os.getenv('N8N_PASSWORD')
```

Then run:
```bash
export N8N_EMAIL="your-email@example.com"
export N8N_PASSWORD="your-password"
python3 check_n8n_workflows.py
```

## API Documentation

This tool uses multiple APIs:
- [n8n API Documentation](https://docs.n8n.io/api/)
- [Hostinger API Documentation](https://www.hostinger.com/api-documentation)
- [33Mail Website](https://www.33mail.com/) - No public API currently available

## Files in This Repository

- `check_n8n_workflows.py` - n8n workflow status checker
- `check_hostinger_vps.py` - Hostinger VPS status checker
- `check_33mail.py` - 33Mail alias checker (placeholder)
- `check_all.py` - Unified dashboard for all systems
- `example_usage.py` - Example using environment variables
- `config.example.py` - Configuration template
- `requirements.txt` - Python dependencies
- `.gitignore` - Excludes sensitive files from version control

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please open an issue in this repository.
