# Qarğa Completion Contract and Anti-Spin System

Every delegated deliverable is defined before implementation by an append-only completion contract under `.claude/tasks/`. The contract binds task ID, lane, base points, owner, independent reviewer, file scope, approval gates, requirements, and evidence.

Flow:

1. record `created` contract event;
2. record material progress attempts when needed;
3. record independently verified evidence for each requirement;
4. run `npm run task:review`;
5. close as accepted / partial / rejected;
6. only then record performance.

Anti-spin stops repeated no-progress approaches, A/B/A flip-flops, iteration-budget exhaustion, scope expansion without approval, and contract/test weakening. A blocked task is escalated; it is not forced to pass.
