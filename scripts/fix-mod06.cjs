const fs = require('fs');

// The mod-06 issue: Java code has println(\"Curso 'X' activado\")
// where ' inside the string breaks JSON parsing when followed by \"
// 
// The JSON has: \\\\\"Curso '\\\\\" + nombre + \\\\"' activado.\\\"
// Which decodes to: \"Curso '\" + nombre + \"' activado.\"
// The ' followed by \" confuses JSON parser
//
// Fix: Replace the problematic pattern in the JSON content
// The Java code should use: println(\"Curso ' + nombre + ' activado.\")
// But that changes semantics. Better: escape the inner quotes differently.

const d6 = fs.readFileSync('courses/programming/modules/mod-06.json', 'utf8');

// The pattern in the JSON is: \\\\\"Curso '\\\\\" + nombre + \\\\\"' activado.\\\"
// After JSON parse, this becomes: \"Curso '\" + nombre + \"' activado.\"
// Which is valid Java (escaped quotes in println)
//
// The fix: replace the inner '\\\" with escaped single quotes
// Change: \\\\\"Curso '\\\\\" to \\\\\"Curso '\\\\\"  (no change needed)
// 
// Actually, let me try a different approach:
// Replace the specific problematic substring

let fixed = d6;

// Replace: \\\\\"Curso '\\\\\" with \\\\\"Curso \\'\\\\\"  
// This makes the single quote escaped in JSON: \\' = escaped single quote
fixed = fixed.replace(/\\"\\"Curso '\\\\"/g, '\\"Curso \\\\\'\\\\"');

// Try compiling
try {
  JSON.parse(fixed);
  fs.writeFileSync('courses/programming/modules/mod-06.json', fixed, 'utf8');
  console.log('mod-06: FIXED');
} catch(e) {
  console.log('mod-06: Still invalid:', e.message.substring(0, 100));
  // Try alternative fix
  fixed = d6;
  // Replace the entire println statement to avoid the quote issue
  fixed = fixed.replace(
    'println(\\\"Curso \\'\\\" + nombre + \\\\'\\' activado.\\\")',
    'println(\\"Curso \\' + nombre + \\' activado.\\")'
  );
  try {
    JSON.parse(fixed);
    fs.writeFileSync('courses/programming/modules/mod-06.json', fixed, 'utf8');
    console.log('mod-06: FIXED (alternative)');
  } catch(e2) {
    console.log('mod-06: Still invalid:', e2.message.substring(0, 100));
  }
}
