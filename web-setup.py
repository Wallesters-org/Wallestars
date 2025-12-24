#!/usr/bin/env python3
"""
Simple web server for Hostinger VPS setup in GitHub Codespaces
Serves the setup web interface and provides API endpoint for configuration
"""

import http.server
import socketserver
import json
import os
import re
from urllib.parse import urlparse, parse_qs
from pathlib import Path

PORT = 8000
TEMPLATE_FILE = ".claude-code.template.json"
CONFIG_FILE = ".claude-code.json"

class SetupHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        """Handle GET requests"""
        if self.path == '/' or self.path == '/index.html':
            self.path = '/index.html'
        return super().do_GET()
    
    def do_POST(self):
        """Handle POST requests for setup"""
        if self.path == '/setup':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                api_token = data.get('apiToken', '').strip()
                
                if not api_token:
                    self.send_error_response(400, "API token is required")
                    return
                
                if len(api_token) < 10:
                    self.send_error_response(400, "API token seems invalid")
                    return
                
                # Create configuration
                success = self.create_config(api_token)
                
                if success:
                    self.send_json_response(200, {
                        "success": True,
                        "message": "Configuration saved successfully"
                    })
                else:
                    self.send_error_response(500, "Failed to create configuration file")
                    
            except json.JSONDecodeError:
                self.send_error_response(400, "Invalid JSON data")
            except Exception as e:
                self.send_error_response(500, f"Server error: {str(e)}")
        else:
            self.send_error_response(404, "Not found")
    
    def create_config(self, api_token):
        """Create .claude-code.json from template with the API token"""
        try:
            # Read template
            if not os.path.exists(TEMPLATE_FILE):
                print(f"Error: Template file {TEMPLATE_FILE} not found")
                return False
            
            with open(TEMPLATE_FILE, 'r') as f:
                config = json.load(f)
            
            # Replace the placeholder with actual API token
            config_str = json.dumps(config, indent=2)
            config_str = config_str.replace("YOUR_HOSTINGER_API_KEY_HERE", api_token)
            
            # Write the new config
            with open(CONFIG_FILE, 'w') as f:
                f.write(config_str)
            
            print(f"✅ Configuration saved to {CONFIG_FILE}")
            return True
            
        except Exception as e:
            print(f"❌ Error creating configuration: {e}")
            return False
    
    def send_json_response(self, code, data):
        """Send JSON response"""
        self.send_response(code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def send_error_response(self, code, message):
        """Send error response"""
        self.send_json_response(code, {"error": message})
    
    def log_message(self, format, *args):
        """Custom log format"""
        print(f"[{self.log_date_time_string()}] {format % args}")

def main():
    """Start the web server"""
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    print("=" * 60)
    print("  Hostinger VPS Setup Web Server")
    print("=" * 60)
    print(f"")
    print(f"🌐 Server starting on port {PORT}...")
    print(f"")
    
    with socketserver.TCPServer(("", PORT), SetupHandler) as httpd:
        print(f"✅ Server is running!")
        print(f"")
        print(f"📱 Open in your browser:")
        print(f"   http://localhost:{PORT}")
        print(f"")
        
        # Check if running in Codespaces
        codespace_name = os.environ.get('CODESPACE_NAME')
        if codespace_name:
            github_codespaces_port_forwarding_domain = os.environ.get(
                'GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN', 
                'app.github.dev'
            )
            public_url = f"https://{codespace_name}-{PORT}.{github_codespaces_port_forwarding_domain}"
            print(f"🚀 Codespaces URL:")
            print(f"   {public_url}")
            print(f"")
        
        print(f"Press Ctrl+C to stop the server")
        print("=" * 60)
        print(f"")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n")
            print("=" * 60)
            print("  Server stopped")
            print("=" * 60)

if __name__ == "__main__":
    main()
