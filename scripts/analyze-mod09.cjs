const fs = require('fs');
const d = fs.readFileSync('courses/programming/modules/mod-09.json', 'utf8');
const line = d.split('\n')[168];

// Find the pattern that's causing issues
// Look for: backslash-backslash-backslash-quote
const pattern = /\\\\\\\\"/g;
let m;
let count = 0;
while ((m = pattern.exec(line)) !== null) {
  count++;
  if (count <= 5) {
    console.log('At col', m.index, ':', JSON.stringify(line.substring(m.index - 10, m.index + 15)));
  }
}
console.log('Total triple-backslash-quote:', count);

// Also check: what's the actual byte sequence at position 854
const around = line.substring(845, 870);
console.log('\nAround col 854:', JSON.stringify(around));
console.log('Hex:', Array.from(Buffer.from(around, 'utf8')).map(b => b.toString(16).padStart(2, '0')).join(' '));

// Check if the file has the pattern we're looking for
const hasTriple = line.includes('\\\\\\\\"');
console.log('\nHas triple backslash-quote:', hasTriple);

// Show the actual characters
for (let i = 850; i < 870 && i < line.length; i++) {
  const ch = line[i];
  const code = line.charCodeAt(i);
  if (code === 0x5c) process.stdout.write('[BS]');
  else if (code === 0x22) process.stdout.write('[QT]');
  else process.stdout.write(ch);
}
console.log('');
