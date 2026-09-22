const fs = require("fs");
const d = fs.readFileSync("courses/programming/modules/mod-08.json", "utf8");

// Find ProductoRebajado with extra ')'
var idx = d.indexOf("ProductoRebajado");
while (idx !== -1) {
  var context = d.substring(idx, idx + 300);
  if (context.includes('%)"')) {
    console.log("Found at " + idx + ":");
    console.log(JSON.stringify(context.substring(0, 200)));
    // Fix: change %)" to %)"
    var fixed = d.substring(0, idx) + context.replace('%)"', '%)"') + d.substring(idx + context.length);
    // Actually let me find the exact pattern first
    var patternIdx = context.indexOf('%)\\\"');
    if (patternIdx > 0) {
      console.log("Pattern at offset: " + patternIdx);
      console.log("Context: " + JSON.stringify(context.substring(patternIdx - 20, patternIdx + 20)));
    }
  }
  idx = d.indexOf("ProductoRebajado", idx + 1);
}
