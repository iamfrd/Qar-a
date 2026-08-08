---
name: qarga-controlled-learning
description: Turn repeated, evidence-backed Qarğa successes and failures into owner-approved prompt, skill, workflow, or agent improvements without autonomous rule mutation.
---

# Qarğa Controlled Learning

This skill makes the system continuously improve while preventing unverified behavior from becoming permanent policy.

## Skill-evolution routing

When repeated evidence suggests a reusable capability gap, do not directly rewrite the agent or skill. Route the signal to `qarga-skill-researcher`, preserve the evidence and failed prior attempts, and require the skill-evolution benchmark/pilot path before permanent promotion. A successful repeated workflow may also become a skill candidate, but only after the same generalization and independent evaluation gates.

## What may become a learning observation

Record an observation only when it is supported by a completed task, review, incident, test result, or repeated handoff problem. Examples:

- the same defect category appears more than once;
- a workflow consistently prevents rework;
- an agent lacks a repeatable checklist;
- repository research repeatedly finds the same hidden dependency;
- a verification gate is skipped or ineffective;
- a task was routed to the wrong role;
- a prompt or skill caused measurable confusion;
- a successful task-local harness is reused.
- Work OS review shows the same blocker or rework pattern in at least two independent tasks;
- dependency structure repeatedly creates the same avoidable bottleneck.

Do not record opinions, one-off preferences, unsupported claims, or private data.

## Learning lifecycle

1. **Observe** — create a structured observation with evidence and affected capability.
2. **Aggregate** — use `npm run learning:review` and `npm run work-os:review` to group recurring signals from evidence and operational history.
3. **Diagnose** — distinguish agent, prompt, skill, routing, context, tool, test, and scope causes.
4. **Propose** — choose the smallest reversible improvement: documentation, checklist, skill, prompt update, command, hook, integration, or new agent.
5. **Review** — require QA/security review when the proposal affects execution, permissions, hooks, or external tools.
6. **Approve** — obtain explicit project-owner approval for persistent behavior changes, new agents, plugins, permissions, or automation.
7. **Promote** — update the source files, capability registry, validator, and documentation.
8. **Evaluate** — test the change across the next three relevant tasks and compare evidence.
9. **Keep or revert** — retain only improvements that produce a measurable benefit without new risk.

## Confidence levels

- **candidate** — one credible observation;
- **repeated** — at least two independent observations;
- **validated** — improvement succeeded in at least three relevant tasks;
- **retired** — contradicted, obsolete, harmful, or superseded.

Confidence is evidence quality, not popularity.

## Safety boundaries

- No agent may silently rewrite its own prompt, permissions, hooks, or scorecard.
- Learned guidance never overrides `CLAUDE.md`, security rules, human approval, current code, or official documentation.
- Project-specific learning stays inside the Qarğa repository.
- Never learn secrets, personal data, raw private conversations, unsupported market figures, or accidental workarounds.
- A proposal receives no performance points until approved and delivered as a separate measurable task.

## Commands and files

```bash
npm run learning:record -- docs/learning/OBSERVATION-TASK-ID.json
npm run learning:review
```

Storage:

- `.claude/learning/observations.jsonl` — append-only evidence;
- `.claude/learning/review.json` — generated aggregate signals;
- `.claude/learning/proposals.json` — owner-reviewed improvement proposals.
