const { test, expect } = require('@playwright/test');

test.describe('Theme toggle visual regression', () => {
  test('theme toggle should match baseline screenshot', async ({ page }) => {
    await page.goto('/');
    const toggle = await page.getByRole('switch');
    await expect(toggle).toBeVisible();

    // Take a screenshot of the toggle element for visual regression
    await expect(toggle).toHaveScreenshot('theme-toggle.png');
  });
});
