# AI Agent Orchestration Farm

A multi-agent orchestration system for automating tasks across multiple AI platforms simultaneously. This system allows you to add free trial AI platforms to your workspace and have them all work in parallel.

## Overview

The AI Orchestration Farm enables:
- **Parallel Execution**: Run the same prompt on multiple AI platforms simultaneously
- **Load Balancing**: Distribute tasks across agents using round-robin, least-busy, or priority strategies
- **Workflow Templates**: Pre-built patterns for research, code review, content generation, and more
- **Platform Management**: Easy addition of new AI platforms with free trials
- **Real-time Monitoring**: Track agent status, metrics, and health via N8N workflows

## Supported Platforms (Free Trials/Tiers)

| Platform | Tier | Free Credits | Capabilities |
|----------|------|--------------|--------------|
| Anthropic Claude | Free Tier | $5 API credits | Chat, Reasoning, Code, Analysis |
| OpenAI GPT | Free Tier | $5 API credits | Chat, Code, Vision, Function Calling |
| Google Gemini | Free Tier | 60 req/min | Chat, Vision, Code, Multimodal |
| GitHub Copilot | Free Trial | 30 days | Code Completion, PR Automation |
| Codeium | Free Tier | Unlimited | Code Completion, Chat |
| Hugging Face | Free Tier | API with limits | Text Gen, Embeddings, Classification |
| Groq | Free Tier | Rate limited | Chat, Code, Fast Inference |
| Together AI | Free Trial | $25 credits | Chat, Code, Embeddings |
| Perplexity | Free Tier | Limited | Search, Chat, Real-time Data |
| Replicate | Free Trial | Credits | Text, Image, Audio Generation |

## Quick Start

### 1. Initialize the Farm

```bash
# Start the server
npm run dev

# Initialize via API
curl -X POST http://localhost:3000/api/orchestration/initialize
```

### 2. Add Platform API Keys

Create or update your `.env` file with API keys:

```env
# Core AI Platforms
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx
GOOGLE_API_KEY=xxx

# Additional Platforms (Free)
GROQ_API_KEY=gsk-xxx
TOGETHER_API_KEY=xxx
HUGGINGFACE_API_KEY=hf_xxx
PERPLEXITY_API_KEY=pplx-xxx
REPLICATE_API_TOKEN=r8_xxx
```

### 3. Generate Environment Template

```bash
# Get a template with all available platforms
curl http://localhost:3000/api/orchestration/env-template
```

## API Endpoints

### Farm Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orchestration/initialize` | Initialize the farm with all configured platforms |
| GET | `/api/orchestration/status` | Get current farm status |
| GET | `/api/orchestration/metrics` | Get performance metrics |
| POST | `/api/orchestration/stop` | Stop the orchestration farm |

### Platform Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orchestration/platforms` | List all platforms (configured & available) |
| GET | `/api/orchestration/platforms/:id` | Get platform details |
| GET | `/api/orchestration/platforms/capability/:cap` | Get platforms by capability |
| GET | `/api/orchestration/setup-guide` | Get setup instructions for unconfigured platforms |
| GET | `/api/orchestration/env-template` | Generate .env template |
| POST | `/api/orchestration/add-agent/:platformId` | Add a new agent |
| DELETE | `/api/orchestration/agent/:agentId` | Remove an agent |

### Task Execution

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orchestration/execute` | Submit a task to the farm |
| POST | `/api/orchestration/execute-all` | Execute on ALL agents simultaneously |
| POST | `/api/orchestration/parallel` | Execute multiple different tasks in parallel |
| POST | `/api/orchestration/smart-execute` | Smart routing based on capabilities |
| POST | `/api/orchestration/workflow/:id` | Execute a predefined workflow |
| GET | `/api/orchestration/workflows` | List available workflows |

## Usage Examples

### Execute Task on All Agents

Get diverse responses from all configured AI platforms:

```bash
curl -X POST http://localhost:3000/api/orchestration/execute-all \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What are the key benefits of microservices architecture?",
    "systemPrompt": "You are a software architect. Provide a concise, technical answer.",
    "maxTokens": 2048
  }'
```

### Run Workflow Template

Execute a pre-built workflow pattern:

```bash
# Multi-Agent Research
curl -X POST http://localhost:3000/api/orchestration/workflow/research \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What are the latest developments in quantum computing?"
  }'

# Parallel Code Review
curl -X POST http://localhost:3000/api/orchestration/workflow/code_review \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Review this function for bugs and security issues:\n\nfunction authenticate(user, pass) {\n  return db.query(\"SELECT * FROM users WHERE username=\" + user + \" AND password=\" + pass);\n}"
  }'
```

### Execute Multiple Tasks in Parallel

```bash
curl -X POST http://localhost:3000/api/orchestration/parallel \
  -H "Content-Type: application/json" \
  -d '{
    "tasks": [
      {"prompt": "Write a haiku about programming"},
      {"prompt": "Explain recursion in one sentence"},
      {"prompt": "Name 3 design patterns for JavaScript"}
    ]
  }'
```

### Smart Routing by Capability

```bash
# Route to an agent with code capabilities
curl -X POST http://localhost:3000/api/orchestration/smart-execute \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write a Python function to find prime numbers",
    "capabilities": ["code"]
  }'

# Route to an agent with vision capabilities
curl -X POST http://localhost:3000/api/orchestration/smart-execute \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Describe this image",
    "capabilities": ["vision"]
  }'
```

## Workflow Templates

### RESEARCH
Multiple agents research the same topic; results are merged.

### CODE_REVIEW
Multiple agents review code for different aspects (bugs, security, performance).

### CONTENT_GENERATION
Generate multiple content variations from different AI perspectives.

### TASK_DECOMPOSITION
Break down complex tasks into smaller, actionable subtasks.

### CONSENSUS
Multiple agents analyze and vote on the best solution.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Farm Manager                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Workflow   │  │   Smart     │  │   Status    │         │
│  │  Templates  │  │  Routing    │  │  Monitoring │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                  Agent Orchestrator                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Task     │  │  Load    │  │ Result   │  │ Retry    │    │
│  │ Queue    │  │ Balancer │  │ Aggreg.  │  │ Logic    │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      Agent Pool                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Claude   │  │  GPT-4   │  │ Gemini   │  │  Groq    │    │
│  │ Agent    │  │  Agent   │  │ Agent    │  │  Agent   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │Together  │  │Perplexity│  │Hugging   │  │Replicate │    │
│  │ Agent    │  │  Agent   │  │Face Agent│  │  Agent   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## N8N Integration

The system includes an N8N workflow (`ai-orchestration-farm.json`) that provides:

- **Webhook endpoints** for external task submission
- **Scheduled monitoring** every 10 minutes
- **Alert handling** for farm issues
- **Supabase logging** for metrics persistence

Import the workflow:
1. Open N8N
2. Import from file: `n8n-workflows/ai-orchestration-farm.json`
3. Configure credentials (Supabase, etc.)
4. Activate the workflow

## Database Schema

Apply the Supabase migration:

```bash
# Connect to Supabase
supabase db push supabase/orchestration-farm-schema.sql
```

Tables created:
- `ai_platforms` - Platform registry
- `agent_instances` - Active agent tracking
- `orchestration_tasks` - Task queue and history
- `agent_farm_metrics` - Time-series metrics
- `workflow_executions` - Workflow run history

Views:
- `farm_status_summary` - Current status at a glance
- `platform_performance` - Per-platform metrics
- `hourly_metrics` - Aggregated hourly stats

## Adding New Platforms

To add a new AI platform:

1. **Update Platform Registry**

Edit `server/orchestration/platforms-registry.js`:

```javascript
new_platform: {
  id: 'new_platform',
  name: 'New Platform',
  description: 'Description here',
  tier: PLATFORM_TIER.FREE_TRIAL,
  trialCredits: 'Free credits info',
  signupUrl: 'https://signup.url',
  apiBaseUrl: 'https://api.url',
  authType: 'api_key',
  envVarName: 'NEW_PLATFORM_API_KEY',
  models: ['model-1', 'model-2'],
  capabilities: ['chat', 'code'],
  rateLimit: { requests: 60, window: '1m' },
  priority: 11,
  setupInstructions: ['Step 1', 'Step 2']
}
```

2. **Add Execution Handler**

In `server/orchestration/agent-orchestrator.js`, add a case in `executeTask()`:

```javascript
case 'new_platform':
  result = await this.executeNewPlatformTask(task);
  break;
```

3. **Add API Key to Environment**

```env
NEW_PLATFORM_API_KEY=your_key_here
```

## Load Balancing Strategies

Configure in orchestrator options:

```javascript
const orchestrator = getOrchestrator({
  loadBalanceStrategy: 'round-robin' // or 'least-busy' or 'priority'
});
```

- **round-robin**: Cycles through agents sequentially
- **least-busy**: Routes to agent with fewest completed tasks
- **priority**: Routes based on platform priority (1 = highest)

## Metrics & Monitoring

Get real-time metrics:

```bash
curl http://localhost:3000/api/orchestration/metrics
```

Response:
```json
{
  "success": true,
  "totalTasksCompleted": 150,
  "totalTasksFailed": 5,
  "totalTokensUsed": 50000,
  "avgResponseTime": 2500,
  "byPlatform": [
    {"platform": "Claude", "tasksCompleted": 50, "avgResponseTime": 2000},
    {"platform": "GPT-4", "tasksCompleted": 45, "avgResponseTime": 2800}
  ]
}
```

## Events

The orchestrator emits events you can listen to:

```javascript
const orchestrator = getOrchestrator();

orchestrator.on('task-completed', (data) => {
  console.log('Task completed:', data.task.id);
});

orchestrator.on('task-failed', (data) => {
  console.log('Task failed:', data.error);
});

orchestrator.on('parallel-execution-complete', (data) => {
  console.log(`All ${data.totalAgents} agents finished`);
});
```

## Best Practices

1. **Start with free tiers** - Add platforms gradually as needed
2. **Use workflows** - Pre-built patterns handle aggregation
3. **Monitor metrics** - Watch for rate limiting or errors
4. **Set appropriate timeouts** - Different platforms have different speeds
5. **Use smart routing** - Match tasks to platform capabilities

## Troubleshooting

### Agent in error state
```bash
# Check agent status
curl http://localhost:3000/api/orchestration/status

# Restart specific agent
curl -X POST http://localhost:3000/api/orchestration/add-agent/anthropic_claude
```

### Rate limiting
- The system respects platform rate limits
- Tasks are automatically retried with backoff
- Consider adding more platform diversity

### Missing API keys
```bash
# Get setup guide for unconfigured platforms
curl http://localhost:3000/api/orchestration/setup-guide
```
