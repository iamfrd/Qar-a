---
name: qarga-system-evaluation
description: Evaluate Qarğa coordinator, agent, skill, permission, and learning-system changes against deterministic checks and fresh-context regression scenarios before permanent promotion.
---

# Qarğa Agent-System Evaluation

Use this skill whenever a change affects `CLAUDE.md`, coordinator behavior, agent prompts, skills, commands, permissions, hooks, workflow routing, performance policy, learning policy, or team structure.

## Evaluation order

1. **Define the expected behavior before editing** — identify the capability or regression that the change must address.
2. **Run deterministic checks** — execute `npm run validate:claude` and `npm run test:claude-system`.
3. **Select relevant scenarios** — read `.claude/evals/coordinator-scenarios.json` and choose every scenario touched by the change.
4. **Use fresh context** — ask an independent reviewer that did not author the change to evaluate the proposed response or workflow against expected and forbidden behaviors.
5. **Record evidence** — store only the scenario ID, tested commit/checkpoint, status, evidence references, reviewer, and unresolved risks in `.claude/evals/results.json`.
6. **Compare with the baseline** — do not promote a change that fixes one scenario by regressing another protected behavior.
7. **Human gate** — require project-owner approval for permanent behavior changes, new permissions, hooks, integrations, agents, or financial/legal/security rules.
8. **Validation window** — after approval, evaluate the improvement over the next three relevant real tasks before marking it validated.

## Grading rules

- Use code-based and schema-based graders whenever possible.
- Use model-based grading only for open-ended behavior and always cite the exact expected and forbidden behaviors.
- The authoring agent is not the sole grader.
- Missing evidence is `not-run`, not a pass.
- A partial result must list the unmet behavior and the risk.
- Never store secrets, personal data, raw private conversations, or unsupported business figures in evaluation results.

## Required report

- change under evaluation;
- deterministic checks and exact results;
- scenario IDs and results;
- regressions or uncertainty;
- approval required;
- promote, revise, or revert recommendation.
