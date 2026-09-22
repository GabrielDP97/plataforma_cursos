const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const modulesDir = path.join(__dirname, "..", "courses", "programming", "modules");
const outDir = path.join(__dirname, "..", "temp-java-validation");

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.readdirSync(outDir).filter(function(f){return f.endsWith(".java")||f.endsWith(".class")}).forEach(function(f){fs.unlinkSync(path.join(outDir,f))});

var totalSingle=0,totalMulti=0,totalSolSingle=0,totalSnippets=0,passCount=0,failCount=0,failures=[];

function extractJsonString(s){var r="",i=0;while(i<s.length){if(s[i]==="\\"&&i+1<s.length){var n=s[i+1];switch(n){case "n":r+="\n";i+=2;break;case "t":r+="\t";i+=2;break;case "r":r+="\r";i+=2;break;case "\"":r+="\"";i+=2;break;case "\\":r+="\\";i+=2;break;case "/":r+="/";i+=2;break;case "u":{var h=s.substring(i+2,i+6);r+=String.fromCharCode(parseInt(h,16));i+=6;break}default:r+=s[i];i++;break}}else{r+=s[i];i++}}return r}

var ALL_CLASSES=["Alumno","Curso","Empleado","Persona","Direccion","HistorialAcademico","Departamento","AlumnoBecario","Profesor","Administrativo","Coche","AlumnoExportable","CalculadoraUtil","Nota","TipoEvaluacion","GestorAcademico","Producto","ProductoRebajado","SinDescuento","DescuentoPorcentaje","DescuentoFijo","EstrategiaDescuento","EdadInvalidaException","EmailInvalidoException","NombreInvalidoException","CursoLlenoException","Figura","Circulo","Rectangulo","Triangulo","SistemaCalificacion","SistemaTradicional","SistemaABC","SistemaMorses"];

function refsExternal(c){for(var i=0;i<ALL_CLASSES.length;i++){var cls=ALL_CLASSES[i];if(new RegExp("\\b"+cls+"\\b").test(c)&&!new RegExp("public\\s+(abstract\\s+)?class\\s+"+cls).test(c)&&!new RegExp("public\\s+interface\\s+"+cls).test(c))return true}return false}

function findEnd(c,p){if(p===-1)return -1;var d=0,ins=false,ic=false,esc=false;for(var i=p;i<c.length;i++){var ch=c[i];if(esc){esc=false;continue}if((ins||ic)&&ch==="\\"){esc=true;continue}if(ch==="\""&&!ic){ins=!ins;continue}if(ch==="'"&&!ins){ic=!ic;continue}if(ins||ic)continue;if(ch==="{")d++;else if(ch==="}"){d--;if(d===0)return i}}return-1}

function splitMulti(c){
  var pat=/public\s+(abstract\s+)?class\s+(\w+)/g,m,classes=[];
  while((m=pat.exec(c))!==null)classes.push({name:m[2],start:m.index,isAbstract:!!m[1]});
  if(classes.length<=1)return null;
  if(classes.some(function(x){return x.isAbstract}))return null;
  
  // Check for inheritance chains within the block
  var classNames = classes.map(function(x){return x.name});
  var hasInheritanceChain = false;
  for(var j=0;j<classes.length;j++){
    var classStart = classes[j].start;
    var openBrace = c.indexOf("{", classStart);
    if(openBrace===-1)continue;
    var blockEnd = findEnd(c, openBrace);
    if(blockEnd===-1)continue;
    var classBody = c.substring(classStart, blockEnd+1);
    // Check if this class extends another class in the same block
    var extendsMatch = classBody.match(/extends\s+(\w+)/);
    if(extendsMatch && classNames.indexOf(extendsMatch[1])!==-1){
      hasInheritanceChain = true;
      break;
    }
  }
  if(hasInheritanceChain) return null; // Can't split inheritance chains
  
  var pre=c.substring(0,classes[0].start),result=[];
  for(var j=0;j<classes.length;j++){
    var cl=classes[j],ob=c.indexOf("{",cl.start);
    if(ob===-1)continue;
    var be=findEnd(c,ob);
    if(be===-1)continue;
    result.push({className:cl.name,code:(pre+c.substring(cl.start,be+1)).trim()+"\n"});
  }
  return result.length>1?result:null;
}

function cleanDir(){fs.readdirSync(outDir).filter(function(f){return f.endsWith(".java")||f.endsWith(".class")}).forEach(function(f){fs.unlinkSync(path.join(outDir,f))})}
function compileAll(files){var args=files.map(function(f){return '"'+f+'"'}).join(" ");try{execSync('javac --release 21 '+args,{cwd:outDir,timeout:15000,stdio:"pipe"});return{pass:true,error:null}}catch(e){var msg=e.stderr?e.stderr.toString().split("\n")[0]:e.message.split("\n")[0];return{pass:false,error:msg.substring(0,200)}}}

function processBlocks(content,isSol){var pat=isSol?/"solution":\s*"((?:[^"\\]|\\.)*)"/g:/"type":\s*"code"[^}]*"content":\s*"((?:[^"\\]|\\.)*)"/g;var m;while((m=pat.exec(content))!==null){var code=extractJsonString(m[1]);if(code.length<30)continue;var hasMain=/public\s+static\s+void\s+main/.test(code),hasExt=/import\s+(com\.google|javax\.persistence|org\.postgresql)/.test(code),hasPkg=/^package\s+/.test(code.trim()),pubCnt=(code.match(/public\s+(abstract\s+)?class\s+/g)||[]).length,ifaceCnt=(code.match(/public\s+interface\s+/g)||[]).length;if(hasExt||ifaceCnt>0||hasPkg||!hasMain){totalSnippets++;continue}if(pubCnt>1){var sp=splitMulti(code);if(!sp){totalSnippets++;continue}totalMulti++;var files=[];for(var j=0;j<sp.length;j++){var f=path.join(outDir,sp[j].className+".java");fs.writeFileSync(f,sp[j].code,"utf8");files.push(f)}var r=compileAll(files);if(r.pass)passCount++;else{failCount++;failures.push(sp.map(function(x){return x.className}).join("+")+" (multi): "+r.error)}cleanDir();continue}if(refsExternal(code)){totalSnippets++;continue}if(isSol)totalSolSingle++;else totalSingle++;var cm=code.match(/public\s+(abstract\s+)?class\s+(\w+)/);var cn=cm?cm[2]:"Unknown";var f=path.join(outDir,cn+".java");fs.writeFileSync(f,code,"utf8");var r=compileAll([f]);if(r.pass)passCount++;else{failCount++;failures.push(cn+(isSol?" (sol)":"")+": "+r.error)}cleanDir()}}

for(var i=1;i<=18;i++){var mf=path.join(modulesDir,"mod-"+(i<10?"0":"")+i+".json");if(!fs.existsSync(mf))continue;var content=fs.readFileSync(mf,"utf8");processBlocks(content,false);processBlocks(content,true)}

var totalCompiled=passCount+failCount,totalDetected=totalSingle+totalMulti+totalSolSingle+totalSnippets;
console.log("\n========================================");
console.log("JAVA 21 COMPILATION RESULTS");
console.log("javac --release 21 (Java 25.0.1)");
console.log("========================================");
console.log("Standalone single-class: "+totalSingle);
console.log("Multi-class groups: "+totalMulti);
console.log("Exercise solutions: "+totalSolSingle);
console.log("Snippets excluded: "+totalSnippets);
console.log("");
console.log("Math: "+totalSingle+"+"+totalMulti+"+"+totalSolSingle+"+"+totalSnippets+"="+totalDetected);
console.log("");
console.log("TOTAL compiled: "+totalCompiled);
console.log("PASS: "+passCount);
console.log("FAIL: "+failCount);
console.log("========================================");
if(failCount>0){console.log("\nFAILURES:");failures.forEach(function(f){console.log("  "+f)})}
