const fs = require("fs");
let c = fs.readFileSync("courses/programming/validate-sections.cjs", "utf8");

// Simple targeted replacement - replace the specific line
c = c.replace(
  "if (block.type !== 'text') return false;",
  "// Allow code blocks with section-start titles to also start sections\n    // (e.g., 'Mi primer programa: Hola, mundo' as a code block)\n    if (block.type !== 'text' && block.type !== 'code') return false;\n    if (block.type === 'code' && !SECTION_START_PATTERNS.some((p) => p.test((block.title || '').trim()))) return false;"
);

fs.writeFileSync("courses/programming/validate-sections.cjs", c);
console.log("Fixed validator - code blocks can start sections");
