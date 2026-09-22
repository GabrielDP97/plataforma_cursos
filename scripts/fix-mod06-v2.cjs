const fs = require('fs');
const path = require('path');

// Fix mod-06: the issue is that ' followed by \" breaks JSON parsing
// Content: println(\"Curso ' \" + nombre + \"' activado\")
// The ' after Curso followed by \" is interpreted as closing the JSON string
// Fix: escape the ' as \\' inside the JSON string

const filePath = path.join(__dirname, '..', 'courses', 'programming', 'modules', 'mod-06.json');
let content = fs.readFileSync(filePath, 'utf8');

// Find the exact pattern and count occurrences
const pattern = /Curso '\\\"/g;
let matches = [];
let m;
while ((m = pattern.exec(content)) !== null) {
  matches.push({ pos: m.index, context: content.substring(m.index - 20, m.index + 30) });
}
console.log('Found', matches.length, 'occurrences of "Curso \'\\""');
matches.forEach((match, i) => {
  console.log(`  ${i + 1} at ${match.pos}:`, JSON.stringify(match.context));
});

// The fix: Replace ' \" with \\' \" (escape the single quote)
// In JSON: \\' = escaped single quote
content = content.replace(/Curso '\\\"/g, "Curso \\\\'\\\"");

try {
  JSON.parse(content);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('\nFIXED mod-06.json');
} catch (e) {
  console.log('\nStill invalid:', e.message.substring(0, 100));
}
