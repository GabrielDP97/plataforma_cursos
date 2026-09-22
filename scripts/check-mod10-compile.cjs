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
      if (b.content && b.content.includes("ProductoRebajado")) {
        var code = extractJsonString(b.content);
        // Write to temp file and compile
        var outDir = "temp-java-validation";
        var f = outDir + "/Test_" + i + ".java";
        require("fs").writeFileSync(f, code, "utf8");
        try {
          require("child_process").execSync("javac --release 21 " + f, {cwd: outDir, timeout: 10000, stdio: "pipe"});
          console.log("Block " + i + ": PASS");
        } catch(e) {
          console.log("Block " + i + ": FAIL - " + (e.stderr ? e.stderr.toString().split("\\n")[0] : e.message.split("\\n")[0]));
          // Show the problematic lines
          var lines = code.split("\\n");
          lines.forEach(function(line, idx) {
            if (line.includes("EUR") || line.includes("%)")) {
              console.log("  Line " + idx + ": " + line);
            }
          });
        }
        // Cleanup
        try { require("fs").unlinkSync(f); } catch(e) {}
        try { require("fs").unlinkSync(outDir + "/Test_" + i + ".class"); } catch(e) {}
      }
    });
  }
});
