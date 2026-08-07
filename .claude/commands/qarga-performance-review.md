---
description: Evaluate completed tasks using evidence, update agent scorecards, and prepare an improvement plan when needed
argument-hint: [task, milestone, or agent name]
---

Use the `qarga-performance-governance` skill.

Scope: `$ARGUMENTS`

1. Read `.claude/performance/policy.json`, the capability registry, and current scorecards.
2. Evaluate only work that had base points, acceptance criteria, and a reviewer assigned before the task started.
3. Do not rely on the agent's self-report; inspect the diff, tests, reviews, decision memo, and accepted outcome.
4. Prepare an evaluation JSON for every task. Unless a project-owner decision is required, record it with `npm run performance:record -- <evaluation-file>`.
5. An agent cannot evaluate its own task. If the coordinator is being evaluated, ask the project owner for the score.
6. If rolling quality is weak, provide root-cause analysis and a measurable improvement plan.
7. Do not create a leaderboard or artificial competition; focus on role-specific reliability, evidence, and team outcomes.
8. End with strong results, repeated weaknesses, recommended skill/prompt changes, and decisions required from the project owner.
