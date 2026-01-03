# Task Status Tracking Configuration

This file tracks the status of all tasks in the chain. It is automatically updated by tasks as they progress.

## Status Definitions

- **WAITING**: Task is waiting for dependencies to complete
- **READY**: All dependencies are met, task can start
- **IN_PROGRESS**: Task is currently being executed
- **REVIEW**: Task completed, awaiting validation
- **COMPLETED**: Task finished and validated
- **BLOCKED**: Task cannot proceed due to an issue
- **SKIPPED**: Task was skipped (marked optional and not needed)

## Task Chain Status

```json
{
  "project": {
    "name": "Project Name",
    "created_at": "2026-01-03T10:00:00Z",
    "total_tasks": 10,
    "completed_tasks": 0,
    "progress_percentage": 0
  },
  "tasks": [
    {
      "id": "task-001",
      "name": "Requirements Analysis",
      "status": "READY",
      "dependencies": [],
      "started_at": null,
      "completed_at": null,
      "assigned_to": null,
      "estimated_hours": 3,
      "actual_hours": 0,
      "outputs": [],
      "notes": ""
    },
    {
      "id": "task-002",
      "name": "Architecture Design",
      "status": "WAITING",
      "dependencies": ["task-001"],
      "started_at": null,
      "completed_at": null,
      "assigned_to": null,
      "estimated_hours": 4,
      "actual_hours": 0,
      "outputs": [],
      "notes": ""
    },
    {
      "id": "task-003",
      "name": "Technology Selection",
      "status": "WAITING",
      "dependencies": ["task-001"],
      "started_at": null,
      "completed_at": null,
      "assigned_to": null,
      "estimated_hours": 2,
      "actual_hours": 0,
      "outputs": [],
      "notes": ""
    },
    {
      "id": "task-004",
      "name": "Implementation Phase 1",
      "status": "WAITING",
      "dependencies": ["task-002", "task-003"],
      "started_at": null,
      "completed_at": null,
      "assigned_to": null,
      "estimated_hours": 6,
      "actual_hours": 0,
      "outputs": [],
      "notes": ""
    },
    {
      "id": "task-005",
      "name": "Implementation Phase 2",
      "status": "WAITING",
      "dependencies": ["task-004"],
      "started_at": null,
      "completed_at": null,
      "assigned_to": null,
      "estimated_hours": 6,
      "actual_hours": 0,
      "outputs": [],
      "notes": ""
    },
    {
      "id": "task-006",
      "name": "Integration",
      "status": "WAITING",
      "dependencies": ["task-005"],
      "started_at": null,
      "completed_at": null,
      "assigned_to": null,
      "estimated_hours": 4,
      "actual_hours": 0,
      "outputs": [],
      "notes": ""
    },
    {
      "id": "task-007",
      "name": "Unit Testing",
      "status": "WAITING",
      "dependencies": ["task-006"],
      "started_at": null,
      "completed_at": null,
      "assigned_to": null,
      "estimated_hours": 3,
      "actual_hours": 0,
      "outputs": [],
      "notes": ""
    },
    {
      "id": "task-008",
      "name": "Integration Testing",
      "status": "WAITING",
      "dependencies": ["task-007"],
      "started_at": null,
      "completed_at": null,
      "assigned_to": null,
      "estimated_hours": 4,
      "actual_hours": 0,
      "outputs": [],
      "notes": ""
    },
    {
      "id": "task-009",
      "name": "Deployment",
      "status": "WAITING",
      "dependencies": ["task-008"],
      "started_at": null,
      "completed_at": null,
      "assigned_to": null,
      "estimated_hours": 2,
      "actual_hours": 0,
      "outputs": [],
      "notes": ""
    },
    {
      "id": "task-010",
      "name": "Documentation",
      "status": "WAITING",
      "dependencies": ["task-009"],
      "started_at": null,
      "completed_at": null,
      "assigned_to": null,
      "estimated_hours": 3,
      "actual_hours": 0,
      "outputs": [],
      "notes": ""
    }
  ],
  "phases": [
    {
      "name": "Phase 1: Analysis & Planning",
      "tasks": ["task-001", "task-002", "task-003"],
      "status": "IN_PROGRESS",
      "progress": 0
    },
    {
      "name": "Phase 2: Implementation",
      "tasks": ["task-004", "task-005", "task-006"],
      "status": "WAITING",
      "progress": 0
    },
    {
      "name": "Phase 3: Testing & Deployment",
      "tasks": ["task-007", "task-008", "task-009"],
      "status": "WAITING",
      "progress": 0
    },
    {
      "name": "Phase 4: Finalization",
      "tasks": ["task-010"],
      "status": "WAITING",
      "progress": 0
    }
  ],
  "orchestration": {
    "early_orchestrator": {
      "status": "ACTIVE",
      "last_check": "2026-01-03T10:00:00Z",
      "validations_passed": 0,
      "validations_failed": 0
    },
    "late_orchestrator": {
      "status": "WAITING",
      "last_check": null,
      "validations_passed": 0,
      "validations_failed": 0
    }
  },
  "metadata": {
    "last_updated": "2026-01-03T10:00:00Z",
    "updated_by": "task-orchestrator-agent",
    "version": "1.0.0"
  }
}
```

## How to Update Status

### When Starting a Task
```json
{
  "id": "task-001",
  "status": "IN_PROGRESS",
  "started_at": "2026-01-03T10:30:00Z"
}
```

### When Completing a Task
```json
{
  "id": "task-001",
  "status": "COMPLETED",
  "completed_at": "2026-01-03T13:30:00Z",
  "actual_hours": 3,
  "outputs": ["requirements-analysis.md", "requirements-summary.json"]
}
```

### When Blocking a Task
```json
{
  "id": "task-004",
  "status": "BLOCKED",
  "notes": "Waiting for clarification on database schema from stakeholder"
}
```

## Automatic Status Updates

The orchestrator automatically:
1. Changes tasks from WAITING → READY when dependencies complete
2. Calculates overall progress percentage
3. Updates phase statuses
4. Triggers notifications when tasks are ready
5. Validates task completion before marking COMPLETED

## Progress Calculation

```
Progress = (Completed Tasks / Total Tasks) × 100
Phase Progress = (Completed Tasks in Phase / Total Tasks in Phase) × 100
```

## Dashboard View

Use this JSON with visualization tools to create dashboards showing:
- Task progress bars
- Dependency graphs
- Timeline views
- Resource allocation
- Bottleneck identification
