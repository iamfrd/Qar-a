---
name: qarga-project-memory-governance
description: Preserve Qarğa's approved decisions, concrete technical debt, and measurable experiments as durable evidence-backed registries that future sessions must consult before changing direction.
---

# Qarğa Project Memory Governance

This skill turns important project history into structured repository evidence instead of relying on conversational memory.

## Why it exists

Claude sessions are temporary. Product decisions, deliberate compromises, and experiment outcomes must survive sessions in a form that can be inspected, reviewed, superseded, and validated.

Project memory has three registries:

- **Decision Registry** — approved material decisions and the evidence, alternatives, rationale, owner, and review trigger behind them.
- **Technical Debt Registry** — concrete liabilities intentionally left in the product, with impact, severity, remediation path, and review milestone.
- **Experiment Registry** — bounded hypotheses with metrics, guardrails, evidence sources, decision rules, and measured outcomes.

Storage is append-only under `.claude/project-memory/`. Generated review state lives in `.claude/project-memory/review.json`.

## Authority

Project memory is durable context, not absolute truth. Resolve conflicts in this order:

1. current repository and executable evidence;
2. `CLAUDE.md` and explicit project-owner decisions;
3. approved project-memory records;
4. current official documentation;
5. agent prompts and skills;
6. learning observations and unapproved proposals.

Never allow an old registry entry to override current code or a newer approved decision.

## Decision Registry rules

Create or update a decision record when a material product, revenue, payment, architecture, legal, security, scope, support, or operating-model choice is approved.

A good decision record contains:

- the problem and context;
- options that were actually considered;
- the chosen option;
- rationale and evidence;
- explicit assumptions and unknowns;
- affected areas and related task IDs;
- owner approval for an `approved` state;
- a review date, milestone, metric threshold, or condition when the decision should be reconsidered.

Do not reopen an approved decision just because a different agent prefers another option. Reopen it only when new evidence appears, a review trigger fires, or the project owner asks.

## Technical Debt Registry rules

Record debt when a completed task intentionally leaves a concrete liability, for example:

- a temporary workaround;
- a known design limitation;
- a migration remnant;
- a missing important test;
- an unsafe or brittle assumption that is explicitly accepted for now;
- duplicated or difficult-to-maintain code that has real future cost.

Do not call every backlog idea technical debt. Debt must describe something that already exists and has evidence.

Every open debt item must state severity, impact, affected areas, remediation direction, owner agent, and a target milestone or review trigger. Marking debt `resolved` requires resolution evidence.

Hidden debt is a quality failure. Creating a debt record earns no performance points; it simply preserves honesty.

## Experiment Registry rules

Use an experiment instead of a full rollout when an important choice is uncertain and can be tested safely.

Before an experiment starts, define:

- hypothesis;
- primary metric and source;
- guardrail metrics;
- known baseline or explicit `unknown`;
- audience or scope;
- duration or stop condition;
- decision rule;
- risks and approvals.

Never invent a baseline, target, result, conversion rate, market size, or margin. If it is not measured, mark it unknown.

A user-affecting, financial, marketing, or external-account experiment may not enter `approved` or `running` state without project-owner approval. A `completed` experiment requires evidence and one conclusion: `keep`, `iterate`, `stop`, or `inconclusive`.

## Review and self-improvement loop

Run `npm run project-memory:review`:

- at the start of a substantial coordinator session;
- before a material strategic or technical decision;
- at the end of a major milestone;
- before release readiness;
- when performance or learning signals may be explained by an old decision, recurring debt, or experiment result.

The review may surface controlled-learning candidates, team-review candidates, and release blockers. It may not silently change prompts, permissions, agents, hooks, or permanent project rules.

## Recording commands

```bash
npm run decision:record -- <decision-event.json>
npm run debt:record -- <debt-event.json>
npm run experiment:record -- <experiment-event.json>
npm run project-memory:review
```

All inputs must exclude secrets, credentials, personal data, and raw private conversations.
