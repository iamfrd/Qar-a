---
name: qarga-repository-research
description: Research the current Qarğa repository and available official solutions before writing new code, using progressive context retrieval rather than assumptions.
---

# Qarğa Repository Research

Use this skill before new features, abstractions, dependencies, integrations, migrations, or cross-module fixes.

## Principle

The current repository is the primary source of truth. Search before creating. Retrieve context in small cycles instead of reading the entire repository or guessing which files matter.

## Research sequence

### Cycle 1 — map the current implementation

- inspect `README.md`, `package.json`, `CLAUDE.md`, and relevant plans;
- run `git status`, `git diff`, and recent `git log`;
- search symbols, routes, API methods, database tables, tests, and UI components with `Grep`, `Glob`, and `git grep`;
- identify current terminology and established patterns;
- list candidate files and open questions.

### Cycle 2 — follow evidence

Read the highest-relevance files first, then follow imports, callers, tests, and data flow. Record:

- what currently exists;
- what is duplicated or incomplete;
- which layer owns the truth;
- which assumptions remain unverified;
- which files are actually in scope.

### Cycle 3 — evaluate external options only when needed

Before adding a dependency, framework, provider, or external integration:

- search current official documentation;
- check maintenance, license, compatibility, security posture, and operational cost;
- compare adopt, wrap, compose, and custom-build options;
- prefer the smallest solution that fits Qarğa's existing React/Node/SQLite architecture.

Stop after three cycles unless a concrete unresolved question justifies another cycle.

## Required research report

Provide:

1. current-state evidence with file paths;
2. reusable existing components or patterns;
3. missing context and how it was checked;
4. options considered;
5. recommended approach and why;
6. files likely to change;
7. claims that remain assumptions.

## Anti-patterns

- creating a helper before searching for an existing one;
- trusting an outdated agent prompt over current code;
- introducing a large dependency for one small function;
- claiming that no solution exists when a search channel was unavailable;
- sending an entire repository to a subagent instead of a self-contained brief;
- confusing internet popularity with compatibility or correctness.
