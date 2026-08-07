---
name: qarga-load-testing
description: Plan and run safe k6-style Qarğa load tests against approved non-production targets, using explicit thresholds, bounded traffic, and protection against accidental production stress.
---

# Qarğa Load Testing

Load testing is manual/approved until a dedicated safe environment exists. Never target production by default. Require an explicit BASE_URL, traffic budget, duration, endpoints, data assumptions, and stop criteria.

Prioritize search/course detail, registration, auth, and future payment callbacks according to risk. Record latency, error rate, throughput, resource signals if available, and failure threshold. A load test proves only the tested scenario and environment. Do not extrapolate unsupported capacity claims.
