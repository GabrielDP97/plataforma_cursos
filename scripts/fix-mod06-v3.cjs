const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'courses', 'programming', 'modules', 'mod-06.json');
let content = fs.readFileSync(filePath, 'utf8');

// Two patterns to fix:
// 1. Curso '\" (unescaped quote after single quote)
// 2. Curso '\\\" (already escaped but in wrong context)

// Fix both: replace ' followed by \" with \\' followed by \"
content = content.replace(/Curso '\\\"/g, "Curso \\\\'\\\"");
content = content.replace(/Curso '\"/g, "Curso \\\\'\\\"");

// Also fix the desactivar version
content = content.replace(/Curso '\\\"/g, "Curso \\\\'\\\"");

try {
  JSON.parse(content);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('FIXED mod-06.json');
} catch (e) {
  console.log('Still invalid:', e.message.substring(0, 100));
}
