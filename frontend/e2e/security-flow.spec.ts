import { test, expect } from '@playwright/test';

test.describe('Security (unauthenticated)', () => {
  const protectedRoutes = ['/dashboard', '/profile', '/settings/privacy', '/instructor', '/admin'];

  for (const route of protectedRoutes) {
    test(`redirects ${route} to login`, async ({ page }) => {
      await page.goto(route);
      await page.waitForTimeout(2000);
      // Should redirect to login
      const url = page.url();
      expect(url).toContain('/login');
    });
  }
});

test.describe('Security (student cannot access instructor/admin)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'student@test.local');
    await page.fill('input[type="password"]', 'Student123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('student cannot access /instructor', async ({ page }) => {
    await page.goto('/instructor');
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).not.toContain('/instructor');
  });

  test('student cannot access /admin', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).not.toContain('/admin');
  });
});
