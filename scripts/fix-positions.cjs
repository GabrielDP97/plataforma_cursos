const fs = require('fs');
let d15 = fs.readFileSync('courses/programming/modules/mod-15.json', 'utf8');
d15 = d15.replace('"position": 16', '"position": 15');
fs.writeFileSync('courses/programming/modules/mod-15.json', d15, 'utf8');
console.log('Fixed mod-15 position to 15');
let d16 = fs.readFileSync('courses/programming/modules/mod-16.json', 'utf8');
d16 = d16.replace('"position": 17', '"position": 16');
fs.writeFileSync('courses/programming/modules/mod-16.json', d16, 'utf8');
console.log('Fixed mod-16 position to 16');
let d17 = fs.readFileSync('courses/programming/modules/mod-17.json', 'utf8');
d17 = d17.replace('"position": 18', '"position": 17');
fs.writeFileSync('courses/programming/modules/mod-17.json', d17, 'utf8');
console.log('Fixed mod-17 position to 17');
for (let i = 1; i <= 18; i++) {
  const f = 'courses/programming/modules/mod-' + String(i).padStart(2, '0') + '.json';
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  console.log('mod-' + String(i).padStart(2, '0') + ': pos=' + d.position + ' id=' + d.id);
}
