# BrightHR Automation

Playwright + TypeScript end-to-end automation for the BrightHR sandbox environment (`sandbox-app.brighthr.com`), covering employee management.

## Principles

- Tests validate **business behaviour**, not implementation details.
- Authentication and setup are done **once and reused**, not repeated per test.
- Test data is **generated, not hardcoded** — randomized per run, safe to re-execute against a shared environment.
- Locators follow Playwright's own priority order: accessible role/label first, `data-testid` as a fallback.
- Application defects are **documented and worked around**, not silently patched over or left to cause flaky failures.

## Quick start

Requires Node.js 20+ (enforced via `engines` in `package.json`) and a BrightHR sandbox account.

```bash
npm install
npx playwright install chromium
cp .env.example .env        # fill in TEST_USERNAME / TEST_PASSWORD
```

Credentials stay in `.env`, which is gitignored — never committed, shared out-of-band instead.

| Command | Purpose |
| --- | --- |
| `npm test` | Run the full suite (headed locally for visibility, headless in CI) |
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
├── test-data/factories.ts # generates randomized test data per run
└── tests/
    └── employees/         # authenticated flows (employee management)
```

Tests read as business scenarios (`await employeesPage.addEmployee(employee, isFirst)`); page objects own the locators and low-level interactions, so a selector change never touches a test file.

## Key design decisions

**Auth runs once per test run.** `auth.setup.ts` is a dedicated Playwright "setup" project that logs in and writes `playwright/.auth/user.json`; every test in the `chromium` project reuses that storage state. Faster, and it doesn't hammer the login flow on every test.

**Data is generated, not fixed.** `createEmployees(count)` produces any number of employees with realistic, randomly-paired names (deduplicated within a run) and emails in `firstname.lastnameNN@example.com` form. `example.com` is a reserved example domain, so registration emails cannot reach a real mailbox. The 40×40 name pool × 90 two-digit numbers gives 144,000 possible emails — collisions across runs on the shared, never-cleaned sandbox aren't mathematically impossible, but unlikely enough in practice. `createEmployees` throws if asked for more than its unique-name pool can provide, rather than looping forever:

```typescript
const employees = createEmployees(3);
```

**Locators are resilient by construction**, not by retrofitting `data-testid` everywhere:

```typescript
page.getByRole('button', { name: 'Add employee' });  // preferred: accessible role + name
page.getByLabel('Email address');                     // preferred: accessible label
page.getByTestId('sideBar');                          // fallback: no good accessible name available
```

**Verification happens at two points, not one.** `addEmployee` asserts the "{name} added to BrightHR Lite" confirmation immediately after saving, proving the save flow succeeded. `verifyEmployeesVisible` then checks the required scenario itself: that both employees' names and job titles appear together in the list. The UI does not expose email in the employee card, so the list assertion is deliberately limited to the business data visible to the user.

**Timezone is pinned, not assumed.** `playwright.config.ts` sets both `use.timezoneId` (browser) and `process.env.TZ` (Node) to `Europe/London`, so the date-picker's rendered tooltip and the date string built in `EmployeesPage.ts` are computed in the same zone regardless of the host machine. `selectStartDate` still matches only the day (not the full timestamp) as a second line of defence.

## Test coverage

**Implemented:** adding a dynamic number of employees with verification that each one appears in the employee list (`add-new-employees.spec.ts`) — this is the required scenario. It's happy-path — it proves the workflow end-to-end, not every validation rule.

Account creation itself isn't automated: the task treats it as a one-off manual step ("visit ... manually create a free account"), not one of the scenarios to automate, so there's no sign-up test here — `auth.setup.ts` logs into the already-created account instead.

**Planned, not yet built:** missing/invalid required fields, duplicate employee email, and other negative-path scenarios. Each is a small addition to an existing page object and spec file, not new infrastructure.

## CI

`.github/workflows/playwright.yml` runs on every push/PR to `main`: checkout → install deps → type check → install browsers → `npm test` → upload the HTML report as a build artifact.

Sandbox credentials are stored as GitHub Actions repo secrets (`TEST_USERNAME`, `TEST_PASSWORD`) and injected into the test step at runtime — never committed to source control.

## Known limitations & workarounds

- **Employee list render timing:** the list can take a moment to update after the "employee added" modal closes, so that assertion uses a longer explicit timeout (`EmployeesPage.ts`).
- **Chromium only.** Firefox/WebKit/mobile projects are stubbed out (commented) in `playwright.config.ts` for easy extension.
- **No data teardown.** The sandbox company is shared and persistent — employee records accumulate across runs. Acceptable for a sandbox intended for this kind of testing; would need addressing before pointing this at a real environment.

## Where this goes next

Given more time: negative-path coverage (above), custom Playwright fixtures to remove the `new EmployeesPage(page)` boilerplate from each test, API-driven test data setup to skip the UI for setup steps, cross-browser execution, and smoke/regression tagging for selective CI runs.
