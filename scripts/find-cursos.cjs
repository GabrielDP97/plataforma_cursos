const fs = require('fs');
const d = fs.readFileSync('courses/programming/modules/mod-06.json', 'utf8');

// Find all occurrences of "Curso '" in the file
let pos = 0;
while (true) {
  const idx = d.indexOf("Curso '", pos);
  if (idx === -1) break;
  const start = Math.max(0, idx - 80);
  const end = Math.min(d.length, idx + 120);
  console.log(`\nAt position ${idx}:`);
  console.log(JSON.stringify(d.substring(start, end)));
  pos = idx + 10;
}
