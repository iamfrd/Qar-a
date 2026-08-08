# Session Handoff — 2026-08-08

State of play at the end of the 2026-08-08 working session, and what the next session should pick up.
Written for a reader with **no memory of this session**. Every claim below was verified against the
repository or GitHub on 2026-08-08; re-verify before acting, because branches and PRs move.

`main` is at `0720406`. Working tree clean.

---

## 1. What landed on `main`

| PR | What it did | Merged by |
|---|---|---|
| [#1](https://github.com/iamfrd/Qar-a/pull/1) | Qarğa Claude agent system V10 (Work OS, skill-evolution pipeline, 20 agents) | project owner |
| [#2](https://github.com/iamfrd/Qar-a/pull/2) | Made the agent-system config parsers CRLF-tolerant; added `.gitattributes` | project owner |
| [#3](https://github.com/iamfrd/Qar-a/pull/3) | Pinned the CI Node version so oxlint's native binding installs | project owner |

Commit `b6a1c6d` (inside #2's branch) additionally made the agent-system self-test hermetic and added
CRLF regression coverage.

### Why #2 and #3 mattered

`npm run validate:claude` was reporting **752 errors** and `npm run skill:audit` **42 errors** on the
owner's Windows machine, while CI stayed green. Root cause: `core.autocrlf=true` on Windows plus no
`.gitattributes` meant files landed on disk with CRLF, and three parsers searched for the LF-only
frontmatter delimiter `\n---\n`:

- `scripts/validate-claude-config.mjs`
- `scripts/audit-skill-structure.mjs`
- `scripts/scan-agent-config-security.mjs`

The third was the serious one: its frontmatter match never fired on CRLF, so the security scanner was
silently scanning **entire file bodies** instead of only frontmatter. It still exited 0, which is why
nothing looked wrong.

**Standing lesson: CI runs `ubuntu-latest` only, and the owner develops on Windows.** This is a
structural blind spot, not a one-off. Any check that depends on file bytes, line endings, path
separators, or case sensitivity can pass CI and fail locally. Run the gates locally on Windows before
declaring a system-level change verified.

---

## 2. Open pull requests — all drafts, none merged

**These four PRs contain finished, independently reviewed work. They are the top of the queue.**

### The QW-0004 chain is stacked — merge in order

`#4` → `#5` → `#6`. Each branch was cut from the previous one, so #5 contains #4's commit and #6
contains both. Merging out of order, or merging #6 alone, will pull in the others' changes under the
wrong PR title. Merge #4 first, then #5, then #6 — or rebase them onto `main` individually first.

| PR | Branch | Scope |
|---|---|---|
| [#4](https://github.com/iamfrd/Qar-a/pull/4) | `feat/qw-0004-s01-sponsored-map-label` | Labels sponsored offerings on the map |
| [#5](https://github.com/iamfrd/Qar-a/pull/5) | `feat/qw-0004-s02-price-arithmetic-tests` | Pins registration price arithmetic in tests; escalates two money decisions |
| [#6](https://github.com/iamfrd/Qar-a/pull/6) | `fix/qw-0004-s03-lelek-illusion` | Removes the client-only spendable Lələk balance |
| [#7](https://github.com/iamfrd/Qar-a/pull/7) | `docs/qw-0002-revenue-model-options` | Revenue model option matrix (documentation only) |

#7 is independent of the chain and can merge at any time.

### What #4 fixed

`src/lib/api.ts:93` requires sponsored placement to carry a visible label. The list view complied; the
map did not — sponsored pins got a larger icon, a gold border, and cluster priority with no disclosure.
This was **live in production behaviour**, because the map is one of the few surfaces already wired to
the real backend. #4 labels the pin, the preview card, and the multi-course branch list using the same
wording the list view uses.

Note a disclosed scope deviation: the contract allowed only `CourseMap.tsx`, but the implementer also
added a shared `Badge.tsx` rather than duplicating markup three times. Reviewed and accepted.

### What #5 did — and deliberately did not do

Two revenue-integrity defects in `server/booking.mjs` were confirmed. **#5 does not fix either one.**
It pins the *current* behaviour with tests so that any future change is deliberate and visible, and
escalates both to the project owner, because each is a pricing decision the code is not entitled to
invent. See section 3.

### What #6 fixed

`lelek_ledger` exists in the schema, but **no server code touches it**. Meanwhile the frontend
maintained a fully functional, spendable Lələk balance in `localStorage` — students could see a
balance and apply it as a registration discount that had no server counterpart at all.

#6 removes the illusion rather than building the feature: the registration slider and the "Lələk
endirimi" line are gone, the store ignores `input.lelekUsed` so no call site can reintroduce a discount
that leaves the payable amount unchanged, and the wallet, profile, and referral screens now say the
programme is in preparation instead of implying a live balance.

**A real server-side Lələk ledger remains unbuilt.** That is a future feature, not a bug fix, and was
deliberately kept out of scope.

---

## 3. Owner decisions that block work

### QW-0004 — two money decisions, both blocking `QW-0004-S02`

Neither has been answered. The code has not guessed; current behaviour is pinned by the tests in #5.

**(A) Registration fee.** 11 of 24 offerings advertise a registration fee on the course page, but
`server/booking.mjs` records base price minus discount and never adds the fee. The student is quoted
less than they would actually owe at the centre.

- A1 — charge it: add `registration_fee_minor` to the recorded total, show it as a separate line
- A2 — stop advertising it: remove it from `CourseDetail` until a charging model exists
- A3 — keep advertising it but label it explicitly as paid separately at the centre, excluded from the quoted total

**(B) `QARGA10` funding.** A hard-coded 10% discount is applied server-side with no column recording
whether Qarğa or the provider absorbs it. Providers are therefore paid less with no captured agreement.

- B1 — Qarğa funds it: add funding attribution, settle the provider at full price
- B2 — provider funds it: record per-offering consent before the code applies the discount
- B3 — retire `QARGA10` until a funding model is agreed

### QW-0002 — revenue model decisions

See [`2026-08-08-revenue-model-options.md`](2026-08-08-revenue-model-options.md), decisions **D-01**,
**D-02**, **D-03**. No rate, price, or percentage has been approved. The recommended sequence is
Phase 0 (measure, take no money) → provider package → hybrid, but that recommendation is not a decision.

---

## 4. Known open issues

### `validate:claude` currently fails locally — Work OS board content

The gate is green on a fresh checkout and in CI, but fails on the owner's machine with:

```
ERROR: .claude/work-os/events.jsonl: contains Azerbaijani-specific characters …
ERROR: .claude/work-os/state.json:  contains Azerbaijani-specific characters …
```

Cause: agents recorded evidence quoting Azerbaijani **product UI copy** — the wallet's "programme in
preparation" notice and the course page's registration-fee label — verbatim into the board. The
English-only rule for internal files is doing what it was written to do; the conflict is that
legitimate UI-string evidence cannot currently be quoted as it appears on screen.

It does not reach CI because these files are `skip-worktree` (section 5) and the committed
`state.json` has an empty task list. `events.jsonl` is append-only by contract, so this should **not**
be hand-edited. Decide the rule first — most likely either allow quoted UI strings inside a marked
field, or require agents to paraphrase UI copy in English when recording evidence.

### Server authority — the largest outstanding technical gap

Roughly 47 files import `useAppStore` against about 5 that import `src/lib/api.ts`. Admin and provider
authority operations (`approveProvider`, `suspendUser`, `setCourseStatus`, `registerStudent`) execute
**in the browser**, and `src/store/useAppStore.ts` persists the whole store to `localStorage` without
`partialize` — users, providers, courses, registrations, balances.

This contradicts the server-authority rule in `CLAUDE.md`. The backend already does the right thing;
these screens simply are not connected to it. The owner explicitly deferred this migration during this
session — it is understood and tracked, not forgotten.

**It has a second-order effect:** any product measurement that depends on registration, login, or trial
events cannot be automated until this lands. That is why the revenue pilot in #7 is designed around
manual, offline data capture.

### Smaller items

- **Bundle size 625.81 kB**, over the 500 kB warning threshold. The web performance budget is still
  `baseline-needed`; a real budget requires an owner-approved target rather than an invented one.
- **`.claude/launch.json`** is machine-specific and gitignored by #7.

---

## 5. How to read the Work OS board

The board is the operational source of truth across sessions, but **it is local-only**. Thirteen
`.claude/` state files are marked `skip-worktree`, so `git status` stays clean even when the board has
changed. A clean working tree does **not** mean the board is unchanged.

```bash
npm run work-os:summary
git ls-files -v | grep '^S'   # the files git is deliberately ignoring changes to
```

Board state at end of session — 4 parent tasks, 26 KPI max points, 8 earned:

| Task | Status | Note |
|---|---|---|
| QW-0001 | review | CRLF gate fix — shipped in #2 |
| QW-0002 | blocked | Revenue options — waiting on D-01/D-02/D-03 |
| QW-0003 | review | Hermetic self-test — shipped in `b6a1c6d` |
| QW-0004 | needs_decision | Revenue-integrity defects — waiting on decisions A and B |

**The board lags reality.** `QW-0002-S02` still reads `waiting`, but its revision is complete and is in
#7. The coordinator agent was terminated by a session limit before it could record the closing events.
Trust the repository and GitHub over the board where they disagree, and reconcile the board early in
the next session.

Project memory (`.claude/project-memory/`) is still **empty** — no decisions, technical debt, or
experiments recorded. Section 3 and section 4 of this document are the backlog for populating it, once
the owner approves what should be written.

---

## 6. Suggested order for the next session

1. Reconcile the Work OS board with what actually shipped, then record the technical debt from section 4.
2. Merge #4 → #5 → #6 in order, and #7 whenever convenient. All are drafts; marking them ready and
   merging is the owner's call.
3. Answer QW-0004 decisions A and B — they block `QW-0004-S02`, and the fee discrepancy is visible to
   students today.
4. Decide the Work OS English-only rule so `validate:claude` is trustworthy locally again.
5. Take up either the revenue decisions (D-01…D-03) or the server-authority migration. They are
   coupled: the migration is what makes the revenue pilot measurable without manual capture.

---

## 7. Verification status

Run on `main` at `0720406` on 2026-08-08:

| Check | Result |
|---|---|
| `npm run build` | PASS |
| `npm test` | PASS (14/14) |
| `npm run lint` | PASS (warnings only) |
| `npm run test:claude-system` | PASS |
| `npm run skill:audit` | PASS |
| `npm run security:claude` | PASS |
| `npm run system:health` | PASS (100/100) |
| `npm run validate:claude` | **FAIL locally** — 2 errors, see section 4 |

The per-PR evidence for #4, #5, #6, and #7 is recorded in each PR body and in the Work OS contracts;
it is not repeated here.
