# Task Orchestrator & Analyzer Agent - Usage Guide

## Overview

This guide explains how to use the Task Orchestrator & Analyzer agent to break down complex problems into manageable, orchestrated task chains.

## When to Use This Agent

Use this agent when you need to:
- Break down a complex project into individual tasks
- Analyze Claude chat conversations for actionable items
- Create structured execution plans
- Generate task files for distributed processing
- Coordinate multi-step workflows
- Transform unstructured discussions into organized plans
- Set up synchronized task chains

## Basic Usage

### 1. Prepare Your Input

The agent accepts various input formats:
- **Claude chat links**: Share a conversation URL
- **Markdown documents**: Provide a document with requirements/notes
- **Text descriptions**: Paste a description of what needs to be done
- **Issue descriptions**: Copy from GitHub issues or project management tools

### 2. Invoke the Agent

```markdown
@task-orchestrator Please analyze the following and create a task breakdown:

[Paste your content here - could be a Claude chat link, document, or description]

Requirements:
- Break down into 10-15 tasks
- Include visual workflow diagram
- Set up orchestration for sequential execution
- Generate individual task files ready for LLM processing
```

### 3. Review Generated Structure

The agent will create a complete folder structure:
```
output/
├── 0-analysis/          # What was analyzed
├── 1-planning/          # How it will be executed
├── 2-tasks/             # Individual task files
├── 3-orchestration/     # Management configuration
└── 4-schemas/          # Visual diagrams
```

## Example Use Cases

### Use Case 1: Claude Chat Analysis

**Scenario**: You had a long conversation with Claude about building a new feature, and now need to execute the plan.

**Steps**:
1. Copy the Claude chat link
2. Invoke the agent with: "Analyze this chat and create executable tasks"
3. Agent analyzes the conversation
4. Agent extracts goals and decisions
5. Agent generates task breakdown
6. You receive ready-to-use task files

**Result**: 12 task files, each ready to be processed independently

### Use Case 2: Project Kickoff

**Scenario**: Starting a new project and need to organize the work.

**Steps**:
1. Write a brief project description
2. Include any constraints or requirements
3. Invoke the agent
4. Agent creates comprehensive project structure
5. Agent generates tasks with dependencies
6. You receive orchestrated workflow

**Result**: Complete project structure with phases and tasks

### Use Case 3: Breaking Down a Feature Request

**Scenario**: You have a feature request document that needs implementation planning.

**Steps**:
1. Provide the feature request document
2. Specify desired granularity (e.g., "15-20 tasks")
3. Invoke the agent
4. Agent analyzes technical requirements
5. Agent creates task chain with proper sequencing
6. You receive implementation roadmap

**Result**: Technical implementation plan with task files

## Understanding Task Files

Each generated task file contains:

```markdown
# Task [N] of [TOTAL]: [Task Name]

## Position in Chain
- Task Number: N
- Dependencies: [Previous tasks]
- Next Tasks: [Following tasks]

## Objective
[What this task accomplishes]

## Instructions
[Step-by-step what to do]

## Prerequisites
[What must be ready first]

## Expected Outputs
[What this task produces]

## Success Criteria
[How to validate completion]
```

## Working with Task Chains

### Sequential Execution

Tasks are designed to execute in sequence:
1. Task 1 completes → updates status
2. Task 2 detects Task 1 completion → starts
3. Task 2 completes → updates status
4. Task 3 detects Task 2 completion → starts
5. Continue until all tasks complete

### Parallel Execution

Some tasks can run in parallel:
```
Task 1 (Requirements)
   ├─→ Task 2 (Design A) ────┐
   └─→ Task 3 (Design B) ────┼─→ Task 4 (Integration)
```

The agent automatically identifies which tasks can run in parallel.

### Task Status Tracking

Each task updates a status file:
```json
{
  "task_id": "task-001",
  "status": "COMPLETED",
  "started_at": "2026-01-03T10:00:00Z",
  "completed_at": "2026-01-03T12:00:00Z",
  "outputs": ["requirements-analysis.md"]
}
```

## Advanced Features

### Custom Configuration

You can configure the agent's behavior:

```markdown
@task-orchestrator analyze with config:
- granularity: fine (more tasks, smaller scope each)
- sync_mode: strict (tasks must wait for previous completion)
- validation_level: comprehensive (thorough validation at each step)
- output_format: markdown (task files in markdown)
```

### RAG Context Integration

The agent can embed context from your codebase:

```markdown
@task-orchestrator analyze this chat and include context from:
- /ARCHITECTURE.md
- /src/core/
- Previous sprint retrospectives
```

Task files will include relevant context automatically.

### Visual Schema Customization

Request specific diagram types:

```markdown
@task-orchestrator create task breakdown with:
- Gantt chart for timeline
- Dependency graph
- Component interaction diagram
- ASCII progress dashboard
```

## Orchestration Modes

### Minimal Orchestration
- Tasks are independent
- No strict sequencing
- Manual progress tracking
- Good for: Small projects, experienced teams

### Standard Orchestration (Default)
- Tasks have dependencies
- Status tracking enabled
- Validation checkpoints
- Good for: Most projects

### Full Orchestration
- Strict sequencing enforced
- Automatic blocking/unblocking
- Comprehensive validation
- Progress monitoring
- Rollback capabilities
- Good for: Critical projects, large teams

## Working with Multiple LLM Platforms

Task files are designed to work across platforms:

**Claude**:
```
Copy task-001-requirements.md → Paste into Claude
Claude processes the task → Generates output
Copy output → Save to specified location
Mark task complete in status file
```

**ChatGPT**:
```
Copy task-002-architecture.md → Paste into ChatGPT
ChatGPT processes the task → Generates output
Save output → Update status
```

**Gemini**:
```
Copy task-003-implementation.md → Paste into Gemini
Process → Generate → Save → Update status
```

All platforms can participate in the same task chain!

## Best Practices

### 1. Clear Input
Provide clear, complete input. The better the input, the better the task breakdown.

### 2. Appropriate Granularity
- Too coarse: Tasks too large, hard to manage
- Too fine: Too many tasks, overhead increases
- Just right: Each task is 2-4 hours of work

### 3. Review Generated Tasks
Always review the first few generated tasks to ensure they match your expectations.

### 4. Update Status Promptly
Keep status files updated so subsequent tasks know when to start.

### 5. Document Deviations
If you need to deviate from a task plan, document it in the task file.

### 6. Use Orchestrator Checkpoints
Let the orchestrator validate before moving to next phase.

## Troubleshooting

### Problem: Tasks Too Large
**Solution**: Re-invoke agent with "granularity: fine"

### Problem: Missing Dependencies
**Solution**: Review task dependencies and add manual dependency notes

### Problem: Unclear Task Instructions
**Solution**: Add more context to the input or use RAG integration

### Problem: Tasks Out of Order
**Solution**: Check dependency graph, reorder if needed

### Problem: Can't Track Progress
**Solution**: Use the status files and monitoring dashboard

## Integration with Wallestars

The agent integrates with Wallestars Control Center:

1. **MCP Integration**: Can be called via MCP protocol
2. **Web UI**: Visual dashboard for task tracking
3. **File Storage**: Tasks stored in repository
4. **Version Control**: Git tracks all task files
5. **Collaboration**: Team members see task status

## Example Workflows

### Workflow 1: Feature Development
```
Input: Feature specification
↓
Agent Analysis
↓
Task Generation (15 tasks):
  - Requirements analysis
  - Architecture design
  - Technology selection
  - Implementation (6 tasks)
  - Testing (3 tasks)
  - Documentation
  - Deployment
↓
Sequential Execution
↓
Orchestrator Validation
↓
Completion Report
```

### Workflow 2: Bug Investigation
```
Input: Bug report + discussion
↓
Agent Analysis
↓
Task Generation (8 tasks):
  - Reproduce issue
  - Analyze logs
  - Identify root cause
  - Design fix
  - Implement fix
  - Test fix
  - Update documentation
  - Deploy fix
↓
Execution with status tracking
↓
Validation & closure
```

### Workflow 3: Documentation Project
```
Input: Documentation needs assessment
↓
Agent Analysis
↓
Task Generation (10 tasks):
  - Audit existing docs
  - Identify gaps
  - Create outline
  - Write sections (5 tasks)
  - Review & edit
  - Publish
↓
Parallel + Sequential execution
↓
Quality review
```

## Getting Help

If you need assistance:
1. Review the example files in `.github/agents/examples/`
2. Check the visual workflow schemas
3. Consult the main agent documentation
4. Reach out to the team for clarification

## Summary

The Task Orchestrator & Analyzer agent transforms complex, unstructured input into organized, executable task chains. By following this guide, you can:
- Break down any project into manageable tasks
- Create synchronized workflows
- Generate ready-to-use task files
- Track progress effectively
- Coordinate work across multiple platforms
- Ensure quality through orchestration

Start small, experiment with the agent, and gradually use more advanced features as you become comfortable with the workflow!
