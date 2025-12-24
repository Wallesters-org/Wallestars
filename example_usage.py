#!/usr/bin/env python3
"""
Example: Custom Configuration for n8n Workflow Checker

This example shows how to use the workflow checker with custom credentials
using environment variables.
"""

import os
import sys

# Add the current directory to the path so we can import our module
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from check_n8n_workflows import N8nClient, display_workflow_status


def main():
    """Main function with environment variable configuration"""
    
    # Get configuration from environment variables
    n8n_url = os.getenv('N8N_URL')
    n8n_email = os.getenv('N8N_EMAIL')
    n8n_password = os.getenv('N8N_PASSWORD')
    
    # Validate configuration
    if not all([n8n_url, n8n_email, n8n_password]):
        print("Error: Missing required environment variables")
        print("\nPlease set the following environment variables:")
        print("  N8N_URL      - Your n8n instance URL")
        print("  N8N_EMAIL    - Your n8n account email")
        print("  N8N_PASSWORD - Your n8n account password")
        print("\nExample:")
        print('  export N8N_URL="https://your-n8n-instance.com"')
        print('  export N8N_EMAIL="user@example.com"')
        print('  export N8N_PASSWORD="your-password"')
        print('  python3 example_usage.py')
        sys.exit(1)
    
    print("=" * 80)
    print("n8n Workflow Status Checker (with environment variables)")
    print("=" * 80)
    print(f"\nConnecting to: {n8n_url}")
    print(f"User: {n8n_email}\n")
    
    # Create client
    client = N8nClient(n8n_url, n8n_email, n8n_password)
    
    # Authenticate
    if not client.authenticate():
        print("\n❌ Failed to authenticate. Please check credentials and URL.")
        sys.exit(1)
    
    # Get workflows
    print("\nFetching workflows...")
    workflows = client.get_workflows()
    
    if workflows is None:
        print("\n❌ Failed to fetch workflows.")
        sys.exit(1)
    
    # Display status
    display_workflow_status(workflows, client)
    
    print(f"{'='*80}")
    print("✓ Report complete")
    print(f"{'='*80}\n")


if __name__ == "__main__":
    main()
