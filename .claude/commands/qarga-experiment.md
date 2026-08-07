---
description: Design, approve, run, or close a bounded Qarğa product, revenue, support, or growth experiment with measurable evidence and explicit decision rules.
argument-hint: "[hypothesis, experiment topic, or experiment ID]"
---

Manage the Experiment Registry for `$ARGUMENTS`.

1. Read project-memory policy, current experiment history, relevant product/revenue decisions, analytics capability, and repository evidence.
2. State the hypothesis, primary metric, source, guardrails, baseline or explicit unknown, audience, duration/stop rule, and decision rule before execution.
3. Prefer a safe bounded experiment when uncertainty is high and a full rollout is not justified.
4. Do not enter `approved` or `running` for a user-affecting, financial, marketing, or external-account experiment without explicit project-owner approval.
5. Never fabricate targets, baselines, conversion rates, market numbers, or results.
6. A completed experiment needs evidence and one conclusion: `keep`, `iterate`, `stop`, or `inconclusive`.
7. Record the event with `npm run experiment:record -- <event.json>` and rerun `npm run project-memory:review`.
8. Feed reusable outcomes into controlled learning only after evidence is stable.
