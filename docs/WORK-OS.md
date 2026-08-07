# Qarğa Work OS

Qarğa Work OS is the persistent operational layer for the Claude agent organization. It turns chat-based delegation into a durable visual task graph that survives sessions and links directly to completion contracts, independent review, performance scoring, project memory, and activity history.

## Why it exists

A Claude conversation is temporary. A product organization needs durable answers to:

- What are we building?
- Who owns each part?
- What is blocked?
- Which owner decisions are waiting?
- Which subtasks can start now?
- What evidence proves a subtask is complete?
- Who reviewed it?
- How many KPI points were actually earned?
- What happened over time?

Work OS makes those answers persistent and visible.

## Model

```text
Project owner
    ↓
qarga-coordinator
    ↓
Parent task
    ├── Subtask A → agent → independent reviewer
    ├── Subtask B → waits for A
    ├── Subtask C → can run in parallel
    └── Subtask D → waits for owner decision
    ↓
Evidence-backed closure
    ↓
Performance score + project memory + activity history
    ↓
Done
```

## Board columns

- **Inbox** — captured but not decomposed or ready.
- **Needs decision** — the coordinator is waiting for a project-owner decision.
- **Ready** — at least one assigned subtask is dependency-clear and may start.
- **In progress** — an assigned agent is executing or reworking a subtask.
- **Review** — submitted work is waiting for the independent reviewer.
- **Blocked** — a blocker prevents safe progress.
- **Routine** — recurring work templates that are not automatically scheduled until approval.
- **Done** — all required subtasks passed independent review and no owner gate is open.
- **Archived** — completed historical work hidden from the default board.

Done is derived. It is not a manual cosmetic move.

## Parent task vs subtask scoring

A parent task may involve many agents. Every executable subtask has its own integer base points from 1–10 because the existing performance system evaluates one agent deliverable at a time.

```text
Parent KPI max = sum of subtask base points
Parent earned KPI = sum of independently reviewed earned points
```

Example:

```text
Provider payment system
├── Revenue options       3 pts
├── Product requirements  2 pts
├── Payment architecture  7 pts
├── Backend               8 pts
├── Security review       5 pts
└── Final QA              4 pts

Parent max: 29 pts
```

This avoids giving every participant the same parent-task score.

## Dependency-aware queue

A specialist does not choose arbitrary work from the board. The coordinator assigns subtasks. Work OS exposes only dependency-clear `ready` items to that agent:

```bash
npm run work-os -- next qarga-backend-engineer
```

The agent may not start a waiting subtask.

## Completion and review

Creating a Work OS subtask automatically creates the existing completion contract. The implementer submits evidence; an independent reviewer verifies it. Accepted review closes the contract and writes the existing performance evaluation. This prevents the visual board from drifting away from the evidence systems.

## Activity log

Every material transition is append-only in `.claude/work-os/events.jsonl`, including task/subtask creation, start, submission, rework, blocker, review outcome, owner-decision gates, comments, and archive events. The event log stores metadata and evidence references, not secrets or personal data.

## Visual board

Start the internal dashboard:

```bash
npm run work-os:serve
```

Open:

```text
http://127.0.0.1:4177
```

The board intentionally binds to localhost. Remote access requires explicit owner approval, authentication design, and security review.

## Useful commands

```bash
npm run work-os -- help
npm run work-os:summary
npm run work-os:validate
npm run work-os:review
npm run work-os:export
npm run work-os:serve
```

## Self-improvement connection

`npm run work-os:review` surfaces stale work, repeated rework, repeated blocker patterns, review queues, and owner decisions. These are only learning candidates. The existing controlled-learning and system-evolution pipeline still requires root-cause research, owner approval for persistent changes, independent review, and a pilot before promotion.

Work OS therefore improves observability of the organization without turning the system into uncontrolled self-modifying automation.
