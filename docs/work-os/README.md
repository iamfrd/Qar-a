# Work OS generated artifacts

This directory stores generated snapshots for human review and GitHub history.

Run:

```bash
npm run work-os:export
```

The live operational source of truth is `.claude/work-os/state.json`; the append-only history is `.claude/work-os/events.jsonl`.
