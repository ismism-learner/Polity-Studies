/* 庶政学 · 阅读网页
   左侧：讲次树 + 全文检索 + 概念索引；右侧：整理后的讲义正文（可跳视频时刻、可交叉跳讲）。
   与应用外壳共用地址栏状态：模型视图写 v=model&…，阅读视图写 v=read&ep=E12。 */
(function (global) {
  'use strict';

  var DATA = global.SHUZHENG_TEXTS || { episodes: [], concept: {} };
  var LAW = {
    seriesOrder: { 预备工作: 0, 核心论题: 1, 标准模型: 2, 专题: 3, 其它: 9 },
    seriesNote: {
      预备工作: '七讲基本建设：空间、复合要素、特殊要素、九连环、制度、行为',
      核心论题: '四讲专题：权力的三个性质、籍、反抗运动、X=1',
      标准模型: '数理政治哲学的标准模型：把政治立场写成基本初等函数',
      专题: '把权力理论落到现代政治的现实案例上'
    }
  };
  var state = { view: 'model', ep: null, block: null, results: null, query: '', axBlock: null };
  var INITIAL = (global.location && global.location.hash) || '';
  var els = {};
  var booting = true;   // 启动期间不要改写地址栏：model.js 还要读它

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function findEp(ep) { return DATA.episodes.filter(function (e) { return e.ep === ep; })[0] || null; }
  function plainBlockText(b) { return b.text || ''; }

  /* 名称：E12 → 基本要素 */
  function shortOf(ep) { var e = findEp(ep); return e ? e.short.replace(/^(庶政学|我的新体系)/, '') : ep; }
  function titleOf(ep) { var e = findEp(ep); return e ? e.title : ep; }

  var VOID = [];

  /* ---------------- 视图切换 ---------------- */
  function show(view, opts) {
    state.view = view;
    els.viewModel.hidden = view !== 'model';
    els.viewRead.hidden = view !== 'read';
    els.tabs.forEach(function (t) { t.setAttribute('aria-pressed', t.dataset.view === view ? 'true' : 'false'); });
    if (view === 'read') {
      if (!state.ep) open((opts && opts.ep) || (DATA.episodes[0] && DATA.episodes[0].ep), opts && opts.block);
      else if (opts && opts.ep && opts.ep !== state.ep) open(opts.ep, opts.block);
      else if (opts && opts.block) scrollToBlock(opts.block);
    }
    sync();
    if (view === 'read' && global.SHUZHENG_AXIS) global.SHUZHENG_AXIS.refresh();
    if (view === 'read' && opts && opts.focusSearch && els.q) els.q.focus();
  }

  function sync() {
    if (booting) return;
    var h;
    if (state.view === 'read') {
      h = 'v=read&ep=' + (state.ep || '') + (state.block ? '&b=' + state.block : '');
    } else {
      var ms = (global.ShuzhengModel && global.ShuzhengModel.stateHash) ? global.ShuzhengModel.stateHash() : '';
      h = 'v=model' + (ms ? '&' + ms : '');
    }
    try { global.history.replaceState(null, '', '#' + h); } catch (e) { }
  }

  /* ---------------- 侧栏 ---------------- */
  function renderList() {
    var groups = {};
    DATA.episodes.forEach(function (e) { (groups[e.series] = groups[e.series] || []).push(e); });
    var html = '<button type="button" class="ep-item ep-overview" data-ep="__overview" aria-pressed="false">'
      + '<span class="ep-no">总览</span><span class="ep-title">全部讲次与概念索引</span></button>';
    Object.keys(groups).sort(function (a, b) { return (LAW.seriesOrder[a] ?? 9) - (LAW.seriesOrder[b] ?? 9); }).forEach(function (s) {
      html += '<div class="ep-group"><p class="ep-group-title">' + esc(s) + '<span class="ep-group-note">' + esc(LAW.seriesNote[s] || '') + '</span></p>';
      groups[s].sort(function (a, b) { return a.order - b.order; }).forEach(function (e) {
        html += '<button type="button" class="ep-item" data-ep="' + e.ep + '" aria-pressed="false">'
          + '<span class="ep-no">' + e.order + '</span>'
          + '<span class="ep-title">' + esc(e.title.replace(/^预备工作（\d+）[：:]?/, '').replace(/^学了这一讲，/, '')) + '</span>'
          + '<span class="ep-meta">' + esc(e.ep) + ' · ' + e.duration + '</span></button>';
      });
      html += '</div>';
    });
    els.epList.innerHTML = html;
  }

  function markActive() {
    els.epList.querySelectorAll('.ep-item').forEach(function (b) {
      b.setAttribute('aria-pressed', b.dataset.ep === (state.ep || '__overview') ? 'true' : 'false');
    });
  }

  function renderConcepts() {
    var keys = Object.keys(DATA.concept).sort(function (a, b) { return DATA.concept[b].length - DATA.concept[a].length || a.localeCompare(b); });
    els.conceptBox.innerHTML = '<p class="ep-group-title">概念索引<span class="ep-group-note">点击检索该概念</span></p>'
      + '<div class="chips">' + keys.map(function (k) {
        return '<button type="button" class="chip chip-concept" data-q="' + esc(k) + '">' + esc(k) + '<i>' + DATA.concept[k].length + '</i></button>';
      }).join('') + '</div>';
  }

  /* ---------------- 正文 ---------------- */
  function openOverview() {
    state.ep = null; state.block = null;
    els.epHead.innerHTML = '<p class="ro-family">庶政学 · 文献</p><h1 class="ep-h1">全部讲次与概念索引</h1>'
      + '<p class="ep-summary">共 ' + DATA.episodes.length + ' 讲，整理自 B 站 AI 字幕；每讲可按时间锚点跳回视频，讲次之间可交叉跳转。数据编译时间：' + esc(DATA.generated || '—') + '。</p>';
    els.epToc.innerHTML = '';
    var rows = DATA.episodes.map(function (e) {
      return '<tr><td class="mono nowrap">' + e.ep + '</td><td class="nowrap">' + esc(e.series) + ' #' + e.order + '</td>'
        + '<td><a href="#" class="xref" data-ep="' + e.ep + '">' + esc(e.title) + '</a></td>'
        + '<td class="mono nowrap">' + e.duration + '</td><td class="nowrap">' + e.chars + ' 字</td><td>' + esc(e.summary) + '</td></tr>';
    }).join('');
    var keys = Object.keys(DATA.concept).sort();
    var idx = keys.map(function (k) {
      return '<li><strong>' + esc(k) + '</strong>：' + DATA.concept[k].map(function (ep) {
        return '<a href="#" class="xref" data-ep="' + ep + '" data-term="' + esc(k) + '">' + ep + '</a>';
      }).join('、') + '</li>';
    }).join('');
    els.epBody.innerHTML = '<div class="tb"><table><thead><tr><th>讲</th><th>系列</th><th>标题</th><th>时长</th><th>整理后</th><th>一句话</th></tr></thead><tbody>'
      + rows + '</tbody></table></div>'
      + '<h2>概念索引</h2><ul class="concept-list">' + idx + '</ul>';
    if (global.SHUZHENG_AXIS) global.SHUZHENG_AXIS.clear();
    markActive(); sync();
  }

  function open(ep, blockId) {
    if (ep === '__overview' || !findEp(ep)) return openOverview();
    var e = findEp(ep);
    state.ep = ep; state.block = blockId || null;
    els.epHead.innerHTML =
      '<p class="ro-family">' + esc(e.series) + ' #' + e.order + ' · ' + e.ep + ' · ' + esc(e.duration) + '</p>'
      + '<h1 class="ep-h1">' + esc(e.title) + '</h1>'
      + '<p class="ep-summary">' + esc(e.summary) + '</p>'
      + '<p class="ep-tags">' + e.tags.map(function (t) { return '<button type="button" class="chip chip-concept" data-q="' + esc(t) + '">' + esc(t) + '</button>'; }).join('')
      + (e.bv ? '<a class="ep-video" href="https://www.bilibili.com/video/' + e.bv + '" target="_blank" rel="noopener">在 B 站看原片 ↗</a>' : '')
      + '</p>';
    els.epToc.innerHTML = '<details open><summary>本讲目录</summary><ol>'
      + e.toc.map(function (t) { return '<li class="lvl' + t.level + '"><a href="#" data-block="' + t.id + '">' + (t.html || esc(t.text)) + '</a></li>'; }).join('')
      + '</ol></details>';
    els.epBody.innerHTML = e.blocks.map(function (b) {
      return '<div class="blk" id="' + b.id + '">' + b.html + '</div>';
    }).join('');
    renderRelated(e);
    markActive();
    sync();
    global.scrollTo({ top: 0, behavior: 'auto' });
    if (blockId) scrollToBlock(blockId);
    primeAxis();
  }

  function renderRelated(e) {
    var others = DATA.episodes.filter(function (o) { return o.ep !== e.ep; })
      .map(function (o) { return { ep: o.ep, title: o.title, n: o.tags.filter(function (t) { return e.tags.indexOf(t) >= 0; }).length }; })
      .filter(function (o) { return o.n > 0; })
      .sort(function (a, b) { return b.n - a.n; })
      .slice(0, 5);
    if (!others.length) return;
    var box = document.createElement('div');
    box.className = 'related';
    box.innerHTML = '<p class="ep-group-title">相关讲次<span class="ep-group-note">按共享概念数排序</span></p><div class="chips">'
      + others.map(function (o) {
        return '<button type="button" class="chip chip-related" data-ep="' + o.ep + '">' + o.ep + ' ' + esc(o.title.slice(0, 16)) + '　×' + o.n + '</button>';
      }).join('') + '</div>';
    els.epBody.appendChild(box);
  }

  function scrollToBlock(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ block: 'start', behavior: 'auto' });
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
    state.block = id;
    sync();
  }

  /* ---------------- 实时坐标系（右侧面板） ----------------
     指针在正文的哪一段，右边就滑到那一段在讲的位置。
     映射表在 axis-map.js；只有 E13 与 E02 有映射，其余讲次保持静默。 */
  function axisReady() {
    return !!(global.SHUZHENG_AXIS && global.SHUZHENG_AXIS_MAP
      && (state.ep === 'E13' || state.ep === 'E02'));
  }

  /* 命中的文本 ＝ 最近的上一级小节标题；正文 ＝ 标题 + 本段 */
  function axisTextFor(blkEl) {
    var sec = '', n = blkEl.previousElementSibling;
    while (n) {
      var h = n.querySelector ? n.querySelector('h2,h3') : null;
      if (h) { sec = (h.textContent || '').trim(); break; }
      n = n.previousElementSibling;
    }
    return { title: sec, text: sec + ' ' + (blkEl.textContent || '') };
  }

  function onBlock(blkEl) {
    if (!axisReady()) return;
    var t = axisTextFor(blkEl);
    var rule = global.SHUZHENG_AXIS_MAP.ruleFor(state.ep, t.title, t.text);
    if (!rule) { global.SHUZHENG_AXIS.miss(); return; }
    if (state.axBlock && state.axBlock !== blkEl) state.axBlock.classList.remove('ax-on');
    state.axBlock = blkEl;
    blkEl.classList.add('ax-on');
    global.SHUZHENG_AXIS.show(rule);
  }

  /* 打开一讲时，先按第一段有映射的正文把画面摆好 */
  function primeAxis() {
    if (state.axBlock) { state.axBlock.classList.remove('ax-on'); state.axBlock = null; }
    if (!axisReady()) {
      if (global.SHUZHENG_AXIS) global.SHUZHENG_AXIS.clear();
      return;
    }
    var blks = els.epBody.querySelectorAll('.blk');
    for (var i = 0; i < blks.length; i++) {
      var t = axisTextFor(blks[i]);
      if (global.SHUZHENG_AXIS_MAP.ruleFor(state.ep, t.title, t.text)) {
        onBlock(blks[i]);
        return;
      }
    }
    global.SHUZHENG_AXIS.clear();
  }

  /* ---------------- 检索 ---------------- */
  function search(q) {
    q = (q || '').trim();
    state.query = q;
    if (!q) { els.results.hidden = true; els.results.innerHTML = ''; els.qStat.textContent = ''; return; }
    var hits = [];
    for (var i = 0; i < DATA.episodes.length; i++) {
      var e = DATA.episodes[i];
      for (var j = 0; j < e.blocks.length; j++) {
        var b = e.blocks[j];
        var t = plainBlockText(b);
        var k = t.indexOf(q);
        if (k < 0 && b.tag !== 'table') continue;
        if (k < 0) continue;
        var from = Math.max(0, k - 30), to = Math.min(t.length, k + q.length + 50);
        hits.push({
          ep: e.ep, block: b.id, sec: sectionOf(e, j),
          pre: (from > 0 ? '…' : '') + esc(t.slice(from, k)),
          hit: esc(t.slice(k, k + q.length)),
          post: esc(t.slice(k + q.length, to)) + (to < t.length ? '…' : '')
        });
        if (hits.length > 200) break;
      }
      if (hits.length > 200) break;
    }
    state.results = hits;
    els.qStat.textContent = hits.length ? hits.length + ' 处命中' + (hits.length > 200 ? '（截断）' : '') : '没有命中';
    els.results.hidden = false;
    els.results.innerHTML = hits.slice(0, 80).map(function (h) {
      return '<button type="button" class="hit" data-ep="' + h.ep + '" data-block="' + h.block + '">'
        + '<span class="hit-ep">' + h.ep + '</span><span class="hit-sec">' + esc(h.sec) + '</span>'
        + '<span class="hit-text">' + h.pre + '<mark>' + h.hit + '</mark>' + h.post + '</span></button>';
    }).join('') + (hits.length > 80 ? '<p class="hint">只显示前 80 处</p>' : '');
  }

  function sectionOf(e, index) {
    for (var i = index; i >= 0; i--) {
      if (e.blocks[i].tag === 'h3' || e.blocks[i].tag === 'h2') return e.blocks[i].text;
    }
    return '';
  }

  /* 供策略系统引用：某讲里包含关键词的第一个块 */
  function findByTerm(ep, term) {
    var e = findEp(ep);
    if (!e || !term) return null;
    var t = term.replace(/^《|》$/g, '');
    for (var i = 0; i < e.blocks.length; i++) {
      var b = e.blocks[i];
      if (b.tag === 'h2' || b.tag === 'h3') continue;
      if ((b.text || '').indexOf(t) >= 0) return { block: b.id, sec: sectionOf(e, i), text: b.text.slice(0, 120) };
    }
    for (var j = 0; j < e.blocks.length; j++) {
      if ((e.blocks[j].text || '').indexOf(t) >= 0) return { block: e.blocks[j].id, sec: e.blocks[j].text.slice(0, 40), text: e.blocks[j].text.slice(0, 120) };
    }
    return null;
  }

  function openTerm(ep, term) {
    var f = findByTerm(ep, term);
    show('read', { ep: ep, block: f ? f.block : null });
  }

  /* ---------------- 事件 ---------------- */
  function wire() {
    els.tabs.forEach(function (t) {
      t.addEventListener('click', function () { show(t.dataset.view); });
    });
    els.epBody.addEventListener('mouseover', function (ev) {
      var b = ev.target && ev.target.closest ? ev.target.closest('.blk') : null;
      if (b && b !== state.axBlock) onBlock(b);
    });
    els.epList.addEventListener('click', function (ev) {
      var b = ev.target.closest('.ep-item');
      if (b) show('read', { ep: b.dataset.ep });
    });
    els.conceptBox.addEventListener('click', function (ev) {
      var c = ev.target.closest('.chip-concept');
      if (c) { els.q.value = c.dataset.q; show('read', { ep: state.ep }); search(c.dataset.q); }
    });
    els.q.addEventListener('input', function () { search(els.q.value); });
    els.q.addEventListener('keydown', function (e) { if (e.key === 'Escape') { els.q.value = ''; search(''); } });
    els.results.addEventListener('click', function (ev) {
      var h = ev.target.closest('.hit');
      if (h) show('read', { ep: h.dataset.ep, block: h.dataset.block });
    });
    document.addEventListener('click', function (ev) {
      var x = ev.target.closest('.xref');
      if (x && x.dataset.ep) {
        ev.preventDefault();
        if (x.dataset.term) openTerm(x.dataset.ep, x.dataset.term); else show('read', { ep: x.dataset.ep });
        return;
      }
      var rel = ev.target.closest('.chip-related');
      if (rel) { show('read', { ep: rel.dataset.ep }); return; }
      var ts = ev.target.closest('.ts');
      if (ts) {
        ev.preventDefault();
        var cur = state.ep ? findEp(state.ep) : null;
        if (!cur || !cur.bv) return;
        var p = ts.dataset.t.split(':').map(Number);
        var sec = p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1];
        global.open('https://www.bilibili.com/video/' + cur.bv + '?t=' + sec, '_blank', 'noopener');
        return;
      }
      var bl = ev.target.closest('[data-block]');
      if (bl) { ev.preventDefault(); scrollToBlock(bl.dataset.block); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && els.viewRead && !els.viewRead.hidden && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault(); els.q.focus();
      }
    });
  }

  function init() {
    els = {
      viewModel: document.getElementById('view-model'),
      viewRead: document.getElementById('view-reader'),
      tabs: Array.prototype.slice.call(document.querySelectorAll('.view-tab')),
      epList: document.getElementById('epList'),
      conceptBox: document.getElementById('conceptBox'),
      epHead: document.getElementById('epHead'),
      epToc: document.getElementById('epToc'),
      epBody: document.getElementById('epBody'),
      q: document.getElementById('q'),
      qStat: document.getElementById('qStat'),
      results: document.getElementById('results')
    };
    if (!els.viewRead) return;
    renderList();
    renderConcepts();
    wire();

    // 初始状态
    var q = {};
    INITIAL.replace(/^#/, '').split('&').forEach(function (kv) {
      var i = kv.indexOf('='); if (i > 0) q[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1));
    });
    global.SHUZHENG_VIEW_INIT = q.v === 'read' ? 'read' : 'model';
    if (q.v === 'read') {
      show('read', { ep: q.ep || (DATA.episodes[0] && DATA.episodes[0].ep), block: q.b || null });
    } else {
      show('model');
      if (q.ep) state.ep = q.ep;
    }
    if (!state.ep && DATA.episodes.length) state.ep = DATA.episodes[0].ep;
    booting = false;
  }

  global.SHUZHENG_READER = { show: show, open: open, search: search, findByTerm: findByTerm, state: state };
  global.SHUZHENG_APP = { sync: sync, show: show, state: state };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
