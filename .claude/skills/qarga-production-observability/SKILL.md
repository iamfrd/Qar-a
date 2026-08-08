---
name: qarga-production-observability
description: Design Qarğa error monitoring, structured logs, health checks, alert routing, incident triage, and Sentry-style production-error workflows while keeping external services opt-in and credential-safe.
---

# Qarğa Production Observability

Define what must be observable before public launch: frontend crashes, backend exceptions, failed payment/refund operations, notification/job failures, slow endpoints, health checks, deployment version, and backup/restore status.

External providers such as Sentry are optional until explicitly approved and configured. Never invent a DSN or credential. Alerts must map to severity, owner, customer impact, escalation, and runbook. A production error may create an investigation or draft PR workflow, but never auto-merge, auto-deploy, or perform financial remediation without human approval.
