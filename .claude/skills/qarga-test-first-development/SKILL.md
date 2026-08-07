---
name: qarga-test-first-development
description: Implement Qarğa behavior through failing tests or explicit invariants first, then the smallest code change, refactor, and regression proof.
---

# Qarğa Test-First Development

Use this skill for behavior changes, bug fixes, API mutations, server invariants, payment logic, permissions, and regression-prone UI flows.

## Core loop

1. **Specify** — write observable acceptance criteria and identify the owning layer.
2. **Red** — add a test that fails for the intended reason, or document why an automated test is not currently possible and define an executable alternative.
3. **Green** — implement the smallest change that makes the test pass.
4. **Refactor** — improve structure without changing behavior.
5. **Regression** — run the focused test and the relevant broader suite.
6. **Evidence** — record the command, result, and changed files.

## Qarğa priorities

Tests are especially important for:

- server-side price and status authority;
- provider ownership and role permissions;
- booking capacity and concurrency;
- idempotent registration and future payment mutations;
- refund, webhook, and reconciliation states;
- OTP/session behavior;
- typed API contracts and error handling;
- search, detail, trial, registration, and history flows.

## Test design rules

- Keep dates deterministic and timezone-safe.
- Do not weaken assertions to make a broken implementation pass.
- Test externally visible behavior rather than private implementation details.
- Add negative cases for permissions, invalid state transitions, duplicates, and missing resources.
- For bugs, first reproduce the defect with a failing test when feasible.
- Do not introduce a new testing framework without explicit approval and a demonstrated gap.

## When strict test-first is not practical

For pure documentation, static configuration, or visual-only changes, define the verification artifact before editing: schema validation, screenshot, accessibility check, diff rule, or manual scenario. State clearly that it is not an automated test.

## Completion evidence

Report:

- the failing test or initial evidence;
- the implementation change;
- the passing focused test;
- the broader regression command;
- remaining untested risk.
