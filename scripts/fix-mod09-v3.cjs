const fs = require('fs');
const path = require('path');

// For each problematic file, extract code blocks, fix escaping, rebuild JSON
const modulesDir = path.join(__dirname, '..', 'courses', 'programming', 'modules');

const filesToFix = ['mod-09.json'];

for (const f of filesToFix) {
  const filePath = path.join(modulesDir, f);
  const raw = fs.readFileSync(filePath, 'utf8');
  
  // Strategy: find all code block content fields and fix their escaping
  // The issue is that \\\" (2 backslashes + quote) should be \\\\\\\" (3 backslashes + quote)
  // in JSON strings that contain Java code
  
  // Find all "content": "..." patterns
  const contentPattern = /"content":\s*"((?:[^"\\]|\\.)*)"/g;
  let match;
  let fixed = raw;
  let fixCount = 0;
  
  while ((match = contentPattern.exec(raw)) !== null) {
    const originalContent = match[1];
    
    // Check if this is a code block (contains Java-like content)
    if (!originalContent.includes('class ') && !originalContent.includes('public ')) continue;
    
    // Fix the escaping: \\\" -> \\\\\\\"
    // In the file, \\\" means: backslash + backslash + quote
    // We need: backslash + backslash + backslash + quote
    let fixedContent = originalContent;
    
    // Replace \\\" with \\\\\\" (add one backslash before each \\\" that represents an escaped quote in Java)
    fixedContent = fixedContent.replace(/\\\\\"/g, '\\\\\\\"');
    
    if (fixedContent !== originalContent) {
      fixed = fixed.replace(match[0], '"content": "' + fixedContent + '"');
      fixCount++;
    }
  }
  
  // Validate
  try {
    JSON.parse(fixed);
    fs.writeFileSync(filePath, fixed, 'utf8');
    console.log('FIXED ' + f + ' (' + fixCount + ' content blocks fixed)');
  } catch (e) {
    console.log('STILL INVALID: ' + f + ' - ' + e.message.substring(0, 80));
  }
}

// Final validation of ALL files
console.log('\n=== FINAL VALIDATION ===');
const allFiles = fs.readdirSync(modulesDir).filter(f => f.startsWith('mod-') && f.endsWith('.json'));
let allValid = true;
for (const f of allFiles) {
  try {
    JSON.parse(fs.readFileSync(path.join(modulesDir, f), 'utf8'));
    console.log('VALID:', f);
  } catch (e) {
    console.log('INVALID:', f);
    allValid = false;
  }
}
console.log('\nAll 18 modules valid:', allValid);
