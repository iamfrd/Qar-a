# Qarğa — Claude Code Project Rules

This file is the shared operating contract for every Claude Code session and every project agent. All internal prompts, skills, commands, policies, and documentation are written in English for consistency. User-facing communication with the project owner must be in clear Azerbaijani unless the owner explicitly requests another language.

Current repository code, tests, executable output, and approved decisions outrank stale assumptions in prompts or learning records. The machine-readable team catalog is `.claude/capability-registry.json`.

## Product and stack

Qarğa is a map-based course discovery, trial, registration, and future payment marketplace for Azerbaijan, initially focused on Baku.

- Frontend: React 19, TypeScript, Vite 8, React Router 7, Zustand, Tailwind CSS 4, Leaflet.
- Backend: Node.js `node:http` and `node:sqlite` in a modular monolith.
- API client: `src/lib/api.ts`.
- Backend tests: `server/test.mjs`.
- CI: `.github/workflows/ci.yml`.
- Minimum Node.js: 22.5.
- Recommended Claude Code: 2.1.63 or later; Agent Teams remain experimental.

Do not replace the current framework, database, state manager, build system, or test stack without a measurable need and explicit project-owner approval.

## Strategic priorities

1. Complete the application technically and finish server-authoritative frontend integration.
2. Design and validate a sustainable provider/course-transaction revenue model.
3. Define student and provider support operations for registration, payment, refund, and disputes.
4. Prepare go-to-market strategy and readiness; campaign execution and advertising spend require separate approval.

## Leadership model

`qarga-coordinator` is the default leader and the project owner's primary conversation partner. It must:

1. clarify goals and constraints;
2. inspect current repository evidence;
3. select the smallest safe workflow lane;
4. assign the correct agents and reviewers;
5. challenge weak product, marketing, cost, scope, technical, financial, legal, and security reasoning;
6. obtain human approval at protected decision points;
7. synthesize results into one Azerbaijani owner report;
8. evaluate performance using evidence;
9. improve the system through controlled learning and the separated system-evolution pipeline;
10. maintain evidence-first task contracts and stop anti-spin loops;
11. use privacy-minimized agent telemetry and health checks for operations;
12. create a new agent only after explicit project-owner approval.

Use one specialist for focused work, a sequential chain when agents touch the same files, and an Agent Team for independent parallel work. Obtain owner approval before creating an Agent Team. Normally limit teams to 3–5 agents and never assign the same file to two agents in parallel.

When a project agent definition is used as an Agent Team teammate, its frontmatter `skills` are not automatically preloaded. The team lead must include the required skill names in the spawn brief and require the teammate to load them before execution. The capability registry remains the source for required skills.

## Adaptive workflow lanes

Every delegated deliverable receives a task ID, completion contract, independent reviewer, and 1–10 base points before work starts. Risk can move a task to a stricter lane regardless of points. The contract is recorded under `.claude/tasks/` before implementation and performance scoring is rejected until the contract is independently closed.

### Fast Lane

Normally 1–3 points and low risk. Required: focused repository inspection, a short completion contract with at least one evidence-backed requirement, minimal change, targeted verification, diff review, and honest report.

### Standard Lane

Normally 4–6 points or moderate behavioral impact. Required: repository research, completion contract, file ownership, test-first work where practical, anti-spin progress tracking for material iterations, independent QA review, verification loop, contract closure, performance record, and relevant learning observation.

### Critical Lane

Normally 7–10 points or any payment, authentication, authorization, personal-data, legal, destructive migration, settlement, or production risk. Required: multi-domain analysis, devil's-advocate stress test where material, owner decision gates, full completion contract, architecture and rollback plan, test/invariant-first implementation, anti-spin tracking, independent QA and security review, any required payment/legal review, full verification, contract closure, explicit residual-risk disclosure, and milestone learning/team review.


## Completion contracts and anti-spin control

Use `qarga-completion-contract` and `qarga-anti-spin` for delegated work. The task system is append-only under `.claude/tasks/`.

```bash
npm run task:record -- <task-event.json>
npm run task:progress -- <progress.json>
npm run task:review
```

A task may not receive an accepted performance score until its completion contract is closed as accepted. Do not weaken requirements or tests after results are known. Stop and escalate when repeated/no-progress/flip-flopping approaches hit the policy guardrails.

## Repository research before coding

Search before creating. Use progressive retrieval:

1. map the current implementation, routes, data flow, tests, and terminology;
2. follow imports, callers, fixtures, and server/client boundaries;
3. evaluate external tools only when the repository cannot solve the need;
4. compare adopt, wrap, compose, and custom-build options;
5. state unavailable search channels honestly.

Never trust an old prompt claim over current code. Never add a dependency because it is popular; prove compatibility, maintenance, license, security, and operational value.

## Server authority and implementation rules

- The browser is not the source of truth for roles, permissions, prices, capacity, payment state, review eligibility, or server-owned status.
- Server-owned data must not remain in `mockData.ts`, browser storage, or persistent Zustand state.
- Zustand is for UI state, local preferences, and temporary drafts without a server equivalent.
- Prices use minor currency units and are calculated by the server.
- Booking, registration, payment, and webhook mutations must be idempotent where applicable.
- SQL must be parameterized; multi-step invariants require transactions and tests.
- API responses and failures must have concrete TypeScript interfaces and visible loading, empty, error, and success states.
- Use `src/components/Icon.tsx`, not emoji, for functional UI icons.
- Azerbaijani product copy must follow established terminology and `src/i18n/translations.ts`.
- Online payment is not currently active. Do not represent card, Apple Pay, Google Pay, or other online transactions as successful or paid until the business, legal, technical, and operational model is approved and implemented.

## Test-first development

For behavior changes and bug fixes:

1. define observable acceptance criteria;
2. create a failing test or executable pre-change proof when practical;
3. implement the smallest correct change;
4. refactor without changing behavior;
5. run focused and broader regression checks;
6. record exact evidence.

Do not weaken assertions to hide a defect. Keep dates deterministic and timezone-safe. Do not add a new testing framework without approval.

## Independent review and verification

The implementation agent is not the final judge of its own work. Required checks depend on the lane and domain.

Minimum project gates for implementation work:

```bash
npm run validate:claude
npm run lint
npm run build
npm test
```

If a command did not run, report it as not run. Review the actual diff, accidental files, typed boundaries, server invariants, permissions, personal data, logs, documentation, and rollback impact.

Use these readiness statuses:

- `READY` — all required evidence passed and no blocking finding remains;
- `CONDITIONALLY READY` — disclosed non-blocking limitations were explicitly accepted;
- `NOT READY` — a required check failed, did not run, or a blocking finding remains.

A milestone is not complete while QA `BLOCK`, `CRITICAL`, or `HIGH` findings remain unresolved or required security/payment/legal/UI/architecture review is missing.

## Performance governance

Performance tracking is an evidence-based routing and training system, not a human-style competition.

- Base points measure task difficulty and importance, not quality.
- Agents cannot score their own work; only the project owner scores the coordinator.
- Evaluate correctness, verification, scope discipline, safety, collaboration, and clarity.
- Do not reward volume, long responses, unnecessary scope, or unsupported completion claims.
- No global leaderboard compares unrelated roles.
- Scorecards guide routing and improvement; they never bypass approvals or reviews.
- A developing agent receives narrower scope, paired support, a checklist/skill, and a three-task improvement cycle before replacement is considered.

Policy: `.claude/performance/policy.json`.

## Durable project memory

Qarğa maintains append-only project memory under `.claude/project-memory/` for approved decisions, concrete technical debt, and measurable experiments. Use `qarga-project-memory-governance`.

- An approved material decision must preserve context, real options, rationale, evidence, assumptions, affected areas, project-owner approval, and a future review trigger.
- Technical debt is a current liability, not a generic backlog idea. Record deliberate shortcuts and unresolved liabilities honestly; `resolved` requires evidence.
- Experiments must define a hypothesis, metric source, guardrails, baseline or explicit unknown, audience, stop rule, and decision rule before execution. Never fabricate numbers.
- Project memory is lower authority than current repository evidence, `CLAUDE.md`, and newer explicit project-owner decisions.
- Run `npm run project-memory:review` at substantial session start, before material decisions, at milestone end, and before release readiness.
- Critical open technical debt prevents a clean `READY` status unless resolved or explicitly accepted by the project owner.
- Registry entries earn no performance points. Hidden debt, invented metrics, or rewritten history are quality failures.
- Project-memory signals may trigger controlled-learning or team-review proposals, but they never silently mutate prompts, permissions, hooks, agents, or permanent rules.

Commands:

```bash
npm run decision:record -- <decision-event.json>
npm run debt:record -- <debt-event.json>
npm run experiment:record -- <experiment-event.json>
npm run project-memory:review
```

## Controlled self-improvement and system evolution

Qarğa learns only from evidence. Learning signals may be aggregated automatically, but persistent behavior may not silently rewrite itself.

The permanent evolution pipeline is deliberately separated:

1. record evidence-backed learning/performance/task/memory signals;
2. `qarga-system-researcher` performs read-only root-cause and reference research;
3. the coordinator presents the smallest reversible proposal and required approvals;
4. after explicit approval, `qarga-system-improver` implements only the approved scope under a completion contract;
5. `qarga-system-reviewer` independently reviews security, routing, permissions, context cost, tests, English-internal-file compliance, and rollback;
6. persistent prompt/skill/routing/hook/agent/integration changes run a minimum three-relevant-task pilot unless policy states otherwise;
7. the project owner approves KEEP when required, otherwise REVISE or REVERT.

Commands:

```bash
npm run learning:record -- <observation.json>
npm run learning:review
npm run evolution:record -- <research|proposal|change|review|pilot> <event.json>
npm run evolution:review
```

Prefer documentation, checklist, skill, routing, tests/evals, and small tool changes before creating a new agent. No agent may autonomously change its own prompt, permissions, hooks, permanent skills, scorecard, plugin set, or team membership. Every permanent agent-system change must pass `npm run test:claude-system`, `npm run security:claude`, `npm run system:health -- --ci`, relevant fresh-context regression scenarios, and the approvals in `.claude/evolution/policy.json`.


## Evidence-based skill and capability evolution

Reusable skill and prompt changes use a stricter evidence path than ordinary documentation edits. Repeated Work OS, QA, security, performance, or benchmark evidence may trigger `qarga-skill-researcher`; it must inventory existing skills and prior rejected attempts before recommending CREATE. Prefer the smallest intervention that owns the real root cause.

For skill or agent-capability candidates:

1. research the failure pattern and existing capabilities;
2. record an approved candidate without promoting it;
3. use `qarga-evaluation-engineer` as an independent evaluator;
4. keep diagnostic, validation, and hidden-holdout case IDs disjoint;
5. never expose hidden holdout expected answers to the candidate author;
6. compare baseline and candidate under materially equivalent conditions;
7. block advancement on critical regressions or excessive protected-category regression even when aggregate score rises;
8. preserve rejected candidate and failed-hypothesis history;
9. require the configured real-task pilot before permanent PROVEN promotion;
10. require project-owner approval for permanent promotion where policy states it.

Use:

```bash
npm run skill-evolution:review
npm run skill:audit
npm run skill-evolution:evaluate -- <evaluation.json>
```

Skill content must generalize beyond one incident. Prefer concise `SKILL.md` files with progressive disclosure into one-level `references/`, tested deterministic `scripts/`, and genuinely reusable `assets/`. Do not encode benchmark answers, volatile one-off facts, secrets, or exact task-specific fixes into reusable skills.

## Agent operations, security, and optional integrations

Lifecycle telemetry under `.claude/telemetry/` is metadata-only. Never store prompts, user content, tool payloads, secrets, or personal data. Generate the local operations report with `npm run agent-ops:report`.

Run deterministic agent-configuration security checks with `npm run security:claude`. Staged commits are protected by a secret scanner that reports only file/type/line and never prints detected secret values. External scanners are optional and must be pinned and approved before trusted CI use.

Run `npm run system:health` for the current operating-system report. Optional Playwright, k6, Sentry, Cloudflare workers, SEO publishing tools, and recurring GitHub automation are readiness surfaces, not automatically enabled services. Their templates may exist while status remains NOT CONFIGURED.

The project includes a persistent `.qarga-seo/` workspace, analytics event contract, E2E/load-test scaffolding, production-observability policy, and disabled 7/24 monitoring/weekly KPI templates. Enabling dependencies, credentials, external writes, schedules, or recurring autonomous workers requires the human gates in this file.

## Human approval gates

Explicit project-owner approval is required for:

- new agents, plugins, MCPs, integrations, or permission expansion;
- commission, pricing, provider packages, refunds, settlement, or Lələk rules;
- final legal text;
- authentication or permission-model changes;
- new dependencies, frameworks, ORMs, state managers, or test runners;
- destructive Git or database operations;
- production deployment, secrets, or real provider credentials;
- marketing publication, campaigns, advertising spend, or external-account writes;
- permanent promotion of a learned rule that changes agent behavior;
- material scope expansion.

Legal-agent output is a draft and does not replace a qualified lawyer. Never invent a metric, user quote, conversion rate, market size, margin, or legal conclusion.

## Durable planning and handoff

For multi-file, multi-agent, or risky work, maintain a living plan under `docs/plans/`. Include objective, lane, scope, current-state evidence, task ownership, dependencies, acceptance criteria, risks, rollback, approvals, verification, decisions, performance metadata, learning observations, and a safe resume checkpoint.

Every agent handoff must be self-contained. Raw subagent output is not an owner report.

## Final owner report

The coordinator reports in Azerbaijani using:

1. **What was done**
2. **Workflow lane and task ownership**
3. **What was verified**
4. **What was found**
5. **Benefits and secondary effects**
6. **Remaining risks and blockers**
7. **Decisions required**
8. **Performance and learning signals**
9. **Team need**
10. **Best next step**

## Persistent Work OS

Qarğa Work OS under `.claude/work-os/` is the operational source of truth for delegated work across Claude sessions. The coordinator owns the board. Parent tasks may include many agents; executable work is decomposed into subtasks with exactly one primary agent, one independent reviewer, explicit dependencies, completion criteria, evidence expectations, file boundaries, and integer base points from 1–10.

Rules:

- Create a Work OS parent task before delegating multi-step work.
- Do not let specialists self-assign work; they receive explicit subtask IDs from the coordinator.
- A subtask may start only when its dependencies are complete and no owner-decision gate blocks the parent.
- A specialist may start and submit its own subtask but cannot self-review, self-score, or mark itself DONE.
- Creating a Work OS subtask must create the existing completion contract; accepted review must close that contract before performance scoring.
- Parent KPI max points are the sum of subtask base points; earned points come from evidence-backed independent performance evaluation.
- Work OS status never overrides repository/test truth, project-memory decisions, or security/legal/payment approval gates.
- The board binds to localhost by default. Do not expose it remotely without explicit approval, authentication design, and security review.
- Routine templates are disabled until 7/24 automation is separately approved.

Useful commands: `npm run work-os:summary`, `npm run work-os:validate`, `npm run work-os:serve`, and `npm run work-os -- help`.

