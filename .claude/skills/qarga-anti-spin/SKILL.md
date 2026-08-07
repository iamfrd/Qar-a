---
name: qarga-anti-spin
description: Prevent repeated or flip-flopping approaches, fake progress, test weakening, and unbounded agent loops; stop and escalate when measurable progress does not converge.
---

# Qarğa Anti-Spin Guard

For non-trivial implementation or investigation, record each meaningful attempt with an approach key, what changed, measurable progress, evidence, and blocker. Review the task after every material iteration.

Stop and escalate instead of consuming more tokens when any policy guard trips: repeated approach without new evidence, consecutive no-progress attempts, A→B→A flip-flop, maximum iteration/review budget, scope expansion without approval, or an attempt to weaken the completion contract/tests.

Do not treat verbosity, changed wording, or more files as progress. Progress means a measurable requirement moved closer to verified completion. When stopped, summarize approaches tried, evidence, blocker, what information would unblock work, and the smallest next decision required from the coordinator or project owner.
