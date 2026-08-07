---
description: Create, review, supersede, or retire a durable Qarğa project decision with evidence, alternatives, owner approval, and a future review trigger.
argument-hint: "[decision topic or decision ID]"
---

Manage the Decision Registry for `$ARGUMENTS`.

1. Read `.claude/project-memory/policy.json`, `.claude/project-memory/review.json`, and the relevant decision history.
2. Confirm current repository evidence and any newer project-owner instruction.
3. If this is a new material decision, present the real options, benefits, costs, risks, assumptions, and unknowns before requesting approval.
4. Do not record an `approved` state unless the project owner has explicitly approved the choice.
5. Set a concrete review trigger: date, milestone, metric threshold, or observable condition.
6. Record the event with `npm run decision:record -- <event.json>`.
7. If a prior decision is being replaced, create a new decision that references the prior ID and append a superseding event for the prior decision.
8. Never invent evidence or metrics.
