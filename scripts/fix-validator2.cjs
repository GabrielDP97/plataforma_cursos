const fs = require("fs");
let c = fs.readFileSync("courses/programming/validate-sections.cjs", "utf8");

// Find and replace the isNewSectionStart function
const oldFunc = `function isNewSectionStart(block, existingSections) {
    if (existingSections.length === 0) return true;
    if (block.type !== 'text') return false;
  
    const title = (block.title || '').trim();
    if (!title) return false;
  
    if (CONTINUATION_PATTERNS.some((p) => p.test(title))) return false;
    if (SECTION_START_PATTERNS.some((p) => p.test(title))) return true;
  
    return true;
  }`;

const newFunc = `function isNewSectionStart(block, existingSections) {
    if (existingSections.length === 0) return true;
    const title = (block.title || '').trim();
    if (!title) return false;
    if (block.type === 'text') {
      if (CONTINUATION_PATTERNS.some((p) => p.test(title))) return false;
      if (SECTION_START_PATTERNS.some((p) => p.test(title))) return true;
      return true;
    }
    if (block.type === 'code' && SECTION_START_PATTERNS.some((p) => p.test(title))) {
      return true;
    }
    return false;
  }`;

c = c.replace(oldFunc, newFunc);
fs.writeFileSync("courses/programming/validate-sections.cjs", c);
console.log("Fixed validator");
