---
name: qarga-independent-review
description: Review Qarğa work from a fresh context so the implementer is not the final judge of correctness, safety, or completeness.
---

# Qarğa Independent Review

Use this skill after non-trivial implementation, before a milestone is marked complete, and whenever evidence is disputed.

## Independence rules

- The reviewer must not be the primary implementation agent.
- Give the reviewer the original requirement, acceptance criteria, changed-file list, and verification output—not the implementer's conclusion.
- The reviewer must inspect current files and evidence directly.
- A reviewer reports findings; it does not silently expand scope or rewrite the implementation unless assigned a separate fix task.

## Review dimensions

1. correctness and state transitions;
2. completeness against acceptance criteria;
3. regression and edge cases;
4. architecture and duplication;
5. security, privacy, and permissions;
6. UI/accessibility where relevant;
7. tests and evidence quality;
8. documentation consistency;
9. scope discipline.

## Severity

- **BLOCK** — unsafe or impossible to accept;
- **CRITICAL** — exploitable, destructive, financial, or severe data-integrity risk;
- **HIGH** — likely user-impacting defect or missing required behavior;
- **MEDIUM** — important but not release-blocking under an explicit decision;
- **LOW** — limited improvement;
- **NOTE** — observation without required action.

Every finding must include evidence, impact, and a concrete remediation. Do not inflate severity to appear thorough.

## Output

1. verdict;
2. findings ordered by severity;
3. acceptance-criteria coverage;
4. verification gaps;
5. recommended next action.
