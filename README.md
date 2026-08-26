# BrightHR Automation

End-to-end UI test automation for [BrightHR](https://brighthr.com), built with [Playwright](https://playwright.dev) and TypeScript, targeting the BrightHR sandbox environment (`sandbox-app.brighthr.com`).

## Prerequisites

- Node.js 18+
- A BrightHR sandbox account (email + password)

## Setup

```bash
npm install
npx playwright install --with-deps chromium
cp .env.example .env
```

Fill in `.env` with sandbox credentials:

```
TEST_USERNAME=you@example.com
TEST_PASSWORD=your-password
```

## Running the tests

```bash
npm test              # headless, matches CI
npm run test:headed   # watch it run in a real browser window
npm run test:ui       # Playwright's interactive UI mode
npm run test:debug    # step through with the Playwright inspector
npm run report        # open the HTML report from the last run
```

Locally, `use.headless` defaults to `false` for visibility while developing; CI (`process.env.CI`) always runs headless, since GitHub Actions runners have no display server.

## Project structure

```
BrightHR/
  auth.setup.ts          # logs in once, saves storage state for every other test to reuse
  pages/                 # page object model — one class per page/flow
  test-data/factories.ts # generates dynamic, unique test data per run
  tests/
    auth/                # unauthenticated flows (signup)
    employees/           # authenticated flows (employee management)
playwright.config.ts     # baseURL, projects, reporter, CI-aware settings
```

## Design decisions

- **Auth runs once per test run.** `auth.setup.ts` is a dedicated Playwright "setup" project that logs in and writes `playwright/.auth/user.json`. Every test in the `chromium` project reuses that storage state instead of logging in from scratch, which is both faster and avoids hammering the login flow.
- **Data-driven, not copy-pasted.** `createEmployees(count)` generates any number of unique employees (unique email per run via a UUID-based run ID); the employee test loops over the array rather than hardcoding a fixed number of near-identical blocks. Bump the count and the test still works.
- **Locator strategy follows Playwright's own priority order**: accessible role/label first, `data-testid` as a fallback where the DOM doesn't expose a good accessible name (e.g. the sidebar).

## Known limitations

- Only Chromium is configured as a test project. Firefox/WebKit/mobile projects are stubbed out (commented) in `playwright.config.ts` for easy extension.
- The sandbox company accumulates employees/signups across runs — there's no teardown step, since the sandbox is a shared, persistent environment intended for this kind of testing.
- Two real bugs in BrightHR's own sandbox UI are worked around rather than fixed, since they're outside this repo's control:
  - The employer-confirmation checkbox on the signup form has a mismatched `<label for>`, so it only responds to keyboard activation, not a mouse click (see the comment in `SignupPage.ts`).
  - The employee list can take a moment to re-render after the "employee added" modal closes, so that assertion uses a longer explicit timeout (see `EmployeesPage.ts`).
