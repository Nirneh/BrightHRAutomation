import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

// Pins Node's own clock (used by `new Date()` in EmployeesPage.ts) to the same zone as the
// browser's `timezoneId` below, so date-picker interactions are deterministic across machines.
process.env.TZ = 'Europe/London';

export default defineConfig({
  testDir: './BrightHR',
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Single worker everywhere: keeps local runs to one visible browser window. Also means
   * fullyParallel would have no effect, so it's omitted rather than left in contradicting this. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Headed locally by default, for visibility; CI has no display server so it's forced headless.
     * `npm run test:headed` only changes anything when combined with CI=true, forcing a headed
     * run in an environment that would otherwise be headless — locally it's already the default. */
    headless: !!process.env.CI,
    /* Base URL to use in actions like `await page.goto('')`. Every goto() call in this codebase
     * uses a leading-slash path, which resolves against the origin only (path segments here are
     * discarded) — so this is deliberately just the origin, not a path the app is actually under. */
    baseURL: 'https://sandbox-app.brighthr.com',

    /* Matches the Node-side TZ above, so the calendar's rendered tooltip and our expected
     * date string are computed in the same timezone regardless of the host machine's. */
    timezoneId: 'Europe/London',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
    },
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
