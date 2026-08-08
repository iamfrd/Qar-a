---
description: Create a new Qarğa agent and add it to the registry and coordinator allowlist only after explicit project-owner approval
argument-hint: [approved agent name and purpose]
---

For `$ARGUMENTS`, first locate explicit project-owner approval in the current conversation. If no approval exists, stop and present a hiring proposal.

When approval exists:

1. Read `.claude/capability-registry.json`, `qarga-organizational-planning`, and `qarga-performance-governance`.
2. Research the closest AITMPL baseline agent or skill, then adapt it to current official Claude Code subagent guidance.
3. Create a Qarğa-specific `.claude/agents/<name>.md` using the real stack, business model, output-language requirement, human gates, and least-privilege tools; always include `qarga-performance-governance`.
4. Activate the agent in the registry and update the future-role entry.
5. Update the `Agent(...)` allowlist and delegation information in `qarga-coordinator.md`.
6. Create an initial `unrated` scorecard for the agent in `.claude/performance/scorecards.json`.
7. Update `docs/AGENT-REGISTRY.md` and any required workflow documentation.
8. Run `npm run validate:claude`.
9. Tell the project owner that the agent becomes available in a new session and explain which tasks should invoke it.

Do not copy a source template verbatim and do not grant external-account or MCP access without approval.
