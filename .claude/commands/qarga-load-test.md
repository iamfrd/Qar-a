---
description: Plan or run a bounded Qarğa k6 smoke/load test against an explicitly approved non-production target.
---

Apply `qarga-load-testing`. Confirm target environment, BASE_URL, traffic budget, duration, endpoints, data setup, and stop thresholds before running any load. Never target production by default. Use `tests/load/qarga-smoke.js` as the initial safe template and report measured results only.
