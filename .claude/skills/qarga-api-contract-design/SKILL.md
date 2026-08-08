---
name: qarga-api-contract-design
description: Design stable, typed, server-authoritative Qarğa API contracts with explicit errors, idempotency, authorization, and migration compatibility.
---

# Qarğa API Contract Design

Use this skill for new or changed endpoints, response types, mutations, webhooks, and frontend-backend integration contracts.

## Contract requirements

- Name resources and actions consistently with existing routes.
- Define request, success response, and error response types.
- Keep roles, prices, capacity, eligibility, and status transitions server-authoritative.
- Use stable error codes plus user-safe messages.
- Validate input at the server boundary.
- Enforce ownership and permissions on every protected resource.
- Use parameterized SQL and transactions for multi-step invariants.
- Define idempotency for registration, booking, payment, and webhook mutations.
- Document pagination, filtering, sorting, and empty behavior where applicable.
- Avoid exposing internal database structure or sensitive fields.

## Change process

1. inspect current routes, API client methods, types, callers, and tests;
2. write the contract and compatibility impact;
3. add failing contract/integration tests;
4. implement server behavior;
5. update `src/lib/api.ts` with concrete types;
6. update UI states and error handling;
7. run independent review and verification.

## Compatibility

Prefer additive changes. For a breaking change, document callers, migration sequence, rollback, and versioning or transition strategy. Do not silently change a response shape and repair only one caller.
