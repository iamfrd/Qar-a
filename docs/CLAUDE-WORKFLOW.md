# Using the Qarğa Claude Agent System

## Start

Open Claude Code in the Qarğa repository. Project settings select `qarga-coordinator` as the default agent.

```bash
cd Qar-a
claude
```

The owner normally describes the goal in natural language. Naming agents, skills, or commands is optional.

## Coordinator workflow

For material work the coordinator should:

1. inspect the current repository, diff, relevant project memory, and capability registry;
2. review the persistent Work OS queue, blockers, owner decisions, and dependency state;
3. classify the work as Fast, Standard, or Critical lane;
4. create one parent Work OS task for delegated/multi-step work and decompose it into independently reviewed subtasks;
5. create the linked completion contract before each subtask begins;
6. challenge material assumptions and surface only real owner decisions;
7. delegate to the smallest suitable specialist set with explicit task/subtask IDs;
8. enforce dependencies, anti-spin limits, and file ownership;
9. require real tests/evidence and independent review;
10. close the contract only when acceptance evidence is complete, then let Work OS derive Done and KPI rollups;
11. record performance and durable decision/debt/experiment data where justified;
12. create learning evidence only for reusable patterns and use Work OS review signals as research inputs;
13. trigger system research when repeated evidence suggests the operating system should improve;
14. return one synthesized Azerbaijani owner report.

## Optional commands

Core delivery:

- `/qarga-feature`
- `/qarga-audit`
- `/qarga-team`
- `/qarga-quality-gate`
- `/qarga-release-check`
- `/qarga-checkpoint`

Work OS:

- `/qarga-board`
- `/qarga-task-create`
- `/qarga-my-work`
- `/qarga-work-review`

Governance and learning:

- `/qarga-performance-review`
- `/qarga-team-review`
- `/qarga-system-research`
- `/qarga-evolve`
- `/qarga-system-eval`
- `/qarga-hire-agent`
- `/qarga-decision`
- `/qarga-debt`
- `/qarga-experiment`
- `/qarga-memory-review`

Operations/readiness:

- `/qarga-system-health`
- `/qarga-agent-ops`
- `/qarga-security-scan`
- `/qarga-production-error`
- `/qarga-ticket-to-pr`
- `/qarga-load-test`
- `/qarga-seo-review`
- `/qarga-analytics-plan`
- `/qarga-integrations-review`
- `/qarga-performance-budget`

## Persistent Work OS

For delegated or multi-step work, the coordinator uses `.claude/work-os/` as the durable operational queue. Parent tasks can have many participants, while every executable subtask has one primary agent, one independent reviewer, a 1–10 point contract, dependencies, and evidence requirements. Specialists cannot self-assign or self-close.

Useful commands:

```bash
npm run work-os:summary
npm run work-os:validate
npm run work-os:review
npm run work-os:serve
```

The visual board is available locally at `http://127.0.0.1:4177` while the server is running. It is internal-only by default.

## Workflow lanes

- **Fast:** focused, low-risk work; minimal evidence appropriate to the change.
- **Standard:** multi-file or moderate-risk work; completion contract, verification, and independent QA.
- **Critical:** payment, auth, PII, migration, legal, production, or material business risk; contract, explicit gates, specialist review, and owner approval where required.

## Optional integration readiness

Playwright, k6, Sentry/observability, external analytics, Cloudflare Workers, MCP/plugins, autonomous GitHub writes, and real performance thresholds are not enabled merely because scaffolds exist. The coordinator must check `.claude/integrations/catalog.json`, owner approval, credentials, dependency implications, and the current repository before enabling them.
