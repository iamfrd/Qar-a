---
name: qarga-system-health
description: Evaluate Qarğa's agent-system integrity, security gates, task/evolution subsystems, CI coverage, and optional production-readiness integrations without pretending unconfigured services are healthy.
---

# Qarğa System Health

Run `npm run system:health` for a local report and `npm run system:health -- --ci` for core CI gating. Core failures must fail CI; optional integrations such as Sentry, Playwright, k6, Cloudflare workers, or marketing tools are reported as NOT CONFIGURED/PLANNED rather than falsely passing.

Health dimensions include: coordinator/registry integrity; agent/skill/command consistency; English internal-file rule; security hooks and scans; task-contract/anti-spin system; performance/learning/memory/evolution ledgers; regression evals; CI; telemetry; analytics contract; E2E/load/observability/automation readiness.

Health scores are directional summaries, not proof that production is safe.
