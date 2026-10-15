/* 把 文稿/parts/E##-pN.md 汇编成 文稿/E##-*.md（全文整理稿）。
   - 元数据（front matter）沿用 文稿-讲义/ 里同名讲次的字段
   - 正文小节统一编号（一、二、三…），块末勘误表并入文末《附录 · 语音转写勘误对照表》
   - 输出每讲的篇幅比（整理后正文 ÷ 原文正文），违反 80%–110% 会标红提示
   用法：node tools/assemble-parts.mjs [--only E01,E02] */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PARTS = path.join(ROOT, '文稿', 'parts');
const OLD = path.join(ROOT, '文稿-讲义');
const OUT = path.join(ROOT, '文稿');
const SRC = path.join(ROOT, '原文');

const only = (() => {
  const i = process.argv.indexOf('--only');
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1].split(',').map((s) => s.trim()) : null;
})();

const CN = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

/* 按讲次的术语归并：跨块整理者可能对同一个词给出两种写法，在这里统一。
   只在确有必要时添加，并记在 README 里。 */
const NORMALIZE = {
  E02: [['权必有制', '权必有质']],
};
/* 对所有讲统一做的措辞归并（含勘误表）：分块作业痕迹不该出现在成稿里 */
const NORMALIZE_ALL = [
  ['本块', '原文同段'],
];
function cnNum(n) {
  if (n <= 10) return n === 10 ? '十' : CN[n];
  if (n < 20) return '十' + CN[n % 10];
  if (n < 100) return CN[Math.floor(n / 10)] + '十' + (n % 10 ? CN[n % 10] : '');
  return String(n);
}

function readMeta(ep) {
  const f = fs.readdirSync(OLD).find((x) => x.startsWith(ep + '-'));
  if (!f) return { title: ep, bv: '', series: '其它', order: 99, duration: '', tags: '', summary: '' };
  const md = fs.readFileSync(path.join(OLD, f), 'utf8').replace(/^\uFEFF/, '');
  const m = md.match(/^\s*---\r?\n([\s\S]*?)\r?\n---/);
  const meta = {};
  if (m) for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_]+)\s*:\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].trim();
  }
  return { slug: f.replace(/^E\d+-/, '').replace(/\.md$/, ''), ...meta };
}

function sourceChars(ep) {
  const f = fs.readdirSync(SRC).find((x) => x.startsWith(ep + '-') && x.endsWith('.txt'));
  if (!f) return 0;
  const raw = fs.readFileSync(path.join(SRC, f), 'utf8');
  const body = raw.split(/^---\s*$/m).slice(1).join('\n');
  return (body.match(/[^\s\[\]:\d]/g) || []).length; // 非空白、非锚点字符
}

function stripErrata(text) {
  const i = text.search(/^##\s*勘误/m);
  if (i < 0) return { body: text, errata: [] };
  const body = text.slice(0, i);
  const rows = text.slice(i).split(/\r?\n/)
    .filter((l) => /^\|/.test(l.trim()) && !/^\|[\s:|-]+\|$/.test(l.trim()))
    .map((l) => l.trim())
    .filter((l) => !/^\|\s*原文转写\s*\|/.test(l));
  return { body, errata: rows };
}

const eps = [...new Set(fs.readdirSync(PARTS).filter((f) => /^E\d\d-p\d+\.md$/.test(f)).map((f) => f.slice(0, 3)))]
  .filter((e) => !only || only.includes(e)).sort();

/* 期望块数：来自切块清单，缺块就不落盘，免得网页上出现半讲 */
const expect = {};
try {
  for (const m of JSON.parse(fs.readFileSync(path.join(SRC, 'parts', '_manifest.json'), 'utf8'))) expect[m.ep] = m.of;
} catch (e) { /* 没有清单就不检查 */ }

if (!eps.length) { console.log('还没有任何分块产物（文稿/parts/*.md）'); process.exit(0); }

const report = [];
for (const ep of eps) {
  const meta = readMeta(ep);
  const partFiles = fs.readdirSync(PARTS).filter((f) => f.startsWith(ep + '-p') && f.endsWith('.md'))
    .sort((a, b) => Number(a.match(/-p(\d+)/)[1]) - Number(b.match(/-p(\d+)/)[1]));
  const seen = new Set();
  const errataAll = [];
  const sections = [];
  let bodyChars = 0;
  for (const pf of partFiles) {
    const { body, errata } = stripErrata(fs.readFileSync(path.join(PARTS, pf), 'utf8').replace(/^\uFEFF/, ''));
    // 小节切分；没写 ### 标题的块也不能丢，整块收成「（续）」
    let chunks = body.split(/^###\s+/m).slice(1);
    if (!chunks.length) {
      const t = body.trim();
      if (t) {
        const lines = t.split(/\r?\n/).filter((l) => l.trim());
        const guess = (lines[0] || '').replace(/^#+\s*/, '').slice(0, 24) || '（续）';
        if (/^#/.test(lines[0] || '')) lines.shift();
        chunks = [guess + '\n' + lines.join('\n')];
        console.log(`  ! ${pf} 没有 "### " 小节标题，整块并入一节「${guess}」`);
      }
    }
    for (const c of chunks) {
      const lines = c.split(/\r?\n/);
      const title = lines.shift().trim().replace(/^[一二三四五六七八九十百]+[、.．]\s*/, '');
      const content = lines.join('\n').trim();
      if (!content) continue;
      sections.push({ title, content });
      bodyChars += content.replace(/[#*\->\s|]/g, '').length;
    }
    for (const r of errata) {
      const cells = r.split('|').map((c) => c.trim());
      const key = (cells[1] || '') + '→' + (cells[2] || '');
      if (seen.has(key)) continue;
      seen.add(key); errataAll.push(r);
    }
  }
  if (!sections.length) continue;
  if (expect[ep] && partFiles.length < expect[ep]) {
    console.log(`  ${ep}  只到 ${partFiles.length}/${expect[ep]} 块，等其余块到位再汇编`);
    continue;
  }

  const srcChars = sourceChars(ep);
  const ratio = srcChars ? (bodyChars / srcChars) : 0;
  const fullChars = bodyChars + errataAll.join('').replace(/\s/g, '').length;
  const ratioFull = srcChars ? (fullChars / srcChars) : 0;
  const body = sections.map((s, i) => `### ${cnNum(i + 1)}、${s.title}\n\n${s.content}`).join('\n\n');
  let bodyOut = body;
  for (const [from, to] of (NORMALIZE[ep] || []).concat(NORMALIZE_ALL)) bodyOut = bodyOut.split(from).join(to);
  const errataOut = errataAll.map((r) => {
    let x = r;
    for (const [from, to] of NORMALIZE_ALL) x = x.split(from).join(to);
    return x;
  });
  const errata = errataOut.length
    ? ['## 附录 · 语音转写勘误对照表', '', '| 原文转写 | 整理后 | 依据 |', '| --- | --- | --- |', ...errataOut].join('\n')
    : '';
  const head = [
    '---',
    `ep: ${ep}`,
    `title: ${meta.title || ep}`,
    `bv: ${meta.bv || ''}`,
    `series: ${meta.series || '其它'}`,
    `order: ${meta.order || 99}`,
    `duration: ${meta.duration || ''}`,
    `tags: ${meta.tags || ''}`,
    `summary: ${meta.summary || ''}`,
    '---',
    '',
    `> **整理说明**：本讲按「整理，不是总结」的铁律整理（口径 B · 通顺化）：删语气助词、结巴、口头重复与现场插话，口语转通顺书面语，按讲述逻辑分节，删除时间戳；不压缩内容、不删减观点与细节、不增补原文没有的东西。语音转写勘误见文末对照表。原文正文约 ${srcChars} 字，本稿约 ${bodyChars} 字（${(ratio * 100).toFixed(0)}%）。`,
    '',
    '## 正文',
    '',
    '',
  ].join('\n');
  const md = head + bodyOut + '\n\n' + errata + '\n';
  const name = `${ep}-${meta.slug || 'full'}.md`;
  fs.writeFileSync(path.join(OUT, name), md, 'utf8');
  report.push({ ep, name, srcChars, bodyChars, ratio, ratioFull, parts: partFiles.length, sections: sections.length, errata: errataAll.length });
}

console.log('汇编结果（正文比＝仅正文/原文，全文比＝含勘误表/原文；铁律按正文比判定 80%–110%，勘误表是规范要求新增的附录，不计入）：');
let bad = 0;
for (const r of report) {
  const ok = r.ratio >= 0.8 && r.ratio <= 1.1;
  if (!ok) bad++;
  console.log(`  ${r.ep}  ${String(r.parts).padStart(2)}块 ${String(r.sections).padStart(3)}节  ${String(r.srcChars).padStart(6)} → ${String(r.bodyChars).padStart(6)} 字  正文 ${(r.ratio * 100).toFixed(0)}%  全文 ${(r.ratioFull * 100).toFixed(0)}%  ${ok ? 'ok' : '⚠ 正文比不合格'}  勘误${r.errata}条  ${r.name}`);
}
console.log(bad ? `\n⚠ ${bad} 讲篇幅比不在 0.8–1.1，需要补/删` : '\n全部落在 0.8–1.1');
