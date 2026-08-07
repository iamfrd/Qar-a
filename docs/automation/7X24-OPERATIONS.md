# Qarğa 7/24 Operations Architecture

Start with read-only monitoring and reporting. The included Cloudflare Worker templates are disabled until approved and deployed.

Recommended maturity path:

1. Daily health and weekly KPI reporting only.
2. Monitoring-driven issue creation after alert-quality is proven.
3. Approved GitHub issue → sandboxed implementation → tests/review → Draft PR.
4. Low-risk recurring maintenance only after cost, kill switch, sandbox, audit, and approval policy are stable.

Always keep payment, pricing, refund, legal, auth/permissions, production deployment, main merge, and external-account writes behind explicit human approval.
