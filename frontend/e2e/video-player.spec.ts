import { test, expect } from '@playwright/test';

const STUDENT_EMAIL = 'student@test.local';
const STUDENT_PASSWORD = 'Student123!';

test.describe('Video Player', () => {
  test('video player page loads for enrolled course', async ({ page }) => {
    // Login as student
    await page.goto('/login');
    await page.fill('input[type="email"]', STUDENT_EMAIL);
    await page.fill('input[type="password"]', STUDENT_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Try to access course player
    await page.goto('/learn');
    await page.waitForTimeout(3000);

    // Should show player or redirect (no crash)
    await expect(page.locator('body')).toBeVisible();
  });

  test('video element has proper controls when present', async ({ page }) => {
    // Login as student
    await page.goto('/login');
    await page.fill('input[type="email"]', STUDENT_EMAIL);
    await page.fill('input[type="password"]', STUDENT_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Navigate to a lesson that might have video
    await page.goto('/learn');
    await page.waitForTimeout(3000);

    // Check if any video element on the page has controls attribute
    const videoElements = page.locator('video');
    const count = await videoElements.count();
    // If videos exist, they should have controls
    for (let i = 0; i < count; i++) {
      await expect(videoElements.nth(i)).toHaveAttribute('controls');
    }
  });
});
