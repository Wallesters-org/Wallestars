---
name: "Wallestars Registration"
description: "Trigger and manage Wallesters business registration workflows"
icon: "🏢"
version: "1.0.0"
author: "Wallestars"
requires:
  - "node-fetch"
env:
  - N8N_WEBHOOK_URL
  - N8N_API_KEY
---

# Wallestars Registration Skill

## Description

This skill allows Molty to trigger and manage business registration workflows on the Wallesters platform through n8n automation.

## Capabilities

### Start Registration
Initiate a new business registration process for a verified owner.

**Input:**
- `owner_id` - UUID of the verified owner
- `company_index` - Index of company in waiting_list (default: 0)

**Output:**
- `workflow_execution_id` - ID of the started workflow
- `status` - Current status of the registration

### Check Registration Status
Query the status of an ongoing registration.

**Input:**
- `execution_id` - Workflow execution ID

**Output:**
- `status` - pending | processing | completed | failed
- `current_step` - Current step in the registration process
- `details` - Additional status information

### Cancel Registration
Cancel an ongoing registration process.

**Input:**
- `execution_id` - Workflow execution ID

**Output:**
- `success` - Boolean indicating cancellation success

## Usage Examples

### Starting a Registration
```
User: Start registration for owner abc-123
Molty: I'll start the Wallesters registration for this owner.
       🔄 Triggering registration workflow...
       ✅ Registration started. Execution ID: exec-456
       Current step: Initializing browser session
```

### Checking Status
```
User: What's the status of registration exec-456?
Molty: 📊 Registration Status:
       - Execution ID: exec-456
       - Status: processing
       - Current Step: SMS Verification
       - Phone: +359888******
       - Waiting for OTP code...
```

## Configuration

This skill uses the following environment variables:
- `N8N_WEBHOOK_URL` - Base URL for n8n webhooks
- `N8N_API_KEY` - API key for n8n authentication

## Error Handling

| Error Code | Meaning | Recovery |
|------------|---------|----------|
| NO_OWNER | Owner not found in database | Verify owner_id |
| NO_COMPANY | No companies in waiting_list | Add company first |
| WORKFLOW_FAILED | n8n workflow execution failed | Check n8n logs |
| TIMEOUT | Registration timed out | Retry or manual check |

## Security Notes

- Only verified owners can be registered
- Rate limited to 1 registration per owner per hour
- All actions are logged in verification_logs table
