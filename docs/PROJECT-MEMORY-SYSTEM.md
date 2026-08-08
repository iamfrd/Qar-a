# Qarğa Project Memory System

## Purpose

The project memory system preserves the three kinds of history that most often get lost between AI sessions: **approved decisions**, **intentional technical debt**, and **experiment outcomes**. It is designed to make future coordinator sessions more consistent without turning stale memory into unquestioned truth.

## Components

| Registry | Purpose | Typical owner |
|---|---|---|
| Decision Registry | Preserve material approved choices, rationale, alternatives, assumptions, and review triggers | Project owner + coordinator |
| Technical Debt Registry | Preserve concrete liabilities that remain after implementation | Engineering owner + coordinator |
| Experiment Registry | Preserve bounded hypotheses, metrics, approvals, and outcomes | Product/revenue owner + coordinator |

The ledgers are append-only JSONL files under `.claude/project-memory/`. `npm run project-memory:review` creates a current-state review without deleting history.

## Why append-only

An append-only event history prevents an agent from silently rewriting why an old decision was made or erasing debt that became inconvenient. Later events may supersede, resolve, or retire earlier states, but the prior record remains auditable.

## Decision lifecycle

`proposed → approved/rejected → reviewed → superseded/retired`

Approved decisions require explicit `project-owner` approval. Every approved decision needs a review trigger so a temporary assumption does not become permanent by accident.

## Technical-debt lifecycle

`open → planned → resolved` or `open → accepted-risk/obsolete`

Debt is not a wish list. It is a liability that already exists. Critical open debt blocks a clean `READY` release unless it is resolved or the project owner explicitly accepts the residual risk.

## Experiment lifecycle

`draft → approved → running → completed`

Experiments may also be paused or cancelled. User-affecting, financial, marketing, or external-account experiments require owner approval before `approved` or `running`. Completed experiments require measured evidence and a conclusion.

## Connection to self-improvement

Project memory does not directly mutate the agent system. It supplies better evidence to controlled learning:

- repeated debt categories can indicate a missing skill, checklist, architecture rule, or specialist;
- experiment outcomes can improve product and revenue guidance;
- decision review triggers can reopen assumptions only when evidence justifies it;
- concentrated debt ownership can trigger a team-capability review.

Permanent agent-system changes still follow the controlled-learning approval and regression-evaluation process.

## Commands

```bash
npm run decision:record -- <decision-event.json>
npm run debt:record -- <debt-event.json>
npm run experiment:record -- <experiment-event.json>
npm run project-memory:review
```

Optional Claude commands:

```text
/qarga-decision ...
/qarga-debt ...
/qarga-experiment ...
/qarga-memory-review ...
```
