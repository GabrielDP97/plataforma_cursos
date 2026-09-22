const fs = require("fs");
const d = JSON.parse(fs.readFileSync("courses/programming/modules/mod-08.json", "utf8"));
d.lessons.forEach(function(l) {
  l.contentBlocks.forEach(function(b, i) {
    if (b.content && b.content.includes("ProductoRebajado")) {
      console.log("Found in " + l.id + " block " + i + ": " + (b.title || "no title"));
      console.log("Content length: " + b.content.length);
      // Check for the extra ')' issue
      if (b.content.includes("%\\\"\\)\\\"")) {
        console.log("  FOUND extra ) pattern");
      }
      if (b.content.includes("%\\\")")) {
        console.log("  FOUND %) pattern");
      }
    }
  });
});
