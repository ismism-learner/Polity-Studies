/* 校验「权力三性质」这一层的两件事：
   一、power.js 与 index.html 里挂到 E02 的出处关键词，能否在编译后的文稿中命中
       （与 reader.js 的 findByTerm 同一套查找规则）；
   二、读数引擎 read(x, y, {unit}) 的方向与分档是否自洽。
   用法：node tools/check-power.mjs */
import fs from 'node:fs';

function load(file, globalName) {
  const src = fs.readFileSync(file, 'utf8');
  const box = {};
  new Function('window', 'globalThis', src)(box, box);
  return box[globalName];
}

const data = load('texts.js', 'SHUZHENG_TEXTS');
if (!data) { console.error('texts.js 加载失败'); process.exit(1); }
const byEp = {};
for (const e of data.episodes) byEp[e.ep] = e;

/* 与 reader.js 的 findByTerm 一致：先跳过标题块，再退回到任意块 */
function hit(ep, term) {
  const e = byEp[ep];
  if (!e) return { ok: false, why: '本讲尚未编译' };
  const t = String(term).replace(/^《|》$/g, '');
  const scan = (skipHeads) => {
    for (const b of e.blocks) {
      if (skipHeads && (b.tag === 'h2' || b.tag === 'h3')) continue;
      if ((b.text || '').includes(t)) return b;
    }
    return null;
  };
  const b = scan(true) || scan(false);
  return b ? { ok: true, id: b.id, sec: (b.text || '').slice(0, 34).replace(/\s+/g, ' ') }
    : { ok: false, why: '本讲内没有该关键词' };
}

const found = new Map();
function add(ep, term, where) {
  const k = ep + '\u0000' + term;
  if (!found.has(k)) found.set(k, { ep, term, where: new Set() });
  found.get(k).where.add(where);
}

/* power.js：枚举里的 term 字段与读数里的 cite('…')，都指 E02 */
const PJ = 'power.js';
if (fs.existsSync(PJ)) {
  const pj = fs.readFileSync(PJ, 'utf8');
  for (const m of pj.matchAll(/\bterm:\s*'([^']+)'/g)) add('E02', m[1], 'power.js 枚举');
  for (const m of pj.matchAll(/\bcite\('([^']+)'/g)) add('E02', m[1], 'power.js 读数');
}

/* nine.js：X 轴左侧那一层的出处，指 E08 */
if (fs.existsSync('nine.js')) {
  const nj = fs.readFileSync('nine.js', 'utf8');
  for (const m of nj.matchAll(/\bcite\('([^']+)'/g)) add('E08', m[1], 'nine.js 读数');
}

/* HTML：形如 <a … data-ep="E##" … data-term="…" …> 的出处链接 */
for (const f of ['index.html']) {
  if (!fs.existsSync(f)) continue;
  const h = fs.readFileSync(f, 'utf8');
  for (const m of h.matchAll(/<a\b[^>]*>/g)) {
    const tag = m[0];
    const ep = tag.match(/data-ep="(E\d\d)"/);
    const term = tag.match(/data-term="([^"]+)"/);
    if (ep && term) add(ep[1], term[1], f);
  }
}

const rows = [...found.values()].map((r) => ({ ...r, ...hit(r.ep, r.term), where: [...r.where].join('、') }));
rows.sort((a, b) => a.ep.localeCompare(b.ep) || a.term.localeCompare(b.term));

const bad = rows.filter((r) => !r.ok);
console.log(`一、出处 ${rows.length} 条：命中 ${rows.length - bad.length}，未命中 ${bad.length}\n`);
for (const r of rows) {
  console.log((r.ok ? '  ok   ' : '  MISS ') + r.ep + '  《' + r.term + '》'
    + (r.ok ? '  → ' + r.id + '  ' + r.sec : '  → ' + r.why) + '   [' + r.where + ']');
}

/* ---------- 二、读数引擎 ---------- */
const P = load('power.js', 'SHUZHENG_POWER');
let engineBad = 0;
console.log('\n二、读数引擎 read(x, y, {unit})');
if (!P) { console.log('  FAIL 无法加载 power.js'); engineBad++; }
else {
  const ok = (cond, msg) => { console.log((cond ? '  ok   ' : '  FAIL ') + msg); if (!cond) engineBad++; };
  const U = 1;
  const at = (y, x = 0, unit = U) => P.read(x, y, { unit });

  ok(at(2).q.key === 'none' && at(0).q.key === 'none' && at(0).q.weight === 0,
    'y ≥ 0（对价线以上）→ 无质，当量 0');
  ok(at(-0.5).q.key === 'violation' && at(-1).q.key === 'violation',
    '0 < 深度 ≤ 1 个单元 → 一般的违禁 · 法度');
  ok(at(-1.5).q.key === 'carnal', '1 < 深度 ≤ 2 个单元 → 苟合 · 伦理');
  ok(at(-2.5).q.key === 'life' && at(-9).q.key === 'life', '深度 > 2 个单元 → 人命 · 生死');

  /* 单调：越往下档位不倒退，当量不下降且封顶 1 */
  let prev = -1, mono = true, wOk = true;
  for (let y = 0; y >= -8; y -= 0.05) {
    const r = at(y);
    const idx = r.q.key === 'none' ? 0 : P.LADDER.findIndex((s) => s.key === r.q.key) + 1;
    if (idx < prev) mono = false;
    prev = idx;
    if (!(r.q.weight >= 0 && r.q.weight <= 1)) wOk = false;
  }
  ok(mono, '越往下（越计较利害）档位单调不倒退');
  ok(wOk, '当量始终落在 [0,1]');

  /* 分档跟着模型视图已有的「单元阈值」走，不另立刻度 */
  ok(at(-1.1, 0, 1).q.key === 'carnal' && at(-1.1, 0, 1.2).q.key === 'violation',
    '单元阈值 1.0 / 1.2 会移动分档（复用已有的 y=1 单元线）');
  ok(P.bands(1).map((b) => b.y).join(',') === '-1,-2,-3',
    '画布分界线取 −unit / −2unit / −3unit');

  /* 秘密性读横轴 */
  ok(at(0, 3).s.side === 'program' && at(0, -3).s.side === 'custom',
    'x > 0 纲领侧 → 制度与档案；x < 0 习俗侧 → 默契与丑闻');
  ok(at(0, 0).s.side === 'zero', '靠近零纲领零行动的点 → 尚未分形');
  ok(at(0, null).s.side === 'none', '横坐标缺失 → 秘密性无从附着');
  ok(at(null).q.key === 'none', '纵坐标缺失（该处无定义）→ 按无质处理，不抛错');

  /* 埋点：缺量时不得抛异常 */
  let threw = false;
  try { at(undefined, undefined); at(NaN, NaN); } catch (e) { threw = true; }
  ok(!threw, '坐标缺失 / NaN 不抛异常');
}

process.exit(bad.length + engineBad ? 1 : 0);
