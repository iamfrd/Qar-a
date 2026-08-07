---
description: Review Qarğa's decision, technical-debt, and experiment registries to surface stale decisions, release blockers, learning candidates, and the next owner decisions.
argument-hint: "[milestone, release, or area]"
---

Run a project-memory review for `$ARGUMENTS`.

1. Run `npm run project-memory:review`.
2. Read `.claude/project-memory/review.json` and the relevant latest registry events.
3. Verify important findings against the current repository and current project-owner decisions.
4. Surface:
   - approved decisions that reached a review trigger;
   - high/critical open technical debt;
   - debt that threatens the current milestone or release;
   - running or stale experiments;
   - experiment outcomes that should change product direction;
   - repeated patterns that justify a controlled-learning proposal;
   - recurring ownerless work that justifies a team review.
5. Do not automatically reopen decisions, resolve debt, promote experiment results into permanent policy, or change the agent system.
6. Return a concise Azerbaijani owner report with evidence and explicit decisions required.
