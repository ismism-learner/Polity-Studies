/* 庶政学 · 文献视图右侧的实时坐标系
   ─────────────────────────────────────────────────────────────
   指针在左边文章的哪一段，右边这套坐标就滑到那一段在讲的位置：
   曲线族、参数、探针位置、以及第三轴（权力三性质）那一层的开合。
   函数族与它们的读法都取自 model.js 的 MODELS，这里只负责画与动画。

   没有对应状态的段落（例如「术语校勘」表）不做跳转，只把提示换掉，
   画面留在原处——免得读表格时图一直闪。 */
(function (global) {
  'use strict';

  var canvas, ctx, els = {};
  var cur = null, prev = null, t0 = 0, raf = null;
  var DUR = 460;
  var halfX = 5, W = 0, H = 0, scale = 1, ox = 0, oy = 0, yMax = 3, dpr = 1;
  var lastW = -1, lastH = -1;
  var mounted = false;

  var C = {};
  var PAL = { curve: '#f2e6c8', ideo: '#b98fe0', prog: '#e8b25c', act: '#5fc6b6', vio: '#ea6ba6' };
  var FONT = '"Segoe UI","Microsoft YaHei","PingFang SC",system-ui,sans-serif';
  var MONO = 'ui-monospace,"Cascadia Code",Consolas,monospace';

  function cssVar(name, fb) {
    try {
      var v = global.getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return v || fb;
    } catch (e) { return fb; }
  }
  function readTheme() {
    C.program = cssVar('--program', PAL.prog);
    C.action = cssVar('--action', PAL.act);
    C.ideology = cssVar('--ideology', PAL.ideo);
    C.violence = cssVar('--violence', PAL.vio);
    C.ink = cssVar('--ink', '#f2ece4');
    C.ink2 = cssVar('--ink-2', '#c6bfb6');
    C.ink3 = cssVar('--ink-3', '#9a9188');
    C.line = cssVar('--line', 'rgba(255,255,255,.14)');
    C.lineSoft = cssVar('--line-soft', 'rgba(255,255,255,.08)');
  }

  var num = function (v) { return (typeof v === 'number' && isFinite(v)) ? v : null; };
  var fmt = function (v, d) {
    if (v === null || v === undefined || !isFinite(v)) return '—';
    var s = Number(v).toFixed(d === undefined ? 2 : d);
    return s.replace(/\.?0+$/, '') || '0';
  };
  var esc = function (s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };
  function modelById(id) {
    var M = (global.ShuzhengModel && global.ShuzhengModel.MODELS) || [];
    for (var i = 0; i < M.length; i++) if (M[i].id === id) return M[i];
    return null;
  }
  function paramsOf(m, a) {
    var p = {};
    if (m && m.param) p[m.param.key] = (a === undefined || a === null) ? m.param.value : a;
    return p;
  }

  /* ---------- 把规则解析成可画的状态 ---------- */
  function resolve(rule) {
    if (!rule) return null;
    var m = rule.id ? modelById(rule.id) : null;
    var x = rule.pt ? rule.pt.x : (rule.x !== undefined ? rule.x : (m ? m.probe : 0));
    var y = null, onCurve = false;
    if (rule.pt) y = rule.pt.y;
    else if (m) { y = num(m.f(x, paramsOf(m, rule.a))); onCurve = true; }
    return { rule: rule, m: m, x: x, y: y, onCurve: onCurve, pt: !!rule.pt,
      hasProbe: !!(rule.id || rule.pt) };
  }

  /* ---------- 布局 ---------- */
  function ensureLayout() {
    var rect = canvas.getBoundingClientRect();
    var w = Math.max(240, Math.round(rect.width));
    var h = Math.max(190, Math.round(rect.height));
    if (w === lastW && h === lastH) return;
    lastW = w; lastH = h;
    dpr = Math.min(global.devicePixelRatio || 1, 2);
    W = w; H = h;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    scale = W / (2 * halfX);
    ox = W / 2; oy = H / 2;
    yMax = (H / 2) / scale;
  }

  /* ---------- 画 ---------- */
  function drawGrid() {
    ctx.save();
    ctx.font = '10px ' + MONO;
    ctx.strokeStyle = C.lineSoft;
    ctx.lineWidth = 1;
    var gx, gy;
    for (gx = -halfX; gx <= halfX; gx++) {
      if (!gx) continue;
      ctx.beginPath(); ctx.moveTo(ox + gx * scale, 0); ctx.lineTo(ox + gx * scale, H); ctx.stroke();
    }
    for (gy = Math.ceil(-yMax); gy <= yMax; gy++) {
      if (!gy) continue;
      ctx.beginPath(); ctx.moveTo(0, oy - gy * scale); ctx.lineTo(W, oy - gy * scale); ctx.stroke();
    }
    /* 单元性带 y ∈ [−1, 1] */
    ctx.fillStyle = 'rgba(95,198,182,0.07)';
    ctx.fillRect(0, oy - scale, W, 2 * scale);
    ctx.setLineDash([4, 5]);
    ctx.strokeStyle = 'rgba(95,198,182,0.5)';
    [-1, 1].forEach(function (yy) {
      ctx.beginPath(); ctx.moveTo(0, oy - yy * scale); ctx.lineTo(W, oy - yy * scale); ctx.stroke();
    });
    ctx.setLineDash([]);
    /* 轴 */
    ctx.strokeStyle = C.line;
    ctx.beginPath(); ctx.moveTo(0, oy + 0.5); ctx.lineTo(W, oy + 0.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox + 0.5, 0); ctx.lineTo(ox + 0.5, H); ctx.stroke();
    /* 刻度 */
    ctx.fillStyle = C.ink3;
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    for (gx = -4; gx <= 4; gx += 2) {
      if (!gx) continue;
      ctx.fillText(String(gx), ox + gx * scale, oy + 4);
    }
    ctx.restore();
  }

  function drawQuadrants() {
    ctx.save();
    ctx.font = '10px ' + FONT;
    ctx.fillStyle = C.ink3;
    ctx.globalAlpha = 0.75;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left'; ctx.fillText('圣人 · 不计代价的善', 6, 6);
    ctx.textAlign = 'right'; ctx.fillText('深谋远虑 · 有纲领有行动', W - 6, 6);
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'left'; ctx.fillText('庸俗 · 腐化 · 市侩', 6, H - 6);
    ctx.textAlign = 'right'; ctx.fillText('算计 · 功利主义', W - 6, H - 6);
    ctx.restore();
  }

  function drawViolenceLayer() {
    ctx.save();
    ctx.fillStyle = 'rgba(234,107,166,0.07)';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(234,107,166,0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, W - 1, H - 1);
    var P = global.SHUZHENG_POWER;
    if (P && P.bands) {
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = 'rgba(234,107,166,0.42)';
      var bs = P.bands(1);
      ctx.font = '10px ' + FONT;
      for (var i = 0; i < bs.length; i++) {
        var py = oy + Math.abs(bs[i].y) * scale;   /* bands 的 y 是负数，画在轴下方 */
        if (py < 0 || py > H) continue;
        ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke();
        var mid = oy + (Math.abs(bs[i].y) - 0.5) * scale;
        if (mid < H - 16 && mid > 12) {
          ctx.fillStyle = 'rgba(234,107,166,0.8)';
          ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          ctx.fillText(bs[i].label, 6, mid);
        }
      }
      ctx.setLineDash([]);
    }
    ctx.font = '10px ' + FONT;
    ctx.fillStyle = 'rgba(198,150,232,0.85)';
    ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
    ctx.fillText('默契 · 丑闻', 6, oy - 5);
    ctx.textAlign = 'right';
    ctx.fillText('制度 · 档案', W - 6, oy - 5);
    ctx.restore();
  }

  function curvePath(st, alpha) {
    if (!st || !st.m || alpha <= 0.02) return;
    var p = paramsOf(st.m, st.rule.a);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = C.program;
    ctx.lineWidth = 1.9;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    var started = false, lim = yMax * 4;
    for (var px = 0; px <= W; px++) {
      var x = (px - ox) / scale, y = null;
      try { if (st.m.domain(x, p)) y = num(st.m.f(x, p)); } catch (e) { y = null; }
      if (y === null || Math.abs(y) > lim) { started = false; continue; }
      var py = oy - y * scale;
      if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawProbe(px, py, alpha, label) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = 'rgba(242,236,228,0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(px, oy); ctx.lineTo(px, py); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ox, py); ctx.lineTo(px, py); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = C.ink;
    ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = 1.5; ctx.stroke();
    /* 读数小片 */
    ctx.font = '11px ' + MONO;
    var w = ctx.measureText(label).width + 12;
    var bx = px + 10, by = py - 26;
    if (bx + w > W - 4) bx = px - 10 - w;
    if (bx < 4) bx = 4;
    if (by < 4) by = py + 10;
    if (by + 18 > H - 4) by = py - 26;
    ctx.fillStyle = 'rgba(38,33,32,0.95)';
    ctx.fillRect(bx, by, w, 18);
    ctx.strokeStyle = C.line; ctx.strokeRect(bx + 0.5, by + 0.5, w, 18);
    ctx.fillStyle = C.ink;
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(label, bx + 6, by + 9);
    ctx.restore();
  }

  function easeOut(t) { return 1 - Math.pow(1 - t, 4); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function paint(ts) {
    raf = null;
    ensureLayout();
    var t = 1;
    if (t0) {
      t = Math.min(1, (ts - t0) / DUR);
      if (t >= 1) { t0 = 0; prev = null; }
    }
    var e = easeOut(t);

    ctx.clearRect(0, 0, W, H);
    drawGrid();
    /* 第三轴那一层的淡入淡出 */
    var wanted = cur && cur.rule.vio, had = prev && prev.rule.vio;
    if (wanted || had) {
      var a = 1;
      if (wanted && had && prev !== cur) a = e;
      else if (wanted && !had) a = e;
      else if (!wanted && had) a = 1 - e;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, a));
      drawViolenceLayer();
      ctx.restore();
    }
    drawQuadrants();

    if (prev && prev !== cur) curvePath(prev, 1 - e);
    curvePath(cur, prev && prev !== cur ? e : 1);

    /* 探针：位置在上一状态与当前状态之间滑动 */
    if (cur && cur.hasProbe) {
      var px = cur.x, py = (cur.y === null ? oy : oy - cur.y * scale);
      if (prev && prev !== cur) {
        var qx = prev.x, qy = (prev.y === null ? oy : oy - prev.y * scale);
        px = lerp(qx, px, e);
        py = lerp(qy, py, e);
      }
      var lbl = '(' + fmt(px, 2) + ', ' + fmt((oy - py) / scale, 2) + ')';
      drawProbe(ox + px * scale, py, prev && prev !== cur ? Math.max(e, 0.35) : 1, lbl);
    }

    if (t0) requestFrame();
  }

  function requestFrame() {
    if (raf) return;
    raf = global.requestAnimationFrame(paint);
  }

  /* ---------- 对外 ---------- */

  function describe(st) {
    if (!st) return { title: '坐标平面', sub: '纲领化 × 行动性', note: '' };
    var r = st.rule;
    if (r.pt) {
      var P = global.SHUZHENG_POWER;
      var read = (P && P.read) ? P.read(r.pt.x, r.pt.y, { unit: 1 }) : null;
      return {
        title: read ? ('质：' + read.q.name) : '坐标平面',
        sub: read ? ('落点 ' + read.q.doom + ' · 秘密性：' + read.s.name) : '纲领化 × 行动性',
        note: r.note || ''
      };
    }
    if (!st.m) return { title: '坐标平面', sub: '纲领化 × 行动性', note: r.note || '' };
    var p = paramsOf(st.m, r.a);
    var line = st.m.expr;
    if (st.m.param) line += '　' + st.m.param.key + ' = ' + fmt(p[st.m.param.key], 2);
    return { title: st.m.family, sub: line + '　·　' + st.m.type, note: r.note || '' };
  }

  function render() {
    var d = describe(cur);
    if (els.title) els.title.textContent = d.title;
    if (els.sub) els.sub.textContent = d.sub;
    if (els.note) els.note.textContent = d.note || '这一节在坐标平面上的位置。';
  }

  function show(rule) {
    var next = resolve(rule);
    if (!next) { miss(); return; }
    prev = cur;
    cur = next;
    t0 = global.performance ? global.performance.now() : Date.now();
    if (els.hint) els.hint.textContent = '';
    render();
    if (mounted) requestFrame();
  }

  function miss() {
    if (els.hint) els.hint.textContent = '本段没有对应的坐标状态，画面留在原处。';
  }

  function clear() {
    if (els.hint) els.hint.textContent = '把指针移到左边的段落上。';
  }

  function mount() {
    canvas = document.getElementById('axPlot');
    if (!canvas) return false;
    ctx = canvas.getContext('2d');
    els.title = document.getElementById('axTitle');
    els.sub = document.getElementById('axSub');
    els.note = document.getElementById('axNote');
    els.hint = document.getElementById('axHint');
    readTheme();
    ensureLayout();
    ctx.clearRect(0, 0, W, H);
    drawGrid();
    drawQuadrants();
    render();
    clear();
    mounted = true;
    global.addEventListener('resize', function () { lastW = -1; requestFrame(); });
    if (cur) { prev = null; t0 = 0; requestFrame(); }
    return true;
  }

  var API = {
    mount: mount,
    show: show,
    miss: miss,
    clear: clear,
    refresh: function () { lastW = -1; readTheme(); requestFrame(); },
    isMounted: function () { return mounted; },
    describe: describe
  };
  global.SHUZHENG_AXIS = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
    else mount();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
