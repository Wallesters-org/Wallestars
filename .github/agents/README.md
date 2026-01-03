# Wallestars Custom Agents

This directory contains custom GitHub Copilot agents configured for the Wallestars project.

## Available Agents

### Task Orchestrator & Analyzer Agent
**File**: `my-agent.agent.md`

A comprehensive agent designed to analyze content, break down complex problems into manageable tasks, and create orchestrated workflows with proper synchronization.

#### Key Capabilities
- 📊 Content analysis and validation (Claude chats, documents, etc.)
- 📋 Global execution plan generation
- 🔨 Task decomposition into individual files
- 🔗 Chain-based task synchronization
- 🎯 Orchestration and monitoring
- 📈 Visual schema generation

#### When to Use
- Breaking down large projects into tasks
- Analyzing Claude chat conversations for action items
- Creating structured execution plans
- Generating distributed task files for LLM processing
- Setting up synchronized workflows

#### Quick Start
```markdown
@task-orchestrator analyze this content and create task breakdown:
[Your content here]
```

See [examples/usage-guide.md](examples/usage-guide.md) for detailed usage instructions.

## Directory Structure

```
.github/agents/
├── my-agent.agent.md              # Main agent configuration
├── README.md                      # This file
├── examples/                      # Example files
│   ├── example-task-001.md       # Sample task file
│   ├── visual-workflow-example.md # Visual schemas demo
│   └── usage-guide.md            # How to use the agent
└── templates/                     # Reusable templates
    ├── task-template.md          # Template for task files
    ├── task-chain-status.json    # Status tracking template
    └── early-orchestrator-template.md # Orchestrator template
```

## Examples

### Example 1: Task File
See [examples/example-task-001.md](examples/example-task-001.md) for a complete example of a generated task file with all sections filled in.

### Example 2: Visual Workflows
See [examples/visual-workflow-example.md](examples/visual-workflow-example.md) for examples of:
- Task chain flowcharts
- Dependency graphs
- Timeline diagrams
- Status dashboards

### Example 3: Usage Guide
See [examples/usage-guide.md](examples/usage-guide.md) for comprehensive instructions on using the agent.

## Templates

### Task Template
Use [templates/task-template.md](templates/task-template.md) as a starting point for creating new task files.

### Status Tracking
Use [templates/task-chain-status.json](templates/task-chain-status.json) to track task progress and dependencies.

### Orchestrator Template
Use [templates/early-orchestrator-template.md](templates/early-orchestrator-template.md) for orchestration setup.

## Output Structure

When the agent processes content, it generates this structure:

```
output/
├── 0-analysis/           # Analysis results
├── 1-planning/           # Execution plans
├── 2-tasks/              # Individual task files
├── 3-orchestration/      # Management configs
├── 4-schemas/            # Visual diagrams
└── shared-context/       # Shared resources
```

## Integration with Wallestars

These agents integrate with:
- **Wallestars Control Center**: Main application
- **MCP Protocol**: Model Context Protocol support
- **GitHub Copilot**: Agent invocation
- **Version Control**: Git tracking of all task files

## Agent Configuration

The agent is configured with:
- **Name**: Task Orchestrator & Analyzer
- **Description**: Advanced agent for analyzing content and creating structured task breakdowns
- **Capabilities**: Content analysis, task generation, orchestration, visualization

## Best Practices

1. **Clear Input**: Provide complete, clear input for best results
2. **Appropriate Granularity**: Choose the right level of task breakdown
3. **Review Generated Tasks**: Always review the first few tasks
4. **Update Status Promptly**: Keep task status current
5. **Use Templates**: Leverage provided templates for consistency
6. **Document Deviations**: Note any changes from the plan

## Workflow Process

1. **Input Analysis** → Analyze and validate content
2. **Planning** → Create global execution plan
3. **Task Generation** → Generate individual task files
4. **Orchestration Setup** → Configure monitoring and sync
5. **Execution** → Tasks execute in coordinated sequence
6. **Validation** → Orchestrators validate completion

## Features

### RAG Integration
Tasks include context from knowledge bases and documentation.

### Multi-Platform Support
Task files work across Claude, ChatGPT, Gemini, and other LLM platforms.

### Visual Schemas
Automatic generation of flowcharts, dependency graphs, and timelines using Mermaid and ASCII art.

### Status Tracking
Real-time progress monitoring with automated status updates.

### Quality Gates
Built-in validation checkpoints ensure quality at each stage.

## Usage Scenarios

### Scenario 1: Feature Development
```
Input: Feature specification
↓
Agent generates 15-20 tasks covering analysis, design, implementation, testing, and deployment
↓
Tasks execute in sequence with proper coordination
```

### Scenario 2: Claude Chat Analysis
```
Input: Claude chat conversation
↓
Agent extracts goals and action items
↓
Creates structured task breakdown
↓
Generates ready-to-execute task files
```

### Scenario 3: Project Planning
```
Input: Project description
↓
Agent creates comprehensive plan with phases
↓
Breaks down into manageable tasks
↓
Sets up orchestration for execution
```

## Getting Help

- Review the [usage guide](examples/usage-guide.md)
- Check the [example files](examples/)
- Consult the [main agent documentation](my-agent.agent.md)
- Review the [templates](templates/)

## Contributing

When creating new tasks or updating the agent:
1. Follow the established template structure
2. Ensure clear, actionable instructions
3. Include proper validation steps
4. Document dependencies accurately
5. Test with real scenarios

## Version History

- **v1.0.0** (2026-01-03): Initial release
  - Task Orchestrator & Analyzer agent
  - Example files and templates
  - Usage documentation

## License

Part of the Wallestars project - MIT License

## Support

For issues or questions about these agents:
1. Check the examples and documentation
2. Review existing task files
3. Consult the usage guide
4. Reach out to the Wallestars team

---

**Quick Links**:
- [Main Agent Config](my-agent.agent.md)
- [Usage Guide](examples/usage-guide.md)
- [Example Task](examples/example-task-001.md)
- [Visual Workflows](examples/visual-workflow-example.md)
- [Task Template](templates/task-template.md)
