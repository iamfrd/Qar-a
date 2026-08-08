---
description: Run deterministic and fresh-context regression evaluation for changes to the Qarğa Claude agent system.
argument-hint: [changed agent, skill, policy, or workflow]
---

Evaluate `$ARGUMENTS` as `qarga-coordinator` using `qarga-system-evaluation`.

1. Inspect the current diff and identify every changed system behavior.
2. Run `npm run validate:claude` and `npm run test:claude-system`.
3. Read `.claude/evals/coordinator-scenarios.json` and select all affected scenarios.
4. Delegate scenario grading to a fresh-context `qarga-qa-auditor`; add `security-auditor` when permissions, hooks, integrations, auth, payment, or personal data are affected.
5. Do not let the authoring agent be the only reviewer.
6. Update `.claude/evals/results.json` only with actual evidence and the tested checkpoint.
7. Report regressions, missing evidence, required approval, and a promote/revise/revert recommendation in Azerbaijani.
8. Never merge, deploy, expand permissions, or permanently promote the change without the required project-owner approval.
