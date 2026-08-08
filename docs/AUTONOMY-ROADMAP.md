# Qarğa 24/7 Automation Roadmap

Claude agents do not remain active by themselves. Continuous operation requires an approved trigger such as a schedule, GitHub event, queue, API call, or hosted worker.

## Current V10 state

V10 contains safe scaffolds, not an enabled autonomous production system:

- daily-health Cloudflare Worker template;
- weekly KPI pulse Worker template;
- AI-ready GitHub issue template;
- reference issue-to-Draft-PR workflow;
- sandbox-worker policy;
- production-observability policy;
- product-analytics event contract;
- lifecycle telemetry and Agent Ops reporting.

No worker is deployed, no external credential is bundled, and no autonomous GitHub write workflow is activated.

## Stage 1 — read-only monitoring

Approved scheduled workers may collect already-approved health or aggregate KPI endpoints and generate reports. They must not mutate users, payments, courses, database state, marketing accounts, or production configuration.

## Stage 2 — sandboxed Draft PR work

For an owner-approved or policy-approved AI-ready issue:

1. create a disposable sandbox;
2. clone the repository;
3. create a completion contract;
4. implement within bounded file ownership;
5. run required tests and independent review;
6. create a Draft PR;
7. wait for human review;
8. destroy the sandbox.

No auto-merge or auto-deploy.

## Stage 3 — narrowly approved low-risk automation

Only repetitive, reversible, well-tested operations may become automated after a successful pilot and explicit owner approval. Payment, pricing, refunds, auth/permissions, personal data, legal terms, destructive database actions, production deployment, and main-branch merge remain human-gated.

## Required controls before enabling 24/7 execution

- API/token budget and rate limits;
- approved GitHub permissions and branch rules;
- secret storage outside the repository;
- sandbox isolation;
- completion contracts and anti-spin limits;
- retries and dead-letter handling;
- telemetry without prompt/secret capture;
- incident and kill-switch procedure;
- owner-visible audit trail;
- explicit external-integration catalog status.
