const fs = require("fs");
let c = fs.readFileSync("frontend/src/pages/courses/LessonPage.tsx", "utf8");
c = c.replace(/block as Record<string, unknown>/g, "block as any");
fs.writeFileSync("frontend/src/pages/courses/LessonPage.tsx", c);
console.log("Fixed type casting");
