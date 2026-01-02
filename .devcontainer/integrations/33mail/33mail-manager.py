#!/usr/bin/env python3
"""
33mail Manager - CLI tool for managing disposable email addresses
Author: Wallestars Team
Version: 1.0.0
"""

import argparse
import json
import os
import sys
import re
from datetime import datetime
from typing import Optional, Dict, List
import subprocess


class MailManager:
    """Manager for 33mail disposable email addresses"""
    
    def __init__(self, username: str = "krasavetsa1", domain: str = "33mail.com"):
        self.username = username
        self.domain = domain
        self.config_dir = os.path.expanduser("~/.config/33mail")
        self.aliases_file = os.path.join(self.config_dir, "aliases.json")
        self._ensure_config_dir()
    
    def _ensure_config_dir(self):
        """Create config directory if it doesn't exist"""
        os.makedirs(self.config_dir, exist_ok=True)
    
    def _load_aliases(self) -> Dict:
        """Load saved aliases from config"""
        if os.path.exists(self.aliases_file):
            with open(self.aliases_file, 'r') as f:
                return json.load(f)
        return {}
    
    def _save_aliases(self, aliases: Dict):
        """Save aliases to config"""
        with open(self.aliases_file, 'w') as f:
            json.dump(aliases, f, indent=2)
    
    def create_alias(self, purpose: str, description: str = "") -> str:
        """
        Create a new 33mail alias
        
        Args:
            purpose: Purpose identifier (e.g., 'github', 'newsletter')
            description: Optional description
        
        Returns:
            Full email address
        """
        # Sanitize purpose (only alphanumeric and hyphens)
        purpose = re.sub(r'[^a-zA-Z0-9-]', '', purpose.lower())
        
        email = f"{self.username}.{purpose}@{self.domain}"
        
        # Save to local config
        aliases = self._load_aliases()
        aliases[purpose] = {
            "email": email,
            "description": description,
            "created_at": datetime.now().isoformat(),
            "active": True
        }
        self._save_aliases(aliases)
        
        return email
    
    def list_aliases(self, active_only: bool = True) -> List[Dict]:
        """List all saved aliases"""
        aliases = self._load_aliases()
        
        result = []
        for purpose, data in aliases.items():
            if not active_only or data.get('active', True):
                result.append({
                    'purpose': purpose,
                    **data
                })
        
        return sorted(result, key=lambda x: x.get('created_at', ''), reverse=True)
    
    def deactivate_alias(self, purpose: str) -> bool:
        """Mark an alias as deactivated (but keep in history)"""
        aliases = self._load_aliases()
        
        if purpose not in aliases:
            return False
        
        aliases[purpose]['active'] = False
        aliases[purpose]['deactivated_at'] = datetime.now().isoformat()
        self._save_aliases(aliases)
        
        return True
    
    def get_alias(self, purpose: str) -> Optional[str]:
        """Get email address for a specific purpose"""
        aliases = self._load_aliases()
        
        if purpose in aliases and aliases[purpose].get('active', True):
            return aliases[purpose]['email']
        
        return None
    
    def search_aliases(self, query: str) -> List[Dict]:
        """Search aliases by purpose or description"""
        aliases = self._load_aliases()
        query = query.lower()
        
        result = []
        for purpose, data in aliases.items():
            if (query in purpose.lower() or 
                query in data.get('description', '').lower()):
                result.append({
                    'purpose': purpose,
                    **data
                })
        
        return result
    
    def export_aliases(self, format: str = 'json') -> str:
        """Export all aliases"""
        aliases = self._load_aliases()
        
        if format == 'json':
            return json.dumps(aliases, indent=2)
        elif format == 'csv':
            import csv
            from io import StringIO
            
            output = StringIO()
            writer = csv.writer(output)
            writer.writerow(['Purpose', 'Email', 'Description', 'Created', 'Active'])
            
            for purpose, data in aliases.items():
                writer.writerow([
                    purpose,
                    data.get('email', ''),
                    data.get('description', ''),
                    data.get('created_at', ''),
                    data.get('active', True)
                ])
            
            return output.getvalue()
        else:
            raise ValueError(f"Unsupported format: {format}")
    
    def stats(self) -> Dict:
        """Get statistics about aliases"""
        aliases = self._load_aliases()
        
        total = len(aliases)
        active = sum(1 for a in aliases.values() if a.get('active', True))
        inactive = total - active
        
        return {
            'total': total,
            'active': active,
            'inactive': inactive,
            'username': self.username,
            'domain': self.domain
        }


def main():
    """CLI entry point"""
    parser = argparse.ArgumentParser(
        description='33mail Manager - Manage disposable email addresses',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s create github "GitHub account"
  %(prog)s list
  %(prog)s get github
  %(prog)s deactivate newsletter
  %(prog)s search "social"
  %(prog)s stats
        """
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Command to execute')
    
    # Create command
    create_parser = subparsers.add_parser('create', help='Create a new alias')
    create_parser.add_argument('purpose', help='Purpose identifier (e.g., github)')
    create_parser.add_argument('description', nargs='?', default='', 
                              help='Optional description')
    
    # List command
    list_parser = subparsers.add_parser('list', help='List all aliases')
    list_parser.add_argument('--all', action='store_true', 
                           help='Include deactivated aliases')
    
    # Get command
    get_parser = subparsers.add_parser('get', help='Get email for a purpose')
    get_parser.add_argument('purpose', help='Purpose identifier')
    
    # Deactivate command
    deactivate_parser = subparsers.add_parser('deactivate', 
                                             help='Deactivate an alias')
    deactivate_parser.add_argument('purpose', help='Purpose identifier')
    
    # Search command
    search_parser = subparsers.add_parser('search', help='Search aliases')
    search_parser.add_argument('query', help='Search query')
    
    # Export command
    export_parser = subparsers.add_parser('export', help='Export all aliases')
    export_parser.add_argument('--format', choices=['json', 'csv'], 
                              default='json', help='Export format')
    
    # Stats command
    stats_parser = subparsers.add_parser('stats', help='Show statistics')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return 1
    
    manager = MailManager()
    
    try:
        if args.command == 'create':
            email = manager.create_alias(args.purpose, args.description)
            print(f"✅ Created: {email}")
            print(f"📋 Copied to clipboard!")
            # Try to copy to clipboard
            try:
                subprocess.run(['xclip', '-selection', 'clipboard'], 
                             input=email.encode(), check=False)
            except FileNotFoundError:
                pass
        
        elif args.command == 'list':
            aliases = manager.list_aliases(active_only=not args.all)
            
            if not aliases:
                print("No aliases found.")
                return 0
            
            print(f"\n{'Purpose':<20} {'Email':<50} {'Created':<20}")
            print("-" * 90)
            
            for alias in aliases:
                status = "❌" if not alias.get('active', True) else "✅"
                print(f"{status} {alias['purpose']:<18} {alias['email']:<48} "
                      f"{alias.get('created_at', 'N/A')[:10]}")
                
                if alias.get('description'):
                    print(f"   └─ {alias['description']}")
            
            print(f"\nTotal: {len(aliases)} aliases")
        
        elif args.command == 'get':
            email = manager.get_alias(args.purpose)
            
            if email:
                print(email)
                # Copy to clipboard
                try:
                    subprocess.run(['xclip', '-selection', 'clipboard'], 
                                 input=email.encode(), check=False)
                except FileNotFoundError:
                    pass
            else:
                print(f"❌ Alias '{args.purpose}' not found or inactive", 
                      file=sys.stderr)
                return 1
        
        elif args.command == 'deactivate':
            if manager.deactivate_alias(args.purpose):
                print(f"✅ Deactivated: {args.purpose}")
            else:
                print(f"❌ Alias '{args.purpose}' not found", file=sys.stderr)
                return 1
        
        elif args.command == 'search':
            results = manager.search_aliases(args.query)
            
            if not results:
                print(f"No aliases matching '{args.query}'")
                return 0
            
            print(f"\nFound {len(results)} matching aliases:\n")
            
            for alias in results:
                status = "✅" if alias.get('active', True) else "❌"
                print(f"{status} {alias['purpose']}: {alias['email']}")
                
                if alias.get('description'):
                    print(f"   └─ {alias['description']}")
        
        elif args.command == 'export':
            output = manager.export_aliases(args.format)
            print(output)
        
        elif args.command == 'stats':
            stats = manager.stats()
            
            print("\n📊 33mail Statistics:")
            print(f"   Username: {stats['username']}")
            print(f"   Domain:   {stats['domain']}")
            print(f"   Total:    {stats['total']}")
            print(f"   Active:   {stats['active']}")
            print(f"   Inactive: {stats['inactive']}")
        
        return 0
    
    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
