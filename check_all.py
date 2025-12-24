#!/usr/bin/env python3
"""
Combined Status Checker - Monitor both n8n workflows and Hostinger VPS

This script provides a unified dashboard for monitoring your infrastructure.
"""

import sys
from check_n8n_workflows import N8nClient, display_workflow_status
from check_hostinger_vps import HostingerClient, display_vps_status, display_account_info


def main():
    """Main function"""
    # Try to load configuration
    try:
        from config import N8N_URL, N8N_EMAIL, N8N_PASSWORD, HOSTINGER_API_TOKEN
    except ImportError as e:
        print("Error: Configuration not found in config.py!")
        print("\nPlease create a config.py file with your credentials.")
        print("You can copy config.example.py and fill in your details:")
        print("  cp config.example.py config.py")
        print("\nMissing:", str(e))
        sys.exit(1)
    
    print("=" * 80)
    print("🚀 UNIFIED INFRASTRUCTURE STATUS DASHBOARD")
    print("=" * 80)
    print()
    
    # Track overall status
    n8n_ok = False
    hostinger_ok = False
    
    # ===== Check n8n Workflows =====
    print("\n" + "=" * 80)
    print("📋 n8n WORKFLOWS")
    print("=" * 80)
    print(f"\nConnecting to: {N8N_URL}")
    print(f"User: {N8N_EMAIL}\n")
    
    n8n_client = N8nClient(N8N_URL, N8N_EMAIL, N8N_PASSWORD)
    
    if n8n_client.authenticate():
        print("\nFetching workflows...")
        workflows = n8n_client.get_workflows()
        
        if workflows is not None:
            display_workflow_status(workflows, n8n_client)
            n8n_ok = True
        else:
            print("❌ Failed to fetch workflows.")
    else:
        print("❌ Failed to authenticate with n8n.")
    
    # ===== Check Hostinger VPS =====
    print("\n" + "=" * 80)
    print("🖥️  HOSTINGER VPS")
    print("=" * 80)
    print()
    
    hostinger_client = HostingerClient(HOSTINGER_API_TOKEN)
    
    if hostinger_client.test_connection():
        # Get account info
        print("\nFetching account information...")
        account_info = hostinger_client.get_account_info()
        if account_info:
            display_account_info(account_info)
        
        # Get VPS list
        print("Fetching VPS instances...")
        vps_list = hostinger_client.get_vps_list()
        
        if vps_list is not None:
            display_vps_status(vps_list, hostinger_client)
            hostinger_ok = True
        else:
            print("❌ Failed to fetch VPS instances.")
    else:
        print("❌ Failed to connect to Hostinger API.")
    
    # ===== Summary =====
    print("\n" + "=" * 80)
    print("📊 SUMMARY")
    print("=" * 80)
    print()
    print(f"n8n Status:       {'✓ Connected' if n8n_ok else '✗ Failed'}")
    print(f"Hostinger Status: {'✓ Connected' if hostinger_ok else '✗ Failed'}")
    print()
    
    if n8n_ok and hostinger_ok:
        print("✓ All systems operational")
        print("=" * 80)
        sys.exit(0)
    else:
        print("⚠ Some systems are not accessible")
        print("=" * 80)
        sys.exit(1)


if __name__ == "__main__":
    main()
