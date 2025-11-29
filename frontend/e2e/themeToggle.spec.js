// Playwright visual baseline tests for ThemeToggle component
// Generates baseline snapshots (light, dark, dark persisted)
// Run with: npx playwright test e2e/themeToggle.spec.js --update-snapshots

const { test, expect } = require('@playwright/test');

// Ensure a clean theme preference and reduce animation noise
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try { localStorage.clear(); } catch (_) {}
  });
});

async function stabilize(page) {
  // Disable transitions/animations to reduce pixel diffs
  await page.addStyleTag({ content: `* { transition: none !important; animation: none !important; }` });
}

test.describe('ThemeToggle visual (@visual)', () => {
  test('light and dark states', async ({ page }) => {
    await page.goto('/');
    await stabilize(page);
    const toggle = page.getByRole('switch');
    await expect(toggle).toBeVisible();
    // Light baseline (default)
    await expect(toggle).toHaveAttribute('aria-checked', 'false');
    await expect(toggle).toHaveScreenshot('theme-toggle-light.png');

    // Toggle to dark and capture
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await expect(toggle).toHaveScreenshot('theme-toggle-dark.png');
  });

  test('dark mode loads from stored preference', async ({ page }) => {
    // Force persisted preference before first paint
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'dark');
    });
    await page.goto('/');
    await stabilize(page);
    const toggle = page.getByRole('switch');
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await expect(toggle).toHaveScreenshot('theme-toggle-dark-persisted.png');
  });
});
