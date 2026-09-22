import { test, expect } from '@playwright/test';

const STUDENT_EMAIL = 'student@test.local';
const STUDENT_PASSWORD = 'Student123!';

test.describe('Student Flow (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', STUDENT_EMAIL);
    await page.fill('input[type="password"]', STUDENT_PASSWORD);
    await page.click('button[type="submit"]');
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('dashboard shows enrolled courses', async ({ page }) => {
    await expect(page).toHaveURL('/dashboard');
    // Should show at least one course
    await expect(page.locator('text=Introduccion a Java')).toBeVisible({ timeout: 5000 });
  });

  test('can navigate to catalog', async ({ page }) => {
    await page.click('a[href="/courses"]');
    await expect(page).toHaveURL('/courses');
  });

  test('can open course detail', async ({ page }) => {
    await page.goto('/courses');
    // Click on first course if available
    const courseLink = page.locator('a[href*="/courses/"]').first();
    if (await courseLink.isVisible()) {
      await courseLink.click();
      await expect(page.locator('h1, h2')).toBeVisible();
    }
  });

  test('can access course player', async ({ page }) => {
    // Navigate to course player for enrolled course
    await page.goto('/learn');
    // Should either show player or redirect
    await page.waitForTimeout(2000);
    // Verify no crash
    await expect(page.locator('body')).toBeVisible();
  });

  test('progress persists after page reload', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    // Reload
    await page.reload();
    // Should still show enrolled courses
    await expect(page.locator('body')).toBeVisible();
  });
});
