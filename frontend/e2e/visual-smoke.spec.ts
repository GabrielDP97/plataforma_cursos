import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'mobile-360', width: 360, height: 640 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1024', width: 1024, height: 768 },
  { name: 'desktop-1440', width: 1440, height: 900 },
];

const pages = ['/', '/courses', '/login', '/register'];

for (const viewport of viewports) {
  for (const path of pages) {
    test(`visual smoke ${viewport.name} — ${path}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(path);
      await page.waitForTimeout(1000);

      // No horizontal scroll
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const clientWidth = await page.evaluate(() => document.body.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

      // No visible overflow
      const overflowX = await page.evaluate(() => {
        const html = document.documentElement;
        return html.scrollWidth > html.clientWidth;
      });
      expect(overflowX).toBe(false);

      // Body is visible
      await expect(page.locator('body')).toBeVisible();

      // No broken images
      const brokenImages = await page.evaluate(() => {
        const imgs = document.querySelectorAll('img');
        return Array.from(imgs).filter((img) => !img.complete || img.naturalWidth === 0).length;
      });
      expect(brokenImages).toBe(0);
    });
  }
}
