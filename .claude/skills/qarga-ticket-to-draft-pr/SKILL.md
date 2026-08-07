---
name: qarga-ticket-to-draft-pr
description: Convert an approved, implementation-ready Qarğa GitHub issue into a bounded completion contract, implementation, independent review, and Draft PR; never auto-merge or deploy.
---

# Qarğa Ticket to Draft PR

A ticket is AI-ready only when the objective, acceptance criteria, risk/lane, allowed scope, product decisions, and required approvals are explicit. Ambiguous product decisions go back to the coordinator/project owner before code begins.

Workflow: inspect issue and repository → create completion contract → select agent(s) → implement with anti-spin → tests → independent QA/security/UI/payment review as required → create Draft PR containing contract/evidence/risks. Never merge main, deploy, spend money, or mutate external systems automatically.

Recurring 7/24 ticket processing is disabled until API budget, GitHub permissions, sandboxing, schedules, and approval policy are explicitly configured.
