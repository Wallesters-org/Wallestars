#!/usr/bin/env python3
"""
Hostinger VPS Manager - CLI tool for monitoring and managing VPS
Author: Wallestars Team
Version: 1.0.0
"""

import argparse
import json
import os
import sys
import subprocess
from typing import Dict, List, Optional
from datetime import datetime
import requests


class VPSManager:
    """Manager for Hostinger VPS operations"""
    
    def __init__(self):
        self.vps_ip = os.getenv('VPS_IP', '72.61.154.188')
        self.vps_hostname = os.getenv('VPS_HOSTNAME', 'srv1201204.hstgr.cloud')
        self.vps_user = os.getenv('VPS_USER', 'root')
        self.n8n_url = os.getenv('N8N_URL', 'https://n8n.srv1201204.hstgr.cloud')
        self.ssh_key = os.getenv('VPS_SSH_KEY', os.path.expanduser('~/.ssh/id_rsa'))
    
    def _ssh_command(self, command: str) -> tuple[int, str, str]:
        """Execute SSH command on VPS"""
        ssh_cmd = [
            'ssh',
            '-i', self.ssh_key,
            '-o', 'StrictHostKeyChecking=no',
            '-o', 'UserKnownHostsFile=/dev/null',
            '-o', 'ConnectTimeout=10',
            f'{self.vps_user}@{self.vps_ip}',
            command
        ]
        
        try:
            result = subprocess.run(
                ssh_cmd,
                capture_output=True,
                text=True,
                timeout=30
            )
            return result.returncode, result.stdout, result.stderr
        except subprocess.TimeoutExpired:
            return 1, "", "SSH command timed out"
        except Exception as e:
            return 1, "", str(e)
    
    def health_check(self) -> Dict:
        """Comprehensive VPS health check"""
        health = {
            'timestamp': datetime.now().isoformat(),
            'vps': {
                'ip': self.vps_ip,
                'hostname': self.vps_hostname
            },
            'checks': {}
        }
        
        # 1. SSH Connectivity
        returncode, stdout, stderr = self._ssh_command('echo "OK"')
        health['checks']['ssh'] = {
            'status': 'ok' if returncode == 0 else 'error',
            'message': 'SSH connection successful' if returncode == 0 else stderr
        }
        
        if returncode != 0:
            health['overall'] = 'error'
            return health
        
        # 2. Disk Usage
        returncode, stdout, stderr = self._ssh_command('df -h / | tail -1')
        if returncode == 0:
            parts = stdout.split()
            if len(parts) >= 5:
                health['checks']['disk'] = {
                    'status': 'ok',
                    'total': parts[1],
                    'used': parts[2],
                    'available': parts[3],
                    'usage_percent': parts[4]
                }
        
        # 3. Memory Usage
        returncode, stdout, stderr = self._ssh_command('free -h | grep Mem')
        if returncode == 0:
            parts = stdout.split()
            if len(parts) >= 3:
                health['checks']['memory'] = {
                    'status': 'ok',
                    'total': parts[1],
                    'used': parts[2],
                    'available': parts[6] if len(parts) > 6 else 'N/A'
                }
        
        # 4. CPU Load
        returncode, stdout, stderr = self._ssh_command('uptime')
        if returncode == 0:
            health['checks']['cpu_load'] = {
                'status': 'ok',
                'info': stdout.strip()
            }
        
        # 5. Docker Status
        returncode, stdout, stderr = self._ssh_command('docker ps --format "table {{.Names}}\t{{.Status}}" 2>/dev/null || echo "Docker not available"')
        if returncode == 0:
            health['checks']['docker'] = {
                'status': 'ok' if 'Up' in stdout else 'warning',
                'containers': stdout.strip()
            }
        
        # 6. n8n Health
        try:
            response = requests.get(f'{self.n8n_url}/healthz', timeout=10, verify=False)
            health['checks']['n8n'] = {
                'status': 'ok' if response.status_code == 200 else 'error',
                'status_code': response.status_code,
                'url': self.n8n_url
            }
        except Exception as e:
            health['checks']['n8n'] = {
                'status': 'error',
                'message': str(e)
            }
        
        # Overall status
        all_ok = all(
            check.get('status') == 'ok' 
            for check in health['checks'].values()
        )
        health['overall'] = 'ok' if all_ok else 'warning'
        
        return health
    
    def service_status(self, service: str = 'all') -> Dict:
        """Check status of specific service or all services"""
        if service == 'all':
            returncode, stdout, stderr = self._ssh_command(
                'docker ps --format "{{.Names}}: {{.Status}}"'
            )
        else:
            returncode, stdout, stderr = self._ssh_command(
                f'docker ps --filter "name={service}" --format "{{{{.Names}}}}: {{{{.Status}}}}"'
            )
        
        if returncode == 0:
            return {
                'status': 'ok',
                'services': stdout.strip().split('\n') if stdout.strip() else []
            }
        else:
            return {
                'status': 'error',
                'message': stderr
            }
    
    def restart_service(self, service: str) -> bool:
        """Restart a Docker service"""
        returncode, stdout, stderr = self._ssh_command(
            f'docker restart {service}'
        )
        return returncode == 0
    
    def view_logs(self, service: str, lines: int = 50) -> str:
        """View logs for a service"""
        returncode, stdout, stderr = self._ssh_command(
            f'docker logs --tail {lines} {service}'
        )
        return stdout if returncode == 0 else stderr
    
    def deploy_update(self, branch: str = 'main') -> Dict:
        """Deploy updates from Git"""
        commands = [
            'cd /opt/wallestars',
            f'git fetch origin',
            f'git checkout {branch}',
            f'git pull origin {branch}',
            'docker-compose pull',
            'docker-compose up -d'
        ]
        
        full_command = ' && '.join(commands)
        returncode, stdout, stderr = self._ssh_command(full_command)
        
        return {
            'status': 'success' if returncode == 0 else 'error',
            'output': stdout,
            'error': stderr
        }
    
    def backup_database(self) -> Dict:
        """Create database backup"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_file = f'/backups/n8n_backup_{timestamp}.sql'
        
        command = f'docker exec postgres pg_dump -U n8n n8n > {backup_file}'
        returncode, stdout, stderr = self._ssh_command(command)
        
        return {
            'status': 'success' if returncode == 0 else 'error',
            'backup_file': backup_file if returncode == 0 else None,
            'message': stdout or stderr
        }
    
    def system_info(self) -> Dict:
        """Get detailed system information"""
        info = {}
        
        # OS Info
        returncode, stdout, _ = self._ssh_command('cat /etc/os-release | grep PRETTY_NAME')
        if returncode == 0:
            info['os'] = stdout.strip().split('=')[1].strip('"')
        
        # Kernel
        returncode, stdout, _ = self._ssh_command('uname -r')
        if returncode == 0:
            info['kernel'] = stdout.strip()
        
        # Docker version
        returncode, stdout, _ = self._ssh_command('docker --version')
        if returncode == 0:
            info['docker'] = stdout.strip()
        
        # Uptime
        returncode, stdout, _ = self._ssh_command('uptime -p')
        if returncode == 0:
            info['uptime'] = stdout.strip()
        
        return info
    
    def network_test(self) -> Dict:
        """Test network connectivity"""
        tests = {}
        
        # Ping test
        result = subprocess.run(
            ['ping', '-c', '3', self.vps_ip],
            capture_output=True,
            text=True,
            timeout=10
        )
        tests['ping'] = {
            'status': 'ok' if result.returncode == 0 else 'error',
            'output': result.stdout
        }
        
        # HTTP test
        try:
            response = requests.get(f'https://{self.vps_hostname}', timeout=10, verify=False)
            tests['http'] = {
                'status': 'ok',
                'status_code': response.status_code
            }
        except Exception as e:
            tests['http'] = {
                'status': 'error',
                'message': str(e)
            }
        
        return tests


def main():
    """CLI entry point"""
    parser = argparse.ArgumentParser(
        description='Hostinger VPS Manager - Monitor and manage VPS',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s health          # Full health check
  %(prog)s status          # Service status
  %(prog)s restart n8n     # Restart service
  %(prog)s logs n8n        # View logs
  %(prog)s deploy main     # Deploy from main branch
  %(prog)s backup          # Backup database
  %(prog)s info            # System information
        """
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Command to execute')
    
    # Health command
    health_parser = subparsers.add_parser('health', help='Comprehensive health check')
    health_parser.add_argument('--json', action='store_true', help='Output as JSON')
    
    # Status command
    status_parser = subparsers.add_parser('status', help='Check service status')
    status_parser.add_argument('service', nargs='?', default='all', 
                              help='Service name (default: all)')
    
    # Restart command
    restart_parser = subparsers.add_parser('restart', help='Restart a service')
    restart_parser.add_argument('service', help='Service name')
    
    # Logs command
    logs_parser = subparsers.add_parser('logs', help='View service logs')
    logs_parser.add_argument('service', help='Service name')
    logs_parser.add_argument('--lines', type=int, default=50, 
                           help='Number of lines (default: 50)')
    
    # Deploy command
    deploy_parser = subparsers.add_parser('deploy', help='Deploy updates')
    deploy_parser.add_argument('branch', nargs='?', default='main', 
                              help='Git branch (default: main)')
    
    # Backup command
    backup_parser = subparsers.add_parser('backup', help='Backup database')
    
    # Info command
    info_parser = subparsers.add_parser('info', help='System information')
    
    # Network test command
    network_parser = subparsers.add_parser('network', help='Network connectivity test')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return 1
    
    manager = VPSManager()
    
    try:
        if args.command == 'health':
            health = manager.health_check()
            
            if args.json:
                print(json.dumps(health, indent=2))
            else:
                print(f"\n🏥 VPS Health Check - {health['timestamp']}")
                print(f"   IP: {health['vps']['ip']}")
                print(f"   Hostname: {health['vps']['hostname']}")
                print(f"\n   Overall Status: {'✅ OK' if health['overall'] == 'ok' else '⚠️  WARNING'}\n")
                
                for check_name, check_data in health['checks'].items():
                    status_icon = '✅' if check_data['status'] == 'ok' else '❌'
                    print(f"   {status_icon} {check_name.upper()}")
                    
                    for key, value in check_data.items():
                        if key != 'status':
                            print(f"      {key}: {value}")
        
        elif args.command == 'status':
            result = manager.service_status(args.service)
            
            if result['status'] == 'ok':
                print(f"\n📦 Docker Services:\n")
                for service in result['services']:
                    print(f"   {service}")
            else:
                print(f"❌ Error: {result.get('message', 'Unknown error')}", 
                      file=sys.stderr)
                return 1
        
        elif args.command == 'restart':
            print(f"🔄 Restarting {args.service}...")
            
            if manager.restart_service(args.service):
                print(f"✅ Service {args.service} restarted successfully")
            else:
                print(f"❌ Failed to restart {args.service}", file=sys.stderr)
                return 1
        
        elif args.command == 'logs':
            logs = manager.view_logs(args.service, args.lines)
            print(logs)
        
        elif args.command == 'deploy':
            print(f"🚀 Deploying from branch: {args.branch}...")
            
            result = manager.deploy_update(args.branch)
            
            if result['status'] == 'success':
                print(f"✅ Deployment successful!")
                print(f"\nOutput:\n{result['output']}")
            else:
                print(f"❌ Deployment failed!", file=sys.stderr)
                print(f"\nError:\n{result['error']}", file=sys.stderr)
                return 1
        
        elif args.command == 'backup':
            print(f"💾 Creating database backup...")
            
            result = manager.backup_database()
            
            if result['status'] == 'success':
                print(f"✅ Backup created: {result['backup_file']}")
            else:
                print(f"❌ Backup failed: {result['message']}", file=sys.stderr)
                return 1
        
        elif args.command == 'info':
            info = manager.system_info()
            
            print(f"\n💻 VPS System Information:\n")
            for key, value in info.items():
                print(f"   {key.upper()}: {value}")
        
        elif args.command == 'network':
            print(f"🌐 Testing network connectivity...")
            
            tests = manager.network_test()
            
            for test_name, test_data in tests.items():
                status_icon = '✅' if test_data['status'] == 'ok' else '❌'
                print(f"\n{status_icon} {test_name.upper()}:")
                
                for key, value in test_data.items():
                    if key != 'status':
                        print(f"   {key}: {value}")
        
        return 0
    
    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(main())
