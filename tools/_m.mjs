import fs from 'node:fs';
const src = fs.readFileSync('nine.js','utf8') + fs.readFileSync('power.js','utf8');
console.log('  ro-block 出现次数: ' + (src.match(/ro-block/g)||[]).length);
const strip = (s) => s.replace(/<[^>]+>/g,'').length;
// 粗略估读：右栏每开一层要滚多少
console.log('  nine.js 文本量: ' + strip(src.slice(0,0)) + ' —— 见下方估值');
