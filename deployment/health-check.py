#!/usr/bin/env python3
# health-check.py
# Health monitoring script for Wallestars services

import requests
import time
import smtplib
import os
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Service configuration
SERVICES = {
    "Wallestars API": "http://localhost:3000/api/health",
    "n8n Workflows": "http://localhost:5678/healthz",
    "Redis": "redis://localhost:6379",
}

# Email configuration
REPORT_EMAIL = os.getenv("REPORT_EMAIL", "admin@example.com")
SMTP_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("EMAIL_PORT", "587"))
SMTP_USER = os.getenv("EMAIL_USER", "")
SMTP_PASSWORD = os.getenv("EMAIL_PASSWORD", "")

def check_http_service(name, url):
    """Check HTTP/HTTPS service health"""
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            return "✅", "OK"
        else:
            return "❌", f"HTTP {response.status_code}"
    except requests.exceptions.ConnectionError:
        return "❌", "Connection refused"
    except requests.exceptions.Timeout:
        return "❌", "Timeout"
    except Exception as e:
        return "❌", str(e)

def check_redis_service():
    """Check Redis service health"""
    try:
        import redis
        r = redis.Redis(host='localhost', port=6379, db=0, socket_timeout=5)
        r.ping()
        return "✅", "OK"
    except Exception as e:
        return "❌", str(e)

def send_alert_email(failed_services):
    """Send email alert for failed services"""
    if not SMTP_USER or not SMTP_PASSWORD:
        print("⚠️  Email credentials not configured, skipping alert")
        return
    
    subject = f"🚨 Wallestars Health Check Alert - {len(failed_services)} service(s) down"
    body = f"""
Wallestars Health Check Alert
Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

Failed Services:
{chr(10).join(f'  • {service}' for service in failed_services)}

Please investigate immediately.

--
Wallestars Monitoring System
    """
    
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USER
        msg['To'] = REPORT_EMAIL
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        print(f"📧 Alert email sent to {REPORT_EMAIL}")
    except Exception as e:
        print(f"❌ Failed to send email alert: {e}")

def check_health():
    """Check health of all services"""
    results = {}
    failed = []
    
    print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Health Check")
    print("=" * 60)
    
    for service_name, endpoint in SERVICES.items():
        if endpoint.startswith("http"):
            status, message = check_http_service(service_name, endpoint)
        elif endpoint.startswith("redis"):
            status, message = check_redis_service()
        else:
            status, message = "❓", "Unknown protocol"
        
        results[service_name] = status
        print(f"{status} {service_name}: {message}")
        
        if status == "❌":
            failed.append(service_name)
    
    print("=" * 60)
    
    # Send alert if there are failures
    if failed:
        send_alert_email(failed)
    
    return results

def main():
    """Main monitoring loop"""
    print("🏥 Wallestars Health Check Monitor Started")
    print(f"📧 Alert email: {REPORT_EMAIL}")
    print(f"🔄 Check interval: 5 minutes")
    print("")
    
    while True:
        try:
            check_health()
            time.sleep(300)  # Check every 5 minutes
        except KeyboardInterrupt:
            print("\n👋 Monitoring stopped")
            break
        except Exception as e:
            print(f"❌ Error in monitoring loop: {e}")
            time.sleep(60)  # Wait 1 minute on error

if __name__ == "__main__":
    main()
