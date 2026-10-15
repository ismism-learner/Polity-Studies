/* 把 文稿/*.md 编译成网页用的 texts.js。
   - 解析 front matter（ep/title/bv/series/order/duration/tags/summary）
   - 极简 Markdown → HTML（标题、段落、列表、表格、引用、粗体、行内代码、行内 LaTeX）
   - [[mm:ss]] → 时间片（点击可跳 B 站对应时刻）
   - E## 交叉引用 → 可点击切换讲次
   - 〔补〕〔疑〕〔校〕 → 标记标签
   - blocks[] 供网页全文检索与定位
   用法：node tools/build-texts.mjs */
import fs from 'node:fs';
import path from 'node:path';

const MD_DIR = path.join(process.cwd(), '文稿');
const OUT = path.join(process.cwd(), 'texts.js');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ---------- 行内 LaTeX（只覆盖文稿里实际出现的记号） ---------- */
const SYM = {
  '\\pi': 'π', '\\ln': 'ln', '\\log': 'log', '\\sin': 'sin', '\\cos': 'cos', '\\tan': 'tan',
  '\\to': '→', '\\Rightarrow': '⇒', '\\le': '≤', '\\leq': '≤', '\\ge': '≥', '\\geq': '≥',
  '\\ne': '≠', '\\approx': '≈', '\\infty': '∞', '\\times': '×', '\\cdot': '·', '\\pm': '±',
  '\\mathbb{R}': 'ℝ', '\\in': '∈', '\\forall': '∀', '\\exists': '∃', '\\partial': '∂',
  '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\Delta': 'Δ', '\\Sigma': 'Σ', '\\varepsilon': 'ε'
};

function tex(src) {
  let s = esc(src);
  s = s.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '<span class="frac"><span>$1</span><span>$2</span></span>');
  s = s.replace(/\\sqrt\{([^{}]*)\}/g, '√<span class="rad">$1</span>');
  s = s.replace(/\\text\{([^{}]*)\}/g, '$1');
  for (const [k, v] of Object.entries(SYM)) s = s.split(esc(k)).join(v);
  s = s.replace(/\^\{([^{}]*)\}/g, '<sup>$1</sup>').replace(/\^(\w)/g, '<sup>$1</sup>');
  s = s.replace(/_\{([^{}]*)\}/g, '<sub>$1</sub>').replace(/_(\w)/g, '<sub>$1</sub>');
  s = s.replace(/\\[a-zA-Z]+/g, '');
  return '<span class="math">' + s + '</span>';
}

function inline(src) {
  let s = esc(src);
  // 行内公式先抽出，避免后续规则破坏
  const maths = [];
  s = s.replace(/\$([^$]+)\$/g, (_, m) => { maths.push(m); return '\u0000M' + (maths.length - 1) + '\u0000'; });
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\[\[(\d{1,2}:\d{2}(?::\d{2})?)\]\]/g, (_, t) => `<button type="button" class="ts" data-t="${t}">${t}</button>`);
  s = s.replace(/(^|[^A-Za-z0-9])(E\d{2})(?![0-9])/g, (_, pre, ep) => `${pre}<a href="#" class="xref" data-ep="${ep}">${ep}</a>`);
  s = s.replace(/〔补〕/g, '<span class="mark mark-bu">补</span>');
  s = s.replace(/〔疑[：:]?([^〕]*)〕/g, (_, r) => `<span class="mark mark-yi" title="${r.replace(/"/g, '')}">疑</span>`);
  s = s.replace(/〔校[：:]?([^〕]*)〕/g, (_, r) => `<span class="mark mark-jiao" title="${r.replace(/"/g, '')}">校</span>`);
  s = s.replace(/\u0000M(\d+)\u0000/g, (_, i) => tex(maths[+i]));
  return s;
}

/* ---------- 块级 ---------- */
function blocksOf(md, ep) {
  const lines = md.split('\n');
  const blocks = [];
  let i = 0, sec = 0, sub = 0;
  const push = (tag, html, text, htmlText) => blocks.push({ id: `${ep}-b${blocks.length}`, tag, html, text, htmlText: htmlText || null });
  const para = [];

  const flushPara = () => {
    if (!para.length) return;
    const raw = para.join(' ');
    push('p', '<p>' + inline(raw) + '</p>', raw.replace(/\[\[|\]\]/g, ''));
    para.length = 0;
  };

  while (i < lines.length) {
    const line = lines[i];
    if (/^\s*$/.test(line)) { flushPara(); i++; continue; }
    if (/^---+$/.test(line)) { flushPara(); i++; continue; }

    // 表格
    if (/^\|/.test(line) && i + 1 < lines.length && /^\|[\s:|-]+\|$/.test(lines[i + 1])) {
      flushPara();
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) { rows.push(lines[i]); i++; }
      const cells = (r) => r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const head = cells(rows[0]);
      const body = rows.slice(2).map(cells);
      let h = '<div class="tb"><table><thead><tr>' + head.map((c) => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>';
      for (const r of body) h += '<tr>' + r.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>';
      h += '</tbody></table></div>';
      push('table', h, rows.join(' ').replace(/\|/g, ' '));
      continue;
    }

    // 标题
    let m = line.match(/^(#{1,4})\s+(.*)$/);
    if (m) {
      flushPara();
      const lv = m[1].length, t = m[2].trim();
      if (lv <= 2) {
        sec++; sub = 0;
        push('h2', `<h2 id="${ep}-s${sec}">${inline(t)}</h2>`, t, inline(t));
      } else if (lv === 3) {
        sub++;
        push('h3', `<h3 id="${ep}-s${sec}-${sub}">${inline(t)}</h3>`, t, inline(t));
      } else {
        push('h4', `<h4>${inline(t)}</h4>`, t, inline(t));
      }
      i++; continue;
    }

    // 引用
    if (/^>\s?/.test(line)) {
      flushPara();
      const q = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { q.push(lines[i].replace(/^>\s?/, '')); i++; }
      push('quote', '<blockquote>' + inline(q.join(' ')) + '</blockquote>', q.join(' '));
      continue;
    }

    // 列表
    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      flushPara();
      const items = [];
      while (i < lines.length && (/^\s*([-*]|\d+\.)\s+/.test(lines[i]) || /^\s{2,}\S/.test(lines[i]) && items.length)) {
        if (/^\s*([-*]|\d+\.)\s+/.test(lines[i])) items.push(lines[i].replace(/^\s*([-*]|\d+\.)\s+/, ''));
        else items[items.length - 1] += ' ' + lines[i].trim();
        i++;
      }
      const ordered = /^\s*\d+\./.test(line);
      const tag = ordered ? 'ol' : 'ul';
      push(tag, `<${tag}>` + items.map((it) => `<li>${inline(it)}</li>`).join('') + `</${tag}>`, items.join(' '));
      continue;
    }

    para.push(line.trim());
    i++;
  }
  flushPara();
  return blocks;
}

/* ---------- front matter ---------- */
function parseFront(md) {
  const clean = md.replace(/^\uFEFF/, '');
  const m = clean.match(/^\s*---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { meta: {}, body: clean };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_]+)\s*:\s*(.*)$/);
    if (!kv) continue;
    meta[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, '');
  }
  return { meta, body: md.slice(m[0].length) };
}

/* ---------- 主流程 ---------- */
if (!fs.existsSync(MD_DIR)) { console.error('缺少 文稿/ 目录'); process.exit(1); }
const files = fs.readdirSync(MD_DIR).filter((f) => f.endsWith('.md')).sort();
const eps = [];
for (const f of files) {
  const md = fs.readFileSync(path.join(MD_DIR, f), 'utf8');
  const { meta, body } = parseFront(md);
  const ep = (meta.ep || f.slice(0, 3)).trim();
  const cleanBody = body.replace(/^#\s+.*$/m, ''); // 正文里的 h1 由 front matter 提供
  if (!meta.title) console.warn('  ! ' + f + ' 的 front matter 无法解析 title，已回退到文件名');
  const blocks = blocksOf(cleanBody, ep);
  const toc = blocks.filter((b) => b.tag === 'h2' || b.tag === 'h3')
    .map((b) => ({ id: b.id, level: b.tag === 'h2' ? 2 : 3, text: b.text, html: b.htmlText || b.text }));
  eps.push({
    ep,
    file: f,
    title: meta.title || f,
    short: f.replace(/^E\d+-/, '').replace(/\.md$/, ''),
    bv: meta.bv || '',
    series: meta.series || '其它',
    order: Number(meta.order || 99),
    duration: meta.duration || '',
    tags: (meta.tags || '').split(/[,，]/).map((s) => s.trim()).filter(Boolean),
    summary: meta.summary || '',
    toc,
    blocks,
    chars: blocks.reduce((n, b) => n + b.text.length, 0)
  });
}

eps.sort((a, b) => a.ep.localeCompare(b.ep));
const seriesOrder = { 预备工作: 0, 核心论题: 1, 标准模型: 2, 其它: 9 };
eps.sort((a, b) => (seriesOrder[a.series] ?? 9) - (seriesOrder[b.series] ?? 9) || a.order - b.order);

// 概念索引：标签 → 讲次
const concept = {};
for (const e of eps) for (const t of e.tags) (concept[t] = concept[t] || []).push(e.ep);

const payload = { generated: new Date().toISOString().slice(0, 19).replace('T', ' '), episodes: eps, concept };
fs.writeFileSync(OUT, '/* 由 tools/build-texts.mjs 从 文稿/*.md 生成，请勿手改 */\nwindow.SHUZHENG_TEXTS = ' + JSON.stringify(payload) + ';\n', 'utf8');

console.log(`编译 ${eps.length} 讲 → texts.js（${Math.round(fs.statSync(OUT).size / 1024)} KB）`);
for (const e of eps) console.log(`  ${e.ep}  ${e.series.padEnd(5)} #${String(e.order).padStart(2)}  ${String(e.chars).padStart(6)}字  ${e.blocks.length}块  ${e.title.slice(0, 30)}`);
console.log('概念 ' + Object.keys(concept).length + ' 个');
