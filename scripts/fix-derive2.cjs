const fs = require("fs");
let c = fs.readFileSync("frontend/src/components/course/deriveSections.ts", "utf8");

// Find the function and replace the body
// Use a more flexible approach - find the function start and end
const funcStart = c.indexOf("function isNewSectionStart(");
const funcEnd = c.indexOf("\n}\n", funcStart);

if (funcStart === -1 || funcEnd === -1) {
  console.log("Could not find isNewSectionStart function");
  process.exit(1);
}

const funcBody = c.substring(funcStart, funcEnd + 3);
console.log("Found function, length:", funcBody.length);

// Replace the entire function body
const newFunc = `function isNewSectionStart(
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
}`;

c = c.substring(0, funcStart) + newFunc + c.substring(funcEnd + 3);
fs.writeFileSync("frontend/src/components/course/deriveSections.ts", c);
console.log("Fixed deriveSections.ts - replaced isNewSectionStart function");
