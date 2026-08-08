---
description: Run the decision, planning, implementation, testing, review, and team-needs workflow for a Qarğa feature
argument-hint: [feature and acceptance criteria]
---

To implement `$ARGUMENTS`:

1. Read `CLAUDE.md`, `.claude/capability-registry.json`, and the current project-memory review. Check relevant approved decisions before changing an established direction.
2. Convert the request into a product objective and verifiable acceptance criteria. Never invent unknown business numbers.
3. If benefit, risk, alternatives, cost, or scope impact is material, use `qarga-executive-advisory` to obtain an owner decision.
4. Read the current implementation, API, and tests.
5. For multi-file work, create a plan in `docs/plans/` and record agent and file ownership.
6. Select appropriate specialists from the registry. Run agents that touch the same file sequentially.
7. After implementation, require the test automator and real results from `npm run validate:claude`, `npm run lint`, `npm run build`, and `npm test`.
8. Do not call the task done while QA is `BLOCK` or CRITICAL/HIGH findings remain open. Require a UI audit for UI work and a security audit for auth, payment, or PII work.
9. Before closing, flag and record any material approved decision, concrete technical debt, or experiment outcome that must survive the session, then run `npm run project-memory:review`.
10. If a milestone is completed, check whether project-memory, performance, or learning signals show a repeated capability gap and propose the smallest safe improvement; never create an agent without approval.
11. Provide one synthesized final report in Azerbaijani.
