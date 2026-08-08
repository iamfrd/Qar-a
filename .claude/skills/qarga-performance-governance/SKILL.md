---
name: qarga-performance-governance
description: Assign agent tasks a 1–10 base score before work starts, evaluate results using evidence-based quality criteria, prevent manipulation and harmful competition, and create improvement plans for weak agents.
---

# Qarğa Agent Performance Governance

This skill is not intended to “motivate” agents like humans. Its purpose is to identify which agent/prompt/skill combinations are reliable for which work, route tasks correctly, and create training plans for recurring weaknesses.

## Core rule

Before a delegated task starts, the coordinator records a `qarga-completion-contract` containing:

- unique `taskId`;
- task-owner agent;
- `basePoints` from 1 to 10;
- workflow lane;
- numbered acceptance requirements;
- exact evidence required for each requirement;
- independent reviewer;
- allowed/forbidden file scope;
- approval gates and anti-spin stop conditions.

Base points represent importance and difficulty, not quality:

- 1–2: very small, local, low-risk work;
- 3–4: small feature/fix or focused analysis;
- 5–6: several files or moderate business impact;
- 7–8: multi-domain, high-risk, or milestone work;
- 9–10: payment, authentication, data migration, release, or critical strategic decisions.

Base points cannot be changed after task completion to match the result.


## Work OS linkage

When a parent Work OS card contains multiple specialists, do not give every agent the parent score. Each executable Work OS subtask is the independently scored deliverable and uses the same 1–10 `basePoints` as its completion contract. Parent-card KPI values are derived only for project visibility:

- parent KPI max = sum of all executable subtask base points;
- parent earned KPI = sum of reviewed subtask earned points.

The Work OS visual board may display these aggregates, but `.claude/performance/ledger.jsonl` remains the scoring authority. A card cannot be moved to DONE to manufacture a score.

## Quality evaluation

The coordinator evaluates the task using repository diffs, test results, reviews, and other verifiable evidence—not the agent's own claims:

- correctness — 30%;
- verification — 20%;
- scope adherence — 15%;
- safety/risk handling — 15%;
- collaboration/handoff — 10%;
- clarity/usefulness — 10%.

Earned points:

`earnedPoints = basePoints × qualityScore / 100`

Example: a three-point task completed at 40% quality earns 1.2 points. A fully rejected result earns 0. Do not use negative points; they can encourage agents to hide problems.

## Who evaluates?

- An agent cannot score its own task.
- The coordinator evaluates specialist agents; QA/security/UI reviewers provide evidence.
- Only the project owner evaluates the coordinator.
- Evaluation does not replace Definition of Done or the completion contract.
- Performance scoring is rejected until the task contract is independently closed.
- `accepted`, `partial`, or `rejected` performance status must match the recorded contract closure.

## Competition guardrails

Do not create a zero-sum leaderboard. Do not directly compare a frontend agent with a legal agent. Compare each agent against the rolling quality threshold for its own role.

Do not award points for:

- unapproved additional scope;
- taking many tasks;
- unnecessary new-agent or skill proposals;
- writing long responses;
- unsupported “completed” claims;
- taking credit for another agent's work.

A proactive suggestion may earn points only after project-owner approval and measurable benefit, as a separate task. Each agent should submit at most two prioritized suggestions per milestone.

## Trust levels

Use rolling quality across the latest 10 tasks:

- `unrated`: fewer than three evaluated tasks;
- `developing`: below 70%;
- `reliable`: 70–84.99%;
- `strong`: 85–92.99%;
- `trusted`: at least 10 tasks and 93%+.

Rewards never bypass safety:

- reliable: normal task routing;
- strong: first candidate for appropriate complex tasks and eligible for peer review;
- trusted: limited sub-team mentoring, reusable-skill proposals, and lead candidacy for difficult tasks;
- no level removes human approval, QA/security review, or permission rules.

## Improvement plan

Open an improvement review when any of the following occurs:

- rolling quality across the latest three tasks is below 70%;
- the same error category repeats twice;
- the agent repeatedly works outside scope;
- it makes an unsupported completion claim;
- it violates a security or data invariant.

The coordinator first separates possible causes:

1. prompt or role-boundary problem;
2. missing skill;
3. incomplete handoff;
4. incorrect task routing;
5. weak verification;
6. scope too broad for the agent.

Then choose the lightest appropriate intervention:

- clarify the agent prompt;
- add a new skill or checklist;
- narrow task scope;
- pair or shadow the agent with a strong agent;
- assign an additional reviewer;
- run a three-task re-evaluation cycle;
- if the capability gap persists, propose a new agent to the project owner.

## Recording and audit

Evaluations are stored append-only in `.claude/performance/ledger.jsonl`, and aggregate scorecards are updated in `.claude/performance/scorecards.json`. Task evidence and closure live separately under `.claude/tasks/`; telemetry may support operational analysis but never substitutes for contract evidence. To add a record:

```bash
npm run performance:record -- docs/agent-performance/evaluations/TASK-ID.json
```

Never write an unsupported score, delete an earlier record, or manually inflate a scorecard.

## Capability benchmark evidence

Use capability benchmark results as secondary routing and training evidence, not as a replacement for real Work OS performance. Track both: real-task quality/rework and benchmark generalization/regression. Do not reward an agent for memorizing benchmark cases, and do not route critical work from benchmark score alone when real-work evidence is weak.
