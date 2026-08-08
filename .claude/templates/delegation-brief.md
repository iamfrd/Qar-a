# Delegation brief template

Coordinate-first format. Under evaluation as EXP-0001; baseline is 47.4 tool calls per
agent run measured over twelve runs. Replace every `REPLACE_` value. Delete sections that
genuinely do not apply rather than leaving them empty.

---

## Task
Work OS subtask REPLACE_QW-0000-S00, parent REPLACE_QW-0000. Lane REPLACE_. Base points REPLACE_.
Reviewer: REPLACE_agent. You may not self-review, self-score, or mark yourself DONE.

Read CLAUDE.md first. Load these project skills before starting: REPLACE_skill names.

## Verified coordinates — do not re-derive these
The coordinator verified each of the following directly. Confirm each one still matches
before you edit it, then go straight to the change. Do not re-inventory the repository.

- REPLACE_path:line — what is there and why it matters
- REPLACE_path:line — what is there and why it matters

If any coordinate does not match what you find, STOP and report the mismatch. Do not
silently work around it; a stale coordinate is a coordinator error worth catching.

## What must be true when you are done
1. REPLACE_observable outcome, not an implementation instruction
2. REPLACE_observable outcome

## Files you MAY change
REPLACE_explicit list

## Files you MUST NOT change
REPLACE_explicit list, including files other agents currently own

## Mandatory before you submit
- **Consumer check.** For everything you delete, rename, or change the shape of, list every
  caller, importer, reader and subscriber you found, and state what happens to each. Say
  which search you ran. A green build does not prove this; a data-flow gap is not a type error.
- **Claim labels.** Label every claim in your report as one of:
  `[verified: <command>]` with the real output, `[derived from code: <file:line>]`, or
  `[not verified]`. An unlabelled claim will be treated as not verified.
- **Full file list.** Report every file you touched, including incidental ones. An
  undisclosed change is a finding even when its content is harmless.

## Invariants
REPLACE_server authority, payment state, idempotency, permissions, no new dependency

## Evidence required
- REQ-1: REPLACE_
- REQ-2: REPLACE_
Report any command that did not run as NOT RUN. Never claim a command passed without
pasting its real output.

## Git safety
Do not run stash, checkout, switch, restore, reset, clean, worktree, add, commit or push.
Uncommitted work from other subtasks is present in the tree. Always use absolute paths; if
you `cd`, return to the repository root in the same command.

## Anti-spin budget
Maximum REPLACE_3 material iterations. If the same approach fails twice, STOP and report
options rather than weakening the requirement or the tests.
