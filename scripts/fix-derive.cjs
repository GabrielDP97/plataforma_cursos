const fs = require("fs");
let c = fs.readFileSync("frontend/src/components/course/deriveSections.ts", "utf8");

// Find and replace the isNewSectionStart function body
// The key change: allow code blocks with section-start titles to start sections

const oldBody = `  // Rule 2: Only text blocks can start sections
  if (block.type !== 'text') return false;

  const title = (block.title ?? '').trim();
  if (!title) return false;

  // Rule 3: Continuation patterns — NOT a new section
  if (CONTINUATION_PATTERNS.some((p) => p.test(title))) return false;

  // Rule 4: Explicit section-start patterns — new section
  if (SECTION_START_PATTERNS.some((p) => p.test(title))) return true;

  // Rule 5: Any other text block with a title — new section
  return true;`;

const newBody = `  const title = (block.title ?? '').trim();
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
  return false;`;

if (c.includes(oldBody)) {
  c = c.replace(oldBody, newBody);
  fs.writeFileSync("frontend/src/components/course/deriveSections.ts", c);
  console.log("Fixed deriveSections.ts");
} else {
  console.log("Old body not found - checking what's there...");
  // Show the relevant section
  const idx = c.indexOf("Rule 2: Only text blocks");
  if (idx >= 0) {
    console.log("Found at index:", idx);
    console.log("Context:", c.substring(idx, idx + 200));
  }
}
