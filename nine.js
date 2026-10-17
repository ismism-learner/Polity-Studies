/* 庶政学 · X 轴左侧：九连环（E08《X 轴左侧的情形：九连环》）
   ─────────────────────────────────────────────────────────────
   几何照文稿，不是比喻：九连环是**竖直**的——每一环只有两个位置，

     挂在架上（上）＝ 神圣位面       垂脱在下面（下）＝ 交易位面

   文稿原话：「第七环挂在上面，下面六环都是垂脱的、掉下去的」；
   「前面其他的六个环全都耷拉在下面」；「你想把第五个环、第六个环再放上去，不行，
   放不了，他已经进入交易的位面了」；第一、二环「悬空又脱落」，要「放上去再掉下去」。

   X 轴只负责「哪一环」：原点＝主体性，负向依次是身体、家庭、家族、同乡、文明圈、
   生殖宗教、宇宙宗教、本体论宗教（文稿 §2 的次序，共九个）。文稿 §10 另给了一版
   更细的层次序列（多出神学时空论、世俗统治神学，并把「同乡」写成「语言排他性」），
   作者自己说「这个有没有九个？如果不够九个我再加一个」——本页采用 §2 的九个。

   Y 轴负责「上还是下」：上＝神圣（义务位面），下＝交易（第三象限）。

   规则照 九连环 本身（也照文稿 §4、§9、§8）：
     · 第 1 环永远可以自由上下——「你的心灵永远是自由的」
     · 第 1、2 环可以一块放下去（「第一、第二环是可以一块送到下面」）
     · 第 n 环可动，当且仅当 第 n−1 环在架上，且第 1..n−2 环都已解下
       ——「它前面所有的环都被解开，除了它前面的、直接的前面那个环没被解开」
     于是要把第 3 环挂上去，必须 1 上 → 2 上 → 1 下 → 3 上；
     文稿写的就是这个次序：「第一环、第二环要同时挂上去，然后再把第一环放下去，
     然后再把第三环再放上去」。
*/
(function (global) {
  'use strict';

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

  /* 初始：九环全挂在架上——前现代秩序「未动过」的状态 */
  var state = { bits: [true, true, true, true, true, true, true, true, true] };

  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var esc = function (s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };
  function cite(term, label) {
    return '<a href="#" class="xref cite-link" data-ep="E08" data-term="' + esc(term) + '">E08 · '
      + esc(label || term) + '</a>';
  }
  function src(list) { return '<p class="sx-foot">出处：' + list.join('　') + '</p>'; }

  /* ---------- 规则 ---------- */
  /* 第 n 环现在能不能动：n=1 恒可；n≥2 需第 n−1 环在架上且 1..n−2 全解下 */
  function canMove(n) {
    if (n <= 1) return true;
    if (!state.bits[n - 2]) return false;                       // 前一环必须在上
    for (var i = 0; i < n - 2; i++) if (state.bits[i]) return false; // 更前的必须都解下
    return true;
  }
  function why(n) {
    if (n <= 1) return '第一环永远可以直接解下——「你的心灵永远是自由的」。';
    if (!state.bits[n - 2]) {
      return '第 ' + (n - 1) + ' 环还垂在下面：前一环必须挂在架上，这一环才动得了。';
    }
    var blockers = [];
    for (var i = 0; i < n - 2; i++) if (state.bits[i]) blockers.push(i + 1);
    if (blockers.length) {
      return '第 ' + blockers.join('、') + ' 环还挂在架上：它前面的环必须全部解下（只留紧邻的前一环）。';
    }
    return '可动：前一环在架上、之前的都解下了。';
  }
  function movable() {
    return RINGS.filter(function (r) { return canMove(r.no); }).map(function (r) { return r.no; });
  }

  /* 指针落在哪一环上（点击判定用）：横向最近的一环，且纵向要靠近两条轨之一 */
  function pick(x, y) {
    if (x === null || x === undefined || !isFinite(x)) return null;
    var idx = clamp(Math.round(-x), 0, RINGS.length - 1);
    var r = RINGS[idx];
    if (Math.abs(x - r.x) > 0.55) return null;
    return idx;
  }

  /* 点击：目标是让这一环 上 还是 下 —— 由点击位置在轴上方还是下方决定 */
  function tryMove(x, y) {
    var idx = pick(x, y);
    if (idx === null) return null;
    var r = RINGS[idx];
    var want = (y === null || !isFinite(y)) ? !state.bits[idx] : (y > 0);
    if (want === state.bits[idx]) {
      return { ok: false, reason: '它已经在' + (want ? '架上' : '下面') + '了。', ring: r };
    }
    if (!canMove(r.no)) {
      return { ok: false, reason: why(r.no), ring: r };
    }
    state.bits[idx] = want;
    return { ok: true, ring: r, up: want };
  }

  /* ---------- 读数 ---------- */
  function read(x, y) {
    var idx = (x === null || x === undefined || !isFinite(x)) ? null : clamp(Math.round(-x), 0, RINGS.length - 1);
    var ring = idx === null ? null : RINGS[idx];
    var modern = (x !== null && x !== undefined && isFinite(x) && x > 0.25);
    return {
      modern: modern, ring: ring, idx: idx,
      up: idx === null ? null : state.bits[idx],
      bits: state.bits.slice(),
      movable: movable(),
      canMove: ring ? canMove(ring.no) : false,
      why: ring ? why(ring.no) : '',
      offCount: state.bits.filter(function (b) { return !b; }).length,
      x: x, y: y
    };
  }

  /* ---------- 画布 ---------- */
  var UP_Y = 0.80, DOWN_Y = -0.80;

  function paint(ctx, geom) {
    var X = geom.X, Y = geom.Y, W = geom.W, H = geom.H;
    var PAL = geom.PAL, FONT = geom.FONT;
    var f10 = '10px ' + FONT, f11 = '11px ' + FONT, f12 = '12px ' + FONT;
    var yUp = Y(UP_Y), yDn = Y(DOWN_Y);
    var xL = X(-8.7), xR = X(0.7);

    ctx.save();

    /* 两条轨：架 与 垂脱 */
    ctx.setLineDash([6, 5]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(232,178,92,0.45)';
    ctx.beginPath(); ctx.moveTo(xL, yUp); ctx.lineTo(xR, yUp); ctx.stroke();
    ctx.strokeStyle = 'rgba(234,107,166,0.40)';
    ctx.beginPath(); ctx.moveTo(xL, yDn); ctx.lineTo(xR, yDn); ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = f11;
    ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
    ctx.fillStyle = 'rgba(232,178,92,0.85)';
    ctx.fillText('架：挂着＝神圣位面', xR, yUp - 6);
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(234,107,166,0.85)';
    ctx.fillText('垂脱：掉下去＝交易位面', xR, yDn + 6);

    /* 九个环：各自挂在架上或垂在下面 */
    ctx.font = f10;
    RINGS.forEach(function (r, i) {
      var px = X(r.x);
      var up = state.bits[i];
      var py = up ? yUp : yDn;
      /* 从架上垂下来的那根线（垂脱的环要画出身位落差） */
      ctx.strokeStyle = 'rgba(232,178,92,0.28)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(px, yUp); ctx.lineTo(px, py); ctx.stroke();
      /* 环 */
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fillStyle = up ? 'rgba(232,178,92,0.20)' : 'rgba(20,17,16,0.9)';
      ctx.fill();
      ctx.strokeStyle = up ? 'rgba(232,178,92,0.95)' : 'rgba(234,107,166,0.85)';
      ctx.lineWidth = 1.6;
      ctx.stroke();
      /* 环号 */
      ctx.fillStyle = up ? 'rgba(255,238,205,0.95)' : 'rgba(234,107,166,0.95)';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(r.no), px, py);
      /* 环名：统一放在轴上方的独立一行，不跟着环上下乱跑 */
      ctx.font = f10;
      ctx.fillStyle = up ? 'rgba(232,178,92,0.78)' : 'rgba(234,107,166,0.65)';
      ctx.textBaseline = 'bottom';
      ctx.fillText(r.name, px, Y(0.40));
      ctx.font = f10;
    });

    /* 可动的环：画一个虚线圈标出来 */
    movable().forEach(function (no) {
      var r = RINGS[no - 1];
      var px = X(r.x), py = state.bits[no - 1] ? yUp : yDn;
      ctx.beginPath();
      ctx.arc(px, py, 10, 0, Math.PI * 2);
      ctx.setLineDash([2, 3]);
      ctx.strokeStyle = 'rgba(95,198,182,0.8)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);
    });

    /* 标题 */
    ctx.font = f12;
    ctx.textAlign = 'right'; ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(232,178,92,0.9)';
    ctx.fillText('X 轴左侧：九连环（E08）', W - 12, 12);
    ctx.font = f11;
    ctx.fillText('竖着看：每环只有「挂上」或「垂下」两个位置；虚线圈＝此刻可动', W - 12, 32);

    ctx.restore();
    return null;
  }

  /* ---------- 右栏 ---------- */
  function row(k, v, why) {
    return '<div class="ro-row"><dt>' + esc(k) + '</dt><dd>' + v
      + (why ? '<span class="why">' + why + '</span>' : '') + '</dd></div>';
  }

  function chainHTML(bits) {
    return '<div class="nine-chain">' + RINGS.map(function (r, i) {
      var up = bits[i];
      var cls = 'nine-ring ' + (up ? 'nine-on' : 'nine-off');
      return '<span class="' + cls + '" title="第 ' + r.no + ' 环 ' + esc(r.name)
        + '：' + (up ? '挂在架上（神圣）' : '垂在下面（交易）') + '">'
        + r.no + '<i>' + (up ? '上' : '下') + '</i></span>';
    }).join('') + '</div>';
  }

  function toHTML(r) {
    var h = '';

    h += '<div class="ro-block"><h3>X 轴左侧 \u00b7 九连环</h3>'
      + '<p class="ro-verdict">九连环是<strong>竖着</strong>的：每一环只有两个位置——'
      + '<strong>挂在架上</strong>（神圣位面），或者<strong>垂脱在下面</strong>（交易位面）。'
      + 'X 轴只回答「哪一环」：原点＝主体性，负向依次是身体、家庭、家族、同乡、文明圈、'
      + '生殖宗教、宇宙宗教、本体论宗教。</p>'
      + '<p class="ro-verdict">「第七环挂在上面，下面六环都是垂脱的、掉下去的」——'
      + '这就是前现代秩序的一幅快照。<strong>点画布上的环</strong>可以试着把它挂上去或放下来，'
      + '动不了的环会被拦下，并说明为什么。</p></div>';

    if (r.modern) {
      h += '<div class="ro-block"><h3>当前位置 \u00b7 X 轴右侧</h3>'
        + '<p class="ro-verdict">探针落在 X 轴正向：这里是<strong>现代政治</strong>。'
        + '现代政治「天然的是可以跳阶次的，它是用法令的方式把这个环节打破的」——'
        + '九连环这一套相邻性在这里不适用。</p>'
        + src([cite('现代政治落在'), cite('跳阶次')]) + '</div>';
      return h;
    }

    h += '<div class="ro-block"><h3>当前配置</h3>'
      + chainHTML(r.bits)
      + '<p class="sx-foot">上＝挂在架上（神圣）· 下＝垂在下面（交易）· 已垂下 '
      + r.offCount + ' / 9 环。</p><dl class="ro-rows">'
      + row('此刻可动', r.movable.length ? ('第 ' + r.movable.join('、') + ' 环') : '无',
        '虚线圆圈标出的就是这几环。')
      + '</dl>'
      + src([cite('九连环'), cite('垂脱')]) + '</div>';

    if (r.ring) {
      h += '<div class="ro-block"><h3>指着第 ' + r.ring.no + ' 环 \u00b7 ' + esc(r.ring.name) + '</h3>'
        + '<dl class="ro-rows">'
        + row('位置', r.up ? '挂在架上（神圣）' : '垂在下面（交易）', esc(r.ring.sub))
        + row('能否移动', r.canMove ? '能' : '不能', esc(r.why))
        + '</dl>'
        + '<p class="ro-verdict">点它即可试：上/下由你点的位置在轴上方还是下方决定。</p></div>';
    }

    h += '<div class="ro-block"><h3>四条规矩（照九连环本身）</h3><dl class="ro-rows">'
      + row('第一环', '永远可以直接解下', '「你的心灵永远是自由的」——主体性随时可以沉到交易位面。')
      + row('第一、二环', '可以一块放下', '「第一、第二环是可以一块送到下面」：身心一起进交易状态。')
      + row('第 n 环', '前一环必须在架上', '且它前面的环必须全部解下——'
        + '「它前面所有的环都被解开，除了它前面的、直接的前面那个环没被解开」。')
      + row('第三环', '不能直接放下', '按上一条，要挂上第 3 环的次序是 1 上 → 2 上 → 1 下 → 3 上，'
        + '文稿写的就是这个次序。它是伦理依托，必须有东西兜着。')
      + '</dl>'
      + '<p class="ro-verdict"><strong>单向性</strong>：已经垂下去的环，想再挂回去得重走一遍全套操作——'
      + '「已经去魅了，没有办法再把它旋上来了」。</p>'
      + '<p class="ro-verdict"><strong>越权禁止</strong>：要让比你低一阶的环节获得神圣性，'
      + '不能直接宣布一道法令，只能「一环一环地给他挂上去」。'
      + '凯撒可以让教皇什么都不是，但再往上的宇宙秩序、命运性的宗教又是杳然不可测的。</p>'
      + src([cite('伦理依托'), cite('越权禁止'), cite('已经去魅')]) + '</div>';

    h += '<div class="ro-block"><h3>为什么是「交易」</h3>'
      + '<p class="ro-verdict">把环放下来，就是让它进入交易状态：「个体人类……必须沉沦到——'
      + '这东西交易什么宗教关系、什么天父地母……通通都变成一种肮脏的交易」，变成机心巧智、算计。</p>'
      + '<p class="ro-verdict">所以这一讲的判断是：前现代政治就是这九个环上的操作；'
      + '「政治的灵魂是交易」，精髓在 Y 轴的下半部分。</p>'
      + '<p class="sx-foot">操作链是<strong>相邻</strong>的：'
      + '「直接操纵的就是他和他的身体；间接的就是要通过身体才能操纵他的家庭」，'
      + '再通过家庭操纵家族、通过家族操纵方言区、通过方言区操纵习俗区文明区、'
      + '通过文明区操纵帝国性的权力、通过帝国性权力操纵神权。</p>'
      + src([cite('政治的灵魂'), cite('相邻'), cite('帝国性的权利', '帝国性权力')]) + '</div>';

    return h;
  }

  var API = {
    RINGS: RINGS, state: state, read: read, paint: paint, toHTML: toHTML,
    pick: pick, tryMove: tryMove, canMove: canMove, movable: movable,
    reset: function () { state.bits = [true, true, true, true, true, true, true, true, true]; }
  };
  global.SHUZHENG_NINE = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof globalThis !== 'undefined' ? globalThis : this);
