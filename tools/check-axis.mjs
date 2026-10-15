/* 校验文献视图右侧实时坐标系的「段落 → 坐标状态」映射：
   一、每一讲有多少块能命中、命中的是哪些状态；
   二、有没有写了却永远命不中的死规则（多半是措辞和文稿不一致）；
   三、命中的状态能不能被 axis.js 解析（函数族 id 是否存在、坐标是不是有限数）。
   用法：node tools/check-axis.mjs */
import fs from 'node:fs';

function load(file, globalName) {
  const src = fs.readFileSync(file, 'utf8');
  const box = {};
  new Function('window', 'globalThis', src)(box, box);
  return box[globalName];
}

const data = load('texts.js', 'SHUZHENG_TEXTS');
const MAP = load('axis-map.js', 'SHUZHENG_AXIS_MAP');
const MODEL = load('model.js', 'ShuzhengModel');
if (!data || !MAP) { console.error('加载失败'); process.exit(1); }

const byEp = {};
for (const e of data.episodes) byEp[e.ep] = e;
const MODEL_IDS = new Set((MODEL && MODEL.MODELS ? MODEL.MODELS : []).map((m) => m.id));

/* 与 reader.js 一致：title ＝ 最近的上一级小节标题；text ＝ 标题 + 本段正文 */
function texts(ep) {
  const e = byEp[ep];
  if (!e) return [];
  const out = [];
  let sec = '';
  for (const b of e.blocks) {
    if (b.tag === 'h2' || b.tag === 'h3') sec = (b.text || '').trim();
    out.push({ id: b.id, tag: b.tag, title: sec, text: sec + ' ' + (b.text || '') });
  }
  return out;
}

let bad = 0;
const ok = (cond, msg) => { console.log((cond ? '  ok   ' : '  FAIL ') + msg); if (!cond) bad++; };

for (const ep of ['E13', 'E02']) {
  const list = MAP[ep] || [];
  const used = new Set();
  const blks = texts(ep);
  let hit = 0;
  const states = new Map();
  for (const b of blks) {
    const r = MAP.ruleFor(ep, b.title, b.text);
    if (!r) continue;
    hit++;
    used.add(list.indexOf(r));
    const key = r.id ? ('族 ' + r.id + (r.a !== undefined ? ' a=' + r.a : '') + (r.x !== undefined ? ' x=' + r.x : ''))
      : (r.pt ? ('点 (' + r.pt.x + ',' + r.pt.y + ')') : '平面');
    states.set(key, (states.get(key) || 0) + 1);
  }
  console.log(`\n${ep}：${blks.length} 块，命中 ${hit} 块，用到 ${used.size}/${list.length} 条规则`);
  console.log('  命中最多的状态：');
  [...states.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
    .forEach(([k, n]) => console.log('    ' + String(n).padStart(3) + ' 块  ' + k));

  ok(hit > 0, `${ep} 至少有一块能命中`);
  ok(hit / blks.length >= 0.6, `${ep} 命中率 ${(hit / blks.length * 100).toFixed(0)}% ≥ 60%`);
  /* 未命中的规则只作提醒：措辞可能对的是另一种整理稿（讲义 / 全文整理稿） */
  const dead = list.map((r, i) => used.has(i) ? null : r.re.source).filter(Boolean);
  console.log(dead.length
    ? `  ⚠ ${ep} 有 ${dead.length} 条规则在当前的整理稿里没命中（待命）：` + dead.join(' / ')
    : `  ok   ${ep} 全部 ${list.length} 条规则都命中`);

  /* 解析检查：id 必须存在；坐标必须是有限数 */
  for (const r of list) {
    if (r.id && !MODEL_IDS.has(r.id)) ok(false, `${ep} 规则 ${r.re} 用了不存在的函数族 id: ${r.id}`);
    if (r.x !== undefined && !isFinite(r.x)) ok(false, `${ep} 规则 ${r.re} 的 x 不是有限数`);
    if (r.pt && (!isFinite(r.pt.x) || !isFinite(r.pt.y))) ok(false, `${ep} 规则 ${r.re} 的 pt 不是有限数`);
  }
}

/* E02 的落点必须真的落在 power.js 认定的档位上 */
const P = load('power.js', 'SHUZHENG_POWER');
if (P) {
  console.log('\nE02 各规则落在哪一档（power.js 的 read）');
  for (const r of MAP.E02) {
    if (!r.pt) continue;
    const read = P.read(r.pt.x, r.pt.y, { unit: 1 });
    console.log('  (' + r.pt.x + ', ' + r.pt.y + ')  →  ' + read.q.name + ' · ' + read.q.doom
      + '   ｜  秘密性：' + read.s.name);
  }
  const expect = { 0.9: '无质', '-1.4': '苟合', '-2.6': '人命' };
  for (const [y, name] of Object.entries(expect)) {
    const r = MAP.E02.find((x) => x.pt && String(x.pt.y) === y);
    if (r) ok(P.read(r.pt.x, r.pt.y, { unit: 1 }).q.name === name, `y=${y} 落在「${name}」档`);
  }
}

console.log(bad ? `\n${bad} 项未通过` : '\n全部通过');

/* 逐块命中（排查用）：node tools/check-axis.mjs E13 */
if (process.argv[2]) {
  const ep = process.argv[2];
  console.log(`\n${ep} 逐块命中：`);
  for (const b of texts(ep)) {
    const r = MAP.ruleFor(ep, b.title, b.text);
    console.log('  ' + b.id.padEnd(9) + b.tag.padEnd(5)
      + '[' + (b.title || '').slice(0, 20) + ']  →  ' + (r ? r.re.source : '（未命中）')
      + '   「' + (b.text || '').slice(0, 26).replace(/\s+/g, ' ') + '」');
  }
}

process.exit(bad ? 1 : 0);
