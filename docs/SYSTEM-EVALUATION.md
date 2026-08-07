# Qarğa Agent-System Evaluation

## Purpose

Treat agent prompts, workflow rules, permissions, hooks, and learning policies as production behavior that requires regression evaluation. The system must not improve one scenario by silently breaking another.

## Deterministic layer

Run:

```bash
npm run validate:claude
npm run test:claude-system
```

The self-test uses a temporary directory and verifies:

- valid performance recording;
- duplicate-evaluation rejection;
- agent self-evaluation rejection;
- valid learning observation recording;
- duplicate-observation rejection;
- repeated-signal aggregation;
- safe-command approval and dangerous-command blocking.

It does not modify the real performance or learning ledgers.

## Behavioral regression layer

Scenarios live in `.claude/evals/coordinator-scenarios.json`. They protect:

- Fast Lane proportionality;
- strategic pushback for unsupported financial decisions;
- Critical Lane payment governance;
- server-side authorization and IDOR protection;
- owner-approved team growth and least privilege;
- controlled learning without silent prompt mutation.

Use a fresh-context reviewer and record only actual results in `.claude/evals/results.json`. Missing evidence is `not-run`, never a pass.

## Promotion gate

A permanent system change is promoted only when:

1. deterministic checks pass;
2. every affected scenario passes or an explicit accepted limitation is documented;
3. QA and security reviews required by the change are complete;
4. the project owner approves protected changes;
5. the change succeeds over the next three relevant real tasks.

Otherwise revise or revert it.
