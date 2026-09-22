import { test, expect } from '@playwright/test';

test.describe('Console Error Audit', () => {
  const consoleErrors: string[] = [];
  const networkErrors: string[] = [];

  test('home page has no console errors', async ({ page }) => {
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => {
      consoleErrors.push(err.message);
    });
    page.on('requestfailed', (req) => {
      networkErrors.push(`${req.url()} - ${req.failure()?.errorText}`);
    });

    await page.goto('/');
    await page.waitForTimeout(3000);

    // Filter out expected errors (like failed API calls when backend is not running)
    const unexpectedErrors = consoleErrors.filter(
      (e) => !e.includes('Failed to fetch') && !e.includes('NetworkError') && !e.includes('404')
    );
    expect(unexpectedErrors).toHaveLength(0);
  });

  test('login page has no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/login');
    await page.waitForTimeout(2000);

    const unexpected = errors.filter(
      (e) => !e.includes('Failed to fetch') && !e.includes('NetworkError')
    );
    expect(unexpected).toHaveLength(0);
  });

  test('catalog page has no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/courses');
    await page.waitForTimeout(2000);

    const unexpected = errors.filter(
      (e) => !e.includes('Failed to fetch') && !e.includes('NetworkError')
    );
    expect(unexpected).toHaveLength(0);
  });
});
