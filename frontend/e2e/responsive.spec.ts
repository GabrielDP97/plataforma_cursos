import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'mobile', width: 360, height: 640 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

const pages = ['/', '/courses', '/login', '/register'];

for (const viewport of viewports) {
  for (const path of pages) {
    test(`responsive ${viewport.name} — ${path}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(path);

      // Page loaded without crash
      await expect(page.locator('body')).toBeVisible();

      // No horizontal overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2); // +2 for subpixel rounding
    });
  }
}
