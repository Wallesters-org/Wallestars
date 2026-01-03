# Task [NUMBER] of [TOTAL]: [TASK_NAME]

## Position in Chain
- **Task Number**: [NUMBER]
- **Total Tasks**: [TOTAL]
- **Dependencies**: [List of task IDs this task depends on, or "None" if first task]
- **Next Tasks**: [List of task IDs that depend on this task, or "None" if last task]

## Objective
[Clear, concise description of what this task accomplishes. Should be specific and measurable. Example: "Design the database schema for user management, including tables for users, roles, and permissions."]

## Context & Background
[Provide context about why this task exists and how it fits into the larger project. Include relevant background information that helps understand the purpose and importance of this task.]

### Source Information
- **Input**: [What input materials are available - documents, previous task outputs, etc.]
- **Stakeholders**: [Who cares about this task's outcome]
- **Timeline**: [When this needs to be done]
- **Related Systems**: [What systems/components this interacts with]

## Instructions

### Step 1: [First Major Step]
[Detailed instructions for the first step]
1. [Specific action]
2. [Specific action]
3. [Specific action]

### Step 2: [Second Major Step]
[Detailed instructions for the second step]
1. [Specific action]
2. [Specific action]
3. [Specific action]

### Step 3: [Third Major Step]
[Continue with additional steps as needed]

### Step N: [Final Step]
[Last set of instructions]

## Prerequisites
[What must be completed or available before this task can start]
- [Prerequisite 1]
- [Prerequisite 2]
- [Prerequisite 3]

## Expected Outputs

1. **[output-file-1.ext]**: [Description of this output]
   - Format: [markdown/json/code/etc.]
   - Contents: [What should be in this file]
   - Location: [Where to save it]

2. **[output-file-2.ext]**: [Description of this output]
   - Format: [Format type]
   - Contents: [What should be in this file]
   - Location: [Where to save it]

3. **[Additional outputs as needed]**

## Success Criteria

This task is considered complete when:
- ✅ [Specific, measurable criterion 1]
- ✅ [Specific, measurable criterion 2]
- ✅ [Specific, measurable criterion 3]
- ✅ [Specific, measurable criterion 4]
- ✅ Output files are generated and validated
- ✅ Task status updated to COMPLETED in task-chain-status.json

## Validation Steps

Before marking this task complete:
1. [Validation step 1]
2. [Validation step 2]
3. [Validation step 3]
4. [Final validation step]

## Integration Points

### Inputs From
- **[Source Task/System]**: [What information comes from here]
- **[Source Task/System]**: [What information comes from here]

### Outputs To
- **[Destination Task]**: [What information goes here and why]
- **[Destination Task]**: [What information goes here and why]

### Shared Resources
- `[shared-file-1]`: [Description of shared resource]
- `[shared-file-2]`: [Description of shared resource]
- `task-chain-status.json`: Task completion tracking

## Notes for Executor

- **Time Estimate**: [Estimated hours/days]
- **Complexity**: [Low/Medium/High]
- **Skills Required**: [List of skills needed]
- **Tools Recommended**: [Tools that would help]
- **Potential Challenges**: 
  - [Challenge 1 and how to address it]
  - [Challenge 2 and how to address it]
  - [Challenge 3 and how to address it]

## Status Tracking

Current Status: `WAITING`

Status History:
- [YYYY-MM-DD HH:MM] Task created - Status: WAITING
- [YYYY-MM-DD HH:MM] Prerequisites met - Status: READY
- [YYYY-MM-DD HH:MM] Work started - Status: IN_PROGRESS
- [YYYY-MM-DD HH:MM] Work completed - Status: REVIEW
- [YYYY-MM-DD HH:MM] Validation passed - Status: COMPLETED

## Communication Protocol

### If You Encounter Blocking Issues
1. Document the issue in `task-[NUMBER]-blockers.md`
2. Update status to BLOCKED in task-chain-status.json
3. Notify orchestrator via status file
4. Wait for resolution before proceeding

### If You Need Clarification
1. Document questions in this file under "Open Questions" section below
2. Continue with reasonable assumptions (clearly documented)
3. Flag for stakeholder review
4. Mark assumptions in outputs with [ASSUMPTION] tags

### If You Discover Scope Changes
1. Document the scope change in `task-[NUMBER]-scope-changes.md`
2. Assess impact on timeline and dependencies
3. Notify orchestrator
4. Wait for approval before proceeding with changed scope

## Open Questions
[Document any questions that arise during execution]
- [Question 1]
- [Question 2]

## Assumptions Made
[Document any assumptions you make during execution]
- [Assumption 1]
- [Assumption 2]

## Related Resources

- [Link to relevant documentation]
- [Link to related code/files]
- [Link to examples]
- [Link to templates]

## Examples

### Example Input
```
[Show what typical input looks like]
```

### Example Output
```
[Show what expected output should look like]
```

### Example Validation
```
[Show how to validate the output]
```

---

## Execution Notes
[Use this section to document notes during task execution]

### Progress Log
- [Timestamp]: [What was done]
- [Timestamp]: [What was done]

### Issues Encountered
- [Timestamp]: [Issue description and resolution]

### Decisions Made
- [Timestamp]: [Decision and rationale]

---

**Previous Task**: [Task ID and name, or "None" if first]
**Next Task**: [Task ID and name, or "None" if last]

**Orchestrator Note**: This task will be validated by the [Early/Late] Stage Orchestrator before downstream tasks can proceed.

---

## Task Completion Checklist

Before marking this task as COMPLETED, ensure:
- [ ] All steps in Instructions section completed
- [ ] All Expected Outputs generated
- [ ] All Success Criteria met
- [ ] All Validation Steps passed
- [ ] Status updated to COMPLETED in task-chain-status.json
- [ ] Outputs saved to correct locations
- [ ] Next task(s) notified of completion
- [ ] Documentation updated
- [ ] Lessons learned documented (if any)

---

## Metadata

```json
{
  "task_id": "task-[NUMBER]",
  "task_name": "[TASK_NAME]",
  "version": "1.0.0",
  "created_at": "[YYYY-MM-DDTHH:MM:SSZ]",
  "created_by": "task-orchestrator-agent",
  "estimated_hours": [NUMBER],
  "actual_hours": null,
  "priority": "[high/medium/low]",
  "tags": ["[tag1]", "[tag2]", "[tag3]"]
}
```
