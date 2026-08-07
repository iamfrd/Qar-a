---
description: Run the Qarğa release gate
---

Check release readiness, but never deploy to production without human approval.

Run `npm run project-memory:review` before evaluating readiness.

Minimum gate:

- Git diff and release scope are clear;
- the lockfile is valid for `npm ci`;
- `npm run validate:claude`, `npm run lint`, `npm run build`, and `npm test` actually pass;
- new and changed critical flows have tests;
- mock/localStorage is not used as server truth;
- authentication, permissions, payment, and personal-data changes passed security review;
- the UI does not claim `paid` where online payment does not exist;
- `.env`, tokens, and personal data are not committed;
- migration, rollback, and deployment plans are documented;
- observability, health checks, and incident rollback steps are clear;
- README and related documentation match the current state;
- critical open technical debt is resolved or explicitly accepted by the project owner;
- due decision reviews and due running experiments are surfaced rather than silently ignored;
- any material release-specific decision, debt acceptance, or experiment conclusion has a durable project-memory record.

Return `PASS`, `PASS WITH CONDITIONS`, or `BLOCK`. Critical unresolved technical debt is `BLOCK` unless the project owner explicitly accepts the residual risk; due non-date review triggers must be manually checked against the current milestone. For every blocking finding, provide a specific fix and verification command.
