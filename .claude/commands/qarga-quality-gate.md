---
description: Run the Qarğa verification loop and independent review required by the task lane without deploying or merging.
argument-hint: "[task, branch, or milestone]"
---

Run the quality gate for `$ARGUMENTS`.

1. Read `CLAUDE.md`, the capability registry, the task plan, current diff, and relevant project-memory records.
2. Determine the task lane from the recorded base points and risk flags.
3. Run the targeted checks and applicable project gates.
4. Assign independent reviewers required by the lane.
5. Confirm that evidence supports every completion claim and that any concrete debt left by the task is explicitly surfaced.
6. Run or inspect `npm run project-memory:review`; unresolved critical debt cannot receive a clean READY status without explicit owner risk acceptance.
7. Report READY, CONDITIONALLY READY, or NOT READY.
8. Do not merge, deploy, or perform destructive actions.
