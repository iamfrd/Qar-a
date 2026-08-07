---
name: qarga-organizational-planning
description: Use to identify capability gaps in the Qarğa team, run post-milestone team reviews, and create a new agent after project-owner approval.
---

# Qarğa Organizational Planning

The primary source is `.claude/capability-registry.json`. After every major milestone, and whenever the same capability gap repeats across two separate tasks or handoffs, compare the registry with current work.

## First determine whether an agent is necessary

Check in this order:

1. Can an existing agent perform the work within its scope?
2. Is adding a new skill to an existing agent sufficient?
3. Can a repeated process be solved with a command or hook?
4. If external data or tools are required, is an MCP integration more appropriate?
5. Propose a new agent only when separate context, responsibility, tool permissions, and recurring workload are needed.

## Hiring proposal

Every new-agent proposal must include:

- evidence of the problem and repeated capability gap;
- the new role's specific responsibilities and boundaries;
- an alternative using an existing agent or skill;
- expected benefit and additional coordination/token cost;
- tools and minimum permissions;
- reporting line and reviewer;
- success criteria and when the role would no longer be needed;
- AITMPL baseline candidate, official Claude Code rules, and Qarğa-specific adaptation;
- an explicit **I approve** decision from the project owner.

## Creation after approval

After explicit approval:

1. Create `.claude/agents/<agent-name>.md`.
2. Mark the agent active in `.claude/capability-registry.json`.
3. Add it to the `Agent(...)` allowlist in `qarga-coordinator.md` frontmatter.
4. Update delegation information and `docs/AGENT-REGISTRY.md`.
5. Keep the agent's skills and tool references minimal, but always include `qarga-performance-governance`.
6. Create an initial `unrated` card in `.claude/performance/scorecards.json`.
7. Run `npm run validate:claude`.
8. Tell the user to start a new session; subagents manually added to disk are loaded at session start.

Never create a new agent without approval, and never copy a source template unchanged without adapting it to Qarğa.
