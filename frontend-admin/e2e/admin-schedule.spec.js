const { test, expect } = require('@playwright/test');

test('create post, schedule it, and verify in admin list (scheduled only)', async ({ page, baseURL }) => {
  // Navigate to admin login
  await page.goto(`${baseURL}/login`);

  // Fill login form (Login.jsx uses first input for email and password input)
  const inputs = page.locator('form input');
  await inputs.nth(0).fill('admin@example.com');
  await page.locator('input[type="password"]').fill('changeme');
  await page.getByRole('button', { name: /Login/i }).click();

  // After login, go to new post page
  await page.waitForLoadState('networkidle');
  await page.goto(`${baseURL}/posts/new`);

  // Create a post — the admin form doesn't associate labels with inputs,
  // so select by position: first input is Title, second is Slug, then textareas.
  const title = `E2E Scheduled ${Date.now()}`;
  const formInputs = page.locator('form input');
  await formInputs.nth(0).fill(title);
  // leave slug auto-filled (nth(1) is slug)
  const textareas = page.locator('form textarea');
  await textareas.nth(0).fill('E2E excerpt');
  await textareas.nth(1).fill('E2E body content');

  // create post (default status is draft)
  await page.getByRole('button', { name: /Create Post/i }).click();

  // expect to be on the post editor page for the created post
  await expect(page.locator(`text=Edit Post: ${title}`)).toBeVisible({ timeout: 5000 });

  // set published_at to tomorrow (use local datetime-local format)
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const tzOffset = d.getTimezoneOffset();
  d.setMinutes(d.getMinutes() - tzOffset);
  const localVal = d.toISOString().slice(0,16);
  await page.locator('input[type="datetime-local"]').fill(localVal);

  // Save
  await page.getByRole('button', { name: /Save$/i }).click();
  await page.waitForSelector('text=Saved', { timeout: 5000 });

  // Navigate to posts list
  await page.goto(`${baseURL}/posts`);

  // Toggle scheduled only
  const checkbox = page.getByLabel('Show scheduled only');
  await checkbox.check();

  // Verify our scheduled post appears and shows Scheduled badge.
  // Wait for the row containing the title, then check for the badge inside that row.
  const row = page.locator('tr', { hasText: title });
  await row.waitFor({ state: 'visible', timeout: 5000 });
  // status is in the second column (td index 1). Scope the badge lookup to that cell
  const statusCell = row.locator('td').nth(1);
  const badge = statusCell.locator('text=Scheduled');
  await badge.waitFor({ state: 'visible', timeout: 5000 });
  await expect(row.locator(`text=${title}`)).toBeVisible();
  await expect(badge).toBeVisible();
});
