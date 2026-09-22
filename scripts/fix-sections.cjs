const fs = require("fs");
let c = fs.readFileSync("frontend/src/components/course/deriveSections.ts", "utf8");

// Fix Rule 2: Allow code blocks with section-start titles to start new sections
const oldRule = `  // Rule 2: Only text blocks can start sections
  if (block.type !== 'text') return false;

  const title = (block.title ?? '').trim();
  if (!title) return false;

  // Rule 3: Continuation patterns — NOT a new section
  if (CONTINUATION_PATTERNS.some((p) => p.test(title))) return false;

  // Rule 4: Explicit section-start patterns — new section
  if (SECTION_START_PATTERNS.some((p) => p.test(title))) return true;

  // Rule 5: Any other text block with a title — new section
  // (A titled text block always introduces a new concept)
  return true;`;

const newRule = `  const title = (block.title ?? '').trim();
  if (!title) return false;

  // Rule 2: Text blocks with titles always start sections
  if (block.type === 'text') {
    // Rule 3: Continuation patterns — NOT a new section
    if (CONTINUATION_PATTERNS.some((p) => p.test(title))) return false;
    // Rule 4: Explicit section-start patterns — new section
    if (SECTION_START_PATTERNS.some((p) => p.test(title))) return true;
    // Rule 5: Any other text block with title — new section
    return true;
  }

  // Rule 6: Code blocks with section-start titles also start sections
  // This handles cases like "Mi primer programa: Hola, mundo" (code block)
  // that should begin a new pedagogical section.
  if (block.type === 'code' && SECTION_START_PATTERNS.some((p) => p.test(title))) {
    return true;
  }

  // All other blocks (code without matching title, video, link, file) — subordinate
  return false;`;

c = c.replace(oldRule, newRule);

// Also update the JSDoc comment
const oldComment = `/**
 * Determines if a content block starts a new section.
 *
 * Rules:
 * 1. First block in the lesson ALWAYS starts a section.
 * 2. Only \`text\` blocks can start new sections (code, video, link, file are
 *    subordinate to the current section).
 * 3. Text block with a title matching a continuation pattern — does NOT start.
 * 4. Text block with a title matching a section-start pattern — DOES start.
 * 5. Any other text block — DOES start (it introduces a new concept).
 */`;
const newComment = `/**
 * Determines if a content block starts a new section.
 *
 * Rules:
 * 1. First block in the lesson ALWAYS starts a section.
 * 2. Text blocks with titles always start new sections (unless continuation).
 * 3. Code blocks with section-start titles ALSO start new sections.
 *    This handles cases like "Mi primer programa: Hola, mundo" (code block)
 *    that should begin a new pedagogical section.
 * 4. Video, link, file blocks are always subordinate to current section.
 */`;
c = c.replace(oldComment, newComment);

fs.writeFileSync("frontend/src/components/course/deriveSections.ts", c);
console.log("Fixed deriveSections.ts boundary logic");
