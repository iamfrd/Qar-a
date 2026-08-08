---
name: qarga-product-analytics
description: Design decision-driven Qarğa analytics events, funnel definitions, metric sources, experiment instrumentation, and data-quality rules without inventing baselines or collecting unnecessary personal data.
---

# Qarğa Product Analytics

Track data because it answers a decision, not because it is available. Use `.claude/analytics/event-contract.json` as the planning contract.

For each event define owner, trigger, required properties, forbidden sensitive properties, source of truth, downstream decision, and validation method. Core marketplace journey should be measurable across search, course/provider discovery, registration, payment, refund, and support without duplicating server truth.

Never invent baseline, conversion, revenue, retention, or cohort figures. Mark unknown values as unknown until instrumentation produces evidence. New analytics collection must respect privacy, minimization, consent/legal requirements, and data-retention decisions.
