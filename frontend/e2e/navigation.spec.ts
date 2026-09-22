import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('header logo links to home', async ({ page }) => {
    await page.goto('/courses');
    const logo = page.locator('a[href="/"]').first();
    await logo.click();
    await expect(page).toHaveURL('/');
  });

  test('404 page shows for unknown routes', async ({ page }) => {
    await page.goto('/nonexistent-page-12345');
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText('Página no encontrada')).toBeVisible();
  });

  test('404 page has link back to home', async ({ page }) => {
    await page.goto('/nonexistent-page-12345');
    const homeLink = page.getByRole('link', { name: /volver al inicio/i });
    await expect(homeLink).toBeVisible();
    await homeLink.click();
    await expect(page).toHaveURL('/');
  });

  test('sidebar navigation is visible on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    // AppSidebar renders navigation items — check for at least one nav link
    const sidebar = page.locator('nav, [role="navigation"]').first();
    await expect(sidebar).toBeVisible();
  });

  test('mobile menu button appears on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    // The header should have a mobile toggle button
    const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="Menú"], header button').first();
    await expect(menuButton).toBeVisible();
  });
});
