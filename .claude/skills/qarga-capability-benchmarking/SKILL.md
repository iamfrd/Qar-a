---
name: qarga-capability-benchmarking
description: Design and evaluate Qarğa agent capability benchmarks with disjoint diagnostic, validation, and hidden-holdout sets; objective rubrics; baseline-vs-candidate comparison; category regression gates; critical-case protection; and comparable cost/runtime evidence. Use when measuring whether a skill, prompt, routing, or workflow change actually improves an agent.
---

# Capability Benchmarking

Define the capability and protected categories before seeing candidate results.

Use three disjoint case sets:

1. **Diagnostic/train** — identify failure classes and guide research. Candidate authors may know these cases.
2. **Validation** — compare iterations during development. Do not copy exact answers into the candidate.
3. **Hidden holdout** — final generalization check. Keep expected answers and scoring details from the candidate author.

Each case needs: ID, category, scenario, allowed context/tools, objective requirements, critical-failure conditions, scoring rubric, and provenance. For risky domains include negative cases and unsafe tempting alternatives.

Compare baseline and candidate under materially equivalent model/tool/context/budget conditions. Report aggregate score, category scores, critical failures, retries/rework, duration, token/cost data when available, and reviewer findings.

A higher average is insufficient if a critical case fails or a protected capability regresses beyond policy tolerance. Use `.claude/skill-evolution/policy.json` promotion gates.
