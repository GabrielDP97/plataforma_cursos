const fs = require('fs');

// Fix mod-06: the issue is escaped quotes inside a Java string that contains single quotes
// Content: System.out.println(\"Curso '\" + nombre + \"' activado.\");
// The JSON parser sees: ...println("Curso '" + nombre + "' activado.");
// But the \" after ' is being interpreted as closing the JSON string
// 
// Actually the real issue is simpler - the content field has:
// ...println(\\\"Curso '\\\" + nombre + \\\"' activado.\\\");
// Where \\\" means literal backslash + escaped quote in JSON
// This produces: println(\"Curso '\" + nombre + \"' activado.\");
// Which in Java is: println("Curso '" + nombre + "' activado.");
// That's actually correct Java! But the JSON is malformed.
//
// Let me look at the exact JSON around the error more carefully.

const d6 = fs.readFileSync('courses/programming/modules/mod-06.json', 'utf8');

// Find all occurrences of the problematic pattern
const pattern = /Curso '/g;
let match;
while ((match = pattern.exec(d6)) !== null) {
  const start = Math.max(0, match.index - 30);
  const end = Math.min(d6.length, match.index + 50);
  const context = d6.substring(start, end);
  if (context.includes('\\"')) {
    console.log('Found at', match.index, ':', JSON.stringify(context));
  }
}

// The fix: In the JSON content, the Java string has escaped quotes like:
// \"Curso '...'\"
// But the ' followed by \" confuses the JSON parser
// The solution: the content should use \' for the single quotes inside the Java string
// Or: don't use escaped double quotes around the string parts

// Let me try a targeted replacement
let fixed = d6;

// Pattern: \"Curso '\" should be \"Curso '\"
// But we need to keep the Java string valid
// The Java code wants: "Curso 'X' activado"
// In JSON this should be: \"Curso 'X' activado\"
// Currently it's: \"Curso '\" + nombre + \"' activado\"
// Which means the JSON has: "Curso '" (then parser thinks string ended)

// The fix: change the Java code to not use escaped quotes in this specific string
// Or: escape the single quotes properly in JSON

// Actually, the simplest fix: change the Java string to not have the problematic pattern
// Instead of: System.out.println(\"Curso '\" + nombre + \"' activado.\");
// Use: System.out.println(\"Curso ' + nombre + ' activado.\");
// No, that changes the Java semantics.

// Better fix: in JSON, use \\' for escaped single quotes inside strings
// Or: just escape the inner double quotes properly

// Let me look at the actual JSON content field
const contentStart = d6.indexOf('"content":', 41700);
const contentEnd = d6.indexOf('"', contentStart + 12);
console.log('\nContent field start:', contentStart);
console.log('Content around error:', JSON.stringify(d6.substring(41750, 41850)));
