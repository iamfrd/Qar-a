# Agent Registry

The machine-readable source of truth is `.claude/capability-registry.json`. Do not maintain a second independent roster by hand.

## Active organization

| Agent | Primary responsibility |
|---|---|
| `qarga-coordinator` | Owner-facing technical-product orchestration, challenge, routing, evidence synthesis, team/system governance |
| `qarga-product-manager` | Product requirements, prioritization, user value, acceptance criteria |
| `qarga-revenue-strategist` | Marketplace monetization, commission/value metric research, revenue-model pilots |
| `qarga-architect` | Architecture boundaries, ADRs, migrations, technical trade-offs |
| `qarga-frontend-engineer` | React/TypeScript UI implementation |
| `qarga-backend-engineer` | Node/SQLite APIs, domain rules, authorization, transactions |
| `qarga-integration-engineer` | Frontend-to-real-API migration and integration consistency |
| `qarga-test-automator` | Integration/regression/E2E test automation |
| `qarga-qa-auditor` | Independent code/behavior review and release findings |
| `qarga-ui-auditor` | Read-only UX, responsive, interaction, and accessibility audit |
| `security-auditor` | Application security, auth, payment, PII, abuse-risk review |
| `qarga-devops-engineer` | CI/CD, runtime, backup, deployment, rollback, platform readiness |
| `payment-integration` | Payment-provider implementation, idempotency, refunds, reconciliation |
| `legal-advisor` | Draft legal/contract wording for qualified human legal review |
| `qarga-system-researcher` | Read-only research for improving the Claude operating system |
| `qarga-system-improver` | Implements only approved agent-system changes |
| `qarga-system-reviewer` | Independently reviews agent-system changes and pilot evidence |
| `qarga-customer-support-strategist` | Support taxonomy, escalation, knowledge base, service metrics, payment/refund handoffs |
| `qarga-skill-researcher` | Read-only failure-driven skill/capability research, existing-skill inventory, anti-overfitting and benchmark planning |
| `qarga-evaluation-engineer` | Independent capability benchmarks, validation/holdout evaluation, rubric design and regression detection |

## Shared governance

Every active agent preloads the shared performance, controlled-learning, project-memory, and Work OS governance skills. Skill-evolution roles additionally use independent benchmark and anti-overfitting governance. Additional role-specific skills are declared in the capability registry and agent frontmatter.

The coordinator must read the registry before material delegation or team review. A new role is not active merely because a Markdown file exists: registry membership, coordinator allowlist, validation, scorecard initialization, and a new Claude session are required.

## Future-role candidates

Current candidates are `qarga-data-analyst`, `qarga-growth-strategist`, `qarga-provider-success-manager`, `qarga-observability-engineer`, and `qarga-seo-strategist`. They are not active employees. The coordinator may propose them only when their registry trigger is supported by repeated project evidence and simpler alternatives are insufficient.
