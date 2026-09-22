const fs = require('fs');
const path = require('path');

const modulesDir = path.join(__dirname, '..', 'courses', 'programming', 'modules');
const files = ['mod-06.json', 'mod-09.json', 'mod-12.json', 'mod-13.json', 'mod-18.json'];

for (const f of files) {
  const filePath = path.join(modulesDir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  // Fix: \\\" (backslash-backslash-quote) should be \\\\\\\" (backslash-backslash-backslash-quote)
  // In the file: \\\" represents two backslashes + quote
  // For Java escaped quotes in strings, we need three backslashes + quote
  content = content.replace(/\\\\\"/g, '\\\\\\\"');
  
  if (content !== original) {
    try {
      JSON.parse(content);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('FIXED: ' + f);
    } catch (e) {
      console.log('STILL INVALID: ' + f + ' - ' + e.message.substring(0, 80));
    }
  } else {
    console.log('NO CHANGE: ' + f);
  }
}

// Validate all files
console.log('\n=== VALIDATION ===');
const allFiles = fs.readdirSync(modulesDir).filter(f => f.startsWith('mod-') && f.endsWith('.json'));
for (const f of allFiles) {
  try {
    JSON.parse(fs.readFileSync(path.join(modulesDir, f), 'utf8'));
    console.log('VALID: ' + f);
  } catch (e) {
    console.log('INVALID: ' + f + ' - ' + e.message.substring(0, 80));
  }
}
