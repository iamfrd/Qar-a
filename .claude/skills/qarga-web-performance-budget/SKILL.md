---
name: qarga-web-performance-budget
description: Establish and enforce Qarğa web performance budgets only after measured baselines/approved targets exist; report bundle and UX performance regressions without inventing thresholds.
---

# Qarğa Web Performance Budget

Use `.claude/performance/web-budget.json`. The package may measure built asset sizes, but thresholds remain null until a baseline and project-owner-approved target exist. Never invent a bundle-size or Core Web Vitals target simply to create a gate.

Track relevant dimensions such as total JavaScript, largest entry chunks, route-level lazy loading, image/font payload, and measured LCP/INP/CLS when real browser telemetry exists. Once a threshold is approved, CI may warn or block according to policy. Performance changes must not sacrifice correctness, accessibility, or security merely to hit a number.
