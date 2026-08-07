---
name: qarga-planning
description: Use persistent plan files to manage multi-file, multi-agent, and high-risk work in Qarğa.
---

# Qarğa Planning With Files

Use this skill when work spans at least two modules, at least three files, more than one agent, or carries financial, legal, or security risk.

## Plan location

`docs/plans/YYYY-MM-DD-short-name.md`

## Required sections

1. **Objective** — user and business outcome.
2. **In scope / out of scope**.
3. **Evidence of current state** — files read, endpoints, and tests.
4. **Task table** — ID, owner agent, file ownership, dependency, and status.
5. **Acceptance criteria** — verifiable results.
6. **Risks** — data, authentication, payment, UX, migration, and rollback.
7. **Human approval** — decision points.
8. **Verification** — specific commands and browser scenarios.
9. **Decision log** — changed decisions and reasons.

Keep the plan as a living document. When a task finishes, update its status and actual test results. Never mark unexecuted work complete.

## Agent handoff format

Every handoff must be self-contained:

- the necessary short context about Qarğa;
- specific objective;
- files the agent may and may not change;
- existing API and invariants;
- acceptance criteria;
- required tests;
- escalation target when blocked.
