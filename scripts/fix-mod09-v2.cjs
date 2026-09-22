const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'courses', 'programming', 'modules', 'mod-09.json');
let content = fs.readFileSync(filePath, 'utf8');

// The file has TWO different patterns:
// 1. \\\" (2 backslashes + quote) - WRONG, breaks JSON
// 2. \\\\\\\" (3 backslashes + quote) - this is what we need
//
// We need to convert \\\" to \\\\\\" (add one more backslash)
// But ONLY when it's part of escaped quotes in Java strings
//
// Strategy: find all \\\" that are NOT preceded by another backslash
// and add one more backslash

// Replace \\\" with \\\\\\\" ONLY when preceded by a non-backslash character
// This avoids double-escaping already-correct patterns
let fixed = '';
let i = 0;
while (i < content.length) {
  if (content[i] === '\\' && content[i + 1] === '\\' && content[i + 2] === '"') {
    // Check if this is already triple-backslash
    if (i > 0 && content[i - 1] === '\\') {
      // Already triple-backslash, keep as-is
      fixed += '\\\\\\"';
      i += 3;
    } else {
      // Double-backslash + quote, add one more backslash
      fixed += '\\\\\\\\"';
      i += 3;
    }
  } else {
    fixed += content[i];
    i++;
  }
}

try {
  JSON.parse(fixed);
  fs.writeFileSync(filePath, fixed, 'utf8');
  console.log('FIXED mod-09.json');
} catch (e) {
  console.log('Still invalid:', e.message.substring(0, 100));
  // Try to find remaining issues
  try { JSON.parse(fixed); } catch (e2) {
    const pos = parseInt(e2.message.match(/position (\d+)/)?.[1] || '-1');
    if (pos >= 0) {
      console.log('Remaining issue at pos', pos, ':', JSON.stringify(fixed.substring(pos - 20, pos + 20)));
    }
  }
}
