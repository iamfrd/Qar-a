# Agent Performance Records

Store task evaluation JSON files in this directory. Start from `EVALUATION-TEMPLATE.json`.

Record an evaluation:

```bash
npm run performance:record -- docs/agent-performance/EVALUATION-TASK-ID.json
```

The command validates the agent, reviewer, 1–10 base points, quality dimensions, evidence, and duplicate task records. It appends to the ledger and recalculates the role scorecard.

The ledger and scorecards are evidence and routing aids, not a public leaderboard. Do not edit them manually.
