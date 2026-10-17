/* 庶政学 · 权力三性质（E02《权力的三个基本性质》）
   ─────────────────────────────────────────────────────────────
   这不是另一台仪器，是模型视图「虚数轴」那一层的展开。

   E13 的说法：二维体系是「经典体系」，加入第三轴（虚数轴＝暴力）之后「它就是权力的模型」，
   「他就不是个政治哲学了」「他就是权力学」——但作者自陈这一层本讲没做，是前向预告。
   E02 就是那一层：它给出权力的三条基本性质——质、概率性、秘密性。

   接法的边界（务必看清）：我核过 E02 的整理稿，除了标题，正文里
   「纲领／习俗／对价／坐标／函数」这几个词几乎不出现——这一讲通篇不用坐标语言。
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
      note: '性丑闻是最泛滥的一种质。作者说性从审美看就是丑的——躯体黏腻、丑陋，快感来自支配的想象；「所有的性关系都是权力交易」。'
    },
    {
      key: 'life', name: '人命', sub: '无端之恶', doom: '生死', shift: '攀咬',
      quote: '最直接就是人命了……无端之恶', term: '无端之恶',
      note: '曝光后他的话变成攀咬：把另一个无端之罪投射到他身上。必须有「无端」，正因它与事无关，才能把实际的罪责荡开。'
    }
  ];

  /* 质在谁手上：帝王 / 中层士林 / 平民（E02 论「质在谁手上」一节） */
  var PAWN_HOLDERS = [
    {
      name: '帝王', pawn: '一姓一世的生灭', term: '一姓一世的生灭',
      detail: '血脉信仰、血脉崇拜、祖先崇拜——实即宗教信仰；再加上他本身的安危，与后世的历史评价。'
        + '历史评价最「实」，因为他要对天称臣、须循天道。',
      cost: '代价是人伦被全部质掉：性关系纯粹政治化，父子亲情无处安放；天子其实是礼教教主，'
        + '活在礼教的示范性真空里——他在这种人伦关系当中没有任何情感填充。'
    },
    {
      name: '中层士林', pawn: '同窗 · 师门 · 履历', term: '士林关系',
      detail: '同窗士林关系是代价极低的例外；中层靠混乱的性关系结成权力关系。',
      cost: '师门与学校评价今天转为职场评价与履历，连着考公考编——这就是上升渠道。'
    },
    {
      name: '平民', pawn: '性支配 · 共小罪', term: '性支配',
      detail: '最常见的权力关系发生在性支配（性关系、性丑闻）当中，其次是共小罪。'
        + '普通人的质简单讲是黑材料、共罪，或者叫投名状。',
      cost: '明代底层靠供小罪结成团伙；到中晚明中层丑闻性普遍，底层反因宗族伦理宽松而无从要挟。'
    }
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
  function src(list) { return '<p class="sx-foot">出处：' + list.join('　') + '</p>'; }

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

    /* ===== 一、导语与词源 ===== */
    h += '<div class="ro-block"><h3>第三轴 \u00b7 权力学</h3>'
      + '<p class="ro-verdict">E13 说，加入第三轴（虚数轴＝暴力）之后「它就是权力的模型」，'
      + '「他就不是个政治哲学了」「他就是权力学」。这一层就是 E02 给出的三条基本性质。'
      + '它没有另立坐标：<strong>质</strong>读纵轴，<strong>秘密性</strong>读横轴，'
      + '<strong>概率性</strong>读第三轴本身。</p>'
      + '<p class="ro-verdict">全讲第一句从词源起论：权本指权重、秤砣，后世所谓「权」'
      + '「都指的不是权，指的是权之柄，权的那个柄」——所以要问的不是名义，是柄上押着什么。</p>'
      + '<p class="ro-verdict" style="color:var(--ink-3)">E02 通篇不说纲领、习俗、对价——'
      + '这些词在它的整理稿里几乎不出现。三条性质挂到三条轴上是本页的补足<span class="tag tag-add">补</span>，'
      + '所以下面每一块都附文稿原话与出处。</p>'
      + src([cite('权之柄')]) + '</div>';

    /* ===== 二、质 ===== */
    h += '<div class="ro-block"><h3>质 \u00b7 纵轴的对价侧</h3><dl class="ro-rows">'
      + row('档位', esc(r.q.name) + '<span class="why">' + esc(r.q.sub) + '</span>',
        r.q.key === 'none' ? 'y \u2265 0：不计代价的行动只有第一人称报告，没有东西可押。'
          : 'y &lt; 0：向下每深一个单元，质押重一档。')
      + row('落点', esc(r.q.doom))
      + row('当量', r.q.weight ? pct(r.q.weight) : '—', r.q.weight ? '按探针深度折算〔补〕，以单元阈值为刻度' : '')
      + row('曝光之后', esc(r.q.shift))
      + row('关系形态', '互质', '不是一方押上东西，是双方互为把柄；「不质无权」。')
      + row('判据', '只看他押了什么', '不看他说什么。所押之物一旦曝光，能否让他的话在公共评价中失信。')
      + '</dl>'
      + '<blockquote class="ro-quote"><span class="tag tag-orig">原</span>「' + esc(r.q.quote) + '」</blockquote>'
      + (r.q.note ? '<p class="ro-verdict">' + esc(r.q.note) + '</p>' : '')
      + '<p class="ro-verdict">质的轻重由一条原则排序：「越能够实质性地摧毁第一人称报告的质，'
      + '他是越有重量的、越有分量的」；作者说这一层「权力斗争的话只讲输赢」，故它是首要原则。</p>'
      + '<p class="ro-verdict">唯一的正例是「以子为质」：文帝'
      + '<span class="mark mark-yi">疑</span>杀妻子为质，把老婆孩子宰了，换得功臣集团很大的信任；'
      + '作者说他「效其乃父」，对亲属家眷通通不管。'
      + '<span class="mark mark-yi">疑</span>原文仅作「文帝」，据「功臣集团」「效其乃父」按汉文帝处理。</p>'
      + (r.q.key === 'none' ? '' : '<p class="sx-foot"><span class="mark mark-yi">疑</span> '
        + '三级阶梯与三种变形的对应、落点「生死／伦理／法度」的归位，以及「指证」的用字，'
        + '讲义均标〔疑〕（原文又作「指正」）。本页照讲义归位，不代为判定。</p>')
      + '<p class="sx-foot">文稿只给「由重到轻」的次序；三档按几个单元来切深度，是本页的补足。'
      + '出处：' + cite(r.q.term) + '　' + cite('第一人称的主观报告') + '　' + cite('文帝') + '</p>'
      + '<p class="sx-foot">质在谁手上：'
      + PAWN_HOLDERS.map(function (p) { return esc(p.name) + '＝' + esc(p.pawn); }).join('；')
      + '。三者是并列的形态，本页不代为判定谁对应平面上哪一点。</p></div>';

    /* ===== 三、互质与非对称 ===== */
    h += '<div class="ro-block"><h3>互质与非对称</h3>'
      + '<p class="ro-verdict">「质」这一性质的另一半是<strong>互质</strong>：权力关系的本质不是占有，'
      + '而是双方互相质押、互为把柄。「这不是占有性，这是互质。」你不互质哪有权——「不质无权」。</p>'
      + '<p class="ro-verdict">互质也以互标丑陋面出现：恋人相互交出放肆的一面、不上床就吵架，都是互换把柄；'
      + '需要的是「临时性的把柄，或者不停刷新的长期的把柄」。要挟的价值由容忍度决定：'
      + '容忍度越高、评价不断刷新、社会越原子化，性丑闻越无用。</p>'
      + '<p class="ro-verdict">而且它一定<strong>非对称</strong>：「这是一个非对称的契约论，但是不存在公共契约。」'
      + '「不存在绝对的主人和绝对的奴隶」——君主可以支配臣子，臣子也可以反过来。'
      + '非对称还要维持在信息上，光有智力不够。</p>'
      + '<details class="quotes"><summary>两条例证</summary>'
      + '<p class="ro-verdict">爱欲这一侧有两条路：性完满靠不可拒绝的持续观想与第二人称独占，只给出局部，'
      + '且有一过性、重复即失效；褫夺与分割则更致命，削除与剥夺能带来一种「冷快感」，'
      + '而且可以完全不发生性关系而形成权力关联。</p>'
      + '<p class="ro-verdict">临场暴力对比决定互质的烈度：赤裸徒手相较大体男性占优，'
      + '但男性也会被几句话说到自杀或屈服——这是第三轴（暴力）与第一性质（质）在本讲里唯一的直接接口。</p>'
      + '</details>'
      + src([cite('不是占有性，这是互质'), cite('不质无权'), cite('非对称的契约论')]) + '</div>';

    /* ===== 四、概率性 ===== */
    h += '<div class="ro-block"><h3>概率性 \u00b7 第三轴本身</h3>'
      + '<p class="ro-alert">这一条不落在平面上任何一点——它是对整个平面的限定。'
      + '两轴体系不含暴力，所以它给出的每一条曲线都只是<strong>趋势</strong>，而不是担保。</p>'
      + '<blockquote class="ro-quote"><span class="tag tag-orig">原</span>「换言之就是四个字：只能冒险。」</blockquote>'
      + '<p class="ro-verdict">任何质押都不能把人捏死：质只对特定的人与情境有效，质必定可能失效。'
      + '这不是来自主体间性，而是来自符号系统必须用精纯之物驾驭混乱之物。</p>'
      + '<dl class="ro-rows">'
      + row('可翻盘', '曹操 · 刘备', '曹操弃家眷于不顾；刘备做军阀，每次失败家属就失散。'
        + '作者说这是第一关：「你过不了一关，就是老婆孩子不当人。」')
      + row('不治之治', '隐性权力', '不把质押物当回事的人，反能另行质押，形成不可预测性与低预测度。'
        + '两例：勾践；伯邑考——以子为质，被剁成肉酱，隐性权力维持住了。')
      + row('隐患', '不能因他没交质就动他', '他的质还压在你手里，你没有借口——这是通向「残暴与狡猾」的必经一步。')
      + row('生产确定性', '无权则无法度', '过度的不确定性也不行：「人心思定」。'
        + '达成妥协均衡后，由权力本身来认证和注册确定性，'
        + '所有在不确定性中瑟瑟发抖的玩家都去拥护它；它是一种「不确定的确定性」。')
      + '</dl>'
      + '<p class="ro-verdict">这绝对是非道德的，这是他的非道德性。</p>'
      + src([cite('只能冒险'), cite('不治之治'), cite('无权则无法度'), cite('不确定的确定性')]) + '</div>';

    /* ===== 五、失真 ===== */
    h += '<div class="ro-block"><h3>失真 \u00b7 残暴与狡猾</h3>'
      + '<p class="ro-verdict">权力之为权力天然是失真的：不必一把枪对着所有人，对着一人就能让所有人害怕；'
      + '他同时只能杀一个，却没人愿做第一个出头者。掌权者只有两张牌——<strong>残暴</strong>与<strong>狡猾</strong>。</p>'
      + '<p class="ro-verdict">不残暴等于把不确定性的筹码让给对手。狡猾是「我给你质了，但是我不当回事」：'
      + '老婆孩子杀了再娶再生，别人反觉得他狠、还支持他。</p>'
      + '<p class="ro-verdict">例子是明智光秀：织田信长只羞辱他而不杀他，他便知信长的残暴有限，于是铤而走险。</p>'
      + '<details class="quotes"><summary>枪打出头鸟：打谁、打几个</summary>'
      + '<p class="ro-verdict">第一枪打掉第一个跳出来的；第二枪要冷不丁，出乎所有人意料。'
      + '「开第二枪你不能打那个最坏的」——要取中间数、最有代表性的那一片，'
      + '如徐阶家在松江「有多少万亩」的田产。打完了让人向上害怕、又知道你留了情，向下瑟瑟发抖。</p>'
      + '</details>'
      + src([cite('他是失真的'), cite('枪打出头鸟'), cite('我给你质了，但是我不当回事')]) + '</div>';

    /* ===== 六、秘密性 ===== */
    var sWhy = r.s.side === 'program'
      ? 'x &gt; 0：越靠纲领一侧，秘密越要被注册、归档、成文——「秘密的公开」，必定滞后，因为先有秘密、再公开规则。'
      : (r.s.side === 'custom'
        ? 'x &lt; 0：越靠习俗一侧，秘密越靠默契与丑闻维持——不写下来，人人知道而只能当它不存在。'
        : '靠近零纲领零行动的点：两种形态尚未分开。');
    h += '<div class="ro-block"><h3>秘密性 \u00b7 横轴（纲领 \u2194 习俗）</h3><dl class="ro-rows">'
      + row('形态', esc(r.s.name), sWhy)
      + row('判据', '是否还「不便公开」', '谁公开这个秘密，这东西首先就不好再用。'
        + '守不住的别玩：「君不密则失臣，臣不密则失身」。')
      + row('替代', '丑闻性 → 暧昧性', '「丑闻性是可以被暧昧性所取代的」：两人只要相处、被人怀疑就够了；'
        + '暧昧性本身就是一种非正式权力的确认。')
      + '</dl>'
      + '<blockquote class="ro-quote"><span class="tag tag-orig">原</span>「秘密分两种，秘密和公开的秘密。」</blockquote>'
      + '<p class="ro-verdict">公开在前的是「公开的秘密」：赤裸地发生，所有人都只能把它当秘密，'
      + '这是一种权力的威能、先占与豁免，成本最低、可靠性也最低。例子是子见南子——'
      + '进去就进去了，「到底有没有干」不重要，此路「不需要生产额外丑闻性」。</p>'
      + '<details class="quotes"><summary>秘密的发生学：原型 → 公开的秘密 → 伪禁忌</summary>'
      + '<p class="ro-verdict">秘密有一个原型：最根本的秘密是「不可发生、不可设想」的禁忌'
      + '（作者以母子关系为例），一切可公开的秘密都建基于它。而原型的奇特之处在于——'
      + '它一旦被揭开，事件本身反而是脱罪的一方，真正有罪的是操持权力、达成交易的那些人。</p>'
      + '<p class="ro-verdict">另一头是过剩：秘密必然走向反面，变成伪禁忌、信息封锁、什么都不准讨论，'
      + '权力于是可怖——而恐惧不利于统治。作者给出的正面要求是：'
      + '「权力应该是鲜活的」，可亲近、善于交易。</p>'
      + '</details>'
      + src([cite('秘密性一定要保证'), cite('君不密则失臣'), cite('丑闻性是可以被暧昧性所取代的'),
        cite('子见南子'), cite('权力应该是鲜活的', '权力应当是鲜活的')]) + '</div>';

    /* ===== 七、制度与例外 ===== */
    h += '<div class="ro-block"><h3>制度与例外</h3>'
      + '<p class="ro-verdict">秘密性过剩导致恐怖，权力于是有意公开秘密：'
      + '「公开的秘密」公开在前，制度化的是「秘密的公开」，必定滞后。'
      + '二者同时维持权力的秘密性与公开性，也就维持它的唯一性——权力因此'
      + '「要发展成制度，以及制度的例外」。'
      + (r.s.side === 'program' ? '' : '（把秘密性拨到「秘密的公开」，这一条才落得下来。）') + '</p>'
      + '<p class="ro-verdict">例外就是人人皆知的「什么文件」。作者用时间性收尾：先后最易区分，'
      + '于是先后成了上下；制度是个盒子、是个笼子，他说更恰切的是个<strong>盖子</strong>，'
      + '权力是下面的东西，「权力在先，制度在后」，盖子半包围地压在上面。</p>'
      + '<p class="ro-verdict">比喻是盖子下的被子：一对男女上床，舒舒服服地主动把被子盖起来，'
      + '把整个遮住——但被子并没真遮住什么，人人知道里面有那回事，只是莞尔一笑。'
      + '良性权力的典型范式就是婚姻：婚姻制度即被许可的享乐与默契。</p>'
      + src([cite('制度的例外'), cite('权力在先，制度在后'), cite('无权则无法度')]) + '</div>';

    /* ===== 八、代价与指导权 ===== */
    h += '<div class="ro-block"><h3>代价 \u00b7 权力动物与指导权</h3>'
      + '<p class="ro-verdict">主动方去冒险促成这种权力关系时，代价是把主动性让渡出去，'
      + '按一套愚蠢的规则、按主人话语行事，「他质掉了他的主体性」。这种损害不可逆：'
      + '「变成这个权力动物是不可逆的」。</p>'
      + '<p class="ro-verdict">变成权力动物即变成纯粹的语言人类、律令人类，即变成鬼；'
      + '但它会留下一条割不掉的尾巴——<strong>灵魂会唱歌</strong>：语言会方言化、会强制唱歌，'
      + '压下去就成了逆鳞与言辞禁忌。有言辞禁忌的文明，只是在训练个体割尾求生。</p>'
      + '<p class="ro-verdict">全讲收在<strong>指导权</strong>上：作者承认讲授过程本身就是支配——'
      + '「帮你把所有东西切开，再帮你把所有东西拼起来，但是这里面没有你」。'
      + '他重申这些是铁的硬性规律，「不讲规律的人如何被你的规律所支配」；'
      + '至于自己，他说并不是想掌权、想支配人，「我是想改变事物」。</p>'
      + src([cite('权力动物'), cite('灵魂会唱歌'), cite('指导权'), cite('改变事物')]) + '</div>';

    /* ===== 九、本页的读法 ===== */
    h += '<div class="ro-block"><h3>本页怎么读这一层<span class="tag tag-add">补</span></h3>'
      + '<p class="sx-foot">曲线给出趋势与探针的位置；三条性质给出这个位置上的权力能不能立住。'
      + '原话与判语一律以文稿为准；分档、当量、两侧形态的对应都是本页的补足。'
      + '凡讲义标〔疑〕处（文帝、三级阶梯与三种变形的对应、指证的用字）本页同样标〔疑〕，'
      + '不把整理者的猜测读成作者的话。</p></div>';

    return h;
  }

  var API = { read: read, toHTML: toHTML, paint: paint, bands: bands,
    LADDER: LADDER, NONE: NONE, PAWN_HOLDERS: PAWN_HOLDERS };
  global.SHUZHENG_POWER = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof globalThis !== 'undefined' ? globalThis : this);
