/* 庶政学 · 这个点在说什么（点的解释引擎）
   ─────────────────────────────────────────────────────────────
   E12 给了这件事的合法性的根：「任何一个点，我们把它定义为是一个战争状态、一个政治状态。
   一个点就是一个政治状态。」所以鼠标在曲线上移动时，改变的不是一个数值，是一个政治状态。

   点的分解（全部照文稿，没有一处是我加的）：

     x ＝ 伦理轴   「他的 cause、理由、excuse、缘由、借口」——「凭什么这样做？」
                  原点＝主体性／纯道德点；+1 无父、+2 无母、>2 他父与自负；
                  −1…−8 是九连环的九个环节。
     y ＝ 活动轴／交往轴——「干什么：行动还是交易？」
     y 的刻度＝单元性：±1 是单元，越出去在三角函数那里就是统治区间的边界。
     切线＝主观状态／意识形态。意义取决于「这个点代表谁」：团体→交往范式、
           理念→哲学、个人→个人主观状态、运动→历史局限性；而且「个体的政治状态无法求导」。

   两条边界：
     ① x 落在两条环之间（如 −2.14）时，文稿没有给这种位置命名，本页读作「两环之间」并标〔补〕。
     ② 本页把点读成「此处的状态」，曲线仍是文稿的函数族读法；两者并列，不互相替代。 */
(function (global) {
  'use strict';

  var esc = function (s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };
  function cite(ep, term, label) {
    return '<a href="#" class="xref cite-link" data-ep="' + ep + '" data-term="' + esc(term) + '">'
      + ep + ' · ' + esc(label || term) + '</a>';
  }

  /* 切线的四种意义（E12 §2） */
  var SUBJECTS = [
    { id: 'group', name: '团体', what: '交往范式',
      note: '团体的主观状态是「这个团体在运行过程当中一些交往规则、交往范式」——集体无意识、符号学博弈。' },
    { id: 'idea', name: '理念', what: '哲学',
      note: '「一个政治理念，它的导数是它的哲学」——理念背后站着一套哲学，而那套哲学本身也是意识形态。' },
    { id: 'person', name: '个人', what: '个人主观状态（不可求导）',
      note: '「个体的政治状态是无法求导的」：他意识不到自己的意识形态。硬要导，得到的只是纯粹的个人主观状态，不等于意识形态。' },
    { id: 'movement', name: '运动', what: '历史局限性',
      note: '「一个运动，它的导数也是一种主观状态」——那是它的历史局限性。' }
  ];

  function byId(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return list[0];
  }

  /* ---------- 横轴：伦理定位 ---------- */
  var X_ANCHORS = [
    { at: 0, name: '主体性', alt: '纯道德点／非道德点',
      line: '不依托任何伦理建制，只出于「我就是要好」。上有行动会被习俗骂不道德，下有交易会被纲领骂不理性——两侧都给你负面评价，而那正是动能。',
      ep: 'E12', term: '纯道德点', label: '纯道德点' },
    { at: 1, name: '无父', alt: '公民化 · 纲领化的单元点',
      line: '父亲的命令无效化：他还是你父亲，但不再有额外意义，只是一个有血缘关系的普通人。对应现代国家教育、公民理论，以及一份基本纲领。',
      ep: 'E05', term: '无父', label: '无父' },
    { at: 2, name: '无母', alt: '自筹经费 · 匿名市场',
      line: '不再被家庭或单位养着：自筹经费、做买卖、募款皆可；建制层面就是匿名市场。',
      ep: 'E05', term: '无母', label: '无母' },
    { at: 3, name: '他父 / 自负', alt: '精神奠基 · 意识形态的极限动员',
      line: '向外做别人的父亲（次要民族、自然他者），或向内自己做自己的父亲——「自负意味着循环，意味着同义反复，其实它是一个非法操作」。',
      ep: 'E05', term: '自负', label: '自负' }
  ];

  function axisX(x) {
    if (x === null || x === undefined || !isFinite(x)) return null;
    var N = global.SHUZHENG_NINE;

    /* 正向：0 / 1 / 2 / >2 */
    if (x >= -0.06) {
      if (x < 0.06) return { side: 'pos', anchor: X_ANCHORS[0], exact: true, x: x };
      if (x < 0.5) return { side: 'pos', between: [X_ANCHORS[0], X_ANCHORS[1]], exact: false, x: x,
        frac: x, lo: X_ANCHORS[0], hi: X_ANCHORS[1] };
      if (x <= 1.5) return { side: 'pos', anchor: X_ANCHORS[1], exact: Math.abs(x - 1) < 0.06, x: x };
      if (x <= 2.5) return { side: 'pos', anchor: X_ANCHORS[2], exact: Math.abs(x - 2) < 0.06, x: x };
      return { side: 'pos', anchor: X_ANCHORS[3], exact: false, x: x };
    }

    /* 负向：九连环的九个环节 */
    var idx = -x;                       // 0..8 对应第 1..9 环
    var lo = Math.floor(idx), hi = Math.ceil(idx);
    var exact = (hi - lo) === 0;
    if (!N) {
      return { side: 'neg', exact: exact, x: x, ring: null, lo: lo + 1, hi: hi + 1 };
    }
    var rings = N.RINGS;
    if (idx >= rings.length - 1 + 0.5) {
      return { side: 'neg', beyond: true, x: x, ring: rings[rings.length - 1] };
    }
    if (exact) {
      return { side: 'neg', exact: true, x: x, ring: rings[lo], ringNo: lo + 1 };
    }
    return {
      side: 'neg', exact: false, x: x,
      loRing: rings[lo], hiRing: rings[Math.min(hi, rings.length - 1)],
      loNo: lo + 1, hiNo: Math.min(hi, rings.length - 1) + 1,
      frac: idx - lo
    };
  }

  /* ---------- 纵轴：活动性质 ---------- */
  function axisY(y, unit) {
    if (y === null || y === undefined || !isFinite(y)) return null;
    unit = unit || 1;
    var u = unit;
    if (Math.abs(y) <= 0.025) {
      return { band: 'axis', name: '对价线上',
        line: '交易与无对价行动的分界。站在线上不进任何一侧，两侧都用它来骂你。',
        ep: 'E12', term: '对价', label: '对价' };
    }
    if (y > u) {
      return { band: 'over', name: '越出一个单元',
        line: '超出单元不是更强，而是换了一种东西：在三角函数那里，它就是统治区间的边界，越界即非法。',
        ep: 'E13', term: '统治区间', label: '统治区间' };
    }
    if (y > 0) {
      return { band: 'give', name: '单元内的无对价行动',
        line: '义务性的、奉献性的、理想性的行动：不计代价，不图报偿。',
        ep: 'E12', term: '无对价', label: '无对价行动' };
    }
    if (y > -u) {
      return { band: 'deal', name: '单元内的对价行动',
        line: '算计与功利：你都对价了，那就是一笔交易——但还在一个单元之内，「你可以有算计，但是你不能太算计」。',
        ep: 'E12', term: '对价行动', label: '对价行动' };
    }
    return { band: 'below', name: '越出单元 · 腐化',
      line: '再往下是腐化、享乐，一直到「物理规则……能量守恒定律」。',
      ep: 'E13', term: '腐化', label: '腐化' };
  }

  /* ---------- 读数 ---------- */
  function read(x, y, ctx) {
    ctx = ctx || {};
    var ax = axisX(x);
    var ay = axisY(y, ctx.unit);
    var subj = byId(SUBJECTS, ctx.subject || 'group');
    return {
      x: x, y: y, ax: ax, ay: ay, subj: subj,
      quad: ctx.quad || null,
      modelId: ctx.modelId, modelType: ctx.modelType || '',
      deriv: ctx.deriv, dExpr: ctx.dExpr || '',
      unit: ctx.unit || 1
    };
  }

  /* 一句话总判：出于〔x〕，在做〔y〕 */
  function headline(r) {
    if (!r.ax || !r.ay) return '（此处无定义）';
    var what;
    if (r.ax.side === 'neg') {
      if (r.ax.beyond) what = '第 9 环之外';
      else if (r.ax.exact) what = '第 ' + r.ax.ringNo + ' 环「' + r.ax.ring.name + '」';
      else what = '「' + r.ax.loRing.name + '」与「' + r.ax.hiRing.name + '」之间';
    } else {
      what = r.ax.anchor ? r.ax.anchor.name : '原点';
      if (r.ax.between) what = '「' + r.ax.between[0].name + '」与「' + r.ax.between[1].name + '」之间';
    }
    return '出于' + what + '，在做' + r.ay.name;
  }

  function row(k, v, why) {
    return '<div class="ro-row"><dt>' + esc(k) + '</dt><dd>' + v
      + (why ? '<span class="why">' + why + '</span>' : '') + '</dd></div>';
  }

  function toHTML(r) {
    var h = '';
    if (!r.ax || !r.ay) {
      return '<div class="ro-block pt-block"><p class="pt-kicker">这个点在说什么</p>'
        + '<p class="pt-head">此处无定义</p>'
        + '<p class="ro-verdict">这一族在这个横坐标上没有取值。换一个位置，或把参数从退化值上调开。</p></div>';
    }

    h += '<div class="ro-block pt-block">'
      + '<p class="pt-kicker">这个点在说什么</p>'
      + '<p class="pt-head">' + esc(headline(r)) + '</p>';

    /* 横轴 */
    var xv, xw;
    if (r.ax.side === 'neg') {
      if (r.ax.beyond) {
        xv = '第 9 环之外';
        xw = '负向已经走到最外一阶（本体论宗教）之外。';
      } else if (r.ax.exact) {
        xv = '第 ' + r.ax.ringNo + ' 环 · ' + r.ax.ring.name;
        xw = r.ax.ring.sub + '。这一环是「' + r.ax.ring.name + '」，' + (r.ax.ringNo === 1
          ? '原点，主体性／纯道德点：只出于自己。'
          : '九连环的第 ' + r.ax.ringNo + ' 环。');
      } else {
        xv = '「' + r.ax.loRing.name + '」与「' + r.ax.hiRing.name + '」之间';
        xw = '离「' + r.ax.loRing.name + '」' + r.ax.frac.toFixed(2) + ' 个环节，离「' + r.ax.hiRing.name + '」'
          + (1 - r.ax.frac).toFixed(2) + '。文稿没有给两环之间的位置命名，本页读作「尚未落到任何一个环节上」<span class="tag tag-add">补</span>。';
      }
    } else {
      xv = r.ax.anchor.name + (r.ax.anchor.alt ? ' · ' + r.ax.anchor.alt : '');
      xw = r.ax.anchor.line;
    }
    h += '<dl class="ro-rows">'
      + row('横轴 · 伦理定位', esc(xv), xw)
      + row('纵轴 · 活动性质', esc(r.ay.name), esc(r.ay.line))
      + (r.quad ? row('象限', esc(r.quad.pos), esc(r.quad.folk)) : '')
      + row('切线 · ' + esc(r.subj.what),
        (r.deriv === null || r.deriv === undefined) ? '无定义' : esc(String(r.dExpr || ('f′ = ' + r.deriv))),
        esc(r.subj.note))
      + (r.modelType ? row('所在函数族', esc(r.modelType),
        '族给出的是这一带的趋势；点是此刻的状态，两者并列。') : '')
      + '</dl>';

    /* 主体的四选一：解释一切线用 */
    h += '<div class="pt-subjects" role="group" aria-label="这个点代表谁">';
    SUBJECTS.forEach(function (s) {
      h += '<button type="button" class="pt-sub" data-subject="' + s.id + '" aria-pressed="'
        + (s.id === r.subj.id ? 'true' : 'false') + '" title="' + esc(s.note) + '">' + esc(s.name) + '</button>';
    });
    h += '</div>';

    /* 出处 */
    var srcs = [];
    if (r.ax.side === 'neg') {
      srcs.push(cite('E08', '九连环', '九连环'));
      srcs.push(cite('E12', '一个政治状态', '一个点＝一个政治状态'));
    } else {
      srcs.push(cite(r.ax.anchor.ep, r.ax.anchor.term, r.ax.anchor.label));
      srcs.push(cite('E12', '伦理轴', '伦理轴'));
    }
    srcs.push(cite(r.ay.ep, r.ay.term, r.ay.label));
    srcs.push(cite('E12', '交往范式', '四种主观状态'));
    h += '<p class="sx-foot">出处：' + srcs.join('　') + '</p></div>';

    return h;
  }

  var API = { SUBJECTS: SUBJECTS, read: read, toHTML: toHTML, axisX: axisX, axisY: axisY, headline: headline };
  global.SHUZHENG_POINT = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof globalThis !== 'undefined' ? globalThis : this);
