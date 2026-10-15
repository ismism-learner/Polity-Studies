/* 把 原文/E##-*.txt 按段落切成 原文/parts/E##-pN.txt，供分块整理。
   用法：node tools/split-source.mjs [每块目标字数，默认 9000] */
import fs from 'node:fs';
import path from 'node:path';

const TARGET = Number(process.argv[2] || 9000);
const SRC = path.join(process.cwd(), '原文');
const OUT = path.join(SRC, 'parts');
fs.mkdirSync(OUT, { recursive: true });

const files = fs.readdirSync(SRC).filter((f) => /^E\d\d-.*\.txt$/.test(f)).sort();
const manifest = [];

for (const f of files) {
  const ep = f.slice(0, 3);
  const raw = fs.readFileSync(path.join(SRC, f), 'utf8').replace(/^\uFEFF/, '');
  const lines = raw.split(/\r?\n/);
  // 文件头到第一个 --- 为止
  const sep = lines.findIndex((l) => /^---\s*$/.test(l));
  const head = lines.slice(0, sep >= 0 ? sep + 1 : 0);
  const titleLine = (head.find((l) => /^#\s/.test(l)) || '# ' + f).replace(/^#\s*/, '');
  const body = lines.slice(sep >= 0 ? sep + 1 : 0);

  // 段落：以空行分隔；锚点单独成段
  const paras = [];
  let cur = [];
  for (const l of body) {
    if (l.trim() === '') { if (cur.length) { paras.push(cur.join(' ')); cur = []; } continue; }
    if (/^\[\[\d/.test(l.trim())) { if (cur.length) { paras.push(cur.join(' ')); cur = []; } paras.push(l.trim()); continue; }
    cur.push(l.trim());
  }
  if (cur.length) paras.push(cur.join(' '));

  const chars = paras.filter((p) => !/^\[\[/.test(p)).reduce((n, p) => n + p.length, 0);
  const nParts = Math.max(1, Math.ceil(chars / TARGET));
  const per = chars / nParts;

  const parts = [];
  let acc = 0, bucket = [];
  for (const p of paras) {
    bucket.push(p);
    if (!/^\[\[/.test(p)) acc += p.length;
    if (acc >= per && parts.length < nParts - 1) { parts.push(bucket); bucket = []; acc = 0; }
  }
  if (bucket.length) parts.push(bucket);

  parts.forEach((bodyParas, i) => {
    const bodyChars = bodyParas.filter((p) => !/^\[\[/.test(p)).reduce((n, p) => n + p.length, 0);
    const out = [
      `# ${titleLine}　（第 ${i + 1}/${parts.length} 块）`,
      '',
      `- 本块正文约 ${bodyChars} 字；原文全篇约 ${chars} 字，共 ${parts.length} 块。`,
      `- 整理口径：见 tools/整理规范.md（口径 B · 全文整理，篇幅 80%–110%，信息点一一对应）。`,
      `- 输出到 文稿/parts/${ep}-p${i + 1}.md，一级小节用 \`### 小节名\`（不编号），块末附「## 勘误（本块）」表。`,
      '', '---', '',
      ...bodyParas.flatMap((p) => [p, '']),
    ].join('\n');
    const name = `${ep}-p${i + 1}.txt`;
    fs.writeFileSync(path.join(OUT, name), out, 'utf8');
    manifest.push({ ep, part: i + 1, of: parts.length, file: `原文/parts/${name}`, out: `文稿/parts/${ep}-p${i + 1}.md`, title: titleLine, chars: bodyChars, sourceChars: chars });
  });
}

fs.writeFileSync(path.join(OUT, '_manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
console.log(`切出 ${manifest.length} 块（每块目标 ${TARGET} 字）`);
for (const m of manifest) console.log(`  ${m.ep} p${m.part}/${m.of}  ${String(m.chars).padStart(6)}字  ${m.file}`);
console.log('\n原文合计 ' + manifest.reduce((n, m) => n + m.chars, 0) + ' 字（分块后求和）');
