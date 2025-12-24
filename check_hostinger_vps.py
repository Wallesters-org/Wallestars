#!/usr/bin/env python3
"""
Hostinger VPS Status Checker

This script connects to Hostinger API and displays VPS information and status.
"""

import requests
import json
import sys
from typing import Dict, List, Optional
from datetime import datetime


class HostingerClient:
    """Client to interact with Hostinger API"""
    
    def __init__(self, api_token: str):
        """
        Initialize the Hostinger client
        
        Args:
            api_token: Hostinger API token for authentication
        """
        self.api_token = api_token
        self.base_url = "https://api.hostinger.com/v1"
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {api_token}",
            "Content-Type": "application/json"
        })
    
    def test_connection(self) -> bool:
        """
        Test API connection
        
        Returns:
            True if connection successful, False otherwise
        """
        try:
            # Try to get account info as a connection test
            response = self.session.get(f"{self.base_url}/account")
            
            if response.status_code == 200:
                print("✓ Successfully connected to Hostinger API")
                return True
            else:
                print(f"✗ Connection failed: {response.status_code}")
                print(f"  Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"✗ Connection error: {str(e)}")
            return False
    
    def get_vps_list(self) -> Optional[List[Dict]]:
        """
        Get list of VPS instances
        
        Returns:
            List of VPS dictionaries or None if error
        """
        try:
            response = self.session.get(f"{self.base_url}/vps")
            
            if response.status_code == 200:
                data = response.json()
                return data.get('data', data) if isinstance(data, dict) else data
            else:
                print(f"✗ Failed to fetch VPS list: {response.status_code}")
                print(f"  Response: {response.text}")
                return None
                
        except Exception as e:
            print(f"✗ Error fetching VPS list: {str(e)}")
            return None
    
    def get_vps_details(self, vps_id: str) -> Optional[Dict]:
        """
        Get detailed information about a specific VPS
        
        Args:
            vps_id: ID of the VPS instance
            
        Returns:
            VPS details dictionary or None if error
        """
        try:
            response = self.session.get(f"{self.base_url}/vps/{vps_id}")
            
            if response.status_code == 200:
                return response.json()
            else:
                return None
                
        except Exception as e:
            return None
    
    def get_account_info(self) -> Optional[Dict]:
        """
        Get account information
        
        Returns:
            Account info dictionary or None if error
        """
        try:
            response = self.session.get(f"{self.base_url}/account")
            
            if response.status_code == 200:
                return response.json()
            else:
                return None
                
        except Exception as e:
            return None


def format_bytes(bytes_value: int) -> str:
    """Format bytes to human-readable format"""
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if bytes_value < 1024.0:
            return f"{bytes_value:.2f} {unit}"
        bytes_value /= 1024.0
    return f"{bytes_value:.2f} PB"


def display_vps_status(vps_list: List[Dict], client: HostingerClient):
    """
    Display formatted VPS status
    
    Args:
        vps_list: List of VPS dictionaries
        client: HostingerClient instance to fetch additional data
    """
    if not vps_list:
        print("\n📋 No VPS instances found")
        return
    
    print(f"\n{'='*80}")
    print(f"🖥️  VPS STATUS REPORT")
    print(f"{'='*80}")
    print(f"\nTotal VPS Instances: {len(vps_list)}\n")
    print(f"{'-'*80}\n")
    
    for idx, vps in enumerate(vps_list, 1):
        vps_id = vps.get('id', 'N/A')
        name = vps.get('name') or vps.get('hostname', 'Unnamed VPS')
        status = vps.get('status', 'unknown')
        
        # Status icon
        status_icon = "🟢" if status.lower() == 'active' else "🔴" if status.lower() == 'inactive' else "🟡"
        
        print(f"{idx}. {status_icon} {name}")
        print(f"   ID: {vps_id}")
        print(f"   Status: {status.upper()}")
        
        # Additional details if available
        if 'ip' in vps or 'ip_address' in vps:
            ip = vps.get('ip') or vps.get('ip_address')
            print(f"   IP Address: {ip}")
        
        if 'os' in vps or 'operating_system' in vps:
            os = vps.get('os') or vps.get('operating_system')
            print(f"   OS: {os}")
        
        if 'cpu' in vps or 'cpu_cores' in vps:
            cpu = vps.get('cpu') or vps.get('cpu_cores')
            print(f"   CPU: {cpu} cores")
        
        if 'ram' in vps or 'memory' in vps:
            ram = vps.get('ram') or vps.get('memory')
            if isinstance(ram, int):
                print(f"   RAM: {format_bytes(ram)}")
            else:
                print(f"   RAM: {ram}")
        
        if 'disk' in vps or 'storage' in vps:
            disk = vps.get('disk') or vps.get('storage')
            if isinstance(disk, int):
                print(f"   Disk: {format_bytes(disk)}")
            else:
                print(f"   Disk: {disk}")
        
        if 'location' in vps or 'datacenter' in vps:
            location = vps.get('location') or vps.get('datacenter')
            print(f"   Location: {location}")
        
        if 'created_at' in vps:
            print(f"   Created: {vps.get('created_at')}")
        
        print()


def display_account_info(account_info: Dict):
    """
    Display account information
    
    Args:
        account_info: Account info dictionary
    """
    if not account_info:
        return
    
    print(f"\n{'='*80}")
    print(f"👤 ACCOUNT INFORMATION")
    print(f"{'='*80}\n")
    
    if 'email' in account_info:
        print(f"Email: {account_info['email']}")
    
    if 'name' in account_info:
        print(f"Name: {account_info['name']}")
    
    if 'balance' in account_info:
        print(f"Balance: ${account_info['balance']}")
    
    print()


def main():
    """Main function"""
    # Try to load configuration from config.py
    try:
        from config import HOSTINGER_API_TOKEN
    except ImportError:
        print("Error: HOSTINGER_API_TOKEN not found in config.py!")
        print("\nPlease add your Hostinger API token to config.py:")
        print('  HOSTINGER_API_TOKEN = "your-api-token-here"')
        sys.exit(1)
    
    print("=" * 80)
    print("Hostinger VPS Status Checker")
    print("=" * 80)
    print()
    
    # Create client
    client = HostingerClient(HOSTINGER_API_TOKEN)
    
    # Test connection
    if not client.test_connection():
        print("\n❌ Failed to connect to Hostinger API.")
        print("Please check your API token and network connection.")
        sys.exit(1)
    
    # Get account info
    print("\nFetching account information...")
    account_info = client.get_account_info()
    if account_info:
        display_account_info(account_info)
    
    # Get VPS list
    print("Fetching VPS instances...")
    vps_list = client.get_vps_list()
    
    if vps_list is None:
        print("\n❌ Failed to fetch VPS instances.")
        sys.exit(1)
    
    # Display status
    display_vps_status(vps_list, client)
    
    print(f"{'='*80}")
    print("✓ Report complete")
    print(f"{'='*80}\n")


if __name__ == "__main__":
    main()
