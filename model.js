/* 庶政学 · 数理政治哲学标准模型（MPP）
   把文稿里的函数族做成可拨动的光谱仪器。

   文稿给出的运算：一个政治模型是四重的（意识形态 / 政治观 / 政治立场 / 政治路线），
   “一求导就是意识形态化”。本文件把两条运算链实现为：
       政治观  f(x)          --求导-->  意识形态  f′(x)
       政治立场 f⁻¹(x)       --求导-->  政治路线  (f⁻¹)′(x)
   反函数读法是本页的补足，文稿只写了“对政治观做函数运算得到意识形态，
   对政治立场做函数运算得到政治路线”，并反复强调函数族互为反函数。
   凡补足处，界面标〔补〕。 */

(function (global) {
  'use strict';

  /* ---------- 画布侧调色板（对应 styles.css 中的 oklch 值） ---------- */
  var PAL = {
    bg: '#141110', bg2: '#1e1a18', bg3: '#262120',
    line: '#3b3431', lineSoft: '#2b2624',
    ink: '#f2ece4', ink2: '#c3bab0', ink3: '#8f867c',
    curve: '#f0e8db',
    program: '#e5a63f', action: '#5fc6b6', ideology: '#b39ceb',
    violence: '#ea6ba6', custom: '#a89f95'
  };

  var MINUS = '\u2212';

  function fmt(v, d) {
    if (typeof d !== 'number') d = 2;
    if (v === null || v === undefined || (typeof v === 'number' && Number.isNaN(v))) return '无定义';
    if (!isFinite(v)) return v > 0 ? '+∞' : MINUS + '∞';
    var s = Math.abs(v).toFixed(d);
    if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
    if (s === '') s = '0';
    return (v < 0 ? MINUS : '') + s;
  }

  function num(v) { return typeof v === 'number' && isFinite(v) ? v : null; }

  /* 象限与单元性：文稿的通俗读法 */
  function quadrant(x, y) {
    var right = x > 0, up = y > 0;
    if (right && up) return { pos: '右上', axis: '有纲领 · 无对价行动', folk: '深谋远虑，很有计划很有方向；也可能就是判刑' };
    if (right && !up) return { pos: '右下', axis: '有纲领 · 对价行动', folk: '算计、功利主义' };
    if (!right && up) return { pos: '左上', axis: '无纲领 · 无对价行动', folk: '圣人，不计代价的善' };
    return { pos: '左下', axis: '无纲领 · 对价行动', folk: '庸俗，腐化，市侩' };
  }

  function unitReading(y) {
    var a = Math.abs(y);
    if (a > 1.0001) return '越出一个单元。在这个体系里，超过单元的善与自私都不再被承认为那个东西本身，在三角函数那里它就是统治区间的边界，越界即非法。';
    if (a >= 0.9999) return '正好一个单元：可计量、有理、合格。文稿里“尽量可以计量为一的行动”就是这一档。';
    if (a === 0) return '行动为零：纲领存在与否都不产生无对价行动。';
    return '不足一个单元：可计量但没有成型。';
  }

  /* ---------- 函数族 ---------- */
  var MODELS = [
    {
      id: 'power', family: '幂函数', name: '幂函数', group: '幂 · 指 · 对',
      expr: 'y = x^a', exprHTML: 'y = x<sup>a</sup>',
      param: {
        key: 'a', min: -2, max: 3, step: 0.1, value: 2, label: '指数 a',
        note: '指数 a 是纲领到行动的传导强度。纲领的内容不进模型，进的只是这个强度。',
        presets: [{ v: 1, label: 'y=x' }, { v: 2, label: 'y=x²' }, { v: 3, label: 'y=x³' }, { v: 0.5, label: 'y=√x' }, { v: -1, label: 'y=1/x' }]
      },
      domain: function (x, p) { return x >= 0 || Number.isInteger(p.a); },
      f: function (x, p) { return Math.pow(x, p.a); },
      df: function (x, p) { return p.a * Math.pow(x, p.a - 1); },
      dExpr: function (p) { return 'f′(x) = ' + fmt(p.a, 1) + ' x^(' + fmt(p.a - 1, 1) + ')'; },
      inv: function (x, p) { return x >= 0 ? Math.pow(x, 1 / p.a) : NaN; },
      dinv: function (x, p) { return x > 0 ? (1 / p.a) * Math.pow(x, 1 / p.a - 1) : NaN; },
      invExpr: function (p) { return 'f⁻¹(x) = x^(1/' + fmt(p.a, 1) + ')'; },
      probe: 1,
      keys: function (p) {
        var k = [{ x: 1, y: 1, label: '机械和谐点 (1,1)' }];
        if (p.a > 0) k.push({ x: 0, y: 0, label: '原点 (0,0)' });
        return k;
      },
      type: '机械和谐 · 古典（经典）理性主义',
      quotes: [
        '“它一定会过一一点……我们把它看成是个和谐点，或者他是个机械的和谐点。”',
        '“我良好的单元性的纲领，意味着良好的单元性的行动。”“这里面的立场都是古典理性主义的立场。”',
        '“Y 等于 LNX，然后给它求导 Y 等于 X 分之一……那么什么叫求导，求导就是意识形态化。”',
        '“它相当于他给你的积极分子一个手册，告诉你：我有一份纲领，那你就在你的现实当中就会有一份好的、标准的行动。”'
      ],
      derivNote: '幂函数求导降一次幂：机械和谐的对应关系被意识形态化之后，剩下的是一份可计量的因果强度。文稿用它反过来说明幂函数并非原初：ln x 求导得 1/x，所以 1/x 这一族是派生出来的。这一支作者另给了名字：另一种「拼盘化的政治意识形态」，早已有之——「就斯宾塞主义」。',
      read: function (x, y, p) {
        if (x < 0) return '习俗化侧。不做纲领，行动照样按同一幂次从习俗里长出来，这是把习俗当成天然正当。';
        if (x === 0) return '原点。纲领为零，行动也为零：这一族认为纲领是行动的唯一来源。';
        if (x > 1) return p.a > 1
          ? '纲领已过一个单元，行动超线性放大。乐观的一段，也是判刑风险最大的一段：又有纲领又有行动，还有组织化。'
          : '纲领过了一个单元，行动按次幂缓慢跟进：单元性的纲领只带来勉强称得上单元的行动。';
        return '纲领不足一个单元，行动被压得比纲领更小：还没有成型的计划带不出可计量的行动。';
      }
    },

    {
      id: 'log', family: '对数函数', name: '对数函数', group: '幂 · 指 · 对',
      expr: 'y = log_a x', exprHTML: 'y = log<sub>a</sub> x',
      param: {
        key: 'a', min: 0.3, max: 12, step: 0.05, value: 2.7, label: '底数 a',
        note: '底是教育、教化的单元性。底为有理、为整数时，行动保持有理、可计量；a = 1 时这一族不成立。',
        presets: [{ v: 2, label: 'a=2' }, { v: 2.718281828459045, label: 'a=e' }, { v: 10, label: 'a=10' }, { v: 0.5, label: 'a=0.5' }]
      },
      domain: function (x, p) { return x > 0 && Math.abs(p.a - 1) > 1e-6; },
      f: function (x, p) { return Math.log(x) / Math.log(p.a); },
      df: function (x, p) { return 1 / (x * Math.log(p.a)); },
      dExpr: function (p) { return 'f′(x) = 1 / (x · ln ' + fmt(p.a, 2) + ')'; },
      inv: function (x, p) { return Math.pow(p.a, x); },
      dinv: function (x, p) { return Math.log(p.a) * Math.pow(p.a, x); },
      invExpr: function (p) { return 'f⁻¹(x) = ' + fmt(p.a, 2) + '^x'; },
      probe: 1.8,
      keys: function () { return [{ x: 1, y: 0, label: '理性主义点 (1,0)' }]; },
      type: '康德式理性主义 · 启蒙化的保守主义（现代保守）',
      quotes: [
        '“有单元性的一个纲领的状态，反而是无行动的。”',
        '“这是一种理性主义……康德式的：你知道足够多，但是你可以不做事情……你需要知道的多，但是你可以要服从。”',
        '“后面那个计较就是说你要做任何事，就是一种功利主义。”“这个是一种现代保守，刚刚那个讲的是一种前现代保守。”'
      ],
      derivNote: '对数求导落回 1/x 一侧，也就是幂函数那一族：文稿据此说幂函数是派生性的，对数函数更原始。',
      read: function (x, p) {
        if (x <= 0) return '定义域之外：这一族认为纲领必须先存在（x > 0），否则连立场都无从谈起。';
        if (Math.abs(x - 1) < 1e-9) return '(1,0)：有单元性的纲领，行动读数为零。文稿把这一点读作康德式的服从，知道得够多就可以不做。';
        if (x > 1) return '纲领超过一个单元，读数才转正：知道得足够多之后，活动才变成可计量的对价行动，即功利主义的一侧。';
        return '纲领不足一个单元时读数为负：这一侧是要服从、要计较，行动的正当性不在行动本身，而在它所对的价格。';
      }
    },

    {
      id: 'exp', family: '指数函数', name: '指数函数', group: '幂 · 指 · 对',
      expr: 'y = a^x', exprHTML: 'y = a<sup>x</sup>',
      param: {
        key: 'a', min: 0.3, max: 3, step: 0.05, value: 2, label: '底数 a',
        note: '底大于一时是进步主义与乐观主义；底为 e 时是自然状态，求导还是它自己。',
        presets: [{ v: 2, label: 'a=2' }, { v: 2.718281828459045, label: 'a=e' }, { v: 1.5, label: 'a=1.5' }, { v: 0.5, label: 'a=0.5' }]
      },
      domain: function () { return true; },
      f: function (x, p) { return Math.pow(p.a, x); },
      df: function (x, p) { return Math.log(p.a) * Math.pow(p.a, x); },
      dExpr: function (p) { return p.a === Math.E ? 'f′(x) = e^x（还是它自己）' : 'f′(x) = ln ' + fmt(p.a, 2) + ' · ' + fmt(p.a, 2) + '^x'; },
      inv: function (x, p) { return x > 0 ? Math.log(x) / Math.log(p.a) : NaN; },
      dinv: function (x, p) { return x > 0 ? 1 / (x * Math.log(p.a)) : NaN; },
      invExpr: function (p) { return 'f⁻¹(x) = log_' + fmt(p.a, 2) + ' x'; },
      probe: 0.8,
      keys: function () { return [{ x: 0, y: 1, label: '无纲领状态下的单元行动 (0,1)' }]; },
      type: '前现代保守 · a > 1 时的进步主义 · a = e 的自然状态',
      quotes: [
        '“当 X 等于零的时候，当人处于无纲领状态的时候……才会有单元性的行动，而且才是有理的行动。”',
        '“指数函数它会是一种天然的具有某种保守性……他对于纲领是具有某种怀疑的。”',
        '“它也是一种乐观主义，也是一种进步主义。”“Y 等于 E 的 X 次方的时候，它就会一种自然状态。”',
        '“它是一个没有意识形态状态，或者说它的意识形态就是他自己。”'
      ],
      derivNote: 'e^x 求导还是它自己。文稿说这是无意识形态状态，意识形态就是它自己；底里有 e，等于底里带了一层带象征的自然习俗性秩序。',
      read: function (x, p) {
        if (Math.abs(x) < 1e-9) return '(0,1)：无纲领状态下的单元行动。文稿说这是天然的行动能力，不需要纲领在场，所以它对纲领抱有怀疑。';
        if (x > 0) return p.a > 1
          ? '纲领为正时行动指数增长：整数底上的进步主义与乐观主义，纲领越好，行动越好得越快。'
          : '底小于一：纲领增加而行动衰减，这是把纲领当成对自然状态的破坏。';
        return '纲领为负，也就是无纲领、习俗状态的一侧，行动仍保持一个单元以上：文稿把这一侧读作前现代保守的天然正当。';
      }
    },

    {
      id: 'cos', family: '三角函数（余弦）', name: '余弦', group: '三角与反三角',
      expr: 'y = cos x', exprHTML: 'y = cos x',
      param: null,
      domain: function () { return true; },
      f: function (x) { return Math.cos(x); },
      df: function (x) { return -Math.sin(x); },
      dExpr: function () { return 'f′(x) = ' + MINUS + 'sin x'; },
      inv: function (x) { return Math.abs(x) <= 1 ? Math.acos(x) : NaN; },
      dinv: function (x) { return Math.abs(x) < 1 ? -1 / Math.sqrt(1 - x * x) : NaN; },
      invExpr: function () { return 'f⁻¹(x) = arccos x　(|x| ≤ 1)'; },
      probe: 0.9, range: true,
      keys: function () {
        return [
          { x: 0, y: 1, label: '朴素道德点 (0,1)' },
          { x: Math.PI / 2, y: 0, label: '零行动点 (π/2, 0)' },
          { x: Math.PI, y: -1, label: '反向的一个单元 (π, −1)' }
        ];
      },
      type: '统治区间内的周期性 · 文稿读作新自由主义保守主义 · 成熟稳重的政治家（政客）',
      quotes: [
        '“他是个道德主义点，或者叫一种原始原初的道德点，朴素道德点。”',
        '“这个函数把政治活动的运行区间限制在一和一之间。”“所以三角函数一般可以看成是统治区间。”',
        '“他无法出去，出去的话，那就是非法的。”“你社会当中会有善人啊，但是你不能超过一个单元。”',
        '“他可以看成是一种新自由主义保守主义。”'
      ],
      derivNote: '余弦求导是负的正弦：道德点被意识形态化之后，剩下的是对纲领的负响应。',
      read: function (x) {
        return '值域锁在 −1 与 1 之间：社会承认的善与自私各不超过一个单元。走到 π/2 时无对价行动归零，走到 π 时是反向的一个单元。周期 2π，这就是统治状况的周期性循环。';
      }
    },

    {
      id: 'tan', family: '三角函数（正切）', name: '正切', group: '三角与反三角',
      expr: 'y = tan x', exprHTML: 'y = tan x',
      param: null,
      domain: function (x) { return Math.abs(Math.cos(x)) > 1e-8; },
      f: function (x) { return Math.tan(x); },
      df: function (x) { return 1 / Math.pow(Math.cos(x), 2); },
      dExpr: function () { return 'f′(x) = 1 / cos²x'; },
      inv: function (x) { return Math.atan(x); },
      dinv: function (x) { return 1 / (1 + x * x); },
      invExpr: function () { return 'f⁻¹(x) = arctan x'; },
      probe: 0.7, parallax: true,
      keys: function () { return [{ x: 0, y: 0, label: '行动为零的对称中心 (0,0)' }]; },
      type: '断裂性政治（如托洛茨基主义） · 左翼的视差机制',
      quotes: [
        '“当然有断裂性的……比如说托洛茨基主义或者说某些主义啊，就可以在这样的图景当中来加以评价。”',
        '“左翼意识形态的特点，就是说不认为自己是一个图像的图像。”',
        '“别人看他和他看自己不一样，他不认同别人那样看他……意味着一个视差。”'
      ],
      derivNote: '正切的导数恒不小于一个单元，断裂两侧的响应强度永不衰减：靠近断裂带，行动的增长没有上限。',
      read: function (x, y) {
        if (Math.abs(x - Math.PI / 2) < 0.12 || Math.abs(x + Math.PI / 2) < 0.12) {
          return '正在逼近断裂带：从阶级敌人的视角看，这里只是曲线陡了一点；从它自己的视角看，这里是不得不分裂的地方。';
        }
        return '同一个图形有两种读法。保守视角看到的是围绕 (0,0) 的中心对称，一条连续甚至虚伪地对称的曲线；它自己看到的是两极的极端对立。这就是文稿的视差。';
      }
    },

    {
      id: 'arctan', family: '反三角函数（反正切）', name: '反正切', group: '三角与反三角',
      expr: 'y = arctan x', exprHTML: 'y = arctan x',
      param: null,
      domain: function () { return true; },
      f: function (x) { return Math.atan(x); },
      df: function (x) { return 1 / (1 + x * x); },
      dExpr: function () { return 'f′(x) = 1 / (1 + x²)'; },
      inv: function (x) { return Math.tan(x); },
      dinv: function (x) { return 1 / Math.pow(Math.cos(x), 2); },
      invDomain: function (x) { return Math.abs(x) < Math.PI / 2 - 0.03; },
      invExpr: function () { return 'f⁻¹(x) = tan x　(|x| < π/2)'; },
      probe: 1,
      keys: function () { return [{ x: 0, y: 0, label: '原点 (0,0)' }]; },
      bounds: function () { return [{ y: Math.PI / 2, label: '+π/2 纲领性边界' }, { y: -Math.PI / 2, label: '−π/2 纲领性边界' }]; },
      type: '纲领性的边界 · 人为周期对自然周期',
      quotes: [
        '“纲领性的边界。”“他是用政治计划，明确的政治计划，理性的纲领性的政治计划来为政治活动、政治路线设定边界。”',
        '“我们会制定五年计划，而不是说顺应经济的自然周期。”“我们会逆周期。”',
        '“自然周期所带来的断裂，人为周期所带来的断裂。”'
      ],
      derivNote: '导数随纲领增加而衰减到零：纲领越靠右，路线对纲领的响应越小。计划把行动锁进了它自己设定的边界。',
      read: function (x, y) {
        if (Math.abs(y) > 1.2) return '已经贴住纲领性的边界 ±π/2：这里不是自然周期的转折，而是政治计划给活动划出的上限。';
        return '反三角函数把活动挤进一条越来越平的带子：这是人为周期，边界由纲领设定，而不是由经济自然周期设定。';
      }
    },

    {
      id: 'arcsin', family: '反三角函数（反正弦）', name: '反正弦', group: '三角与反三角',
      expr: 'y = arcsin x', exprHTML: 'y = arcsin x',
      param: null,
      domain: function (x) { return Math.abs(x) <= 1 + 1e-9; },
      f: function (x) { return Math.asin(Math.max(-1, Math.min(1, x))); },
      df: function (x) { return Math.abs(x) < 1 ? 1 / Math.sqrt(1 - x * x) : NaN; },
      dExpr: function () { return 'f′(x) = 1 / √(1 ' + MINUS + ' x²)'; },
      inv: function (x) { return Math.sin(x); },
      dinv: function (x) { return Math.cos(x); },
      invExpr: function () { return 'f⁻¹(x) = sin x'; },
      probe: 0.5,
      keys: function () { return [{ x: 0, y: 0, label: '原点 (0,0)' }, { x: 1, y: Math.PI / 2, label: '定义域的尽头 (1, π/2)' }]; },
      type: '纲领性边界写在定义域里',
      quotes: [
        '“纲领性的边界。”',
        '“他不能超出去，他无法出去，出去的话，那就是非法的。”'
      ],
      derivNote: '越接近定义域的尽头，导数越发散：逼近纲领性边界时，路线对纲领的响应失去控制。',
      read: function (x) {
        if (Math.abs(x) > 0.92) return '贴近定义域的尽头：纲领再往右一步，函数干脆没有定义。这是把非法写成定义域的空集。';
        return '定义域本身就是纲领的边界：|x| ≤ 1。活动在边界内越来越陡，越靠近边界越不可控。';
      }
    },

    {
      id: 'const', family: '常数函数', name: '常数函数', group: '不变量',
      expr: 'y = c', exprHTML: 'y = c',
      param: {
        key: 'c', min: -1.2, max: 1.2, step: 0.05, value: 0.5, label: '常数 c',
        note: '常数的高度就是习俗的强度。它对纲领完全不响应。',
        presets: [{ v: 0, label: 'c=0' }, { v: 0.5, label: 'c=0.5' }, { v: 1, label: 'c=1' }, { v: -0.5, label: 'c=−0.5' }]
      },
      domain: function () { return true; },
      f: function (x, p) { return p.c; },
      df: function () { return 0; },
      dExpr: function () { return 'f′(x) = 0'; },
      inv: null,
      dinv: null,
      invExpr: function () { return 'f⁻¹ 不存在：习俗没有反演'; },
      probe: 1, curveColor: PAL.custom,
      keys: function () { return []; },
      type: '习俗',
      quotes: [
        '“他就是一个习俗。”“意识形态和政治立场统一……这两个函数它取导数是同一的。”'
      ],
      derivNote: '常数函数求导归零：习俗被意识形态化之后不留下方向。作者据此说意识形态与政治立场统一——但他自己加了限定：“当然这都是假设”，讲义另标〔疑：所指不明〕。本页不把它写成已成立的规则。',
      read: function () {
        return '整条线对纲领毫无响应：浑浑噩噩的规则。文稿在此说意识形态与政治立场统一，两种运算读不出差别。';
      }
    }
  ];

  function modelById(id) {
    for (var i = 0; i < MODELS.length; i++) if (MODELS[i].id === id) return MODELS[i];
    return MODELS[0];
  }

  /* ---------- 状态 ---------- */
  var state = {
    id: 'power',
    params: {},
    deriv: false,
    inverse: false,
    parallax: false,
    violence: false,
    nine: false,
    subject: 'group',
    probeX: null,
    pinned: false,
    dragging: false,
    /* 专家策略系统的选择空间 */
    lenses: (global.SHUZHENG_STRATEGY ? global.SHUZHENG_STRATEGY.lensDefaults() : { stance: true, line: true }),
    unit: 1,
    horizon: 'now',
    persona: 'commoner'
  };

  MODELS.forEach(function (m) {
    state.params[m.id] = {};
    if (m.param) state.params[m.id][m.param.key] = m.param.value;
  });

  function paramsOf(m) { return state.params[m.id]; }
  function evalAt(m, fn, x) {
    try {
      var p = paramsOf(m);
      if (!m.domain(x, p)) return null;
      var y = fn.call(m, x, p);
      return num(y);
    } catch (e) { return null; }
  }

  /* ---------- 诊断：四重性 ---------- */
  function diagnose(m, x) {
    var p = paramsOf(m);
    var view = evalAt(m, m.f, x);
    var ideo = evalAt(m, m.df, x);
    var stance = m.inv ? num(m.inv.call(m, x, p)) : null;
    var line = m.dinv ? num(m.dinv.call(m, x, p)) : null;
    return { x: x, view: view, ideo: ideo, stance: stance, line: line };
  }

  /* ---------- 策略系统的上下文 ---------- */
  function secondDerivAt(m, x) {
    var h = 1e-3;
    var a = evalAt(m, m.f, x - h), b = evalAt(m, m.f, x), c = evalAt(m, m.f, x + h);
    if (a === null || b === null || c === null) return null;
    return (c - 2 * b + a) / (h * h);
  }

  function spanOf(m, p) {
    if (m.id === 'cos') return 1;
    if (m.id === 'arcsin' || m.id === 'arctan') return Math.PI / 2;
    if (m.id === 'const') return Math.abs(p.c);
    return null;
  }

  function brokennessAt(m, x, d) {
    var p = paramsOf(m);
    var eps = 0.06;
    if (!m.domain(x + eps, p) || !m.domain(x - eps, p)) return true;
    if (d !== null && Math.abs(d) > 6) return true;
    return false;
  }

  function strategyCtx(m, x, y, dg) {
    var p = paramsOf(m);
    var q = quadrant(x, y);
    return {
      id: m.id, family: m.family, x: x, y: y, d: dg.ideo, d2: secondDerivAt(m, x),
      inv: dg.stance, invd: dg.line,
      unit: state.unit, horizon: state.horizon, span: spanOf(m, p),
      persona: state.persona,
      broken: brokennessAt(m, x, dg.ideo),
      quad: q.pos + ' · ' + q.folk,
      lenses: state.lenses
    };
  }

  var API = {
    MODELS: MODELS, PAL: PAL, state: state, fmt: fmt,
    modelById: modelById, paramsOf: paramsOf, diagnose: diagnose,
    quadrant: quadrant, unitReading: unitReading, evalAt: evalAt
  };
  global.ShuzhengModel = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }

  /* ================= 界面 ================= */
  function init() {
    var canvas = document.getElementById('plot');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    var W = 0, H = 0, scale = 1, ox = 0, oy = 0, yMax = 3;
    var halfX = 5;
    var raf = null;
    var animStart = null, animDur = 0;
    var dpr = 1;

    var X = function (x) { return ox + x * scale; };
    var Y = function (y) { return oy - y * scale; };
    var invX = function (px) { return (px - ox) / scale; };

    function ease(t) { return 1 - Math.pow(1 - t, 5); }

    function layout() {
      dpr = Math.min(global.devicePixelRatio || 1, 2);
      var rect = canvas.getBoundingClientRect();
      var w = Math.max(320, Math.round(rect.width));
      var h = Math.max(260, Math.round(rect.height));
      // 尺寸没变就不要重设 canvas.width/height：赋值本身会清空画布，
      // 而画布的固有尺寸又会反过来影响布局，ResizeObserver 会因此自激，
      // 右栏一长就变成「一直清屏、一直画不出来」。
      if (w === W && h === H && canvas.width && canvas.height) return;
      W = w;
      H = h;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scale = W / (2 * halfX);
      ox = W / 2; oy = H / 2;
      yMax = (H / 2) / scale;
    }

    /* 九连环那一层要把 9 个环节摆到负向 X 轴上，需要把横向视野放到 ±9；关掉就回到 ±5 */
    function applyHalfX() {
      var want = state.nine ? 9 : 5;
      if (halfX === want) return;
      halfX = want;
      W = -1; H = -1;          // 逼 layout() 重算，否则尺寸未变会被早退挡住
      layout();
      requestFrame();
    }

    /* 画布下方的图注：九连环模式下把九个环名排成一行（画布上只留环号） */
    var capEl = document.getElementById('plotCaption');
    function syncCaption() {
      if (!capEl) return;
      var N = global.SHUZHENG_NINE;
      if (state.nine && N) {
        capEl.hidden = false;
        capEl.innerHTML = '九环（负向 X 轴，左为最外一阶）：' + N.RINGS.slice().reverse().map(function (r) {
          return '<b>' + r.no + '</b> ' + r.name;
        }).join(' · ');
      } else {
        capEl.hidden = true;
        capEl.innerHTML = '';
      }
    }

    /* ---- 取样：按像素列取，遇间断就断开 ---- */
    function segments(m, fn, domainFn) {
      var segs = [], cur = null, p = paramsOf(m);
      var lim = yMax * 3;
      var ok = domainFn || function (x) { return m.domain(x, p); };
      for (var px = 0; px <= W; px += 1) {
        var x = invX(px);
        var y = null;
        if (ok(x)) {
          try { y = num(fn.call(m, x, p)); } catch (e) { y = null; }
        }
        if (y !== null && Math.abs(y) <= lim) {
          if (!cur) { cur = []; segs.push(cur); }
          cur.push([px, Y(y)]);
        } else {
          cur = null;
        }
      }
      return segs;
    }

    /* ---- 绘制 ---- */
    function drawGrid() {
      ctx.save();
      // 单元性区间
      var m = modelById(state.id);
      var bandTop = Y(1), bandBot = Y(-1);
      if (m.range) {
        ctx.fillStyle = 'rgba(95,198,182,0.07)';
        ctx.fillRect(0, bandTop, W, bandBot - bandTop);
      }
      ctx.strokeStyle = PAL.lineSoft;
      ctx.lineWidth = 1;
      ctx.font = '11px ' + FONT;
      ctx.fillStyle = PAL.ink3;
      for (var gx = Math.ceil(-halfX); gx <= halfX; gx++) {
        if (gx === 0) continue;
        ctx.beginPath(); ctx.moveTo(X(gx), 0); ctx.lineTo(X(gx), H); ctx.stroke();
      }
      var gyStep = yMax > 4 ? 2 : 1;
      for (var gy = -Math.ceil(yMax / gyStep) * gyStep; gy <= yMax; gy += gyStep) {
        if (Math.abs(gy) < 1e-9) continue;
        ctx.beginPath(); ctx.moveTo(0, Y(gy)); ctx.lineTo(W, Y(gy)); ctx.stroke();
        // 四角留给轴名，贴边的刻度不标
        if (Math.abs(gy) <= yMax - 0.15 && Y(gy) > 42 && Y(gy) < H - 50) {
          ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
          ctx.fillText(fmt(gy, 0), 4, Y(gy) - 3);
        }
      }
      // 单元线
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = PAL.line;
      [1, -1].forEach(function (u) {
        ctx.beginPath(); ctx.moveTo(0, Y(u)); ctx.lineTo(W, Y(u)); ctx.stroke();
      });
      ctx.setLineDash([]);
      // 轴
      ctx.strokeStyle = PAL.ink3;
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(W, oy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ox, 0); ctx.lineTo(ox, H); ctx.stroke();
      // 刻度与常数
      ctx.font = '11px ' + FONT;
      ctx.fillStyle = PAL.ink3;
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      for (var tx = Math.ceil(-halfX); tx <= halfX; tx++) {
        if (tx === 0) continue;
        if (X(tx) < 16 || X(tx) > W - 16) continue;
        // 九连环模式下，负向刻度让位给环号（环自己带号），否则两套数字打架
        if (state.nine && tx < 0) continue;
        ctx.fillText(fmt(tx, 0), X(tx), oy + 5);
      }
      [[1, '1'], [Math.E, 'e'], [Math.PI, 'π']].forEach(function (pair) {
        var cx = X(pair[0]);
        ctx.strokeStyle = PAL.ink3;
        ctx.beginPath(); ctx.moveTo(cx, oy - 4); ctx.lineTo(cx, oy + 4); ctx.stroke();
        ctx.fillStyle = pair[0] === 1 ? PAL.ink3 : PAL.program;
        ctx.font = 'italic 12px ' + FONT;
        ctx.fillText(pair[1], cx, oy + 6);
      });
      ctx.restore();
    }

    var FONT = '"Segoe UI", "Microsoft YaHei", system-ui, sans-serif';
    var MONO = '"Cascadia Code", Consolas, ui-monospace, monospace';

    function labelChip(text, x, y, align, baseline, color, font) {
      ctx.save();
      ctx.font = font;
      var w = ctx.measureText(text).width;
      var pad = 5, h = 16;
      var bx = align === 'left' ? x - pad : (align === 'right' ? x - w - pad : x - w / 2 - pad);
      var by = baseline === 'top' ? y - 2 : (baseline === 'bottom' ? y - h + 2 : y - h / 2);
      ctx.fillStyle = 'rgba(20,17,16,0.85)';
      ctx.fillRect(bx, by, w + pad * 2, h);
      ctx.fillStyle = color;
      ctx.textAlign = align; ctx.textBaseline = baseline;
      ctx.fillText(text, x, y);
      ctx.restore();
    }

    function drawAxisWords(m) {
      var f12 = '12px ' + FONT, f11 = '11px ' + FONT;
      // 纵轴
      labelChip('\u2191 无对价行动（不计代价）', 10, 12, 'left', 'top', PAL.action, f12);
      labelChip('\u2193 有对价行动（计较利害）', 10, H - 10, 'left', 'bottom', PAL.action, f12);
      labelChip('\u2193 腐化 · 享乐 · 自然法则', 10, H - 30, 'left', 'bottom', PAL.ink3, f11);
      // 横轴
      labelChip('\u2190 习俗化 · 去纲领化', 12, oy - 13, 'left', 'middle', PAL.program, f12);
      if (m.range) {
        labelChip('统治区间 \u22121 \u2264 y \u2264 1', W - 12, bandMid(), 'right', 'middle', 'rgba(95,198,182,0.85)', f11);
      }
    }

    function bandMid() { return (Y(1) + Y(-1)) / 2; }

    function drawCurve(segs, color, width, dash, progress, glow) {
      ctx.save();
      if (dash) ctx.setLineDash(dash);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      if (glow) { ctx.shadowColor = color; ctx.shadowBlur = 12; }
      var cut = progress === undefined ? Infinity : progress * (W + 40);
      for (var i = 0; i < segs.length; i++) {
        var seg = segs[i];
        ctx.beginPath();
        var started = false;
        for (var j = 0; j < seg.length; j++) {
          if (seg[j][0] > cut) break;
          if (!started) { ctx.moveTo(seg[j][0], seg[j][1]); started = true; }
          else ctx.lineTo(seg[j][0], seg[j][1]);
        }
        if (started) ctx.stroke();
      }
      ctx.restore();
    }

    function drawKeyPoints(m) {
      var p = paramsOf(m);
      var ks = m.keys(p) || [];
      ctx.save();
      ctx.font = '11px ' + FONT;
      ks.forEach(function (k) {
        var px = X(k.x), py = Y(k.y);
        ctx.fillStyle = PAL.bg;
        ctx.strokeStyle = PAL.curve;
        ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(px, py, 3.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        // 标牌
        ctx.font = '11px ' + FONT;
        var w = ctx.measureText(k.label).width + 12;
        var bx = px + 10, by = py - 10;
        if (bx + w > W - 6) bx = px - 10 - w;
        if (by - 18 < 2) by = py + 20;
        ctx.fillStyle = 'rgba(20,17,16,0.88)';
        ctx.fillRect(bx, by - 15, w, 18);
        ctx.fillStyle = PAL.ink2;
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText(k.label, bx + 6, by - 5);
      });
      ctx.restore();
    }

    function drawBounds(m) {
      if (!m.bounds) return;
      ctx.save();
      ctx.setLineDash([4, 5]);
      ctx.strokeStyle = PAL.ideology;
      ctx.lineWidth = 1;
      ctx.font = '11px ' + FONT;
      ctx.fillStyle = PAL.ideology;
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      m.bounds().forEach(function (b) {
        if (Math.abs(b.y) > yMax) return;
        ctx.beginPath(); ctx.moveTo(0, Y(b.y)); ctx.lineTo(W, Y(b.y)); ctx.stroke();
        ctx.fillText(b.label, W - 12, Y(b.y) - 9);
      });
      ctx.restore();
    }

    function drawProbe(m) {
      var x = state.probeX;
      if (x === null || x === undefined) return;
      var y = evalAt(m, m.f, x);
      ctx.save();
      if (y !== null) {
        var px = X(x), py = Y(y);
        ctx.setLineDash([3, 4]);
        ctx.strokeStyle = 'rgba(242,236,228,0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(px, oy); ctx.lineTo(px, py); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ox, py); ctx.lineTo(px, py); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = PAL.ink;
        ctx.beginPath(); ctx.arc(px, py, 4.5, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = PAL.bg; ctx.lineWidth = 1.5; ctx.stroke();
        // 读数
        var label = '(' + fmt(x) + ', ' + fmt(y) + ')';
        ctx.font = '12px ' + MONO;
        var w = ctx.measureText(label).width + 14;
        var nearKey = false;
        try {
          var p = paramsOf(m);
          (m.keys(p) || []).forEach(function (k) { if (Math.abs(k.x - x) < 0.28) nearKey = true; });
        } catch (e) { }
        var bx = px + 12, by = nearKey ? py + 14 : py - 30;
        if (bx + w > W - 6) bx = px - 12 - w;
        if (by < 4) by = py + 16;
        if (by + 20 > H - 4) by = py - 30;
        ctx.fillStyle = 'rgba(38,33,32,0.95)';
        ctx.fillRect(bx, by, w, 20);
        ctx.strokeStyle = PAL.line; ctx.strokeRect(bx, by, w, 20);
        ctx.fillStyle = PAL.ink;
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText(label, bx + 7, by + 10);
      } else {
        ctx.font = '12px ' + FONT;
        ctx.fillStyle = PAL.ink3;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('此处无定义', X(x), oy + 40);
      }
      ctx.restore();
    }

    function drawParallax(m) {
      if (!m.parallax || !state.parallax) return;
      ctx.save();
      // 断裂带
      ctx.setLineDash([2, 5]);
      ctx.strokeStyle = 'rgba(234,107,166,0.75)';
      ctx.lineWidth = 1.2;
      [-Math.PI / 2, Math.PI / 2].forEach(function (ax) {
        ctx.beginPath(); ctx.moveTo(X(ax), 0); ctx.lineTo(X(ax), H); ctx.stroke();
      });
      ctx.setLineDash([]);
      ctx.font = '11px ' + FONT;
      ctx.fillStyle = PAL.violence;
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText('断裂', X(-Math.PI / 2), H - 4);
      ctx.fillText('断裂', X(Math.PI / 2), H - 4);
      // 两极
      labelChip('自我视角：两块互不连续的图像，两极极端对立', 12, 46, 'left', 'top', PAL.violence, '11px ' + FONT);
      ctx.restore();
    }

    function drawSymmetry(m) {
      if (!m.parallax || state.parallax) return;
      ctx.save();
      ctx.strokeStyle = 'rgba(143,134,124,0.8)';
      ctx.setLineDash([3, 4]);
      ctx.lineWidth = 1;
      [0.6, 1.1].forEach(function (x) {
        var y = Math.tan(x);
        if (Math.abs(y) > yMax) return;
        ctx.beginPath(); ctx.moveTo(X(x), Y(y)); ctx.lineTo(X(-x), Y(-y)); ctx.stroke();
      });
      ctx.setLineDash([]);
      labelChip('阶级敌人视角：围绕 (0,0) 的中心对称，一条连续的曲线', 12, 46, 'left', 'top', PAL.ink3, '11px ' + FONT);
      ctx.restore();
    }

    /* 第三轴＝虚数轴＝暴力。E13 说加上它「它就是权力的模型」「他就是权力学」，
       但作者自陈这一层本讲没做。E02 给出权力的三条基本性质，正是这一层的展开；
       三条性质分别读纵轴、横轴与第三轴本身，画法与读数都在 power.js 里。 */
    function drawViolence() {
      if (!state.violence) return;
      var PW = global.SHUZHENG_POWER;
      if (!PW) return;
      PW.paint(ctx, {
        X: X, Y: Y, W: W, H: H, ox: ox, oy: oy, yMax: yMax,
        PAL: PAL, FONT: FONT, labelChip: labelChip
      }, state.unit);
    }

    function drawNine() {
      if (!state.nine) return;
      var N = global.SHUZHENG_NINE;
      if (!N) return;
      N.paint(ctx, {
        X: X, Y: Y, W: W, H: H, ox: ox, oy: oy, yMax: yMax,
        PAL: PAL, FONT: FONT, labelChip: labelChip
      });
    }

    function draw(ts) {
      var m = modelById(state.id);
      var progress = 1;
      if (animDur > 0) {
        if (animStart === null) animStart = ts;
        var t = (ts - animStart) / animDur;
        if (!isFinite(t) || t < 0) t = 0;
        if (t > 1) t = 1;
        progress = ease(t);
        if (t >= 1) animDur = 0;
      }
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = PAL.bg;
      ctx.fillRect(0, 0, W, H);

      drawGrid();
      drawAxisWords(m);
      if (!state.nine) drawBounds(m);

      var mainColor = m.curveColor || PAL.curve;
      var segs = segments(m, m.f);
      if (m.parallax && state.parallax && segs.length > 1) {
        // 自我视角：两块图像用两种颜色，表示它们不构成同一幅图
        segs.forEach(function (s, i) {
          drawCurve([s], i % 2 === 0 ? PAL.program : PAL.action, 2.2, null, progress, true);
        });
      } else {
        drawCurve(segs, mainColor, 2.2, null, progress, true);
      }

      if (state.inverse && m.inv) {
        var isegs = segments(m, m.inv, m.invDomain);
        drawCurve(isegs, PAL.action, 1.5, [7, 5], progress, false);
      }
      if (state.deriv) {
        var dsegs = segments(m, m.df);
        drawCurve(dsegs, PAL.ideology, 1.6, [4, 3], progress, false);
      }

      if (!state.nine) drawKeyPoints(m);
      drawProbe(m);
      drawSymmetry(m);
      drawParallax(m);      drawViolence();
      drawNine();

      if (animDur > 0) requestFrame();
    }

    function requestFrame() {
      if (raf) return;
      raf = global.requestAnimationFrame(function (ts) {
        raf = null;
        draw(ts);
      });
    }

    function replay() {
      // 隐藏的标签页不会跑 rAF，动画会停在半途；此时直接画完
      if (prefersReduced() || (typeof document !== 'undefined' && document.hidden)) {
        animDur = 0; animStart = null; requestFrame(); return;
      }
      animStart = null;
      animDur = 620;
      requestFrame();
    }

    function prefersReduced() {
      try {
        return !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
      } catch (e) { return false; }
    }

    /* ---- 交互 ---- */
    function updateProbeFromPixel(px) {
      var m = modelById(state.id);
      var x = invX(px);
      var p = paramsOf(m);
      if (!m.domain(x, p)) {
        // 找到最近的合法点
        var lo = x, hi = x, found = null;
        for (var k = 0; k < 400; k++) {
          lo -= 0.01; hi += 0.01;
          if (lo >= -halfX && m.domain(lo, p)) { found = lo; break; }
          if (hi <= halfX && m.domain(hi, p)) { found = hi; break; }
          if (lo < -halfX && hi > halfX) break;
        }
        if (found === null) return;
        x = found;
      }
      state.probeX = Math.max(-halfX, Math.min(halfX, x));
      schedulePanel();
    }

    /* 探针移动时不要每一次 pointermove 都重建整块右栏：并到一帧里做一次 */
    var panelQueued = false;
    function schedulePanel() {
      if (panelQueued) return;
      panelQueued = true;
      global.requestAnimationFrame(function () {
        panelQueued = false;
        renderPanel();
      });
    }

    canvas.addEventListener('pointermove', function (e) {
      if (state.pinned && !state.dragging) return;
      var rect = canvas.getBoundingClientRect();
      updateProbeFromPixel(e.clientX - rect.left);
      requestFrame();
    });
    canvas.addEventListener('pointerdown', function (e) {
      /* 九连环层：点在环上就是「试着把这一环挂上去 / 放下来」，规则由 nine.js 拦 */
      if (state.nine && global.SHUZHENG_NINE) {
        var rectN = canvas.getBoundingClientRect();
        var nx = invX(e.clientX - rectN.left);
        var ny = (oy - (e.clientY - rectN.top)) / scale;
        if (global.SHUZHENG_NINE.pick(nx, ny) !== null) {
          global.SHUZHENG_NINE.tryMove(nx, ny);
          renderPanel(); syncHash(); replay();
          return;
        }
      }
      state.pinned = true;
      state.dragging = true;
      canvas.setPointerCapture(e.pointerId);
      var rect = canvas.getBoundingClientRect();
      updateProbeFromPixel(e.clientX - rect.left);
      requestFrame();
    });
    canvas.addEventListener('pointerup', function (e) {
      state.dragging = false;
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    });
    canvas.addEventListener('dblclick', function () { state.pinned = false; });
    canvas.setAttribute('tabindex', '0');
    canvas.addEventListener('keydown', function (e) {
      var step = e.shiftKey ? 0.25 : 0.05;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        var m = modelById(state.id);
        if (state.probeX === null) state.probeX = m.probe;
        state.pinned = true;
        state.probeX += (e.key === 'ArrowRight' ? step : -step);
        state.probeX = Math.max(-halfX, Math.min(halfX, state.probeX));
        renderPanel();
        requestFrame();
      }
    });

    /* ---- 控件 ---- */
    var libEl = document.getElementById('library');
    var paramEl = document.getElementById('paramBox');
    var readEl = document.getElementById('readout');
    /* 「这个点代表谁」：委托绑定，右栏重建后依然有效 */
    if (readEl) {
      readEl.addEventListener('click', function (ev) {
        var b = (ev.target && ev.target.closest) ? ev.target.closest('[data-subject]') : null;
        if (!b) return;
        state.subject = b.getAttribute('data-subject');
        renderPanel(); syncHash();
      });
    }
    var swDeriv = document.getElementById('swDeriv');
    var swInverse = document.getElementById('swInverse');
    var swParallax = document.getElementById('swParallax');
    var swViolence = document.getElementById('swViolence');
    var swNine = document.getElementById('swNine');
    var btnReset = document.getElementById('btnReset');

    function buildLibrary() {
      var groups = [];
      MODELS.forEach(function (m) {
        var g = null;
        for (var i = 0; i < groups.length; i++) if (groups[i].name === m.group) g = groups[i];
        if (!g) { g = { name: m.group, items: [] }; groups.push(g); }
        g.items.push(m);
      });
      var html = '';
      groups.forEach(function (g) {
        html += '<div class="lib-group"><p class="lib-group-title">' + g.name + '</p>';
        g.items.forEach(function (m) {
          html += '<button type="button" class="lib-item" data-id="' + m.id + '" aria-pressed="false">'
            + '<span>' + m.name + '</span><span class="lib-expr">' + m.expr + '</span></button>';
        });
        html += '</div>';
      });
      libEl.innerHTML = html;
      libEl.addEventListener('click', function (e) {
        var b = e.target.closest('.lib-item');
        if (!b) return;
        selectModel(b.getAttribute('data-id'));
      });
    }

    function buildParams() {
      var m = modelById(state.id);
      if (!m.param) { paramEl.innerHTML = ''; return; }
      var p = m.param, v = paramsOf(m)[p.key];
      var html = '<h3>参数</h3>'
        + '<div class="param-row"><label class="param-name" for="prm">' + p.label + '</label>'
        + '<output class="param-value" id="prmOut">' + fmt(v, 2) + '</output></div>'
        + '<input type="range" id="prm" min="' + p.min + '" max="' + p.max + '" step="' + p.step + '" value="' + v + '">'
        + '<p class="param-note">' + p.note + '</p>';
      if (p.presets) {
        html += '<div class="chips">';
        p.presets.forEach(function (pr) {
          html += '<button type="button" class="chip" data-v="' + pr.v + '" aria-pressed="false">' + pr.label + '</button>';
        });
        html += '</div>';
      }
      paramEl.innerHTML = html;

      var input = document.getElementById('prm');
      var out = document.getElementById('prmOut');
      input.addEventListener('input', function () {
        paramsOf(m)[p.key] = parseFloat(input.value);
        out.textContent = fmt(parseFloat(input.value), 2);
        syncChips();
        renderPanel();
        syncHash();
        requestFrame();
      });
      paramEl.querySelectorAll('.chip').forEach(function (c) {
        c.addEventListener('click', function () {
          var val = parseFloat(c.getAttribute('data-v'));
          paramsOf(m)[p.key] = val;
          input.value = val;
          out.textContent = fmt(val, 2);
          syncChips();
          renderPanel();
          syncHash();
          requestFrame();
        });
      });
      function syncChips() {
        paramEl.querySelectorAll('.chip').forEach(function (c) {
          var val = parseFloat(c.getAttribute('data-v'));
          c.setAttribute('aria-pressed', Math.abs(val - paramsOf(m)[p.key]) < 1e-6 ? 'true' : 'false');
        });
      }
      syncChips();
    }

    /* 状态可写进地址栏，便于分享某一条曲线、某一组开关与某一套视角 */
    function stateHash() {
      var m = modelById(state.id), p = paramsOf(m), parts = ['id=' + state.id];
      if (state.deriv) parts.push('deriv=1');
      if (state.inverse) parts.push('inv=1');
      if (state.parallax) parts.push('par=1');
      if (state.violence) parts.push('vio=1');
      if (state.nine) parts.push('nine=1');
      if (state.subject && state.subject !== 'group') parts.push('sub=' + state.subject);
      if (state.probeX !== null && state.probeX !== undefined) parts.push('px=' + state.probeX);
      var on = [];
      for (var l in state.lenses) if (Object.prototype.hasOwnProperty.call(state.lenses, l) && state.lenses[l]) on.push(l);
      if (on.length) parts.push('lens=' + on.join(','));
      if (Math.abs(state.unit - 1) > 1e-6) parts.push('unit=' + state.unit);
      if (state.horizon !== 'now') parts.push('h=' + state.horizon);
      if (state.persona && state.persona !== 'commoner') parts.push('who=' + state.persona);
      for (var k in p) if (Object.prototype.hasOwnProperty.call(p, k)) parts.push(k + '=' + p[k]);
      return parts.join('&');
    }

    function syncHash() {
      if (global.SHUZHENG_APP && global.SHUZHENG_APP.sync) { global.SHUZHENG_APP.sync(); return; }
      try {
        if (global.history && global.history.replaceState) global.history.replaceState(null, '', '#' + stateHash());
      } catch (e) { /* file:// 下可能被拒，忽略 */ }
    }
    API.stateHash = stateHash;

    function readHash() {
      var raw = ((global.location && global.location.hash) || '').replace(/^#/, '');
      var q = {};
      if (!raw) return q;
      raw.split('&').forEach(function (kv) {
        var i = kv.indexOf('=');
        if (i > 0) q[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1));
      });
      return q;
    }

    function applyHash(q) {
      if (!q || !q.id) return;
      var known = false;
      MODELS.forEach(function (x) { if (x.id === q.id) known = true; });
      if (!known) return;
      selectModel(q.id);
      var m = modelById(q.id);
      if (m.param && q[m.param.key] !== undefined) {
        var v = parseFloat(q[m.param.key]);
        if (isFinite(v)) {
          paramsOf(m)[m.param.key] = Math.max(m.param.min, Math.min(m.param.max, v));
          buildParams();
        }
      }
      if (q.lens !== undefined && global.SHUZHENG_STRATEGY) {
        var want = q.lens ? q.lens.split(',') : [];
        global.SHUZHENG_STRATEGY.LENSES.forEach(function (l) { state.lenses[l.id] = want.indexOf(l.id) >= 0; });
      }
      if (q.unit !== undefined) { var uu = parseFloat(q.unit); if (isFinite(uu)) state.unit = uu; }
      if (q.h === 'cycle' || q.h === 'long' || q.h === 'now') state.horizon = q.h;
      if (q.who && global.SHUZHENG_STRATEGY) {
        global.SHUZHENG_STRATEGY.PERSONAS.forEach(function (pp) { if (pp.id === q.who) state.persona = q.who; });
      }
      state.deriv = q.deriv === '1';
      state.inverse = q.inv === '1';
      state.parallax = q.par === '1' && !!m.parallax;
      state.violence = q.vio === '1';
      state.nine = q.nine === '1';
      if (q.sub && global.SHUZHENG_POINT) {
        state.subject = q.sub;
      }
      applyHalfX();
      if (swNine) swNine.setAttribute('aria-pressed', state.nine ? 'true' : 'false');
      syncCaption();
      if (q.px !== undefined) {
        var pxv = parseFloat(q.px);
        if (isFinite(pxv)) state.probeX = Math.max(-halfX, Math.min(halfX, pxv));
      }
      swDeriv.setAttribute('aria-pressed', state.deriv ? 'true' : 'false');
      swInverse.setAttribute('aria-pressed', state.inverse ? 'true' : 'false');
      swParallax.setAttribute('aria-pressed', state.parallax ? 'true' : 'false');
      swViolence.setAttribute('aria-pressed', state.violence ? 'true' : 'false');
      renderPanel();
      syncHash();
      replay();
    }

    function selectModel(id) {
      state.id = id;
      var m = modelById(id);
      state.probeX = m.probe;
      state.pinned = false;
      state.parallax = false;
      libEl.querySelectorAll('.lib-item').forEach(function (b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-id') === id ? 'true' : 'false');
      });
      swParallax.hidden = !m.parallax;
      swParallax.setAttribute('aria-pressed', 'false');
      buildParams();
      renderPanel();
      syncHash();
      replay();
    }

    function renderPanel() {
      var m = modelById(state.id);
      var p = paramsOf(m);
      var x = state.probeX === null ? m.probe : state.probeX;
      var d = diagnose(m, x);
      var y = d.view;
      var q = y === null ? null : quadrant(x, y);

      var html = '';
      html += '<div class="ro-model">'
        + '<p class="ro-family">' + m.family + '</p>'
        + '<p class="ro-expr">' + m.expr + '</p>'
        + '<p class="ro-type">' + m.type + '</p></div>';

      /* ---- 这个点在说什么：点的解释引擎（先读数，后策略） ---- */
      var PT = global.SHUZHENG_POINT;
      if (PT) {
        html += PT.toHTML(PT.read(x, y, {
          unit: state.unit, subject: state.subject,
          quad: q, modelId: state.id, modelType: m.type,
          deriv: d.ideo, dExpr: m.dExpr(p)
        }));
      }

      /* ---- 第三轴＝虚数轴＝暴力。E13 说加上它「他就是权力学」，但那一层本讲没做；
              E02 的三条性质就是这一层。它读的是整个平面，所以放在策略台之前。 ---- */
      if (state.violence) {
        var PW = global.SHUZHENG_POWER;
        if (PW) {
          html += PW.toHTML(PW.read(x, y, { unit: state.unit }));
        } else {
          html += '<div class="ro-block"><h3>第三轴</h3><p class="ro-alert">i\u00b2 = \u22121 意味着一切行动都有反作用的代价。加上这一轴，模型就成了统治权力的模型，作者声明：这就不是庶政学了，是权力学。</p></div>';
        }
      }

      /* ---- X 轴左侧：九连环（E08）。它读横轴，与第三轴那一层并列。 ---- */
      if (state.nine) {
        var NINE = global.SHUZHENG_NINE;
        if (NINE) html += NINE.toHTML(NINE.read(x, y));
      }

      /* ---- 专家策略系统：视角与尺度是可选的那一层 ---- */
      var SX = global.SHUZHENG_STRATEGY;
      if (SX) {
        html += '<div class="sx-tools"><p class="sx-tools-title">视角<span class="hint">可多选</span></p><div class="sx-lenses">';
        SX.LENSES.forEach(function (l) {
          html += '<button type="button" class="lens" data-lens="' + l.id + '" aria-pressed="'
            + (state.lenses[l.id] ? 'true' : 'false') + '" title="' + l.q + '">' + l.name + '</button>';
        });
        html += '</div><div class="sx-dials">'
          + '<label><span>单元阈值</span><select id="sxUnit">'
          + [0.8, 1, 1.2].map(function (u) {
            return '<option value="' + u + '"' + (Math.abs(state.unit - u) < 1e-6 ? ' selected' : '') + '>' + u.toFixed(1) + '</option>';
          }).join('') + '</select></label>'
          + '<label><span>时间视域</span><select id="sxHorizon">'
          + [['now', '当下'], ['cycle', '一个周期'], ['long', '长期']].map(function (h) {
            return '<option value="' + h[0] + '"' + (state.horizon === h[0] ? ' selected' : '') + '>' + h[1] + '</option>';
          }).join('') + '</select></label>'
          + '<label><span>提问者</span><select id="sxWho">'
          + SX.PERSONAS.map(function (pp) {
            return '<option value="' + pp.id + '"' + (state.persona === pp.id ? ' selected' : '') + ' title="' + pp.q + '">' + pp.name + '</option>';
          }).join('') + '</select></label></div></div>';
      }

      if (y !== null && SX) {
        var ctx = strategyCtx(m, x, y, d);
        html += SX.toHTML(SX.build(ctx), ctx);
      } else if (y !== null) {
        html += '<div class="ro-block"><h3>探针 \u00b7 政治诊断</h3><dl class="ro-rows">';
        html += row('纲领化 x', fmt(x), '横轴：要不要纲领，纲领做不做得成一个单元。');
        html += row('行动性 y', fmt(y), q ? q.pos + '：' + q.folk : '');
        html += '</dl></div>';
      } else {
        html += '<div class="ro-block"><h3>探针</h3><p class="ro-verdict">此处无定义。换一个横坐标，或把参数从退化值上调开。</p></div>';
      }

      if (state.deriv) {
        html += '<div class="ro-block"><h3>意识形态化之后</h3>'
          + '<p class="ro-expr" style="font-size:1rem">' + m.dExpr(p) + '</p>'
          + '<p class="ro-verdict">' + m.derivNote + '</p></div>';
      }
      if (state.inverse && m.inv) {
        html += '<div class="ro-block"><h3>反函数族 \u00b7 立场</h3>'
          + '<p class="ro-expr" style="font-size:1rem">' + m.invExpr(p) + '</p>'
          + '<p class="ro-verdict">立场是纲领与行动的反演。文稿强调函数族互为反函数：对数过 (1,0)，指数过 (0,1)，这一点之差就是政治色彩的实质差别。</p></div>';
      }

      html += '<div class="ro-block"><h3>本族读法</h3><p class="ro-verdict">' + m.read(x, y, p) + '</p></div>';

      html += '<div class="ro-block"><details class="quotes"><summary>文稿原话 · ' + m.quotes.length + ' 条</summary>';
      m.quotes.forEach(function (qt) {
        html += '<blockquote class="ro-quote"><span class="tag tag-orig">原</span>' + qt + '</blockquote>';
      });
      html += '</details></div>';

      /* 整个右栏重建会丢掉滚动位置：拖动探针时右栏会一直弹回顶部，读不了长文。
         重建前后把 scrollTop 接住。 */
      var keepScroll = readEl.scrollTop;
      readEl.innerHTML = html;
      readEl.scrollTop = keepScroll;

      /* 「这个点代表谁」：切的是切线的解释，不动曲线 */
      /* 事件用委托绑在 readEl 上，重建不变 */

      /* 视角与尺度改变时只重画面板，不动曲线 */
      readEl.querySelectorAll('.lens').forEach(function (b) {
        b.addEventListener('click', function () {
          var id = b.getAttribute('data-lens');
          state.lenses[id] = !state.lenses[id];
          b.setAttribute('aria-pressed', state.lenses[id] ? 'true' : 'false');
          renderPanel(); syncHash();
        });
      });
      var su = document.getElementById('sxUnit');
      if (su) su.addEventListener('change', function () { state.unit = parseFloat(su.value); renderPanel(); syncHash(); });
      var sh = document.getElementById('sxHorizon');
      if (sh) sh.addEventListener('change', function () { state.horizon = sh.value; renderPanel(); syncHash(); });
      var swho = document.getElementById('sxWho');
      if (swho) swho.addEventListener('change', function () { state.persona = swho.value; renderPanel(); syncHash(); });
    }

    function row(dt, dd, why) {
      return '<div class="ro-row"><dt>' + dt + '</dt><dd>' + dd
        + (why ? '<span class="why">' + why + '</span>' : '') + '</dd></div>';
    }

    swDeriv.addEventListener('click', function () {
      state.deriv = !state.deriv;
      swDeriv.setAttribute('aria-pressed', state.deriv ? 'true' : 'false');
      renderPanel(); syncHash(); replay();
    });
    swInverse.addEventListener('click', function () {
      state.inverse = !state.inverse;
      swInverse.setAttribute('aria-pressed', state.inverse ? 'true' : 'false');
      renderPanel(); syncHash(); replay();
    });
    swParallax.addEventListener('click', function () {
      state.parallax = !state.parallax;
      swParallax.setAttribute('aria-pressed', state.parallax ? 'true' : 'false');
      renderPanel(); syncHash(); replay();
    });
    swViolence.addEventListener('click', function () {
      state.violence = !state.violence;
      if (state.violence) state.nine = false;      // 两层互斥：一次只看一层
      swViolence.setAttribute('aria-pressed', state.violence ? 'true' : 'false');
      if (swNine) swNine.setAttribute('aria-pressed', 'false');
      applyHalfX(); syncCaption();
      renderPanel(); syncHash(); replay();
    });
    if (swNine) {
      swNine.addEventListener('click', function () {
        state.nine = !state.nine;
        if (state.nine) state.violence = false;    // 两层互斥
        swNine.setAttribute('aria-pressed', state.nine ? 'true' : 'false');
        swViolence.setAttribute('aria-pressed', 'false');
        applyHalfX();
        syncCaption();
        renderPanel(); syncHash(); replay();
      });
    }
    btnReset.addEventListener('click', function () {
      var m = modelById(state.id);
      if (m.param) {
        paramsOf(m)[m.param.key] = m.param.value;
        buildParams();
      }
      state.deriv = false; state.inverse = false; state.parallax = false; state.violence = false;
      state.nine = false;
      if (global.SHUZHENG_NINE) global.SHUZHENG_NINE.reset();   // 九环也回到全挂上
      applyHalfX();
      if (swNine) swNine.setAttribute('aria-pressed', 'false');
      syncCaption();
      swDeriv.setAttribute('aria-pressed', 'false');
      swInverse.setAttribute('aria-pressed', 'false');
      swViolence.setAttribute('aria-pressed', 'false');
      swParallax.setAttribute('aria-pressed', 'false');
      state.pinned = false;
      state.probeX = m.probe;
      renderPanel(); syncHash(); replay();
    });

    if (global.ResizeObserver) {
      new ResizeObserver(function () { layout(); requestFrame(); }).observe(canvas);
    } else {
      global.addEventListener('resize', function () { layout(); requestFrame(); });
    }

    // 先取地址栏里的状态：syncHash 会改写它，必须在任何写入之前读
    var incoming = readHash();
    buildLibrary();
    layout();
    selectModel(state.id);
    applyHash(incoming);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
