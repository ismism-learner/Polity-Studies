/* 信息点覆盖率核对：原文 vs 整理稿的 4-gram 包含率 + 未覆盖片段抽样。
   用来验证「不压缩、信息点一一对应」，而不是只看字数。
   用法：node tools/check-coverage.mjs [--only E01,E12] [--top 15] */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, '原文');
const OUT = path.join(ROOT, '文稿');
const onlyIdx = process.argv.indexOf('--only');
const only = onlyIdx > 0 ? process.argv[onlyIdx + 1].split(',').map((s) => s.trim()) : null;
const topIdx = process.argv.indexOf('--top');
const TOP = topIdx > 0 ? Number(process.argv[topIdx + 1]) : 12;

const cjk = (s) => (s.match(/[\u4e00-\u9fff]/g) || []).join('');
const grams = (s, n = 4) => {
  const t = cjk(s);
  const set = new Set();
  for (let i = 0; i + n <= t.length; i++) set.add(t.slice(i, i + n));
  return set;
};

function srcText(ep) {
  const f = fs.readdirSync(SRC).find((x) => x.startsWith(ep + '-') && x.endsWith('.txt'));
  if (!f) return '';
  const raw = fs.readFileSync(path.join(SRC, f), 'utf8');
  return raw.split(/^---\s*$/m).slice(1).join('\n');
}

function outText(ep) {
  const f = fs.readdirSync(OUT).find((x) => x.startsWith(ep + '-') && x.endsWith('.md'));
  if (!f) return { text: '', file: '' };
  let md = fs.readFileSync(path.join(OUT, f), 'utf8').replace(/^\uFEFF/, '');
  md = md.replace(/^\s*---[\s\S]*?\n---\s*/, '');          // front matter
  md = md.replace(/##\s*附录 · 语音转写勘误对照表[\s\S]*$/, ''); // 勘误表不计入覆盖率
  md = md.replace(/^#+\s*/gm, '').replace(/\|/g, ' ');
  return { text: md, file: f };
}

const eps = fs.readdirSync(OUT).filter((f) => /^E\d\d-.*\.md$/.test(f)).map((f) => f.slice(0, 3))
  .filter((e) => !only || only.includes(e)).sort();

console.log('讲   原文CJK  整理CJK  字数比  4gram包含率  未覆盖片段（抽样）');
const rows = [];
for (const ep of eps) {
  const s = cjk(srcText(ep));
  const { text: o } = outText(ep);
  const oc = cjk(o);
  if (!s || !oc) continue;
  const gs = grams(s), go = grams(o);
  let hit = 0;
  for (const g of gs) if (go.has(g)) hit++;
  const cov = hit / gs.size;
  // 未覆盖的 4-gram：按出现频次排序，取最上面几个的上下文
  const miss = [];
  const seen = new Set();
  for (let i = 0; i + 4 <= s.length; i++) {
    const g = s.slice(i, i + 4);
    if (go.has(g) || seen.has(g)) continue;
    seen.add(g);
    miss.push({ g, ctx: s.slice(Math.max(0, i - 8), i + 12) });
  }
  rows.push({ ep, s: s.length, o: oc.length, ratio: oc.length / s.length, cov, miss });
  console.log(`  ${ep}  ${String(s.length).padStart(6)}  ${String(oc.length).padStart(6)}  ${(oc.length / s.length * 100).toFixed(0)}%   ${(cov * 100).toFixed(1)}%   ${miss.slice(0, TOP).map((m) => m.g).join(' ')}`);
}

const worst = [...rows].sort((a, b) => a.cov - b.cov).slice(0, 2);
for (const w of worst) {
  console.log(`\n—— ${w.ep} 未覆盖片段上下文（前 ${TOP} 条）——`);
  for (const m of w.miss.slice(0, TOP)) console.log(`  [${m.g}] …${m.ctx.replace(/\s/g, '')}…`);
}
const bad = rows.filter((r) => r.cov < 0.5);
console.log(bad.length ? `\n⚠ ${bad.map((b) => b.ep).join(' ')} 的 4-gram 包含率低于 50%，需要复核是否漏内容` : '\n覆盖率均 ≥50%');
