---
description: Run Qarğa agent-system health checks and summarize core failures, readiness gaps, optional integrations, and the safest next remediation.
---

Run `npm run system:health`, inspect the generated `.claude/ops/system-health.json`, and summarize the result. If a core check fails, do not call the system healthy. Distinguish CORE FAILURE from OPTIONAL/NOT CONFIGURED. Recommend the smallest remediation and route it through the normal system-evolution process if it changes persistent behavior.
