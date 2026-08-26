# BrightHR Automation

Playwright + TypeScript end-to-end automation for the BrightHR sandbox environment (`sandbox-app.brighthr.com`), covering sign-up and employee management.

## Principles

- Tests validate **business behaviour**, not implementation details.
- Authentication and setup are done **once and reused**, not repeated per test.
- Test data is **generated, not hardcoded** — unique per run, safe to re-execute against a shared environment.
- Locators follow Playwright's own priority order: accessible role/label first, `data-testid` as a fallback.
- Application defects are **documented and worked around**, not silently patched over or left to cause flaky failures.

## Quick start

Requires Node.js 18+ and a BrightHR sandbox account.

```bash
npm install
npx playwright install chromium
cp .env.example .env        # fill in TEST_USERNAME / TEST_PASSWORD
```

Credentials stay in `.env`, which is gitignored — never committed, shared out-of-band instead.

| Command | Purpose |
| --- | --- |
| `npm test` | Run the full suite headless (matches CI) |
| `npm run test:headed` | Run in a real browser window |
| `npm run test:ui` | Playwright's interactive UI mode |
| `npm run test:debug` | Step through with the Playwright inspector |
| `npm run report` | Open the last HTML report |
| `npx tsc --noEmit` | Type check without running tests |
| `npx playwright test -g "adds employees"` | Run a single test by title |

`use.headless` is `false` locally (for visibility) and forced `true` in CI (`playwright.config.ts`), since GitHub Actions runners have no display server.

## Architecture

```text
BrightHR/
├── auth.setup.ts          # logs in once, saves storage state for every other test to reuse
├── pages/                 # page object model — locators as constructor fields, one class per flow
├── test-data/factories.ts # generates unique test data per run
└── tests/
    ├── auth/              # unauthenticated flows (signup)
    └── employees/         # authenticated flows (employee management)
```

Tests read as business scenarios (`await employeesPage.addEmployee(employee, isFirst)`); page objects own the locators and low-level interactions, so a selector change never touches a test file.

## Key design decisions

**Auth runs once per test run.** `auth.setup.ts` is a dedicated Playwright "setup" project that logs in and writes `playwright/.auth/user.json`; every test in the `chromium` project reuses that storage state. Faster, and it doesn't hammer the login flow on every test.

**Data is generated, not fixed.** `createEmployees(count)` produces any number of employees with unique emails (UUID-based run ID), so the same test can run repeatedly against the shared sandbox without colliding with data from a previous run:

```typescript
const employees = createEmployees(3);
```

**Locators are resilient by construction**, not by retrofitting `data-testid` everywhere:

```typescript
page.getByRole('button', { name: 'Add employee' });  // preferred: accessible role + name
page.getByLabel('Email address');                     // preferred: accessible label
page.getByTestId('sideBar');                          // fallback: no good accessible name available
```

## Test coverage

**Implemented:** sign-up with valid data (`new-user-signup.spec.ts`), and adding a dynamic number of employees with verification that each one appears in the employee list (`add-new-employees.spec.ts`). Both are happy-path — they prove the workflow end-to-end, not every validation rule.

**Planned, not yet built:** missing/invalid required fields, duplicate employee email, and other negative-path scenarios. Each is a small addition to an existing page object and spec file, not new infrastructure.

## CI

`.github/workflows/playwright.yml` runs on every push/PR to `main`: checkout → install deps → type check → install browsers → run tests → upload the HTML report as a build artifact.

Sandbox credentials are stored as GitHub Actions repo secrets (`TEST_USERNAME`, `TEST_PASSWORD`) and injected into the test step at runtime — never committed to source control.

## Known limitations & workarounds

- **Signup checkbox bug (worked around, not our bug):** the employer-confirmation checkbox's `<label for>` doesn't match its input `id`, so a mouse click never toggles it. `SignupPage.ts` focuses the input and sends a keyboard `Space` instead — see the comment there for why.
- **Employee list render timing:** the list can take a moment to update after the "employee added" modal closes, so that assertion uses a longer explicit timeout (`EmployeesPage.ts`).
- **Chromium only.** Firefox/WebKit/mobile projects are stubbed out (commented) in `playwright.config.ts` for easy extension.
- **No data teardown.** The sandbox company is shared and persistent — employee records accumulate across runs. Acceptable for a sandbox intended for this kind of testing; would need addressing before pointing this at a real environment.

## Where this goes next

Given more time: negative-path coverage (above), custom Playwright fixtures to remove the `new EmployeesPage(page)` boilerplate from each test, API-driven test data setup to skip the UI for setup steps, cross-browser execution, and smoke/regression tagging for selective CI runs.
