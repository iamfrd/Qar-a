# Initial Qarğa Technical Audit

This document records the baseline observations used to design the agent system. It does not claim that local runtime or browser tests passed.

## Strengths

- simple React/Vite frontend and Node/SQLite backend;
- centralized API client;
- server-side role, ownership, capacity, idempotency, and price invariants;
- CI with lint, build, database setup, and backend tests;
- project-specific coordinator, implementation, QA, UI, security, payment, legal, and revenue roles.

## Priority improvement areas

1. inventory and complete server-authoritative frontend migration;
2. replace broad `Record<string, unknown>` API responses with concrete interfaces;
3. make dates and fixtures deterministic;
4. add browser/E2E smoke coverage for login, search, detail, trial/registration, history, provider, and admin flows;
5. replace functional emoji with the shared icon system;
6. keep documentation synchronized with current code;
7. approve the business, legal, support, and technical payment model before enabling online payment.
