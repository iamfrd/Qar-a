---
name: qarga-context-budgeting
description: Keep Qarğa agent context focused by loading only task-relevant decisions, debt, experiments, files, skills, and evidence, using checkpoints instead of repeatedly carrying raw conversation history.
---

# Qarğa Context Budgeting

More context is not automatically better. For each task load the smallest set needed: current objective/contract, relevant repository files, current approved decisions, related debt/experiments, required agent skills, and latest evidence. Do not preload unrelated agent catalogs, old raw subagent output, full telemetry, or every project-memory record.

Use durable checkpoints and IDs rather than copying large prior conversations. Summarize references while preserving source IDs/paths. If context becomes uncertain, re-read the repository or authoritative ledger instead of relying on compressed memory. Context optimization may reduce token cost but may never omit a material approval, invariant, blocker, or security requirement.
