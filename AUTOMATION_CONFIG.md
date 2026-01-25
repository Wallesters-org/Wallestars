# 🤖 Automation Configuration Guide

This document describes all automation configurations and how to use them effectively for active PR sessions.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Workflow Configuration](#workflow-configuration)
3. [MCP Integration](#mcp-integration)
4. [n8n Webhooks](#n8n-webhooks)
5. [Environment Setup](#environment-setup)
6. [Usage Examples](#usage-examples)

---

## 🎯 Overview

Wallestars uses a comprehensive automation system that manages the entire PR lifecycle:

- **GitHub Actions**: CI/CD workflows for testing, building, and deployment
- **MCP Protocol**: Integration with Claude Desktop for AI-powered automation
- **n8n Workflows**: External automation and monitoring
- **Socket.io**: Real-time communication for live updates

---

## 🔄 Workflow Configuration

### Master Workflow: PR Session Manager

**File**: `.github/workflows/pr-session-manager.yml`

**Triggers**:
- Pull request events (opened, updated, labeled, etc.)
- Pull request reviews (submitted, dismissed)
- Issue comments
- Schedule (every 10 minutes)
- Manual dispatch

**Jobs**:
1. **initialize-session**: Set up PR session tracking
2. **delegate-agents**: Assign agents to PRs via round-robin
3. **automated-testing**: Run unit, integration, and build tests
4. **quality-security-scan**: Lint, audit, and security checks
5. **mcp-validation**: Verify MCP tools and configuration
6. **merge-readiness**: Evaluate if PR is ready to merge
7. **notify-and-report**: Send notifications and create summaries

**Configuration**:
```yaml
# Customize in .github/workflows/pr-session-manager.yml
permissions:
  contents: write        # Can modify repository
  pull-requests: write   # Can manage PRs
  issues: write         # Can create issues/comments
  checks: write         # Can create check runs
  statuses: write       # Can set commit statuses
```

**Agent Configuration**:
```yaml
agents:
  - copilot-agent-1
  - copilot-agent-2
  - copilot-agent-3
  - copilot-agent-4
```

To add more agents, edit the workflow file and add to the agents array.

### Supporting Workflows

#### 1. PR Automation (pr-automation.yml)
- Delegates PRs to agents
- Creates automated comments
- Sends webhooks to n8n

#### 2. Testing Automation (testing-automation.yml)
- Runs test suites across Node.js versions
- Executes quality checks
- Creates test session issues

#### 3. CI (ci.yml)
- Standard continuous integration
- Runs on all PRs and pushes to main

#### 4. Agent Monitoring (agent-monitoring.yml)
- Monitors agent activity
- Detects stale PRs
- Generates daily reports

---

## 🔌 MCP Integration

### Configuration File

**File**: `.mcp.json`

```json
{
  "mcpServers": {
    "wallestars-control": {
      "command": "node",
      "args": ["server/index.js"],
      "env": {
        "ANTHROPIC_API_KEY": "${ANTHROPIC_API_KEY}",
        "PORT": "3000",
        "NODE_ENV": "production",
        "ENABLE_COMPUTER_USE": "true",
        "ENABLE_ANDROID": "false",
        "SCREENSHOT_INTERVAL": "2000",
        "ADB_HOST": "localhost",
        "ADB_PORT": "5037",
        "WS_PORT": "3001"
      }
    }
  }
}
```

### Available MCP Tools

#### 1. Claude AI Integration
- **Purpose**: AI-powered code review and analysis
- **Endpoint**: `/api/claude/*`
- **Capabilities**:
  - Chat with Claude Sonnet 4.5
  - Code review and suggestions
  - Documentation generation
  - Bug analysis

#### 2. Computer Use API
- **Purpose**: Linux desktop automation
- **Endpoint**: `/api/computer/*`
- **Capabilities**:
  - Screenshot capture
  - Mouse control (click, drag)
  - Keyboard input
  - System information
  - Safe command execution

#### 3. Android Control
- **Purpose**: Android device automation
- **Endpoint**: `/api/android/*`
- **Capabilities**:
  - Device screenshot
  - Touch simulation
  - Text input
  - Hardware button presses
  - APK installation

### Using MCP in Workflows

Example workflow step using MCP:

```yaml
- name: AI Code Review with Claude
  run: |
    # Use Claude via MCP for code review
    curl -X POST http://localhost:3000/api/claude/review \
      -H "Content-Type: application/json" \
      -d '{
        "pr_number": "${{ github.event.pull_request.number }}",
        "files": ["src/components/MyComponent.jsx"]
      }'
```

---

## 🌐 n8n Webhooks

### Configuration

**Environment Variable**: `N8N_WEBHOOK_URL`

Set this in GitHub repository secrets:
```
Settings → Secrets and variables → Actions → New repository secret
Name: N8N_WEBHOOK_URL
Value: https://your-n8n-instance.com
```

### Available Webhooks

#### 1. PR Delegated
- **Endpoint**: `/webhook/pr-delegated`
- **Trigger**: When PR is assigned to an agent
- **Payload**:
  ```json
  {
    "pr_number": 123,
    "pr_title": "Add new feature",
    "agent": "copilot-agent-1",
    "url": "https://github.com/...",
    "timestamp": "2026-01-17T10:00:00Z"
  }
  ```

#### 2. Agent Status
- **Endpoint**: `/webhook/agent-status`
- **Trigger**: Agent monitoring checks (every 10 minutes)
- **Payload**:
  ```json
  {
    "agents": {
      "copilot-agent-1": {
        "assigned_prs": 3,
        "last_activity": "2026-01-17T09:55:00Z",
        "is_active": true,
        "status": "🟢 Active"
      }
    },
    "timestamp": "2026-01-17T10:00:00Z"
  }
  ```

#### 3. Test Results
- **Endpoint**: `/webhook/test-results`
- **Trigger**: After test suite completion
- **Payload**:
  ```json
  {
    "workflow": "testing-automation",
    "tests_passed": "success",
    "code_quality": "success",
    "security_scan": "success",
    "build_verification": "success",
    "timestamp": "2026-01-17T10:00:00Z",
    "repository": "Wallesters-org/Wallestars",
    "pr_number": "123"
  }
  ```

#### 4. PR Session Complete
- **Endpoint**: `/webhook/pr-session-complete`
- **Trigger**: After PR session workflow completes
- **Payload**:
  ```json
  {
    "workflow": "pr-session-manager",
    "status": "completed",
    "timestamp": "2026-01-17T10:00:00Z",
    "repository": "Wallesters-org/Wallestars",
    "session_id": "session-1234567890"
  }
  ```

### n8n Workflow Files

Location: `n8n-workflows/`

Available workflows:
- `pr-monitoring-system.json` - PR monitoring and commenting
- `agent-task-monitor.json` - Agent task tracking
- `github-automation.json` - GitHub automation tasks
- `continuous-agent-monitor.json` - Continuous agent monitoring
- `system-health-monitor.json` - System health checks

---

## ⚙️ Environment Setup

### Required Environment Variables

#### GitHub Actions Secrets

Set these in: `Settings → Secrets and variables → Actions`

```env
# Required
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Optional for n8n integration
N8N_WEBHOOK_URL=https://your-n8n-instance.com

# Optional for external services
GITHUB_TOKEN=ghp_your_token_here  # Automatically provided by GitHub Actions
```

#### Local Development

Create `.env` file:

```env
# Required
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Server configuration
PORT=3000
NODE_ENV=development

# Feature flags
ENABLE_COMPUTER_USE=true
ENABLE_ANDROID=false

# Optional
N8N_WEBHOOK_URL=http://localhost:5678
FRONTEND_URL=http://localhost:5173
```

### MCP Setup for Claude Desktop

1. **Copy example configuration**:
   ```bash
   cp claude_desktop_config.json.example ~/.config/claude/claude_desktop_config.json
   ```

2. **Edit configuration** with absolute paths:
   ```json
   {
     "mcpServers": {
       "wallestars-control": {
         "command": "node",
         "args": ["/absolute/path/to/Wallestars/server/index.js"],
         "env": {
           "ANTHROPIC_API_KEY": "sk-ant-your-key-here"
         }
       }
     }
   }
   ```

3. **Restart Claude Desktop**

---

## 🚀 Usage Examples

### Example 1: Automated PR Review

When you open a PR:

1. **Automatic trigger**: PR Session Manager activates
2. **Agent assignment**: Round-robin agent assigned
3. **Tests run**: All test suites execute
4. **Quality check**: Linting and security scanning
5. **MCP validation**: Claude AI reviews code
6. **Merge check**: Readiness evaluated
7. **Notification**: Status posted to PR

**Result**: Complete automation without manual intervention

### Example 2: Manual Workflow Dispatch

Trigger workflow for specific PR:

```bash
# Via GitHub CLI
gh workflow run pr-session-manager.yml -f pr_number=123

# Via GitHub UI
Actions → PR Session Manager → Run workflow → Enter PR number
```

### Example 3: Using MCP Tools

In Claude Desktop:

```
Can you review the code in PR #123 of Wallestars repository?
```

Claude will:
1. Connect to Wallestars via MCP
2. Fetch PR details
3. Analyze code changes
4. Provide detailed review

### Example 4: Monitoring Active PRs

View agent status:

```bash
# Check workflow run
gh run list --workflow=agent-monitoring.yml

# View latest summary
gh run view --log
```

### Example 5: n8n Integration

Set up n8n workflow:

1. Import `n8n-workflows/pr-monitoring-system.json`
2. Configure webhook URL
3. Add to GitHub secrets: `N8N_WEBHOOK_URL`
4. Workflows automatically send data to n8n

---

## 🔍 Troubleshooting

### Issue: Workflows not triggering

**Check**:
1. Workflow file syntax: `yamllint .github/workflows/`
2. Permissions in workflow file
3. Branch protection rules
4. GitHub Actions enabled in repository settings

### Issue: MCP not connecting

**Check**:
1. Absolute paths in `claude_desktop_config.json`
2. API key is valid
3. Server starts without errors: `node server/index.js`
4. Check Claude Desktop logs

### Issue: n8n webhooks not receiving data

**Check**:
1. `N8N_WEBHOOK_URL` secret is set
2. n8n instance is accessible
3. Webhook endpoints are active
4. Check workflow logs for curl errors

### Issue: Tests failing

**Check**:
1. Dependencies installed: `npm ci`
2. Environment variables set
3. Node.js version: `node --version` (should be 20.x+)
4. Check test logs: `npm run test`

---

## 📚 Related Documentation

- [PROJECT_ROADMAP.md](PROJECT_ROADMAP.md) - Complete project roadmap
- [REPOSITORY_CONSOLIDATION.md](REPOSITORY_CONSOLIDATION.md) - Repo structure changes
- [MCP_SETUP.md](MCP_SETUP.md) - Detailed MCP setup guide
- [n8n-workflows/README.md](n8n-workflows/README.md) - n8n workflow documentation

---

## 🤝 Contributing

To add new automation:

1. Create workflow file in `.github/workflows/`
2. Document in this file
3. Update PROJECT_ROADMAP.md
4. Test with workflow dispatch
5. Submit PR

---

**Last Updated**: January 2026  
**Version**: 1.0  
**Maintained by**: Wallestars Development Team
