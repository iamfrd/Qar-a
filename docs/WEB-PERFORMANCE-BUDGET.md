# Qarğa Web Performance Budget

`npm run web:budget` measures built JavaScript assets against `.claude/performance/web-budget.json`. Thresholds are intentionally null until a measured baseline and approved target exist. Null targets report NOT_CONFIGURED and never create a fake pass/fail gate.

Future real-user/browser metrics such as LCP, INP, and CLS should come from an approved measurement source, not invented values.
