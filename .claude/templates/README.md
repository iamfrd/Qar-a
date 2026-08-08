# Record-command payload templates

Ready-to-copy payloads for the append-only record commands. Copy a file, replace every
`REPLACE_` value, then run the matching command. Every field present here is required by
the validating script; optional fields are marked in comments in this README, not in the
JSON, because the JSON must stay parseable.

| Command | Template |
|---|---|
| `npm run decision:record -- <file>` | `decision.json` |
| `npm run debt:record -- <file>` | `technical-debt.json` |
| `npm run experiment:record -- <file>` | `experiment.json` |
| `npm run learning:record -- <file>` | `learning-observation.json` |
| `npm run evolution:record -- research <file>` | `evolution-research.json` |
| `npm run evolution:record -- proposal <file>` | `evolution-proposal.json` |

## Rules the scripts enforce, learned the hard way

- Every ledger is append-only. A second `created` event for the same id is rejected;
  append a lifecycle event instead.
- `sensitiveDataIncluded` must be present and explicitly `false`.
- Ids must carry their prefix: `DEC-`, `DEBT-`, `EXP-`.
- An `approved` decision additionally requires `chosenOption`, `rationale`,
  `approvedBy: project-owner`, and a `reviewTrigger` object with `type` and `value`.
- Debt with severity `high` or `critical` set to `accepted-risk` requires
  `approvedBy: project-owner`.
- An experiment at status `approved` or `running` requires `approvedBy: project-owner`
  and a `reviewTrigger`. A measured `baseline.value` requires `baseline.source`.
- Learning `category` must be one of: success-pattern, defect-pattern, routing-error,
  handoff-gap, verification-gap, prompt-gap, skill-gap, tooling-gap, scope-gap,
  safety-signal.
- Learning evidence `type` must be one of: test-output, diff, review-finding, incident,
  task-evaluation, user-acceptance, repeated-handoff, measured-outcome.
  There is no `success-pattern` evidence type; that word is a category, not a type.
- Evolution research requires `rootCauseHypotheses` (an array), plus `rollback` and
  `pilotPlan`. A field named `rootCause` is not accepted.
- Evolution review must be recorded by `qarga-system-reviewer`. A specialist review by
  `security-auditor` is a separate required gate and cannot substitute for it.
- Work OS `create-task` accepts no `chore` type; omit `--type` to take the default.
- A Work OS subtask at 5 or more base points requires at least two acceptance criteria.

## Internal-file language rule

Everything under `.claude/` is English-only apart from approved product names. Do not paste
Azerbaijani UI copy or Azerbaijani test titles into a ledger payload; describe them in
English and cite the file and line instead.
