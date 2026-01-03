# Visual Workflow Schema Example

This document demonstrates the visual schemas that the Task Orchestrator & Analyzer agent generates.

## Task Chain Flowchart

```mermaid
graph TD
    Start([Input: Claude Chat/Document]) --> Analysis[Phase 1: Input Analysis]
    Analysis --> Validate{Content<br/>Complete?}
    Validate -->|No| CreateGoals[Generate Missing Goals]
    Validate -->|Yes| Planning[Phase 2: Planning & Structure]
    CreateGoals --> Planning
    
    Planning --> TaskGen[Phase 3: Task Generation]
    TaskGen --> T1[Task 1: Requirements]
    TaskGen --> T2[Task 2: Architecture]
    TaskGen --> T3[Task 3: Technology]
    TaskGen --> T4[Task 4: Implementation 1]
    TaskGen --> T5[Task 5: Implementation 2]
    TaskGen --> T6[Task 6: Testing]
    TaskGen --> T7[Task 7: Documentation]
    
    T1 --> EarlyOrch[Early Orchestrator<br/>Validation]
    T2 --> EarlyOrch
    T3 --> EarlyOrch
    
    EarlyOrch --> Exec[Phase 4: Execution]
    
    Exec --> T4
    T4 --> T5
    T5 --> T6
    T6 --> T7
    
    T7 --> LateOrch[Late Orchestrator<br/>Final Review]
    LateOrch --> Complete([Completion Report])
```

## Task Dependency Graph

```mermaid
graph LR
    T1[Task 1<br/>Requirements] --> T2[Task 2<br/>Architecture]
    T1 --> T3[Task 3<br/>Tech Selection]
    T2 --> T4[Task 4<br/>Design]
    T3 --> T4
    T4 --> T5[Task 5<br/>Implementation A]
    T4 --> T6[Task 6<br/>Implementation B]
    T5 --> T7[Task 7<br/>Integration]
    T6 --> T7
    T7 --> T8[Task 8<br/>Testing]
    T8 --> T9[Task 9<br/>Deployment]
    T9 --> T10[Task 10<br/>Documentation]
```

## Task Status Timeline

```mermaid
gantt
    title Task Execution Timeline
    dateFormat HH:mm
    section Phase 1
    Task 1 Requirements    :done, t1, 10:00, 2h
    Task 2 Architecture    :active, t2, after t1, 3h
    Task 3 Tech Selection  :t3, after t1, 2h
    section Phase 2
    Task 4 Design          :t4, after t2, 4h
    Task 5 Implementation A:t5, after t4, 6h
    Task 6 Implementation B:t6, after t4, 6h
    section Phase 3
    Task 7 Integration     :t7, after t5, 3h
    Task 8 Testing         :t8, after t7, 4h
    Task 9 Deployment      :t9, after t8, 2h
    Task 10 Documentation  :t10, after t9, 3h
```

## Component Relationship Diagram

```mermaid
graph TB
    subgraph "Orchestration Layer"
        EO[Early Orchestrator]
        LO[Late Orchestrator]
    end
    
    subgraph "Analysis Phase"
        IA[Input Analyzer]
        CV[Content Validator]
        ES[Extraction Service]
    end
    
    subgraph "Planning Phase"
        GP[Global Planner]
        TB[Task Breakdown]
        DM[Dependency Manager]
    end
    
    subgraph "Execution Phase"
        TG[Task Generator]
        TE[Task Executor]
        SM[State Manager]
    end
    
    subgraph "Storage"
        TS[Task Store]
        CS[Context Store]
        OS[Output Store]
    end
    
    EO --> IA
    IA --> CV
    CV --> ES
    ES --> GP
    GP --> TB
    TB --> DM
    DM --> TG
    TG --> TE
    TE --> SM
    SM --> LO
    
    TE --> TS
    TE --> CS
    TE --> OS
```

## Task Chain Sequence

```mermaid
sequenceDiagram
    participant User
    participant Agent as Task Orchestrator
    participant T1 as Task 1
    participant T2 as Task 2
    participant T3 as Task 3
    participant Orch as Orchestrator
    
    User->>Agent: Submit Claude chat link
    Agent->>Agent: Analyze content
    Agent->>Agent: Create execution plan
    Agent->>T1: Generate Task 1
    Agent->>T2: Generate Task 2
    Agent->>T3: Generate Task 3
    
    T1->>T1: Execute (Requirements)
    T1->>Orch: Update status: COMPLETED
    Orch->>T2: Signal: Ready to start
    
    T2->>T2: Execute (Architecture)
    T2->>Orch: Update status: COMPLETED
    Orch->>T3: Signal: Ready to start
    
    T3->>T3: Execute (Implementation)
    T3->>Orch: Update status: COMPLETED
    Orch->>User: All tasks completed
```

## Task State Machine

```mermaid
stateDiagram-v2
    [*] --> WAITING: Task Created
    WAITING --> READY: Dependencies Met
    READY --> IN_PROGRESS: Execution Started
    IN_PROGRESS --> BLOCKED: Issue Encountered
    IN_PROGRESS --> REVIEW: Work Completed
    BLOCKED --> READY: Issue Resolved
    REVIEW --> COMPLETED: Validation Passed
    REVIEW --> IN_PROGRESS: Needs Revision
    COMPLETED --> [*]
```

## Folder Structure Visualization

```
project-output/
│
├── 0-analysis/                    # Phase 1: Input Analysis
│   ├── content-summary.md         # ✓ What was provided
│   ├── objectives.md              # ✓ Identified goals
│   ├── initial-assessment.md      # ✓ First analysis
│   └── gaps-identified.md         # ✓ Missing information
│
├── 1-planning/                    # Phase 2: Planning
│   ├── global-plan.md             # ✓ Overall strategy
│   ├── task-breakdown.md          # ✓ Task decomposition
│   ├── dependencies-graph.md      # ✓ Task relationships
│   ├── resource-allocation.md     # ✓ Resource planning
│   └── risk-assessment.md         # ✓ Potential risks
│
├── 2-tasks/                       # Phase 3: Task Files
│   ├── task-001-requirements.md   # [COMPLETED]
│   ├── task-002-architecture.md   # [IN_PROGRESS]
│   ├── task-003-tech-selection.md # [READY]
│   ├── task-004-design.md         # [WAITING]
│   ├── task-005-implement-a.md    # [WAITING]
│   ├── task-006-implement-b.md    # [WAITING]
│   ├── task-007-integration.md    # [WAITING]
│   ├── task-008-testing.md        # [WAITING]
│   ├── task-009-deployment.md     # [WAITING]
│   └── task-010-documentation.md  # [WAITING]
│
├── 3-orchestration/               # Phase 4: Management
│   ├── early-orchestrator.md      # ✓ Initial validation
│   ├── monitoring-config.json     # ✓ Progress tracking
│   ├── sync-protocol.md           # ✓ Synchronization rules
│   ├── task-chain-status.json     # [LIVE] Status tracking
│   └── late-orchestrator.md       # ○ Final validation
│
├── 4-schemas/                     # Phase 5: Visualizations
│   ├── visual-workflow.md         # ✓ This file
│   ├── task-chain-diagram.md      # ✓ Sequence view
│   ├── component-relationships.md # ✓ Architecture view
│   └── execution-timeline.md      # ✓ Gantt chart
│
├── 5-outputs/                     # Phase 6: Results
│   ├── intermediate/              # Work in progress
│   ├── final/                     # Completed deliverables
│   └── artifacts/                 # Supporting files
│
└── shared-context/                # Shared Resources
    ├── project-overview.md        # ✓ High-level context
    ├── terminology.md             # ✓ Definitions
    ├── constraints.md             # ✓ Limitations
    └── references.md              # ✓ External links
```

## Task Progress Dashboard (ASCII)

```
╔════════════════════════════════════════════════════════════════╗
║                  TASK CHAIN EXECUTION STATUS                   ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  Phase 1: Analysis & Planning                     [████████] 100%  ║
║    ├─ Task 1: Requirements Analysis               [COMPLETED] ║
║    ├─ Task 2: Architecture Design                 [COMPLETED] ║
║    └─ Task 3: Technology Selection                [COMPLETED] ║
║                                                                ║
║  Phase 2: Implementation                          [████░░░░]  50%  ║
║    ├─ Task 4: Core Implementation A               [COMPLETED] ║
║    ├─ Task 5: Core Implementation B               [PROGRESS]  ║
║    └─ Task 6: Feature Implementation              [WAITING]   ║
║                                                                ║
║  Phase 3: Testing & Deployment                    [░░░░░░░░]   0%  ║
║    ├─ Task 7: Unit Testing                        [WAITING]   ║
║    ├─ Task 8: Integration Testing                 [WAITING]   ║
║    └─ Task 9: Deployment                          [WAITING]   ║
║                                                                ║
║  Phase 4: Finalization                            [░░░░░░░░]   0%  ║
║    └─ Task 10: Documentation                      [WAITING]   ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║  Overall Progress: ████████░░░░░░░░ 45% (5/10 tasks complete) ║
║  Estimated Completion: 2026-01-05 15:00                        ║
║  Time Elapsed: 6.5 hours | Remaining: 8.0 hours                ║
╚════════════════════════════════════════════════════════════════╝
```

## Task Communication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    TASK COMMUNICATION FLOW                       │
└─────────────────────────────────────────────────────────────────┘

Input → [Analysis] → [Planning] → [Task Generation]
                                         ↓
                                   ┌─────────────┐
                                   │   Task 1    │
                                   │ (Generate   │
                                   │  Context)   │
                                   └──────┬──────┘
                                          │
                            ┌─────────────┼─────────────┐
                            ↓             ↓             ↓
                      ┌─────────┐   ┌─────────┐   ┌─────────┐
                      │ Task 2  │   │ Task 3  │   │ Task 4  │
                      │(Depends │   │(Depends │   │(Depends │
                      │  on T1) │   │  on T1) │   │  on T1) │
                      └────┬────┘   └────┬────┘   └────┬────┘
                           │             │             │
                           └─────────┬───┴─────────────┘
                                     ↓
                               ┌─────────┐
                               │ Task 5  │
                               │(Depends │
                               │on T2-T4)│
                               └────┬────┘
                                    ↓
                            [Orchestrator Review]
                                    ↓
                              [Completion]
```

## Legend

- **✓** = Completed
- **○** = Not Started
- **[COMPLETED]** = Task finished and validated
- **[IN_PROGRESS]** = Task currently being executed
- **[READY]** = Task ready to start (dependencies met)
- **[WAITING]** = Task waiting for dependencies
- **[BLOCKED]** = Task blocked by issue
- **[REVIEW]** = Task awaiting validation

## Notes

These visualizations are automatically generated by the Task Orchestrator & Analyzer agent based on the analyzed content and created task structure. They provide:

1. **Understanding**: Clear view of the entire workflow
2. **Tracking**: Real-time progress monitoring
3. **Communication**: Easy to share with stakeholders
4. **Planning**: Identify bottlenecks and optimize
5. **Documentation**: Permanent record of the process

All diagrams use standard formats (Mermaid, ASCII) that can be rendered in markdown viewers, GitHub, and documentation systems.
