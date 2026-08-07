# Agent Performance System

The system measures role reliability and training needs. It is not a global popularity contest and does not attempt to motivate models with artificial rewards.

## Contract-backed evaluation

A delegated task must have a completion contract before work begins. The contract freezes the task ID, owner, lane, base points, allowed scope, reviewer, approval gates, acceptance requirements, and required evidence.

An agent cannot receive an accepted performance score until the corresponding contract is closed as accepted with independent evidence. Base points cannot be changed after results are known.

## Quality dimensions

- correctness — 30%;
- verification — 20%;
- scope adherence — 15%;
- safety and risk handling — 15%;
- collaboration and handoff — 10%;
- clarity and usefulness — 10%.

`earnedPoints = basePoints × qualityScore / 100`

Rejected work earns zero. Negative scoring is avoided because it can encourage concealment rather than learning.

## Work OS KPI model

The visual Work OS uses the same evidence-backed scoring model without creating a second source of truth. A parent card may involve several agents, so the parent card itself is not an agent performance task. Instead:

- every executable subtask has exactly one primary agent, one independent reviewer, and `basePoints` from 1–10;
- the subtask completion contract is the unit that can earn agent performance points;
- parent-card KPI max is the sum of all executable subtask base points;
- parent-card earned KPI is the sum of reviewed subtask earned points;
- only an independent accepted review may move a subtask to `done`;
- a blocked, waiting, in-progress, review, partial, rejected, or rework item cannot manufacture completion points;
- `.claude/performance/ledger.jsonl` remains the scoring authority, while Work OS displays derived aggregates for operational visibility.

This lets one parent task contain multiple bots without giving every participant the full parent score.

## Evaluation rules

- agents cannot score themselves;
- specialists are evaluated by the coordinator using independent reviewer/test evidence;
- only the project owner evaluates the coordinator;
- task quantity, verbosity, self-created scope, unsupported claims, or proposal volume do not earn points;
- score never bypasses QA, security, payment, legal, deployment, or human approval;
- lifecycle telemetry is supporting operational evidence, not a quality score by itself;
- role scorecards are used for routing and improvement, not a cross-role leaderboard.

## Levels

- `unrated`: fewer than three evaluated tasks;
- `developing`: rolling quality below 70%;
- `reliable`: 70–84.99%;
- `strong`: 85–92.99%;
- `trusted`: at least ten evaluated tasks and 93% or higher.

## Improvement cycle

Repeated weakness triggers root-cause analysis across prompt quality, skill coverage, task decomposition, routing, handoff, context, tests, review quality, and tool/integration gaps. Apply the smallest intervention and evaluate it over the next three relevant tasks before permanent promotion.

## Commands

```bash
npm run task:review
npm run performance:record -- <evaluation.json>
npm run agent-ops:report
```
