const fs = require("fs");
const d = fs.readFileSync("courses/programming/modules/mod-08.json", "utf8");

// Find the exact position
var idx = d.indexOf("Alumno");
while (idx !== -1) {
  var context = d.substring(idx, idx + 40);
  if (context.includes("n        return")) {
    console.log("Found at " + idx + ": " + JSON.stringify(context));
    // Fix: remove the stray 'n'
    var fixed = d.substring(0, idx) + "Alumno\\n        return" + d.substring(idx + "Alumno\\nn        return".length);
    fs.writeFileSync("courses/programming/modules/mod-08.json", fixed, "utf8");
    console.log("Fixed!");
    break;
  }
  idx = d.indexOf("Alumno", idx + 1);
}
