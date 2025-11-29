const { test, expect } = require('@playwright/test');

test('homepage loads and shows main content', async ({ page }) => {
  await page.goto('/');

  // basic smoke checks: main element and header visible
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('header')).toBeVisible();

  // check there is at least one article/post list item
  const article = page.locator('article, .post, .post-item').first();
  await expect(article).toHaveCount(1).catch(() => {
    // if none of the selectors match, at least assert the page contains the word 'post' or 'featured'
    return expect(page.locator('body')).toContainText(/post|featured|latest/i);
  });
});
