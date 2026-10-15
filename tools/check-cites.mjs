/* 校验 strategy.js 里每条规则的出处关键词能否在编译后的文稿中命中。
   用法：node tools/check-cites.mjs */
import fs from 'node:fs';

function load(file, globalName) {
  const src = fs.readFileSync(file, 'utf8');
  const box = {};
  new Function('window', 'globalThis', src)(box, box);
  return box[globalName];
}

const data = load('texts.js', 'SHUZHENG_TEXTS');
const SX = load('strategy.js', 'SHUZHENG_STRATEGY');
if (!data || !SX) { console.error('加载失败'); process.exit(1); }

const byEp = {};
for (const e of data.episodes) byEp[e.ep] = e;

function hit(ep, term) {
  const e = byEp[ep];
  if (!e) return { ok: false, why: '本讲尚未编译' };
  const t = String(term).replace(/^《|》$/g, '');
  for (const b of e.blocks) {
    if ((b.text || '').includes(t)) return { ok: true, sec: b.text.slice(0, 30) };
  }
  return { ok: false, why: '本讲内没有该关键词' };
}

const rows = [];
for (const r of SX.RULES) {
  if (!r.src) continue;
  const h = hit(r.src.ep, r.src.term);
  rows.push({ rule: r.id, ep: r.src.ep, term: r.src.term, ok: h.ok, why: h.why || '', sec: h.sec || '' });
}
const reg = hit('E13', '四重性');
rows.push({ rule: '(四重性读数)', ep: 'E13', term: '四重性', ok: reg.ok, why: reg.why || '', sec: reg.sec || '' });

const bad = rows.filter((r) => !r.ok);
console.log('规则出处共 ' + rows.length + ' 条：命中 ' + (rows.length - bad.length) + '，未命中 ' + bad.length + '\n');
for (const r of rows) {
  console.log((r.ok ? '  ok   ' : '  MISS ') + r.rule.padEnd(18) + r.ep + '  《' + r.term + '》' + (r.ok ? '  → ' + r.sec.replace(/\s+/g, ' ') : '  → ' + r.why));
}
console.log('\n未编译的讲次：' + ['E01','E02','E03','E05','E06','E07','E08','E09','E10','E11','E12','E13'].filter((e) => !byEp[e]).join(' ') || '（全部已编译）');
process.exit(bad.length && bad.every((b) => b.why === '本讲尚未编译') ? 0 : bad.length ? 1 : 0);
