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

// Check ALL code blocks across ALL modules for ProductoRebajado
for (var i = 1; i <= 18; i++) {
  var f = "courses/programming/modules/mod-" + (i < 10 ? "0" : "") + i + ".json";
  var d = JSON.parse(fs.readFileSync(f, "utf8"));
  d.lessons.forEach(function(l) {
    l.contentBlocks.forEach(function(b, bi) {
      if (b.type === "code" && b.content) {
        var code = extractJsonString(b.content);
        if (code.includes("ProductoRebajado")) {
          console.log("FOUND in mod-" + (i < 10 ? "0" : "") + i + " " + l.id + " block " + bi);
          // List classes
          var cls = code.match(/public\s+(abstract\s+)?class\s+(\w+)/g);
          if (cls) cls.forEach(function(c) { console.log("  " + c); });
          // Check for the error
          var lines = code.split("\n");
          lines.forEach(function(line, idx) {
            if (line.includes("EUR") && line.includes("%)")) {
              console.log("  EUR line " + idx + ": " + line);
            }
          });
        }
      }
    });
  });
}
