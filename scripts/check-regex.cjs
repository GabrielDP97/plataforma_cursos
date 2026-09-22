const fs = require('fs');
const content = fs.readFileSync('courses/programming/modules/mod-12.json', 'utf8');

// Find all code blocks with "ExtraerInfo" or regex patterns
const codePattern = /"type":\s*"code"[^}]*"content":\s*"((?:[^"\\]|\\.)*)"/g;
let match;
while ((match = codePattern.exec(content)) !== null) {
  const rawStr = match[1];
  if (rawStr.includes('ExtraerInfo') || rawStr.includes('validar') || rawStr.includes('Pattern')) {
    // Find Pattern.compile occurrences
    const patternMatches = rawStr.match(/Pattern\.compile\([^)]+\)/g);
    if (patternMatches) {
      console.log('Found regex patterns:');
      patternMatches.forEach(p => console.log('  ', p));
    }
  }
}

// Also check solutions
const solPattern = /"solution":\s*"((?:[^"\\]|\\.)*)"/g;
while ((match = solPattern.exec(content)) !== null) {
  const rawStr = match[1];
  if (rawStr.includes('Pattern') || rawStr.includes('regex') || rawStr.includes('\\d')) {
    const patternMatches = rawStr.match(/Pattern\.compile\([^)]+\)/g);
    if (patternMatches) {
      console.log('Solution regex:');
      patternMatches.forEach(p => console.log('  ', p));
    }
  }
}
