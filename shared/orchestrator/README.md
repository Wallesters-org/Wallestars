# Multi-Agent Orchestrator

OpenAI Agents Pattern implementation for coordinating AI agents in Wallestars.

## Overview

The Multi-Agent Orchestrator implements a sophisticated agent coordination system:
- **Router Agent**: Routes tasks to appropriate specialist agents
- **Memory Agent**: Manages context and conversation history
- **Supervisor Agent**: Monitors and coordinates execution
- **Specialist Agents**: Task-specific agents (Eva, Social Media, Analytics, Deployment)

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Multi-Agent Orchestrator                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐         │
│  │  Router  │───►│  Memory  │◄───│Supervisor│         │
│  │  Agent   │    │  Agent   │    │  Agent   │         │
│  └────┬─────┘    └──────────┘    └────┬─────┘         │
│       │                                 │                │
│       └─────────────┬───────────────────┘                │
│                     │                                     │
│  ┌──────────────────┴──────────────────────┐            │
│  │      Specialist Agents                   │            │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐           │            │
│  │  │Eva │ │Social│Analytics│Deploy│           │            │
│  │  └────┘ └────┘ └────┘ └────┘           │            │
│  └──────────────────────────────────────────┘            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Installation

```bash
# No additional dependencies required
# Uses Python standard library

# Make executable
chmod +x shared/orchestrator/multi-agent-orchestrator.py
```

## Usage

### Basic Example

```python
from shared.orchestrator.multi_agent_orchestrator import MultiAgentOrchestrator

# Initialize orchestrator
orchestrator = MultiAgentOrchestrator()

# Execute a task
task = {
    "description": "Post message to Instagram",
    "requirements": {
        "platform": "instagram",
        "type": "post",
        "content": "Hello World!"
    }
}

result = orchestrator.execute_task(task)
print(result)
```

### Advanced Usage

```python
# Custom routing rules
orchestrator.router.add_routing_rule(
    name="custom_rule",
    keywords=["custom", "special"],
    agent=AgentType.EVA
)

# Access memory
orchestrator.memory.store_context("user_preference", {"theme": "dark"})
preference = orchestrator.memory.retrieve_context("user_preference")

# Check system status
status = orchestrator.get_system_status()
print(json.dumps(status, indent=2))
```

## Agents

### Router Agent

Routes incoming tasks to appropriate specialist agents based on keywords and patterns.

**Features:**
- Keyword-based routing
- Confidence scoring
- Dynamic rule addition
- Fallback to default agent

**Routing Rules:**
```python
{
    "social_media": ["instagram", "telegram", "facebook", "post"],
    "analytics": ["analyze", "report", "metrics", "statistics"],
    "deployment": ["deploy", "update", "release", "vps"],
    "eva": ["decide", "process", "context", "ai"]
}
```

### Memory Agent

Manages context storage and conversation history across agent interactions.

**Features:**
- Key-value context storage
- Conversation history
- Timestamp tracking
- Automatic history limiting (100 entries)
- Context retrieval

**Usage:**
```python
# Store context
memory.store_context("session_id", {"user": "alice", "started": "2024-01-01"})

# Retrieve context
session = memory.retrieve_context("session_id")

# Add to history
memory.add_to_history({
    "agent": "eva",
    "action": "processed_message",
    "result": "success"
})

# Get recent history
recent = memory.get_recent_history(count=10)
```

### Supervisor Agent

Monitors task execution and coordinates between agents.

**Features:**
- Task registration and tracking
- Status monitoring
- Success/failure tracking
- Task summary statistics

**Usage:**
```python
# Register task
supervisor.register_task(
    task_id="task-123",
    task={"description": "Deploy to VPS"},
    assigned_agent=AgentType.DEPLOYMENT
)

# Update status
supervisor.update_task_status(
    task_id="task-123",
    status=AgentStatus.COMPLETED,
    result={"deployed": True}
)

# Get summary
summary = supervisor.get_task_summary()
# {
#     "active": 2,
#     "completed": 45,
#     "failed": 3,
#     "total": 50
# }
```

## Integration with Eva Core

The orchestrator integrates seamlessly with Eva Core:

```python
from eva_core import EvaCore
from shared.orchestrator.multi_agent_orchestrator import MultiAgentOrchestrator

# Initialize both systems
eva = EvaCore()
orchestrator = MultiAgentOrchestrator()

# Route Eva decisions through orchestrator
async def process_with_orchestrator(message):
    # Eva analyzes
    context = eva.process_context(message)
    decision = eva.make_decision(context)
    
    # Orchestrator executes
    task = {
        "description": decision.action,
        "requirements": decision.requirements
    }
    
    result = orchestrator.execute_task(task)
    return result
```

## CLI Interface

```bash
# Run demo
python shared/orchestrator/multi-agent-orchestrator.py

# This will:
# 1. Initialize orchestrator
# 2. Execute sample tasks
# 3. Display results and status
```

## Task Flow

```
1. Task Received
   ↓
2. Router Analyzes Task
   ├─ Keywords extracted
   ├─ Agents scored
   └─ Best agent selected
   ↓
3. Memory Stores Context
   ├─ Task details
   └─ Timestamp
   ↓
4. Supervisor Registers Task
   ├─ Task ID assigned
   ├─ Agent assigned
   └─ Status: PROCESSING
   ↓
5. Specialist Agent Executes
   ├─ Performs task
   └─ Returns result
   ↓
6. Supervisor Updates Status
   ├─ Status: COMPLETED/FAILED
   └─ Result stored
   ↓
7. Memory Adds to History
   ├─ Full interaction
   └─ Timestamp
   ↓
8. Result Returned
```

## API Reference

### MultiAgentOrchestrator

**Methods:**
- `execute_task(task: Dict) -> Dict`: Execute a task
- `get_system_status() -> Dict`: Get system status

### RouterAgent

**Methods:**
- `route_task(task: Dict) -> AgentType`: Route task to agent
- `add_routing_rule(name: str, keywords: List[str], agent: AgentType)`: Add routing rule

### MemoryAgent

**Methods:**
- `store_context(key: str, context: Any)`: Store context
- `retrieve_context(key: str) -> Optional[Any]`: Retrieve context
- `add_to_history(interaction: Dict)`: Add to history
- `get_recent_history(count: int) -> List[Dict]`: Get recent history
- `clear_memory()`: Clear all memory

### SupervisorAgent

**Methods:**
- `register_task(task_id: str, task: Dict, assigned_agent: AgentType)`: Register task
- `update_task_status(task_id: str, status: AgentStatus, result: Optional[Any])`: Update status
- `get_active_tasks() -> Dict`: Get active tasks
- `get_task_summary() -> Dict`: Get task summary

## Configuration

No configuration files required. The orchestrator is self-contained.

Optional environment variables:
```bash
# Logging level
export LOG_LEVEL=DEBUG
```

## Best Practices

1. **Task Descriptions**: Use clear, keyword-rich descriptions for better routing
2. **Memory Management**: Clear memory periodically for long-running processes
3. **Error Handling**: Always check task status before assuming success
4. **Agent Extensions**: Extend BaseAgent for custom specialist agents

## Example: Custom Specialist Agent

```python
from shared.orchestrator.multi_agent_orchestrator import BaseAgent, AgentType

class CustomAgent(BaseAgent):
    def __init__(self):
        super().__init__("custom-001", AgentType.EVA)
    
    def execute(self, task: Dict) -> Dict:
        # Your custom logic
        return {"status": "success", "result": "Done!"}

# Register with orchestrator
orchestrator.specialist_agents["custom"] = CustomAgent()
```

## Performance

- **Router**: < 1ms for task routing
- **Memory**: O(1) context storage/retrieval
- **Supervisor**: O(1) task tracking
- **History**: Limited to 100 entries for performance

## Monitoring

```python
# Get system status
status = orchestrator.get_system_status()

# Monitor agents
for agent_name, agent_info in status.items():
    print(f"{agent_name}: {agent_info['status']}")

# Monitor tasks
summary = orchestrator.supervisor.get_task_summary()
print(f"Active tasks: {summary['active']}")
print(f"Completed: {summary['completed']}")
print(f"Failed: {summary['failed']}")
```

## Related

- [Eva Core](../../eva-core/README.md)
- [n8n Integration](../../docs/n8n-integration-guide.md)
- [Full Architecture](../../docs/FULL-ARCHITECTURE.md)
