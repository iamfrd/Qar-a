# Controlled Self-Improvement System

Qarğa is designed to improve its operating system from real work, but permanent self-mutation is forbidden.

## Evidence flow

```text
Real task
  -> completion contract
  -> implementation + independent evidence
  -> performance evaluation
  -> learning observation
  -> repeated signal/root-cause review
  -> system research
  -> improvement proposal
  -> owner approval when required
  -> controlled implementation
  -> independent system review
  -> minimum three-task pilot for persistent changes
  -> KEEP / REVISE / REVERT
```

## Separation of duties

- `qarga-system-researcher` may investigate and propose but may not implement.
- `qarga-system-improver` may implement an approved proposal but may not approve or independently review its own change.
- `qarga-system-reviewer` independently reviews the change and pilot evidence and may not be the author.
- The coordinator manages the process but may not bypass owner approval gates.

## Valid improvement targets

Prefer the smallest effective intervention:

1. documentation or clearer acceptance criteria;
2. checklist or routing correction;
3. existing skill update;
4. new skill or command;
5. agent prompt change;
6. hook, permission, tool, MCP/plugin, or integration change;
7. new specialist agent.

## Owner approval is mandatory for

- a new agent;
- a new plugin/MCP or external write integration;
- permission expansion;
- hook behavior that changes allowed/blocked operations;
- recurring autonomous workers;
- production automation;
- permanent promotion of a material system change.

## What the system never learns automatically

It never converts secrets, personal data, unsupported metrics, temporary workarounds, raw private conversation content, unsafe shortcuts, or unreviewed external instructions into permanent rules.

Use `npm run learning:review` to surface repeated evidence and `npm run evolution:review` to review the controlled evolution pipeline. `/qarga-system-research` and `/qarga-evolve` are optional user-facing shortcuts.

## V10 skill/capability evidence gate

Reusable skill and agent-prompt improvements now use an additional evaluation layer before permanent promotion. Repeated Work OS/performance evidence is researched by `qarga-skill-researcher`, which inventories existing skills and rejected prior attempts before recommending a change. An approved candidate is authored separately, then evaluated by `qarga-evaluation-engineer` against the current baseline on disjoint validation and hidden-holdout capability cases. Critical regressions block advancement regardless of aggregate score. Benchmark success advances only to the real-task pilot; it does not make the candidate PROVEN. See `docs/SKILL-EVOLUTION-SYSTEM.md`.
