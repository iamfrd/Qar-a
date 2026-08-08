---
name: qarga-verification-loop
description: Verify Qarğa changes with layered, reproducible evidence before they are called complete or ready for review.
---

# Qarğa Verification Loop

Verification is a claim-evidence contract. Never report a check as passed unless it actually ran and its output was inspected.

## Phase 1 — targeted checks

Run the smallest checks tied directly to the changed behavior:

- focused Node tests;
- relevant API request/response scenario;
- component or browser scenario;
- configuration validator;
- syntax or schema check.

## Phase 2 — project gates

Unless the task is explicitly read-only, run the applicable project gates:

```bash
npm run validate:claude
npm run lint
npm run build
npm test
```

If one cannot run, state why and do not mark it passed.

## Phase 3 — diff and invariant review

Inspect:

- `git diff --stat` and the actual diff;
- accidental files and generated artifacts;
- loading, empty, error, and success states;
- typed API boundaries;
- server-authoritative prices, roles, capacity, and statuses;
- parameterized SQL and transactional invariants;
- secrets, personal data, and unsafe logs;
- documentation and plan consistency.

## Phase 4 — independent reviews

Require the reviewers selected by the task lane:

- QA for implementation changes;
- UI auditor for visible flows;
- architect for boundary or schema changes;
- security auditor for auth, permissions, personal data, payment, or release;
- payment and legal specialists where their domains are affected.

The implementation agent's self-review is supplementary, never independent evidence.

## Phase 5 — readiness decision

Use one status:

- **READY** — required checks passed and no unresolved blocking finding remains;
- **CONDITIONALLY READY** — non-blocking limitations are disclosed and accepted;
- **NOT READY** — a required check failed, did not run, or a blocking finding remains.

## Verification report

Include:

1. commands and exit status;
2. tests passed/failed;
3. manual or browser evidence;
4. reviewer findings;
5. unresolved risks;
6. readiness status.

## Contract integration

Verification must map evidence back to the active completion-contract requirement IDs. Run `npm run task:review` before accepted closure. Missing contract evidence remains NOT PROVEN even if an implementer reports success.
