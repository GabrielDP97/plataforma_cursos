const fs = require("fs");
for (var i = 1; i <= 18; i++) {
  var f = "courses/programming/modules/mod-" + (i < 10 ? "0" : "") + i + ".json";
  var raw = fs.readFileSync(f, "utf8");
  if (raw.includes("ProductoRebajado")) {
    console.log("Found in " + f);
  }
}
