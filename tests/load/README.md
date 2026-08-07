# Qarğa Load Testing

This is a safe starter template for k6. k6 is not installed by the package and load tests are never run in normal CI.

Run only against an explicitly approved non-production target:

```bash
BASE_URL=http://localhost:5173 k6 run tests/load/qarga-smoke.js
```

Before higher traffic, define the traffic budget, duration, stop thresholds, data setup, target endpoints, and owner approval. Never infer production capacity from a single local test.
