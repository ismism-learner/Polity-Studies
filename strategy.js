/* 庶政学 · 专家策略系统
   把右侧解释栏从“一条固定读法”改成一个可以选择的推理台：
     视角（可多选）× 尺度（严格度 / 时间视域）→ 规则链 → 结论与策略选项 → 文本依据
   规则分两类：〔原〕出自整理后的文稿（带 E## 与关键词，可跳转）；〔补〕是本系统的形式化补充。
   本文件只负责政治知识与推理，数值由 model.js 提供。 */

(function (global) {
  'use strict';

  /* ---------------- 视角 ---------------- */
  var LENSES = [
    { id: 'stance', name: '立场诊断', q: '这是哪一种政治立场？', on: true },
    { id: 'line', name: '路线推演', q: '下一步会往哪走？', on: true },
    { id: 'struggle', name: '斗争形态', q: '这里会打成什么样子？', on: false },
    { id: 'inst', name: '制度代价', q: '要什么制度来兜住它？', on: false },
    { id: 'power', name: '权力视角', q: '二轴之外还剩什么？', on: false },
    { id: 'parallax', name: '视差对照', q: '他者眼里与自己眼里是不是同一幅图？', on: false }
  ];

  /* 提问者身份：同一个点，四种问法给四组不同的策略 */
  var PERSONAS = [
    { id: 'commoner', name: '庶民', q: '我在这一点上能做什么？' },
    { id: 'organizer', name: '组织者', q: '怎么把人组织起来而不越界？' },
    { id: 'ruler', name: '统治者', q: '怎么把活动限在一个单元内？' },
    { id: 'observer', name: '研究者', q: '这一点的意识形态到底是什么？' }
  ];

  /* ---------------- 规则 ----------------
     when(c) 判据；c 字段见 model.js 传来的 ctx：
       x 纲领化, y 行动性, d 一阶导, d2 二阶导, inv 反函数读值, invd 反函数导数,
       family(函数族), id(模型 id), unit(单元阈值), horizon(now|cycle|long),
       span(值域半径，三角函数为 1), broken(是否处于断裂/间断附近), axisSide
     每条规则给：前提、判据、结论，以及出处（〔原〕带 ep + term 关键词，供跳转）。 */
  var RULES = [
    /* ---- 立场诊断 ---- */
    {
      id: 'power-harmony', lens: 'stance', when: function (c) { return c.id === 'power' && c.x > 0; },
      prem: '幂函数必过 $(1,1)$：单元性纲领对应单元性行动。',
      judge: '当前 x 与 y 都为正，且落在同一族曲线上。',
      claim: '这是古典（经典）理性主义的立场：只要纲领做得完善，行动自然完善，属于机械和谐。',
      src: { ep: 'E13', term: '机械和谐' }
    },
    {
      id: 'exp-natural', lens: 'stance', when: function (c) { return c.id === 'exp'; },
      prem: '指数函数过 $(0,1)$：无纲领状态（$x=0$）时仍有一个单元的行动。',
      judge: '本族在原点处不依赖纲领就给出行动。',
      claim: '这是前现代保守的立场：行动的能力被当作天然的、习俗性的，因此对纲领本身抱有怀疑。',
      src: { ep: 'E13', term: '无纲领状态' }
    },
    {
      id: 'log-kant', lens: 'stance', when: function (c) { return c.id === 'log' && c.x >= 1; },
      prem: '对数函数过 $(1,0)$：有单元性纲领时行动读数为零。',
      judge: '纲领已过一个单元，本族的行动仍被悬置。',
      claim: '这是康德式的理性主义：知道得足够多就可以不做，服从取代行动，属于启蒙化的保守主义。',
      src: { ep: 'E13', term: '康德' }
    },
    {
      id: 'cos-nlib', lens: 'stance', when: function (c) { return c.id === 'cos'; },
      prem: '余弦的值域是 $[-1,1]$：善与自私都不得超过一个单元。',
      judge: '模型自带值域上限，越界没有定义。',
      claim: '这是新自由主义保守主义的位置：允许算计、允许慈善，但一律限缩在一个单元之内。',
      src: { ep: 'E13', term: '新自由主义' }
    },
    {
      id: 'const-custom', lens: 'stance', when: function (c) { return c.id === 'const'; },
      prem: '常数函数对纲领完全不响应，求导归零。',
      judge: '截距即全部内容，斜率恒为零。',
      claim: '这是习俗本身：无论纲领做到什么程度，立场与路线都不变。',
      src: { ep: 'E13', term: '习俗' }
    },
    {
      id: 'custom-side', lens: 'stance', when: function (c) { return c.x < 0; },
      prem: '横轴左段是习俗化、去纲领化的一侧。',
      judge: '当前点落在 $x<0$。',
      claim: '这一侧的正当性不由纲领提供，而由习俗、本能或直接关系提供，因此“不搞纲领”本身在这里是一种立场。',
      src: { ep: 'E13', term: '去纲领化' }
    },
    {
      id: 'state-point', lens: 'stance', when: function () { return true; },
      prem: '任何一点都是一个政治状态，可以属于个人、纲领性团体、运动或意识形态。',
      judge: '探针所在即一个状态。',
      claim: '先把这一点读成“谁的状态”：个人、团体、运动，还是理念本身，四者的读法并不相同。',
      src: { ep: 'E12', term: '政治状态' }
    },

    /* ---- 路线推演 ---- */
    {
      id: 'slope-up', lens: 'line', when: function (c) { return c.d > c.unit; },
      prem: '路线是立场对纲领变化的响应，即导数。',
      judge: '导数大于一个单元：纲领再加一格，行动要加超过一格。',
      claim: '路线是激进化的：组织在放大行动，越往右越容易越过单元边界进入非法区。',
      src: { ep: 'E13', term: '求导就是意识形态化' }
    },
    {
      id: 'slope-flat', lens: 'line', when: function (c) { return Math.abs(c.d) <= 0.35; },
      prem: '导数趋近于零表示响应饱和或完全钝化。',
      judge: '当前一阶导的绝对值不超过 0.35。',
      claim: '路线已经平掉：再加纲领不产生新的行动，继续加压只会推高纲领成本。',
      src: { ep: 'E13', term: '纲领性的边界' }
    },
    {
      id: 'slope-neg', lens: 'line', when: function (c) { return c.d < 0; },
      prem: '负导数意味着纲领增加反而压低行动。',
      judge: '当前一阶导为负。',
      claim: '这是压制型路线：纲领越多，能做的无对价行动越少，行动被迫转入对价侧。',
      src: { ep: 'E13', term: '对价' }
    },
    {
      id: 'deriv-ideo', lens: 'line', when: function () { return true; },
      prem: '求导就是意识形态化：导数即意识形态，是状态的趋向性。',
      judge: '把当前斜率读成这个团体的主观状态。',
      claim: '该点的意识形态强度为 $|f\'(x)|$。意识形态的统治是无知的、去主体化的，当事人意识不到它。',
      src: { ep: 'E12', term: '不能求导' }
    },
    {
      id: 'curvature', lens: 'line', when: function (c) { return c.d2 !== null && Math.abs(c.d2) > 0.05; },
      prem: '二阶导是路线自身的变化率。',
      judge: c => '二阶导为 ' + (c.d2 > 0 ? '正' : '负') + '，响应在' + (c.d2 > 0 ? '加速' : '衰减'),
      claim: '路线的形态是' + '', // 由 build 时替换
      src: null
    },
    {
      id: 'cycle-rule', lens: 'line', when: function (c) { return c.horizon !== 'now' && c.span !== null; },
      prem: '值域有界且形状重复的模型自带周期。',
      judge: '时间视域被放到一个周期以上。',
      claim: '一个周期之内位置会回来，所以短期的胜负不改变结构；能改变的只有值域与周期长度。',
      src: { ep: 'E13', term: '周期性' }
    },
    {
      id: 'ideology-stuck', lens: 'line', when: function (c) { return c.id === 'exp' && c.y > 0 && c.y < 1; },
      prem: '指数族在 $x=0$ 处给出一格行动，在 $x<1$ 处给出不足一格的行动。',
      judge: '行动不足一个单元。',
      claim: '这里的行动力成色不足：能做事，但做不成一件可计量的事，容易被读成“热心但不成器”。',
      src: { ep: 'E13', term: '单元性' }
    },

    /* ---- 斗争形态 ---- */
    {
      id: 'nine-rings', lens: 'struggle', when: function (c) { return c.x < 0; },
      prem: 'X 轴左侧是习俗化一侧，前现代政治斗争的根本模型是九连环。',
      judge: '当前点落在左侧。',
      claim: '左侧的斗争不是纲领对纲领，而是环环相扣的解环游戏：动一环，其余环咬着不放。',
      src: { ep: 'E08', term: '九连环' }
    },
    {
      id: 'fracture', lens: 'struggle', when: function (c) { return c.broken; },
      prem: '反三角函数与正切在边界处断裂，断裂性比连续性更明显。',
      judge: '探针靠近间断点或定义域尽头。',
      claim: '这里是断裂带：立场不能靠渐变过渡，只能跳过去，跳不过去就是非法或不存在。',
      src: { ep: 'E13', term: '断裂' }
    },
    {
      id: 'illegal-zone', lens: 'struggle', when: function (c) { return Math.abs(c.y) > c.unit; },
      prem: '统治区间的边界是一个单元；越界即非法。',
      judge: '行动性读数超过单元阈值 ' + '', // build 时替换
      claim: '这里有纲领、有行动、又组织化：在没有第三轴的经典体系里，它读作判刑与镇压的对象。',
      src: { ep: 'E13', term: '非法' }
    },
    {
      id: 'pseudo-revo', lens: 'struggle', when: function (c) { return c.y < 0 && c.x > 0; },
      prem: '有纲领却做成对价行动：要价高于承担。',
      judge: '纲领化为正、行动性为负。',
      claim: '这种组合要警惕伪革命者：他们不是解放者，而是求救者，纲领只是要价的凭据。',
      src: { ep: 'E01', term: '解放者' }
    },
    {
      id: 'purify', lens: 'struggle', when: function (c) { return c.x > 0 && c.y > 0 && c.y <= c.unit; },
      prem: '单元之内的善是可计量的、合格的。',
      judge: '行动在一个单元以内且为正。',
      claim: '这一带的行动够用但不显眼：不会被判刑，也不会铸造权威，历史上容易在组织化过程中被更激进的翼取代。',
      src: { ep: 'E13', term: '一单元' }
    },
    {
      id: 'revolt-rank', lens: 'struggle', when: function (c) { return c.x > 0 && c.y > 0; },
      prem: '反抗运动内部会再生产等级制与特权。',
      judge: '纲领与行动同时为正，组织在形成。',
      claim: '组织一旦成形，等级与特权就在同一坐标上长出来；判断敌我不看纲领口号，看他占的位置。',
      src: { ep: 'E01', term: '等级制' }
    },

    /* ---- 制度代价 ---- */
    {
      id: 'inst-cost', lens: 'inst', when: function (c) { return Math.abs(c.y) > c.unit * 0.75; },
      prem: '价值超过或逼近一个单元时，必须有制度来承担。',
      judge: '行动性逼近单元阈值。',
      claim: '这里需要建制：或者是把行为规范化的制度，或者是把代价外部化的权力机构，两者都要付账。',
      src: { ep: 'E09', term: '建制' }
    },
    {
      id: 'four-limits', lens: 'inst', when: function (c) { return c.horizon !== 'now'; },
      prem: '庶政学给出四种客观极限：建制、美德、统治、生存。',
      judge: '把时间视域放到长期。',
      claim: '长期看，位置受这四种极限约束：建制给容量，美德给上限，统治给稳定，生存给底线。',
      src: { ep: 'E09', term: '客观极限' }
    },
    {
      id: 'institution-read', lens: 'inst', when: function (c) { return c.id === 'log' || c.id === 'arctan' || c.id === 'arcsin'; },
      prem: '反函数族与对数族把活动锁进边界，边界由纲领设定。',
      judge: '当前族自带纲领性边界。',
      claim: '这是计划型制度的读法：五年计划、逆周期、指标管理，用理性设计替换自然节律。',
      src: { ep: 'E13', term: '五年计划' }
    },
    {
      id: 'utopia-drift', lens: 'inst', when: function (c) { return c.horizon !== 'now' && Math.abs(c.y) > c.unit; },
      prem: '特殊要素里有乌托邦、天国、世俗享乐、敌托邦四种极端。',
      judge: '越出单元且放到长期。',
      claim: '越界的善会被推向乌托邦或天国，越界的自私会滑向世俗享乐与敌托邦，四者是同一根轴的两端。',
      src: { ep: 'E10', term: '敌托邦' }
    },
    {
      id: 'cost-side', lens: 'inst', when: function (c) { return c.y < 0; },
      prem: '纵轴下端是对价、交易、功利，再下是腐化与自然法则。',
      judge: '行动性为负。',
      claim: '这一侧的一切都要算账：制度的用处是把账算清，代价是它同时把政治降格为交易。',
      src: { ep: 'E13', term: '计较利害' }
    },

    /* ---- 权力视角 ---- */
    {
      id: 'power-three', lens: 'power', when: function () { return true; },
      prem: '权力有三个基本性质（见 E02）。',
      judge: '二轴模型里没有暴力，也没有权力的位置。',
      claim: '要把这里的判断落到现实，必须补上权力：谁有能力让对方付出代价，谁就定义了本点的实际含义。',
      src: { ep: 'E02', term: '权力' }
    },
    {
      id: 'imaginary-axis', lens: 'power', when: function () { return true; },
      prem: '$i^2=-1$：一切行动都有反作用的代价。',
      judge: '二轴体系是经典体系，各立场都自称目的为善。',
      claim: '加上虚数轴，模型就变成统治权力的模型，作者自己声明：那就不是庶政学了，是权力学。',
      src: { ep: 'E13', term: '虚数轴' }
    },
    {
      id: 'ji', lens: 'power', when: function (c) { return c.x > 0; },
      prem: '个人与共同体的纽结是“籍”。',
      judge: '纲领化一侧的正当性来自共同体归属。',
      claim: '这一点上真正被争夺的是籍：谁在册、谁不在册、谁可以代表共同体说话。',
      src: { ep: 'E03', term: '籍' }
    },

    /* ---- 视差对照 ---- */
    {
      id: 'parallax-view', lens: 'parallax', when: function () { return true; },
      prem: '左翼意识形态是不认为自己是图像的图像。',
      judge: '同一个函数在阶级敌人眼里中心对称，在自己眼里两极对立。',
      claim: '两种读法都不能互相还原：他者看到连续与对称，自己看到断裂与悲剧，这就是视差。',
      src: { ep: 'E13', term: '视差' }
    },
    {
      id: 'no-program', lens: 'parallax', when: function (c) { return c.x <= 0 && Math.abs(c.y) <= 0.4; },
      prem: '键政的特征是去纲领化加去行动化。',
      judge: '纲领接近零、行动也接近零。',
      claim: '这一点既不敢搞纲领，也不敢行动，却仍有政治话语与政治图像：They got no programs。',
      src: { ep: 'E13', term: 'no program' }
    },

    /* ---- 来自其余各讲的规则 ---- */
    {
      id: 'x1-base', lens: 'stance', when: function (c) { return Math.abs(c.x - 1) < 0.28; },
      prem: '$x=1$ 是现代政治的基点，它的内容是「无父」。',
      judge: '探针落在 $x=1$ 附近。',
      claim: '父亲命令在这里失效，代之以公民化与匿名市场：正当性不再由父命提供，而由纲领与市场提供。',
      src: { ep: 'E05', term: '无父' }
    },
    {
      id: 'four-names', lens: 'stance', when: function () { return true; },
      prem: '每个象限有四段定位的说法。',
      judge: '看 x、y 的符号组合。',
      claim: 'X 右是普遍的特殊性，X 左是特殊的普遍性，Y 上是普遍的普遍性，Y 下是特殊的特殊性，原点是单一性。同一个位置有四种叫法，命名本身就是争夺的对象。',
      src: { ep: 'E07', term: '特殊的普遍性' }
    },
    {
      id: 'composite', lens: 'struggle', when: function (c) { return c.x > 0.5; },
      prem: '复合要素只有两个：面积与组织度。',
      judge: '纲领化一侧在推高范围与层级。',
      claim: '这一带的实际力量等于面积乘组织度：人多而传不出命令，或命令能传出而无人可传，都算不得力量。',
      src: { ep: 'E11', term: '组织度' }
    },
    {
      id: 'second-order', lens: 'line', when: function (c) { return Math.abs(c.d) > 1.4; },
      prem: '行动有一阶与二阶之别：一阶是做事，二阶是共享与信任。',
      judge: '导数大于 1.4，行动变化率本身已经很大。',
      claim: '这里已经在做二阶行动：升一阶导数的代价是它必须由内部中介（金钱、共相）来记账，因此更容易被接管。',
      src: { ep: 'E06', term: '二阶行动' }
    },
    {
      id: 'self-limit', lens: 'line', when: function (c) { return c.x > 1.6; },
      prem: '纲领轴右端是自限性的理性，分工从不自觉变为有目的。',
      judge: '已走到纲领化的深处。',
      claim: '越往右，纲领越倾向于自我设限：设边界、定周期、把活动锁进计划，而不是顺应自然节律。',
      src: { ep: 'E07', term: '无目的分工' }
    },
    {
      id: 'vengeance', lens: 'inst', when: function (c) { return c.x > 0 && c.y > 0; },
      prem: '行动是普遍性兑换普遍性；血仇权、收税与收保护费都在同一侧。',
      judge: '纲领与行动同时为正。',
      claim: '制度在这里的全部问题是：谁有资格兑换。血仇权、税与保护费的区别不在形式，而在兑换资格被谁垄断。',
      src: { ep: 'E06', term: '血仇权' }
    },
    {
      id: 'body-practice', lens: 'struggle', when: function (c) { return c.x < 0; },
      prem: '左侧的九连环必须身体力行：一环悬空、一环脱落，一二环齐下才进入新一轮算计。',
      judge: '当前点落在习俗侧。',
      claim: '左侧的操作无法委托：相邻性是唯一约束，越级解环不是失败而是不存在。',
      src: { ep: 'E08', term: '身体力行' }
    },
    {
      id: 'holiness', lens: 'struggle', when: function (c) { return Math.abs(c.y) > c.unit; },
      prem: '越出一个单元之后，去交易化的操作会造出神圣性。',
      judge: '行动性越出单元阈值。',
      claim: '越界者的解决办法通常是造神圣性：让自己的行动不再可交换（凯撒与教皇、禁止越权），用不可交易性换取位置。',
      src: { ep: 'E08', term: '去交易化' }
    },
    {
      id: 'no-father-inst', lens: 'inst', when: function (c) { return c.x >= 0.7; },
      prem: '无父之后，命令功能必须由建制接替。',
      judge: '纲领化已接近一个单元。',
      claim: '公共教育与纲领灌输（念经）承担了原本由父亲承担的功能：建制越完整，父命越不必要。',
      src: { ep: 'E05', term: '公民化' }
    },
    {
      id: 'mingjue', lens: 'inst', when: function (c) { return c.y > 0.45; },
      prem: '名爵与奇偶点位的再生产，是制度维持自己的方式。',
      judge: '行动性已经可观。',
      claim: '制度靠给名字与位置来维持，而不是靠暴力：名爵一乱，位置就乱，行动随之失去计量单位。',
      src: { ep: 'E07', term: '名爵' }
    },
    {
      id: 'anonymous-market', lens: 'power', when: function (c) { return c.y < 0; },
      prem: '向下是无母与匿名市场：供养关系被市场替代。',
      judge: '行动性为负。',
      claim: '这一侧的供养是可计算、可随时撤走的：没有父命，也没有母系的义务，只有价格。',
      src: { ep: 'E05', term: '匿名市场' }
    },
    {
      id: 'naming-fight', lens: 'parallax', when: function (c) { return Math.abs(c.y) > 0.3; },
      prem: '同一个位置的四种叫法（普普／普特／特普／特特）在讲里都曾被说反。',
      judge: '行动性不可忽略。',
      claim: '命名不是描述而是争夺：谁的定义被采用，谁就决定了这一点该被扶持还是被镇压。',
      src: { ep: 'E06', term: '普遍的普遍性' }
    },

    /* ---- 提问者身份 ---- */
    {
      id: 'p-commoner', lens: 'stance', when: function (c) { return c.persona === 'commoner'; },
      prem: '庶民能调动的只有自己的时间、身体与关系。',
      judge: '当前提问者身份为庶民。',
      claim: '可做的是把行动做到一个单元以内：可计量、可被承认、不越界。越界的那部分需要组织或权力，庶民个人承担不起。',
      src: { ep: 'E13', term: '单元性' }
    },
    {
      id: 'p-organizer', lens: 'line', when: function (c) { return c.persona === 'organizer'; },
      prem: '组织者的上限由统治区间给出。',
      judge: '当前提问者身份为组织者。',
      claim: '又有纲领又有行动就会进入判刑区间。要长期存在，必须在边界之前把断裂改写成反函数式的制度化：定期、定量、可预期。',
      src: { ep: 'E13', term: '统治区间' }
    },
    {
      id: 'p-ruler', lens: 'power', when: function (c) { return c.persona === 'ruler'; },
      prem: '统治者要维持的是值的上界，而不是某个具体纲领。',
      judge: '当前提问者身份为统治者。',
      claim: '把善与自私各限缩在一个单元内即可稳定；要更硬的手段就得把第三轴（暴力与代价）显式化，但那样已经离开庶政学。',
      src: { ep: 'E13', term: '虚数轴' }
    },
    {
      id: 'p-observer', lens: 'stance', when: function (c) { return c.persona === 'observer'; },
      prem: '个体的政治状态不能求导，团体与运动可以。',
      judge: '当前提问者身份为研究者。',
      claim: '研究者只能读到团体与运动的意识形态：它是集体无意识、是交往范式，当事人自己意识不到，所以不能采信当事人的自述。',
      src: { ep: 'E12', term: '不能求导' }
    },

    /* ---- 权力的三个基本性质（E02）与其它新落地的讲次 ---- */
    {
      id: 'power-quality', lens: 'power', when: function () { return true; }, form: true,
      prem: '权力的第一个性质是「质」：权必有制（质），无制的权是纯粹的虚。',
      judge: '把权力当量来加总会立刻失效。',
      claim: '所以权力不是可加总的量，而是能不能兑现的问题：位置再多，不能兑现就是虚的。',
      src: { ep: 'E02', term: '权必有质' }
    },
    {
      id: 'power-probability', lens: 'power', when: function () { return true; }, form: true,
      prem: '权力的第二个性质是概率性。',
      judge: '支配不是一次性事件，而是可重复实现的可能性。',
      claim: '稳定靠提高每次兑现的概率，而不是靠一次镇压；一次镇压提高的是声势，不是概率。',
      src: { ep: 'E02', term: '概率性' }
    },
    {
      id: 'power-secrecy', lens: 'power', when: function () { return true; }, form: true,
      prem: '权力的第三个性质是秘密性。',
      judge: '权力必须保有不被完全知晓的部分。',
      claim: '完全公开的权力会失去效力：可被完全预测的支配不再是支配，只是流程。',
      src: { ep: 'E02', term: '秘密性' }
    },
    {
      id: 'reverse-privilege', lens: 'struggle', when: function (c) { return c.x > 0.8; }, form: true,
      prem: '反抗运动内部的等级制靠「反向特权制」再生产：先剥夺，再按功劳归还一部分。',
      judge: '纲领化已过一个单元，组织在分配位置。',
      claim: '于是出现相对特权：不是展示性的享受，而是名分与资格上的差等；平等口号与差等结构可以同时成立。',
      src: { ep: 'E01', term: '反向特权制' }
    },
    {
      id: 'identity-oneway', lens: 'power', when: function (c) { return c.x > 0; }, form: true,
      prem: '公务人员表明身份都是单方向的：籍由共同体给出，不能由个人声明取得。',
      judge: '当前点落在纲领化一侧。',
      claim: '所以「我是谁的人」不是自述问题：单方面宣布归属无效，被除籍才是单方面生效的。',
      src: { ep: 'E03', term: '单方向' }
    },
    {
      id: 'utopia-mirror', lens: 'inst', when: function (c) { return c.horizon !== 'now'; }, form: true,
      prem: '四类特殊要素是主观侧的边界形态：乌托邦、天国在上，世俗享乐、敌托邦在下。',
      judge: '把视域放到长期。',
      claim: '它们与四种客观极限互为镜像：主观上想去的地方，正是客观上会被极限挡住的地方。',
      src: { ep: 'E10', term: '世俗享乐' }
    },

    /* ---- 专题：现代权力与政治（E14） ---- */
    {
      id: 'power-dynamics', lens: 'power', when: function () { return true; }, form: true,
      prem: '权力动力学：权力不是被占有的东西，而是不断被重新分配的过程。',
      judge: '把位置看成一时的结算，而不是永久的资产。',
      claim: '所以读一个位置要看它的来路与去处：谁在往上升、谁正在被结算，比现在谁坐在那里更重要。',
      src: { ep: 'E14', term: '权力动力学' }
    },
    {
      id: 'power-statics', lens: 'inst', when: function (c) { return c.x > 0; }, form: true,
      prem: '政治静力学给出的是结构：位置、编制、职能与边界。',
      judge: '纲领化一侧的稳定形态由编制与职能界定。',
      claim: '结构解释不了升沉，只能解释承载：同样的位置在动力学里可以完全不同，在静力学里却是同一个格子。',
      src: { ep: 'E14', term: '政治静力学' }
    },
    {
      id: 'faction-morph', lens: 'struggle', when: function (c) { return c.x > 0.6; }, form: true,
      prem: '派系形态学：派系有可辨认的形态与生长阶段，不是单纯的阴谋。',
      judge: '组织化程度已经足够高，位置开始成群出现。',
      claim: '判断一个位置的意义，要看它属于哪种派系形态、处在生长的哪一段：同一句话在不同形态里是结盟、试探还是清算。',
      src: { ep: 'E14', term: '派系形态学' }
    }
  ];

  /* 带着上下文替换占位符（把数值插进判据句） */
  function materialize(rule, c) {
    var r = Object.assign({}, rule);
    if (typeof r.judge === 'function') r.judge = r.judge(c);
    r.judge = (r.judge || '').replace(/' \+\s*''/, c.unit.toFixed(2));
    r.claim = (r.claim || '').replace(/' \+\s*''/, '');
    if (rule.id === 'curvature') {
      r.claim = c.d2 > 0
        ? '路线在加速：纲领的边际效力越来越大，越走越不能回头，直到撞上边界。'
        : '路线在衰减：纲领的边际效力越来越小，位置会稳定在饱和值附近。';
      r.src = { ep: 'E13', term: '导数' };
    }
    if (rule.id === 'illegal-zone') r.judge = '行动性读数超过单元阈值 ' + c.unit.toFixed(2) + '。';
    r.prem = tex(r.prem); r.judge = tex(r.judge); r.claim = tex(r.claim);
    if (rule.form) r.form = true;
    return r;
  }

  /* ---------------- 策略选项 ----------------
     score(c) 返回 0..1 的“该坐标上的适配度”，以及理由与代价。
     备注：打分公式是本系统的形式化补充，标〔补〕。 */
  var OPTIONS = [
    {
      id: 'more-program', name: '加纲领', dir: '向右',
      why: function (c) { return c.x < 1 ? '纲领还没到一个单元，右侧仍有空间。' : '纲领已过单元，继续加属于加压而非建设。'; },
      gain: function (c) { return c.x < 1 ? '把行动从“不成型”推向可计量的一个单元。' : '短期能压出行动，长期提高越界风险。'; },
      cost: function (c) { return c.id === 'log' ? '对数族的回应是零：纲领加得越多，行动读数越被悬置。' : '纲领成本上升，且组织化本身进入判刑区间。'; },
      score: function (c) { return clamp(0.72 - 0.28 * Math.max(0, c.x - 1) - (c.id === 'log' ? 0.35 : 0) + (c.x < 0.6 ? 0.18 : 0)); }
    },
    {
      id: 'less-program', name: '去纲领化', dir: '向左',
      why: function (c) { return c.x > 0.4 ? '退回习俗一侧可以立刻降低越界风险。' : '本来就在习俗一侧。'; },
      gain: function (c) { return c.id === 'exp' ? '指数族在习俗侧仍保留一个单元的行动，代价最小。' : '降低组织化程度，避开统治区间的边界。'; },
      cost: function (c) { return c.id === 'power' ? '幂函数在左侧把行动一起带走：不搞纲领就没有行动。' : '行动能力下降，容易被更激进的一翼取代。'; },
      score: function (c) { return clamp(0.3 + 0.4 * Math.max(0, c.x) * (c.id === 'exp' || c.id === 'const' ? 1 : 0.4) + (Math.abs(c.y) > c.unit ? 0.25 : 0)); }
    },
    {
      id: 'more-action', name: '强化无对价行动', dir: '向上',
      why: function (c) { return '在不改纲领的前提下增加不计代价的行动。'; },
      gain: function () { return '直接抬高行动性，最容易在一个单元内做出可计量的成绩。'; },
      cost: function (c) { return c.span !== null ? '值域有上限：三角函数把行动锁在 ±1，越界没有定义。' : '行动的可承受量取决于钱与人，超过组织容量就会外溢。'; },
      score: function (c) { return clamp(0.55 + (c.y < 1 ? 0.25 : -0.3) - (c.span !== null ? 0.15 : 0)); }
    },
    {
      id: 'to-price', name: '转入对价交易', dir: '向下',
      why: function () { return '把无对价行动换成可结算的对价行动。'; },
      gain: function () { return '立刻可计量、可交换、可维持，短期最稳。'; },
      cost: function () { return '代价是政治降格：纵轴向下依次是功利、腐化、享乐，最终只剩自然法则。'; },
      score: function (c) { return clamp(0.35 + (c.y < 0 ? 0.3 : 0) + (c.id === 'log' || c.id === 'cos' ? 0.12 : 0)); }
    },
    {
      id: 'organize', name: '组织化与提纯', dir: '右上',
      why: function (c) { return c.x > 1 && c.y > 1 ? '已经在又纲领又行动的区间。' : '把纲领与行动同时推高，做组织化。'; },
      gain: function () { return '换取最大的行动能力与最清晰的政治图像。'; },
      cost: function () { return '在经典体系里这是判刑区间：又有纲领、有行动、有组织，正是镇压的首选对象。'; },
      score: function (c) { return clamp(0.4 + 0.3 * Math.min(1, c.x) - 0.35 * (Math.abs(c.y) > c.unit ? 1 : 0)); }
    },
    {
      id: 'third-axis', name: '引入第三轴（暴力）', dir: '出平面',
      why: function () { return '当二轴读不出差别时，把代价与暴力显式地写进来。'; },
      gain: function () { return '能处理镇压、反叛、军事对抗与情报搏斗，模型立刻落到现实。'; },
      cost: function () { return '这一步就离开庶政学：作者自己说，三轴版本是权力学，不是政治哲学。'; },
      score: function (c) { return clamp(0.25 + (Math.abs(c.y) > c.unit ? 0.35 : 0) + (c.broken ? 0.2 : 0)); }
    }
  ];

  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  function level(v) { return v >= 0.66 ? '高' : v >= 0.4 ? '中' : '低'; }

  /* 规则文本里的 $...$ 转到 HTML（只覆盖文稿实际用到的记号） */
  function tex(s) {
    if (!s || s.indexOf('$') < 0) return s;
    return String(s).replace(/\$([^$]+)\$/g, function (_, m) {
      var t = m
        .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '$1/$2')
        .replace(/\\sqrt\{([^{}]*)\}/g, '√$1')
        .replace(/\^\{([^{}]*)\}/g, '<sup>$1</sup>')
        .replace(/\^(\w)/g, '<sup>$1</sup>')
        .replace(/_\{([^{}]*)\}/g, '<sub>$1</sub>')
        .replace(/_(\w)/g, '<sub>$1</sub>')
        .replace(/\\pi/g, 'π').replace(/\\ln/g, 'ln').replace(/\\log/g, 'log')
        .replace(/\\le(q)?/g, '≤').replace(/\\ge(q)?/g, '≥')
        .replace(/\\to/g, '→').replace(/\\Rightarrow/g, '⇒').replace(/\\times/g, '×')
        .replace(/\\cdot/g, '·').replace(/\\infty/g, '∞').replace(/\\pm/g, '±')
        .replace(/\\[a-zA-Z]+/g, '');
      return '<span class="math">' + t + '</span>';
    });
  }

  /* ---------------- 组装 ---------------- */
  function build(c) {
    var on = LENSES.filter(function (l) { return c.lenses[l.id]; });
    var cards = [];
    for (var i = 0; i < RULES.length; i++) {
      var r = RULES[i];
      if (!c.lenses[r.lens]) continue;
      var fire = false;
      try { fire = !!r.when(c); } catch (e) { fire = false; }
      if (!fire) continue;
      cards.push(materialize(r, c));
    }
    // 原始四重性读数作为第一条链
    var regs = {
      lens: 'stance', transient: true,
      prem: '一个政治模型是四重的：政治观、政治立场、政治路线、意识形态。',
      judge: '对政治观求导得到意识形态；政治立场取反函数族，其导数是政治路线。',
      claim: '政治观 $f(x)=$ ' + num(c.y) + '；意识形态 $f\'(x)=$ ' + num(c.d) + '；政治立场 $f^{-1}(x)=$ ' + (c.inv === null ? '不存在' : num(c.inv)) + '；政治路线 $(f^{-1})\'(x)=$ ' + (c.invd === null ? '不存在' : num(c.invd)) + '。',
      src: { ep: 'E13', term: '四重性' },
      tag: '补'
    };
    regs.prem = tex(regs.prem); regs.judge = tex(regs.judge); regs.claim = tex(regs.claim);
    cards.unshift(regs);

    var opts = OPTIONS.map(function (o) {
      var s = o.score(c);
      return { id: o.id, name: o.name, dir: o.dir, why: tex(o.why(c)), gain: tex(o.gain(c)), cost: tex(o.cost(c)), score: s, level: level(s) };
    }).sort(function (a, b) { return b.score - a.score; });

    // 分歧：不同视角给出互不还原的读法时显式并列
    var conflicts = [];
    if (c.lenses.parallax && c.lenses.stance) {
      conflicts.push({ a: '他者视角', b: '自我视角', note: '同一函数在他者眼里是连续对称的图像，在自我眼里是两极断裂：两种读法不能互相还原，这就是视差。' });
    }
    if (c.lenses.power && c.lenses.stance) {
      conflicts.push({ a: '二轴（庶政学）', b: '三轴（权力学）', note: '二轴里每个立场都自称目的为善；补上虚数轴，问题立刻变成谁能让对方付出代价。' });
    }
    if (c.id === 'tan' && c.lenses.inst) {
      conflicts.push({ a: '制度读法', b: '断裂读法', note: '制度要求可预期，而正切在边界处没有中间值：想制度化断裂，只能把它改写成反三角函数。' });
    }
    var per = PERSONAS.filter(function (p) { return p.id === c.persona; })[0] || null;
    return { cards: cards, options: opts, conflicts: conflicts, lensCount: on.length, persona: per };
  }

  function num(v) {
    if (v === null || v === undefined) return '无定义';
    var s = Math.abs(v).toFixed(2);
    if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
    return (v < 0 ? '\u2212' : '') + s;
  }

  function cite(cite, tagsById) {
    if (!cite) return '';
    var t = cite.term ? '《' + cite.term + '》' : '';
    return '<a href="#" class="xref cite-link" data-ep="' + cite.ep + '" data-term="' + (cite.term || '') + '">'
      + cite.ep + (t ? ' ' + t : '') + '</a>';
  }

  function toHTML(built, c) {
    var h = '';
    h += '<div class="sx-block sx-first"><h3>探针 · 四重性</h3>';
    h += '<div class="ro-row"><dt>纲领化 x</dt><dd>' + num(c.x) + '</dd></div>';
    h += '<div class="ro-row"><dt>行动性 y</dt><dd>' + num(c.y) + '</dd></div>';
    h += '<div class="ro-row"><dt>象限</dt><dd>' + c.quad + '</dd></div>';
    h += '<div class="ro-row"><dt>导数</dt><dd>' + num(c.d) + '</dd></div>';
    h += '<div class="ro-row"><dt>族</dt><dd>' + c.family + '</dd></div>';
    h += '</div>';

    h += '<div class="sx-block"><h3>规则链 · ' + built.lensCount + ' 个视角</h3>';
    if (built.persona) h += '<p class="sx-ask">提问者：' + built.persona.name + '　<span>' + built.persona.q + '</span></p>';
    if (!built.cards.length) h += '<p class="hint">当前视角下没有规则触发。换一个视角或尺度试试。</p>';
    for (var i = 0; i < built.cards.length; i++) {
      var k = built.cards[i];
      var lensName = (LENSES.filter(function (l) { return l.id === k.lens; })[0] || {}).name || '读数';
      h += '<article class="chain-card">'
        + '<p class="chain-head"><span class="chain-lens">' + lensName + '</span>'
        + ((k.tag === '补' || k.form) ? '<span class="mark mark-bu">补</span>' : '') + '</p>'
        + '<ol class="chain">'
        + '<li><span class="chain-tag">前提</span>' + k.prem + '</li>'
        + '<li><span class="chain-tag">判据</span>' + k.judge + '</li>'
        + '<li class="chain-claim"><span class="chain-tag">结论</span>' + k.claim + '</li>'
        + '</ol>'
        + (k.src ? '<p class="chain-src">依据 ' + cite(k.src) + '</p>' : '')
        + '</article>';
    }
    h += '</div>';

    if (built.conflicts.length) {
      h += '<div class="sx-block"><h3>分歧 · 不能互相还原的读法</h3>';
      for (var j = 0; j < built.conflicts.length; j++) {
        var f = built.conflicts[j];
        h += '<div class="conflict"><p class="conflict-head"><span>' + f.a + '</span><i>×</i><span>' + f.b + '</span></p><p>' + f.note + '</p></div>';
      }
      h += '</div>';
    }

    h += '<div class="sx-block"><h3>策略选项 · 按适配度排序</h3>';
    for (var m = 0; m < built.options.length; m++) {
      var o = built.options[m];
      h += '<details class="opt" data-level="' + o.level + '">'
        + '<summary><span class="opt-name">' + o.name + '</span><span class="opt-dir">' + o.dir + '</span>'
        + '<span class="opt-bar"><i style="width:' + Math.round(o.score * 100) + '%"></i></span>'
        + '<span class="opt-level">' + o.level + '</span></summary>'
        + '<div class="opt-body">'
        + '<p><span class="chain-tag">为何在此</span>' + o.why + '</p>'
        + '<p><span class="chain-tag">收益</span>' + o.gain + '</p>'
        + '<p><span class="chain-tag">代价</span>' + o.cost + '</p>'
        + '</div></details>';
    }
    h += '<p class="sx-foot">适配度由当前点的一阶、二阶导数、与单元边界的距离、值域是否封闭算出，属本系统的形式化补充 <span class="mark mark-bu">补</span>。规则链中的结论凡标“原”者出自整理后的文稿，可点击跳转。</p>';
    h += '</div>';
    return h;
  }

  var API = {
    LENSES: LENSES,
    PERSONAS: PERSONAS,
    RULES: RULES,
    OPTIONS: OPTIONS,
    build: build,
    toHTML: toHTML,
    lensDefaults: function () { var o = {}; LENSES.forEach(function (l) { o[l.id] = !!l.on; }); return o; }
  };
  global.SHUZHENG_STRATEGY = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof globalThis !== 'undefined' ? globalThis : this);
