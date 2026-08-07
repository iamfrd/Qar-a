---
name: qarga-workflow-routing
description: Select the smallest safe execution lane for a Qarğa task using difficulty, risk, reversibility, and evidence requirements.
---

# Qarğa Workflow Routing

Use this skill before delegating or implementing any non-trivial task. The goal is to avoid two opposite failures: over-engineering small work and under-governing high-risk work.

## Inputs

Classify the task using:

- base points from 1 to 10;
- business and user impact;
- security, payment, privacy, legal, data-migration, and production risk;
- reversibility and rollback cost;
- number of modules, files, and agents involved;
- quality of the available acceptance criteria and evidence.

A low point score does not override a critical risk flag. Any payment, authentication, permission, personal-data, destructive migration, legal, or production task is at least Standard Lane and normally Critical Lane.

## Execution lanes

### Fast Lane — normally 1–3 points

Use for local, reversible, low-risk work.

Required:

1. inspect the relevant file and existing pattern;
2. define one clear acceptance criterion;
3. make the smallest change;
4. run the narrowest relevant check;
5. inspect the diff;
6. report honestly.

Do not create a multi-agent team, architecture document, or broad test harness unless the task itself requires one.

### Standard Lane — normally 4–6 points

Use for multi-file features, bug fixes with behavioral impact, API changes, or moderate business risk.

Required:

1. repository research;
2. written task contract or plan;
3. explicit file ownership;
4. test-first work where practical;
5. focused implementation;
6. independent QA review;
7. verification loop;
8. performance and learning records when the task closes.

### Critical Lane — normally 7–10 points or any critical risk flag

Use for payment, authentication, authorization, personal data, migrations, release, or major product/revenue decisions.

Required:

1. multi-domain analysis;
2. explicit project-owner decision points;
3. architecture and rollback plan;
4. test-first or invariant-first implementation;
5. independent QA review;
6. security review and any required payment/legal review;
7. full verification evidence;
8. unresolved-risk disclosure;
9. no production action, merge, or destructive operation without approval;
10. milestone team and learning review after completion.

## Escalation rules

Move a task to a stricter lane when:

- scope expands;
- a hidden dependency appears;
- tests reveal a system-level defect;
- the change touches a server-authoritative invariant;
- rollback becomes difficult;
- an external provider, credential, or account becomes involved;
- an independent reviewer identifies a HIGH or CRITICAL finding.

Never downgrade a lane after seeing that implementation is difficult merely to make the task appear successful.

## Output

Before work begins, state:

- selected lane and reason;
- task ID and base points;
- owner and reviewer;
- acceptance criteria;
- required verification;
- approval gates.

## Current execution controls

Every delegated lane uses `qarga-completion-contract`. Standard and Critical lanes record material iterations through `qarga-anti-spin`. Critical lane also uses human approval gates and a devil's-advocate pass when the decision is material. A task cannot be scored as accepted before its contract is independently closed.
