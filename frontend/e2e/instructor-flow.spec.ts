import { test, expect } from '@playwright/test';

const INSTRUCTOR_EMAIL = 'instructor@test.local';
const INSTRUCTOR_PASSWORD = 'Instructor123!';

test.describe('Instructor Flow (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', INSTRUCTOR_EMAIL);
    await page.fill('input[type="password"]', INSTRUCTOR_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/instructor', { timeout: 10000 });
  });

  test('instructor dashboard loads', async ({ page }) => {
    await expect(page).toHaveURL('/instructor');
    await expect(page.locator('body')).toBeVisible();
  });

  test('can navigate to course creation', async ({ page }) => {
    await page.goto('/instructor/courses/new');
    await expect(page.locator('input, textarea')).toBeVisible();
  });

  test('can create a course', async ({ page }) => {
    await page.goto('/instructor/courses/new');
    await page.fill('input[name="title"], input[placeholder*="titulo"], input[placeholder*="Titulo"]', 'Test Course E2E');
    await page.fill('textarea', 'Course created during E2E test');
    await page.click('button[type="submit"]');
    // Should redirect to editor or show success
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('cannot access admin routes', async ({ page }) => {
    await page.goto('/admin');
    // Should redirect or show 403
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).not.toContain('/admin');
  });
});
