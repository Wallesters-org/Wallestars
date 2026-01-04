# 🔗 n8n Integration Guide for Wallestars

This guide provides detailed instructions for integrating Wallestars Control Center with n8n workflow automation.

## 📋 Table of Contents

- [Overview](#overview)
- [Setup Options](#setup-options)
- [Wallestars API Reference](#wallestars-api-reference)
- [n8n Workflow Examples](#n8n-workflow-examples)
- [Authentication & Security](#authentication--security)
- [Use Cases](#use-cases)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

**n8n** is a powerful workflow automation tool that can orchestrate complex workflows involving multiple services. By integrating n8n with Wallestars, you can:

- 🤖 **Automate Claude AI interactions** - Schedule AI tasks, process batches
- 🖥️ **Remote computer control** - Control your desktop from anywhere
- 📸 **Scheduled screenshots** - Capture and store desktop states
- 🔄 **Connect to other services** - Combine Wallestars with 100+ other apps
- 📊 **Build monitoring dashboards** - Track system metrics over time
- ⚡ **Event-driven automation** - React to external triggers

## 🔧 Setup Options

### Option 1: n8n on Same VPS (Recommended for Production)

```bash
# Install n8n globally
npm install -g n8n

# Set environment variables for n8n
export N8N_BASIC_AUTH_ACTIVE=true
export N8N_BASIC_AUTH_USER=your_username
export N8N_BASIC_AUTH_PASSWORD=your_secure_password
export N8N_HOST=your-domain.com
export N8N_PORT=5678
export N8N_PROTOCOL=https
export WEBHOOK_URL=https://your-domain.com

# Start n8n with PM2
pm2 start n8n --name "n8n" -- start

# Save PM2 configuration
pm2 save
```

### Option 2: n8n Cloud

1. Sign up at [n8n.cloud](https://n8n.cloud)
2. Create a new workflow
3. Use webhooks to connect to your Wallestars VPS
4. No installation needed on your VPS

### Option 3: Docker Deployment

```yaml
# docker-compose.yml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=change_this_password
      - N8N_HOST=${N8N_HOST}
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://${N8N_HOST}/
    volumes:
      - n8n_data:/home/node/.n8n

  wallestars:
    build: .
    restart: always
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - n8n

volumes:
  n8n_data:
```

## 📚 Wallestars API Reference

### Base URL

```
http://localhost:3000        # Local development
http://your-vps-ip:3000      # VPS deployment
https://your-domain.com      # With nginx reverse proxy
```

### Health Check

```bash
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-04T12:00:00.000Z",
  "services": {
    "claude": true,
    "computerUse": true,
    "android": false
  }
}
```

### Claude Chat

```bash
POST /api/claude/chat
Content-Type: application/json

{
  "message": "Your question here",
  "conversationHistory": []
}
```

**Response:**
```json
{
  "success": true,
  "response": "Claude's response",
  "conversationHistory": [...]
}
```

### Computer Screenshot

```bash
GET /api/computer/screenshot
```

**Response:**
```json
{
  "success": true,
  "screenshot": "base64-encoded-image-data",
  "timestamp": "2024-01-04T12:00:00.000Z"
}
```

### Computer Click

```bash
POST /api/computer/click
Content-Type: application/json

{
  "x": 500,
  "y": 300,
  "button": "left"
}
```

### Computer Type

```bash
POST /api/computer/type
Content-Type: application/json

{
  "text": "Hello World"
}
```

### Computer System Info

```bash
GET /api/computer/info
```

**Response:**
```json
{
  "hostname": "your-hostname",
  "platform": "linux",
  "uptime": 123456,
  "memory": {
    "total": 8589934592,
    "free": 2147483648
  }
}
```

## 🎨 n8n Workflow Examples

### Example 1: Scheduled Screenshot Capture

**Use Case**: Capture desktop screenshots every hour and save to Google Drive.

**Nodes:**
1. **Schedule Trigger** - Cron: `0 * * * *` (every hour)
2. **HTTP Request** - GET to `http://your-vps-ip:3000/api/computer/screenshot`
3. **Convert Base64 to Binary**
4. **Google Drive** - Upload file

**HTTP Request Node Configuration:**
```json
{
  "method": "GET",
  "url": "http://your-vps-ip:3000/api/computer/screenshot",
  "responseFormat": "json",
  "options": {}
}
```

**Code Node** (to process base64):
```javascript
// Decode base64 to binary
const base64Data = $json.screenshot;
const binaryData = Buffer.from(base64Data, 'base64');

return {
  binary: {
    data: binaryData,
    mimeType: 'image/png',
    fileName: `screenshot-${new Date().toISOString()}.png`
  }
};
```

### Example 2: Webhook to Claude Chat

**Use Case**: Expose a webhook that forwards messages to Claude AI.

**Nodes:**
1. **Webhook** - POST endpoint
2. **HTTP Request** - POST to Wallestars Claude API
3. **Respond to Webhook** - Return Claude's response

**Webhook Configuration:**
- Method: POST
- Path: `/claude-chat`
- Response Mode: Last Node

**HTTP Request Node:**
```json
{
  "method": "POST",
  "url": "http://your-vps-ip:3000/api/claude/chat",
  "sendBody": true,
  "bodyParameters": {
    "message": "={{$json.body.message}}",
    "conversationHistory": []
  },
  "options": {
    "response": {
      "response": {
        "fullResponse": false,
        "responseFormat": "json"
      }
    }
  }
}
```

**Test the webhook:**
```bash
curl -X POST https://your-n8n-url/webhook/claude-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello Claude!"}'
```

### Example 3: Automated Daily Report

**Use Case**: Generate a daily system report with screenshot and metrics.

**Nodes:**
1. **Schedule Trigger** - Daily at 9 AM
2. **HTTP Request** - Get system info
3. **HTTP Request** - Get screenshot
4. **Merge** - Combine data
5. **Send Email** - With screenshot attachment

### Example 4: Slack Command Integration

**Use Case**: Control your computer from Slack.

**Nodes:**
1. **Webhook** - Listen for Slack commands
2. **Switch** - Route based on command
3. **HTTP Request** - Call appropriate Wallestars endpoint
4. **Respond to Webhook** - Send result to Slack

**Commands:**
- `/screenshot` - Capture and send screenshot
- `/click 500 300` - Click at coordinates
- `/ask claude [question]` - Ask Claude AI

### Example 5: Computer Use Automation Chain

**Use Case**: Perform a series of automated actions on your computer.

**Nodes:**
1. **Manual Trigger** or **Webhook**
2. **HTTP Request** - Take screenshot (before)
3. **HTTP Request** - Click action
4. **Wait** - 2 seconds
5. **HTTP Request** - Type text
6. **Wait** - 1 second
7. **HTTP Request** - Take screenshot (after)
8. **Compare** - Check if action succeeded

### Example 6: AI-Powered Monitoring

**Use Case**: Let Claude AI monitor your system and alert on issues.

**Nodes:**
1. **Schedule Trigger** - Every 15 minutes
2. **HTTP Request** - Get system info
3. **HTTP Request** - Get screenshot
4. **HTTP Request** - Send to Claude for analysis
   ```json
   {
     "message": "Analyze this system state and alert if anything looks wrong: {{$json}}"
   }
   ```
5. **IF** - Check if Claude detected issues
6. **Send Notification** - Alert via email/Slack

### Example 7: Multi-Service Workflow

**Use Case**: Combine Wallestars with other services for complex automation.

**Workflow:**
```
Telegram Bot → Receive Command
    ↓
Parse Command → Extract action
    ↓
Wallestars API → Execute action
    ↓
Process Result → Format response
    ↓
Multiple Outputs:
    - Reply to Telegram
    - Save to Database
    - Log to Google Sheets
    - Send to Discord
```

## 🔐 Authentication & Security

### API Key Protection

If you add authentication to Wallestars (recommended for production):

```javascript
// In n8n HTTP Request node headers:
{
  "Authorization": "Bearer {{$env.WALLESTARS_API_KEY}}"
}
```

### n8n Environment Variables

Set in n8n settings:
- `WALLESTARS_URL` - Your Wallestars base URL
- `WALLESTARS_API_KEY` - API key (if implemented)

### Webhook Security

For webhook endpoints, use:
- **Basic Authentication** in n8n
- **Webhook tokens** for validation
- **IP whitelisting** in firewall

Example webhook with token validation:

```javascript
// In n8n Function node
const receivedToken = $json.headers.authorization;
const expectedToken = $env.WEBHOOK_SECRET;

if (receivedToken !== expectedToken) {
  throw new Error('Unauthorized');
}

return $json;
```

## 🎯 Use Cases

### 1. Remote Desktop Support

**Scenario**: Support team needs to check user screens remotely.

**Workflow**:
- Slack command triggers n8n
- n8n captures screenshot from Wallestars
- Screenshot posted to support channel
- Support team can request actions (click, type)

### 2. Automated Testing

**Scenario**: Test web application UI automatically.

**Workflow**:
- Schedule trigger (nightly)
- Open application (external command)
- Series of clicks and inputs via Wallestars
- Screenshots at each step
- Compare with expected results
- Email report with pass/fail

### 3. AI Assistant Delegation

**Scenario**: Delegate tasks to Claude AI through n8n.

**Workflow**:
- Incoming email with task
- Parse email content
- Send to Claude via Wallestars
- Claude analyzes and responds
- Execute actions if needed
- Reply to email with results

### 4. System Monitoring & Alerting

**Scenario**: Monitor system health and alert on issues.

**Workflow**:
- Poll system metrics every 5 minutes
- Send metrics to Claude for analysis
- If issues detected, capture screenshot
- Send alert with context to admin
- Log to monitoring dashboard

### 5. Cross-Platform Automation

**Scenario**: Coordinate actions across multiple platforms.

**Workflow**:
- Trigger: New entry in Google Sheets
- Read data from sheet
- Use Claude to generate commands
- Execute on desktop via Wallestars
- Update sheet with results
- Post summary to Slack

## 🔧 Advanced Configuration

### Custom Wallestars Nodes (Future)

You can create custom n8n nodes for Wallestars:

```typescript
// nodes/Wallestars/Wallestars.node.ts
import { INodeType, INodeTypeDescription } from 'n8n-workflow';

export class Wallestars implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Wallestars',
    name: 'wallestars',
    icon: 'file:wallestars.svg',
    group: ['transform'],
    version: 1,
    description: 'Interact with Wallestars Control Center',
    defaults: {
      name: 'Wallestars',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'wallestarsApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        options: [
          {
            name: 'Computer',
            value: 'computer',
          },
          {
            name: 'Claude',
            value: 'claude',
          },
        ],
        default: 'computer',
      },
      // ... more configuration
    ],
  };
  // ... implementation
}
```

### Webhook Templates

Save these as n8n templates for quick reuse:

```json
{
  "name": "Wallestars Screenshot Webhook",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "GET",
        "path": "screenshot",
        "responseMode": "responseNode"
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [240, 300]
    },
    {
      "parameters": {
        "url": "=http://localhost:3000/api/computer/screenshot",
        "options": {}
      },
      "name": "HTTP Request",
      "type": "n8n-nodes-base.httpRequest",
      "position": [460, 300]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{$json}}"
      },
      "name": "Respond to Webhook",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [680, 300]
    }
  ]
}
```

## 🔍 Troubleshooting

### n8n Cannot Connect to Wallestars

**Issue**: HTTP Request node returns connection error.

**Solutions**:
1. Check Wallestars is running: `pm2 list`
2. Verify URL is correct (include port if needed)
3. Check firewall allows connections
4. Use full IP address instead of localhost in n8n
5. Test with curl first:
   ```bash
   curl http://your-vps-ip:3000/api/health
   ```

### Webhook Not Triggering

**Issue**: External calls to n8n webhook return 404.

**Solutions**:
1. Ensure workflow is activated (toggle switch)
2. Check webhook URL is correct
3. Verify n8n is accessible from external network
4. Check firewall allows port 5678
5. Test with:
   ```bash
   curl -X POST https://your-n8n-url/webhook-test/test \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   ```

### Authentication Errors

**Issue**: Wallestars API returns 401 Unauthorized.

**Solutions**:
1. Check if authentication is enabled
2. Verify API key/token is correct
3. Check headers are properly set in HTTP Request node
4. Ensure environment variables are loaded

### Rate Limiting

**Issue**: Too many requests to Anthropic API.

**Solutions**:
1. Add delay between requests (Wait node)
2. Implement queuing in n8n
3. Monitor API usage in Anthropic Console
4. Cache responses when possible

### Performance Issues

**Issue**: Workflows are slow or timing out.

**Solutions**:
1. Increase timeout in HTTP Request nodes
2. Optimize workflow (reduce unnecessary nodes)
3. Use async execution where possible
4. Monitor n8n and Wallestars resources
5. Consider separating heavy workloads

## 📊 Monitoring & Logging

### n8n Execution Logs

```bash
# View n8n logs with PM2
pm2 logs n8n

# View execution data in n8n UI
# Navigate to: Executions tab
```

### Wallestars Logs

```bash
# View Wallestars logs
pm2 logs wallestars

# Check specific API endpoint logs
grep "api/claude/chat" ~/.pm2/logs/wallestars-out.log
```

### Metrics Dashboard

Create a monitoring workflow:

1. **Schedule** - Every 5 minutes
2. **Gather Metrics** - System info, API health
3. **Store** - InfluxDB or similar
4. **Visualize** - Grafana dashboard

## 📚 Additional Resources

- **n8n Documentation**: [docs.n8n.io](https://docs.n8n.io)
- **n8n Community**: [community.n8n.io](https://community.n8n.io)
- **n8n Workflow Templates**: [n8n.io/workflows](https://n8n.io/workflows)
- **Wallestars Repository**: [github.com/Wallesters-org/Wallestars](https://github.com/Wallesters-org/Wallestars)
- **Claude API Docs**: [docs.anthropic.com](https://docs.anthropic.com)

## 🤝 Contributing

Have a great n8n + Wallestars workflow? Share it!

1. Export your workflow from n8n
2. Create a pull request to add it to this guide
3. Include description and use case

## 🆘 Support

- **n8n Issues**: [n8n Community Forum](https://community.n8n.io)
- **Wallestars Issues**: [GitHub Issues](https://github.com/Wallesters-org/Wallestars/issues)

---

**Built with ❤️ by Wallestars Team**

🔗 Happy automating with n8n + Wallestars!
