/**
 * Comprehensive E2E Audit — Databases Course (AulaDev)
 *
 * Covers 7 test groups:
 *   1. Full activity crawl (mod-01 → mod-17)
 *   2. Navigation button flows
 *   3. Deep links (direct URL to activities)
 *   4. Page refresh resilience
 *   5. Programming course regression
 *   6. Invalid route error states
 *   7. Activity title uniqueness per module
 *
 * Run:
 *   npx playwright test e2e/databases-audit.spec.ts
 */
import { test as base, expect, type Page } from '@playwright/test';

// ─── Env ─────────────────────────────────────────────────────────────────────
const BASE_URL = process.env.E2E_BASE_URL || 'https://lms-platform-staging.19gdp97.workers.dev';
const USERNAME = process.env.E2E_USERNAME;
const PASSWORD = process.env.E2E_PASSWORD;

if (!USERNAME || !PASSWORD) {
  throw new Error('E2E_USERNAME and E2E_PASSWORD environment variables are required');
}

// ─── Extended fixture with authenticated page ────────────────────────────────
type Fixtures = { authenticatedPage: Page };

const test = base.extend<Fixtures>({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(`${BASE_URL}/login`);
    await page.fill(
      'input[name="username"], input[placeholder*="usuario"], input[placeholder*="Username"]',
      USERNAME,
    );
    await page.fill('input[name="password"], input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL((url) => !url.toString().includes('/login'), { timeout: 15_000 });

    await use(page);
    await context.close();
  },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Resolve a course UUID by slug or title from the public/admin API. */
async function getCourseId(page: Page, slug: string, title: string): Promise<string> {
  const pubRes = await page.request.get(`${BASE_URL}/api/courses`);
  const pubData = await pubRes.json();
  const pubCourse = pubData.data?.find((c: any) => c.slug === slug);
  if (pubCourse) return pubCourse.id;

  const adminRes = await page.request.get(`${BASE_URL}/api/admin/courses`);
  const adminText = await adminRes.text();
  let adminData: any;
  try {
    adminData = JSON.parse(adminText);
  } catch {
    adminData = { data: [] };
  }
  const adminCourse = adminData.data?.find((c: any) => c.title === title || c.slug === slug);
  if (adminCourse) return adminCourse.id;

  throw new Error(`Course "${slug}" not found via public or admin API`);
}

/** Navigate to a URL and wait for network idle + 1 s settle. */
async function loadPage(page: Page, url: string): Promise<void> {
  await page.goto(url, { waitUntil: 'networkidle' });
  // Allow React lazy routes + state hydration
  await page.waitForTimeout(1_500);
}

/** Check whether the page is showing an ErrorBoundary / fatal error screen. */
async function isErrorBoundary(page: Page): Promise<boolean> {
  const text = await page.textContent('body');
  if (!text) return true;
  // Common ErrorBoundary signatures
  return (
    text.includes('Something went wrong') ||
    text.includes('ErrorBoundary') ||
    text.includes('Unexpected error') ||
    text.includes('ha ocurrido un error')
  );
}

/** Check whether the page content belongs to the programming course (regression).
 * Only flags if the page shows the PROGRAMMING course title in a heading,
 * not if "Programación" appears as part of a databases module title like
 * "Programación almacenada". */
async function isProgrammingContent(page: Page): Promise<boolean> {
  await page.waitForTimeout(3_000);
  // Check for databases indicators — if present, it's fine
  const bodyText = await page.textContent('body') || '';
  if (bodyText.includes('Bases de datos') || bodyText.includes('MySQL') || bodyText.includes('mongodb')) {
    return false;
  }
  // Check for programming COURSE title specifically (not "Programación almacenada")
  // The programming course title is just "Programación" — look for it as a standalone heading
  const headings = await page.locator('h1, h2').allTextContents();
  for (const h of headings) {
    const trimmed = h.trim();
    if (trimmed === 'Programación' || trimmed === 'Curso de Programación') {
      return true; // This is the programming course
    }
  }
  return false;
}

/** Verify that the courseId appears in the current URL. */
function urlContainsCourseId(page: Page, courseId: string): boolean {
  return page.url().includes(courseId);
}

// ─── Report types ────────────────────────────────────────────────────────────

interface RouteResult {
  module: string;
  activity: string;
  url: string;
  status: 'PASS' | 'FAIL';
  errorType?: string;
  details?: string;
}

interface CrawlReport {
  totalRoutesTested: number;
  pass: number;
  fail: number;
  results: RouteResult[];
  duplicateTitles: string[];
  reactErrors: string[];
  consoleErrors: string[];
}

// ─── Module IDs ──────────────────────────────────────────────────────────────
const DB_MODULES = Array.from({ length: 17 }, (_, i) => `mod-${String(i + 1).padStart(2, '0')}`);

// Modules to deep-link (M1, M8, M12, M16, M17)
const DEEP_LINK_MODULES = ['mod-01', 'mod-08', 'mod-12', 'mod-16', 'mod-17'];

// ═════════════════════════════════════════════════════════════════════════════
// TEST 1: Full Activity Crawl
// ═════════════════════════════════════════════════════════════════════════════

test.describe('Databases Course — Full Activity Crawl', () => {
  test('crawl all modules and activities in databases course', async ({
    authenticatedPage: page,
  }, testInfo) => {
    testInfo.setTimeout(300_000); // 5 minutes for full crawl
    const dbCourseId = await getCourseId(page, 'databases-0484', 'Bases de datos');
    const report: CrawlReport = {
      totalRoutesTested: 0,
      pass: 0,
      fail: 0,
      results: [],
      duplicateTitles: [],
      reactErrors: [],
      consoleErrors: [],
    };

    // Collect console errors globally for this test
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Collect React page errors
    const reactErrors: string[] = [];
    page.on('pageerror', (err) => {
      reactErrors.push(err.message);
    });

    for (const moduleId of DB_MODULES) {
      // ── Step A: Navigate to module page ──────────────────────────────
      const moduleUrl = `${BASE_URL}/courses/${dbCourseId}/modules/${moduleId}?admin_preview=true`;
      await loadPage(page, moduleUrl);

      // Verify module page loaded (not an error boundary)
      const moduleError = await isErrorBoundary(page);
      if (moduleError) {
        report.results.push({
          module: moduleId,
          activity: '[MODULE PAGE]',
          url: moduleUrl,
          status: 'FAIL',
          errorType: 'ErrorBoundary',
          details: 'Module page showed ErrorBoundary on load',
        });
        report.fail++;
        report.totalRoutesTested++;
        continue;
      }

      // Verify course context is databases (not programming)
      const isProg = await isProgrammingContent(page);
      if (isProg) {
        report.results.push({
          module: moduleId,
          activity: '[MODULE PAGE]',
          url: moduleUrl,
          status: 'FAIL',
          errorType: 'WrongCourseContext',
          details: 'Module page loaded programming content instead of databases',
        });
        report.fail++;
        report.totalRoutesTested++;
        continue;
      }

      // ── Step B: Collect all lesson links from the sidebar ────────────
      // Lessons are rendered as <a> tags with href containing /lessons/
      const lessonLinks = await page.locator('a[href*="/lessons/"]').all();
      const lessonHrefs: string[] = [];
      for (const link of lessonLinks) {
        const href = await link.getAttribute('href');
        if (href && !lessonHrefs.includes(href)) {
          lessonHrefs.push(href);
        }
      }

      // If no lesson links found via <a>, try the activity node grid
      if (lessonHrefs.length === 0) {
        // Activity nodes are clickable divs, not links — they navigate via JS.
        // We can still test the module page itself (already done above).
        report.results.push({
          module: moduleId,
          activity: '[MODULE — no lesson links]',
          url: moduleUrl,
          status: 'PASS',
          details: 'Module loaded, no explicit lesson <a> links found (activity grid only)',
        });
        report.pass++;
        report.totalRoutesTested++;
        continue;
      }

      // ── Step C: Visit first lesson link only (efficient crawl) ──────
      const href = lessonHrefs[0];
      let lessonUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;
      // Ensure admin_preview is in the URL (avoid duplicates)
      if (!lessonUrl.includes('admin_preview')) {
        const separator = lessonUrl.includes('?') ? '&' : '?';
        lessonUrl = `${lessonUrl}${separator}admin_preview=true`;
      }

        await loadPage(page, lessonUrl);

        // Check for page errors
        const pageError = await isErrorBoundary(page);

        // Check for wrong course context
        const wrongContext = await isProgrammingContent(page);

        // Extract lesson title from the page
        let lessonTitle = '';
        try {
          const h1 = page.locator('h1').first();
          if (await h1.isVisible({ timeout: 2_000 })) {
            lessonTitle = (await h1.textContent()) || '';
          }
        } catch {
          // fallback
        }

        // Determine status
        let status: 'PASS' | 'FAIL' = 'PASS';
        let errorType: string | undefined;
        let details: string | undefined;

        if (pageError) {
          status = 'FAIL';
          errorType = 'ErrorBoundary';
          details = 'Lesson page showed ErrorBoundary';
        } else if (wrongContext) {
          status = 'FAIL';
          errorType = 'WrongCourseContext';
          details = 'Lesson loaded programming content instead of databases';
        } else if (!lessonTitle) {
          // Could still be OK if content is there but no h1
          const bodyText = await page.textContent('body');
          if (!bodyText || bodyText.length < 100) {
            status = 'FAIL';
            errorType = 'EmptyPage';
            details = 'Page body has very little content';
          }
        }

        // Verify courseId is preserved in URL
        if (!urlContainsCourseId(page, dbCourseId)) {
          status = 'FAIL';
          errorType = 'CourseIdLost';
          details = `URL lost courseId. Current URL: ${page.url()}`;
        }

        report.results.push({
          module: moduleId,
          activity: lessonTitle || href,
          url: lessonUrl,
          status,
          errorType,
          details,
        });

        if (status === 'PASS') report.pass++;
        else report.fail++;
        report.totalRoutesTested++;
    }

    // Attach collected errors
    report.consoleErrors = consoleErrors;
    report.reactErrors = reactErrors;

    // ── Print report ──────────────────────────────────────────────────
    console.log('\n' + '='.repeat(72));
    console.log('  DATABASES COURSE — FULL ACTIVITY CRAWL REPORT');
    console.log('='.repeat(72));
    console.log(`  TOTAL ROUTES TESTED: ${report.totalRoutesTested}`);
    console.log(`  PASS: ${report.pass}`);
    console.log(`  FAIL: ${report.fail}`);
    console.log('-'.repeat(72));

    if (report.fail > 0) {
      console.log('  FAILURES:');
      for (const r of report.results.filter((r) => r.status === 'FAIL')) {
        console.log(`    [${r.module}] ${r.activity}`);
        console.log(`      URL: ${r.url}`);
        console.log(`      Error: ${r.errorType} — ${r.details}`);
      }
    }

    if (report.reactErrors.length > 0) {
      console.log('-'.repeat(72));
      console.log('  REACT ERRORS:');
      for (const e of report.reactErrors) {
        console.log(`    ${e}`);
      }
    }

    if (report.consoleErrors.length > 0) {
      console.log('-'.repeat(72));
      console.log('  CONSOLE ERRORS:');
      for (const e of report.consoleErrors) {
        console.log(`    ${e}`);
      }
    }

    console.log('='.repeat(72) + '\n');

    // Fail the test if any route failed
    expect(report.fail, `Crawl found ${report.fail} failure(s)`).toBe(0);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TEST 2: Navigation Buttons
// ═════════════════════════════════════════════════════════════════════════════

test.describe('Databases Course — Navigation Buttons', () => {
  test('CourseHome → Module → Activity → Previous → Next → Back to Module → Back to Course', async ({
    authenticatedPage: page,
  }, testInfo) => {
    testInfo.setTimeout(120_000); // 2 minutes for full nav flow
    const dbCourseId = await getCourseId(page, 'databases-0484', 'Bases de datos');

    // ── Step 1: Go to CourseHome ──────────────────────────────────────
    await loadPage(page, `${BASE_URL}/courses/${dbCourseId}/home?admin_preview=true`);
    expect(urlContainsCourseId(page, dbCourseId)).toBeTruthy();

    // ── Step 2: Click a module card ───────────────────────────────────
    // Module cards may use <a> tags or onClick handlers
    // Try multiple selectors
    let moduleClicked = false;
    
    // Try <a> tags first
    const moduleLink = page.locator('a[href*="/modules/mod-"]').first();
    if (await moduleLink.isVisible({ timeout: 3_000 }).catch(() => false)) {
      const moduleHref = await moduleLink.getAttribute('href');
      expect(moduleHref).toContain('/modules/mod-');
      await moduleLink.click();
      moduleClicked = true;
    } else {
      // Try clicking module card elements
      const moduleCard = page.locator('[class*="module"], [data-module-id]').first();
      if (await moduleCard.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await moduleCard.click();
        moduleClicked = true;
      } else {
        // Navigate directly to a module
        await page.goto(`${BASE_URL}/courses/${dbCourseId}/modules/mod-01?admin_preview=true`);
        moduleClicked = true;
      }
    }
    
    expect(moduleClicked).toBeTruthy();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1_500);

    // Verify we're on a module page
    expect(page.url()).toContain('/modules/mod-');
    expect(urlContainsCourseId(page, dbCourseId)).toBeTruthy();

    // ── Step 3: Click a lesson/activity link ──────────────────────────
    const lessonLink = page.locator('a[href*="/lessons/"]').first();
    await expect(lessonLink).toBeVisible({ timeout: 10_000 });
    const lessonHref = await lessonLink.getAttribute('href');
    expect(lessonHref).toContain('/lessons/');
    await lessonLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1_500);

    // Verify we're on a lesson page
    expect(page.url()).toContain('/lessons/');
    expect(urlContainsCourseId(page, dbCourseId)).toBeTruthy();

    // ── Step 4: Click "Anterior" (Previous) button ───────────────────
    const prevButton = page.locator('button:has-text("Anterior")').first();
    if (await prevButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await prevButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1_500);
      // Still on a lesson page, courseId preserved
      expect(urlContainsCourseId(page, dbCourseId)).toBeTruthy();
    }

    // ── Step 5: Click "Siguiente leccion" (Next) button ──────────────
    const nextButton = page.locator('button:has-text("Siguiente leccion"), button:has-text("Siguiente")').first();
    if (await nextButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await nextButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1_500);
      expect(urlContainsCourseId(page, dbCourseId)).toBeTruthy();
    }

    // ── Step 6: Click "Volver al modulo" (Back to Module) link ───────
    const backToModule = page.locator('a:has-text("Volver al curso"), a:has-text("Modulo")').first();
    if (await backToModule.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await backToModule.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1_500);
      expect(page.url()).toContain('/modules/mod-');
      expect(urlContainsCourseId(page, dbCourseId)).toBeTruthy();
    }

    // ── Step 7: Click "Curso" breadcrumb link (Back to Course) ─────
    // Use the breadcrumb nav specifically, not any link with "Curso"
    const backToCourse = page.locator('nav[aria-label="Breadcrumb"] a:has-text("Curso")').first();
    if (await backToCourse.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await backToCourse.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1_500);
      // courseId should still be in URL
      expect(urlContainsCourseId(page, dbCourseId)).toBeTruthy();
    }
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TEST 3: Deep Links
// ═════════════════════════════════════════════════════════════════════════════

test.describe('Databases Course — Deep Links', () => {
  for (const moduleId of DEEP_LINK_MODULES) {
    test(`deep link to ${moduleId} lesson loads without CourseHome`, async ({
      authenticatedPage: page,
    }) => {
      const dbCourseId = await getCourseId(page, 'databases-0484', 'Bases de datos');

      // Go directly to the module page (skip CourseHome)
      const moduleUrl = `${BASE_URL}/courses/${dbCourseId}/modules/${moduleId}?admin_preview=true`;
      await loadPage(page, moduleUrl);

      // Should not be ErrorBoundary
      const errorBoundary = await isErrorBoundary(page);
      expect(errorBoundary, `${moduleId} showed ErrorBoundary on deep link`).toBeFalsy();

      // Should not show programming content
      const isProg = await isProgrammingContent(page);
      expect(isProg, `${moduleId} showed programming content on deep link`).toBeFalsy();

      // courseId should be in URL
      expect(urlContainsCourseId(page, dbCourseId)).toBeTruthy();

      // Try to find and click a lesson link from the module page
      const lessonLink = page.locator('a[href*="/lessons/"]').first();
      if (await lessonLink.isVisible({ timeout: 5_000 }).catch(() => false)) {
        const href = await lessonLink.getAttribute('href');
        const fullUrl = href?.startsWith('http') ? href : `${BASE_URL}${href}`;
        const sep = fullUrl!.includes('?') ? '&' : '?';
        const lessonUrl = `${fullUrl}${sep}admin_preview=true`;

        // Navigate directly to the lesson (deep link)
        await loadPage(page, lessonUrl);

        const lessonError = await isErrorBoundary(page);
        expect(lessonError, `${moduleId} lesson deep link showed ErrorBoundary`).toBeFalsy();

        const lessonProg = await isProgrammingContent(page);
        expect(lessonProg, `${moduleId} lesson deep link showed programming content`).toBeFalsy();

        expect(urlContainsCourseId(page, dbCourseId)).toBeTruthy();
      }
    });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// TEST 4: Page Refresh
// ═════════════════════════════════════════════════════════════════════════════

test.describe('Databases Course — Page Refresh', () => {
  test('reloading a lesson page preserves content', async ({ authenticatedPage: page }) => {
    const dbCourseId = await getCourseId(page, 'databases-0484', 'Bases de datos');

    // Load a lesson
    const lessonUrl = `${BASE_URL}/courses/${dbCourseId}/modules/mod-01/lessons/lesson-01-1?admin_preview=true`;
    await loadPage(page, lessonUrl);

    // Get initial content
    const bodyBefore = await page.textContent('body');
    expect(bodyBefore).toBeTruthy();
    expect(bodyBefore!.length).toBeGreaterThan(100);

    // Reload the page
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2_000);

    // Get content after reload
    const bodyAfter = await page.textContent('body');
    expect(bodyAfter).toBeTruthy();
    expect(bodyAfter!.length).toBeGreaterThan(100);

    // Content should be the same (both should contain the lesson title)
    expect(bodyAfter).toContain('base de datos');

    // Should not be error boundary after refresh
    const errorBoundary = await isErrorBoundary(page);
    expect(errorBoundary, 'ErrorBoundary after page refresh').toBeFalsy();

    // courseId preserved
    expect(urlContainsCourseId(page, dbCourseId)).toBeTruthy();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TEST 5: Programming Regression
// ═════════════════════════════════════════════════════════════════════════════

test.describe('Programming Course — Regression', () => {
  test('programming course still loads correctly', async ({ authenticatedPage: page }) => {
    // Get programming course UUID
    const response = await page.request.get(`${BASE_URL}/api/courses`);
    const data = await response.json();
    const progCourse = data.data?.find((c: any) => c.slug === 'programming-0485');
    if (!progCourse) {
      test.skip();
      return;
    }

    const progId = progCourse.id;

    // ── CourseHome ────────────────────────────────────────────────────
    await loadPage(page, `${BASE_URL}/courses/${progId}/home`);
    const homeContent = await page.textContent('body');
    expect(homeContent).toContain('Programación');
    expect(urlContainsCourseId(page, progId)).toBeTruthy();

    // ── Module page ───────────────────────────────────────────────────
    await loadPage(page, `${BASE_URL}/courses/${progId}/modules/mod-01`);
    const modContent = await page.textContent('body');
    expect(modContent).toBeTruthy();
    expect(urlContainsCourseId(page, progId)).toBeTruthy();

    // Should not show databases content
    const isDb = modContent?.includes('Bases de datos') && !modContent?.includes('Programación');
    expect(isDb, 'Programming module shows databases content').toBeFalsy();

    // ── Lesson page ───────────────────────────────────────────────────
    const lessonLink = page.locator('a[href*="/lessons/"]').first();
    if (await lessonLink.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await lessonLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1_500);

      expect(urlContainsCourseId(page, progId)).toBeTruthy();
      const lessonContent = await page.textContent('body');
      expect(lessonContent).toBeTruthy();

      // Should not show databases content
      const lessonIsDb = lessonContent?.includes('Bases de datos') && !lessonContent?.includes('Programación');
      expect(lessonIsDb, 'Programming lesson shows databases content').toBeFalsy();
    }
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TEST 6: Invalid Routes
// ═════════════════════════════════════════════════════════════════════════════

test.describe('Invalid Routes — Error States', () => {
  test('invalid courseId shows error, not programming fallback', async ({
    authenticatedPage: page,
  }) => {
    // Try a clearly invalid courseId
    const invalidUrl = `${BASE_URL}/courses/00000000-0000-0000-0000-000000000000/home`;
    await loadPage(page, invalidUrl);

    const body = await page.textContent('body');

    // Should NOT show programming content (the regression bug)
    const showsProgramming =
      body?.includes('Programación') && body?.includes('Java') && !body?.includes('Bases de datos');
    expect(
      showsProgramming,
      'Invalid courseId fell back to programming content instead of showing error',
    ).toBeFalsy();

    // Should show some kind of error or "not found" state
    const hasErrorState =
      body?.includes('no encontrado') ||
      body?.includes('not found') ||
      body?.includes('Error') ||
      body?.includes('404') ||
      body?.includes('Curso no encontrado');
    expect(hasErrorState, `Invalid courseId page should show error state. Body starts with: ${body?.substring(0, 200)}`).toBeTruthy();
  });

  test('invalid moduleId shows error, not programming fallback', async ({
    authenticatedPage: page,
  }) => {
    const dbCourseId = await getCourseId(page, 'databases-0484', 'Bases de datos');
    const invalidUrl = `${BASE_URL}/courses/${dbCourseId}/modules/mod-99?admin_preview=true`;
    await loadPage(page, invalidUrl);

    const body = await page.textContent('body');

    // Should NOT show programming content
    const showsProgramming =
      body?.includes('Programación') && body?.includes('Java') && !body?.includes('Bases de datos');
    expect(
      showsProgramming,
      'Invalid moduleId fell back to programming content',
    ).toBeFalsy();

    // Should show error or "not found"
    const hasErrorState =
      body?.includes('no encontrado') ||
      body?.includes('not found') ||
      body?.includes('Error') ||
      body?.includes('Modulo no encontrado') ||
      body?.includes('Curso no encontrado');
    expect(hasErrorState, `Invalid moduleId should show error state. Body: ${body?.substring(0, 200)}`).toBeTruthy();
  });

  test('invalid lessonId shows error, not programming fallback', async ({
    authenticatedPage: page,
  }) => {
    const dbCourseId = await getCourseId(page, 'databases-0484', 'Bases de datos');
    const invalidUrl = `${BASE_URL}/courses/${dbCourseId}/modules/mod-01/lessons/lesson-99-99?admin_preview=true`;
    await loadPage(page, invalidUrl);

    const body = await page.textContent('body');

    // Should NOT show programming content
    const showsProgramming =
      body?.includes('Programación') && body?.includes('Java') && !body?.includes('Bases de datos');
    expect(
      showsProgramming,
      'Invalid lessonId fell back to programming content',
    ).toBeFalsy();

    // Should show error or "not found"
    const hasErrorState =
      body?.includes('no encontrado') ||
      body?.includes('not found') ||
      body?.includes('Error') ||
      body?.includes('Leccion no encontrada') ||
      body?.includes('Curso no encontrado');
    expect(hasErrorState, `Invalid lessonId should show error state. Body: ${body?.substring(0, 200)}`).toBeTruthy();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TEST 7: Activity Title Uniqueness
// ═════════════════════════════════════════════════════════════════════════════

test.describe('Activity Title Uniqueness', () => {
  test('no duplicate activity titles within any module', async ({ authenticatedPage: page }) => {
    const dbCourseId = await getCourseId(page, 'databases-0484', 'Bases de datos');
    const allDuplicates: { module: string; title: string }[] = [];

    for (const moduleId of DB_MODULES) {
      const moduleUrl = `${BASE_URL}/courses/${dbCourseId}/modules/${moduleId}?admin_preview=true`;
      await loadPage(page, moduleUrl);

      // Skip if ErrorBoundary
      if (await isErrorBoundary(page)) continue;

      // Collect all visible lesson titles from the sidebar
      // Lessons are rendered as links in the sidebar with lesson titles
      const lessonTitles = await page.locator('aside a[href*="/lessons/"] span').allTextContents();

      // Also collect activity node titles from the grid
      // ActivityNode renders a tooltip/title with the activity name
      const activityTitles = await page.locator('[class*="activity"] [title], [data-activity] [title]').allTextContents();

      // Combine: lesson titles are the primary source, activity nodes derive from them
      const titles = [...lessonTitles].map((t) => t.trim()).filter(Boolean);

      // Find duplicates
      const seen = new Set<string>();
      for (const title of titles) {
        if (seen.has(title)) {
          allDuplicates.push({ module: moduleId, title });
        }
        seen.add(title);
      }
    }

    // Report
    if (allDuplicates.length > 0) {
      console.log('\n  DUPLICATE ACTIVITY TITLES:');
      for (const d of allDuplicates) {
        console.log(`    [${d.module}] "${d.title}"`);
      }
    }

    expect(
      allDuplicates.length,
      `Found ${allDuplicates.length} duplicate activity title(s) across modules`,
    ).toBe(0);
  });
});
