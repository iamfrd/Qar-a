---
name: qarga-completion-contract
description: Define what done means and the exact evidence for every requirement before implementation starts; a task cannot be accepted without verified evidence for the contract.
---

# Qarğa Completion Contract

Use this skill for every delegated deliverable. Fast-lane tasks may use a short contract; Standard and Critical lanes require a complete contract.

Before work begins define: task ID, title, lane, 1–10 base points, owner agent, independent reviewer, allowed files, forbidden files, approval gates, rollback/escape condition, and numbered requirements. Each requirement must name concrete evidence such as a test, command output, diff, browser trace, API response, screenshot review, or recorded owner decision.

Record the contract before implementation. Do not change scope, acceptance criteria, or required evidence after results are known merely to make the task pass. Material amendments require an explicit reason and the approval defined by task policy.

A requirement is complete only after an evidence event has been recorded and independently verified when required. No evidence means NOT PROVEN, not pass. Close the contract as accepted, partial, or rejected only after `npm run task:review` reports the current state.
