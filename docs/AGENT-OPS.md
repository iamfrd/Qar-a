# Qarğa Agent Operations

`npm run agent-ops:report` generates `.claude/ops/agent-ops.json` and `docs/agent-ops/dashboard.html` from local lifecycle metadata, Work OS assignments, completion contracts, performance scorecards, project memory, and system evolution.

The dashboard now includes each agent's current Work OS workload by READY / IN PROGRESS / REVIEW / BLOCKED state, plus role-specific quality and recent improvement areas. This gives the project owner a practical team-capacity view without turning unrelated roles into a raw points competition.

The dashboard is operational evidence, not a zero-sum leaderboard. Do not compare unrelated roles by raw task count, runtime, or total points. Quality comes from completion-contract evidence and independent reviews. Lifecycle telemetry intentionally excludes prompts, tool inputs/outputs, user content, secrets, and personal data.
