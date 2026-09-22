const fs = require("fs");
let h = fs.readFileSync("frontend/src/pages/courses/CourseHome.tsx", "utf8");
// Find and remove the completedInPhase variable
const lines = h.split("\n");
const newLines = [];
let skipCount = 0;
for (let i = 0; i < lines.length; i++) {
  if (skipCount > 0) { skipCount--; continue; }
  if (lines[i].includes("completedInPhase =")) {
    // Skip until we find the closing );
    for (let j = i+1; j < lines.length; j++) {
      if (lines[j].trim().startsWith(")")) {
        skipCount = j - i;
        break;
      }
    }
    continue;
  }
  newLines.push(lines[i]);
}
fs.writeFileSync("frontend/src/pages/courses/CourseHome.tsx", newLines.join("\n"));
console.log("Removed completedInPhase");
