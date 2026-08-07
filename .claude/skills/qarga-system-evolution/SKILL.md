---
name: qarga-system-evolution
description: Run Qarğa's controlled self-improvement pipeline from repeated evidence through research, approved proposal, implementation, independent review, pilot, and KEEP/REVISE/REVERT decision.
---

# Qarğa System Evolution

The system may discover improvement opportunities automatically but may not silently rewrite itself.

Pipeline: evidence → research → smallest-change proposal → required owner/specialist approval → completion contract → implementation by `qarga-system-improver` → independent review by `qarga-system-reviewer` → minimum three relevant-task pilot for persistent routing/prompt/skill changes → KEEP, REVISE, or REVERT.

Prefer fixes in this order: clarify documentation; add checklist; improve skill; improve command/routing; improve tests/evals; adjust hook/tool; modify agent prompt; add integration; add agent. A larger change requires stronger evidence.

Record every durable stage in `.claude/evolution/`. The researcher must not implement, the improver must not approve/review itself, and the reviewer must not be the author. Security-sensitive changes require security review. New agents/tools/integrations and permanent promotion require the project owner's explicit approval.

## Skill and prompt specialization

For reusable skill or agent-prompt changes, insert the stricter skill-evolution sub-pipeline before permanent KEEP: `qarga-skill-researcher` inventories existing capabilities and failed attempts; `qarga-system-improver` authors only an approved candidate; `qarga-evaluation-engineer` independently compares baseline and candidate on disjoint validation/hidden holdout sets; then the ordinary real-task pilot and system reviewer gates apply.
