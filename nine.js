/* 庶政学 · X 轴左侧：九连环（E08《X 轴左侧的情形：九连环》）
   ─────────────────────────────────────────────────────────────
   这是坐标平面的第二层展开，和 E02 的第三轴层并列：

     E02 把「虚数轴＝暴力」展开成权力的三条性质；
     E08 把「X 轴负向＝习俗化」展开成九个环节，也就是九连环。

   文稿的说法（照抄其结构）：
     · 「政治的灵魂是交易」——精髓在 Y 轴的下半部分，下半轴才是政治操作的宝库；
       上半个轴是义务性的、奉献性的、理想性的。
     · X 轴原点＝主体性（悬空），负向依次是：身体、家庭、家族、同乡、文明圈、
       生殖宗教、宇宙宗教、本体论宗教——「我会用九个环节来讲这个东西」。
     · 规则：第一环永远可以直接解下（心灵永远是自由的）；第一、二环可以一块放下；
       第三环是伦理依托，不能直接放下；解开某一环的前提是它前面所有环都已解下、
       只留紧邻的前一环还在架上。
     · 相邻性：只能解掉比自己高一层的；高一层的可以，高两层的解不开。
     · 单向性：已经解下的环再也旋不上去——「已经去魅了」。
     · 越权禁止：神圣性不能靠一道法令造出。
     · 现代政治落在 X 轴右侧；前现代讲阶次，不能跳阶次。

   读法：探针落在 X 轴负向的哪一环，就站在哪一环；Y 轴的正负决定你在义务位面还是交易位面。 */
(function (global) {
  'use strict';

  /* 九个环节：位置严格照文稿给的次序，环 1 在原点。 */
  var RINGS = [
    { no: 1, x: 0, name: '主体性', sub: '心灵 · 悬空' },
    { no: 2, x: -1, name: '身体', sub: '身体性享乐' },
    { no: 3, x: -2, name: '家庭', sub: '亲缘关系' },
    { no: 4, x: -3, name: '家族', sub: '伦理依托' },
    { no: 5, x: -4, name: '同乡', sub: '同语言 · 同方言' },
    { no: 6, x: -5, name: '文明圈', sub: '同习俗范围' },
    { no: 7, x: -6, name: '生殖宗教', sub: '民族神灵 · 泛灵' },
    { no: 8, x: -7, name: '宇宙宗教', sub: '自然秩序' },
    { no: 9, x: -8, name: '本体论宗教', sub: '存在论秩序' }
  ];

  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var esc = function (s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };
  function cite(term, label) {
    return '<a href="#" class="xref cite-link" data-ep="E08" data-term="' + esc(term) + '">E08 · '
      + esc(label || term) + '</a>';
  }
  function src(list) { return '<p class="sx-foot">出处：' + list.join('　') + '</p>'; }

  /* ---------- 读数 ---------- */
  function read(x, y, o) {
    o = o || {};
    var modern = (x !== null && x !== undefined && isFinite(x) && x > 0.25);
    var at = (x === null || x === undefined || !isFinite(x)) ? null : -x;
    var idx = at === null ? 0 : clamp(Math.round(at), 0, RINGS.length - 1);
    var ring = RINGS[idx];

    /* 站在第 no 环：1..no−1 已解下（去了魅、可交易），no 在架上，no+1 可解，no+2 起不可解 */
    var no = ring.no;
    var chain = RINGS.map(function (r) {
      var state;
      if (r.no < no) state = 'off';        // 已解下
      else if (r.no === no) state = 'on';  // 在架上
      else if (r.no === no + 1) state = 'next'; // 相邻的下一环，可解
      else state = 'far';                  // 高一层的、解不开
      return { no: r.no, name: r.name, x: r.x, state: state };
    });

    var panel = 'axis';
    if (y !== null && y !== undefined && isFinite(y)) panel = y > 0 ? 'duty' : (y < 0 ? 'deal' : 'axis');

    return {
      modern: modern, ring: ring, no: no, chain: chain, panel: panel,
      x: x, y: y, at: at,
      next: chain.filter(function (c) { return c.state === 'next'; })[0] || null,
      offCount: chain.filter(function (c) { return c.state === 'off'; }).length
    };
  }

  /* ---------- 画布 ---------- */
  function paint(ctx, geom) {
    var X = geom.X, Y = geom.Y, W = geom.W, H = geom.H, oy = geom.oy;
    var PAL = geom.PAL, FONT = geom.FONT;
    var f10 = '10px ' + FONT, f11 = '11px ' + FONT, f12 = '12px ' + FONT;
    var zero = Y(0);

    ctx.save();

    /* 交易位面：Y 轴下半部分才是政治操作的宝库 */
    ctx.fillStyle = 'rgba(232,178,92,0.075)';
    ctx.fillRect(0, zero, W, H - zero);
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = 'rgba(232,178,92,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, zero); ctx.lineTo(W, zero); ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = f11;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(232,178,92,0.85)';
    ctx.fillText('交易位面（第三象限）：政治操作的宝库 —— 「政治的灵魂是交易」', 10, zero + 64);
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = 'rgba(232,178,92,0.55)';
    ctx.fillText('义务位面（第二象限）：奉献性的、理想性的行动', 10, zero - 46);

    /* 九环：钉在负向 X 轴上 */
    ctx.font = f10;
    RINGS.forEach(function (r, i) {
      var px = X(r.x);
      if (px < -20 || px > W + 20) return;
      var on = (i === 0);
      ctx.beginPath();
      ctx.arc(px, zero, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(20,17,16,0.9)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(232,178,92,0.9)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      /* 环号写在圈里 */
      ctx.fillStyle = 'rgba(232,178,92,0.95)';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(r.no), px, zero);
      /* 环名：轴下方两行错开，避免挤在一起 */
      ctx.textBaseline = 'top';
      ctx.fillStyle = i % 2 === 0 ? 'rgba(232,178,92,0.85)' : 'rgba(232,178,92,0.6)';
      ctx.fillText(r.name, px, zero + 15 + (i % 2) * 14);
    });

    /* 标题 */
    ctx.font = f12;
    ctx.textAlign = 'right'; ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(232,178,92,0.9)';
    ctx.fillText('X 轴左侧：九连环（E08）', W - 12, 12);
    ctx.font = f11;
    ctx.fillText('原点＝主体性；负向九个环节，只能动相邻的下一环', W - 12, 32);

    ctx.restore();
    return oy;
  }

  /* ---------- 右栏 ---------- */
  function row(k, v, why) {
    return '<div class="ro-row"><dt>' + esc(k) + '</dt><dd>' + v
      + (why ? '<span class="why">' + why + '</span>' : '') + '</dd></div>';
  }

  function chainHTML(r) {
    return '<div class="nine-chain">' + r.chain.map(function (c) {
      var cls = 'nine-ring nine-' + c.state;
      var mark = c.state === 'off' ? '下' : (c.state === 'on' ? '上' : (c.state === 'next' ? '可解' : '·'));
      return '<span class="' + cls + '" title="第 ' + c.no + ' 环：' + esc(c.name) + '（' + mark + '）">'
        + c.no + '<i>' + mark + '</i></span>';
    }).join('') + '</div>';
  }

  function toHTML(r) {
    var h = '';

    h += '<div class="ro-block"><h3>X 轴左侧 \u00b7 九连环</h3>'
      + '<p class="ro-verdict">E08 把 X 轴的负向——习俗化那一侧——拆成<strong>九个环节</strong>：'
      + '原点＝主体性，负向依次是身体、家庭、家族、同乡、文明圈、生殖宗教、宇宙宗教、本体论宗教。'
      + '前现代政治就是在这九个环节上做交易。</p>'
      + '<p class="ro-verdict">这一讲的总纲是一句反直觉的话：「政治的灵魂是交易」。'
      + '庶政学体系里精髓不在上半轴，而在 <strong>Y 轴的下半部分</strong>——'
      + '上半轴是义务性的、奉献性的、理想性的；下半轴才是政治操作的宝库。</p></div>';

    if (r.modern) {
      h += '<div class="ro-block"><h3>当前位置 \u00b7 X 轴右侧</h3>'
        + '<p class="ro-verdict">探针落在 X 轴正向：这里是<strong>现代政治</strong>的一侧。'
        + '九连环讲的是前现代的阶次性——「现代政治落在 X 轴右侧」，那一套环在这里不适用。</p>'
        + src([cite('现代政治落在'), cite('跳阶次')]) + '</div>';
      return h;
    }

    var panelName = r.panel === 'deal' ? '交易位面' : (r.panel === 'duty' ? '义务位面' : '坐标轴上');
    var panelWhy = r.panel === 'deal'
      ? 'Y 轴下半部分：算计、功利、可交易——「政治操作的真正的宝库」。'
      : (r.panel === 'duty'
        ? 'Y 轴上半部分：义务性的、奉献性的、理想性的行动。作者说别因此看不起下半轴。'
        : '正在对价线上：交易位面与义务位面的分界。');

    h += '<div class="ro-block"><h3>当前位置 \u00b7 第 ' + r.no + ' 环</h3><dl class="ro-rows">'
      + row('环节', esc(r.ring.name) + '<span class="why">' + esc(r.ring.sub) + '</span>',
        '第 ' + r.no + ' 环，位置 x = ' + r.ring.x)
      + row('位面', esc(panelName), esc(panelWhy))
      + row('已解下', r.offCount ? (r.offCount + ' 环') : '无',
        r.offCount ? '第 1 至 ' + r.offCount + ' 环已经去了魅、进了交易位面——「再也旋不上来」。' : '尚未解开任何一环。')
      + row('可解', r.next ? ('第 ' + r.next.no + ' 环 · ' + esc(r.next.name)) : '无',
        r.next ? '相邻性：只能解掉比自己高一层的；高两层解不开。' : '已经到最外一环，再无可解。')
      + '</dl>'
      + chainHTML(r)
      + '<p class="sx-foot">链上标记：<b>下</b>＝已解下（去魅、可交易）· <b>上</b>＝在架上（尚神圣）· <b>可解</b>＝相邻的下一环。</p>'
      + src([cite('九连环'), cite('相邻性'), cite('单向性')]) + '</div>';

    h += '<div class="ro-block"><h3>九连环的四条规矩</h3><dl class="ro-rows">'
      + row('第一环', '永远可以直接解下', '「你的心灵永远是自由的」——主体性一定可以沉到交易位面。')
      + row('第一、二环', '可以一块放下', '心灵与身体一起进交易状态：不择手段、不择心性。')
      + row('第三环', '不能直接放下', '它是伦理依托：必须有东西兜着，否则个体在前现代秩序里会崩解。')
      + row('解第 n 环', '前一环必须在上', '它前面所有环都已解下，只留紧邻的前一环在架上——否则能指链全松，人就死了。')
      + '</dl>'
      + '<p class="ro-verdict">于是：<strong>相邻性</strong>——只有紧邻的下一环可解，高两层就解不开；'
      + '<strong>单向性</strong>——已经解下的环再也旋不上去，「已经去魅了」；'
      + '<strong>越权禁止</strong>——神圣性不能靠一道法令造出。</p>'
      + '<p class="ro-verdict">例子：海瑞在家里是愚忠愚孝的，那一环不能解开；'
      + '但他可以把后面宗族、派系利益那一环解开。'
      + '凯撒眼里教皇什么都不是，可再往上的宇宙秩序、命运性的宗教又是杳然不可测的——'
      + '他只能解掉他所处点位的那一环。</p>'
      + src([cite('伦理依托'), cite('越权禁止'), cite('已经去魅')]) + '</div>';

    h += '<div class="ro-block"><h3>前现代为什么要「解放」</h3>'
      + '<p class="ro-verdict">前现代政治要做的是人的解放：把人从宗族、伦理、宗教、家长制、身体欲望里解出来。'
      + '但「顶到上面去」不叫解放——</p>'
      + '<p class="ro-verdict">在作者看来，让这些伦理、宗族、宗教进入政治层面，'
      + '就<strong>必须让它们进入第三象限</strong>，进交易状态：'
      + '「通通都变成一种肮脏的交易」，变成机心巧智、算计。'
      + '能操纵这些东西，才叫古代政治。</p>'
      + '<p class="sx-foot">这也是本层与模型视图的接口：y &lt; 0 的那一半不是「更低」，'
      + '而是唯一可以操作的那一半。</p>'
      + src([cite('解放'), cite('第三象限')]) + '</div>';

    return h;
  }

  var API = { RINGS: RINGS, read: read, paint: paint, toHTML: toHTML };
  global.SHUZHENG_NINE = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof globalThis !== 'undefined' ? globalThis : this);
