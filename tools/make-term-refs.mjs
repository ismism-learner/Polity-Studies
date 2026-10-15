/* 从 文稿-讲义/*.md 抽出「术语校勘」「疑点与未决」两节，生成 原文/parts/_E##-参考.md，
   供同一讲的分块整理者共用（跨块同词同改）。
   用法：node tools/make-term-refs.mjs */
import fs from 'node:fs';
import path from 'node:path';

const OLD = path.join(process.cwd(), '文稿-讲义');
const OUT = path.join(process.cwd(), '原文', 'parts');
fs.mkdirSync(OUT, { recursive: true });

function section(md, re) {
  const m = md.match(re);
  if (!m) return '';
  const start = m.index + m[0].length;
  const rest = md.slice(start);
  const next = rest.search(/^##\s/m);
  return (next >= 0 ? rest.slice(0, next) : rest).trim();
}

let n = 0;
for (const f of fs.readdirSync(OLD).filter((x) => x.endsWith('.md')).sort()) {
  const ep = f.slice(0, 3);
  const md = fs.readFileSync(path.join(OLD, f), 'utf8').replace(/^\uFEFF/, '');
  const terms = section(md, /^##\s*术语校勘\s*$/m);
  const doubts = section(md, /^##\s*疑点与未决\s*$/m);
  const rel = section(md, /^##\s*与其它讲的关系\s*$/m);
  if (!terms && !doubts) { console.log(`  ${ep} 没有可复用的术语表`); continue; }
  const body = [
    `# ${ep} 术语与疑点参考（来自早先的讲义整理，可复用其判断）`,
    '',
    '> 这是同一讲早先一版整理稿里的校勘成果。**同一讲的所有分块必须按同一套写法**：',
    '> 下表里出现的词，各块一律照“校正”列书写；下表列的“存疑”写法，各块统一标〔疑〕，不要各自另创一种写法。',
    '',
    terms ? '## 术语校勘（照此书写）\n\n' + terms : '',
    '',
    doubts ? '## 疑点与未决（沿用同样的判断）\n\n' + doubts : '',
    '',
    rel ? '## 与其它讲的关系（供判断上下文）\n\n' + rel : '',
  ].join('\n');
  fs.writeFileSync(path.join(OUT, `_${ep}-参考.md`), body, 'utf8');
  n++;
  console.log(`  写出 原文/parts/_${ep}-参考.md（${body.length} 字符）`);
}
console.log(`共 ${n} 份`);
