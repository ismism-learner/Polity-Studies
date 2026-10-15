/* 把 B 站 AI 字幕（.srt）转成便于整理的段落稿。
   输出：原文/E##-slug.txt，段落合并 + 每约一分钟一个时间锚点 [[mm:ss]]，
   便于整理时引用（例如“见 E02 00:12:30”）。
   用法：node tools/srt2txt.mjs */
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'C:\\Users\\haokun\\Downloads\\bilibili_庶政学_AI字幕';
const OUT = path.join(process.cwd(), '原文');
fs.mkdirSync(OUT, { recursive: true });

function parseSrt(raw) {
  const blocks = raw.replace(/\r/g, '').split('\n\n');
  const cues = [];
  for (const b of blocks) {
    const lines = b.split('\n').filter(Boolean);
    if (lines.length < 2) continue;
    const t = lines.find((l) => l.includes('-->'));
    if (!t) continue;
    const m = t.match(/(\d+):(\d+):(\d+)[,.](\d+)\s*-->\s*(\d+):(\d+):(\d+)[,.](\d+)/);
    if (!m) continue;
    const start = (+m[1]) * 3600 + (+m[2]) * 60 + (+m[3]) + (+m[4]) / 1000;
    const end = (+m[5]) * 3600 + (+m[6]) * 60 + (+m[7]) + (+m[8]) / 1000;
    const text = lines.filter((l) => !l.includes('-->') && !/^\d+$/.test(l)).join(' ').trim();
    if (text) cues.push({ start, end, text });
  }
  return cues;
}

const stamp = (s) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60);
  return (h ? String(h).padStart(2, '0') + ':' : '') + String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
};

/* 合并成段落：句间停顿 > 1.4s，或段落超过 ~420 字，或距上一个时间锚点超过 75 秒 */
function toParagraphs(cues) {
  const out = [];
  let para = [], lastAnchor = -999, lastEnd = 0, len = 0;
  const flush = () => { if (para.length) { out.push(para.join('')); para = []; len = 0; } };
  for (const c of cues) {
    if (c.start - lastAnchor > 75) { flush(); out.push(`[[${stamp(c.start)}]]`); lastAnchor = c.start; }
    if (len > 420 && c.start - lastEnd > 0.8) flush();
    if (para.length && c.start - lastEnd > 1.4 && len > 110) flush();
    para.push(c.text);
    len += c.text.length;
    lastEnd = c.end;
  }
  flush();
  return out;
}

const files = fs.readdirSync(SRC).filter((f) => f.toLowerCase().endsWith('.srt'));
const index = [];
for (const f of files.sort()) {
  const m = f.match(/^(\d+)_(BV[0-9A-Za-z]+)_(.+)\.srt$/);
  if (!m) { console.log('skip (未匹配命名): ' + f); continue; }
  const [, num, bv, title] = m;
  const raw = fs.readFileSync(path.join(SRC, f), 'utf8');
  const cues = parseSrt(raw);
  const paras = toParagraphs(cues);
  const chars = cues.reduce((n, c) => n + c.text.length, 0);
  const dur = cues.length ? cues[cues.length - 1].end : 0;
  const slug = `${num}-${title.replace(/[\\/:*?"<>|【】]/g, '').slice(0, 26)}`;
  const head = [
    `# E${num}　${title}`,
    ``,
    `- 视频：${bv}　时长：${stamp(dur)}　字幕条数：${cues.length}　正文字数：约 ${chars}`,
    `- 本文件由 .srt 机械预处理而来（合并成段、每约一分钟一个 [[mm:ss]] 锚点），尚未整理。`,
    ``, `---`, ``
  ].join('\n');
  fs.writeFileSync(path.join(OUT, `E${num}-${slug.slice(slug.indexOf('-') + 1)}.txt`), head + paras.join('\n\n') + '\n', 'utf8');
  index.push({ num, bv, title, slug, dur: stamp(dur), cues: cues.length, chars, paras: paras.filter((p) => !p.startsWith('[[ massive')).length });
  console.log(`E${num}  ${stamp(dur).padStart(8)}  ${String(chars).padStart(6)}字  ${String(cues.length).padStart(5)}条  ${title}`);
}
fs.writeFileSync(path.join(OUT, '_index.json'), JSON.stringify(index, null, 2), 'utf8');
console.log('\n共 ' + index.length + ' 集，合计约 ' + index.reduce((n, i) => n + i.chars, 0) + ' 字');
