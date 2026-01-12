# Agent Delegation Quick Start Guide

## What is Agent Delegation?

Agent Delegation automatically assigns GitHub issues and PRs to specialized AI agents based on content analysis. When a new issue or PR is created, the system analyzes the title, description, and labels to find the most suitable agent to handle it.

## Quick Example

### Scenario: Security Issue

**GitHub Issue Created:**
```
Title: Security: Remove exposed API keys from config
Labels: security, critical
```

**What Happens:**
1. GitHub webhook triggers
2. N8N sends event to Wallestars
3. Agent Delegation Service analyzes content
4. **Security Cleanup Agent** matched (keywords: "security", "exposed", "api keys")
5. Task assigned with score of 50 points
6. WebSocket notification sent
7. Agent begins work

## Testing the System

### Option 1: Run Tests

```bash
# Clone the repository
cd Wallestars

# Run the test suite
node test/agentDelegation.test.js
```

**Expected output:**
```
🧪 Testing Agent Delegation Service...

Test 1: Get all agents
✅ Found 9 registered agents

Test 3: Analyze security-related issue
✅ Matched agent: Security Cleanup Agent
   Score: 50
   
✨ All tests completed!
```

### Option 2: Manual API Testing

```bash
# 1. Start the server (in another terminal)
npm run dev

# 2. Simulate a GitHub event
curl -X POST http://localhost:3000/api/webhooks/n8n/github-event \
  -H "Content-Type: application/json" \
  -d '{
    "event": {
      "eventType": "issue",
      "action": "opened",
      "title": "Add VPS deployment automation",
      "body": "We need nginx and PM2 setup for production server",
      "labels": ["deployment", "infrastructure"],
      "number": 123,
      "url": "https://github.com/example/repo/issues/123",
      "isAgentBranch": false
    }
  }'

# 3. Check the response
# You should see:
# {
#   "success": true,
#   "delegation": {
#     "success": true,
#     "assignment": {
#       "agentName": "VPS Deployment Agent",
#       ...
#     }
#   }
# }

# 4. View active assignments
curl http://localhost:3000/api/agents/assignments/active

# 5. View all agents
curl http://localhost:3000/api/agents/agents

# 6. View delegation dashboard
curl http://localhost:3000/api/agents/dashboard
```

## Available Agents

| Agent | Keywords | Priority |
|-------|----------|----------|
| **Security Cleanup** | security, credentials, exposed, vulnerability | P0 Critical |
| **VPS Deployment** | deploy, vps, nginx, pm2, hosting | P0 Critical |
| **Testing Infrastructure** | test, testing, vitest, unit test | P1 High |
| **Documentation** | docs, readme, guide, contributing | P1 High |
| **CI/CD Pipeline** | ci, cd, pipeline, github actions | P1 High |
| **QR Scanner Feature** | qr, scanner, barcode, camera | P2 Medium |
| **N8N Integration** | n8n, workflow, automation, webhook | P2 Medium |
| **Copilot Config** | copilot, instructions, configuration | P2 Medium |
| **DevContainer** | devcontainer, vscode, docker | P3 Low |

## Real-World Examples

### Example 1: Security Issue
**Issue:** "Fix exposed credentials in .env.example"
**Matched Agent:** Security Cleanup Agent
**Score:** 35 points (keywords: "exposed", "credentials")

### Example 2: Deployment PR
**PR:** "Add production deployment scripts for Hostinger VPS"
**Matched Agent:** VPS Deployment Agent
**Score:** 55 points (keywords: "deployment", "production", "vps", "hosting")

### Example 3: Testing Task
**Issue:** "Add Vitest unit tests for authentication"
**Matched Agent:** Testing Infrastructure Agent
**Score:** 40 points (keywords: "vitest", "unit tests", "test")

### Example 4: Documentation Update
**Issue:** "Create CONTRIBUTING.md with guidelines"
**Matched Agent:** Documentation Agent
**Score:** 30 points (keywords: "contributing", "guidelines")

## Integration with N8N

The system works seamlessly with N8N workflows:

1. **N8N Workflow** (already configured):
   - Listens for GitHub webhooks
   - Parses event data
   - Sends to Wallestars

2. **Wallestars** (automatic):
   - Receives event
   - Analyzes content
   - Delegates to agent
   - Sends notifications

3. **No additional setup needed!**

## Monitoring

### Dashboard API
```bash
curl http://localhost:3000/api/agents/dashboard
```

**Response:**
```json
{
  "summary": {
    "totalAgents": 9,
    "availableAgents": 7,
    "busyAgents": 2,
    "activeAssignments": 2
  },
  "agents": [...],
  "activeAssignments": [...]
}
```

### WebSocket Events

Connect to WebSocket for real-time updates:

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('n8n:agent-delegation', (data) => {
  console.log('New assignment:', data.assignment);
  console.log('For event:', data.event);
});

socket.on('n8n:agent-assignment-complete', (data) => {
  console.log('Assignment completed:', data);
});
```

## Best Practices

### ✅ DO:
- Use descriptive issue/PR titles with relevant keywords
- Add appropriate labels (security, deployment, testing, etc.)
- Include detailed descriptions for better matching
- Mark assignments complete when done

### ❌ DON'T:
- Create issues with vague titles like "Fix bug"
- Forget to add labels
- Leave agents in "busy" state indefinitely
- Create loops (agents creating agent-triggering events)

## Troubleshooting

### No Agent Matched
**Problem:** Event didn't match any agent

**Solutions:**
1. Check if keywords are in the title/description
2. Add relevant labels
3. Review agent keywords in the documentation
4. Lower the score threshold if needed

### Agent Stuck in Busy State
**Problem:** Agent shows as busy but not working

**Solution:**
```bash
# Find the assignment ID
curl http://localhost:3000/api/agents/assignments/active

# Mark it complete
curl -X POST http://localhost:3000/api/agents/assignments/{id}/complete
```

### Multiple Agents Match
**Problem:** Multiple agents could handle the task

**Behavior:** System automatically selects the highest scoring agent. Priority agents (P0) get bonus points.

## Next Steps

1. **Read full documentation:** [AGENT_DELEGATION_WORKFLOW.md](AGENT_DELEGATION_WORKFLOW.md)
2. **Set up N8N workflows:** [n8n-workflows/IMPLEMENTATION_GUIDE.md](n8n-workflows/IMPLEMENTATION_GUIDE.md)
3. **Configure GitHub webhooks:** Follow the N8N guide
4. **Monitor the dashboard:** Use the API endpoints
5. **Customize agents:** Add or modify agents in `server/services/agentDelegation.js`

## Support

- **Documentation:** [AGENT_DELEGATION_WORKFLOW.md](AGENT_DELEGATION_WORKFLOW.md)
- **Tests:** [test/README.md](test/README.md)
- **GitHub Issues:** [github.com/Wallesters-org/Wallestars/issues](https://github.com/Wallesters-org/Wallestars/issues)

---

**Ready to automate your workflow? Start testing the system now!** 🚀
