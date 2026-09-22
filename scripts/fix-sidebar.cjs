const fs = require("fs");
let c = fs.readFileSync("frontend/src/components/course/CourseSidebar.tsx", "utf8");
c = c.replace(/\x60\$\{progress\}%\x60/g, "'0%'");
c = c.replace(/mode,/, "_mode: mode,");
fs.writeFileSync("frontend/src/components/course/CourseSidebar.tsx", c);
console.log("Fixed progress and mode");
