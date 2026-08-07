# Qarğa Playwright E2E

The project contains a Playwright-ready structure but this package does not silently install browser dependencies or modify the lockfile.

Enable only after the project owner approves the dependency:

```bash
npm install -D @playwright/test
npx playwright install chromium
```

Then add an `e2e` package script or run:

```bash
npx playwright test --config tests/e2e/playwright.config.mjs
```

Build stable tests for student discovery/registration, provider course management, approval flows, and future payment/refund journeys. Do not target production services.
