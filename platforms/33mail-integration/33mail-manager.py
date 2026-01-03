#!/usr/bin/env python3
"""
33mail Integration Manager
===========================

Manages disposable email addresses using 33mail service.
User: krasavetsa1@33mail.com

Features:
- Create disposable email addresses
- List active addresses
- Manage email forwards
- CLI interface for easy management
"""

import os
import sys
import argparse
import json
import re
from typing import List, Dict, Optional
from datetime import datetime
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class Email33Manager:
    """Manager for 33mail disposable email service."""
    
    def __init__(self, username: str = "krasavetsa1", domain: str = "33mail.com"):
        """
        Initialize 33mail manager.
        
        Args:
            username: 33mail username
            domain: 33mail domain (default: 33mail.com)
        """
        self.username = username
        self.domain = domain
        self.base_email = f"{username}@{domain}"
        
        # Load from environment
        self.api_key = os.getenv("EMAIL_33MAIL_API_KEY", "")
        self.storage_path = os.getenv("EMAIL_33MAIL_STORAGE", 
                                      os.path.expanduser("~/.33mail"))
        
        # Ensure storage directory exists
        os.makedirs(self.storage_path, exist_ok=True)
        
        logger.info(f"Initialized 33mail manager for {self.base_email}")
    
    def generate_email(self, purpose: str, description: str = "") -> str:
        """
        Generate a disposable email address.
        
        Args:
            purpose: Purpose of the email (e.g., 'github', 'newsletter')
            description: Optional description
            
        Returns:
            Generated email address
        """
        # Sanitize purpose for email format
        safe_purpose = re.sub(r'[^a-z0-9_-]', '', purpose.lower())
        
        # Format: krasavetsa1.purpose@33mail.com
        disposable_email = f"{self.username}.{safe_purpose}@{self.domain}"
        
        # Store in local database
        self._store_email(disposable_email, purpose, description)
        
        logger.info(f"Generated disposable email: {disposable_email}")
        return disposable_email
    
    def _store_email(self, email: str, purpose: str, description: str):
        """Store email address in local database."""
        db_file = os.path.join(self.storage_path, "emails.json")
        
        # Load existing data
        if os.path.exists(db_file):
            with open(db_file, 'r') as f:
                data = json.load(f)
        else:
            data = {"emails": []}
        
        # Add new email
        email_entry = {
            "email": email,
            "purpose": purpose,
            "description": description,
            "created_at": datetime.now().isoformat(),
            "active": True
        }
        
        # Check if email already exists
        existing = [e for e in data["emails"] if e["email"] == email]
        if not existing:
            data["emails"].append(email_entry)
            
            # Save
            with open(db_file, 'w') as f:
                json.dump(data, f, indent=2)
            
            logger.info(f"Stored email in database: {email}")
    
    def list_emails(self, active_only: bool = True) -> List[Dict]:
        """
        List all disposable email addresses.
        
        Args:
            active_only: Only show active emails
            
        Returns:
            List of email dictionaries
        """
        db_file = os.path.join(self.storage_path, "emails.json")
        
        if not os.path.exists(db_file):
            logger.warning("No emails database found")
            return []
        
        with open(db_file, 'r') as f:
            data = json.load(f)
        
        emails = data.get("emails", [])
        
        if active_only:
            emails = [e for e in emails if e.get("active", True)]
        
        return emails
    
    def deactivate_email(self, email: str):
        """Mark an email as inactive."""
        db_file = os.path.join(self.storage_path, "emails.json")
        
        if not os.path.exists(db_file):
            logger.error("No emails database found")
            return
        
        with open(db_file, 'r') as f:
            data = json.load(f)
        
        # Find and deactivate
        for email_entry in data["emails"]:
            if email_entry["email"] == email:
                email_entry["active"] = False
                email_entry["deactivated_at"] = datetime.now().isoformat()
                break
        
        # Save
        with open(db_file, 'w') as f:
            json.dump(data, f, indent=2)
        
        logger.info(f"Deactivated email: {email}")
    
    def get_forward_address(self) -> str:
        """Get the main forward address."""
        forward_email = os.getenv("EMAIL_33MAIL_FORWARD", "")
        if not forward_email:
            logger.warning("EMAIL_33MAIL_FORWARD not set in environment")
        return forward_email or self.base_email
    
    def format_for_service(self, service_name: str) -> str:
        """
        Generate formatted email for a specific service.
        
        Args:
            service_name: Name of the service (e.g., 'github', 'npm', 'discord')
            
        Returns:
            Formatted email address
        """
        return self.generate_email(service_name, f"Disposable email for {service_name}")


def main():
    """CLI interface for 33mail manager."""
    parser = argparse.ArgumentParser(
        description="Manage 33mail disposable email addresses",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate email for GitHub
  %(prog)s generate github "For GitHub notifications"
  
  # List all active emails
  %(prog)s list
  
  # List all emails (including inactive)
  %(prog)s list --all
  
  # Deactivate an email
  %(prog)s deactivate krasavetsa1.github@33mail.com
  
  # Get main forward address
  %(prog)s forward
        """
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Generate command
    gen_parser = subparsers.add_parser('generate', help='Generate disposable email')
    gen_parser.add_argument('purpose', help='Purpose/service name (e.g., github, npm)')
    gen_parser.add_argument('description', nargs='?', default='', 
                           help='Optional description')
    
    # List command
    list_parser = subparsers.add_parser('list', help='List disposable emails')
    list_parser.add_argument('--all', action='store_true', 
                            help='Show all emails including inactive')
    
    # Deactivate command
    deact_parser = subparsers.add_parser('deactivate', help='Deactivate an email')
    deact_parser.add_argument('email', help='Email address to deactivate')
    
    # Forward command
    forward_parser = subparsers.add_parser('forward', 
                                          help='Show main forward address')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return 1
    
    # Initialize manager
    manager = Email33Manager()
    
    # Execute command
    if args.command == 'generate':
        email = manager.generate_email(args.purpose, args.description)
        print(f"✅ Generated: {email}")
        print(f"📬 Forwards to: {manager.get_forward_address()}")
        
    elif args.command == 'list':
        emails = manager.list_emails(active_only=not args.all)
        
        if not emails:
            print("No emails found")
            return 0
        
        print(f"\n{'Email':<50} {'Purpose':<20} {'Created':<20} {'Status':<10}")
        print("=" * 100)
        
        for email_entry in emails:
            status = "✅ Active" if email_entry.get("active", True) else "❌ Inactive"
            created = email_entry.get("created_at", "Unknown")[:10]
            
            print(f"{email_entry['email']:<50} {email_entry['purpose']:<20} "
                  f"{created:<20} {status:<10}")
        
        print(f"\nTotal: {len(emails)} emails")
        
    elif args.command == 'deactivate':
        manager.deactivate_email(args.email)
        print(f"✅ Deactivated: {args.email}")
        
    elif args.command == 'forward':
        forward = manager.get_forward_address()
        print(f"📬 Main forward address: {forward}")
        print(f"💡 Set with: export EMAIL_33MAIL_FORWARD=your@email.com")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
