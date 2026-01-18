# Agent Delegation Workflow

## Overview

The Agent Delegation System automatically assigns GitHub issues and pull requests to appropriate AI agents based on content analysis and keyword matching. This enables automated task distribution when new events come in from GitHub webhooks.

## How It Works

### 1. GitHub Event Flow

```
GitHub Event → N8N Workflow → Wallestars Webhook → Agent Delegation Service → Agent Assignment
```

1. **GitHub triggers event** (issue opened, PR created, etc.)
2. **N8N workflow processes** the event and extracts key information
3. **Event sent to Wallestars** via `/api/webhooks/n8n/github-event` endpoint
4. **Agent Delegation Service analyzes** event content
5. **Matching agent found** based on keywords and priority
6. **Agent assigned** and notification sent via WebSocket

### 2. Agent Matching Algorithm

The system uses a scoring algorithm to match events to agents:

- **Keyword matching** (10 points per keyword found in title/body)
- **Label matching** (15 points per matching label)
- **Priority boost** (5-15 points based on agent priority level)

**Minimum score threshold**: 10 points

**Selection**: Highest scoring available agent is assigned

### 3. Agent Registry

The following agents are registered in the system:

| Agent ID | Name | Priority | Expertise |
|----------|------|----------|-----------|
| `agent-security-cleanup` | Security Cleanup Agent | P0 (Critical) | Security, credentials, vulnerabilities |
| `agent-vps-deploy` | VPS Deployment Agent | P0 (Critical) | Deployment, VPS, hosting, nginx |
| `agent-testing-setup` | Testing Infrastructure Agent | P1 (High) | Testing, vitest, unit tests |
| `agent-docs-complete` | Documentation Agent | P1 (High) | Documentation, markdown, guides |
| `agent-cicd-setup` | CI/CD Pipeline Agent | P1 (High) | CI/CD, GitHub Actions, workflows |
| `agent-qr-feature` | QR Scanner Feature Agent | P2 (Medium) | Frontend, QR scanner, React |
| `agent-n8n-integration` | N8N Integration Agent | P2 (Medium) | N8N, workflows, automation |
| `agent-copilot-config` | Copilot Configuration Agent | P2 (Medium) | Copilot, GitHub, configuration |
| `agent-devcontainer` | DevContainer Agent | P3 (Nice to have) | DevContainer, VSCode, Docker |

### 4. Keywords for Each Agent

**Security Agent Keywords:**
- security, exposed, credentials, vulnerability, password, api key, secret, token

**VPS Deployment Agent Keywords:**
- deploy, vps, hosting, nginx, pm2, ssl, server, production

**QR Scanner Agent Keywords:**
- qr, scanner, barcode, camera, scan

**N8N Integration Agent Keywords:**
- n8n, workflow, automation, webhook, integration

**Copilot Configuration Agent Keywords:**
- copilot, github copilot, instructions, configuration, setup

**DevContainer Agent Keywords:**
- devcontainer, vscode, docker, development environment, container

**Testing Agent Keywords:**
- test, testing, vitest, unit test, integration test, e2e

**Documentation Agent Keywords:**
- documentation, docs, readme, guide, contributing, license

**CI/CD Agent Keywords:**
- ci, cd, pipeline, github actions, workflow, automation, build

## API Endpoints

### Get All Agents
```http
GET /api/agents/agents
```

**Response:**
```json
{
  "success": true,
  "count": 9,
  "agents": [
    {
      "id": "agent-security-cleanup",
      "name": "Security Cleanup Agent",
      "expertise": ["security", "credentials"],
      "priority": 0,
      "status": "available",
      "keywords": ["security", "exposed", "credentials"]
    }
  ]
}
```

### Get Available Agents
```http
GET /api/agents/agents/available
```

Returns only agents with status "available" (not busy).

### Get Agent Status
```http
GET /api/agents/agents/:agentId
```

**Example:**
```http
GET /api/agents/agents/agent-security-cleanup
```

### Get Active Assignments
```http
GET /api/agents/assignments/active
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "assignments": [
    {
      "id": "agent-security-cleanup-1736649600000",
      "agentId": "agent-security-cleanup",
      "agentName": "Security Cleanup Agent",
      "event": {
        "type": "issue",
        "action": "opened",
        "number": 123,
        "title": "Security: Remove exposed API keys",
        "url": "https://github.com/..."
      },
      "score": 45,
      "reason": "Agent \"Security Cleanup Agent\" matched for issue event...",
      "status": "assigned",
      "assignedAt": "2026-01-12T04:00:00.000Z",
      "completedAt": null
    }
  ]
}
```

### Get Completed Assignments
```http
GET /api/agents/assignments/completed?limit=10
```

### Mark Assignment Complete
```http
POST /api/agents/assignments/:assignmentId/complete
```

**Example:**
```http
POST /api/agents/assignments/agent-security-cleanup-1736649600000/complete
```

This will:
1. Mark the assignment as complete
2. Free up the agent (status changes to "available")
3. Emit WebSocket event `n8n:agent-assignment-complete`

### Get Delegation Dashboard
```http
GET /api/agents/dashboard
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2026-01-12T04:00:00.000Z",
  "summary": {
    "totalAgents": 9,
    "availableAgents": 7,
    "busyAgents": 2,
    "activeAssignments": 2,
    "recentCompletions": 5
  },
  "agents": [...],
  "activeAssignments": [...],
  "recentCompletions": [...]
}
```

## WebSocket Events

The system emits the following WebSocket events for real-time updates:

### Agent Delegation Event
**Event:** `n8n:agent-delegation`

Emitted when a task is delegated to an agent.

**Payload:**
```javascript
{
  assignment: {
    id: "agent-security-cleanup-1736649600000",
    agentId: "agent-security-cleanup",
    agentName: "Security Cleanup Agent",
    // ...
  },
  event: {
    eventType: "issue",
    action: "opened",
    title: "Security: Remove exposed API keys",
    // ...
  }
}
```

### Assignment Complete Event
**Event:** `n8n:agent-assignment-complete`

Emitted when an agent completes a task.

**Payload:**
```javascript
{
  id: "agent-security-cleanup-1736649600000",
  agentId: "agent-security-cleanup",
  agentName: "Security Cleanup Agent",
  status: "completed",
  completedAt: "2026-01-12T05:00:00.000Z"
}
```

## Usage Examples

### Example 1: Security Issue Detection

**Scenario:** New GitHub issue opened with title "Exposed API keys in config file"

**Process:**
1. GitHub webhook triggers
2. N8N extracts event data
3. Agent Delegation analyzes content
4. Keywords matched: "exposed", "api keys" → Security Agent
5. Score: 20 (keywords) + 15 (P0 priority) = 35
6. Security Agent assigned
7. WebSocket notification sent

### Example 2: VPS Deployment PR

**Scenario:** Pull request created with title "Add VPS deployment scripts"

**Process:**
1. Event received via webhook
2. Keywords matched: "vps", "deployment" → VPS Deployment Agent
3. Score: 20 (keywords) + 15 (P0 priority) = 35
4. VPS Agent assigned
5. Task tracked in active assignments

### Example 3: No Match

**Scenario:** Issue "Update README formatting"

**Process:**
1. Event received
2. Keywords matched: "readme" → Documentation Agent (10 points)
3. Score: 10 (minimum threshold met)
4. Documentation Agent assigned

## Integration with N8N

The agent delegation system integrates seamlessly with N8N workflows:

### N8N Workflow Configuration

The GitHub Automation workflow (`n8n-workflows/github-automation.json`) already:
1. Captures GitHub events (issues, PRs)
2. Parses event data
3. Sends to Wallestars webhook endpoint

**No additional N8N configuration needed!**

The delegation happens automatically when events are received.

### Adding Custom Logic to N8N (Optional)

You can extend the N8N workflow to:
1. Send notification to Slack when agent assigned
2. Create Jira ticket for high-priority assignments
3. Email team when critical agent is engaged

## Monitoring and Management

### Check System Health

```bash
# Health check including agent delegation
curl http://localhost:3000/api/health

# Agent delegation test endpoint
curl http://localhost:3000/api/agents/test
```

### View Active Delegations

```bash
# Get active assignments
curl http://localhost:3000/api/agents/assignments/active

# Get delegation dashboard
curl http://localhost:3000/api/agents/dashboard
```

### Monitor in Real-Time

Connect to WebSocket and listen for events:

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('n8n:agent-delegation', (data) => {
  console.log('Task delegated:', data);
});

socket.on('n8n:agent-assignment-complete', (data) => {
  console.log('Task completed:', data);
});
```

## Avoiding Loops

The system automatically skips events from agent branches to prevent infinite loops:

- Branches starting with `copilot/` are skipped
- Branches starting with `claude/` are skipped

This prevents agents from triggering delegation when they create their own PRs.

## Best Practices

### 1. Use Descriptive Titles and Labels

For better agent matching:
- Include relevant keywords in issue/PR titles
- Use appropriate labels (e.g., "security", "deployment", "testing")
- Add detailed descriptions with context

### 2. Mark Tasks Complete

When an agent finishes work:
```bash
curl -X POST http://localhost:3000/api/agents/assignments/{assignmentId}/complete
```

This frees up the agent for new tasks.

### 3. Monitor Dashboard

Regularly check the delegation dashboard:
```bash
curl http://localhost:3000/api/agents/dashboard
```

Look for:
- Agents stuck in "busy" state
- High number of active assignments
- Pattern of unmatched events

### 4. Adjust Keywords

If agents aren't matching correctly, update keywords in:
```
server/services/agentDelegation.js
```

Add or remove keywords from the `AGENT_SESSIONS` registry.

### 5. Priority Management

Adjust agent priorities based on project needs:
- P0 (0) = Critical, immediate attention
- P1 (1) = High priority, within 24 hours
- P2 (2) = Medium priority, this week
- P3 (3) = Nice to have, backlog

## Troubleshooting

### Agent Not Being Assigned

**Possible causes:**
1. No keyword match (score < 10)
2. All relevant agents are busy
3. Event is from agent branch (skipped)

**Solution:**
- Check event content for keywords
- View available agents: `GET /api/agents/agents/available`
- Review delegation logs in server console

### Agent Stuck in Busy State

**Possible causes:**
1. Task wasn't marked complete
2. Agent crashed during task

**Solution:**
```bash
# Find the assignment
curl http://localhost:3000/api/agents/assignments/active

# Mark it complete manually
curl -X POST http://localhost:3000/api/agents/assignments/{id}/complete
```

### No Agents Available

**Possible causes:**
1. All agents are assigned tasks
2. System initialization issue

**Solution:**
- Restart the server to reset agent states
- Complete old assignments
- Add more agent capacity

## Future Enhancements

Potential improvements for the agent delegation system:

1. **Persistent Storage**: Use database instead of in-memory storage
2. **Agent Load Balancing**: Distribute work among multiple instances of same agent type
3. **SLA Tracking**: Monitor time to assignment and completion
4. **Machine Learning**: Learn from past assignments to improve matching
5. **Manual Override**: UI to manually assign/reassign tasks
6. **Agent Capacity Limits**: Configure how many tasks each agent can handle
7. **Escalation Rules**: Auto-escalate if agent doesn't complete within SLA
8. **Rollback Support**: Ability to undo agent assignments

## References

- [Agent Delegation Guide](.github/TASKS/AGENT_DELEGATION_GUIDE.md)
- [N8N Integration Guide](n8n-workflows/IMPLEMENTATION_GUIDE.md)
- [Priority Tasks](.github/TASKS/PRIORITY_TASKS_2026-01-11.md)
- [Orchestration Dashboard](.github/TASKS/ORCHESTRATION_DASHBOARD.md)

---

**Last Updated:** 2026-01-12  
**Version:** 1.0.0
