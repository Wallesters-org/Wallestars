# 🎯 Agent Quick Start Guide

Quick reference for implementing and deploying cloud/browser agents with Wallestars.

---

## 🚀 Quick Setup

### 1. Cloud Agent (AWS Lambda) - 5 Minutes

```bash
# Clone agent template
git clone https://github.com/Wallesters-org/agent-templates
cd agent-templates/cloud/aws-lambda

# Install dependencies
npm install

# Configure
export CALLBACK_URL="https://your-wallestars.com/api/agent-callback"
export CALLBACK_TOKEN="your-secret-token"

# Deploy
npm run deploy
```

### 2. Browser Agent (Playwright) - 5 Minutes

```bash
# Start with Docker
docker run -d \
  -p 3001:3001 \
  -e CALLBACK_URL="http://wallestars:3000/api/agent-callback" \
  -e CALLBACK_TOKEN="your-token" \
  wallestars/playwright-agent:latest

# Or run locally
npm install playwright
node agents/browser/playwright/server.js
```

---

## 📋 Task Submission Examples

### Screenshot Task

```javascript
const task = {
  type: 'screenshot',
  agentType: 'browser',
  payload: {
    url: 'https://example.com',
    viewport: { width: 1920, height: 1080 },
    fullPage: true
  },
  timeout: 30000
};

const response = await fetch('/api/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(task)
});

const { taskId } = await response.json();
console.log('Task submitted:', taskId);
```

### E2E Test Task

```javascript
const task = {
  type: 'e2e-test',
  agentType: 'browser',
  payload: {
    url: 'https://example.com',
    steps: [
      { action: 'click', selector: '#login-button' },
      { action: 'fill', selector: '#username', value: 'testuser' },
      { action: 'fill', selector: '#password', value: 'testpass' },
      { action: 'click', selector: '#submit' },
      { action: 'waitForNavigation' },
      { action: 'screenshot', name: 'logged-in' }
    ]
  },
  timeout: 60000
};
```

### API Test Task (Cloud)

```javascript
const task = {
  type: 'api-test',
  agentType: 'cloud',
  payload: {
    endpoint: 'https://api.example.com/users',
    method: 'GET',
    headers: { 'Authorization': 'Bearer token' },
    assertions: [
      { path: 'status', equals: 200 },
      { path: 'data.length', greaterThan: 0 }
    ]
  }
};
```

---

## 🔄 Monitoring Task Status

### Via WebSocket

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected to Wallestars');
});

socket.on(`task:${taskId}:update`, (data) => {
  console.log('Task status:', data.status);
  console.log('Progress:', data.progress);
});

socket.on(`task:${taskId}:complete`, (data) => {
  console.log('Task completed!');
  console.log('Results:', data.results);
});

socket.on(`task:${taskId}:error`, (data) => {
  console.error('Task failed:', data.error);
});
```

### Via REST API

```javascript
// Poll for status
const checkStatus = async (taskId) => {
  const response = await fetch(`/api/tasks/${taskId}`);
  const task = await response.json();
  
  console.log('Status:', task.status);
  console.log('Progress:', task.progress);
  
  if (task.status === 'completed') {
    console.log('Results:', task.results);
  } else if (task.status === 'failed') {
    console.error('Error:', task.error);
  }
  
  return task;
};

// Poll every 2 seconds
const intervalId = setInterval(async () => {
  const task = await checkStatus(taskId);
  if (task.status === 'completed' || task.status === 'failed') {
    clearInterval(intervalId);
  }
}, 2000);
```

---

## 🛠️ Creating Custom Agents

### Minimal Agent Implementation

```javascript
// my-custom-agent.js
import express from 'express';

const app = express();
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: Date.now() });
});

// Task execution endpoint
app.post('/execute', async (req, res) => {
  const { taskId, payload, callbackUrl } = req.body;
  
  // Acknowledge immediately
  res.json({ accepted: true, taskId });
  
  // Execute asynchronously
  executeTaskAsync(taskId, payload, callbackUrl);
});

async function executeTaskAsync(taskId, payload, callbackUrl) {
  try {
    // Your custom logic here
    const results = await myCustomLogic(payload);
    
    // Callback with results
    await fetch(callbackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Agent-Signature': generateSignature(taskId, results)
      },
      body: JSON.stringify({
        taskId,
        status: 'success',
        timestamp: Date.now(),
        results
      })
    });
  } catch (error) {
    // Callback with error
    await fetch(callbackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskId,
        status: 'failure',
        error: { message: error.message, stack: error.stack }
      })
    });
  }
}

app.listen(3002, () => {
  console.log('Custom agent listening on port 3002');
});
```

### Agent Registration

```javascript
// Register your agent with Wallestars
const agentConfig = {
  name: 'my-custom-agent',
  type: 'custom',
  endpoint: 'http://localhost:3002',
  capabilities: ['custom-task-1', 'custom-task-2'],
  concurrency: 5,
  timeout: 60000
};

const response = await fetch('/api/agents/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-api-key'
  },
  body: JSON.stringify(agentConfig)
});

const { agentId } = await response.json();
console.log('Agent registered:', agentId);
```

---

## 🔐 Authentication Setup

### Generate HMAC Signature

```javascript
import crypto from 'crypto';

function generateSignature(taskId, results, secret) {
  const timestamp = Date.now().toString();
  const payload = JSON.stringify({ taskId, results });
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(timestamp + payload)
    .digest('hex');
  
  return { signature, timestamp };
}

// Use in callback
const { signature, timestamp } = generateSignature(taskId, results, SECRET);

await fetch(callbackUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Agent-Signature': signature,
    'X-Agent-Timestamp': timestamp,
    'X-Agent-Id': agentId
  },
  body: JSON.stringify({ taskId, status: 'success', results })
});
```

---

## 📊 Agent Health Monitoring

### Heartbeat Implementation

```javascript
// Send heartbeat every 30 seconds
setInterval(async () => {
  try {
    await fetch('/api/agents/heartbeat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AGENT_TOKEN}`
      },
      body: JSON.stringify({
        agentId: AGENT_ID,
        status: 'active',
        metrics: {
          activeTasks: getCurrentTaskCount(),
          memory: process.memoryUsage(),
          uptime: process.uptime()
        }
      })
    });
  } catch (error) {
    console.error('Heartbeat failed:', error);
  }
}, 30000);
```

---

## 🐳 Docker Deployment

### Dockerfile for Custom Agent

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --production

# Copy agent code
COPY . .

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

EXPOSE 3002

CMD ["node", "agent.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  custom-agent:
    build: .
    ports:
      - "3002:3002"
    environment:
      - CALLBACK_URL=${CALLBACK_URL}
      - CALLBACK_TOKEN=${CALLBACK_TOKEN}
      - AGENT_ID=${AGENT_ID}
    restart: unless-stopped
    networks:
      - wallestars-network

networks:
  wallestars-network:
    external: true
```

---

## 🧪 Testing Your Agent

### Unit Test Example

```javascript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startAgent, stopAgent } from './agent.js';

describe('Custom Agent', () => {
  beforeAll(async () => {
    await startAgent();
  });

  afterAll(async () => {
    await stopAgent();
  });

  it('should accept task execution request', async () => {
    const response = await fetch('http://localhost:3002/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskId: 'test-task-1',
        payload: { test: 'data' },
        callbackUrl: 'http://localhost:3000/callback'
      })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.accepted).toBe(true);
  });

  it('should execute task and callback', async () => {
    // Mock callback server
    const callbacks = [];
    const mockServer = express();
    mockServer.post('/callback', (req, res) => {
      callbacks.push(req.body);
      res.json({ acknowledged: true });
    });
    const server = mockServer.listen(3000);

    // Submit task
    await fetch('http://localhost:3002/execute', {
      method: 'POST',
      body: JSON.stringify({
        taskId: 'test-task-2',
        payload: { test: 'data' },
        callbackUrl: 'http://localhost:3000/callback'
      })
    });

    // Wait for callback
    await new Promise(resolve => setTimeout(resolve, 2000));

    expect(callbacks.length).toBe(1);
    expect(callbacks[0].taskId).toBe('test-task-2');
    expect(callbacks[0].status).toBe('success');

    server.close();
  });
});
```

---

## 🔍 Troubleshooting

### Common Issues

**Agent not receiving tasks**
- Check agent is registered: `GET /api/agents`
- Verify endpoint is accessible
- Check agent capabilities match task type

**Callbacks failing**
- Verify callback URL is correct
- Check authentication signature
- Ensure callback endpoint is accessible from agent

**Tasks timing out**
- Increase timeout in task configuration
- Check agent is processing tasks
- Review agent logs for errors

**High failure rate**
- Monitor agent health metrics
- Check resource constraints (CPU, memory)
- Review error logs for patterns

### Debug Mode

```javascript
// Enable debug logging
process.env.DEBUG = 'wallestars:agent:*';

// Or in agent code
const DEBUG = process.env.DEBUG === 'true';

function log(...args) {
  if (DEBUG) {
    console.log('[AGENT]', new Date().toISOString(), ...args);
  }
}
```

---

## 📞 Support

- **Documentation**: See `AGENT_INTEGRATION_PLAN.md` for full details
- **Examples**: Check `agents/examples/` directory
- **Issues**: Report at https://github.com/Wallesters-org/Wallestars/issues
- **Discussions**: https://github.com/Wallesters-org/Wallestars/discussions

---

**Quick Links**:
- [Full Integration Plan](./AGENT_INTEGRATION_PLAN.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Workflow Documentation](./WORKFLOW_DOCUMENTATION.md)
- [Security Guidelines](./SECURITY.md)
