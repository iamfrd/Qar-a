---
name: qarga-sandbox-autonomy
description: Design future autonomous Qarğa coding workers around disposable isolated sandboxes, minimum credentials, bounded budgets, Draft PR output, and explicit kill switches.
---

# Qarğa Sandboxed Autonomy

Recurring coding agents must not work directly in production or a privileged developer machine. Preferred architecture: trigger → disposable sandbox → clone approved repository/branch → bounded task contract → implementation/tests/review → Draft PR/artifacts → destroy sandbox.

Require before enabling: project-owner approval, budget and time caps, minimum GitHub permissions, no production secrets, network policy, dependency-install policy, audit logs, kill switch, failure notification, branch protection, no auto-merge, no auto-deploy, and a tested rollback/disable path.

Payment, pricing, refund, legal, authentication/permissions, destructive database changes, production deployment, and external-account writes remain human-gated even inside a sandbox.
