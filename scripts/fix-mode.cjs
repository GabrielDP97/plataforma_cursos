const fs = require("fs");
let c = fs.readFileSync("frontend/src/components/course/CourseSidebar.tsx", "utf8");
// Remove mode from destructuring entirely
c = c.replace(/\{ courseName, modules, activeModuleId, onModuleClick, mode \}/, "{ courseName, modules, activeModuleId, onModuleClick }");
fs.writeFileSync("frontend/src/components/course/CourseSidebar.tsx", c);
console.log("Removed mode from CourseSidebar");
