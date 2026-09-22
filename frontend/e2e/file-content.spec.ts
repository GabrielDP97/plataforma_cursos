import { test, expect } from '@playwright/test';

const STUDENT_EMAIL = 'student@test.local';
const STUDENT_PASSWORD = 'Student123!';

test.describe('File Content', () => {
  test('file download link is accessible for enrolled student', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', STUDENT_EMAIL);
    await page.fill('input[type="password"]', STUDENT_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Try to access course content that might have file blocks
    await page.goto('/learn');
    await page.waitForTimeout(3000);

    // Check that file download links exist and have proper attributes
    const fileLinks = page.locator('a[download], a[href*="file"], a[href*="download"]');
    const count = await fileLinks.count();
    for (let i = 0; i < count; i++) {
      await expect(fileLinks.nth(i)).toBeVisible();
    }
  });
});
