# Source Basis

Qarğa's Claude operating system combines four evidence layers:

1. Qarğa's actual React/TypeScript/Vite + Node/SQLite repository, marketplace model, owner decisions, and project-specific safety constraints;
2. current Claude Code project-agent, skill, command, settings, permissions, hooks, and Agent Team mechanics;
3. selectively adapted engineering/governance patterns from Everything Claude Code (ECC);
4. selectively adapted patterns from the uploaded `claude-code-templates` reference library, including completion contracts, anti-spin loops, builder/reviewer separation, human approval gates, lifecycle telemetry, component research/improve/review separation, security hooks, E2E/observability/automation patterns, and health/operations concepts.
5. selectively adapted patterns from the uploaded `EvoSkill` reference library, including failure-driven skill research, existing-skill-first improvement, independent evaluation, diagnostic/validation/hidden-holdout separation, rejected-attempt history, frontier candidates, anti-overfitting, and progressive-disclosure skill authoring. EvoSkill's OpenCode-specific generator and git-branch evolution mechanism were intentionally not copied.

External repositories are reference material, not runtime authority. The full external systems are intentionally not installed. Every adopted concept is rewritten for Qarğa, minimized, permission-scoped, validated, and placed behind existing owner/governance rules.

See:

- `docs/ECC-ADAPTATION.md`
- `docs/REFERENCE-ADAPTATION-CLAUDE-CODE-TEMPLATES.md`
- `docs/SYSTEM-EVOLUTION-PIPELINE.md`
- `docs/TASK-CONTRACT-SYSTEM.md`

Project memory preserves approved Decisions, Technical Debt, and measured Experiments. Controlled learning decides whether repeated evidence should change the operating system. Neither memory nor external templates may silently become permanent rules.
