---
description: Run a read-only multi-agent audit for Qarğa
argument-hint: [entire repository or a specific scope]
---

Audit the `$ARGUMENTS` scope without changing any source file.

1. Inspect the current Git state and recent commits.
2. Run `qarga-architect`, `qarga-qa-auditor`, `qarga-ui-auditor`, and `security-auditor` in parallel for the appropriate areas. Add `qarga-product-manager` when product scope is unclear.
3. Require severity, evidence, file/line, user and business impact, a concrete fix, and acceptance criteria for every finding.
4. Merge duplicate findings; if agents disagree, show the disagreement explicitly.
5. Present the result as a P0/P1/P2 backlog. Never present estimates as measured facts.
6. If tests were run during the audit, report the real result; otherwise state that they were not run.

This command is read-only. Start a separate `/qarga-feature` workflow to implement fixes.
