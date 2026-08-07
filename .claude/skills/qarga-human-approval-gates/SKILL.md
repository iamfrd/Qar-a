---
name: qarga-human-approval-gates
description: Enforce explicit project-owner approval before Qarğa performs money, legal, security-sensitive, production, external-account, new-agent, new-tool, or major-scope actions.
---

# Qarğa Human Approval Gates

Explicit project-owner approval is required before: final pricing/commission/refund rules; final legal terms; auth/permission-model changes; production deploy; main-branch merge when policy requires it; destructive database/git operations; new external dependency with material risk; new plugin/MCP/integration; real credentials/secrets; advertising spend or publishing; external account writes; autonomous recurring workers; creating or retiring an agent; permanent system-evolution promotion.

Approval must name the action being approved. Approval for research is not approval for execution. Approval for a draft is not approval for production. If material scope changes after approval, request approval again.
