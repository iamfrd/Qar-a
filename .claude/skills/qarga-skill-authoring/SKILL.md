---
name: qarga-skill-authoring
description: Author or edit concise Qarğa project skills after an approved skill-evolution proposal. Use progressive disclosure: keep SKILL.md focused on triggerable workflow and rules, place optional domain detail one level deep in references/, deterministic repeatable operations in scripts/, and reusable templates in assets/; validate and test bundled scripts before handoff.
---

# Qarğa Skill Authoring

Create skills for another Claude instance to use, not as design notes for the author.

Keep `SKILL.md` concise and reusable. Frontmatter must contain only `name` and `description`; make the description explain both the capability and concrete trigger contexts. Use imperative instructions in the body.

Use progressive disclosure:

- `SKILL.md` — core workflow, decision points, invariants, and navigation.
- `references/` — optional domain or variant details linked directly from `SKILL.md`; avoid deep nesting.
- `scripts/` — deterministic repeated operations; test representative scripts before handoff.
- `assets/` — reusable templates or static resources when genuinely needed.

Do not create a new skill if an existing skill owns the capability. Preserve useful existing content when editing. Avoid generic advice Claude already knows, duplicated policy text, volatile facts, secrets, hidden benchmark answers, and task-specific fixes.

After authoring, run the project validator and hand the candidate to an independent evaluation engineer. Candidate creation is not promotion.
