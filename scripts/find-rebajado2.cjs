const fs = require("fs");
const d = fs.readFileSync("courses/programming/modules/mod-08.json", "utf8");
var idx = d.indexOf("ProductoRebajado");
if (idx !== -1) {
  console.log("Found at position " + idx);
  console.log("Context: " + JSON.stringify(d.substring(idx - 50, idx + 100)));
}
