const fs = require('fs');

// Diagnose mod-10
const d10 = fs.readFileSync('courses/programming/modules/mod-10.json', 'utf8');
const idx = d10.indexOf('"content">');
if (idx >= 0) {
  console.log('mod-10: HTML-like content at position:', idx);
  console.log('Context:', JSON.stringify(d10.substring(idx-50, idx+50)));
}

// Fix mod-10: replace "content"> with "content":"
let c10 = d10.replace(/"content">/g, '"content":"');
try {
  JSON.parse(c10);
  fs.writeFileSync('courses/programming/modules/mod-10.json', c10, 'utf8');
  console.log('mod-10: FIXED');
} catch(e) {
  console.log('mod-10: Still invalid:', e.message.substring(0, 100));
}

// Diagnose mod-06
const d6 = fs.readFileSync('courses/programming/modules/mod-06.json', 'utf8');
const p = 41796;
console.log('\nmod-06 raw bytes around error:');
const bytes = Buffer.from(d6.substring(p-30, p+30), 'utf8');
for (let i = 0; i < bytes.length; i++) {
  const b = bytes[i];
  if (b === 0x22) process.stdout.write('[QUOT]'); // "
  else if (b === 0x5c) process.stdout.write('[BS]'); // backslash
  else if (b === 0x27) process.stdout.write('[SQUOT]'); // '
  else process.stdout.write(String.fromCharCode(b));
}
console.log('');

// Try fixing mod-06: the issue is \"Curso ' \" where ' is followed by \"
// In JSON: the string ends at the first unescaped "
// The content has: \"Curso '\" + nombre + \"' activado.\"
// This means the JSON string contains: Curso ' (then the JSON parser thinks the string ended)
// The fix: escape the inner quotes properly
// Let me just try a targeted fix
const fix6 = d6.replace(
  "Curso '\\\" + nombre + \\\"' activado",
  "Curso ' + nombre + ' activado"
);
try {
  JSON.parse(fix6);
  fs.writeFileSync('courses/programming/modules/mod-06.json', fix6, 'utf8');
  console.log('mod-06: FIXED');
} catch(e) {
  console.log('mod-06: Still invalid:', e.message.substring(0, 100));
}
