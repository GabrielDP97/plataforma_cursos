const fs = require("fs");
function extractJsonString(s) {
  var r = "", i = 0;
  while (i < s.length) {
    if (s[i] === "\\" && i + 1 < s.length) {
      var n = s[i + 1];
      switch (n) {
        case "n": r += "\n"; i += 2; break;
        case "t": r += "\t"; i += 2; break;
        case "r": r += "\r"; i += 2; break;
        case "\"": r += "\""; i += 2; break;
        case "\\": r += "\\"; i += 2; break;
        default: r += s[i]; i++; break;
      }
    } else { r += s[i]; i++; }
  }
  return r;
}

const d = JSON.parse(fs.readFileSync("courses/programming/modules/mod-10.json", "utf8"));
d.lessons.forEach(function(l) {
  if (l.id === "lesson-10-3") {
    l.contentBlocks.forEach(function(b, i) {
      if (b.content && b.content.includes("class Producto")) {
        var code = extractJsonString(b.content);
        console.log("Block " + i + " has " + (code.match(/public\s+class\s+/g) || []).length + " public classes");
        // List all public classes
        var classMatches = code.match(/public\s+class\s+(\w+)/g);
        if (classMatches) {
          classMatches.forEach(function(m) { console.log("  " + m); });
        }
        // Check for the error pattern
        var lines = code.split("\n");
        lines.forEach(function(line, idx) {
          if (line.includes("EUR") && line.includes("%)")) {
            console.log("  EUR line " + idx + ": " + line);
          }
        });
      }
    });
  }
});
