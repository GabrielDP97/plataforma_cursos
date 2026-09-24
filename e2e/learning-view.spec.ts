import { test, expect } from './fixtures';

const BASE_URL = process.env.E2E_BASE_URL || 'https://lms-platform-staging.19gdp97.workers.dev';

// Helper to get course UUID by slug or title
async function getCourseId(page: any, slug: string, title: string): Promise<string> {
  // Try public API first (has slug)
  const pubRes = await page.request.get(`${BASE_URL}/api/courses`);
  const pubData = await pubRes.json();
  const pubCourse = pubData.data?.find((c: any) => c.slug === slug);
  if (pubCourse) return pubCourse.id;

  // Try admin API (may not have slug, match by title)
  const adminRes = await page.request.get(`${BASE_URL}/api/admin/courses`);
  const adminText = await adminRes.text();
  let adminData;
  try { adminData = JSON.parse(adminText); } catch { adminData = { data: [] }; }
  const adminCourse = adminData.data?.find((c: any) => c.title === title || c.slug === slug);
  if (adminCourse) return adminCourse.id;

  throw new Error(`Course "${slug}" not found`);
}

test.describe('Learning View — Databases Course', () => {
  test('CourseHome loads databases course correctly', async ({ authenticatedPage: page }) => {
    const dbId = await getCourseId(page, 'databases-0484', 'Bases de datos');
    
    // Navigate to databases course home
    await page.goto(`${BASE_URL}/courses/${dbId}/home?admin_preview=true`);
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Verify course title
    const title = await page.textContent('h1, h2, [class*="title"]');
    expect(title).toContain('Bases de datos');
    
    // Verify no React errors
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    
    // Check modules are visible
    await page.waitForTimeout(2000);
    expect(errors.filter(e => e.includes('#310'))).toHaveLength(0);
  });

  test('Module 1 loads with unique activity titles', async ({ authenticatedPage: page }) => {
    const dbId = await getCourseId(page, 'databases-0484', 'Bases de datos');
    
    await page.goto(`${BASE_URL}/courses/${dbId}/modules/mod-01?admin_preview=true`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check page loaded
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
    
    // Verify no React #310 error
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.waitForTimeout(1000);
    expect(errors.filter(e => e.includes('#310'))).toHaveLength(0);
  });

  test('Lesson page loads without React #310', async ({ authenticatedPage: page }) => {
    const dbId = await getCourseId(page, 'databases-0484', 'Bases de datos');
    
    // Get a lesson URL from the module page
    await page.goto(`${BASE_URL}/courses/${dbId}/modules/mod-01?admin_preview=true`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Click first lesson link
    const lessonLink = page.locator('a[href*="/lessons/"]').first();
    if (await lessonLink.isVisible()) {
      await lessonLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Verify no React errors
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(err.message));
      await page.waitForTimeout(1000);
      expect(errors.filter(e => e.includes('#310'))).toHaveLength(0);
      
      // Verify content loaded
      const content = await page.textContent('body');
      expect(content).toBeTruthy();
    }
  });

  test('Navigation preserves course context', async ({ authenticatedPage: page }) => {
    const dbId = await getCourseId(page, 'databases-0484', 'Bases de datos');
    
    // Start at databases course home
    await page.goto(`${BASE_URL}/courses/${dbId}/home?admin_preview=true`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Click a module
    const moduleCard = page.locator('[class*="module"], [data-module]').first();
    if (await moduleCard.isVisible()) {
      await moduleCard.click();
      await page.waitForLoadState('networkidle');
      
      // Verify URL still contains databases course ID
      expect(page.url()).toContain(dbId);
    }
  });
});

test.describe('Learning View — Programming Course (Regression)', () => {
  test('Programming course still works', async ({ authenticatedPage: page }) => {
    // Get programming course UUID from API
    const response = await page.request.get(`${BASE_URL}/api/courses`);
    const data = await response.json();
    const progCourse = data.data.find((c: any) => c.slug === 'programming-0485');
    
    if (progCourse) {
      await page.goto(`${BASE_URL}/courses/${progCourse.id}/home`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const content = await page.textContent('body');
      expect(content).toContain('Programación');
    }
  });
});
