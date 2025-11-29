const { devices } = require('@playwright/test');

/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = {
  testDir: './tests/playwright',
  timeout: 30 * 1000,
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.001 } },
  fullyParallel: true,
  use: {
    headless: true,
    viewport: { width: 800, height: 600 },
    actionTimeout: 5 * 1000,
    screenshot: 'only-on-failure',
    baseURL: 'http://127.0.0.1:5173',
  },
  webServer: {
    command: 'npm run preview --prefix frontend -- --port 5173',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
};
