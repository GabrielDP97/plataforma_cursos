const fs = require('fs');
const content = fs.readFileSync('courses/programming/modules/mod-01.json', 'utf8');

// Find first solution
const m = content.match(/"solution":\s*"((?:[^"\\]|\\.)*)"/);
if (m) {
  const sol = m[1];
  console.log('Solution content (first 300 chars):');
  console.log(JSON.stringify(sol.substring(0, 300)));
  console.log('\nContains double-backslash-n:', sol.includes('\\n'));
  console.log('Contains actual newline:', sol.includes('\n'));
  console.log('Solution length:', sol.length);
}
