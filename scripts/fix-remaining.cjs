const fs = require('fs');
const path = require('path');

const modulesDir = path.join(__dirname, '..', 'courses', 'programming', 'modules');

// Fix mod-09: Chinese characters leaked
const mod09Path = path.join(modulesDir, 'mod-09.json');
let c09 = fs.readFileSync(mod09Path, 'utf8');
c09 = c09.replace(/获得/g, 'obtener');
try { JSON.parse(c09); fs.writeFileSync(mod09Path, c09, 'utf8'); console.log('FIXED mod-09.json'); } catch(e) { console.log('mod-09 still invalid:', e.message.substring(0,80)); }

// Fix mod-12: regex escape sequences
const mod12Path = path.join(modulesDir, 'mod-12.json');
let c12 = fs.readFileSync(mod12Path, 'utf8');
// Fix invalid escapes in regex patterns within Java strings
// \\d -> \\d (already correct in some places, but some have single \d)
// The issue is \\. which is invalid JSON (should be \\.)
c12 = c12.replace(/\\\\\.\\\./g, '\\\\..'); // \\.\\. -> \\..\\.
try { JSON.parse(c12); fs.writeFileSync(mod12Path, c12, 'utf8'); console.log('FIXED mod-12.json'); } catch(e) { console.log('mod-12 still invalid:', e.message.substring(0,80)); }

// Fix mod-13: regex escape
const mod13Path = path.join(modulesDir, 'mod-13.json');
let c13 = fs.readFileSync(mod13Path, 'utf8');
c13 = c13.replace(/\\\\\.\\\./g, '\\\\..');
try { JSON.parse(c13); fs.writeFileSync(mod13Path, c13, 'utf8'); console.log('FIXED mod-13.json'); } catch(e) { console.log('mod-13 still invalid:', e.message.substring(0,80)); }

// Fix mod-18: regex escape
const mod18Path = path.join(modulesDir, 'mod-18.json');
let c18 = fs.readFileSync(mod18Path, 'utf8');
c18 = c18.replace(/\\\\\.\\\./g, '\\\\..');
try { JSON.parse(c18); fs.writeFileSync(mod18Path, c18, 'utf8'); console.log('FIXED mod-18.json'); } catch(e) { console.log('mod-18 still invalid:', e.message.substring(0,80)); }

// Validate all
console.log('\n=== FINAL VALIDATION ===');
const allFiles = fs.readdirSync(modulesDir).filter(f => f.startsWith('mod-') && f.endsWith('.json'));
let allValid = true;
for (const f of allFiles) {
  try {
    JSON.parse(fs.readFileSync(path.join(modulesDir, f), 'utf8'));
    console.log('VALID:', f);
  } catch (e) {
    console.log('INVALID:', f, '-', e.message.substring(0, 80));
    allValid = false;
  }
}
console.log('\nAll files valid:', allValid);
