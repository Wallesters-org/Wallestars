# Agent Delegation Tests

## Running Tests

To test the agent delegation service without starting the full server:

```bash
# Run the test file
node test/agentDelegation.test.js
```

## Test Coverage

The test file covers the following scenarios:

1. **Get All Agents** - Verifies all 9 agents are registered
2. **Check Available Agents** - Confirms agents start in available state
3. **Security Event Matching** - Tests keyword matching for security issues
4. **Deployment Event Matching** - Tests VPS/deployment keyword matching
5. **Task Delegation** - Verifies task can be assigned to an agent
6. **Active Assignments** - Checks assignment tracking
7. **Complete Assignment** - Tests marking assignments complete and freeing agents
8. **Loop Prevention** - Ensures agent branch events are skipped
9. **Low Score Events** - Verifies events below threshold aren't matched
10. **Documentation Matching** - Tests matching for documentation tasks

## Expected Output

```
🧪 Testing Agent Delegation Service...

Test 1: Get all agents
✅ Found 9 registered agents
Agents: Security Cleanup Agent, VPS Deployment Agent, QR Scanner Feature Agent, N8N Integration Agent, Copilot Configuration Agent, DevContainer Agent, Testing Infrastructure Agent, Documentation Agent, CI/CD Pipeline Agent

Test 2: Check available agents
✅ 9 agents available

Test 3: Analyze security-related issue
✅ Matched agent: Security Cleanup Agent
   Score: 50
   Reason: Agent "Security Cleanup Agent" matched for issue event: "Security: Exposed API keys in configuration file" (action: opened)

Test 4: Analyze deployment-related PR
✅ Matched agent: VPS Deployment Agent
   Score: 50
   Reason: Agent "VPS Deployment Agent" matched for pull_request event: "Add VPS deployment scripts for production" (action: opened)

Test 5: Delegate security task
✅ Task delegated successfully
   Assignment ID: agent-security-cleanup-1736649600000
   Agent: Security Cleanup Agent
   Status: assigned

Test 6: Check active assignments
✅ 1 active assignment(s)

Test 7: Complete assignment
✅ Assignment completed
   Completed at: 2026-01-12T04:00:00.000Z
   Agent status: available

Test 8: Skip agent branch events (loop prevention)
✅ Agent branch correctly skipped

Test 9: Event with low match score (should not match)
✅ Correctly did not match (score too low)

Test 10: Documentation-related issue
✅ Matched agent: Documentation Agent
   Score: 35
   Reason: Agent "Documentation Agent" matched for issue event: "Add contributing guidelines documentation" (action: opened)

✨ All tests completed!

📊 Test Summary:
================
Total agents registered: 9
Available agents: 9
Active assignments: 0

✅ Agent delegation service is working correctly!
```

## Integration Testing

To test with actual GitHub webhooks:

1. Start the server:
   ```bash
   npm run dev
   ```

2. Trigger a GitHub webhook (via N8N or manually):
   ```bash
   curl -X POST http://localhost:3000/api/webhooks/n8n/github-event \
     -H "Content-Type: application/json" \
     -d '{
       "event": {
         "eventType": "issue",
         "action": "opened",
         "title": "Security: Fix exposed credentials",
         "body": "Need to remove API keys from config",
         "labels": ["security"],
         "number": 123,
         "url": "https://github.com/example/repo/issues/123",
         "isAgentBranch": false
       }
     }'
   ```

3. Check the response for delegation information:
   ```json
   {
     "success": true,
     "message": "GitHub event received",
     "eventId": 1,
     "delegation": {
       "success": true,
       "assignment": {
         "id": "agent-security-cleanup-1736649600000",
         "agentName": "Security Cleanup Agent",
         ...
       },
       "message": "Task delegated to Security Cleanup Agent"
     }
   }
   ```

4. View active assignments:
   ```bash
   curl http://localhost:3000/api/agents/assignments/active
   ```

5. Check delegation dashboard:
   ```bash
   curl http://localhost:3000/api/agents/dashboard
   ```

## Automated Testing with npm

You can add this to `package.json`:

```json
{
  "scripts": {
    "test:agents": "node test/agentDelegation.test.js"
  }
}
```

Then run:
```bash
npm run test:agents
```
