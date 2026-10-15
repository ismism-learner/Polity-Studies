/* 庶政学 · 权力三性质（E02《权力的三个基本性质》）
   ─────────────────────────────────────────────────────────────
   这不是另一台仪器，是模型视图「虚数轴」那一层的展开。

   E13 的说法：二维体系是「经典体系」，加入第三轴（虚数轴＝暴力）之后「它就是权力的模型」，
   「他就不是个政治哲学了」「他就是权力学」——但作者自陈这一层本讲没做，是前向预告。
   E02 就是那一层：它给出权力的三条基本性质——质、概率性、秘密性。

   接法的边界（务必看清）：我核过 E02 的原始转写稿，除了标题，正文里
   「纲领／习俗／对价／坐标／函数」一条都没有——这一讲通篇不用坐标语言。
   所以下面把三条性质挂到三条轴上，全部是整理者的〔补〕，页面里逐条标出；
   作者的原话一律用「」，并挂 E02 的出处，点按可跳到文献视图对应段落。

     质      ← 纵轴·对价侧   线上面只有第一人称报告＝无质；线下才有可质押的物，越深越重
     秘密性  ← 横轴·纲领↔习俗  纲领侧秘密以制度与档案存在；习俗侧以默契与丑闻存在
     概率性  ← 第三轴本身      这一条不落在平面上任何一点，它是对整个平面的限定
*/
(function (global) {
  'use strict';

  /* ---------- 正文里的枚举，照 E02 ---------- */

  /* 质的阶梯：由重到轻。落点与曝光后的变形同出 E02 论「质的三级阶梯」一段。 */
  var NONE = {
    key: 'none', name: '无质', sub: '只有名义', doom: '—', shift: '话无人信',
    quote: '权必有质。无质的权就是纯粹虚的。', term: '无质的权就是纯粹虚的'
  };

  var LADDER = [
    {
      key: 'violation', name: '一般的违禁', sub: '无端之罪', doom: '法度', shift: '指证 · 疯话',
      quote: '一般的违禁（无端之罪）', term: '一般的违禁',
      note: '曝光后他的话变成指证，乃至疯话——一旦被断为精神失常，其话天然不可信，其人按死罪直接处置。'
    },
    {
      key: 'carnal', name: '苟合', sub: '无端之乐', doom: '伦理', shift: '怨恨 · 化政治的为道德的',
      quote: '苟合即违禁性关系（无端之乐）', term: '苟合',
      note: '性丑闻是最泛滥的一种质，因为所有的性关系都是权力交易。曝光后他的话变成怨恨。'
    },
    {
      key: 'life', name: '人命', sub: '无端之恶', doom: '生死', shift: '攀咬',
      quote: '最直接就是人命了……无端之恶', term: '无端之恶',
      note: '曝光后他的话变成攀咬：把另一个无端之罪投射到他身上。必须有「无端」，正因它与事无关，才能把实际的罪责荡开。'
    }
  ];

  var PAWN_HOLDERS = [
    { name: '帝王', pawn: '一姓一世的生灭', term: '一姓一世的生灭',
      cost: '代价是人伦被全部质掉：性关系纯粹政治化，父子亲情无处安放。' },
    { name: '中层士林', pawn: '同窗 · 师门 · 履历', term: '同窗',
      cost: '同窗、士林关系是代价极低的例外；今天转为职场评价与履历，连着考公考编。' },
    { name: '平民', pawn: '性支配 · 共小罪', term: '性支配',
      cost: '最常见的权力关系发生在性支配当中，其次是共小罪；明代底层靠供小罪结成团伙。' }
  ];

  var pct = function (v) { return Math.round(v * 100) + '%'; };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var esc = function (s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };
  function cite(term, label) {
    return '<a href="#" class="xref cite-link" data-ep="E02" data-term="' + esc(term) + '">E02 · '
      + esc(label || term) + '</a>';
  }

  /* ---------- 三条性质在平面上的读法〔补〕 ---------- */

  /* unit ＝ 模型视图现有的「单元阈值」；三档正好用现有的单元线来切，不另立刻度。 */
  function read(x, y, o) {
    o = o || {};
    var unit = o.unit || 1;
    var depth = (y === null || y === undefined || !isFinite(y)) ? null : -y;

    /* 质：纵轴的对价侧 */
    var q, band = null;
    if (depth === null || depth <= 0) {
      q = { key: 'none', name: NONE.name, sub: NONE.sub, doom: NONE.doom, shift: NONE.shift,
        quote: NONE.quote, term: NONE.term, weight: 0, note: '' };
    } else {
      var step = depth <= unit ? LADDER[0] : (depth <= 2 * unit ? LADDER[1] : LADDER[2]);
      band = depth <= unit ? 1 : (depth <= 2 * unit ? 2 : 3);
      q = { key: step.key, name: step.name, sub: step.sub, doom: step.doom, shift: step.shift,
        quote: step.quote, term: step.term, note: step.note,
        weight: clamp(depth / (2 * unit), 0, 1) };
    }

    /* 秘密性：横轴的纲领↔习俗 */
    var sx = (x === null || x === undefined || !isFinite(x)) ? null : x;
    var s;
    if (sx === null) {
      s = { side: 'none', name: '无从附着', term: '秘密性一定要保证' };
    } else if (sx > 0.2) {
      s = { side: 'program', name: '制度与档案', term: '权力在先，制度在后' };
    } else if (sx < -0.2) {
      s = { side: 'custom', name: '默契与丑闻', term: '公开的秘密' };
    } else {
      s = { side: 'zero', name: '尚未分形', term: '秘密性一定要保证' };
    }

    return { q: q, s: s, unit: unit, depth: depth, band: band, x: sx, y: y };
  }

  /* 画布上的分界（供 model.js 的 drawViolence 调用）：两条单元线，切成三档 */
  function bands(unit) {
    return [
      { y: -unit, label: '一般的违禁 · 法度', term: '一般的违禁' },
      { y: -2 * unit, label: '苟合 · 伦理', term: '苟合' },
      { y: -3 * unit, label: '人命 · 生死', term: '无端之恶' }
    ];
  }

  /* ---------- 画布标注：这一层画什么 ---------- */
  function paint(ctx, geom, unit) {
    var X = geom.X, Y = geom.Y, W = geom.W, H = geom.H, oy = geom.oy, yMax = geom.yMax;
    var PAL = geom.PAL, FONT = geom.FONT, chip = geom.labelChip;
    var f11 = '11px ' + FONT, f12 = '12px ' + FONT;

    ctx.save();

    /* 原有的一层：虚数轴的底与框 */
    var grd = ctx.createRadialGradient(geom.ox, oy, 10, geom.ox, oy, Math.max(W, H) * 0.7);
    grd.addColorStop(0, 'rgba(234,107,166,0.10)');
    grd.addColorStop(1, 'rgba(234,107,166,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(234,107,166,0.55)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, W - 1, H - 1);
    ctx.font = f12;
    ctx.fillStyle = PAL.violence;
    ctx.textAlign = 'right'; ctx.textBaseline = 'top';
    ctx.fillText('第三轴：i\u00b2 = \u22121，一切行动都有反作用的代价', W - 12, 12);
    ctx.font = f11;
    ctx.fillText('此层起脱离庶政学，进入权力学（E02 的三条性质）', W - 12, 32);

    /* 质：纵轴对价侧的三档。横轴本身就是对价线 y = 0，不再另画。 */
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1;
    bands(unit).forEach(function (b, i) {
      var py = Y(b.y);
      if (py < 0 || py > H) return;
      ctx.strokeStyle = 'rgba(234,107,166,0.45)';
      ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke();
      /* 档名放在左侧，且避开底部的既有说明 */
      ctx.font = f11;
      var ty = (py + Y(i === 0 ? 0 : bands(unit)[i - 1].y)) / 2;
      if (ty > H - 46) return;
      ctx.fillStyle = 'rgba(234,107,166,0.85)';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(b.label, 10, ty);
    });
    ctx.setLineDash([]);

    /* 秘密性：横轴两侧的形态 */
    var tx = '习俗侧 · 秘密以默契与丑闻存在';
    var ty2 = '纲领侧 · 秘密以制度与档案存在';
    ctx.font = f11;
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = 'rgba(198,150,232,0.85)';
    ctx.textAlign = 'left';
    ctx.fillText('\u2190 ' + tx, 10, oy - 24);
    ctx.textAlign = 'right';
    ctx.fillText(ty2 + ' \u2192', W - 10, oy - 24);

    /* 对价线的说明 */
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(234,107,166,0.9)';
    ctx.fillText('对价线 y = 0：线上不计代价，只有第一人称报告，没有质', 10, oy + 8);

    ctx.restore();

    if (chip) {
      chip('第三轴 \u00b7 权力学', W - 12, 54, 'right', 'top', 'rgba(234,107,166,0.9)', f11);
    }
    return yMax;
  }

  /* ---------- 右栏读数 ---------- */
  function row(k, v, why) {
    return '<div class="ro-row"><dt>' + esc(k) + '</dt><dd>' + v
      + (why ? '<span class="why">' + why + '</span>' : '') + '</dd></div>';
  }

  function toHTML(r) {
    var h = '';

    h += '<div class="ro-block"><h3>第三轴 \u00b7 权力学</h3>'
      + '<p class="ro-verdict">E13 说，加入第三轴（虚数轴＝暴力）之后「它就是权力的模型」，'
      + '「他就不是个政治哲学了」「他就是权力学」。这一层就是 E02 给出的三条基本性质。'
      + '它没有另立坐标：<strong>质</strong>读纵轴，<strong>秘密性</strong>读横轴，'
      + '<strong>概率性</strong>读第三轴本身。</p>'
      + '<p class="ro-verdict" style="color:var(--ink-3)">E02 通篇不说纲领、习俗、对价——'
      + '原转写稿里这几个词零出现。三条性质挂到三条轴上是本页的补足<span class="tag tag-add">补</span>，'
      + '所以下面每一格都附文稿原话与出处。</p></div>';

    /* 质 */
    h += '<div class="ro-block"><h3>质 \u00b7 纵轴的对价侧</h3><dl class="ro-rows">'
      + row('档位', esc(r.q.name) + '<span class="why">' + esc(r.q.sub) + '</span>',
        r.q.key === 'none' ? 'y \u2265 0：不计代价的行动只有第一人称报告，没有东西可押。'
          : 'y &lt; 0：向下每深一个单元，质押重一档。')
      + row('落点', esc(r.q.doom))
      + row('当量', r.q.weight ? pct(r.q.weight) : '—', r.q.weight ? '按探针深度折算〔补〕，以单元阈值为刻度' : '')
      + row('曝光之后', esc(r.q.shift))
      + '</dl>'
      + '<blockquote class="ro-quote"><span class="tag tag-orig">原</span>「' + esc(r.q.quote) + '」</blockquote>'
      + (r.q.note ? '<p class="ro-verdict">' + esc(r.q.note) + '</p>' : '')
      + '<p class="ro-verdict">质效原则：第一原则既是它的无效性原则，也是它的有效性原则。'
      + '判据只有一条——不看他说什么，只看他押了什么。</p>'
      + (r.q.key === 'none' ? '' : '<p class="sx-foot"><span class="mark mark-yi">疑</span> '
        + '三级阶梯与三种变形的对应、落点「生死／伦理／法度」的归位，以及「指证」的用字，'
        + '讲义均标〔疑〕（原文作「第三种的话这个无端之恶」，又作「指正」）。'
        + '本页照讲义归位，不代为判定。</p>')
      + '<p class="sx-foot">文稿只给「由重到轻」的次序；三档按几个单元来切深度，是本页的补足。'
      + '出处：' + cite(r.q.term) + '　' + cite('第一人称的主观报告') + '</p>'
      + '<p class="sx-foot">质在谁手上（文稿三条并列，本页不代为判定）对照：'
      + PAWN_HOLDERS.map(function (p) { return esc(p.name) + '＝' + esc(p.pawn); }).join('；') + '。</p></div>';

    /* 秘密性 */
    var sName = r.s.name;
    var sWhy = r.s.side === 'program'
      ? 'x &gt; 0：越靠纲领一侧，秘密越要被注册、归档、成文——「秘密的公开」，必定滞后，因为先有秘密、再公开规则。'
      : (r.s.side === 'custom'
        ? 'x &lt; 0：越靠习俗一侧，秘密越靠默契与丑闻维持——不写下来，人人知道而只能当它不存在。'
        : '靠近零纲领零行动的点：两种形态尚未分开。');
    h += '<div class="ro-block"><h3>秘密性 \u00b7 横轴（纲领 \u2194 习俗）</h3><dl class="ro-rows">'
      + row('形态', esc(sName), sWhy)
      + '</dl>'
      + '<blockquote class="ro-quote"><span class="tag tag-orig">原</span>「秘密分两种，秘密和公开的秘密。」</blockquote>'
      + '<p class="ro-verdict">公开在前的是「公开的秘密」：赤裸地发生，所有人都只能把它当秘密，'
      + '这是一种权力的威能、先占与豁免，成本最低、可靠性也最低。制度化的那一侧是「秘密的公开」：'
      + '权力要发展成制度，以及制度的例外。秘密性的过剩会变成伪禁忌与信息封锁，权力于是可怖——'
      + '而恐惧不利于统治。</p>'
      + '<p class="sx-foot">出处：' + cite('秘密性一定要保证') + '　' + cite('制度的例外')
      + '　' + cite('权力应该是鲜活的', '权力应当是鲜活的') + '</p></div>';

    /* 概率性 */
    h += '<div class="ro-block"><h3>概率性 \u00b7 第三轴本身</h3>'
      + '<p class="ro-alert">这一条不落在平面上任何一点——它是对整个平面的限定。'
      + '两轴体系不含暴力，所以它给出的每一条曲线都只是<strong>趋势</strong>，而不是担保。</p>'
      + '<blockquote class="ro-quote"><span class="tag tag-orig">原</span>「换言之就是四个字：只能冒险。」</blockquote>'
      + '<p class="ro-verdict">任何质押都不能把人捏死：质只对特定的人与情境有效，质必定可能失效；'
      + '你把质当一回事，别人可以不当一回事。这不是来自主体间性，而是来自符号系统必须用精纯之物驾驭混乱之物。'
      + '于是有三条推论：</p><dl class="ro-rows">'
      + row('不治之治', '隐性权力', '不把质押物当回事的人，反能另行质押，形成不可预测性与低预测度。')
      + row('失真', '残暴与狡猾', '不必一把枪对着所有人；不残暴等于把不确定性的筹码让给对手。')
      + row('生产确定性', '无权则无法度', '达成妥协均衡后，弱势者把「不确定权」质押上来，法度由此而生。')
      + '</dl>'
      + '<p class="ro-verdict">这绝对是非道德的，这是他的非道德性。</p>'
      + '<p class="sx-foot">出处：' + cite('只能冒险') + '　' + cite('不治之治')
      + '　' + cite('枪打出头鸟') + '　' + cite('无权则无法度') + '</p>'
      + '<p class="sx-foot">本页把这一层读成：曲线给出趋势与探针的位置，'
      + '三条性质给出这个位置上的权力能不能立住。原话与判语一律以文稿为准；'
      + '分档、当量、两侧形态的对应都是本页的补足。</p></div>';

    return h;
  }

  var API = { read: read, toHTML: toHTML, paint: paint, bands: bands,
    LADDER: LADDER, NONE: NONE, PAWN_HOLDERS: PAWN_HOLDERS };
  global.SHUZHENG_POWER = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof globalThis !== 'undefined' ? globalThis : this);
