import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@test.local';
const ADMIN_PASSWORD = 'Admin123!';

test.describe('Admin Flow (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin', { timeout: 10000 });
  });

  test('admin dashboard loads', async ({ page }) => {
    await expect(page).toHaveURL('/admin');
    await expect(page.locator('body')).toBeVisible();
  });

  test('can view users list', async ({ page }) => {
    await page.goto('/admin/users');
    await expect(page.locator('body')).toBeVisible();
  });

  test('can view courses list', async ({ page }) => {
    await page.goto('/admin/courses');
    await expect(page.locator('body')).toBeVisible();
  });
});
