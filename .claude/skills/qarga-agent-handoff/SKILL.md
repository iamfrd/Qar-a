---
name: qarga-agent-handoff
description: A standard handoff contract that reduces context loss and ambiguous task transfer between Qarğa agents.
---

# Qarğa Agent Handoff Contract

When assigning a task to an agent, complete the following format:

```markdown
## Objective

## Current state and evidence
- Files read:
- Existing endpoint/test:

## Scope
- May change:
- Must not change:

## Invariants
- Server truth:
- Security:
- Design:

## Acceptance criteria

## Verification

## Blockers and human approval

## Durable project-memory signals
- Existing decision IDs that constrain this task:
- New material decision that may need recording:
- Concrete technical debt left behind:
- Experiment result or hypothesis that may need recording:
```

When returning work, the agent must use this format:

```markdown
## Changes made
## Files changed
## Checks run and actual results
## Remaining risks
## Durable project-memory signals
## Handoff for the next agent
```

The word “completed” is accepted only together with acceptance-criteria and verification results.

## Performance metadata

For Agent Team teammates, the handoff must explicitly list required project skills and instruct the teammate to load them before execution because teammate mode does not apply subagent frontmatter skill preloads.

Every delegated-task handoff must also include:

- `taskId`;
- preassigned `basePoints` (1–10);
- reviewer;
- acceptance criteria;
- verification/evidence requirements.

In the result handoff, the agent never scores itself. It provides only evidence, risks, completed acceptance criteria, and open problems.
