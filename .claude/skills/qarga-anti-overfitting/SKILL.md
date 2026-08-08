---
name: qarga-anti-overfitting
description: Prevent Qarğa skills, prompts, and evaluation changes from overfitting to one failure, file, benchmark answer, or known validation set. Use while researching, authoring, evaluating, or promoting reusable agent-system improvements.
---

# Anti-Overfitting

A reusable capability must generalize beyond the incident that revealed it.

Reject guidance that hard-codes one file path, line number, exact bug, benchmark answer, or one user's phrasing unless that information is a stable project invariant. Prefer transferable rules, decision criteria, and workflows.

Before accepting a skill rule, ask whether it should still help on at least ten materially different tasks in the same capability family. If not, keep the fix local or use a checklist/documentation change.

Keep hidden-holdout expected answers outside candidate-author context. Do not rewrite evaluation cases after results are known unless the case is invalid; record that correction separately. Require category-level regression analysis so optimization of one narrow metric cannot silently damage another important capability.
