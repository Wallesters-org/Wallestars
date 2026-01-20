# AI Agent Orchestration Farm

## Overview

The AI Agent Orchestration Farm is a powerful feature that enables parallel execution of AI agents across multiple platforms (Linux, Android, Web). It provides a centralized management system for coordinating multiple AI workers to handle tasks concurrently.

## Architecture

### Core Components

1. **OrchestrationManager** (`server/orchestration/OrchestrationManager.js`)
   - Central orchestration engine
   - Manages agent registration and lifecycle
   - Handles task queue and scheduling
   - Implements priority-based execution

2. **API Endpoints** (`server/routes/orchestration.js`)
   - RESTful API for orchestration control
   - Agent registration/management
   - Task submission and monitoring
   - Status and statistics endpoints

3. **Frontend Dashboard** (`src/pages/OrchestrationFarm.jsx`)
   - Real-time monitoring interface
   - Agent management UI
   - Task submission and tracking
   - Configuration controls

## Features

### Multi-Platform Support

The orchestration farm supports three platforms:
- **Linux**: Desktop automation via xdotool
- **Android**: Device control via ADB
- **Web**: Browser-based automation

### Task Queue Management

- **Priority-based Scheduling**: Tasks are executed based on priority (1-10)
- **Concurrent Execution**: Configurable max concurrent tasks (1-20)
- **Automatic Retry**: Failed tasks are retried up to 3 times (configurable)
- **Task Timeout**: Automatic timeout handling (default 5 minutes)

### Agent Management

- **Dynamic Registration**: Agents can register/unregister at runtime
- **Capability Matching**: Tasks are assigned to agents with matching capabilities
- **Load Balancing**: Idle agents are automatically assigned queued tasks
- **Status Tracking**: Real-time agent status (idle/busy)

## API Reference

### Register an Agent

```http
POST /api/orchestration/agents/register
Content-Type: application/json

{
  "agentId": "agent-linux-1",
  "platform": "linux",
  "capabilities": ["screenshot", "click", "type"]
}
```

**Response:**
```json
{
  "success": true,
  "agent": {
    "id": "agent-linux-1",
    "platform": "linux",
    "status": "idle",
    "capabilities": ["screenshot", "click", "type"],
    "lastActive": "2026-01-20T17:00:00.000Z",
    "tasksCompleted": 0,
    "tasksFailed": 0
  }
}
```

### Submit a Task

```http
POST /api/orchestration/tasks/submit
Content-Type: application/json

{
  "type": "screenshot",
  "platform": "linux",
  "priority": 5,
  "data": {
    "region": "full"
  },
  "timeout": 60000,
  "maxRetries": 3
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "screenshot": "base64_encoded_image...",
    "timestamp": "2026-01-20T17:00:00.000Z"
  }
}
```

### Get Orchestration Status

```http
GET /api/orchestration/status
```

**Response:**
```json
{
  "success": true,
  "status": {
    "agents": {
      "total": 5,
      "idle": 3,
      "busy": 2,
      "byPlatform": {
        "linux": 2,
        "android": 2,
        "web": 1
      }
    },
    "tasks": {
      "queued": 3,
      "running": 2,
      "completed": 145,
      "failed": 2
    },
    "queue": [...],
    "runningTasks": [...]
  }
}
```

### Cancel a Task

```http
POST /api/orchestration/tasks/{taskId}/cancel
```

**Response:**
```json
{
  "success": true,
  "message": "Task task_123 cancelled"
}
```

### Update Max Concurrent Tasks

```http
POST /api/orchestration/config/max-concurrent
Content-Type: application/json

{
  "maxConcurrent": 10
}
```

**Response:**
```json
{
  "success": true,
  "maxConcurrent": 10
}
```

## Usage Examples

### Example 1: Register and Use a Linux Agent

```javascript
// Register an agent
const response = await fetch('/api/orchestration/agents/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agentId: 'linux-worker-1',
    platform: 'linux',
    capabilities: ['screenshot', 'click']
  })
});

// Submit a task
const taskResponse = await fetch('/api/orchestration/tasks/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'screenshot',
    platform: 'linux',
    priority: 8
  })
});

const result = await taskResponse.json();
console.log('Task completed:', result);
```

### Example 2: Implement Task Execution Handler

```javascript
import { orchestrationManager } from './server/orchestration/OrchestrationManager.js';

// Register task execution handler
orchestrationManager.on('task:execute', async ({ task, agent, resolve, reject }) => {
  try {
    // Execute platform-specific task
    if (task.platform === 'linux' && task.type === 'screenshot') {
      const screenshot = await captureScreenshot();
      resolve({ screenshot });
    } else if (task.platform === 'android' && task.type === 'tap') {
      await executeTap(task.data.x, task.data.y);
      resolve({ success: true });
    }
  } catch (error) {
    reject(error);
  }
});
```

### Example 3: Monitor Orchestration Status

```javascript
// Fetch status every 2 seconds
setInterval(async () => {
  const response = await fetch('/api/orchestration/status');
  const { status } = await response.json();
  
  console.log('Agents:', status.agents.total);
  console.log('Tasks in queue:', status.tasks.queued);
  console.log('Tasks running:', status.tasks.running);
}, 2000);
```

## Configuration

### Environment Variables

No additional environment variables are required. The orchestration farm uses existing configuration:

- `PORT`: Server port (default: 3000)
- `ANTHROPIC_API_KEY`: For Claude AI integration
- `ENABLE_COMPUTER_USE`: Enable Linux control
- `ENABLE_ANDROID`: Enable Android control

### Runtime Configuration

```javascript
import { orchestrationManager } from './server/orchestration/OrchestrationManager.js';

// Set max concurrent tasks (1-20)
orchestrationManager.setMaxConcurrentTasks(10);

// Clear task history
orchestrationManager.clearHistory();
```

## Best Practices

### 1. Agent Registration

- Register agents with specific capabilities for better task matching
- Use descriptive agent IDs for easier debugging
- Unregister agents when shutting down

### 2. Task Submission

- Use appropriate priority levels (1=low, 10=high)
- Set reasonable timeout values based on task complexity
- Include all necessary data in the task payload

### 3. Error Handling

- Implement retry logic for critical tasks
- Monitor failed task count and investigate causes
- Use task timeout to prevent hanging tasks

### 4. Performance Optimization

- Adjust max concurrent tasks based on system resources
- Balance agent count across platforms
- Monitor queue length and add agents if needed

## Monitoring and Debugging

### Real-time Dashboard

Access the orchestration dashboard at:
```
http://localhost:5173/#/orchestration
```

Features:
- Live agent status updates
- Task queue visualization
- Running tasks monitoring
- Configuration controls
- Platform-specific statistics

### Event Monitoring

The OrchestrationManager emits events for monitoring:

```javascript
orchestrationManager.on('agent:registered', (agent) => {
  console.log('Agent registered:', agent.id);
});

orchestrationManager.on('task:queued', (task) => {
  console.log('Task queued:', task.id);
});

orchestrationManager.on('task:started', ({ task, agent }) => {
  console.log(`Task ${task.id} started on agent ${agent.id}`);
});

orchestrationManager.on('task:completed', ({ task, result }) => {
  console.log('Task completed:', task.id, result);
});

orchestrationManager.on('task:failed', ({ task, error }) => {
  console.error('Task failed:', task.id, error);
});
```

## Testing

### Unit Tests

Run unit tests:
```bash
npm test
```

The test suite includes:
- Agent management tests
- Task queue tests
- Priority scheduling tests
- Platform support tests
- Status reporting tests
- Configuration tests

### Integration Testing

Test the orchestration API:
```bash
# Start the server
npm run server

# In another terminal, test the API
curl -X POST http://localhost:3000/api/orchestration/agents/register \
  -H "Content-Type: application/json" \
  -d '{"agentId":"test-1","platform":"linux"}'
```

## Security Considerations

1. **Input Validation**: All API endpoints validate input parameters
2. **Resource Limits**: Max concurrent tasks prevents resource exhaustion
3. **Timeout Protection**: Tasks timeout prevents infinite execution
4. **Agent Authentication**: Future enhancement for agent authentication

## Roadmap

### Phase 1 (Current)
- ✅ Basic orchestration framework
- ✅ Multi-platform support
- ✅ Priority-based scheduling
- ✅ Real-time dashboard

### Phase 2 (Planned)
- [ ] Agent authentication and authorization
- [ ] Distributed orchestration (multi-server)
- [ ] Advanced load balancing algorithms
- [ ] Task dependencies and workflows
- [ ] Historical analytics and reporting

### Phase 3 (Future)
- [ ] Machine learning-based task scheduling
- [ ] Auto-scaling agent pools
- [ ] Integration with container orchestration (K8s)
- [ ] Advanced monitoring and alerting

## Support

For issues or questions:
- Open an issue on GitHub
- Check existing documentation
- Review test examples

## License

MIT License - see LICENSE file for details
