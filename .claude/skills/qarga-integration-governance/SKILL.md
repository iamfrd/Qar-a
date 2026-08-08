---
name: qarga-integration-governance
description: Evaluate and govern Qarğa MCPs, plugins, APIs, monitoring, browser tools, payment tools, and external services using necessity, permissions, secrets, cost, maintenance, and rollback criteria.
---

# Qarğa Integration Governance

Before adding an MCP/plugin/API/service, prove a real capability gap that cannot be solved safely with the current repository and tools. Evaluate data accessed, read/write scope, credentials, network destinations, recurring cost, rate limits, maintenance, vendor lock-in, failure mode, auditability, and uninstall/rollback.

Use `.claude/integrations/catalog.json` as the registry. Statuses are candidate, approved-not-configured, configured-read-only, configured-write, deprecated, or rejected. No credential belongs in the catalog.

GitHub, Playwright/browser automation, Sentry/monitoring, Context7/documentation, future payment providers, and marketing/analytics tools each require separate approval. Write permissions require a stronger justification than read permissions.
