import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = [
  { name: 'Home', path: '/' },
  { name: 'Login', path: '/login' },
  { name: 'Register', path: '/register' },
  { name: 'Catalog', path: '/courses' },
];

for (const { name, path } of pages) {
  test(`accessibility — ${name}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForTimeout(2000);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Log violations for debugging
    if (results.violations.length > 0) {
      console.log(`\n=== ${name} Accessibility Violations ===`);
      for (const violation of results.violations) {
        console.log(`  ${violation.impact}: ${violation.description}`);
        console.log(`    Help: ${violation.helpUrl}`);
        for (const node of violation.nodes) {
          console.log(`    Element: ${node.html.substring(0, 100)}`);
        }
      }
    }

    // Expect no critical or serious violations
    const criticalViolations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(criticalViolations).toHaveLength(0);
  });
}
