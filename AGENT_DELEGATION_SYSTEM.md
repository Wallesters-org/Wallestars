# Agent Delegation System Documentation

## Overview

The Agent Delegation System automatically assigns tasks to available AI agents based on incoming GitHub events (Pull Requests and Issues). This system ensures that tasks are routed to the most appropriate agents based on their capabilities and current workload.

## Architecture

### Components

1. **Agent Registry** (`server/services/agentRegistry.js`)
   - Maintains a registry of available agents
   - Defines agent capabilities and priorities
   - Tracks agent status and workload limits

2. **Agent Delegation Service** (`server/services/agentDelegation.js`)
   - Analyzes GitHub events to determine task type
   - Finds the best available agent for each task
   - Creates and manages delegated tasks
   - Provides delegation statistics

3. **Webhook Integration** (`server/routes/n8nWebhooks.js`)
   - Receives GitHub events via webhook
   - Triggers agent delegation
   - Provides REST API for task management

## Available Agents

The system includes 9 pre-configured agents:

| Agent ID | Name | Capabilities | Priority | Max Concurrent Tasks |
|----------|------|--------------|----------|---------------------|
| `antigravity-main` | Antigravity Main Agent | infrastructure, testing, cicd, deployment | 1 | 3 |
| `agent-security-cleanup` | Security Cleanup Agent | security, credentials, audit | 1 | 1 |
| `agent-vps-deploy` | VPS Deployment Agent | deployment, vps, infrastructure | 2 | 1 |
| `agent-qr-feature` | QR Scanner Feature Agent | feature, frontend, ai | 3 | 1 |
| `agent-n8n-integration` | N8N Integration Agent | workflow, automation, integration | 2 | 1 |
| `agent-copilot-config` | Copilot Configuration Agent | configuration, github, copilot | 3 | 1 |
| `agent-devcontainer` | DevContainer Agent | devcontainer, vscode, configuration | 3 | 1 |
| `agent-testing-setup` | Testing Infrastructure Agent | testing, quality, ci | 2 | 1 |
| `agent-docs-complete` | Documentation Agent | documentation, markdown, guides | 2 | 1 |

## Task Type Detection

The system analyzes GitHub events and automatically determines the task type based on:

- **Title and Body Content**: Keywords like "security", "deploy", "test", "docs"
- **Labels**: Issue/PR labels that indicate task type
- **Branch Names**: Branch naming patterns (e.g., `feature/`, `security/`, `docs/`)

### Supported Task Types

| Task Type | Priority | Keywords | Example Agents |
|-----------|----------|----------|----------------|
| `security` | P0 | security, vulnerability, credentials, password | Security Cleanup Agent |
| `deployment` | P1 | deploy, vps, infrastructure | VPS Deployment Agent, Antigravity Main |
| `testing` | P2 | test, testing, coverage | Testing Infrastructure Agent |
| `documentation` | P2 | docs, documentation, readme | Documentation Agent |
| `workflow` | P2 | n8n, workflow, automation | N8N Integration Agent |
| `configuration` | P3 | config, copilot, devcontainer | Copilot Configuration Agent |
| `feature` | P2 | feature, implement, add | QR Scanner Feature Agent |
| `infrastructure` | P2 | ci, github actions, workflow | Antigravity Main Agent |

## API Endpoints

### 1. Receive GitHub Event (with auto-delegation)

**Endpoint**: `POST /api/webhooks/n8n/github-event`

**Request Body**:
```json
{
  "event": {
    "eventType": "pull_request",
    "action": "opened",
    "number": 123,
    "title": "Security: Fix exposed credentials",
    "author": "username",
    "branch": "security/fix-creds",
    "baseBranch": "main",
    "url": "https://github.com/org/repo/pull/123",
    "state": "open",
    "draft": false,
    "labels": ["security", "P0"],
    "changedFiles": 5,
    "additions": 45,
    "deletions": 23
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "GitHub event received",
  "eventId": 1,
  "delegatedTask": {
    "taskId": "task-1768192227398-v58qfd9t9",
    "agentName": "Security Cleanup Agent",
    "taskType": "security",
    "priority": "P0"
  }
}
```

### 2. List Available Agents

**Endpoint**: `GET /api/webhooks/n8n/agents`

**Response**:
```json
{
  "success": true,
  "count": 9,
  "agents": [
    {
      "id": "antigravity-main",
      "name": "Antigravity Main Agent",
      "status": "active",
      "capabilities": ["infrastructure", "testing", "cicd", "deployment"],
      "priority": 1,
      "maxConcurrentTasks": 3
    }
    // ... more agents
  ]
}
```

### 3. Get Delegated Tasks

**Endpoint**: `GET /api/webhooks/n8n/delegated-tasks`

**Query Parameters**:
- `agentId` - Filter by agent ID
- `status` - Filter by status (delegated, in-progress, completed, failed, cancelled)
- `taskType` - Filter by task type
- `priority` - Filter by priority (P0, P1, P2, P3)

**Response**:
```json
{
  "success": true,
  "count": 2,
  "tasks": [
    {
      "id": "task-1768192227398-v58qfd9t9",
      "eventType": "pull_request",
      "eventNumber": 99,
      "eventTitle": "Security: Fix exposed credentials",
      "eventUrl": "https://github.com/org/repo/pull/99",
      "eventAuthor": "test-user",
      "taskType": "security",
      "priority": "P0",
      "keywords": ["security"],
      "agentId": "agent-security-cleanup",
      "agentName": "Security Cleanup Agent",
      "status": "delegated",
      "createdAt": "2026-01-12T04:30:27.398Z",
      "updatedAt": "2026-01-12T04:30:27.398Z"
    }
    // ... more tasks
  ],
  "stats": {
    "totalTasks": 2,
    "byStatus": { "delegated": 2 },
    "byTaskType": { "security": 1, "feature": 1 },
    "byPriority": { "P0": 1, "P2": 1 },
    "byAgent": { "Security Cleanup Agent": 1 },
    "agentWorkload": { "agent-security-cleanup": 1 }
  }
}
```

### 4. Update Task Status

**Endpoint**: `PATCH /api/webhooks/n8n/delegated-tasks/:taskId`

**Request Body**:
```json
{
  "status": "completed",
  "result": "Task completed successfully"
}
```

**Valid Statuses**: `delegated`, `in-progress`, `completed`, `failed`, `cancelled`

**Response**:
```json
{
  "success": true,
  "task": {
    "id": "task-1768192227398-v58qfd9t9",
    "status": "completed",
    "completedAt": "2026-01-12T04:30:50.918Z",
    "result": "Task completed successfully",
    // ... other task fields
  }
}
```

### 5. Get Dashboard with Delegation Stats

**Endpoint**: `GET /api/webhooks/n8n/dashboard`

**Response**:
```json
{
  "timestamp": "2026-01-12T04:30:00.000Z",
  "health": { /* health report data */ },
  "alerts": { /* alert data */ },
  "github": { /* github events data */ },
  "agents": { /* agent activity data */ },
  "delegation": {
    "totalTasks": 5,
    "byStatus": {
      "completed": 2,
      "in-progress": 2,
      "delegated": 1
    },
    "byTaskType": {
      "security": 1,
      "feature": 2,
      "deployment": 1,
      "testing": 1
    },
    "byPriority": {
      "P0": 1,
      "P1": 1,
      "P2": 3
    },
    "byAgent": {
      "Security Cleanup Agent": 1,
      "QR Scanner Feature Agent": 2,
      "VPS Deployment Agent": 1
    },
    "agentWorkload": {
      "agent-security-cleanup": 0,
      "agent-qr-feature": 1,
      "agent-vps-deploy": 1
    }
  }
}
```

## WebSocket Events

The system emits real-time WebSocket events for task delegation:

### Event: `n8n:task-delegated`

Emitted when a task is delegated to an agent.

**Payload**:
```json
{
  "task": {
    "id": "task-123",
    "agentName": "Security Cleanup Agent",
    "taskType": "security",
    "priority": "P0"
    // ... full task object
  },
  "event": {
    // ... original GitHub event
  }
}
```

### Event: `n8n:task-updated`

Emitted when a task status is updated.

**Payload**:
```json
{
  "id": "task-123",
  "status": "completed",
  "completedAt": "2026-01-12T04:30:50.918Z"
  // ... full updated task object
}
```

## Usage Examples

### Example 1: Security Issue Auto-Delegation

When a PR with "security" in the title or labels is created:

```bash
# GitHub webhook sends event
curl -X POST http://localhost:3000/api/webhooks/n8n/github-event \
  -H "Content-Type: application/json" \
  -d '{
    "event": {
      "eventType": "pull_request",
      "title": "Security: Fix SQL injection vulnerability",
      "labels": ["security"],
      "state": "open"
    }
  }'

# Response includes delegation info
{
  "delegatedTask": {
    "agentName": "Security Cleanup Agent",
    "taskType": "security",
    "priority": "P0"
  }
}
```

### Example 2: Monitor Agent Workload

```bash
# Get current delegation statistics
curl http://localhost:3000/api/webhooks/n8n/delegated-tasks

# Check agent workload
{
  "stats": {
    "agentWorkload": {
      "agent-security-cleanup": 2,  // 2 tasks assigned
      "agent-qr-feature": 0         // Available
    }
  }
}
```

### Example 3: Complete a Task

```bash
# Agent completes task and reports back
TASK_ID="task-1768192227398-v58qfd9t9"
curl -X PATCH http://localhost:3000/api/webhooks/n8n/delegated-tasks/$TASK_ID \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "result": "Successfully fixed vulnerability in user input handler"
  }'
```

## Integration with n8n

The delegation system is designed to work with the existing n8n GitHub automation workflow:

1. **GitHub Webhook** → n8n workflow receives event
2. **Parse Event Data** → n8n extracts relevant information
3. **Send to Wallestars** → n8n forwards to `/api/webhooks/n8n/github-event`
4. **Auto-Delegation** → Wallestars delegates to appropriate agent
5. **Notification** → WebSocket events notify connected clients
6. **Agent Execution** → Agent picks up task and executes
7. **Status Update** → Agent reports back via PATCH endpoint

## Extending the System

### Adding a New Agent

Edit `server/services/agentRegistry.js`:

```javascript
export const AGENT_REGISTRY = {
  // ... existing agents
  'agent-custom': {
    id: 'agent-custom',
    name: 'Custom Agent',
    status: 'available',
    capabilities: ['custom-capability', 'other-capability'],
    priority: 2,
    maxConcurrentTasks: 1
  }
};
```

### Adding a New Task Type

Edit `server/services/agentRegistry.js`:

```javascript
export const TASK_TYPE_MAPPING = {
  // ... existing mappings
  customTaskType: ['custom-capability', 'other-capability']
};
```

Then update the detection logic in `server/services/agentDelegation.js`:

```javascript
function analyzeGitHubEvent(event) {
  // ... existing logic
  
  // Add new condition
  else if (text.includes('custom-keyword')) {
    taskType.type = 'customTaskType';
    taskType.priority = 'P2';
    taskType.suggestedCapabilities = TASK_TYPE_MAPPING.customTaskType;
    taskType.keywords.push('custom');
  }
}
```

## Best Practices

1. **Priority Management**: P0 tasks (security) are always handled first
2. **Workload Balancing**: System checks agent workload before delegation
3. **Status Tracking**: Always update task status when agents complete work
4. **Error Handling**: Failed tasks should be marked as `failed` with error details
5. **Monitoring**: Use dashboard endpoint to monitor system health

## Troubleshooting

### Task Not Being Delegated

- Check if task type is recognized (review keywords in title/labels)
- Verify agents with required capabilities are available
- Check agent workload - may be at max capacity

### Agent Workload Not Updating

- Ensure task status is updated to `completed` or `failed`
- Check that correct task ID is used in PATCH request

### WebSocket Events Not Received

- Verify `global.io` is properly initialized
- Check client WebSocket connection
- Review Socket.io configuration in `server/index.js`

## Performance Considerations

- In-memory storage is used (not persistent across restarts)
- Task history is limited to last 100 tasks
- For production, consider using a database (Redis, PostgreSQL, etc.)
- WebSocket connections should be monitored and cleaned up

## Security Notes

- Webhook endpoints should be protected with authentication in production
- Validate all incoming event data
- Sanitize task results before storing
- Rate limit webhook endpoints to prevent abuse

---

**Last Updated**: 2026-01-12  
**Version**: 1.0.0
