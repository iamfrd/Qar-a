---
description: Create a durable Qarğa task checkpoint with current state, evidence, decisions, blockers, and a safe resume path.
argument-hint: "[task or milestone]"
---

Create or update a checkpoint for `$ARGUMENTS` in the relevant `docs/plans/` file.

Include:

1. objective and selected workflow lane;
2. completed, active, blocked, and not-started tasks;
3. file ownership and changed files;
4. commands that actually ran and their results;
5. reviewer findings and unresolved risks;
6. decisions already approved and decisions still required, including durable Decision Registry IDs when applicable;
7. open technical-debt IDs and experiment IDs that constrain safe continuation;
8. performance, project-memory, and learning records still pending;
9. the exact safest next action for a new session or agent.

Do not claim completion when evidence is missing.
