---
description: Run Qarğa's deterministic agent-config and secret-safety scans without modifying files or installing external security packages.
---

Run `npm run security:claude`. If staged files exist, also run `npm run security:secrets`. Report findings by severity and exact file. Do not print any detected secret value. External scanners such as AgentShield or SkillSpector remain optional and require approved, pinned setup.
