---
name: qarga-definition-of-done
description: Use to determine whether a Qarğa feature, bug fix, integration, or release task is genuinely complete.
---

# Qarğa Definition of Done

A task is considered done only when all relevant items below are proven complete:

- requirements and acceptance criteria are satisfied;
- no hidden out-of-scope changes were made;
- server truth was not replaced with client mock data or localStorage;
- API responses and mutations are typed and error-aware;
- loading, empty, error, and success states are handled;
- booking/registration retries are idempotent;
- price, capacity, role, and status come from the server;
- appropriate tests were added or updated;
- `npm run validate:claude`, `npm run lint`, `npm run build`, and `npm test` were run with real results;
- if UI changed, accessibility, 44px touch targets, responsive layout, and functional-icon rules were checked;
- if auth, payment, or PII changed, a security audit was completed;
- if an architecture boundary changed, an ADR or plan decision log was updated;
- documentation matches current behavior;
- any material approved decision, concrete technical debt, or completed experiment outcome that must survive the session has been flagged for the coordinator and recorded when appropriate;
- no CRITICAL/HIGH finding remains open in QA review;
- residual risks and checks not run are explicitly documented;
- critical open technical debt is either resolved or explicitly accepted by the project owner before a clean `READY` release status.

A passing build alone does not mean done. Real user-flow behavior must also be verified.

## Performance note

Definition of Done is not a score. After a task is closed as done, partial, or rejected, the coordinator creates a separate evidence-based evaluation. A high score does not close an open QA/security blocker, and a low score must also be supported by evidence.
