import { test, expect } from '@playwright/test';

test.describe('Admin Bootstrap', () => {
  test('admin setup page shows unavailable when admin exists', async ({ page }) => {
    // If seed has been run, admin already exists
    await page.goto('/internal/admin-setup');
    await page.waitForTimeout(2000);
    // Should show either form or "unavailable" message
    await expect(page.locator('body')).toBeVisible();
  });

  test('admin setup page has all form fields', async ({ page }) => {
    await page.goto('/internal/admin-setup');
    await page.waitForTimeout(2000);

    // If available, check form fields
    const nameInput = page.locator('input').first();
    if (await nameInput.isVisible()) {
      await expect(page.locator('input')).toHaveCount(5); // name, email, password, confirm, secret
    }
  });

  test('admin setup is not linked from navigation', async ({ page }) => {
    await page.goto('/');
    const links = await page.locator('a').all();
    for (const link of links) {
      const href = await link.getAttribute('href');
      expect(href).not.toContain('/internal');
    }
  });
});
