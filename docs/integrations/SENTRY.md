# Sentry / Production Error Monitoring

Qarğa now contains a provider-neutral observability policy and `/qarga-production-error` workflow, but this package intentionally does not install or configure Sentry credentials.

When monitoring is approved, decide frontend/backend SDK scope, environment naming, release/version tagging, PII scrubbing, sampling, alert ownership, retention, and budget. Store DSN/auth tokens outside git. Production errors may trigger investigation and a Draft PR; they must never trigger automatic merge, deploy, refund, or data mutation.
