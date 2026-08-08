---
name: qarga-skill-evolution-governance
description: Govern Qarğa skill and agent-capability evolution from repeated evidence through research, candidate creation, independent benchmark, real-task pilot, and PROVEN/REJECTED/DEPRECATED outcomes. Use when a recurring agent weakness, successful reusable pattern, skill edit, new skill, or prompt improvement is being considered.
---

# Skill Evolution Governance

Treat skills as versioned operational capabilities, not permanent prompt text.

Use this lifecycle:

`PROPOSED → RESEARCHED → CANDIDATE → BENCHMARKING → PILOT → PROVEN`

Alternative terminal states: `REJECTED`, `DEPRECATED`, `REPLACED`.

Before creating a skill, inventory existing skills and prefer editing the skill that already owns the capability. Distinguish WHAT-to-do failures from HOW-to-think failures: reusable procedures usually belong in a skill; repeated framing/judgment failures may belong in the agent prompt; deterministic repeated mechanics may belong in a script/tool.

A candidate cannot be promoted because it sounds better. Require independent baseline-vs-candidate evaluation on disjoint validation and hidden-holdout cases, regression checks, and a real-task pilot. Preserve failed candidate history so the system does not repeat disproven ideas.

Never let a candidate author evaluate or permanently approve its own change. Never leak hidden holdout answers into skill content. Never weaken test cases after results are known merely to improve the score.

For permanent promotion, follow owner-approval requirements in `.claude/skill-evolution/policy.json` and update the capability registry only after the promotion gate passes.
