#!/usr/bin/env node
/**
 * Section Validator
 *
 * Reads all 18 module JSONs, derives sections for each lesson, and validates:
 *   1. Every section has a title
 *   2. Every block belongs to a section (no orphan blocks)
 *   3. No duplicate section IDs
 *   4. Section order is sequential
 *
 * Reports section counts per lesson and any validation errors.
 */

const fs = require('fs');
const path = require('path');

// ── Section derivation (mirrors deriveSections.ts) ────────────────────────────

const CONTINUATION_PATTERNS = [
  /^ejemplo[s]?\s+del?\s/i,
  /^ejemplo[s]?\s+completo/i,
  /^ejemplo[s]?\s+de\s+una?\s/i,
  /^más\s+sobre/i,
  /^continuación/i,
  /^más\s+ejemplos/i,
  /^otros\s+ejemplos/i,
  /^resumen\s+del/i,
];

const SECTION_START_PATTERNS = [
  /^\¿/,
  /^qué\s+es/i,
  /^mi\s+primer/i,
  /^análisis/i,
  /^resumen/i,
  /^conceptos/i,
  /^práctica/i,
  /^laboratorio/i,
  /^checkpoint/i,
  /^ejercicio/i,
];

function isNewSectionStart(block, existingSections) {
  if (existingSections.length === 0) return true;
  // Allow code blocks with section-start titles to also start sections
    // (e.g., 'Mi primer programa: Hola, mundo' as a code block)
    if (block.type !== 'text' && block.type !== 'code') return false;
    if (block.type === 'code' && !SECTION_START_PATTERNS.some((p) => p.test((block.title || '').trim()))) return false;

  const title = (block.title || '').trim();
  if (!title) return false;

  if (CONTINUATION_PATTERNS.some((p) => p.test(title))) return false;
  if (SECTION_START_PATTERNS.some((p) => p.test(title))) return true;

  return true;
}

function inferSectionType(title) {
  if (/^\¿|qué\s+es/i.test(title)) return 'theory';
  if (/análisis/i.test(title)) return 'code_analysis';
  if (/ejemplo/i.test(title)) return 'code_example';
  if (/resumen/i.test(title)) return 'summary';
  if (/conceptos/i.test(title)) return 'theory';
  if (/ejercicio/i.test(title)) return 'exercise';
  if (/laboratorio|lab\b/i.test(title)) return 'lab';
  if (/checkpoint/i.test(title)) return 'checkpoint';
  if (/práctica/i.test(title)) return 'exercise';
  if (/documentación/i.test(title)) return 'documentation';
  return 'theory';
}

function deriveSections(contentBlocks, exercises) {
  const sections = [];
  let currentSection = null;

  for (const block of contentBlocks) {
    const isNew = isNewSectionStart(block, sections);

    if (isNew) {
      const title = (block.title || '').trim() || `Apartado ${sections.length + 1}`;
      currentSection = {
        id: `section-${sections.length + 1}`,
        title,
        type: inferSectionType(title),
        blocks: [block],
        order: sections.length + 1,
      };
      sections.push(currentSection);
    } else if (currentSection) {
      currentSection.blocks.push(block);
    }
  }

  if (exercises && exercises.length > 0) {
    sections.push({
      id: `section-${sections.length + 1}`,
      title: 'Ejercicios',
      type: 'exercise',
      blocks: [],
      order: sections.length + 1,
    });
  }

  return sections;
}

// ── Validation ────────────────────────────────────────────────────────────────

function validateModule(module) {
  const errors = [];
  const warnings = [];
  const lessonSummaries = [];

  for (const lesson of module.lessons) {
    const sections = deriveSections(lesson.contentBlocks, lesson.exercises || []);
    const totalBlocks = lesson.contentBlocks.length;
    const blocksInSections = sections.reduce((sum, s) => sum + s.blocks.length, 0);

    // Check: every section has a title
    for (const section of sections) {
      if (!section.title || section.title.trim() === '') {
        errors.push(`  [ERROR] ${lesson.id} → ${section.id}: missing title`);
      }
    }

    // Check: no orphan blocks
    if (blocksInSections !== totalBlocks) {
      const orphanCount = totalBlocks - blocksInSections;
      errors.push(
        `  [ERROR] ${lesson.id}: ${orphanCount} orphan block(s) (${blocksInSections} in sections vs ${totalBlocks} total)`,
      );
    }

    // Check: section IDs are unique within the lesson
    const ids = sections.map((s) => s.id);
    const uniqueIds = new Set(ids);
    if (uniqueIds.size !== ids.length) {
      errors.push(`  [ERROR] ${lesson.id}: duplicate section IDs`);
    }

    // Check: section order is sequential
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].order !== i + 1) {
        errors.push(
          `  [WARN] ${lesson.id}: section ${sections[i].id} has order ${sections[i].order}, expected ${i + 1}`,
        );
      }
    }

    // Warn if only 1 section (not really a section split)
    if (sections.length === 1) {
      warnings.push(`  [WARN] ${lesson.id}: only 1 section (no split needed)`);
    }

    lessonSummaries.push({
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      totalBlocks,
      sectionCount: sections.length,
      sections: sections.map((s) => ({
        id: s.id,
        title: s.title,
        type: s.type,
        blockCount: s.blocks.length,
      })),
    });
  }

  return { errors, warnings, lessonSummaries };
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  const modulesDir = path.join(__dirname, 'modules');

  if (!fs.existsSync(modulesDir)) {
    console.error(`Modules directory not found: ${modulesDir}`);
    process.exit(1);
  }

  const moduleFiles = fs.readdirSync(modulesDir).filter((f) => f.endsWith('.json')).sort();
  console.log(`\nValidating ${moduleFiles.length} modules...\n`);

  let totalErrors = 0;
  let totalWarnings = 0;
  let totalLessons = 0;
  let totalSections = 0;

  for (const file of moduleFiles) {
    const filePath = path.join(modulesDir, file);
    const module = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    console.log(`── ${module.id}: ${module.title} ──`);
    console.log(`   ${module.lessons.length} lessons`);

    const { errors, warnings, lessonSummaries } = validateModule(module);

    for (const ls of lessonSummaries) {
      totalLessons++;
      totalSections += ls.sectionCount;

      const sectionDetails = ls.sections
        .map((s) => `${s.title} (${s.blockCount} blocks, ${s.type})`)
        .join('\n         ');

      console.log(
        `\n   📘 ${ls.lessonId}: ${ls.lessonTitle}` +
        `\n      ${ls.sectionCount} section(s), ${ls.totalBlocks} blocks` +
        (ls.sectionCount > 1 ? '' : ' (single section)') +
        (sectionDetails ? `\n         ${sectionDetails}` : ''),
      );
    }

    if (errors.length > 0) {
      console.log('\n   ERRORS:');
      for (const e of errors) console.log(e);
      totalErrors += errors.length;
    }

    if (warnings.length > 0) {
      console.log('\n   WARNINGS:');
      for (const w of warnings) console.log(w);
      totalWarnings += warnings.length;
    }

    if (errors.length === 0 && warnings.length === 0) {
      console.log('   ✅ All valid');
    }

    console.log('');
  }

  // Summary
  console.log('═'.repeat(60));
  console.log('SUMMARY');
  console.log('═'.repeat(60));
  console.log(`Modules:    ${moduleFiles.length}`);
  console.log(`Lessons:    ${totalLessons}`);
  console.log(`Sections:   ${totalSections}`);
  console.log(`Avg blocks: ${(totalSections > 0 ? totalSections : 1)}`);
  console.log(`Errors:     ${totalErrors}`);
  console.log(`Warnings:   ${totalWarnings}`);
  console.log('═'.repeat(60));

  if (totalErrors > 0) {
    console.log('\n❌ Validation FAILED');
    process.exit(1);
  } else {
    console.log('\n✅ Validation PASSED');
  }
}

main();
