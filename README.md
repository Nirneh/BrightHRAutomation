# BrightHR Automation

Playwright and TypeScript end-to-end automation for the **BrightHR sandbox environment**, focused on maintainable regression coverage, reliable authentication, dynamic test data and CI-ready execution.

**Target:** `sandbox-app.brighthr.com`

---

## 1. Overview

This project demonstrates a scalable approach to UI test automation using **Playwright and TypeScript**.

The framework is designed around a small number of principles:

* Keep tests focused on **business behaviour**, not implementation details.
* Reuse authentication and common setup rather than repeating it in every test.
* Generate **unique test data** to reduce test dependencies and collisions.
* Prefer stable, accessible Playwright locators.
* Keep page interaction logic separate from test scenarios.
* Design tests so they can run consistently both locally and in CI.
* Capture useful diagnostics when failures occur.
* Document application limitations separately from automation defects.

The current coverage focuses on **authentication/sign-up and employee-management workflows**.

---

## 2. Technology Stack

| Technology                     | Purpose                                  |
| ------------------------------ | ---------------------------------------- |
| Playwright                     | Browser automation and test runner       |
| TypeScript                     | Strongly typed test/framework code       |
| Node.js                        | Runtime                                  |
| GitHub Actions                 | CI execution                             |
| Playwright HTML Reporter       | Test reporting                           |
| dotenv / environment variables | Environment and credential configuration |

---

## 3. Prerequisites

Install:

* Node.js 18+
* npm
* Git
* VS Code or another TypeScript-compatible IDE
* Access to an approved BrightHR sandbox account

Verify Node.js and npm:

```bash
node --version
npm --version
```

---

## 4. Project Setup

Clone the repository and open the project:

```bash
git clone <repository-url>
cd BrightHRAutomation
```

Install dependencies:

```bash
npm install
```

Install the required browser:

```bash
npx playwright install chromium
```

Create the local environment file:

```bash
cp .env.example .env
```

Populate `.env` with the approved sandbox credentials:

```env
TEST_USERNAME=you@example.com
TEST_PASSWORD=your-password
```

The sandbox base URL is fixed in `playwright.config.ts` rather than sourced from the environment, since the suite targets a single, known environment.

### Security

Never commit:

* passwords
* API keys
* access tokens
* authentication state
* `.env`

The repository includes `.gitignore` rules to prevent environment secrets and Playwright authentication artefacts from being committed.

---

## 5. Framework Architecture

The framework uses a layered structure so that test scenarios remain readable and implementation details remain centralised.

```text
BrightHRAutomation/
│
├── BrightHR/
│   ├── auth.setup.ts
│   │
│   ├── pages/
│   │   ├── LoginPage.ts
│   │   ├── SignupPage.ts
│   │   └── EmployeesPage.ts
│   │
│   ├── test-data/
│   │   └── factories.ts
│   │
│   └── tests/
│       ├── auth/
│       └── employees/
│
├── playwright.config.ts
├── package.json
├── tsconfig.json
├── .env.example
└── .github/
    └── workflows/
```

### Responsibility of each layer

**`tests/`**

Contains business scenarios and assertions.

Tests should answer:

> What behaviour are we validating?

rather than:

> How does the page work internally?

---

**`pages/`**

Contains page-level interactions and locators.

The page layer hides implementation details from tests and exposes meaningful actions such as:

```typescript
await employeesPage.addEmployee(employee, isFirst);
```

rather than requiring every test to know which buttons, fields and selectors are involved.

---

**`test-data/`**

Contains data factories used to generate unique, controlled test data.

This avoids copy-pasted test records and allows the suite to scale without relying on a fixed employee dataset.

---

**`auth.setup.ts`**

Responsible for performing authentication once and creating reusable Playwright storage state for authenticated tests.

This prevents every employee-management test from repeatedly driving the login UI.

---

## 6. Authentication Strategy

Authentication is separated from the main regression tests.

```text
auth.setup.ts
      │
      ▼
Login once
      │
      ▼
Storage state
      │
      ▼
Authenticated Chromium tests
```

This provides:

* Faster test execution
* Reduced dependency on the login workflow
* Cleaner test scenarios
* Consistent authenticated state

The login flow itself remains independently testable.

### Important design consideration

Authentication state should not be confused with application state.

Tests must remain independent and should not rely on another test having created or modified data.

---

## 7. Test Data Strategy

The framework uses dynamic test-data generation rather than hardcoded employee records.

Example:

```typescript
const employees = createEmployees(3);
```

The factory generates unique employee information, including unique email addresses using a run-specific identifier.

This provides:

* Better test isolation
* Reduced data collisions
* Repeatable execution
* Easy scaling
* Less maintenance when additional scenarios are added

The objective is to create **deterministic test state without relying on shared records**.

---

## 8. Locator Strategy

The framework follows a stability-first locator strategy.

Preferred order:

```text
Accessible role / label
        ↓
Accessible name
        ↓
data-testid
        ↓
CSS/XPath only when necessary
```

Examples:

```typescript
page.getByRole('button', { name: 'Add employee' });

page.getByLabel('Email address');

page.getByTestId('sideBar');
```

The objective is to avoid selectors that are tightly coupled to implementation details such as:

* generated CSS classes
* DOM nesting
* fragile XPath expressions
* positional selectors

Where the application does not expose an appropriate accessible locator, `data-testid` can provide a stable contract between the application and automation.

---

## 9. Test Strategy

The automation suite prioritises **business-critical and regression-prone workflows**.

### Implemented today

* **Authentication** — a dedicated setup project logs in once and persists storage state; every authenticated test starts from that state instead of driving the login UI itself.
* **Sign-up** — the unauthenticated sign-up form can be completed and submitted successfully with valid data.
* **Employee management** — an authenticated user can add a dynamic number of employees in one session and each one is verified to appear in the employee list afterwards.

Both current tests are happy-path: they prove the primary workflow works end-to-end, not that every input is validated correctly.

### Planned negative coverage

Not yet implemented, but the natural next layer given the current structure (each of these is a small addition to an existing page object/test file, not new infrastructure):

* Missing required fields
* Invalid input (e.g. malformed email/phone)
* Duplicate data (e.g. an employee email that already exists)
* Invalid user actions
* Unexpected application state

The goal is not maximum UI automation.

The goal is to provide **reliable confidence in important business behaviour**.

---

## 10. Test Organisation

Tests are organised by business capability rather than by individual UI element.

```text
BrightHR/tests/
│
├── auth/
│   └── new-user-signup.spec.ts
│
└── employees/
    └── add-new-employees.spec.ts
```

This allows the suite to grow naturally:

```text
tests/
├── auth/
├── employees/
├── holidays/
├── absence/
└── rota/
```

without forcing unrelated workflows into a single test file.

---

## 11. Running Tests

### Run the full suite

```bash
npm test
```

### Run tests in headed mode

```bash
npm run test:headed
```

### Run Playwright UI mode

```bash
npm run test:ui
```

### Debug a test

```bash
npm run test:debug
```

### Open the previous HTML report

```bash
npm run report
```

### Run a specific file

```bash
npx playwright test BrightHR/tests/employees/add-new-employees.spec.ts
```

### Run a specific test by title

```bash
npx playwright test -g "adds employees"
```

### Run a test in Chromium only

```bash
npx playwright test BrightHR/tests/employees/add-new-employees.spec.ts --project=chromium
```

---

## 12. CI/CD

The framework is designed to run in GitHub Actions using a headless Chromium environment.

The intended pipeline is:

```text
Pull Request
     │
     ▼
Checkout repository
     │
     ▼
Install Node dependencies
     │
     ▼
Run TypeScript validation
     │
     ▼
Install Playwright browser
     │
     ▼
Run Playwright tests
     │
     ▼
Upload HTML report as a build artifact
```

CI should provide fast feedback while retaining enough diagnostic information to investigate failures.

For a larger suite, the framework can be extended with:

* smoke/regression tagging
* parallel workers
* CI sharding
* environment-specific execution
* failure notifications
* trend reporting

---

## 13. Failure Diagnostics

When a test fails, the objective is to make the failure actionable without requiring immediate local reproduction.

Playwright diagnostics should include, where configured:

* HTML report
* Trace
* Screenshot
* Video
* Console information
* Network/debug information where relevant

The preferred investigation flow is:

```text
Test failure
    ↓
Review report
    ↓
Inspect trace
    ↓
Check screenshot/video
    ↓
Review application behaviour
    ↓
Determine root cause
    ↓
Fix automation/application/environment
    ↓
Re-run and confirm
```

Retries should be treated as a safety mechanism and diagnostic aid, **not as a substitute for fixing flaky tests**.

---

## 14. Flaky-Test Approach

The framework should not hide instability through excessive retries.

When a test is intermittent, investigate:

* Synchronisation
* Locator stability
* Dynamic rendering
* Test-data collisions
* Shared application state
* Network dependencies
* Environment instability
* Genuine application defects

The goal is to remove the source of nondeterministic behaviour.

For example, prefer waiting for an application condition:

```typescript
await expect(employeeRow).toBeVisible();
```

over an arbitrary delay:

```typescript
await page.waitForTimeout(5000);
```

---

## 15. Application Defects vs Automation Defects

The automation suite documents known sandbox limitations separately from defects in the automation itself.

For example:

### Signup checkbox

The sandbox currently contains an employer-confirmation checkbox whose label association does not behave correctly with mouse interaction. The test works around the application behaviour rather than attempting to "fix" the application from the automation project.

### Employee list rendering

After an employee is added, the employee list can take additional time to re-render. The relevant assertion therefore uses an appropriate explicit timeout for the expected application state.

These behaviours are documented so reviewers can distinguish:

```text
Application issue
      ≠
Automation issue
```

---

## 16. Known Limitations

### Browser coverage

Chromium is currently the configured test browser.

Firefox, WebKit and mobile projects can be added when cross-browser coverage is required and supported by the target environment.

### Sandbox data

The sandbox company is persistent, so employee records may remain between executions.

The current project does not perform destructive teardown of shared sandbox data.

### Environment availability

Tests depend on the availability and behaviour of the BrightHR sandbox environment.

Changes to the sandbox UI, data or test accounts may require corresponding automation updates.

---

## 17. Quality Principles

The framework follows these principles:

### Reliable

Tests should be deterministic and isolated.

### Maintainable

Changes to selectors or setup should require minimal changes to test scenarios.

### Scalable

Adding another business workflow should not require duplication of authentication, configuration or test-data logic.

### Diagnosable

A failed test should provide enough evidence to determine the likely root cause.

### Business-focused

Automation should validate meaningful product behaviour rather than simply exercise UI elements.

### Secure

Credentials and authentication artefacts must remain outside source control.

---

## 18. Future Enhancements

Potential next steps as the suite grows include:

* API-driven test-data setup
* API + UI hybrid scenarios
* Role-based authentication fixtures
* Additional business-domain coverage
* Accessibility checks
* Cross-browser execution
* Smoke/regression tagging
* Parallelisation and sharding
* CI quality gates
* Test execution metrics
* Flaky-test monitoring
* Environment-specific configuration

These should be introduced based on actual project needs rather than adding framework complexity without a clear benefit.

---

## 19. Assessment Approach

This project is intentionally designed to demonstrate more than basic UI automation.

The key engineering considerations are:

```text
Business risk
      ↓
Test strategy
      ↓
Framework architecture
      ↓
Authentication & test data
      ↓
Stable UI automation
      ↓
Negative coverage
      ↓
Diagnostics & reliability
      ↓
CI/CD
      ↓
Continuous improvement
```

The objective is to demonstrate how a Senior SDET approaches **quality engineering as a whole**, rather than simply producing a large number of automated test cases.

---

## 20. Useful Commands

```bash
# Install dependencies
npm install

# Install Chromium
npx playwright install chromium

# TypeScript validation
npx tsc --noEmit

# Run all tests
npm test

# Run headed
npm run test:headed

# Run UI mode
npm run test:ui

# Debug
npm run test:debug

# Run a specific file
npx playwright test BrightHR/tests/employees/add-new-employees.spec.ts

# Run a specific test
npx playwright test -g "adds employees"

# Open report
npm run report
```
