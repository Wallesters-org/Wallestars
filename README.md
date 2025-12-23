# Wallestars - n8n Workflow Status Checker

This repository contains a tool to check the current status of workflows on an n8n automation platform instance.

## Overview

The `check_n8n_workflows.py` script connects to your n8n instance via the REST API and displays a comprehensive status report of all your workflows.

## Features

- 🔐 Secure authentication with n8n instance
- 📋 Lists all workflows with their current status (Active/Inactive)
- ⏱️ Shows last execution status and timestamp for each workflow
- 📊 Provides summary statistics (total workflows, active/inactive counts)
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

### Basic Usage

Simply run the script:
```bash
python3 check_n8n_workflows.py
```

The script is pre-configured with your n8n instance credentials.

### Configuration

The script is configured to connect to:
- **Instance URL**: https://n8n.srv1201204.hstgr.cloud
- **Email**: miropetrovski12@gmail.com
- **Password**: MagicBoyy24#

To change these settings, edit the configuration section in `check_n8n_workflows.py`:

```python
# Configuration
N8N_URL = "https://your-n8n-instance.com"
N8N_EMAIL = "your-email@example.com"
N8N_PASSWORD = "your-password"
```

### Using Environment Variables (Recommended)

For better security, use the `example_usage.py` script with environment variables:

```bash
export N8N_URL="https://n8n.srv1201204.hstgr.cloud"
export N8N_EMAIL="miropetrovski12@gmail.com"
export N8N_PASSWORD="MagicBoyy24#"
python3 example_usage.py
```

This approach keeps credentials out of the source code.

### Sample Output

```
================================================================================
n8n Workflow Status Checker
================================================================================

Connecting to: https://n8n.srv1201204.hstgr.cloud
User: miropetrovski12@gmail.com

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

## Security Note

⚠️ **Important**: This script contains hardcoded credentials. For production use, consider:
- Using environment variables for credentials
- Implementing a secure credential storage solution
- Using API keys instead of username/password authentication

Example with environment variables:
```python
import os

N8N_URL = os.getenv('N8N_URL', 'https://n8n.srv1201204.hstgr.cloud')
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

This tool uses the n8n REST API. For more information, see:
- [n8n API Documentation](https://docs.n8n.io/api/)

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please open an issue in this repository.
