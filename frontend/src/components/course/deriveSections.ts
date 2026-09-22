/**
 * Section Derivation Utility
 *
 * Derives pedagogical sections from a lesson's flat content block list.
 * Each section groups related blocks (theory → example → analysis) into
 * a single navigable unit.
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type SectionType =
  | 'theory'
  | 'code_example'
  | 'code_analysis'
  | 'exercise'
  | 'documentation'
  | 'lab'
  | 'checkpoint'
  | 'summary';

export interface LessonSection {
  id: string;
  title: string;
  type: SectionType;
  blocks: ContentBlock[];
  order: number;
}

export interface ContentBlock {
  type: string;
  title?: string;
  content?: string;
  language?: string;
  duration?: string;
  description?: string;
  url?: string;
  metadata?: Record<string, unknown>;
}

// ── Continuation Patterns ──────────────────────────────────────────────────────

/**
 * Titles matching these patterns are continuations of the current section,
 * NOT new section starts.
 */
const CONTINUATION_PATTERNS: RegExp[] = [
  /^ejemplo[s]?\s+del?\s/i, // "Ejemplo del código anterior"
  /^ejemplo[s]?\s+completo/i, // "Ejemplo completo de ..."
  /^ejemplo[s]?\s+de\s+una?\s/i, // "Ejemplo de una función"
  /^más\s+sobre/i, // "Más sobre ..."
  /^continuación/i, // "Continuación de ..."
  /^más\s+ejemplos/i, // "Más ejemplos ..."
  /^otros\s+ejemplos/i, // "Otros ejemplos ..."
  /^resumen\s+del/i, // "Resumen del módulo"
];

/**
 * Titles matching these patterns ALWAYS start a new section.
 */
const SECTION_START_PATTERNS: RegExp[] = [
  /^\¿/, // "¿Qué es ...?"
  /^qué\s+es/i, // "Qué es ..." (without ¿)
  /^mi\s+primer/i, // "Mi primer programa"
  /^análisis/i, // "Análisis del código"
  /^resumen/i, // "Resumen"
  /^conceptos/i, // "Conceptos clave"
  /^práctica/i, // "Práctica"
  /^laboratorio/i, // "Laboratorio"
  /^checkpoint/i, // "Checkpoint"
  /^ejercicio/i, // "Ejercicio"
];

// ── Section Start Detection ────────────────────────────────────────────────────

/**
 * Determines if a content block starts a new section.
 *
 * Rules:
 * 1. First block in the lesson ALWAYS starts a section.
 * 2. Only `text` blocks can start new sections (code, video, link, file are
 *    subordinate to the current section).
 * 3. Text block with a title matching a continuation pattern → does NOT start.
 * 4. Text block with a title matching a section-start pattern → DOES start.
 * 5. Any other text block → DOES start (it introduces a new concept).
 */
function isNewSectionStart(
  block: ContentBlock,
  existingSections: LessonSection[],
): boolean {
  // Rule 1: First block always starts a section
  if (existingSections.length === 0) return true;

  const title = (block.title ?? '').trim();
  if (!title) return false;

  // Text blocks: continuation patterns do NOT start sections
  if (block.type === 'text') {
    if (CONTINUATION_PATTERNS.some((p) => p.test(title))) return false;
    if (SECTION_START_PATTERNS.some((p) => p.test(title))) return true;
    return true; // Any titled text block starts a section
  }

  // Code blocks: only start sections if title matches section-start patterns
  // This handles "Mi primer programa: Hola, mundo" etc.
  if (block.type === 'code' && SECTION_START_PATTERNS.some((p) => p.test(title))) {
    return true;
  }

  // Video, link, file: always subordinate
  return false;
}
// ── Section Type Inference ─────────────────────────────────────────────────────

/**
 * Infers the section type from the title of the first block.
 * Only text blocks start sections, so we only analyze text titles.
 */
function inferSectionType(title: string): SectionType {
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

// ── Main Function ──────────────────────────────────────────────────────────────

/**
 * Derives pedagogical sections from a lesson's content blocks.
 *
 * @param contentBlocks - The flat list of content blocks in the lesson.
 * @param exercises - Optional exercises array (added as a final section).
 * @returns Array of LessonSection objects, ordered and ready for navigation.
 */
export function deriveSections(
  contentBlocks: ContentBlock[],
  exercises?: Array<{ id: string; title: string; difficulty: string; description: string; solution?: string }>,
): LessonSection[] {
  const sections: LessonSection[] = [];
  let currentSection: LessonSection | null = null;

  for (const block of contentBlocks) {
    const isNew = isNewSectionStart(block, sections);

    if (isNew) {
      const title = (block.title ?? '').trim() || `Apartado ${sections.length + 1}`;
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

  // Add exercises as a final section if they exist
  if (exercises && exercises.length > 0) {
    sections.push({
      id: `section-${sections.length + 1}`,
      title: 'Ejercicios',
      type: 'exercise',
      blocks: [], // exercises are handled separately via ExerciseShell
      order: sections.length + 1,
    });
  }

  return sections;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Returns the total number of blocks across all sections (useful for progress).
 */
export function countBlocks(sections: LessonSection[]): number {
  return sections.reduce((sum, s) => sum + s.blocks.length, 0);
}

/**
 * Finds the section index that contains a given block (by reference or index).
 */
export function findSectionForBlock(
  sections: LessonSection[],
  globalBlockIndex: number,
): number {
  let running = 0;
  for (let i = 0; i < sections.length; i++) {
    running += sections[i].blocks.length;
    if (globalBlockIndex < running) return i;
  }
  return Math.max(0, sections.length - 1);
}
