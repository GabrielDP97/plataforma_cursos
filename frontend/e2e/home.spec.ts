import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('loads and shows hero heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Refuerza primero de DAM y DAW');
  });

  test('shows navigation links in header', async ({ page }) => {
    await page.goto('/');
    const headerNav = page.locator('header nav');
    await expect(headerNav.getByRole('link', { name: 'Cursos', exact: true })).toBeVisible();
  });

  test('hero CTA button is visible and links to catalog', async ({ page }) => {
    await page.goto('/');
    const heroBtn = page.getByRole('link', { name: 'Explorar cursos' }).first();
    await expect(heroBtn).toBeVisible();
    await expect(heroBtn).toContainText('Explorar cursos');
  });

  test('navigate to catalog from hero CTA', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Explorar cursos' }).first().click();
    await expect(page).toHaveURL(/\/courses/);
  });

  test('shows feature cards section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Explicaciones paso a paso' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ejercicios y practica real' })).toBeVisible();
  });

  test('shows content areas section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Programacion' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Bases de Datos' })).toBeVisible();
  });

  test('footer renders with platform links', async ({ page }) => {
    await page.goto('/');
    // Home page has its own footer inside the page component
    const pageFooter = page.locator('footer').first();
    await expect(pageFooter).toBeVisible();
    await expect(pageFooter.getByText('Catalogo de cursos')).toBeVisible();
  });
});
