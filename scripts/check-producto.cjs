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

const d = JSON.parse(fs.readFileSync("courses/programming/modules/mod-08.json", "utf8"));

// Check ProductoRebajado
d.lessons.forEach(function(l) {
  l.contentBlocks.forEach(function(b, i) {
    if (b.content && b.content.includes("ProductoRebajado")) {
      var code = extractJsonString(b.content);
      if (code.includes("ProductoRebajado") && code.includes("extends")) {
        console.log("ProductoRebajado in " + l.id + " block " + i + ":");
        var lines = code.split("\n");
        lines.forEach(function(line, idx) {
          if (line.includes("EUR") && line.includes("%)")) {
            console.log("  Line " + idx + ": " + line);
          }
        });
      }
    }
  });
});
