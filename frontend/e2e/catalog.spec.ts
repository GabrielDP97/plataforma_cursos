import { test, expect } from '@playwright/test';

test.describe('Catalog', () => {
  test('catalog page loads with heading', async ({ page }) => {
    await page.goto('/courses');
    await expect(page.getByRole('heading', { name: /catálogo de cursos/i })).toBeVisible();
  });

  test('search input is visible and functional', async ({ page }) => {
    await page.goto('/courses');
    const searchInput = page.getByLabel('Buscar cursos');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Java');
    await expect(searchInput).toHaveValue('Java');
  });

  test('shows course grid or empty state', async ({ page }) => {
    await page.goto('/courses');
    // Wait for API response to settle
    await page.waitForLoadState('networkidle');
    // Either courses are shown or empty state appears
    const courseCards = page.locator('[class*="grid"] a[href*="/courses/"]');
    const emptyState = page.getByText('No se encontraron cursos');
    const hasContent = await courseCards.count() > 0;
    const hasEmpty = await emptyState.count() > 0;
    expect(hasContent || hasEmpty).toBeTruthy();
  });

  test('course cards link to course detail', async ({ page }) => {
    await page.goto('/courses');
    await page.waitForLoadState('networkidle');
    const firstCourse = page.locator('a[href^="/courses/"]').first();
    if (await firstCourse.count() > 0) {
      await expect(firstCourse).toBeVisible();
      const href = await firstCourse.getAttribute('href');
      expect(href).toMatch(/^\/courses\/[^/]+$/);
    }
  });

  test('search updates URL params', async ({ page }) => {
    await page.goto('/courses');
    const searchInput = page.getByLabel('Buscar cursos');
    await searchInput.fill('Python');
    await page.waitForTimeout(500);
    expect(page.url()).toContain('q=Python');
  });
});
