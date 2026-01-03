---
name: wallestars-ai-orchestration
description: Multi-agent AI orchestration system for Wallestars. Use when coordinating specialized AI agents (code, data, devops, documentation specialists), managing conversation context with memory, or routing complex queries through supervisor-reviewed workflows.
---

# Wallestars AI Orchestration

Multi-agent AI system with 5 specialized agents: Router, Memory, Supervisor, and Specialist agents (Code, Data, DevOps, Documentation, General).

## Architecture
```
User Query → Router Agent → Memory Agent → Specialist Agent → Supervisor Agent → Final Response
```

## Core Agents

### Router Agent
Routes requests to appropriate specialist based on query analysis.

### Memory Agent  
Maintains long-term conversation context and retrieves relevant history.

### Supervisor Agent
Quality control and coordination between agents.

### Specialist Agents
- **Code Specialist**: Implementation, debugging, code review
- **Data Specialist**: SQL queries, data analysis, ETL workflows
- **DevOps Specialist**: Infrastructure, deployment, CI/CD, monitoring
- **Documentation Specialist**: Technical writing, API docs, guides
- **General Agent**: Fallback for other queries

## Commands

```bash
agent-run "Your query here"              # Single query
agent-run "query" --verbose              # Show routing decision
agent-chat                               # Interactive mode
agent-stats                              # Statistics
```

## Configuration
```bash
export ANTHROPIC_API_KEY="sk-ant-api03-..."
```

Memory storage: `~/.config/wallestars/agent-memory/`

## Best Practices
1. Be specific with queries
2. Use verbose mode for learning
3. Leverage memory for context
4. Check statistics regularly
