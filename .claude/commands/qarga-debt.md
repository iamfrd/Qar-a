---
description: Record, review, prioritize, accept, or resolve concrete Qarğa technical debt without turning ordinary backlog ideas into debt.
argument-hint: "[debt topic or debt ID]"
---

Manage the Technical Debt Registry for `$ARGUMENTS`.

1. Read the project-memory policy, current debt review, related code, tests, plans, and prior debt events.
2. Confirm that a concrete liability already exists. If this is only a future feature idea, keep it in the roadmap rather than the debt registry.
3. Record severity, impact, affected areas, root cause if known, remediation direction, owner agent, and target milestone or review trigger.
4. Do not hide debt to make a milestone look complete. Disclose release impact explicitly.
5. Mark an item `resolved` only with repository or test evidence.
6. Record the event with `npm run debt:record -- <event.json>` and rerun `npm run project-memory:review`.
7. If the same category repeatedly appears, create a controlled-learning observation or team-review candidate instead of normalizing the debt.
