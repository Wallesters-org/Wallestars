#!/usr/bin/env python3
"""
n8n Workflow Status Checker

This script connects to an n8n instance and displays the status of all workflows.
"""

import requests
import json
import sys
from typing import Dict, List, Optional
from datetime import datetime


class N8nClient:
    """Client to interact with n8n API"""
    
    def __init__(self, base_url: str, email: str, password: str):
        """
        Initialize the n8n client
        
        Args:
            base_url: Base URL of the n8n instance (e.g., https://n8n.example.com)
            email: User email for authentication
            password: User password for authentication
        """
        self.base_url = base_url.rstrip('/')
        self.email = email
        self.password = password
        self.session = requests.Session()
        self.authenticated = False
        
    def authenticate(self) -> bool:
        """
        Authenticate with the n8n instance
        
        Returns:
            True if authentication successful, False otherwise
        """
        try:
            # Try to login
            login_url = f"{self.base_url}/rest/login"
            response = self.session.post(
                login_url,
                json={
                    "email": self.email,
                    "password": self.password
                },
                headers={
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code == 200:
                self.authenticated = True
                print("✓ Successfully authenticated with n8n")
                return True
            else:
                print(f"✗ Authentication failed: {response.status_code}")
                print(f"  Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"✗ Authentication error: {str(e)}")
            return False
    
    def get_workflows(self) -> Optional[List[Dict]]:
        """
        Get all workflows from the n8n instance
        
        Returns:
            List of workflow dictionaries or None if error
        """
        if not self.authenticated:
            print("✗ Not authenticated. Please authenticate first.")
            return None
            
        try:
            workflows_url = f"{self.base_url}/rest/workflows"
            response = self.session.get(workflows_url)
            
            if response.status_code == 200:
                data = response.json()
                return data.get('data', data) if isinstance(data, dict) else data
            else:
                print(f"✗ Failed to fetch workflows: {response.status_code}")
                print(f"  Response: {response.text}")
                return None
                
        except Exception as e:
            print(f"✗ Error fetching workflows: {str(e)}")
            return None
    
    def get_executions(self, workflow_id: str, limit: int = 1) -> Optional[List[Dict]]:
        """
        Get recent executions for a workflow
        
        Args:
            workflow_id: ID of the workflow
            limit: Number of executions to retrieve
            
        Returns:
            List of execution dictionaries or None if error
        """
        if not self.authenticated:
            return None
            
        try:
            executions_url = f"{self.base_url}/rest/executions"
            params = {
                "workflowId": workflow_id,
                "limit": limit
            }
            response = self.session.get(executions_url, params=params)
            
            if response.status_code == 200:
                data = response.json()
                return data.get('data', data) if isinstance(data, dict) else data
            else:
                return None
                
        except Exception as e:
            return None


def format_datetime(timestamp: Optional[str]) -> str:
    """Format timestamp string to readable format"""
    if not timestamp:
        return "Never"
    
    try:
        dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        return dt.strftime('%Y-%m-%d %H:%M:%S UTC')
    except (ValueError, TypeError, AttributeError):
        return timestamp


def display_workflow_status(workflows: List[Dict], client: N8nClient):
    """
    Display formatted workflow status
    
    Args:
        workflows: List of workflow dictionaries
        client: N8nClient instance to fetch additional data
    """
    if not workflows:
        print("\n📋 No workflows found")
        return
    
    print(f"\n{'='*80}")
    print(f"📋 WORKFLOW STATUS REPORT")
    print(f"{'='*80}")
    print(f"\nTotal Workflows: {len(workflows)}\n")
    
    active_count = sum(1 for w in workflows if w.get('active', False))
    inactive_count = len(workflows) - active_count
    
    print(f"Active: {active_count} | Inactive: {inactive_count}\n")
    print(f"{'-'*80}\n")
    
    for idx, workflow in enumerate(workflows, 1):
        workflow_id = workflow.get('id', 'N/A')
        name = workflow.get('name', 'Unnamed Workflow')
        active = workflow.get('active', False)
        status_icon = "🟢" if active else "🔴"
        status_text = "ACTIVE" if active else "INACTIVE"
        
        print(f"{idx}. {status_icon} {name}")
        print(f"   ID: {workflow_id}")
        print(f"   Status: {status_text}")
        
        # Get last execution info
        executions = client.get_executions(workflow_id, limit=1)
        if executions and len(executions) > 0:
            last_exec = executions[0]
            exec_status = last_exec.get('status', 'unknown')
            exec_time = last_exec.get('stoppedAt') or last_exec.get('startedAt')
            
            exec_icon = "✓" if exec_status == "success" else "✗" if exec_status == "error" else "⚠"
            print(f"   Last Execution: {exec_icon} {exec_status.upper()} - {format_datetime(exec_time)}")
        else:
            print(f"   Last Execution: Never")
        
        # Additional info
        created_at = workflow.get('createdAt')
        updated_at = workflow.get('updatedAt')
        
        if updated_at:
            print(f"   Last Updated: {format_datetime(updated_at)}")
        
        print()


def main():
    """Main function"""
    # Try to load configuration from config.py
    try:
        from config import N8N_URL, N8N_EMAIL, N8N_PASSWORD
    except ImportError:
        print("Error: config.py not found!")
        print("\nPlease create a config.py file with your credentials.")
        print("You can copy config.example.py and fill in your details:")
        print("  cp config.example.py config.py")
        print("\nThen edit config.py with your credentials.")
        sys.exit(1)
    
    print("=" * 80)
    print("n8n Workflow Status Checker")
    print("=" * 80)
    print(f"\nConnecting to: {N8N_URL}")
    print(f"User: {N8N_EMAIL}\n")
    
    # Create client
    client = N8nClient(N8N_URL, N8N_EMAIL, N8N_PASSWORD)
    
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
