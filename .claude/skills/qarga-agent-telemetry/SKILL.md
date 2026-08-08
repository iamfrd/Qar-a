---
name: qarga-agent-telemetry
description: Use privacy-minimized lifecycle telemetry, task contracts, performance evidence, and scorecards to understand Qarğa agent activity without turning the system into a vanity leaderboard.
---

# Qarğa Agent Telemetry

Lifecycle hooks record only operational metadata needed for audit: event, timestamp, session/subagent identifiers when available, and registered agent name. Never record prompts, secrets, personal data, raw tool inputs, or user content in telemetry.

Use telemetry to answer: which agents were invoked, whether starts/stops pair correctly, where repeated rework occurs, whether a specialist is overloaded, and whether routing matches capability. Combine telemetry with the performance ledger and task contracts; never infer quality from task count or runtime alone.

`npm run agent-ops:report` generates a local report. Telemetry cannot bypass independent review or become the sole reason to promote/retire an agent.
