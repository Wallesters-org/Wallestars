#!/usr/bin/env python3
"""
Hostinger VPS Manager
=====================

Manages Hostinger VPS infrastructure and deployments.
VPS: srv1201204.hstgr.cloud (72.61.154.188)

Features:
- Health checks and monitoring
- Service management (n8n, Docker, etc.)
- Deployment automation
- SSH command execution
- Resource monitoring
"""

import os
import sys
import argparse
import subprocess
import json
import time
import requests
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class HostingerVPSManager:
    """Manager for Hostinger VPS operations."""
    
    def __init__(self):
        """Initialize VPS manager with configuration from environment."""
        # VPS Configuration
        self.vps_host = os.getenv("VPS_HOST", "srv1201204.hstgr.cloud")
        self.vps_ip = os.getenv("VPS_IP", "72.61.154.188")
        self.vps_user = os.getenv("VPS_USER", "root")
        self.ssh_key_path = os.getenv("SSH_KEY_PATH", os.path.expanduser("~/.ssh/id_rsa"))
        
        # Service URLs
        self.n8n_url = os.getenv("N8N_URL", f"https://n8n.{self.vps_host}")
        self.n8n_api_key = os.getenv("N8N_API_KEY", "")
        
        logger.info(f"Initialized VPS manager for {self.vps_host} ({self.vps_ip})")
    
    def ssh_execute(self, command: str, timeout: int = 30) -> Tuple[int, str, str]:
        """
        Execute command on VPS via SSH.
        
        Args:
            command: Command to execute
            timeout: Command timeout in seconds
            
        Returns:
            Tuple of (return_code, stdout, stderr)
        """
        ssh_command = [
            "ssh",
            "-o", "StrictHostKeyChecking=no",
            "-o", "UserKnownHostsFile=/dev/null",
            "-o", f"ConnectTimeout={timeout}",
            "-i", self.ssh_key_path,
            f"{self.vps_user}@{self.vps_ip}",
            command
        ]
        
        try:
            result = subprocess.run(
                ssh_command,
                capture_output=True,
                text=True,
                timeout=timeout
            )
            return result.returncode, result.stdout, result.stderr
        except subprocess.TimeoutExpired:
            logger.error(f"SSH command timed out after {timeout}s")
            return 1, "", "Command timed out"
        except Exception as e:
            logger.error(f"SSH execution failed: {e}")
            return 1, "", str(e)
    
    def health_check(self) -> Dict:
        """
        Perform comprehensive health check on VPS.
        
        Returns:
            Dictionary with health status
        """
        logger.info("Performing health check...")
        
        health = {
            "timestamp": datetime.now().isoformat(),
            "vps_host": self.vps_host,
            "vps_ip": self.vps_ip,
            "checks": {}
        }
        
        # 1. Ping check
        logger.info("Checking connectivity...")
        ret, _, _ = self.ssh_execute("echo 'ping'", timeout=10)
        health["checks"]["ssh_connectivity"] = {
            "status": "✅ OK" if ret == 0 else "❌ FAILED",
            "success": ret == 0
        }
        
        # 2. System uptime
        logger.info("Checking system uptime...")
        ret, stdout, _ = self.ssh_execute("uptime")
        health["checks"]["system_uptime"] = {
            "status": "✅ OK" if ret == 0 else "❌ FAILED",
            "data": stdout.strip() if ret == 0 else "N/A"
        }
        
        # 3. Disk usage
        logger.info("Checking disk usage...")
        ret, stdout, _ = self.ssh_execute("df -h / | tail -1")
        if ret == 0:
            parts = stdout.split()
            if len(parts) >= 5:
                health["checks"]["disk_usage"] = {
                    "status": "✅ OK",
                    "total": parts[1],
                    "used": parts[2],
                    "available": parts[3],
                    "percent": parts[4]
                }
        else:
            health["checks"]["disk_usage"] = {"status": "❌ FAILED"}
        
        # 4. Memory usage
        logger.info("Checking memory usage...")
        ret, stdout, _ = self.ssh_execute("free -h | grep Mem")
        if ret == 0:
            parts = stdout.split()
            if len(parts) >= 3:
                health["checks"]["memory_usage"] = {
                    "status": "✅ OK",
                    "total": parts[1],
                    "used": parts[2],
                    "available": parts[6] if len(parts) > 6 else "N/A"
                }
        else:
            health["checks"]["memory_usage"] = {"status": "❌ FAILED"}
        
        # 5. Docker status
        logger.info("Checking Docker...")
        ret, stdout, _ = self.ssh_execute("docker --version")
        health["checks"]["docker"] = {
            "status": "✅ OK" if ret == 0 else "❌ FAILED",
            "version": stdout.strip() if ret == 0 else "N/A"
        }
        
        # 6. Docker containers
        logger.info("Checking Docker containers...")
        ret, stdout, _ = self.ssh_execute("docker ps --format '{{.Names}}: {{.Status}}'")
        if ret == 0:
            containers = [line for line in stdout.strip().split('\n') if line]
            health["checks"]["docker_containers"] = {
                "status": "✅ OK",
                "count": len(containers),
                "containers": containers
            }
        else:
            health["checks"]["docker_containers"] = {"status": "❌ FAILED"}
        
        # 7. n8n service check
        logger.info("Checking n8n service...")
        try:
            response = requests.get(self.n8n_url, timeout=10, verify=False)
            health["checks"]["n8n_service"] = {
                "status": "✅ OK" if response.status_code in [200, 401] else "⚠️  WARNING",
                "status_code": response.status_code,
                "url": self.n8n_url
            }
        except Exception as e:
            health["checks"]["n8n_service"] = {
                "status": "❌ FAILED",
                "error": str(e)
            }
        
        # Overall status
        failed_checks = sum(1 for check in health["checks"].values() 
                           if isinstance(check, dict) and "❌" in check.get("status", ""))
        health["overall_status"] = "✅ HEALTHY" if failed_checks == 0 else f"⚠️  {failed_checks} CHECKS FAILED"
        
        return health
    
    def service_status(self, service: str = "all") -> Dict:
        """
        Check status of specific service or all services.
        
        Args:
            service: Service name ('docker', 'n8n', 'nginx', 'all')
            
        Returns:
            Service status dictionary
        """
        logger.info(f"Checking service status: {service}")
        
        status = {}
        
        if service in ["docker", "all"]:
            ret, stdout, _ = self.ssh_execute("systemctl status docker --no-pager")
            status["docker"] = {
                "running": "active (running)" in stdout.lower(),
                "details": stdout.strip()[:200]  # First 200 chars
            }
        
        if service in ["nginx", "all"]:
            ret, stdout, _ = self.ssh_execute("systemctl status nginx --no-pager")
            status["nginx"] = {
                "running": "active (running)" in stdout.lower(),
                "details": stdout.strip()[:200]
            }
        
        if service in ["n8n", "all"]:
            ret, stdout, _ = self.ssh_execute("docker ps | grep n8n")
            status["n8n"] = {
                "running": "Up" in stdout,
                "details": stdout.strip()
            }
        
        return status
    
    def restart_service(self, service: str) -> bool:
        """
        Restart a service on VPS.
        
        Args:
            service: Service name ('docker', 'nginx', 'n8n')
            
        Returns:
            True if restart successful
        """
        logger.info(f"Restarting service: {service}")
        
        if service == "docker":
            ret, stdout, stderr = self.ssh_execute("systemctl restart docker")
        elif service == "nginx":
            ret, stdout, stderr = self.ssh_execute("systemctl restart nginx")
        elif service == "n8n":
            ret, stdout, stderr = self.ssh_execute("docker restart n8n")
        else:
            logger.error(f"Unknown service: {service}")
            return False
        
        if ret == 0:
            logger.info(f"✅ Service {service} restarted successfully")
            return True
        else:
            logger.error(f"❌ Failed to restart {service}: {stderr}")
            return False
    
    def deploy_update(self, project_path: str = "/opt/wallestars") -> bool:
        """
        Deploy updates to VPS.
        
        Args:
            project_path: Path to project on VPS
            
        Returns:
            True if deployment successful
        """
        logger.info(f"Deploying updates to {project_path}...")
        
        commands = [
            f"cd {project_path}",
            "git pull origin main",
            "docker-compose pull",
            "docker-compose up -d",
            "docker-compose ps"
        ]
        
        full_command = " && ".join(commands)
        ret, stdout, stderr = self.ssh_execute(full_command, timeout=120)
        
        if ret == 0:
            logger.info("✅ Deployment successful")
            print(stdout)
            return True
        else:
            logger.error(f"❌ Deployment failed: {stderr}")
            return False
    
    def get_logs(self, service: str = "n8n", lines: int = 50) -> str:
        """
        Get logs from a service.
        
        Args:
            service: Service name
            lines: Number of lines to fetch
            
        Returns:
            Log output
        """
        logger.info(f"Fetching logs for {service} (last {lines} lines)...")
        
        if service == "n8n":
            command = f"docker logs --tail {lines} n8n"
        else:
            command = f"journalctl -u {service} -n {lines} --no-pager"
        
        ret, stdout, stderr = self.ssh_execute(command, timeout=30)
        
        if ret == 0:
            return stdout
        else:
            return f"Error fetching logs: {stderr}"


def main():
    """CLI interface for VPS manager."""
    parser = argparse.ArgumentParser(
        description="Manage Hostinger VPS (srv1201204.hstgr.cloud)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run health check
  %(prog)s health
  
  # Check service status
  %(prog)s status docker
  %(prog)s status all
  
  # Restart a service
  %(prog)s restart n8n
  
  # Deploy updates
  %(prog)s deploy
  
  # Get service logs
  %(prog)s logs n8n --lines 100
  
  # Execute custom command
  %(prog)s exec "docker ps -a"
        """
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Health check
    health_parser = subparsers.add_parser('health', help='Run health check')
    health_parser.add_argument('--json', action='store_true', 
                               help='Output as JSON')
    
    # Status check
    status_parser = subparsers.add_parser('status', help='Check service status')
    status_parser.add_argument('service', nargs='?', default='all',
                              help='Service name (docker, nginx, n8n, all)')
    
    # Restart service
    restart_parser = subparsers.add_parser('restart', help='Restart service')
    restart_parser.add_argument('service', help='Service name (docker, nginx, n8n)')
    
    # Deploy updates
    deploy_parser = subparsers.add_parser('deploy', help='Deploy updates')
    deploy_parser.add_argument('--path', default='/opt/wallestars',
                              help='Project path on VPS')
    
    # Get logs
    logs_parser = subparsers.add_parser('logs', help='Get service logs')
    logs_parser.add_argument('service', help='Service name')
    logs_parser.add_argument('--lines', type=int, default=50,
                            help='Number of lines to fetch')
    
    # Execute command
    exec_parser = subparsers.add_parser('exec', help='Execute SSH command')
    exec_parser.add_argument('command', help='Command to execute')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return 1
    
    # Initialize manager
    manager = HostingerVPSManager()
    
    # Execute command
    if args.command == 'health':
        health = manager.health_check()
        
        if args.json:
            print(json.dumps(health, indent=2))
        else:
            print(f"\n{'='*60}")
            print(f"VPS Health Check: {health['vps_host']}")
            print(f"{'='*60}\n")
            
            for check_name, check_data in health["checks"].items():
                print(f"{check_name:.<40} {check_data.get('status', 'N/A')}")
                if isinstance(check_data, dict):
                    for key, value in check_data.items():
                        if key != "status":
                            print(f"  {key}: {value}")
            
            print(f"\n{'='*60}")
            print(f"Overall: {health['overall_status']}")
            print(f"{'='*60}\n")
        
    elif args.command == 'status':
        status = manager.service_status(args.service)
        
        print(f"\nService Status:")
        print("=" * 60)
        for service, data in status.items():
            status_icon = "✅" if data.get("running") else "❌"
            print(f"{status_icon} {service.upper()}: {'Running' if data.get('running') else 'Stopped'}")
        print()
        
    elif args.command == 'restart':
        success = manager.restart_service(args.service)
        return 0 if success else 1
        
    elif args.command == 'deploy':
        success = manager.deploy_update(args.path)
        return 0 if success else 1
        
    elif args.command == 'logs':
        logs = manager.get_logs(args.service, args.lines)
        print(logs)
        
    elif args.command == 'exec':
        ret, stdout, stderr = manager.ssh_execute(args.command)
        if stdout:
            print(stdout)
        if stderr:
            print(stderr, file=sys.stderr)
        return ret
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
