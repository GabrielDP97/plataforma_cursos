const fs = require("fs");
// Fix CourseSidebar mode
let c = fs.readFileSync("frontend/src/components/course/CourseSidebar.tsx", "utf8");
c = c.replace(/mode,/, "_mode: mode,");
fs.writeFileSync("frontend/src/components/course/CourseSidebar.tsx", c);
console.log("Fixed mode");

// Fix CourseHome unused variable
let h = fs.readFileSync("frontend/src/pages/courses/CourseHome.tsx", "utf8");
h = h.replace(/const completedInPhase = .*;\n/, "");
fs.writeFileSync("frontend/src/pages/courses/CourseHome.tsx", h);
console.log("Fixed completedInPhase");
