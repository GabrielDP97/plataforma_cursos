const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'courses', 'programming', 'modules', 'mod-09.json');
const content = fs.readFileSync(filePath, 'utf8');

// The file has: \\\\\\\" (bytes: 5c 5c 5c 22 = 3 backslashes + quote)
// JSON parses this as: \" (backslash + quote) — which closes the string
// We need: \\\\\\\\\\\\\" (4 backslashes + quote)
// Which JSON parses as: \\\" (backslash + backslash + quote)
// Which Java interprets as: \" (escaped quote in string literal)
//
// Fix: Replace every occurrence of (backslash)(backslash)(backslash)(quote) 
// with (backslash)(backslash)(backslash)(backslash)(quote)
// In the file: 5c 5c 5c 22 -> 5c 5c 5c 5c 22

const fixed = content.replace(/\x5c\x5c\x5c\x22/g, '\x5c\x5c\x5c\x5c\x22');

try {
  JSON.parse(fixed);
  fs.writeFileSync(filePath, fixed, 'utf8');
  console.log('FIXED mod-09.json');
} catch (e) {
  console.log('Still invalid:', e.message.substring(0, 100));
}
