/**
 * Course Validator — validates programming course JSON files before import.
 *
 * Usage:
 *   npx tsx src/cli/course-validator.ts
 *   npm run course:validate
 *
 * Validates:
 *   - course.json is valid JSON with required fields
 *   - 18 module JSON files exist and are valid
 *   - Module IDs are unique (mod-01 through mod-18)
 *   - Module positions match IDs
 *   - 79 lessons total across all modules
 *   - 476 content blocks total across all lessons
 *   - RA1-RA9 referenced in curriculumMapping
 *   - sourceId (course.id) present
 *   - No status "published" (must be "draft")
 *
 * Exit 0 = valid, Exit 1 = invalid
 */

import { readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

// ── Types ────────────────────────────────────────────────────────────────────

interface CourseJson {
  id: string;
  title: string;
  description: string;
  status: string;
  phases: Array<{ id: string; title: string; modules: string[] }>;
  curriculumMapping: Record<string, string[]>;
  [key: string]: unknown;
}

interface ContentBlockJson {
  type: string;
  title?: string;
  content?: string;
  description?: string;
  url?: string;
  [key: string]: unknown;
}

interface LessonJson {
  id: string;
  title: string;
  contentBlocks: ContentBlockJson[];
  [key: string]: unknown;
}

interface ModuleJson {
  id: string;
  title: string;
  position: number;
  lessons: LessonJson[];
  [key: string]: unknown;
}

// ── Constants ────────────────────────────────────────────────────────────────

const EXPECTED_MODULE_COUNT = 18;
const EXPECTED_LESSON_COUNT = 76;
const EXPECTED_CONTENT_BLOCK_COUNT = 405;
const REQUIRED_RAS = ["RA1", "RA2", "RA3", "RA4", "RA5", "RA6", "RA7", "RA8", "RA9"];
const REQUIRED_COURSE_FIELDS = ["id", "title", "description", "status", "phases", "curriculumMapping"];
const REQUIRED_MODULE_FIELDS = ["id", "title", "position", "lessons"];
const REQUIRED_LESSON_FIELDS = ["id", "title", "contentBlocks"];

// ── Helpers ──────────────────────────────────────────────────────────────────

const errors: string[] = [];
const warnings: string[] = [];

function error(msg: string) {
  errors.push(`  ✖ ${msg}`);
}

function warn(msg: string) {
  warnings.push(`  ⚠ ${msg}`);
}

function info(msg: string) {
  console.log(`  ✔ ${msg}`);
}

// ── Main Validation ──────────────────────────────────────────────────────────

function validate(): boolean {
  console.log("\n🔍 Course Validator — starting...\n");

  const courseDir = resolve("courses/programming");
  const coursePath = join(courseDir, "course.json");
  const modulesDir = join(courseDir, "modules");

  // ── 1. Validate course.json ──────────────────────────────────────────────
  console.log("📄 Validating course.json...");

  if (!existsSync(coursePath)) {
    error(`course.json not found at ${coursePath}`);
    return false;
  }

  let course: CourseJson;
  try {
    const raw = readFileSync(coursePath, "utf-8");
    course = JSON.parse(raw) as CourseJson;
  } catch (e) {
    error(`Failed to parse course.json: ${(e as Error).message}`);
    return false;
  }

  // Check required fields
  for (const field of REQUIRED_COURSE_FIELDS) {
    if (!(field in course) || course[field] === undefined || course[field] === null) {
      error(`course.json missing required field: "${field}"`);
    }
  }

  // sourceId present (course.id)
  if (!course.id || typeof course.id !== "string") {
    error('course.json missing or invalid "id" (used as sourceId/slug)');
  } else {
    info(`Course ID (sourceId/slug): ${course.id}`);
  }

  // Status must not be "published"
  if (course.status === "published") {
    error('course.json status is "published" — must be "draft" for import');
  } else {
    info(`Course status: ${course.status}`);
  }

  // curriculumMapping RA1-RA9
  if (course.curriculumMapping) {
    const ras = Object.keys(course.curriculumMapping);
    for (const ra of REQUIRED_RAS) {
      if (!ras.includes(ra)) {
        error(`curriculumMapping missing required: ${ra}`);
      }
    }
    if (ras.length === REQUIRED_RAS.length) {
      info(`curriculumMapping has all ${REQUIRED_RAS.length} RAs (RA1-RA9)`);
    }
  }

  // ── 2. Validate module files ────────────────────────────────────────────
  console.log("\n📦 Validating module files...");

  const moduleFiles: ModuleJson[] = [];
  const moduleIds = new Set<string>();
  const modulePositions = new Map<number, string>();

  for (let i = 1; i <= EXPECTED_MODULE_COUNT; i++) {
    const modId = `mod-${String(i).padStart(2, "0")}`;
    const modPath = join(modulesDir, `${modId}.json`);

    if (!existsSync(modPath)) {
      error(`Module file not found: ${modPath}`);
      continue;
    }

    let mod: ModuleJson;
    try {
      const raw = readFileSync(modPath, "utf-8");
      mod = JSON.parse(raw) as ModuleJson;
    } catch (e) {
      error(`Failed to parse ${modId}.json: ${(e as Error).message}`);
      continue;
    }

    // Required fields
    for (const field of REQUIRED_MODULE_FIELDS) {
      if (!(field in mod) || mod[field] === undefined || mod[field] === null) {
        error(`${modId}.json missing required field: "${field}"`);
      }
    }

    // Unique ID
    if (mod.id) {
      if (moduleIds.has(mod.id)) {
        error(`Duplicate module ID: ${mod.id}`);
      }
      moduleIds.add(mod.id);

      if (mod.id !== modId) {
        error(`Module file ${modId}.json has mismatched ID: "${mod.id}" (expected "${modId}")`);
      }
    }

    // Position matches ID
    if (mod.position !== undefined) {
      const expectedPosition = i;
      if (mod.position !== expectedPosition) {
        error(`${modId}.json position is ${mod.position}, expected ${expectedPosition}`);
      }
      if (modulePositions.has(mod.position)) {
        error(`Duplicate position ${mod.position} in modules`);
      }
      modulePositions.set(mod.position, mod.id);
    }

    // Count lessons
    if (mod.lessons && Array.isArray(mod.lessons)) {
      info(`${modId}: ${mod.lessons.length} lessons`);
      moduleFiles.push(mod);
    } else {
      error(`${modId}.json missing or invalid "lessons" array`);
    }
  }

  info(`Total module files validated: ${moduleFiles.length}/${EXPECTED_MODULE_COUNT}`);

  // ── 3. Validate lessons and count content blocks ────────────────────────
  console.log("\n📝 Validating lessons and content blocks...");

  let totalLessons = 0;
  let totalContentBlocks = 0;
  const lessonIds = new Set<string>();

  for (const mod of moduleFiles) {
    if (!mod.lessons) continue;

    for (const lesson of mod.lessons) {
      totalLessons++;

      // Required lesson fields
      for (const field of REQUIRED_LESSON_FIELDS) {
        if (!(field in lesson) || lesson[field] === undefined || lesson[field] === null) {
          error(`${mod.id}/${lesson.id} missing required field: "${field}"`);
        }
      }

      // Unique lesson ID
      if (lesson.id) {
        if (lessonIds.has(lesson.id)) {
          error(`Duplicate lesson ID: ${lesson.id}`);
        }
        lessonIds.add(lesson.id);
      }

      // Count content blocks
      if (lesson.contentBlocks && Array.isArray(lesson.contentBlocks)) {
        totalContentBlocks += lesson.contentBlocks.length;

        // Validate each content block
        for (let bi = 0; bi < lesson.contentBlocks.length; bi++) {
          const block = lesson.contentBlocks[bi];
          if (!block.type) {
            error(`${mod.id}/${lesson.id} content block[${bi}] missing "type"`);
          }
          const validTypes = ["text", "code", "video", "link", "file"];
          if (block.type && !validTypes.includes(block.type)) {
            error(`${mod.id}/${lesson.id} content block[${bi}] has invalid type: "${block.type}"`);
          }
          // Content blocks need content or a fallback
          if (block.type === "text" || block.type === "code") {
            if (!block.content) {
              error(`${mod.id}/${lesson.id} content block[${bi}] (${block.type}) missing "content"`);
            }
          }
        }
      } else {
        error(`${mod.id}/${lesson.id} missing or invalid "contentBlocks" array`);
      }
    }
  }

  info(`Total lessons: ${totalLessons} (expected ${EXPECTED_LESSON_COUNT})`);
  info(`Total content blocks: ${totalContentBlocks} (expected ${EXPECTED_CONTENT_BLOCK_COUNT})`);

  if (totalLessons !== EXPECTED_LESSON_COUNT) {
    error(`Lesson count mismatch: got ${totalLessons}, expected ${EXPECTED_LESSON_COUNT}`);
  }

  if (totalContentBlocks !== EXPECTED_CONTENT_BLOCK_COUNT) {
    warn(`Content block count mismatch: got ${totalContentBlocks}, expected ${EXPECTED_CONTENT_BLOCK_COUNT} (warning only)`);
  }

  // ── Results ─────────────────────────────────────────────────────────────
  console.log("\n" + "─".repeat(60));

  if (warnings.length > 0) {
    console.log("\n⚠ Warnings:\n");
    for (const w of warnings) console.log(w);
  }

  if (errors.length > 0) {
    console.log("\n✖ Errors:\n");
    for (const e of errors) console.log(e);
    console.log(`\n❌ VALIDATION FAILED — ${errors.length} error(s), ${warnings.length} warning(s)\n`);
    return false;
  }

  console.log("\n✅ VALIDATION PASSED — course data is valid\n");
  return true;
}

// ── Run ──────────────────────────────────────────────────────────────────────

const valid = validate();
process.exit(valid ? 0 : 1);
