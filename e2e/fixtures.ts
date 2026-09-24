import { test as base, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'https://lms-platform-staging.19gdp97.workers.dev';
const USERNAME = process.env.E2E_USERNAME;
const PASSWORD = process.env.E2E_PASSWORD;

if (!USERNAME || !PASSWORD) {
  throw new Error('E2E_USERNAME and E2E_PASSWORD environment variables are required');
}

export const test = base.extend<{ authenticatedPage: any }>({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="username"], input[placeholder*="usuario"], input[placeholder*="Username"]', USERNAME);
    await page.fill('input[name="password"], input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 10000 });

    await use(page);
    await context.close();
  },
});

export { expect };
