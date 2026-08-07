---
name: qarga-work-os
description: Use Qarğa Work OS as the persistent operational queue for parent tasks, agent-owned subtasks, dependencies, owner decisions, evidence, review status, KPI points, comments, and activity history. Use it for delegated or multi-step work so progress survives Claude sessions.
---

# Qarğa Work OS

Work OS is the persistent operational layer for delegated work. It is not a replacement for repository evidence, completion contracts, performance ledgers, Decision/Technical-Debt/Experiment registries, or Git history. It links those systems into one visible task graph.

## Core rule

For any delegated or multi-step deliverable:

1. The coordinator creates one parent Work OS task.
2. The coordinator decomposes it into independently reviewable subtasks.
3. Each subtask has exactly one primary agent, one independent reviewer, integer base points from 1–10, explicit acceptance criteria, evidence expectations, file boundaries, and dependencies.
4. Creating a Work OS subtask automatically creates its completion contract in `.claude/tasks/contracts.jsonl`.
5. Dependencies determine which subtasks are READY. A specialist must not start a WAITING task.
6. The assigned specialist starts and submits only its own subtask. It cannot mark itself DONE or score itself.
7. The independent reviewer verifies evidence. Accepted closure automatically closes the completion contract and records the existing performance evaluation.
8. Parent KPI max points are the sum of subtask base points. Earned points are the sum of independently reviewed performance scores.
9. A parent task is DONE only when all required subtasks are done and no owner-decision gate remains open.
10. Every material transition is appended to `.claude/work-os/events.jsonl` for durable activity history.

## Source-of-truth boundaries

- Work OS: operational status, assignment, dependency graph, comments, visibility.
- `.claude/tasks/`: completion-contract truth and anti-spin evidence.
- `.claude/performance/`: agent quality scores and improvement trends.
- `.claude/project-memory/`: approved decisions, technical debt, and experiments.
- Git/repository/tests: implementation truth.

Do not duplicate or silently override those sources.

## Coordinator behavior

Before delegation, run or inspect:

```bash
npm run work-os:summary
npm run work-os:validate
```

Create a parent task before creating specialist subtasks. Assign dependencies explicitly. Open `needs_decision` when project-owner input is required. Do not manually force a task into DONE.

Typical CLI flow:

```bash
npm run work-os -- create-task --title "Provider payment system" --type payment --priority critical --team Revenue
npm run work-os -- add-subtask QW-0001 --title "Revenue model options" --agent qarga-revenue-strategist --reviewer qarga-coordinator --points 3 --accept "Compare viable marketplace revenue models::Decision-ready option matrix with assumptions"
npm run work-os -- add-subtask QW-0001 --title "Payment architecture" --agent payment-integration --reviewer security-auditor --points 7 --depends QW-0001-S01 --accept "Define idempotent payment creation::Architecture and retry evidence" --accept "Define refund and reconciliation behavior::Refund/reconciliation evidence" --accept "Define failure and rollback behavior::Failure-path test evidence" --gate "Project owner approves the revenue model"
```

The coordinator may use the CLI directly rather than asking the project owner to operate it.

## Specialist behavior

When the coordinator gives a Work OS subtask ID:

1. Confirm the subtask ID, assigned agent, dependencies, lane, points, contract, and acceptance criteria.
2. If Bash is available, start the task:

```bash
npm run work-os -- start <TASK> <SUBTASK> --agent <your-agent-name>
```

3. Work only inside the delegated boundaries.
4. Submit evidence by requirement, for example:

```bash
npm run work-os -- submit <TASK> <SUBTASK> --agent <your-agent-name> --summary "Implemented and verified" --evidence "REQ-1::npm test passed" --evidence "REQ-2::server/booking.mjs diff reviewed"
```

5. Wait for independent review. Do not move yourself to DONE.
6. If blocked, record the blocker rather than guessing or expanding scope.

If the agent does not have Bash permission, return the exact desired Work OS transition and evidence to the coordinator, who records it.

## Reviewer behavior

The reviewer verifies concrete evidence and either requests REWORK or closes the completion contract through Work OS. Review dimensions must come from evidence, not politeness.

Accepted/partial/rejected reviews require all existing performance dimensions:

- correctness;
- verification;
- scopeAdherence;
- safety;
- collaboration;
- clarity.

REWORK does not close the contract and earns no score yet.

## Owner-decision gates

When the coordinator needs a product-owner decision:

```bash
npm run work-os -- decision-open <TASK> --summary "Decision needed" --option "A" --option "B"
```

After the project owner decides, the coordinator records the material decision in the Decision Registry when required, then resolves the board gate:

```bash
npm run work-os -- decision-resolve <TASK> --summary "Owner selected option A" --decision-id DEC-123
```

Do not fabricate owner approval.

## Visual board

Run:

```bash
npm run work-os:serve
```

Then open `http://127.0.0.1:4177`.

The board is internal-only and binds to localhost by default. Remote exposure, authentication changes, or external hosting require explicit approval and a security review.

## Anti-gaming rules

- Never create low-value subtasks merely to increase points.
- Never split one coherent deliverable into artificial fragments for score volume.
- Never self-score or self-review.
- Never weaken acceptance criteria after execution starts without the existing owner-approved contract amendment process.
- Never hide blockers, technical debt, failed verification, or partial outcomes to move a card to DONE.
- Agent routing should use quality/reliability and capability fit, not raw point totals.
