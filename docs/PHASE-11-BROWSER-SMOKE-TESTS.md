# Phase 11 — Browser Smoke Tests

## What changed

- Added Playwright as a development-only dependency and `npm run test:e2e`.
- Added a Playwright configuration that starts the production Next.js server.
- Added browser smoke tests for homepage rendering, all linked tool routes, and a Word Counter interaction.
- Added Chromium installation and browser smoke tests to GitHub Actions after the production build.

## Run locally

```bash
npm install
npx playwright install chromium
npm run build
npm run test:e2e
```

On Windows PowerShell, if the npm execution policy blocks `npm`, use `npm.cmd` instead.

## Scope and limitations

These are smoke tests, not exhaustive functional, accessibility, security, or cross-browser coverage. CI execution is the verification source of truth. No application secrets or Supabase credentials are required for these public-page tests. This phase does not merge prior pull requests, deploy the site, or change production settings.
