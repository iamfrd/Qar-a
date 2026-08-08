# Skill and Agent Configuration Security

`npm run security:claude` is the default deterministic, zero-dependency CI scanner for Qarğa's agents, skills, commands, hooks, and settings. It blocks high/critical local findings.

External scanners such as AgentShield or NVIDIA SkillSpector can be useful as a second opinion, but must not be fetched from an unpinned moving branch inside trusted CI. Before enabling one, approve the tool, pin an exact release/commit, review its permissions/network behavior, and add a rollback path.
