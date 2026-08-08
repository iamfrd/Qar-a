---
name: qarga-accessibility-audit
description: Audit Qarğa UI changes for WCAG-oriented keyboard, focus, semantics, forms, contrast, motion, touch-target, responsive, and assistive-technology risks, with browser automation when available.
---

# Qarğa Accessibility Audit

Audit behavior, not aesthetics. Check keyboard reachability and order; visible focus; semantic headings/landmarks; labels and errors; button/link meaning; dialogs and focus trapping; alt text; status announcements; responsive zoom/reflow; reduced motion; touch targets; and obvious contrast risks.

Prefer automated Playwright/axe checks when configured, but never treat them as sufficient. Manual keyboard and screen-reader reasoning remains required for critical flows. Report severity, user impact, evidence, affected route/component, and a concrete fix suggestion. Do not redesign the entire interface based on preference.
