const fs = require('fs');
const path = require('path');

const modulesDir = path.join(__dirname, '..', 'courses', 'programming', 'modules');
const files = fs.readdirSync(modulesDir).filter(f => f.startsWith('mod-') && f.endsWith('.json'));

let totalFixed = 0;
let totalIssues = 0;

for (const f of files) {
  const filePath = path.join(modulesDir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  // Fix 1: Over-escaped quotes: \\\" -> \\\"
  // In JSON: \\\\\" means backslash + escaped quote (WRONG for Java string)
  // Should be: \\" which means just an escaped quote
  content = content.replace(/\\\\\\\\\"/g, '\\\\\"');
  
  // Fix 2: Invalid JSON escape sequences from regex
  // \\| -> | (pipe is not a JSON escape)
  content = content.replace(/\\\\\|/g, '|');
  
  // Fix 3: Ensure regex escapes are properly doubled for JSON
  // In Java regex: \. \d \s \w \[ \] \+
  // In JSON string: \\. \\d \\s \\w \\[ \\] \\+
  // The issue is when they appear as \. (single backslash) in JSON
  // which is invalid JSON
  
  if (content !== original) {
    // Validate the fix
    try {
      JSON.parse(content);
      fs.writeFileSync(filePath, content, 'utf8');
      totalFixed++;
      console.log('Fixed and validated: ' + f);
    } catch (e) {
      console.log('STILL INVALID after fix: ' + f + ' - ' + e.message.substring(0, 100));
      totalIssues++;
    }
  } else {
    // Check if already valid
    try {
      JSON.parse(content);
    } catch (e) {
      console.log('INVALID (no fix applied): ' + f + ' - ' + e.message.substring(0, 100));
      totalIssues++;
    }
  }
}

console.log('\nTotal fixed: ' + totalFixed);
console.log('Total remaining issues: ' + totalIssues);
