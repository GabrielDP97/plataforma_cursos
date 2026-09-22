const fs = require("fs");
let c = fs.readFileSync("frontend/src/components/course/ActivityNode.tsx", "utf8");
c = c.replace(/import \{[^}]*PlayCircle[^}]*\}/, (m) => m.replace(/,\s*PlayCircle/, "").replace(/PlayCircle,\s*/, ""));
fs.writeFileSync("frontend/src/components/course/ActivityNode.tsx", c);
console.log("Fixed ActivityNode");
