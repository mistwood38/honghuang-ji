import type { ChainDef, Effect, RoamEvent } from "./state.ts";

/** Regional stories complete a task first; the gift arrives later through the existing delayed-event queue. */
export const RELIC_JOURNEYS: ChainDef[] = [
  { id: "bone-shore", name: "山骨与河岸", stages: ["bone-shore-1", "bone-shore-2"] },
  { id: "sword-ferry", name: "留锋渡人", stages: ["sword-ferry-1", "sword-ferry-2"] },
  { id: "soil-shelter", name: "棚外有春", stages: ["soil-shelter-1", "soil-shelter-2"] },
];
const step = (id: string): Effect => ({ t: "quest", id, stage: 1 });
const finish = (id: string, event: string, days: number): Effect[] => [
  { t: "quest", id, stage: 2, status: "done" },
  { t: "delay", event, days },
];
const wait = {
  id: "wait",
  text: "记下这件事，备好物资再来",
  result: ["你没有拿一句答应抵掉眼前缺少的东西。路和约定都还在，备好后可以继续这段因缘。"],
  effects: [],
};

export const RELIC_JOURNEY_EVENTS: RoamEvent[] = [
  {
    id: "bone-shore-1",
    place: "earth",
    title: "河床里有回声",
    once: true,
    weight: 6,
    chain: "bone-shore",
    stage: 0,
    prose: [
      "雨把河岸掏出一个洞。洞里露出的白色纹理像石，又比石温。一个背着伤者的巫停在岸边，先问你能不能看住水，再谈那是什么。",
      "磐生从上游掷来一段断绳：『先让岸上的人过。东西在那里很久了，不争这一刻。』",
    ],
    choices: [
      {
        id: "shore",
        text: "用 2 玄矿压住河岸，替行人护路",
        result: [
          "矿石沉进浅水，你把绳索绕过它们，让伤者先过河。白色纹理仍在水里，没有被当作报酬凿下来。",
          "磐生说，不周山脚有人懂得这道纹理。你们把松开的绳结留给了下一位过河者。",
        ],
        effects: [
          { t: "good", id: "ore", n: -2 },
          { t: "karma", id: "bone-kept-shore" },
          { t: "rep", id: "wu", n: 1 },
          step("bone-shore"),
        ],
      },
      {
        id: "wade",
        text: "涉入寒水托住绳索，冒着伤身的风险",
        result: [
          "寒水灌进袖口，你的手指几乎失去知觉。伤者过岸之后，你才发现自己一直握着那道白纹的边缘。",
          "你没有折取它。磐生替你裹住冻伤的手，请你往不周山脚看看那些长期负重的人。",
        ],
        effects: [
          { t: "stat", k: "life", n: -6 },
          { t: "karma", id: "bone-held-rope" },
          step("bone-shore"),
        ],
      },
    ],
  },
  {
    id: "bone-shore-2",
    place: "buzhou",
    title: "让肩膀歇一歇",
    once: true,
    weight: 0,
    chain: "bone-shore",
    stage: 1,
    prose: [
      "山脚的背篓摆成一排，最小的一只也装着石头。磐生坐在地上，把勒进皮肉的肩绳慢慢解开。所谓巫骨坚硬，在这里听起来更像一句不许休息的话。",
      "他指着两包空药布：『药够了，就让今日这一班人都歇一歇。河岸的东西，我们也会替你问清。』",
    ],
    choices: [
      {
        id: "tend",
        text: "拿出 2 灵草，替负石者包扎",
        result: [
          "你把灵草揉进药布，没有催任何人尽快站起来。有人第一次把背篓放得那么远，怕一伸手就又背上。",
          "磐生请你放心走自己的路。两日后，他会托沿河的风带回那道白纹的消息。",
        ],
        effects: [
          { t: "good", id: "herb", n: -2 },
          { t: "rel", id: "pansheng", n: 2 },
          ...finish("bone-shore", "bone-shore-gift", 2),
        ],
      },
      wait,
    ],
  },
  {
    id: "bone-shore-gift",
    place: "any",
    title: "山把一小段重量交给你",
    once: true,
    weight: 0,
    prose: [
      "风送来一个用旧肩布包好的小包。里头的骨片只有指节长，纹理却像一整条山脉。磐生的信很短：这是河床自行脱落的盘古骨，不曾从活着的山根上硬取。",
      "信背面还写着换肩的方法。护身的东西，原来可以从让别人歇息开始。",
    ],
    variants: [
      {
        when: "bone-kept-shore",
        paragraphs: ["那两块护岸的玄矿还压在水里。如今有人每天检查绳结，不再等路人冒险。"],
      },
      {
        when: "bone-held-rope",
        paragraphs: [
          "你的手已经回暖。磐生特意寄来一截柔软的新绳，说下次不必再用冻僵的指节扛住整条河。",
        ],
      },
    ],
    choices: [
      {
        id: "receive",
        text: "接过骨片，也收好换肩的方法",
        result: [
          "骨纹贴近掌心，沉而不冷。你将盘古骨收入行囊；往后可以在储物中御使，让它替自己承住一部分冲击。",
        ],
        effects: [
          { t: "item", id: "pangu-bone" },
          { t: "karma", id: "bone-shore-received" },
        ],
      },
    ],
  },
  {
    id: "sword-ferry-1",
    place: "bloodsea",
    title: "断弦的渡口",
    once: true,
    weight: 6,
    chain: "sword-ferry",
    stage: 0,
    prose: [
      "血海边有一道细得看不见的锋，夜夜割断系船的绳。摆渡人已经换了三次绳，却没有离开；对岸还有人等着送药。",
      "岸上有人说，锋若够利，迟早会被收作法宝。摆渡人没有接话，只把空药篮放在船头。",
    ],
    choices: [
      {
        id: "anchor",
        text: "用 2 玄矿做护锚，稳住渡船",
        result: [
          "你把护锚压进潮线，先让今日的药船靠岸。锋从铁石间掠过，削出一道细白的痕。",
          "摆渡人记下锋经过的时刻。等潮声稍静，你们还得找出它为什么总朝归路斩来。",
        ],
        effects: [
          { t: "good", id: "ore", n: -2 },
          { t: "karma", id: "sword-anchored" },
          step("sword-ferry"),
        ],
      },
      {
        id: "hold",
        text: "握住将断的船绳，冒险护船靠岸",
        result: [
          "细锋划开手背，药篮却没有落进海里。你等船贴住岸石才松开绳，把血擦在无人使用的旧布上。",
          "摆渡人没有赞你勇。他请你下次备好清露，不必再拿自己的手当船锚。",
        ],
        effects: [
          { t: "stat", k: "life", n: -8 },
          { t: "karma", id: "sword-held-ferry" },
          step("sword-ferry"),
        ],
      },
    ],
  },
  {
    id: "sword-ferry-2",
    place: "bloodsea",
    title: "锋也要知道何处停",
    once: true,
    weight: 0,
    chain: "sword-ferry",
    stage: 1,
    prose: [
      "潮退后，岩壁里露出一道残阵。旧阵只认得来者，不认得归人，所以每条回家的船都被当成闯入者。",
      "你把药篮放在阵前，才听见那道锋停了半拍。用清露洗出被盐覆盖的界线，就有机会把归路留出来。",
    ],
    choices: [
      {
        id: "wash",
        text: "用 2 清露洗阵，给归船留下缺口",
        result: [
          "你洗开阵纹，没有试着把全部锋芒握在自己手里。第一条归船经过时，细锋停在了船篷之外。",
          "摆渡人说，阵的余声要过两日才散。你可以先行；留在这道缺口里的东西，会记得怎样找到你。",
        ],
        effects: [
          { t: "good", id: "dew", n: -2 },
          { t: "rep", id: "jie", n: 2 },
          ...finish("sword-ferry", "sword-ferry-gift", 2),
        ],
      },
      wait,
    ],
  },
  {
    id: "sword-ferry-gift",
    place: "any",
    title: "无形之锋",
    once: true,
    weight: 0,
    prose: [
      "第二日潮声抵达你的梦里，一道极细的剑影悬在指间。它没有带来剑柄，只带来那条能让归船通过的空隙。",
      "这是诛仙剑阵留下的一缕剑意。锋利仍在，去向却要由持有者自己承担。",
    ],
    choices: [
      {
        id: "receive",
        text: "收下剑意，记住渡口那道缺口",
        result: [
          "你收起锋芒，先确认袖中没有误伤旁人。诛仙剑意入了行囊；御使时，它会成为斗法中的实际助力。",
        ],
        effects: [
          { t: "item", id: "zhuxian" },
          { t: "karma", id: "sword-ferry-received" },
        ],
      },
    ],
  },
  {
    id: "soil-shelter-1",
    place: "wahuan",
    title: "雨里缺了一块",
    once: true,
    weight: 6,
    chain: "soil-shelter",
    stage: 0,
    prose: [
      "女娲谷外的雨棚漏了一个洞。青荇用药囊挡住雨，棚下刚发芽的种子还没有长出足够结实的根。",
      "有人想把不长芽的泥都换掉。她摇头：『先看水把它们冲到哪里去了，再说哪一块没有用。』",
    ],
    choices: [
      {
        id: "clay",
        text: "拿出 2 息壤泥，补住漏水的棚脚",
        result: [
          "泥沿棚脚接成一圈，水有了慢慢渗过的地方。青荇把一盘受伤的小苗交给你，请你带到人族火塘。",
          "她没有给那些不长芽的泥判死。你们把它们也装进了盘底。",
        ],
        effects: [
          { t: "good", id: "clay", n: -2 },
          { t: "karma", id: "soil-mended" },
          step("soil-shelter"),
        ],
      },
      {
        id: "shelter",
        text: "站进雨里替幼苗挡水，冒着受寒的风险",
        result: [
          "你撑住棚布，直到雨势减弱。肩上冷透了，小苗却还站着。青荇给你一盘待移的幼苗，也把盘底的旧泥一并留下。",
          "人族火塘有一片空地，正等有人把泥与根安稳放下。",
        ],
        effects: [
          { t: "stat", k: "life", n: -6 },
          { t: "karma", id: "soil-sheltered" },
          step("soil-shelter"),
        ],
      },
    ],
  },
  {
    id: "soil-shelter-2",
    place: "tribes",
    title: "棚外也要有春",
    once: true,
    weight: 0,
    chain: "soil-shelter",
    stage: 1,
    prose: [
      "阿薪把最暖的一块地让给幼苗，自己坐到了风口。你问为什么不把它们全种在屋里，她指了指往来的脚印：『总有人明日才来。』",
      "两份火种能温土，两份灵草能覆盖裂口。幼苗在这里长稳以后，棚外的人也会有可接手的东西。",
    ],
    choices: [
      {
        id: "plant",
        text: "用 2 火种和 2 灵草温土，安置幼苗",
        result: [
          "你把旧泥留在根下，没有因为它不起眼就倒掉。阿薪给后来的人留了一小块位置，谁来都能添一点照看。",
          "这件事已经安顿。等过三日，幼苗是否站稳的消息，会随行路人送到你身边。",
        ],
        effects: [
          { t: "good", id: "seed", n: -2 },
          { t: "good", id: "herb", n: -2 },
          { t: "rel", id: "axin", n: 2 },
          { t: "rep", id: "hearth", n: 2 },
          ...finish("soil-shelter", "soil-shelter-gift", 3),
        ],
      },
      wait,
    ],
  },
  {
    id: "soil-shelter-gift",
    place: "any",
    title: "一撮会生长的土",
    once: true,
    weight: 0,
    prose: [
      "行路人带来一只小陶盒。阿薪说，盘底那撮旧泥自己长厚了，托起了新根；青荇认出它是息壤，便取了不伤苗的一小撮寄来。",
      "盒盖里刻着一个空圈，提醒你种东西时，也给尚未抵达的人留地。",
    ],
    choices: [
      {
        id: "receive",
        text: "收好息壤，让它继续温养生长之物",
        result: [
          "陶盒不重，合上时却有很轻的一次起伏。息壤收入行囊；在储物页御使后，它会照看你自己的药圃。",
        ],
        effects: [
          { t: "item", id: "xirang" },
          { t: "karma", id: "soil-shelter-received" },
        ],
      },
    ],
  },
];
