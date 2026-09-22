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

// Check lesson-08-3 block 2 (GestionAlumnos)
d.lessons.forEach(function(l) {
  if (l.id === "lesson-08-3") {
    l.contentBlocks.forEach(function(b, i) {
      if (b.content && b.content.includes("GestionAlumnos")) {
        var code = extractJsonString(b.content);
        var lines = code.split("\n");
        lines.forEach(function(line, idx) {
          if (line.includes("Becado") || (line.trim().length > 0 && line.trim()[0] === "n" && line.trim().length < 5)) {
            console.log("Block " + i + ", line " + idx + ": " + JSON.stringify(line));
          }
        });
      }
    });
  }
});
