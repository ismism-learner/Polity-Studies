/* 语气助词清理（口径 B 要求一律删除）+ 粘连标点修复。
   保守规则：只删语气助词，不做任何改写；专名/固定词白名单保护。
   默认 dry-run 只出报告；--write 才落盘。
   用法：node tools/polish-particles.mjs [--write] [--only E02,E13] [--show 12] */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DIR = path.join(ROOT, '文稿');
const WRITE = process.argv.includes('--write');
const iOnly = process.argv.indexOf('--only');
const ONLY = iOnly > 0 ? process.argv[iOnly + 1].split(',').map((s) => s.trim()) : null;
const iShow = process.argv.indexOf('--show');
const SHOW = iShow > 0 ? Number(process.argv[iShow + 1]) : 8;

const PARTICLES = '啊呀嗯呃哦噢嘛吧呢哈嘿唉啧';
/* 这些词里的字不能动 */
const KEEP = [
  '酒吧', '网吧', '贴吧', '水吧', '氧吧', '茶吧', '吧台', '吧主',
  '哈马斯', '哈佛', '哈萨克', '哈耶克', '哈尔滨', '哈贝马斯', '哈密', '哈瓦那',
  '干嘛', '吗啡', '呢绒', '呢子', '呢喃',
];

function protect(s) {
  const saved = [];
  for (const w of KEEP) {
    if (s.indexOf(w) < 0) continue;
    const idx = saved.push(w) - 1;
    s = s.split(w).join('\u0000' + idx + '\u0000');
  }
  return { s, saved };
}
function restore(s, saved) {
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => saved[Number(i)]);
}
function repairPunct(s) {
  return s
    .replace(/，{2,}/g, '，')
    .replace(/，([。！？；：、）])/g, '$1')
    .replace(/([。！？；：、（])，/g, '$1')
    .replace(/^[，、]+/gm, '')
    .replace(/：，/g, '：')
    .replace(/，，+/g, '，')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/，\s*$/gm, '');
}

/* 特殊整词改写（删字后会别扭的） */
const RECAST = [
  [/是啊/g, '是的'],
  [/对啊/g, '对'],
  [/好吧/g, '好'],
];

const files = fs.readdirSync(DIR).filter((f) => /^E\d\d-.*\.md$/.test(f) && (!ONLY || ONLY.includes(f.slice(0, 3)))).sort();
let totalBefore = 0, totalAfter = 0, totalChangedLines = 0;
const samples = [];

for (const f of files) {
  const ep = f.slice(0, 3);
  const src = fs.readFileSync(path.join(DIR, f), 'utf8');
  const lines = src.split('\n');
  let before = 0, after = 0, changedLines = 0;
  const out = lines.map((line) => {
    const b = (line.match(new RegExp('[' + PARTICLES + ']', 'g')) || []).length;
    before += b;
    if (!b) return line;
    const { s, saved } = protect(line);
    let t = s;
    for (const [re, to] of RECAST) t = t.replace(re, to);
    t = t.replace(new RegExp('[' + PARTICLES + ']', 'g'), '');
    t = repairPunct(t);
    t = restore(t, saved);
    const a = (t.match(new RegExp('[' + PARTICLES + ']', 'g')) || []).length;
    after += a;
    if (t !== line) {
      changedLines++;
      if (samples.length < SHOW) samples.push({ ep, from: line.trim().slice(0, 90), to: t.trim().slice(0, 90) });
    }
    return t;
  });
  const changed = before - after;
  totalBefore += before; totalAfter += after; totalChangedLines += changedLines;
  console.log(`  ${ep}  语气助词 ${String(before).padStart(3)} → ${String(after).padStart(3)}（清理 ${String(changed).padStart(3)}）  改动行 ${changedLines}`);
  if (WRITE && changed) fs.writeFileSync(path.join(DIR, f), out.join('\n'), 'utf8');
}

console.log(`\n合计：${totalBefore} → ${totalAfter}（清理 ${totalBefore - totalAfter} 处），改动 ${totalChangedLines} 行　${WRITE ? '已落盘' : '（dry-run，未落盘；加 --write 才写入）'}`);
if (samples.length) {
  console.log('\n样例对照：');
  for (const s of samples) {
    console.log(`  [${s.ep}] 前：${s.from}`);
    console.log(`        后：${s.to}`);
  }
}
