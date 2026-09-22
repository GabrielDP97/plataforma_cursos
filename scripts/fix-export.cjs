const fs = require("fs");
let r = fs.readFileSync("frontend/src/routes/index.tsx", "utf8");
r = r.replace(/import\(\.\.\/pages\/courses\/CourseHome'\)\.then\(m => m\)/, "import('../pages/courses/CourseHome').then(m => m)");
fs.writeFileSync("frontend/src/routes/index.tsx", r);
console.log("Fixed CourseHome export");
