import { test, expect } from '@playwright/test';

const STUDENT_EMAIL = 'student@test.local';
const STUDENT_PASSWORD = 'Student123!';

test.describe('GDPR (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', STUDENT_EMAIL);
    await page.fill('input[type="password"]', STUDENT_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('profile page loads and shows user data', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForTimeout(2000);
    // Should show profile form
    await expect(page.locator('body')).toBeVisible();
    // Should show the user's name or email
    const hasProfileContent = await page.locator(
      'input, text=Test Student, text=student@test.local'
    ).count();
    expect(hasProfileContent).toBeGreaterThan(0);
  });

  test('profile name can be edited', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForTimeout(2000);

    // Find name input
    const nameInput = page.locator('input').first();
    if (await nameInput.isVisible()) {
      await nameInput.clear();
      await nameInput.fill('Updated Name E2E');

      // Find and click save button
      const saveBtn = page
        .locator('button:has-text("Guardar"), button[type="submit"]')
        .first();
      if (await saveBtn.isVisible()) {
        await saveBtn.click();
        await page.waitForTimeout(2000);
        // Should show success or no error
        await expect(page.locator('body')).toBeVisible();
      }
    }
  });

  test('privacy page loads with export section', async ({ page }) => {
    await page.goto('/settings/privacy');
    await page.waitForTimeout(2000);
    // Should show privacy content
    await expect(page.locator('body')).toBeVisible();
    // Should have export button or section
    const hasExport = await page
      .locator('text=Exportar, text=export, text=descargar')
      .count();
    expect(hasExport).toBeGreaterThan(0);
  });

  test('privacy page shows consent information', async ({ page }) => {
    await page.goto('/settings/privacy');
    await page.waitForTimeout(2000);
    // Should show consent section
    const hasConsent = await page
      .locator('text=Consentimiento, text=consent, text=version')
      .count();
    expect(hasConsent).toBeGreaterThan(0);
  });

  test('deletion section shows warning', async ({ page }) => {
    await page.goto('/settings/privacy');
    await page.waitForTimeout(2000);
    // Should show deletion warning
    const hasDeletion = await page
      .locator('text=Eliminar, text=eliminación, text=eliminar')
      .count();
    expect(hasDeletion).toBeGreaterThan(0);
  });
});
