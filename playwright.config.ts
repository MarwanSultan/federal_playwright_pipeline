import { defineConfig, devices } from '@playwright/test';
import os from 'node:os';
import path from 'node:path';

const targetUrl = process.env.BASE_URL?.trim() || 'https://www.fedramp.gov';

const isCi = Boolean(process.env.CI);

const ciOutputRoot = path.join(os.tmpdir(), 'playwright-pipeline');

const reportDirectory = isCi ? path.join(ciOutputRoot, 'playwright-report') : 'playwright-report';

const resultsDirectory = isCi ? path.join(ciOutputRoot, 'test-results') : 'test-results';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',

  outputDir: resultsDirectory,

  /**
   * Run tests in files in parallel.
   */
  fullyParallel: true,

  /**
   * Fail the build on CI if test.only is accidentally committed.
   */
  forbidOnly: isCi,

  /**
   * Retry failed tests on CI.
   */
  retries: isCi ? 2 : 0,

  /**
   * Use a single worker on CI for predictable execution.
   */
  workers: isCi ? 1 : undefined,

  /**
   * Reporters.
   */
  reporter: [
    ['list'],
    [
      'html',
      {
        outputFolder: reportDirectory,
        open: 'never',
      },
    ],
    [
      'junit',
      {
        outputFile: `${resultsDirectory}/junit.xml`,
      },
    ],
  ],

  /**
   * Shared settings for all projects.
   */
  use: {
    /**
     * Base URL used by relative navigation such as:
     *
     * await page.goto('/events');
     *
     * BASE_URL can override the default environment.
     */
    baseURL: targetUrl,

    /**
     * Run browsers headlessly.
     */
    headless: true,

    /**
     * Navigation timeout.
     */
    navigationTimeout: 30_000,

    /**
     * Action timeout.
     */
    actionTimeout: 15_000,

    /**
     * Do not ignore HTTPS certificate errors.
     */
    ignoreHTTPSErrors: false,

    /**
     * Collect traces when tests fail after a retry.
     */
    trace: isCi ? 'retain-on-failure' : 'on-first-retry',

    /**
     * Capture screenshots only when tests fail.
     */
    screenshot: 'only-on-failure',

    /**
     * Disable video recording to reduce artifact size.
     */
    video: 'off',
  },

  /**
   * Configure supported browsers.
   */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    ...(process.env.ENABLE_CROSS_BROWSER === 'true'
      ? [
          {
            name: 'firefox',
            use: {
              ...devices['Desktop Firefox'],
            },
          },
          {
            name: 'webkit',
            use: {
              ...devices['Desktop Safari'],
            },
          },
        ]
      : []),

    /**
     * Mobile projects can be enabled when required.
     */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /**
     * Branded browser projects can be enabled when required.
     */
    // {
    //   name: 'Microsoft Edge',
    //   use: {
    //     ...devices['Desktop Edge'],
    //     channel: 'msedge',
    //   },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: {
    //     ...devices['Desktop Chrome'],
    //     channel: 'chrome',
    //   },
    // },
  ],

  /**
   * Run a local development server before tests when required.
   */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !isCi,
  // },
});
