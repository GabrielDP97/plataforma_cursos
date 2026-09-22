import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('login page loads with heading', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();
  });

  test('register page loads with heading', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /crear cuenta/i })).toBeVisible();
  });

  test('login form has email and password fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel('Correo electrónico')).toBeVisible();
    await expect(page.getByLabel('Contraseña')).toBeVisible();
  });

  test('register form has required fields', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByLabel('Nombre completo')).toBeVisible();
    await expect(page.getByLabel('Correo electrónico')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Contraseña*', exact: true })).toBeVisible();
    await expect(page.getByLabel('Confirmar contraseña')).toBeVisible();
  });

  test('login shows validation error for empty fields', async ({ page }) => {
    await page.goto('/login');
    // Disable native browser validation so empty required fields don't block submission.
    // Then our custom React validation catches the empty email.
    await page.locator('form').evaluate((form) => {
      form.setAttribute('novalidate', '');
      form.querySelectorAll('input').forEach((input) => input.removeAttribute('required'));
    });
    await page.click('button[type="submit"]');
    await expect(page.locator('[role="alert"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('login shows error for invalid email format', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Correo electrónico').fill('notanemail');
    await page.getByLabel('Contraseña').fill('password123');
    // Disable native validation so the invalid email doesn't block submission
    await page.locator('form').evaluate((form) => {
      form.setAttribute('novalidate', '');
      form.querySelectorAll('input').forEach((input) => input.removeAttribute('required'));
    });
    await page.click('button[type="submit"]');
    await expect(page.locator('[role="alert"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('login shows error for short password', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Correo electrónico').fill('test@test.com');
    await page.getByLabel('Contraseña').fill('short');
    await page.click('button[type="submit"]');
    await expect(page.locator('[role="alert"]').first()).toContainText('8 caracteres');
  });

  test('navigate from login to register', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: /regístrate gratis/i }).click();
    await expect(page).toHaveURL('/register');
  });

  test('navigate from register to login', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('link', { name: /inicia sesión/i }).click();
    await expect(page).toHaveURL('/login');
  });

  test('forgot password link is visible on login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('link', { name: /olvidaste tu contraseña/i })).toBeVisible();
  });
});
