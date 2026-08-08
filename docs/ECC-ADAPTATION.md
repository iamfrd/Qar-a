# ECC Adaptation for Qarğa

## Decision

Qarğa does not install Everything Claude Code as a second operating system. Qarğa keeps its owner-led coordinator, project-specific agents, business governance, revenue/payment rules, performance model, and human approval gates.

Selected ECC concepts were rewritten as Qarğa-native skills and workflows.

## Adopted concepts

| ECC concept | Qarğa adaptation | Reason |
|---|---|---|
| Dynamic workflow mode | `qarga-workflow-routing` | Match governance effort to difficulty and risk. |
| Search-first | `qarga-repository-research` | Reuse current code and avoid unnecessary dependencies. |
| Iterative retrieval | Progressive three-cycle repository research | Reduce missing context and token waste. |
| TDD workflow | `qarga-test-first-development` | Protect server invariants and regressions. |
| Verification loop | `qarga-verification-loop` | Require reproducible evidence before completion claims. |
| Fresh-context review/evaluation | `qarga-independent-review` | Prevent the implementer from being the final judge. |
| E2E testing | `qarga-e2e-testing` | Cover the most valuable marketplace journeys. |
| API design/backend patterns | `qarga-api-contract-design` | Stabilize typed server-authoritative contracts. |
| Continuous learning v2 | `qarga-controlled-learning` | Improve from evidence without autonomous rule mutation. |
| Eval harness | Performance + learning evidence | Connect routing and improvement decisions to actual results. |
| Checkpoints | `qarga-checkpoint` and living plan files | Support safe multi-session handoff. |
| Durable memory principles | `qarga-project-memory-governance` plus append-only Decision, Technical Debt, and Experiment registries | Preserve important history between sessions without treating stale memory as unquestioned truth. |

## Intentionally not adopted

- full ECC plugin or universal installation;
- generic ECC coordinator and duplicate specialist agents;
- all ECC skills, commands, language rules, and hooks;
- automatic background observer that records every session action;
- automatic conversion of observations into permanent skills;
- cross-project global memory or automatic capture of raw conversations;
- automatic dependency installation;
- automatic merge, deployment, payment, or external-account operations.

These choices reduce context noise, duplicated behavior, supply-chain risk, Windows compatibility problems, and accidental conflict with Qarğa's existing safety rules.

## Source boundary

The adapted files are original Qarğa-specific implementations inspired by public ECC concepts. They are not direct copies of the full ECC system. Current repository evidence and official Claude Code behavior remain the source of truth.

## Evaluation adaptation

ECC eval-harness ideas were adapted into deterministic local self-tests plus fresh-context coordinator regression scenarios. Qarğa does not use automatic LLM scoring as the sole approval signal.
