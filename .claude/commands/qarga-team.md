---
description: Select appropriate agents from the Qarğa capability registry and create a controlled Agent Team
argument-hint: [objective and scope]
---

Lead as `qarga-coordinator` for the `$ARGUMENTS` objective.

1. Read `CLAUDE.md`, `.claude/capability-registry.json`, related source/test/docs files, and the current Git state.
2. Select only the 3–5 active agents needed for the task. Do not rely on a static list or old prompt status.
3. Explain why parallel work provides real value and obtain project-owner approval before creating an Agent Team. Use a sequential subagent chain for same-file or dependent work.
4. For every teammate, include the required registry skill names in the spawn brief and require the teammate to load them; teammate mode does not preload the agent file's `skills` field.
5. Create a shared task list with owner, scope, file ownership, dependencies, acceptance criteria, verification, and escalation.
6. Never assign the same file to two agents in parallel.
7. Require human approval for financial, legal, authentication/permission, new-agent/plugin, real-data deletion, dependency, and production operations.
8. Wait for all results, never relay raw agent responses, and synthesize conflicts and decision points in Azerbaijani.
9. If the milestone is complete, run a short capability-gap team review.
