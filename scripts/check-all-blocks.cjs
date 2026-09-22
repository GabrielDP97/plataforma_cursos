const fs = require("fs");
const d = JSON.parse(fs.readFileSync("courses/programming/modules/mod-08.json", "utf8"));
var blockCount = 0;
d.lessons.forEach(function(l) {
  l.contentBlocks.forEach(function(b, i) {
    if (b.type === "code" && b.content) {
      blockCount++;
      if (b.content.includes("Producto") || b.content.includes("Rebajado")) {
        console.log("Block " + blockCount + " in " + l.id + " block " + i + ":");
        console.log("  First 200 chars: " + b.content.substring(0, 200));
      }
    }
  });
});
console.log("Total code blocks: " + blockCount);
