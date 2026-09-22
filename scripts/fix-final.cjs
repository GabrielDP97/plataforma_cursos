const fs = require("fs");
// Fix CourseSidebar mode
let c = fs.readFileSync("frontend/src/components/course/CourseSidebar.tsx", "utf8");
c = c.replace(/mode,/, "_mode: mode,");
fs.writeFileSync("frontend/src/components/course/CourseSidebar.tsx", c);
console.log("Fixed mode");

// Fix CourseHome export
let r = fs.readFileSync("frontend/src/routes/index.tsx", "utf8");
r = r.replace(/import\(\.\.\/pages\/courses\/CourseHome'\)\.then\(m => m\)/, "import('../pages/courses/CourseHome').then(m => m)");
fs.writeFileSync("frontend/src/routes/index.tsx", r);
console.log("Fixed export");
