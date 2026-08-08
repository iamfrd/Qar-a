---
name: qarga-e2e-testing
description: Design and run stable end-to-end verification for Qarğa's highest-value student, provider, admin, and future payment journeys.
---

# Qarğa End-to-End Testing

Use this skill when a change affects a user journey across UI, API, and database boundaries.

## Priority journeys

1. student login or OTP session;
2. map/search to course detail;
3. trial request or registration;
4. capacity and duplicate-submission handling;
5. history and status visibility;
6. provider course create/edit and ownership;
7. admin moderation or approval;
8. future payment, refund, webhook, and reconciliation flows after they are approved.

## Design rules

- Use deterministic seed data and stable selectors.
- Keep each test independent and reset state safely.
- Test success, validation failure, permission failure, loading, empty, and recoverable error states.
- Never use real payment credentials or personal data.
- Capture screenshots or traces for failed visual flows when tooling supports it.
- The repository includes Playwright-ready configuration and a smoke-test scaffold, but the package does not silently install `@playwright/test` or browser binaries. Enable the dependency only after project-owner approval and lockfile update.

## Before adding tooling

Prepare a proposal containing:

- journeys to cover;
- framework options and compatibility;
- maintenance and CI cost;
- selectors and fixture strategy;
- rollout plan;
- exact dependency approval required.

Use `npm run e2e:check` to distinguish structure readiness from dependency readiness. Once Playwright is approved and installed, run the suite with `tests/e2e/playwright.config.mjs`, preserve traces/screenshots on failure, and make Critical-lane journey failures release-blocking.
