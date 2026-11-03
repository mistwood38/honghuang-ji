import type { Effect, EventChoice, PlaceId, RoamEvent } from "./state.ts";

function fx(...effects: Effect[]): Effect[] {
  return effects;
}

function choice(
  id: string,
  text: string,
  result: string[],
  effects: Effect[],
  extra?: Pick<EventChoice, "when" | "unless">,
): EventChoice {
  return { id, text, result, effects, ...extra };
}

function ev(
  id: string,
  place: PlaceId | "any",
  title: string,
  prose: string[],
  choices: EventChoice[],
  extra?: Partial<RoamEvent>,
): RoamEvent {
  return { id, place, title, prose, choices, once: true, weight: 4, ...extra };
}

const stone = "stone";
const blood = "blood-gift";
const purple = "purple-wait";
const clay = "clay-life";
const jie = "jie-door";
const chan = "chan-trial";
const register = "yao-register";
const burden = "wu-burden";
const vein = "cave-vein";
const pill = "pill-trib";
const beast = "beast-pact";
const peach = "peach-road";
const fire = "longhan-fire";
const debt = "spirit-debt";
const nights = "demon-nights";
const hearth = "first-fire";
const spare = "three-yao";
const omens = "board-omen";
const friend = "old-friend";
const echo = "pillar-echo";

export const CHAINS: { id: string; name: string; stages: string[] }[] = [
  { id: stone, name: "不周碎问", stages: ["stone-1", "stone-2", "stone-3"] },
  { id: blood, name: "血海馈赠", stages: ["blood-1", "blood-2", "blood-3"] },
  { id: purple, name: "紫气未落", stages: ["purple-1", "purple-2", "purple-3"] },
  { id: clay, name: "余泥", stages: ["clay-1", "clay-2", "clay-3"] },
  { id: jie, name: "截教门槛", stages: ["jie-1", "jie-2", "jie-3"] },
  { id: chan, name: "玉虚试心", stages: ["chan-1", "chan-2", "chan-3"] },
  { id: register, name: "妖庭名册", stages: ["yao-1", "yao-2", "yao-3"] },
  { id: burden, name: "承重", stages: ["wu-1", "wu-2", "wu-3"] },
  { id: vein, name: "灵眼", stages: ["vein-1", "vein-2", "vein-3"] },
  { id: pill, name: "丹劫", stages: ["pill-1", "pill-2", "pill-3"] },
  { id: beast, name: "未名灵兽", stages: ["beast-1", "beast-2", "beast-3"] },
  { id: peach, name: "弱水外的桃", stages: ["peach-1", "peach-2", "peach-3"] },
  { id: fire, name: "龙汉余火", stages: ["fire-1", "fire-2", "fire-3"] },
  { id: debt, name: "灵石之债", stages: ["debt-1", "debt-2", "debt-3"] },
  { id: nights, name: "心魔三夜", stages: ["night-1", "night-2", "night-3"] },
  { id: hearth, name: "第一把火", stages: ["firetang-1", "firetang-2", "firetang-3"] },
  { id: spare, name: "三遇海妖", stages: ["yaomeet-1", "yaomeet-2", "yaomeet-3"] },
  { id: omens, name: "榜前三兆", stages: ["omen-1", "omen-2", "omen-3"] },
  { id: friend, name: "故人重逢", stages: ["friend-1", "friend-2", "friend-3"] },
  { id: echo, name: "天柱回声", stages: ["echo-1", "echo-2", "echo-3"] },
];

export const EVENTS: RoamEvent[] = [
  ev("stone-1", "buzhou", "石在响", [
    "不周的一块碎石自己在响。响声很直，直得像有人用骨头敲你的牙。",
    "巫族的人走过，不捡。他们说直的东西自己会找主人，找错了，山会来要。",
  ], [
    choice("take", "把碎石带走", [
      "石一入怀就停了。停不是安分，是它开始用你的心跳当鼓。",
      "你知道山以后会来找这笔账。",
    ], fx({ t: "item", id: "buzhou-stone" }, { t: "karma", id: "took-stone" }, { t: "quest", id: stone, stage: 1 })),
    choice("bury", "埋回山根，拍实", [
      "你把石按进缝里。缝合上的声音很小，像山在说：这次算你懂事。",
      "懂事没有奖。你的掌心只留下一点矿粉。",
    ], fx({ t: "good", id: "ore", n: 1 }, { t: "karma", id: "buried-stone" }, { t: "rep", id: "wu", n: 6 }, { t: "quest", id: stone, stage: 1 })),
  ], { chain: stone, stage: 0 }),

  ev("stone-2", "buzhou", "山来对账", [
    "第二次经过，不周的风专门绕你。绕，是认得。",
    "有巫坐在阴影里，不问你偷没偷，只问你还扛不扛得动自己的选择。",
  ], [
    choice("return", "把那块直的东西还回去", [
      "石离怀的一瞬，心跳空了一拍。山收下了，没有说原谅。",
      "巫点了一下头。点头比赐法更重。",
    ], fx({ t: "drop", id: "took-stone" }, { t: "karma", id: "returned-stone" }, { t: "rel", id: "gonggong", n: 8 }, { t: "quest", id: stone, stage: 2 }), { when: "took-stone" }),
    choice("keep", "不还。响声是你的", [
      "你把衣襟按紧。巫看见了，没有抢。不抢，是把你记成另一类人。",
      "夜里石又响，响的是你的名字的前半截。",
    ], fx({ t: "stat", k: "dao", n: 2 }, { t: "stat", k: "demon", n: 4 }, { t: "quest", id: stone, stage: 2 }), { when: "took-stone" }),
    choice("roll", "帮他们把另一块滚开", [
      "你把肩放进石缝。石动了，你的骨头也动了。",
      "滚开之后路通了。通了的路会有更多人来，你不知道这是好是坏。",
    ], fx({ t: "stat", k: "life", n: -6 }, { t: "stat", k: "kill", n: 2 }, { t: "rep", id: "wu", n: 8 }, { t: "quest", id: stone, stage: 2 }), { unless: "took-stone" }),
    choice("leave", "这一次不插手", [
      "你绕开。绕开也是一种回答。山把你的脚步记成「尚未」。",
    ], fx({ t: "stat", k: "qi", n: 2 }, { t: "quest", id: stone, stage: 2 }), { unless: "took-stone" }),
  ], {
    chain: stone,
    stage: 1,
    need: [],
    variants: [
      { when: "took-stone", paragraphs: ["怀中那块石头先你一步发热。它在认门。"] },
      { when: "buried-stone", paragraphs: ["你的手是空的。空着手的人，山会让他走近一点。"] },
    ],
  }),

  ev("stone-3", "buzhou", "折声之前", [
    "天与山争论的那天还没到，可空气已经先疼了。",
    "你站在能看见那根骨头的地方。撑，或看，都会被以后的雨记住。",
  ], [
    choice("hold", "用身体去垫那一下将到的歪", [
      "你没有拦住历史。你只是让歪来的时候，下面多了一寸缓冲。",
      "缓冲很贵。你的道躯会记得这笔贵。天倾仍会倾，只是火塘那边的漏，晚了一步。",
    ], fx({ t: "stat", k: "life", n: -14 }, { t: "stat", k: "virtue", n: 8 }, { t: "wound", n: 2 }, { t: "karma", id: "held-pillar" }, { t: "skew", n: 10 }, { t: "quest", id: stone, stage: 3, status: "done" })),
    choice("watch", "站远，把折法看清楚", [
      "你看清了直的东西如何断。看清没有让你快乐，它让你以后少犯一种笨。",
      "雨来的时候，你知道哪边会先湿。",
    ], fx({ t: "stat", k: "dao", n: 4 }, { t: "stat", k: "qi", n: 3 }, { t: "karma", id: "witnessed-fall" }, { t: "quest", id: stone, stage: 3, status: "done" })),
  ], { chain: stone, stage: 2 }),

  ev("blood-1", "bloodsea", "海送上来的一口", [
    "血海退潮时，沙滩上留着一口不会干的红。红的边缘在呼吸。",
    "有人说喝了能记得开天前的饿。也有人说，记得饿的人最后会变成饿本身。",
  ], [
    choice("drink", "喝下去", [
      "一口入腹，夜就在胃里找到了房子。房子不要房租，只要你有时替它出门。",
      "你还是你。只是你饿的时候，会比别人更像自己。",
    ], fx({ t: "item", id: "chaos-qi" }, { t: "stat", k: "demon", n: 6 }, { t: "stat", k: "dao", n: 3 }, { t: "karma", id: "drank-sea" }, { t: "quest", id: blood, stage: 1 })),
    choice("cover", "用沙盖住，不让后来的人踩到", [
      "你盖得很仔细。仔细是一种不信任：你不信自己路过第二次还能不喝。",
      "海记住了这点不信任，竟然有一点高兴。",
    ], fx({ t: "stat", k: "virtue", n: 4 }, { t: "karma", id: "covered-sea" }, { t: "rel", id: "tongtian", n: 4 }, { t: "quest", id: blood, stage: 1 })),
  ], { chain: blood, stage: 0 }),

  ev("blood-2", "bloodsea", "饿来讨话", [
    "夜里有东西用你的声音说话，坐在你脚边，很有礼貌。",
    "它不问你要命。它问你还认不认那口红。",
  ], [
    choice("own", "承认：那口饿是我的", [
      "承认之后它安静了。安静比被赶走更难。",
      "你获得一种难看的诚实。诚实能用来修炼，也能用来伤人。",
    ], fx({ t: "stat", k: "demon", n: -2 }, { t: "xiu", n: 16 }, { t: "karma", id: "owned-hunger" }, { t: "quest", id: blood, stage: 2 }), { when: "drank-sea" }),
    choice("fight", "把它从嗓子里赶出去", [
      "你赢了这一夜。嗓子是哑的。哑着的人，第二天说话会更慢，也更真。",
    ], fx({ t: "battle", id: "demon" }, { t: "karma", id: "fought-hunger" }, { t: "quest", id: blood, stage: 2 }), { when: "drank-sea" }),
    choice("feed", "把今日的灵气分给海，当没有喝过", [
      "海收了。收的时候没有嘲讽你。你比那些嘲笑「没喝」的人更明白它的味道。",
    ], fx({ t: "ling", n: -8 }, { t: "stat", k: "virtue", n: 5 }, { t: "quest", id: blood, stage: 2 }), { when: "covered-sea" }),
    choice("walk", "沿海岸走远，不跟它谈", [
      "走远只能对付一夜。可一夜有时就是修行的全部单位。",
    ], fx({ t: "stat", k: "qi", n: 2 }, { t: "quest", id: blood, stage: 2 }), { when: "covered-sea" }),
  ], { chain: blood, stage: 1 }),

  ev("blood-3", "bloodsea", "座还空着", [
    "截教的人在岸上摆座位。座位不够，他们就说：不够就站着，站着也算入座。",
    "你被看见了。看见不是邀请，是询问。",
  ], [
    choice("sit", "站进那个没有名字的空位", [
      "没有人赐你道号。浪声替你占住了那一块地。",
      "从此海风找你时，会先找这块地。",
    ], fx({ t: "rep", id: "jie", n: 10 }, { t: "rel", id: "tongtian", n: 6 }, { t: "art", id: "zhuxian" }, { t: "karma", id: "stood-with-jie" }, { t: "quest", id: blood, stage: 3, status: "done" })),
    choice("refuse", "说你的饿不代表你的门", [
      "你说完，自己也松了一点。门派最喜欢替人解释他的伤口。你把解释权留下了。",
    ], fx({ t: "stat", k: "dao", n: 3 }, { t: "karma", id: "refused-jie-seat" }, { t: "quest", id: blood, stage: 3, status: "done" })),
  ], { chain: blood, stage: 2 }),

  ev("purple-1", "zixiao", "门外的灯", [
    "紫霄的灯溢了一点。溢出来的不是光，是一种「原来如此」的尾巴。",
    "尾巴落在阶上，谁先伸手，谁就得承认自己在伸手。",
  ], [
    choice("hand", "伸手接住", [
      "紫气入掌，凉得诚实。它没有告诉你天机，它只是让你少骗自己一次。",
    ], fx({ t: "item", id: "purple-qi" }, { t: "stat", k: "dao", n: 4 }, { t: "karma", id: "caught-purple" }, { t: "quest", id: purple, stage: 1 })),
    choice("sit", "把手坐在身下，只听", [
      "你听完一截。一截不是全道。可全道本来就不该在门外被捡走。",
      "灯把你记成「肯坐着的人」。",
    ], fx({ t: "xiu", n: 18 }, { t: "karma", id: "listened-only" }, { t: "rel", id: "hongjun", n: 5 }, { t: "quest", id: purple, stage: 1 })),
  ], { chain: purple, stage: 0, minRealm: 1 }),

  ev("purple-2", "zixiao", "座位有数", [
    "门里有人出来点人数。点到门外时，他停了一下，好像在等你自己说进或不进。",
  ], [
    choice("enter", "说：我进来，但不替谁占座", [
      "你进到能看见灯花的地方。灯花没有因你而亮。你也不因此自卑。",
      "有人皱眉。皱眉是他们的功课。",
    ], fx({ t: "stat", k: "dao", n: 5 }, { t: "karma", id: "entered-zixiao" }, { t: "rel", id: "yuanshi", n: 3 }, { t: "quest", id: purple, stage: 2 }), { when: "caught-purple" }),
    choice("stay", "说：我还握着别的东西，不进", [
      "你把自己的拒绝说清楚。清楚的拒绝，比含糊的跪更干净。",
    ], fx({ t: "stat", k: "qi", n: 4 }, { t: "karma", id: "stayed-out" }, { t: "quest", id: purple, stage: 2 })),
  ], {
    chain: purple,
    stage: 1,
    variants: [{ when: "listened-only", paragraphs: ["你没有紫气可炫耀。点人数的人反而多看了你一眼。"] }],
  }),

  ev("purple-3", "kunlun", "道问你要什么", [
    "昆仑的夜里，那截没听完的话回来了。它不问世界，它问你。",
    "你要位置，还是要把那句话自己说完。",
  ], [
    choice("self", "把那句话自己说完", [
      "你说得很慢，说错了两处，又自己改。改的时候没有人喝彩。",
      "道行不是因此暴涨。它只是终于有了你的口音。",
    ], fx({ t: "xiu", n: 28 }, { t: "stat", k: "dao", n: 6 }, { t: "karma", id: "spoke-dao" }, { t: "quest", id: purple, stage: 3, status: "done" })),
    choice("seat", "去问玉虚要一个名分", [
      "名分来得比想象快。快，是因为它早就准备好收听过道的人。",
      "你得到一句戒，也得到一道看不见的篱笆。",
    ], fx({ t: "rep", id: "chan", n: 8 }, { t: "art", id: "yuxu" }, { t: "karma", id: "asked-seat" }, { t: "quest", id: purple, stage: 3, status: "done" })),
  ], { chain: purple, stage: 2 }),

  ev("clay-1", "wahuan", "炉边多出来的一块泥", [
    "女娲的炉边，有一块泥没有被捏进任何人。它自己在动，像还没决定要不要做人。",
    "宫里的人忙着补天，没有空看这块多余。",
  ], [
    choice("shape", "用手心的温度帮它定一个大致", [
      "你没有造人。你只是让一块泥不再那么怕冷。",
      "它记住你的指纹。指纹以后会在某个人的掌纹里隐约出现。",
    ], fx({ t: "good", id: "clay", n: 1 }, { t: "karma", id: "shaped-clay" }, { t: "rel", id: "nuwa", n: 8 }, { t: "stat", k: "virtue", n: 4 }, { t: "quest", id: clay, stage: 1 })),
    choice("leave-clay", "不碰。形不该由你决定", [
      "你缩回手。泥自己慢慢圆了一点。你不确定这是不是更好。",
      "不确定被你留下来，当一种修养。",
    ], fx({ t: "stat", k: "dao", n: 2 }, { t: "karma", id: "spared-shape" }, { t: "quest", id: clay, stage: 1 })),
  ], { chain: clay, stage: 0 }),

  ev("clay-2", "tribes", "指纹认人", [
    "火塘边一个孩子的掌心有一道纹，和你上次离开娲皇宫时指腹的裂口一样。",
    "孩子不问你是谁。孩子问你今晚冷不冷。",
  ], [
    choice("stay-night", "留下来帮他守前半夜", [
      "你守到星移。孩子睡了，掌纹在梦里张开，又合上。",
      "你没有告诉他那道纹从哪来。有些来处，说了就会变成债。",
    ], fx({ t: "stat", k: "virtue", n: 6 }, { t: "karma", id: "kept-night" }, { t: "rel", id: "nuwa", n: 4 }, { t: "quest", id: clay, stage: 2 })),
    choice("tell", "告诉他：你曾被一双手暖过", [
      "孩子听懂了一半。一半就够他以后对炉火客气。",
      "客气会传开。传开的东西不再只属于你。",
    ], fx({ t: "stat", k: "qi", n: 3 }, { t: "karma", id: "told-origin" }, { t: "delay", event: "delay-incense", days: 12 }, { t: "quest", id: clay, stage: 2 })),
  ], { chain: clay, stage: 1 }),

  ev("clay-3", "wahuan", "补与不补", [
    "天的洞对准了一小片将要有人的地。五色石不够，炉问所有在场的人：谁肯被烧一点。",
  ], [
    choice("burn", "把今日的修为送进炉里", [
      "火吃掉你辛苦留住的一口气。天洞小了一圈，没有完全合上。",
      "没有完全，也好。完全的天，下面的人会忘了自己曾经需要补。",
    ], fx({ t: "xiu", n: -25 }, { t: "stat", k: "virtue", n: 8 }, { t: "karma", id: "fed-furnace" }, { t: "art", id: "mudra" }, { t: "quest", id: clay, stage: 3, status: "done" })),
    choice("hold-clay", "只补到火塘上方，其余不管", [
      "你把力用在最小的那一块。宏大的人会说你小气。",
      "当夜，那一小块地下的人没有淋到天河。",
    ], fx({ t: "stat", k: "life", n: -6 }, { t: "stat", k: "virtue", n: 5 }, { t: "karma", id: "local-mend" }, { t: "quest", id: clay, stage: 3, status: "done" })),
  ], { chain: clay, stage: 2 }),

  ev("jie-1", "bloodsea", "门槛上的水", [
    "截教不设高门槛。水就是门槛。你踩进去，裤脚会记住这里。",
    "一个执剑的弟子拦了拦，又自己笑了：拦什么，来都来了。",
  ], [
    choice("step", "踩进去，先做随众", [
      "水没过脚踝。没有人要你跪。不跪比跪更考验你还想不想走。",
    ], fx({ t: "sect", id: "jie", rank: 0 }, { t: "karma", id: "joined-jie" }, { t: "rep", id: "jie", n: 6 }, { t: "quest", id: jie, stage: 1 })),
    choice("ask", "先问：入了座，还走得掉吗", [
      "弟子想了想，说：走得掉的是人，走不掉的是你在这里听见的那句话。",
      "你把这句话带回岸上，没有入门。",
    ], fx({ t: "stat", k: "dao", n: 2 }, { t: "karma", id: "asked-jie" }, { t: "quest", id: jie, stage: 1, status: "failed" })),
  ], { chain: jie, stage: 0 }),

  ev("jie-2", "bloodsea", "阵要一个人", [
    "阵脚缺一块。缺的不是石头，是一个肯在那里站满一个时辰的活人。",
    "弟子看你，眼神很光明，光明得有点残酷。",
  ], [
    choice("stand", "去站满那个时辰", [
      "阵把你的影子拉长，又还你。还你的时候少了一点私人的脾气。",
      "你活着走下来。活着，就是这份差事最高的工钱。",
    ], fx({ t: "contrib", n: 8 }, { t: "stat", k: "life", n: -8 }, { t: "wound", n: 1 }, { t: "karma", id: "stood-array" }, { t: "quest", id: jie, stage: 2 })),
    choice("send", "建议换一块石头，不要换人", [
      "你说完，阵眼的人沉默。沉默之后他们真的换了石头。",
      "石头不会抗议。你不确定自己是救了人，还是把阵教得更冷。",
    ], fx({ t: "rep", id: "jie", n: -2 }, { t: "stat", k: "virtue", n: 4 }, { t: "karma", id: "spared-array" }, { t: "quest", id: jie, stage: 2 })),
  ], { chain: jie, stage: 1, sect: "jie" }),

  ev("jie-3", "east", "剑意指向朝歌未有的方向", [
    "很久以后的战场还没发生，剑意却先指了指东海。弟子来问你：若万物有灵，灵与灵相争时，剑站哪边。",
  ], [
    choice("wave", "让剑先对着浪，别对着名字", [
      "剑意砍碎一层浪。浪没有名字，所以死得很干净，也很无用。",
      "弟子失望了一点。你松了一点。",
    ], fx({ t: "spell", id: "zhuxian" }, { t: "karma", id: "sword-on-wave" }, { t: "quest", id: jie, stage: 3, status: "done" })),
    choice("name", "说：站在还没有座位的那边", [
      "这句话会被传得很远，远到失真。失真之后它会回来打你。",
      "你现在还不知道。你只知道自己说的时候是真的。",
    ], fx({ t: "rep", id: "jie", n: 8 }, { t: "stat", k: "kill", n: 3 }, { t: "karma", id: "sword-with-seatless" }, { t: "delay", event: "delay-jie-rumor", days: 16 }, { t: "quest", id: jie, stage: 3, status: "done" })),
  ], { chain: jie, stage: 2 }),

  ev("chan-1", "kunlun", "门问你挡了谁", [
    "玉虚门外没有守卫。风自己问：你这一路走来，挡过谁的光。",
    "问完它不等你。不等，是给你时间说实话。",
  ], [
    choice("honest", "说出一个你确实挡过的人", [
      "风听完，门缝宽了一指。不是奖赏，是允许你把这句话带进去。",
    ], fx({ t: "stat", k: "virtue", n: 3 }, { t: "karma", id: "honest-gate" }, { t: "rep", id: "chan", n: 5 }, { t: "quest", id: chan, stage: 1 })),
    choice("silent", "不答，在门外再坐一日", [
      "一日结束，风换了问法，变成：你怕的是挡过别人，还是怕被说中。",
      "你仍不答。不答也被记下了。",
    ], fx({ t: "xiu", n: 14 }, { t: "karma", id: "silent-gate" }, { t: "quest", id: chan, stage: 1 })),
  ], { chain: chan, stage: 0 }),

  ev("chan-2", "kunlun", "戒律的刺", [
    "内门抄给你半页戒。半页很短，短得能扎人。",
    "刺在「不可」两个字上。不可后面是空白，空白要你自己填。",
  ], [
    choice("fill", "填上：不可拿别人的劫成就自己", [
      "抄录的人看了看，没说好，也没涂掉。",
      "你的字留在玉虚的边页上，像一根小小的刺，也刺向你自己。",
    ], fx({ t: "art", id: "yuxu" }, { t: "karma", id: "wrote-precept" }, { t: "contrib", n: 6 }, { t: "quest", id: chan, stage: 2 })),
    choice("blank", "把空白留着", [
      "你说戒律一旦写满，就会开始伤害写的时候想不到的人。",
      "他们让你把半页还回去。还回去的时候，你仍记得那些不可。",
    ], fx({ t: "stat", k: "dao", n: 3 }, { t: "karma", id: "left-blank" }, { t: "rel", id: "yuanshi", n: -2 }, { t: "quest", id: chan, stage: 2 })),
  ], { chain: chan, stage: 1 }),

  ev("chan-3", "kunlun", "篱笆", [
    "山要收一拨外面的灵来做苗。收的方式是一道篱笆：进来的被护住，没进来的风更大。",
    "你被问要不要帮忙插篱笆。",
  ], [
    choice("plant", "帮忙把篱笆插直", [
      "苗活了不少。篱笆外有一只很小的灵被风掀下山。你听见了，没有回头。",
      "没有回头这件事，会在以后某夜自己找上门。",
    ], fx({ t: "rep", id: "chan", n: 8 }, { t: "sect", id: "chan", rank: 1 }, { t: "karma", id: "planted-fence" }, { t: "delay", event: "delay-fence", days: 14 }, { t: "quest", id: chan, stage: 3, status: "done" })),
    choice("gap", "故意留下一道够一个人通过的缝", [
      "缝很小。小缝活成了一个人的路。",
      "管篱笆的人后来发现了，没有拆。不拆，是因为他也不确定戒律是否该密不透风。",
    ], fx({ t: "stat", k: "virtue", n: 6 }, { t: "karma", id: "left-gap" }, { t: "rel", id: "yuanshi", n: 2 }, { t: "quest", id: chan, stage: 3, status: "done" })),
  ], { chain: chan, stage: 2 }),

  ev("yao-1", "east", "名册摊开", [
    "妖庭的名册用光写成。光一照，没有名字的精魂会显出轮廓，像被催着出生。",
    "执笔的侍从问你：你是来登记，还是来看别人被登记。",
  ], [
    choice("reg", "把自己的形登记上去", [
      "名字落下的时候，你的影子规矩了一瞬。规矩很舒服，也很窄。",
    ], fx({ t: "karma", id: "registered-yao" }, { t: "rep", id: "yao", n: 8 }, { t: "stat", k: "qi", n: 4 }, { t: "quest", id: register, stage: 1 })),
    choice("watch-reg", "只看，不把名字给出去", [
      "你看着一只鱼被赐名，赐完它就不会再随便游走。",
      "你把手背到身后，保住自己的无名。",
    ], fx({ t: "stat", k: "dao", n: 2 }, { t: "karma", id: "nameless-yao" }, { t: "quest", id: register, stage: 1 })),
  ], { chain: register, stage: 0 }),

  ev("yao-2", "east", "钟要分类", [
    "东皇钟响了一下。一下就够把岸上的生灵分成「朝内」和「朝外」。",
    "你站在分类将至的线上。",
  ], [
    choice("in", "往钟声里踏半步", [
      "半步之后，你被算成暂时的自己人。自己人的好处是少挨一次驱赶。",
      "代价是下一次钟响，你会习惯性地站到同一边。",
    ], fx({ t: "item", id: "bell" }, { t: "karma", id: "stepped-bell" }, { t: "quest", id: register, stage: 2 }), { when: "registered-yao" }),
    choice("out", "往海雾里退", [
      "雾收下你。钟声变得发闷，闷是一种自由。",
    ], fx({ t: "stat", k: "qi", n: -1 }, { t: "stat", k: "dao", n: 3 }, { t: "karma", id: "retreated-bell" }, { t: "quest", id: register, stage: 2 })),
  ], { chain: register, stage: 1 }),

  ev("yao-3", "east", "十日还没出全", [
    "树上的光太多，有人提议让它们同时出来看看。看看，海就会沸。",
    "你若有一点位置，现在可以用。若没有，也可以拉一个人的袖子。",
  ], [
    choice("sleeve", "拉住提议的人的袖子", [
      "你只拉住了一只袖子。光仍旧多，可这一日没有一起落下。",
      "海因此少烫了一层。没人把这层记到你名下。",
    ], fx({ t: "stat", k: "virtue", n: 5 }, { t: "karma", id: "held-suns" }, { t: "rel", id: "dijun", n: -3 }, { t: "quest", id: register, stage: 3, status: "done" })),
    choice("cheer", "说：让它们出来，朝才像样", [
      "光出来的那一刻很华美。华美过去，岸上的盐都白得发苦。",
      "你的名字若在册上，会被人称赞；若不在，也会被盐记住。",
    ], fx({ t: "rep", id: "yao", n: 6 }, { t: "stat", k: "kill", n: 2 }, { t: "karma", id: "cheered-suns" }, { t: "quest", id: register, stage: 3, status: "done" })),
  ], { chain: register, stage: 2 }),

  ev("wu-1", "buzhou", "先扛一块小的", [
    "一个年轻巫把一块一人高的石头推向你，说：不是惩罚。是问话。",
    "问话的内容是：你的道理有多重。",
  ], [
    choice("lift", "扛起来，直到他说可以放下", [
      "你扛到视线发黑。他说可以的时候，你几乎不信。",
      "放下之后，肩上的印子比任何口诀都清楚。",
    ], fx({ t: "stat", k: "life", n: -8 }, { t: "stat", k: "kill", n: 3 }, { t: "art", id: "wuxue" }, { t: "karma", id: "lifted-ask" }, { t: "quest", id: burden, stage: 1 })),
    choice("ask-wu", "问：这块石头保护谁", [
      "他愣了一下。愣完说：保护后来要从这里过的人。",
      "你于是扛了。这次黑的是别人的理由，不只是你的好胜。",
    ], fx({ t: "stat", k: "life", n: -5 }, { t: "stat", k: "virtue", n: 3 }, { t: "karma", id: "asked-weight" }, { t: "quest", id: burden, stage: 1 })),
  ], { chain: burden, stage: 0 }),

  ev("wu-2", "buzhou", "共工的影子", [
    "还没到撞山的那天，已经有人在练习用头讲道理。练习的声音很闷。",
    "有人邀你去看，说看了就懂巫为什么不爱辩。",
  ], [
    choice("see", "去看那一场练习", [
      "你懂了一点：他们不是不会说，是说过的话曾经托不住天。",
      "懂了以后，你不太敢轻易用「蛮」这个字。",
    ], fx({ t: "stat", k: "dao", n: 3 }, { t: "rel", id: "gonggong", n: 6 }, { t: "karma", id: "saw-practice" }, { t: "quest", id: burden, stage: 2 })),
    choice("stop-practice", "上前说：练习可以，别把山当对手", [
      "练习停了一息。一息之后继续。继续之前有人看了你一眼，像看一个还没被天压过的人。",
    ], fx({ t: "rep", id: "wu", n: -3 }, { t: "stat", k: "virtue", n: 2 }, { t: "karma", id: "warned-gonggong" }, { t: "quest", id: burden, stage: 2 })),
  ], { chain: burden, stage: 1 }),

  ev("wu-3", "buzhou", "把重量还回去", [
    "真正的争论开始前，有巫问你要不要把肩上的印子变成巫族的记认。",
    "记认之后，你的伤他们会认。你的退，他们也会认。",
  ], [
    choice("mark", "接受记认", [
      "血抹在肩上，不写成字。巫的字本来就在肉里。",
      "你仍可以离开。离开时这道记认不会掉。",
    ], fx({ t: "sect", id: "wu", rank: 1 }, { t: "rep", id: "wu", n: 10 }, { t: "item", id: "wu-blood" }, { t: "karma", id: "wu-marked" }, { t: "quest", id: burden, stage: 3, status: "done" })),
    choice("solo", "说重量是你自己的，不入籍", [
      "他们尊重这种硬。尊重不等于以后帮你。",
      "你的肩仍旧疼。疼是私有的。",
    ], fx({ t: "stat", k: "dao", n: 4 }, { t: "karma", id: "private-weight" }, { t: "quest", id: burden, stage: 3, status: "done" })),
  ], { chain: burden, stage: 2 }),

  ev("vein-1", "earth", "脚底的热", [
    "一片看上去普通的土，踩上去像踩着别人的脉搏。",
    "往下挖三尺，灵气会喷你一脸。再挖，可能挖出别人的祖坟，或一条还没睡醒的矿脉。",
  ], [
    choice("dig", "小心地再挖一尺", [
      "气喷出来，又自己收住。它在试你贪不贪。",
      "你没有追着挖穿。地因此愿意以后再给你一口。",
    ], fx({ t: "ling", n: 10 }, { t: "karma", id: "found-vein" }, { t: "cave", n: 1 }, { t: "quest", id: vein, stage: 1 })),
    choice("mark-only", "做个只有自己认得的记号，先离开", [
      "记号是三颗石子。风一过就不像记号。不像，才安全。",
    ], fx({ t: "karma", id: "marked-vein" }, { t: "stat", k: "qi", n: 2 }, { t: "quest", id: vein, stage: 1 })),
  ], { chain: vein, stage: 0 }),

  ev("vein-2", "earth", "有人也闻到了", [
    "你回到记号处，发现多了一双脚印。脚印的主人还在附近转，像一只不好意思的兽。",
  ], [
    choice("share", "告诉他：可以分一口，不能挖穿", [
      "他答应了。答应的人未必守得住，可你把规则说在了前面。",
      "地脉分作两股细的，细的比较不容易招来大战。",
    ], fx({ t: "rel", id: "merchant", n: 6 }, { t: "karma", id: "shared-vein" }, { t: "stone", n: 4 }, { t: "quest", id: vein, stage: 2 })),
    choice("hide", "把气口封上，说这里什么都没有", [
      "你撒了谎。谎保住了脉，也在你舌头上留了一个小坑。",
      "那人走了。走的时候回头看了一眼，像记住了你的脸。",
    ], fx({ t: "ling", n: 6 }, { t: "karma", id: "lied-vein" }, { t: "delay", event: "delay-vein-thief", days: 10 }, { t: "quest", id: vein, stage: 2 })),
  ], { chain: vein, stage: 1 }),

  ev("vein-3", "earth", "洞府还是漏洞", [
    "脉稳定下来。你可以把它收成洞府，也可以任它当大地上的一个秘密。",
  ], [
    choice("abode", "筑成自己的洞府", [
      "四壁是你一寸寸拍实的。拍实的墙上没有门派的匾。",
      "以后闭关，风会先经过这里，再经过你。",
    ], fx({ t: "cave", n: 1 }, { t: "karma", id: "built-cave" }, { t: "know", place: "edge" }, { t: "quest", id: vein, stage: 3, status: "done" })),
    choice("open-vein", "把入口留给赶路的人避劫", [
      "你没有房子。你有一个会在雨里亮一点的坑。",
      "赶路的人不会知道感谢谁。土知道。",
    ], fx({ t: "stat", k: "virtue", n: 6 }, { t: "rep", id: "ren", n: 6 }, { t: "karma", id: "open-shelter" }, { t: "quest", id: vein, stage: 3, status: "done" })),
  ], { chain: vein, stage: 2 }),

  ev("pill-1", "wahuan", "丹方缺一味", [
    "炉边一个炼丹的人把方子推给你。方子的最后一味被烟熏没了。",
    "他说可以猜。猜错，炉会记住你们两个。",
  ], [
    choice("salt", "补上海盐的醒", [
      "丹成的时候很安静。安静通常是好事。你仍旧不敢先说成功。",
    ], fx({ t: "good", id: "salt", n: -1 }, { t: "good", id: "pill-break", n: 1 }, { t: "karma", id: "guessed-salt" }, { t: "quest", id: pill, stage: 1 })),
    choice("stop-pill", "说：缺的那味不该猜", [
      "炉被你们一起熄了。熄炉的人在洪荒里很少，因为大家都想看见结果。",
      "没有结果的下午，你睡了一个没有火光的觉。",
    ], fx({ t: "stat", k: "dao", n: 2 }, { t: "karma", id: "refused-guess" }, { t: "quest", id: pill, stage: 1 })),
  ], { chain: pill, stage: 0 }),

  ev("pill-2", "wahuan", "丹劫的前一声", [
    "夜间炉自己亮了。亮不是祥瑞，是药性在找一个出口，出口可能是天灵盖。",
  ], [
    choice("vent", "把窗打开，让药性走", [
      "气走了，丹毁了一半。一半仍能用。用的时候会想起你放弃过完整。",
    ], fx({ t: "good", id: "pill-qi", n: 1 }, { t: "karma", id: "vented-pill" }, { t: "quest", id: pill, stage: 2 }), { unless: "refused-guess" }),
    choice("seal", "封住炉，跟它耗", [
      "你耗赢了表面。表面之下，炉壁裂了一条头发丝。",
      "头发丝会在下一次大火里决定站哪边。",
    ], fx({ t: "wound", n: 1 }, { t: "karma", id: "sealed-pill" }, { t: "delay", event: "delay-pill-crack", days: 9 }, { t: "quest", id: pill, stage: 2 })),
  ], { chain: pill, stage: 1 }),

  ev("pill-3", "earth", "一味还人", [
    "那个炼丹的人找到你，手里没有方子了。他说丹若害了人，名字该写谁。",
  ], [
    choice("own-pill", "写你自己", [
      "你把名字写在一块泥上，放进熄掉的炉灰。灰不外传。",
      "你轻松了一点，也重了一点。",
    ], fx({ t: "stat", k: "virtue", n: 4 }, { t: "karma", id: "owned-pill" }, { t: "good", id: "pill-life", n: 1 }, { t: "quest", id: pill, stage: 3, status: "done" })),
    choice("share-blame", "说炉也有份，天也有份", [
      "他听完，把泥捏碎。碎是不同意。",
      "你仍可以炼丹。只是以后每炉都会想起这捏碎的声音。",
    ], fx({ t: "stat", k: "demon", n: 3 }, { t: "karma", id: "shared-blame" }, { t: "quest", id: pill, stage: 3, status: "done" })),
  ], { chain: pill, stage: 2 }),

  ev("beast-1", "earth", "蛋先于名字", [
    "草窝里有一枚不像鸟也不像蛇的蛋。蛋壳上的纹路会跟着你的呼吸变浅。",
    "附近没有母亲。洪荒里没有母亲的东西很多，不代表你可以随便当母亲。",
  ], [
    choice("hatch", "把它带在身上孵", [
      "壳裂的时候很轻。里面出来的东西看了你一眼，决定暂时不吃你。",
    ], fx({ t: "beast", id: "scale" }, { t: "karma", id: "hatched-beast" }, { t: "quest", id: beast, stage: 1 })),
    choice("nest", "把窝补好，人离开", [
      "你补完就走。走出去二十步又回头。蛋还在。",
      "回头没有改变决定。决定因此更像样。",
    ], fx({ t: "stat", k: "virtue", n: 3 }, { t: "karma", id: "left-egg" }, { t: "quest", id: beast, stage: 1, status: "failed" })),
  ], { chain: beast, stage: 0 }),

  ev("beast-2", "earth", "它饿，你也饿", [
    "小东西第一次真正的饿，恰巧赶上你灵气见底的一天。",
    "草可以分。分完，你们都会没精神。",
  ], [
    choice("feed-beast", "先喂它", [
      "它吃相很差，差得诚实。吃完它把下巴搁在你脚背上，像把你当成一个临时的地。",
    ], fx({ t: "good", id: "herb", n: -1 }, { t: "bond", n: 12 }, { t: "karma", id: "fed-beast" }, { t: "quest", id: beast, stage: 2 })),
    choice("feed-self", "先让自己能走路", [
      "你吃了。它看着。看着不是恨，是在学习你如何对待优先。",
      "这一课很早。早的课会跟它一辈子。",
    ], fx({ t: "ling", n: 6 }, { t: "bond", n: -4 }, { t: "karma", id: "fed-self-first" }, { t: "quest", id: beast, stage: 2 })),
  ], { chain: beast, stage: 1 }),

  ev("beast-3", "penglai", "放与留", [
    "海边有一群同类的影子。你的小东西第一次朝那边抬了头。",
    "留在身边它会强，会也变得像一件工具。放它走，你会空。",
  ], [
    choice("free", "把路让开", [
      "它走了三步，又回来蹭你。蹭完才真正下海。",
      "空是真的。空里有一个不欠你的活物。",
    ], fx({ t: "beast", id: null }, { t: "stat", k: "qi", n: 5 }, { t: "karma", id: "freed-beast" }, { t: "quest", id: beast, stage: 3, status: "done" })),
    choice("keep", "叫它的名字，让它留下", [
      "你给了它一个很短的名字。它应了。应了以后，海那边的影子就只是影子。",
      "你们都更安全，也都更窄。",
    ], fx({ t: "bond", n: 10 }, { t: "karma", id: "kept-beast" }, { t: "quest", id: beast, stage: 3, status: "done" })),
  ], { chain: beast, stage: 2 }),

  ev("peach-1", "penglai", "弱水之外", [
    "有人说西边有桃，吃了能把日子过得不像日子。蓬莱的船夫不肯送你过弱水。",
    "他肯告诉你水为什么弱：它不载自以为已经够轻的人。",
  ], [
    choice("light", "把身上一块贪心放下再问", [
      "你放下一块本来要拿去换灵石的矿。船夫仍不载你，但告诉你一条浅处。",
      "浅处只能看见桃枝的影子。影子已经让你少信一句传说。",
    ], fx({ t: "good", id: "ore", n: -1 }, { t: "stat", k: "dao", n: 3 }, { t: "karma", id: "saw-peach-shadow" }, { t: "quest", id: peach, stage: 1 })),
    choice("force-water", "自己趟", [
      "水不载你。你喝了两口，味道像被嘲笑。",
      "嘲笑有用。你记住了自己还没轻到能过去。",
    ], fx({ t: "stat", k: "life", n: -6 }, { t: "karma", id: "sank-ruoshui" }, { t: "quest", id: peach, stage: 1 })),
  ], { chain: peach, stage: 0 }),

  ev("peach-2", "kunlun", "有人真的吃过", [
    "一个从西边回来的老灵嘴里没有桃味，却有一种不着急。",
    "他看你像看一个还在问「哪里有捷径」的后辈。",
  ], [
    choice("listen-old", "请他讲弱水，不讲桃", [
      "他讲水。讲到后来你发现自己想听的本来就不是长生，是怎么不做蠢事。",
    ], fx({ t: "xiu", n: 16 }, { t: "rel", id: "elder-peng", n: 8 }, { t: "karma", id: "asked-water" }, { t: "quest", id: peach, stage: 2 })),
    choice("beg-peach", "仍旧问桃在哪里", [
      "他给了你一个方向，方向是错的。错是故意的。",
      "你若去，会浪费一段日子。浪费也是学费。",
    ], fx({ t: "karma", id: "begged-peach" }, { t: "delay", event: "delay-wrong-road", days: 8 }, { t: "quest", id: peach, stage: 2 })),
  ], { chain: peach, stage: 1 }),

  ev("peach-3", "penglai", "不吃的那天", [
    "真有一枚被鸟衔来的小果，落在你脚边。它未必是那桃，但它长得像一个愿望。",
  ], [
    choice("not-eat", "埋进土里", [
      "果子不会因此长成林。你只是拒绝用一个不清楚的愿望替换今天。",
      "今天变得比较普通，也比较可用。",
    ], fx({ t: "stat", k: "dao", n: 4 }, { t: "karma", id: "buried-fruit" }, { t: "quest", id: peach, stage: 3, status: "done" })),
    choice("eat", "吃掉，承担说不清的后果", [
      "味道很淡。淡完你并没有白日飞升。",
      "你的气运摇了一下，像被谁从册子上吹过。吹过不一定是福。",
    ], fx({ t: "stat", k: "qi", n: 6 }, { t: "stat", k: "demon", n: 3 }, { t: "karma", id: "ate-fruit" }, { t: "quest", id: peach, stage: 3, status: "done" })),
  ], { chain: peach, stage: 2 }),

  ev("fire-1", "east", "海上的第一场不对的火", [
    "龙汉还没有被叫成劫的时候，海上先烧起来。火不像太阳，太阳有轨道，这火没有。",
    "鱼跳上不该去的岸。",
  ], [
    choice("douse", "用灵气去压一小片火路", [
      "你压住的只是一条窄路。窄路够一群精魂钻回水里。",
      "火记住你的冷。冷会被它记仇，也会被幸存者记住。",
    ], fx({ t: "ling", n: -8 }, { t: "stat", k: "virtue", n: 4 }, { t: "karma", id: "doused-path" }, { t: "quest", id: fire, stage: 1 })),
    choice("collect-fire", "取一缕火种离开", [
      "火种在你掌心很乖。乖是暂时的。",
      "你获得一种危险的本钱。",
    ], fx({ t: "good", id: "seed", n: 1 }, { t: "karma", id: "took-longhan" }, { t: "stat", k: "demon", n: 2 }, { t: "quest", id: fire, stage: 1 })),
  ], { chain: fire, stage: 0, eras: ["longhan", "witch", "clay", "board"] }),

  ev("fire-2", "earth", "火种问你要燃料", [
    "离开海之后，那缕火开始找能烧的东西。它先看你的袖口，再看远处的林。",
  ], [
    choice("sleeve", "烧自己的一截袖口", [
      "袖口没了，林还在。火安分了几天。",
      "几天，在劫里已经是恩情。",
    ], fx({ t: "wound", n: 1 }, { t: "karma", id: "burned-sleeve" }, { t: "quest", id: fire, stage: 2 }), { when: "took-longhan" }),
    choice("forest", "让它去林子里自己找", [
      "林子烧出一块疤。疤的形状像一个你不肯承认的决定。",
    ], fx({ t: "stat", k: "kill", n: 2 }, { t: "karma", id: "burned-forest" }, { t: "rep", id: "wu", n: -4 }, { t: "quest", id: fire, stage: 2 }), { when: "took-longhan" }),
    choice("tell-fire", "把你看见的火路讲给陆地上的人", [
      "你讲得很具体：哪边先热，哪边的水能退。",
      "具体的话救得了准备听的人，救不了觉得自己是例外的人。",
    ], fx({ t: "stat", k: "virtue", n: 4 }, { t: "rep", id: "ren", n: 4 }, { t: "karma", id: "warned-longhan" }, { t: "quest", id: fire, stage: 2 }), { when: "doused-path" }),
  ], { chain: fire, stage: 1 }),

  ev("fire-3", "buzhou", "余火与骨头", [
    "余火爬到不周附近就矮了下去。山太直，火一时间不知道怎么绕。",
    "你要决定这缕劫的残余是熄，是存，还是交给巫。",
  ], [
    choice("snuff", "熄掉", [
      "你用手盖住它。痛是短的。短痛结束，空气里少了一种焦味。",
    ], fx({ t: "stat", k: "life", n: -4 }, { t: "karma", id: "snuffed-fire" }, { t: "quest", id: fire, stage: 3, status: "done" })),
    choice("give-wu", "交给肯承重的人看管", [
      "巫把火种埋进石匣。石匣不浪漫，所以可靠。",
      "你失去一件宝物，得到一种不必天天害怕口袋的睡眠。",
    ], fx({ t: "good", id: "seed", n: -1 }, { t: "rep", id: "wu", n: 6 }, { t: "karma", id: "gave-fire" }, { t: "quest", id: fire, stage: 3, status: "done" })),
  ], { chain: fire, stage: 2 }),

  ev("debt-1", "tribes", "先欠着", [
    "一个走路像算账的人借给你几枚刚出现的灵石，说洪荒也该有信用。",
    "他不要利息的名字。他说以后你自然知道什么叫还。",
  ], [
    choice("borrow", "收下，把用处说清楚", [
      "你说了：拿去换药，不拿去换面子。",
      "他把石子推过来，像把一句以后会回来的话推过来。",
    ], fx({ t: "stone", n: 8 }, { t: "karma", id: "borrowed" }, { t: "rel", id: "merchant", n: 4 }, { t: "quest", id: debt, stage: 1 })),
    choice("refuse-debt", "不借。欠会比穷先毁人", [
      "他一点也不生气。不生气的债主最会等。",
      "你当日比较穷，也比较轻。",
    ], fx({ t: "stat", k: "dao", n: 1 }, { t: "karma", id: "refused-debt" }, { t: "quest", id: debt, stage: 1, status: "failed" })),
  ], { chain: debt, stage: 0 }),

  ev("debt-2", "east", "他还在", [
    "海边又遇见他。他不伸手。不伸手比伸手更让你想起口袋里的石子。",
  ], [
    choice("repay", "如数还上", [
      "石子回到他掌心，发出很轻的一声。轻声比响声更像结清。",
      "他居然多告诉你一处不会骗人的盐滩。",
    ], fx({ t: "stone", n: -8 }, { t: "karma", id: "repaid" }, { t: "rel", id: "merchant", n: 10 }, { t: "know", place: "penglai" }, { t: "quest", id: debt, stage: 2 })),
    choice("delay-pay", "说再等一段日子", [
      "他点头。点头不是善良，是利息开始走路。",
      "你还能用那些石头。用的每一天都有脚步声。",
    ], fx({ t: "karma", id: "delayed-debt" }, { t: "delay", event: "delay-collector", days: 11 }, { t: "quest", id: debt, stage: 2 })),
  ], { chain: debt, stage: 1 }),

  ev("debt-3", "tribes", "信用变成路", [
    "火塘需要一批盐。那个算账的人看着你，好像路可以是你，也可以不是你。",
  ], [
    choice("escort", "自己去跑这一趟", [
      "路上没有传奇，只有重量和一次差点看错的潮。",
      "盐到的时候，孩子们的嘴不苦了。你的账若还在，也被这趟路磨薄了。",
    ], fx({ t: "stat", k: "life", n: -4 }, { t: "rep", id: "ren", n: 8 }, { t: "stone", n: 5 }, { t: "karma", id: "ran-salt" }, { t: "quest", id: debt, stage: 3, status: "done" })),
    choice("introduce", "把路让给更需要名声的人", [
      "你把路线说给一个年轻人。他说完谢谢，眼睛已经在算自己的名。",
      "名会离开你。离开也好。",
    ], fx({ t: "stat", k: "virtue", n: 3 }, { t: "karma", id: "gave-route" }, { t: "quest", id: debt, stage: 3, status: "done" })),
  ], { chain: debt, stage: 2 }),

  ev("night-1", "edge", "第一夜", [
    "世界边上，心魔不扮怪物。它扮你，坐在对面，姿势比你更松。",
    "它说：我们聊聊你为什么不肯散。聊完你可以当我没来。",
  ], [
    choice("talk", "跟它谈", [
      "你们谈到开天前那一粒光。它说你留下是因为怕，你说是因为还没看完。",
      "谁也没说服谁。夜因此没有白费。",
    ], fx({ t: "stat", k: "dao", n: 2 }, { t: "stat", k: "demon", n: 2 }, { t: "karma", id: "talked-demon" }, { t: "quest", id: nights, stage: 1 })),
    choice("meditate-night", "不谈，只数呼吸", [
      "它跟着你数，故意数错。你没有被带着错。",
      "这是一种很小的胜。",
    ], fx({ t: "xiu", n: 12 }, { t: "karma", id: "counted-breath" }, { t: "quest", id: nights, stage: 1 })),
  ], { chain: nights, stage: 0 }),

  ev("night-2", "edge", "第二夜", [
    "它带来你做过的一件小事，小事里有一个人的失望。",
    "它问你要不要把那件小事解释成必然。",
  ], [
    choice("no-excuse", "不解释", [
      "失望就留在那里。你没有用大道把它涂掉。",
      "心魔少了一件武器，你少了一件盔甲。",
    ], fx({ t: "stat", k: "demon", n: -3 }, { t: "stat", k: "virtue", n: 3 }, { t: "karma", id: "no-excuse" }, { t: "quest", id: nights, stage: 2 })),
    choice("excuse", "解释给它听，也解释给自己", [
      "解释很圆满。圆满的那一刻你舒服了。",
      "舒服有一股甜味。甜味是它留的。",
    ], fx({ t: "stat", k: "demon", n: 5 }, { t: "ling", n: 4 }, { t: "karma", id: "excused" }, { t: "quest", id: nights, stage: 2 })),
  ], { chain: nights, stage: 1 }),

  ev("night-3", "youming", "第三夜在最底下", [
    "第三夜它把你带到幽冥的门口，说：看看你的名字轻起来是什么样子。",
    "轻很诱人。轻了就不必再扛。",
  ], [
    choice("heavy", "把名字按回自己身上", [
      "你按得很用力。用力之后名字还是你的，包括它不好看的部分。",
      "心魔鞠躬，像一个暂时失业的说书人。",
    ], fx({ t: "stat", k: "dao", n: 5 }, { t: "stat", k: "demon", n: -4 }, { t: "karma", id: "kept-name" }, { t: "quest", id: nights, stage: 3, status: "done" })),
    choice("lighten", "让它替你拿着一部分", [
      "你当下很轻，走路像飞。飞的人容易忘了自己欠谁一句对不起。",
      "那一部分它会收利息。利息不是今天。",
    ], fx({ t: "stat", k: "life", n: 6 }, { t: "stat", k: "demon", n: 6 }, { t: "karma", id: "lent-name" }, { t: "delay", event: "delay-demon-interest", days: 15 }, { t: "quest", id: nights, stage: 3, status: "done" })),
  ], { chain: nights, stage: 2 }),

  ev("firetang-1", "tribes", "火要灭的那个黄昏", [
    "第一丛真正属于人的火只剩一星。风很大，大得像有立场。",
    "守火的老人看着你，不求你。不求，是因为求也没用，手要自己伸。",
  ], [
    choice("shield-fire", "用身体挡住风", [
      "你挡住了。火活到有人接上柴。",
      "你的背被吹得很干。干是一种勋章，勋章不能吃。",
    ], fx({ t: "stat", k: "life", n: -5 }, { t: "stat", k: "virtue", n: 6 }, { t: "karma", id: "shielded-fire" }, { t: "rep", id: "ren", n: 8 }, { t: "quest", id: hearth, stage: 1 })),
    choice("teach-fire", "教他们把火种分成三处", [
      "分火的道理很简单，简单到以前没人肯做，因为每处都会变小。",
      "小，就没有一处灭了全体就黑。",
    ], fx({ t: "stat", k: "dao", n: 2 }, { t: "karma", id: "split-fire" }, { t: "rep", id: "ren", n: 6 }, { t: "quest", id: hearth, stage: 1 })),
  ], { chain: hearth, stage: 0, eras: ["clay", "board", "witch"] }),

  ev("firetang-2", "tribes", "来偷火的不是兽", [
    "夜里来的影子会说话。它说火不该只属于会灭的东西。",
    "孩子躲在你身后，呼吸打在你腰上。",
  ], [
    choice("fight-raider", "把它赶出去", [
      "赶出去的过程没有诗。有抓扯，有灰，有一声孩子没哭出来的哭。",
      "火还在。",
    ], fx({ t: "battle", id: "raider" }, { t: "karma", id: "drove-raider" }, { t: "quest", id: hearth, stage: 2 })),
    choice("bargain-fire", "分它一星，条件是不再来", [
      "它答应了。答应的影子不可靠，可这一夜孩子睡了。",
      "你看着那一星离开，像看着一份会回来的条约。",
    ], fx({ t: "good", id: "seed", n: -1 }, { t: "karma", id: "bargained-fire" }, { t: "delay", event: "delay-raider-return", days: 13 }, { t: "quest", id: hearth, stage: 2 })),
  ], { chain: hearth, stage: 1 }),

  ev("firetang-3", "tribes", "约", [
    "火稳住之后，人们开始吵谁夜里可以睡。吵，说明他们相信明天还有火。",
    "老人让你说一句能当约的话。",
  ], [
    choice("rota", "说：按人头轮，包括你自己", [
      "约很土。土的约活得比神谕久。",
      "你的名字被写在一片树皮上，不是榜，是值夜表。",
    ], fx({ t: "item", id: "incense" }, { t: "rep", id: "ren", n: 10 }, { t: "karma", id: "made-rota" }, { t: "sect", id: "hearth", rank: 1 }, { t: "quest", id: hearth, stage: 3, status: "done" })),
    choice("leave-people", "说完方法就离开", [
      "你不留下享受感谢。感谢会把人留成神像。",
      "树皮上没有你的名字。火仍按你说的方式分。",
    ], fx({ t: "stat", k: "dao", n: 3 }, { t: "stat", k: "virtue", n: 4 }, { t: "karma", id: "left-rota" }, { t: "quest", id: hearth, stage: 3, status: "done" })),
  ], { chain: hearth, stage: 2 }),

  ev("yaomeet-1", "east", "第一遇", [
    "一只还没被赐名的海妖挡在浅滩上。它不是来杀你，它是迷路，迷路的样子像攻击。",
  ], [
    choice("spare1", "退开，把水道指给它", [
      "它走的时候刮了你一下。刮是感谢的方式，很差的那种。",
    ], fx({ t: "stat", k: "life", n: -3 }, { t: "karma", id: "spared-yao-1" }, { t: "rel", id: "stray-yao", n: 8 }, { t: "quest", id: spare, stage: 1 })),
    choice("fight1", "把它打退", [
      "你打退了。浅滩恢复安静。安静里有一种你不喜欢的自豪。",
    ], fx({ t: "battle", id: "tide" }, { t: "karma", id: "fought-yao-1" }, { t: "quest", id: spare, stage: 1 })),
  ], { chain: spare, stage: 0 }),

  ev("yaomeet-2", "penglai", "第二遇", [
    "同一张脸从仙山的雾里出来，比上次完整一点。它认得你。",
    "认得使这次不像奇遇，像关系。",
  ], [
    choice("food", "分它一把盐晶", [
      "它不道谢，把盐含化，然后告诉你一处不会涨潮的凹。",
      "凹很实用。实用是海妖少有的礼物。",
    ], fx({ t: "good", id: "salt", n: -1 }, { t: "karma", id: "fed-stray" }, { t: "rel", id: "stray-yao", n: 8 }, { t: "quest", id: spare, stage: 2 }), { when: "spared-yao-1" }),
    choice("drive2", "再次赶它离开仙山", [
      "雾被你赶散一块。仙山的人会感谢你。海会不感谢你。",
    ], fx({ t: "rep", id: "yao", n: -4 }, { t: "stat", k: "kill", n: 2 }, { t: "karma", id: "drove-yao-2" }, { t: "quest", id: spare, stage: 2 })),
  ], { chain: spare, stage: 1 }),

  ev("yaomeet-3", "bloodsea", "第三遇在岸上", [
    "它被人围住，围的理由是「没有名册的东西可以打」。",
    "它看你。看的意思很清楚：你还是不是上次那个人。",
  ], [
    choice("stand-by", "站到它旁边", [
      "围的人骂你。骂完散了，因为你看起来肯付出比骂更贵的东西。",
      "海妖没有拜你。它只是以后不再把所有两足都当成锤子。",
    ], fx({ t: "rep", id: "jie", n: 4 }, { t: "stat", k: "virtue", n: 5 }, { t: "karma", id: "stood-by-yao" }, { t: "quest", id: spare, stage: 3, status: "done" })),
    choice("look-away", "当没看见", [
      "你走过去。背后的声音短了一下，又长了。",
      "这段关系在这里断。断得很干净，所以会疼。",
    ], fx({ t: "stat", k: "demon", n: 4 }, { t: "karma", id: "ignored-yao" }, { t: "quest", id: spare, stage: 3, status: "done" })),
  ], { chain: spare, stage: 2 }),

  ev("omen-1", "board", "第一兆：空白", [
    "台子立起来的那天没有字。风把所有人的头发吹向同一个方向，像预演点名。",
  ], [
    choice("near", "走近看空白", [
      "空白里有你的脸，一闪。一闪就够让人晚上睡不好。",
      "你记住了：榜先选的不是英雄，是会在意自己脸的人。",
    ], fx({ t: "stat", k: "qi", n: 2 }, { t: "karma", id: "saw-blank" }, { t: "quest", id: omens, stage: 1 })),
    choice("back", "转身去火塘，不看", [
      "你把背给榜。背很热，因为火塘在那边。",
      "不看不能让榜消失。不看只能让你今天还属于自己。",
    ], fx({ t: "stat", k: "virtue", n: 2 }, { t: "karma", id: "turned-from-board" }, { t: "quest", id: omens, stage: 1 })),
  ], { chain: omens, stage: 0, eras: ["board"] }),

  ev("omen-2", "tribes", "第二兆：别人的梦", [
    "有人梦见自己的名字变成官职，高兴得把梦讲出来。讲完他看着你，希望你也羡慕。",
  ], [
    choice("cool", "告诉他梦里的印是枷", [
      "他不爱听。不爱听的话有时要等伤来了才懂。",
      "你说了。说了就算你尽过一种难听的忠。",
    ], fx({ t: "rel", id: "suiren", n: -2 }, { t: "stat", k: "virtue", n: 3 }, { t: "karma", id: "warned-dream" }, { t: "quest", id: omens, stage: 2 })),
    choice("let-dream", "让他高兴完这一天", [
      "高兴没有罪。你没有拆。",
      "你只在自己的夜里把那句警告说给自己听。",
    ], fx({ t: "stat", k: "qi", n: 1 }, { t: "karma", id: "kept-dream" }, { t: "quest", id: omens, stage: 2 })),
  ], { chain: omens, stage: 1 }),

  ev("omen-3", "board", "第三兆：墨", [
    "墨真的来了。笔还没有落，可空气已经有了字的味道。",
    "你可以撕一点尚未写上的边，可以护住旁边的人，可以把自己的名字藏起来，也可以走。",
  ], [
    choice("tear", "撕下一角空白", [
      "角撕下来，像从一口锅上掰掉一块铁。你保住了「不被书写」的一小片。",
      "也因此放出一点更饿的风。",
    ], fx({ t: "karma", id: "tore-edge" }, { t: "stat", k: "demon", n: 3 }, { t: "stat", k: "qi", n: 3 }, { t: "quest", id: omens, stage: 3, status: "done" })),
    choice("guard-people", "站在还没被点到的人前面", [
      "你挡的不是笔。笔会绕过你。你挡的是他们自己往前挤的脚。",
      "这一站很久。久是这种选择的本体。",
    ], fx({ t: "stat", k: "virtue", n: 8 }, { t: "stat", k: "life", n: -6 }, { t: "karma", id: "guarded-unnamed" }, { t: "quest", id: omens, stage: 3, status: "done" })),
    choice("walk-off", "离开台子，回到能种东西的地方", [
      "你走了。榜仍会写别人。",
      "你选择继续做一个会饿、会睡、会改主意的活人。",
    ], fx({ t: "stat", k: "dao", n: 3 }, { t: "karma", id: "left-board" }, { t: "quest", id: omens, stage: 3, status: "done" })),
  ], { chain: omens, stage: 2 }),

  ev("friend-1", "kunlun", "一个你帮过的人", [
    "有人在薄风里叫你以前用过的一个称呼。称呼很生，可它确实属于你。",
    "他瘦了。瘦说明他过的日子不是传说。",
  ], [
    choice("recognize", "应下那个称呼", [
      "他的肩膀松了。松是信任。信任比灵石重，也比灵石容易压死人。",
    ], fx({ t: "rel", id: "old-friend", n: 10 }, { t: "karma", id: "answered-name" }, { t: "quest", id: friend, stage: 1 })),
    choice("deny", "说他认错了", [
      "他看了你很久，然后说：那更好，我就不把麻烦给你。",
      "你赢得轻松，输掉一个还会叫你的人。",
    ], fx({ t: "stat", k: "demon", n: 2 }, { t: "karma", id: "denied-friend" }, { t: "quest", id: friend, stage: 1, status: "failed" })),
  ], { chain: friend, stage: 0, minRealm: 1 }),

  ev("friend-2", "earth", "他要你做一件不对等的事", [
    "他请你去一个你不该去的门派门口替他说一句好话。好话对你可能是坏处。",
  ], [
    choice("speak-for", "去说", [
      "你说了。门里的人把你的话和你的人一起称了称。",
      "称完，他的事松动了一点，你的路难走了一点。",
    ], fx({ t: "rep", id: "chan", n: -4 }, { t: "rel", id: "old-friend", n: 8 }, { t: "karma", id: "spoke-for-friend" }, { t: "quest", id: friend, stage: 2 })),
    choice("teach", "不代说，教他怎么自己说", [
      "你把句子改到不含谎言。他背得很痛苦。",
      "痛苦的背诵有时比你的面子更有用。",
    ], fx({ t: "stat", k: "virtue", n: 3 }, { t: "rel", id: "old-friend", n: 4 }, { t: "karma", id: "taught-speech" }, { t: "quest", id: friend, stage: 2 })),
  ], { chain: friend, stage: 1 }),

  ev("friend-3", "tribes", "他来还", [
    "很久以后他带来一包药和一句不像感谢的话：我没有把你说成比你更好的人。",
    "这是他能还上的全部。",
  ], [
    choice("take-herb", "收下药", [
      "药是苦的。苦得很准时，正好对上你旧伤会响的天气。",
      "你们没有喝一顿酒。洪荒里不是所有情分都需要酒。",
    ], fx({ t: "good", id: "pill-life", n: 1 }, { t: "karma", id: "friend-repaid" }, { t: "quest", id: friend, stage: 3, status: "done" })),
    choice("give-back", "让他把药留给火塘", [
      "他照做了。做的时候终于笑了一下。",
      "你什么都没增加，除了一种还可以再被叫到的感觉。",
    ], fx({ t: "rep", id: "ren", n: 5 }, { t: "stat", k: "virtue", n: 3 }, { t: "karma", id: "friend-to-hearth" }, { t: "quest", id: friend, stage: 3, status: "done" })),
  ], { chain: friend, stage: 2 }),

  ev("echo-1", "buzhou", "回声先到", [
    "有些选择会在山里循环。你若曾经碰过那根骨头，循环会来找你；若没有，山也会挑一个路过的人开始循环。",
    "这一次它挑中你，问一个很小的问题：直，是否永远比弯好。",
  ], [
    choice("no", "说不。直会折", [
      "回声重复了你的「不」，重复到连山都像在练习认输。",
      "认输不是山的性格。它只是把你的答案存起来。",
    ], fx({ t: "stat", k: "dao", n: 2 }, { t: "karma", id: "said-bend" }, { t: "quest", id: echo, stage: 1 })),
    choice("yes", "说是。弯的东西托不住天", [
      "你说得很响。响声适合这里。",
      "一个年轻巫把你的话记进自己的肩。你希望他别记太死。",
    ], fx({ t: "stat", k: "kill", n: 2 }, { t: "karma", id: "said-straight" }, { t: "rel", id: "gonggong", n: 4 }, { t: "quest", id: echo, stage: 1 })),
  ], { chain: echo, stage: 0 }),

  ev("echo-2", "youming", "回声落到最底", [
    "同一个问题在幽冥里变了：若直的东西压死了人，还算不算直。",
  ], [
    choice("count-dead", "算。直不因死人变弯，但你必须数那些人", [
      "你数了。数是一种不肯用宏大逃掉的办法。",
      "后土的沉默这一次像点头。",
    ], fx({ t: "stat", k: "virtue", n: 4 }, { t: "karma", id: "counted-dead" }, { t: "rel", id: "houtu", n: 6 }, { t: "quest", id: echo, stage: 2 })),
    choice("abstract", "说道理不要被个别的死绑住", [
      "话一出口你就知道它很好用，也好用得危险。",
      "危险先不惩罚你。惩罚会挑一个你在意的人。",
    ], fx({ t: "stat", k: "dao", n: 2 }, { t: "stat", k: "demon", n: 3 }, { t: "karma", id: "abstract-dead" }, { t: "delay", event: "delay-named-death", days: 14 }, { t: "quest", id: echo, stage: 2 })),
  ], { chain: echo, stage: 1 }),

  ev("echo-3", "earth", "你的答案要落地", [
    "回声结束之前，要你在大地上做一件与答案一致的事。不一致，它就还会再来。",
  ], [
    choice("move-stone", "把一块会砸到路的石头搬开", [
      "你搬开了。路还是土路。土路上少了一个会在夜里杀死赶路人的理由。",
      "这和天柱相比小到可笑。可笑的事你还是做了。",
    ], fx({ t: "stat", k: "life", n: -4 }, { t: "stat", k: "virtue", n: 5 }, { t: "karma", id: "moved-stone" }, { t: "quest", id: echo, stage: 3, status: "done" })),
    choice("leave-stone", "留下石头，立一块警告的痕", [
      "你没有搬。你刻了记号。记号只帮助识字的风，不帮助黑夜和奔跑。",
      "你选择相信人会自己慢下来。有的人会。",
    ], fx({ t: "stat", k: "dao", n: 2 }, { t: "karma", id: "marked-danger" }, { t: "quest", id: echo, stage: 3, status: "done" })),
  ], { chain: echo, stage: 2 }),

  ev("era-cleave", "any", "斧声", [
    "天地被撕开的声音传到你所在的地方。没有光，先有痛。",
    "你可以靠近那道裂口，也可以把这个时代当成天气，继续过自己的日子。",
  ], [
    choice("near-axe", "朝裂口走", [
      "你没有成为盘古。你只是被斧风掀倒，又爬起来。",
      "爬起来的人，对「开」这个字会有身体上的意见。",
    ], fx({ t: "stat", k: "dao", n: 3 }, { t: "wound", n: 1 }, { t: "karma", id: "neared-axe" }, { t: "know", place: "earth" })),
    choice("stay-day", "不赶去看神迹", [
      "神迹不需要你见证也发生。你把一天用在呼吸上。",
      "呼吸在这样的日子里也算一种立场。",
    ], fx({ t: "xiu", n: 10 }, { t: "karma", id: "missed-axe" })),
  ], { weight: 0 }),

  ev("era-longhan", "any", "劫的名字还没落下", [
    "远方的海平线不对。不对被有些人叫成祥瑞，被另一些人叫成逃。",
  ], [
    choice("go-sea", "去东海看一眼再判断", [
      "你看见火没有轨道。看见本身不构成功劳。",
      "你至少不会再把逃叫成胆小。",
    ], fx({ t: "know", place: "east" }, { t: "stat", k: "dao", n: 2 }, { t: "karma", id: "saw-longhan" })),
    choice("prepare", "就地告诉周围的人把水备下", [
      "有人听，有人笑。笑的人后来未必有水喝。",
      "你没有因此变得喜欢说「我早就说过」。",
    ], fx({ t: "rep", id: "ren", n: 4 }, { t: "karma", id: "prepared-longhan" })),
  ], { weight: 0 }),

  ev("era-witch", "any", "两种身体的道理", [
    "巫与妖的争执从远处传来，像两座山在比赛谁更能忍痛。",
    "你不必参加。参加的人会得到位置，也会得到一个很难洗掉的边。",
  ], [
    choice("visit-wu", "去不周看看他们如何扛", [
      "你看见力。力很诚实，诚实到残酷。",
    ], fx({ t: "know", place: "buzhou" }, { t: "rel", id: "gonggong", n: 3 }, { t: "karma", id: "visited-wu" })),
    choice("visit-yao", "去东海看看他们如何聚", [
      "你看见名。名很华美，华美到会漏掉没有名的死。",
    ], fx({ t: "know", place: "east" }, { t: "rel", id: "dijun", n: 3 }, { t: "karma", id: "visited-yao" })),
    choice("neither", "哪边都不站，去补一处具体的伤", [
      "你在大地上处理了一处很小的塌方。没有战报。",
      "没有战报的事，本纪通常不收。你收进自己的日子里。",
    ], fx({ t: "stat", k: "virtue", n: 4 }, { t: "karma", id: "mended-local" })),
  ], { weight: 0 }),

  ev("era-clay", "any", "泥开始像人", [
    "有消息说，有人在用泥做会呼吸的东西。消息不可怕。可怕的是呼吸一旦开始，就不能只当消息。",
  ], [
    choice("go-nuwa", "去娲皇宫", [
      "你看见火与泥。你没有资格指导女娲。你只够资格不添乱。",
    ], fx({ t: "know", place: "wahuan" }, { t: "rel", id: "nuwa", n: 3 }, { t: "karma", id: "saw-nuwa" })),
    choice("go-people", "去将有火塘的地方等", [
      "你等来了第一批会冷的人。会冷，所以你的道若不能挨着冷，就还是空的。",
    ], fx({ t: "know", place: "tribes" }, { t: "rep", id: "ren", n: 4 }, { t: "karma", id: "waited-people" })),
  ], { weight: 0 }),

  ev("era-board", "any", "字的味道", [
    "空气里有墨。墨还没写到你，可你会开始梦见自己的名字被别人念错。",
  ], [
    choice("go-board", "去看看那块空白", [
      "你去了。看过空白的人，以后会更难假装自己与秩序无关。",
    ], fx({ t: "know", place: "board" }, { t: "karma", id: "approached-board" })),
    choice("stay-life", "继续种、炼、走自己的路", [
      "榜不因你的缺席停笔。你的路也不因榜的存在就变成假的。",
    ], fx({ t: "xiu", n: 12 }, { t: "karma", id: "lived-through-board" })),
  ], { weight: 0 }),

  ev("delay-incense", "tribes", "有人给你留了饭", [
    "你没有许诺香火。火塘仍给你留了一碗。碗边是灰的。",
    "留饭的人说：上次那个故事，孩子又讲了一遍，讲歪了，可他把你讲成会回来的人。",
  ], [
    choice("eat", "坐下吃", [
      "饭很粗。粗饭把你从「过客」里往下按了按。",
    ], fx({ t: "stat", k: "life", n: 6 }, { t: "item", id: "incense" }, { t: "rel", id: "nuwa", n: 2 })),
    choice("leave-bowl", "把碗让给更瘦的人", [
      "你走的时候胃是空的，关系是满一点的。",
    ], fx({ t: "stat", k: "virtue", n: 3 }, { t: "rep", id: "ren", n: 3 })),
  ], { weight: 0 }),

  ev("delay-jie-rumor", "bloodsea", "话传回来了", [
    "你那句「站在没有座位的那边」被传成「他要拆了所有座位」。",
    "一个真正没有座位的精魂来找你，眼睛里是希望，也是刀。",
  ], [
    choice("correct", "把原话再说一遍，不添火", [
      "希望小了一点，刀也小了一点。你不被喜欢，可你没有变成口号。",
    ], fx({ t: "rep", id: "jie", n: -2 }, { t: "stat", k: "dao", n: 2 }, { t: "karma", id: "corrected-rumor" })),
    choice("accept-rumor", "就让他们这么信", [
      "你获得一批会替你喊的人。喊声很壮。",
      "壮的东西以后会要求你真的去拆。",
    ], fx({ t: "rep", id: "jie", n: 8 }, { t: "stat", k: "demon", n: 4 }, { t: "karma", id: "became-slogan" })),
  ], { weight: 0 }),

  ev("delay-fence", "kunlun", "篱笆外的那个", [
    "一只很小的灵在昆仑山脚等你。它被风掀下来过。它不记仇恨，它记温度。",
    "它问你还有没有多余的一晚。",
  ], [
    choice("night-out", "在篱笆外陪它坐一夜", [
      "一夜不能改变玉虚。一夜能让一个小东西下次还肯靠近人。",
    ], fx({ t: "stat", k: "virtue", n: 4 }, { t: "karma", id: "sat-outside" })),
    choice("take-in", "试着带它走侧门", [
      "侧门的人为难。为难之后放行了一晚。",
      "一晚结束，它仍得出去。你学会了篱笆的尺寸。",
    ], fx({ t: "rep", id: "chan", n: -2 }, { t: "rel", id: "small-spirit", n: 8 }, { t: "karma", id: "tried-side-door" })),
  ], { weight: 0 }),

  ev("delay-vein-thief", "earth", "脚印回来了", [
    "那个被你骗走的人回来了，带着更多人。他们不是来杀人，他们是来挖穿你说「没有」的地方。",
  ], [
    choice("confess", "承认你撒了谎，并划出不能挖的线", [
      "有人骂你。骂完，居然有人把铲子停在线上。",
      "脉还在。你的话比上次轻。",
    ], fx({ t: "karma", id: "confessed-vein" }, { t: "rel", id: "merchant", n: -4 }, { t: "ling", n: -4 })),
    choice("defend-vein", "不许他们挖", [
      "冲突短而难看。你守住了口，也把自己变成了这块地的敌人眼中的主人。",
    ], fx({ t: "battle", id: "stone" }, { t: "karma", id: "fought-for-vein" })),
  ], { weight: 0 }),

  ev("delay-pill-crack", "wahuan", "头发丝裂开了", [
    "你封过的那座炉在别人使用时裂开。裂开本身不怪你一个人，可你认得那条缝。",
  ], [
    choice("repair", "留下来一起补炉，不辩解", [
      "补炉的灰落进你头发。没有人请你写检讨。灰就是检讨。",
    ], fx({ t: "wound", n: 1 }, { t: "stat", k: "virtue", n: 4 }, { t: "karma", id: "repaired-furnace" })),
    choice("pay", "留下药材当赔偿，然后走", [
      "赔偿被收下。收下不等于原谅。",
      "你走在路上，背包轻了，步子不轻。",
    ], fx({ t: "good", id: "herb", n: -2 }, { t: "karma", id: "paid-furnace" })),
  ], { weight: 0 }),

  ev("delay-wrong-road", "earth", "错的方向", [
    "你按那个故意给错的方向走了一段。段的尽头是一片好看的、什么也没有的盐壳。",
    "日子被你花掉了。花掉的日子不会变成桃。",
  ], [
    choice("laugh", "坐下来笑自己", [
      "笑完你把方向记成学费，不记成仇恨。",
    ], fx({ t: "stat", k: "dao", n: 2 }, { t: "karma", id: "laughed-road" })),
    choice("hate", "记下那个老灵的脸", [
      "脸被你记得很清楚。清楚的恨会占修炼的位置。",
    ], fx({ t: "stat", k: "demon", n: 4 }, { t: "karma", id: "hated-elder" })),
  ], { weight: 0 }),

  ev("delay-collector", "tribes", "债走到了", [
    "算账的人终于伸手。他仍不吼。不吼的手更难躲开。",
  ], [
    choice("pay-now", "连本带一点心意还上", [
      "你还得比原来多。多出来的部分买回了一个还能被信任的嘴。",
    ], fx({ t: "stone", n: -10 }, { t: "karma", id: "settled-late" }, { t: "rel", id: "merchant", n: 4 })),
    choice("work", "用一趟苦力抵", [
      "你替他运矿。运完，账平了，肩不平。",
    ], fx({ t: "stat", k: "life", n: -6 }, { t: "good", id: "ore", n: -1 }, { t: "karma", id: "worked-debt" }, { t: "rel", id: "merchant", n: 6 })),
  ], { weight: 0 }),

  ev("delay-demon-interest", "edge", "利息之夜", [
    "心魔把你寄存的那部分名字送回来，上面有牙印。",
    "它说可以再替你保管。保管费是一次沉默的背叛，对象由你挑。",
  ], [
    choice("take-back", "把名字夺回来", [
      "夺的过程像跟自己摔跤。你摔赢了，满嘴是血味，名字是完整的。",
    ], fx({ t: "battle", id: "demon" }, { t: "karma", id: "reclaimed-name" })),
    choice("pay-interest", "拒绝背叛任何人，用修为付利息", [
      "你付出一口气。它很失望。失望的心魔暂时没那么能说。",
    ], fx({ t: "xiu", n: -18 }, { t: "stat", k: "demon", n: -2 }, { t: "karma", id: "paid-interest" })),
  ], { weight: 0 }),

  ev("delay-named-death", "tribes", "一个具体的人", [
    "你曾经说道理不要被个别的死绑住。今天死的是一个会给你递水的人，死于一块你认得的、本可以搬开的石头。",
  ], [
    choice("bury", "去葬，不去辩", [
      "葬很具体。土塞进指甲。你没有发表看法。",
    ], fx({ t: "stat", k: "virtue", n: 4 }, { t: "stat", k: "demon", n: -2 }, { t: "karma", id: "buried-person" })),
    choice("speech", "对活人讲一篇更周全的道理", [
      "周全被听见了。也被一个孩子看成逃避。",
      "你得到尊敬和一种新的恶心。",
    ], fx({ t: "stat", k: "dao", n: 1 }, { t: "stat", k: "demon", n: 4 }, { t: "karma", id: "spoke-over-grave" })),
  ], { weight: 0 }),

  ev("delay-raider-return", "tribes", "条约回来了", [
    "分走火种的影子又来了。它带来更多影子，说条约是「可以再谈」的意思。",
  ], [
    choice("fight-again", "不谈了", [
      "这一次你知道它的步伐。知道不等于不疼。",
    ], fx({ t: "battle", id: "raider" }, { t: "karma", id: "broke-bargain" })),
    choice("new-term", "把火塘迁到它不认得的凹地", [
      "迁徙没有战斗那么好看。老人在路上骂你。骂完他还是走了。",
      "新的夜里，火还在。",
    ], fx({ t: "stat", k: "life", n: -4 }, { t: "rep", id: "ren", n: 4 }, { t: "karma", id: "moved-hearth" })),
  ], { weight: 0 }),

  ev("earth-foot", "earth", "比你先到的脚印", [
    "泥上有一串脚印，比你的深，也比你的旧。旧脚印在一个地方停了很久，像那个人也曾犹豫。",
  ], [
    choice("follow", "沿着脚印走一段", [
      "你走到一处避风的凹。凹里有半块干粮，干粮已经不能吃，善意还在。",
    ], fx({ t: "stat", k: "qi", n: 2 }, { t: "know", place: "tribes" })),
    choice("cover-foot", "把脚印抹掉", [
      "你抹掉的可能是一条猎物的路，也可能是一条猎人的路。",
      "抹完你自己也迷路了半个时辰。",
    ], fx({ t: "stat", k: "dao", n: 1 }, { t: "wound", n: 1 })),
  ]),

  ev("earth-tree", "earth", "不该结果的树", [
    "一棵刚从盘古发丝里长出来的树结了果。果子太早，早得像一个错误。",
  ], [
    choice("pick", "摘一枚", [
      "味道是土。你没有获得神通，只获得一点不敢再糟蹋食物的心情。",
    ], fx({ t: "good", id: "herb", n: 2 }, { t: "stat", k: "life", n: 3 })),
    choice("guard-tree", "守着，不让过路的兽一次摘光", [
      "你守到自己也饿。树留下了明年。",
    ], fx({ t: "stat", k: "virtue", n: 3 }, { t: "ling", n: -2 })),
  ]),

  ev("kunlun-quarrel", "kunlun", "门外的争吵", [
    "两个求入门的人吵起来。一个说自己根骨好，一个说自己心好。风听得直打哈欠。",
  ], [
    choice("stop-q", "叫他们停，先把伤者扶稳", [
      "争吵停在一个具体的伤口上。伤口比根骨诚实。",
    ], fx({ t: "stat", k: "virtue", n: 3 }, { t: "rep", id: "chan", n: 2 })),
    choice("judge", "替他们判一句", [
      "你判完，两个人都讨厌你。讨厌使你的话被记住了。",
    ], fx({ t: "stat", k: "dao", n: 2 }, { t: "karma", id: "judged-gate" })),
  ]),

  ev("kunlun-nightwind", "kunlun", "薄风夜", [
    "夜里的昆仑连石头都在省气。你若运功，会运得很清楚；若睡觉，会梦见戒律。",
  ], [
    choice("practice", "趁风清修炼", [
      "你的气息被风检阅。检阅没有说话，说话的是你自己逐渐变直的脊背。",
    ], fx({ t: "xiu", n: 14 })),
    choice("sleep", "好好睡", [
      "你睡了。梦里的戒律很吵，吵完你仍得到休息。休息也是资粮。",
    ], fx({ t: "stat", k: "life", n: 6 }, { t: "wound", n: -1 })),
  ]),

  ev("buzhou-child", "buzhou", "学扛的孩子", [
    "一个孩子在搬他搬不动的石头，搬法完全是错的，认真却是真的。",
  ], [
    choice("show", "纠正他的姿势", [
      "他学会了一点。学会的那一点会留在他成年后的肩里。",
    ], fx({ t: "rep", id: "wu", n: 3 }, { t: "stat", k: "virtue", n: 2 })),
    choice("carry-for", "替他搬完", [
      "他谢谢你，也失去一次自己扛动的机会。你看见他眼里的复杂。",
    ], fx({ t: "stat", k: "life", n: -3 }, { t: "karma", id: "carried-for-child" })),
  ]),

  ev("buzhou-bloodmark", "buzhou", "石上的血", [
    "石头上有干掉的血，形状不像战死，像一个人在这里坐到不行。",
  ], [
    choice("clean", "清洗", [
      "血渗进水里，水流向山脚。你不知道这是祭还是打扫。",
    ], fx({ t: "stat", k: "virtue", n: 2 }, { t: "rel", id: "houtu", n: 2 })),
    choice("study", "辨认他倒下的角度", [
      "角度告诉你：他是面对山坐着的。面对，说明他到最后仍认为山听得见。",
    ], fx({ t: "stat", k: "dao", n: 2 }, { t: "stat", k: "kill", n: 1 })),
  ]),

  ev("east-fish", "east", "被赐名的鱼", [
    "一条鱼拥有了一个很响的名字，响到它不能再做一条普通的鱼。它撞在浅滩上。",
  ], [
    choice("push", "把它推回深水", [
      "名字还在，水也在。它至少能先活着讨厌这个名字。",
    ], fx({ t: "stat", k: "virtue", n: 2 }, { t: "rel", id: "dijun", n: -1 })),
    choice("rename", "给它一个只有你们知道的小名", [
      "小名不能对抗朝堂，能对抗今夜。",
    ], fx({ t: "stat", k: "qi", n: 2 }, { t: "karma", id: "small-name" })),
  ]),

  ev("east-lighttax", "east", "光的税", [
    "岸上的精魂要交一点光才能在树下过夜。你若替人交，自己会暗一晚。",
  ], [
    choice("pay-tax", "替一个付不起的交", [
      "那一晚你看不清路。对方看清了自己的孩子。",
    ], fx({ t: "ling", n: -6 }, { t: "stat", k: "virtue", n: 4 })),
    choice("refuse-tax", "拒绝这个规矩，并大声说", [
      "你被请离树荫。请离的时候有人偷偷对你点头。",
    ], fx({ t: "rep", id: "yao", n: -4 }, { t: "karma", id: "spoke-against-tax" })),
  ]),

  ev("blood-half", "bloodsea", "空着的半座", [
    "座位之间有半个空位，像专门留给不愿意完全入伙的人。",
  ], [
    choice("half-sit", "只坐半边", [
      "半边很难受，姿势不雅。不雅使你保持清醒。",
    ], fx({ t: "xiu", n: 8 }, { t: "rep", id: "jie", n: 2 })),
    choice("full-no", "连半边也不坐", [
      "你站着听完一段讲道。脚是酸的，归属是清楚的。",
    ], fx({ t: "stat", k: "dao", n: 2 })),
  ]),

  ev("blood-wash", "bloodsea", "洗不掉", [
    "有人跪在岸边洗心魔，越洗越红。他叫你评评他还脏不脏。",
  ], [
    choice("stop-wash", "叫他停", [
      "你告诉他海不负责洗人。他恨你一刻，然后不洗了。",
    ], fx({ t: "stat", k: "virtue", n: 2 }, { t: "karma", id: "stopped-wash" })),
    choice("wash-with", "陪他洗，但换一条河的说法", [
      "你们改成坐下说话。话说完，红还在，人没有更深。",
    ], fx({ t: "stat", k: "demon", n: 1 }, { t: "stat", k: "dao", n: 2 })),
  ]),

  ev("wahuan-crack", "wahuan", "炉上的新缝", [
    "五色石的光从一条新缝里漏出来，漏向一个还没有人的方向。",
  ], [
    choice("plug", "用自己的灵气先堵上", [
      "堵上是临时的。临时能让今日的雨不变成灾。",
    ], fx({ t: "ling", n: -5 }, { t: "stat", k: "virtue", n: 3 })),
    choice("record-crack", "把缝的方向记下来", [
      "你的记录以后能用来救人，也能被人拿去找宝。你还是记了。",
    ], fx({ t: "stat", k: "dao", n: 2 }, { t: "karma", id: "mapped-crack" })),
  ]),

  ev("wahuan-names", "wahuan", "一堆还没人要的名字", [
    "泥坯旁边放着一些拟好的名字。名字比人先存在，这很危险。",
  ], [
    choice("scramble", "把名字的顺序打乱", [
      "你让「贵」和「贱」暂时对不上未来的脸。",
    ], fx({ t: "stat", k: "qi", n: 2 }, { t: "karma", id: "scrambled-names" })),
    choice("burn-names", "烧掉那些带鄙夷的", [
      "灰很轻。轻的灰仍是你做的决定。",
    ], fx({ t: "stat", k: "virtue", n: 3 }, { t: "rel", id: "nuwa", n: 2 })),
  ]),

  ev("youming-pass", "youming", "没有买路钱", [
    "最底下没有桥，却有一个习惯伸手的影子。它自己也知道现在还没有钱这种东西。",
  ], [
    choice("give-story", "给它讲一个活人的故事", [
      "它听完，把手收回去。故事比钱更像路引，也更难伪造。",
    ], fx({ t: "stat", k: "dao", n: 2 }, { t: "rel", id: "houtu", n: 3 })),
    choice("force-pass", "硬走", [
      "你走过了。背后的影子记住你的步伐，以备将来。",
    ], fx({ t: "stat", k: "kill", n: 2 }, { t: "wound", n: 1 })),
  ]),

  ev("youming-oldname", "youming", "谁在叫旧名", [
    "黑暗里有人叫你一个你已经不用的称呼。声音很近，人却不在。",
  ], [
    choice("answer-old", "应答", [
      "应答使那个称呼又活了一瞬。一瞬里你看见自己曾经更窄。",
    ], fx({ t: "stat", k: "demon", n: 2 }, { t: "xiu", n: 8 })),
    choice("new-name", "报出你现在的名字", [
      "黑暗消化了新名字，没有反驳。不反驳就是放行。",
    ], fx({ t: "stat", k: "dao", n: 2 }, { t: "karma", id: "named-self" })),
  ]),

  ev("tribes-cough", "tribes", "咳嗽的夜", [
    "一个老人咳得像要把火咳灭。药草你也许有，也许你更想留给自己的突破。",
  ], [
    choice("give-herb", "把灵草煎了", [
      "咳声小下去。小下去的夜里，所有人都欠你一个不会说出口的情。",
    ], fx({ t: "good", id: "herb", n: -1 }, { t: "rep", id: "ren", n: 5 }, { t: "stat", k: "virtue", n: 3 })),
    choice("teach-wrap", "教他们用普通叶子先缓解", [
      "不如灵草有效。有效的是他们明天自己也会做。",
    ], fx({ t: "stat", k: "dao", n: 1 }, { t: "rep", id: "ren", n: 3 })),
  ]),

  ev("tribes-smoke", "tribes", "烟的方向", [
    "孩子拉你看烟。烟往东斜，东边今夜不该有客。",
  ], [
    choice("check", "去东边看", [
      "你遇见的不是兽，是一个迷路的精魂。你让他绕开火塘。",
    ], fx({ t: "stat", k: "qi", n: 2 }, { t: "karma", id: "read-smoke" })),
    choice("move-kids", "先把孩子挪到下风", [
      "没有传奇。有几个没有被吓到的睡眠。",
    ], fx({ t: "stat", k: "virtue", n: 3 })),
  ]),

  ev("penglai-elder", "penglai", "退下来的人", [
    "一个曾经很能打的老灵在补渔网。他的手仍稳，稳得不像隐士，像一个决定不再证明自己的人。",
  ], [
    choice("ask-fight", "问他当年那一战", [
      "他讲了战术，没讲荣光。你得到几句能用的东西，和一种淡。",
    ], fx({ t: "stat", k: "kill", n: 2 }, { t: "stat", k: "dao", n: 1 })),
    choice("mend-net", "帮他补网，不问过去", [
      "网补好的时候，他教你一个打结的方法。方法能用来捆兽，也能用来修屋。",
    ], fx({ t: "stat", k: "virtue", n: 2 }, { t: "xiu", n: 6 })),
  ]),

  ev("penglai-mirror", "penglai", "海镜", [
    "退潮后一块平滑的水像镜子。镜子里的你比现在老，也比现在安静。",
  ], [
    choice("look-long", "看很久", [
      "你没有从镜子里得到预言。你得到对自己皱纹的预习，因而少怕了一点。",
    ], fx({ t: "stat", k: "dao", n: 2 }, { t: "stat", k: "demon", n: -1 })),
    choice("break-mirror", "用手搅碎它", [
      "水重新变成水。你拒绝被一个影子教育。拒绝使你精神，也使你莽。",
    ], fx({ t: "stat", k: "kill", n: 1 }, { t: "ling", n: 3 })),
  ]),

  ev("zixiao-mishear", "zixiao", "听错的一句", [
    "门外有人把「无为」听成「无我」，正准备去做一件很伤自己的事来表示虔诚。",
  ], [
    choice("correct-dao", "打断他", [
      "他难堪。难堪比残废便宜。",
    ], fx({ t: "stat", k: "virtue", n: 3 }, { t: "karma", id: "corrected-dao" })),
    choice("let-him", "随他去。道不负责每个听众", [
      "你保持了某种清高。清高在他受伤时不会来帮忙。",
    ], fx({ t: "stat", k: "demon", n: 2 }, { t: "stat", k: "dao", n: 1 })),
  ], { minRealm: 1 }),

  ev("edge-sleeper", "edge", "边上的闭关者", [
    "有人在世界边上都坐化了一半，还剩一半在争一口气。那口气不一定值得。",
  ], [
    choice("wake", "把他唤醒", [
      "他骂你毁了他的关。骂完他喝了你的水，活过来一点。",
    ], fx({ t: "stat", k: "virtue", n: 2 }, { t: "rel", id: "sleeper", n: 6 })),
    choice("guard-sit", "在旁边守着，不打断", [
      "你守到他的气自己转顺。他不知道你来过。",
    ], fx({ t: "xiu", n: 8 }, { t: "karma", id: "guarded-retreat" })),
  ]),

  ev("chaos-kin", "chaos", "另一粒还亮着", [
    "余隙里还有一粒和你当年一样不肯散的光。它比你小，也比你更慌。",
  ], [
    choice("stay-with", "陪它亮一会儿", [
      "你们没有交谈。光靠着光，慌少了一点。",
    ], fx({ t: "stat", k: "virtue", n: 2 }, { t: "xiu", n: 6 })),
    choice("push-out", "把它推向已经分开的世界", [
      "它被你推进风里。它会恨你，或者会活得更开。你无法同时拥有这两种评价。",
    ], fx({ t: "stat", k: "qi", n: 2 }, { t: "karma", id: "pushed-kin" })),
  ]),

  ev("board-ink", "board", "墨还没干的字", [
    "榜的边缘已经有一个别人的名字，墨还湿。名字的主人就站在下面，等着高兴。",
  ], [
    choice("warn-ink", "告诉他湿的墨也能改人", [
      "他犹豫了。犹豫可能救他，也可能让他恨你一辈子。",
    ], fx({ t: "stat", k: "virtue", n: 3 }, { t: "karma", id: "warned-ink" })),
    choice("congratulate", "恭喜他", [
      "恭喜很好听。好听的话把他往前送了一步。",
    ], fx({ t: "stat", k: "demon", n: 2 }, { t: "rep", id: "ren", n: -1 })),
  ], { eras: ["board"] }),

  ev("earth-bargain", "earth", "第一个讲价的人", [
    "有人想用三枚灵石换你刚采的草。价未必亏，可他的眼神在算你傻不傻。",
  ], [
    choice("deal", "换", [
      "交易完成。你学会看人的眼，不只看货。",
    ], fx({ t: "good", id: "herb", n: -1 }, { t: "stone", n: 3 }, { t: "rel", id: "merchant", n: 2 })),
    choice("no-deal", "不换，并告诉他草的真正用处", [
      "他收起算计，问你能不能教。你只教了一半。",
    ], fx({ t: "stat", k: "virtue", n: 2 }, { t: "stat", k: "dao", n: 1 })),
  ]),

  ev("kunlun-not-crane", "kunlun", "不是鹤", [
    "人们说昆仑有仙鹤。你看见的是一只普通的大鸟，腿上有伤，被传成祥瑞，因而没人敢治。",
  ], [
    choice("heal-bird", "治它的腿", [
      "祥瑞变回鸟。鸟飞走的样子并不神圣，所以很美。",
    ], fx({ t: "good", id: "herb", n: -1 }, { t: "stat", k: "virtue", n: 3 }, { t: "karma", id: "healed-bird" })),
    choice("leave-bird", "不破坏他们的祥瑞", [
      "鸟继续被围观。你离开时听见它叫，叫的不是仙音。",
    ], fx({ t: "stat", k: "demon", n: 2 })),
  ]),

  ev("chaos-beat", "chaos", "搏动乱了一拍", [
    "混沌的搏动漏了一拍。漏拍的地方掉出一小粒露，露里有开天前的冷。",
  ], [
    choice("take-dew", "接住", [
      "冷从手腕走到心口。你没有死。你更记得自己为什么不散。",
    ], fx({ t: "good", id: "dew", n: 2 }, { t: "stat", k: "dao", n: 1 })),
    choice("let-dew", "让它落回黑暗", [
      "你不捡。不捡使那一拍自己愈合。",
    ], fx({ t: "xiu", n: 8 })),
  ]),

  ev("earth-night-beast", "earth", "不请自来的兽", [
    "一头还没有种族的兽堵住你的路。它饿，你也要过路。",
  ], [
    choice("fight-beast", "打出一条路", [
      "兽退了。你没有追。不追使这件事停在「通过」，没有变成屠杀。",
    ], fx({ t: "battle", id: "stone" })),
    choice("feed-beast-wild", "把食物扔远，自己绕", [
      "绕路花了时间。时间和命比，你选了时间。",
    ], fx({ t: "good", id: "herb", n: -1 }, { t: "stat", k: "qi", n: 1 })),
  ]),

  ev("youming-lantern", "youming", "不该有的灯", [
    "幽冥深处有人点了一盏灯。灯在这个时代是违禁的温柔。",
  ], [
    choice("share-oil", "分它一点灵气当油", [
      "灯更稳。点灯的人是一个不愿意立刻消散的弱魂。",
    ], fx({ t: "ling", n: -4 }, { t: "stat", k: "virtue", n: 3 }, { t: "rel", id: "houtu", n: 2 })),
    choice("blow-out", "吹灭，说这里不该有路", [
      "黑暗恢复规矩。你不确定规矩是否比灯更仁慈。",
    ], fx({ t: "stat", k: "kill", n: 1 }, { t: "karma", id: "blew-lantern" })),
  ]),

  ev("wahuan-ash", "wahuan", "肯被烧的人", [
    "炉前有志愿者。志愿者的眼睛亮得不正常，像把牺牲当成了身份。",
  ], [
    choice("pull", "把他拉开", [
      "他恨你夺他的伟大。天漏并没有因为他没跳进去就扩大。",
    ], fx({ t: "stat", k: "virtue", n: 3 }, { t: "karma", id: "pulled-volunteer" })),
    choice("replace", "说：今天换我靠近一点，你去送水", [
      "你失去一截头发和一点修为。他学会送水。送水的人以后会比烈士多活很久。",
    ], fx({ t: "xiu", n: -8 }, { t: "stat", k: "virtue", n: 4 })),
  ]),

  ev("zixiao-rain", "zixiao", "阶上的雨", [
    "紫霄的影子下雨。雨只打湿门外的人，门里是干的。",
  ], [
    choice("stand-rain", "站在雨里听", [
      "湿冷把杂念淋稀。你听见自己牙齿打架的声音，比道更清楚。",
    ], fx({ t: "xiu", n: 10 }, { t: "wound", n: 1 })),
    choice("share-cloak", "把外衣分给旁边更小的灵", [
      "你更冷。对方没有因此悟道，只是没有病倒。",
    ], fx({ t: "stat", k: "virtue", n: 3 }, { t: "stat", k: "life", n: -2 })),
  ], { minRealm: 1 }),

  ev("penglai-boat", "penglai", "不肯载人的船", [
    "一条空船自己靠岸。船上没有桨。有人说这是去西边的邀请。",
  ], [
    choice("not-board", "不上去", [
      "船等了你一个时辰，然后走了。你剩下完整的一天。",
    ], fx({ t: "stat", k: "dao", n: 2 }, { t: "karma", id: "refused-boat" })),
    choice("board", "上去，看它把你放在哪里", [
      "它把你放在另一处岸，没有神迹，只有一段你本来要走很多天的路被省下。",
      "省下的路使你心神不宁：不劳而获的距离，不像自己的脚。",
    ], fx({ t: "know", place: "kunlun" }, { t: "stat", k: "qi", n: 2 }, { t: "stat", k: "demon", n: 1 })),
  ]),

  ev("buzhou-song", "buzhou", "没有词的歌", [
    "巫在搬石时哼一支没有词的歌。歌的节拍是为了让力一起落下，不是为了美。",
  ], [
    choice("join-song", "跟着哼，并把肩放上去", [
      "石落下的位置比你一个人精确。精确是集体的。",
    ], fx({ t: "stat", k: "life", n: -3 }, { t: "rep", id: "wu", n: 4 })),
    choice("listen-song", "只听节拍", [
      "你把节拍记进吐纳。以后你的功法里有一点抬石头的影子。",
    ], fx({ t: "xiu", n: 10 }, { t: "art", id: "bone" })),
  ]),

  ev("tribes-argument", "tribes", "第一场人的争吵", [
    "两个人为了一只兽的归属吵架。吵法非常新，新得还没有刀，只有越来越大的声音。",
  ], [
    choice("split-meat", "把兽分成两份，骨头煮汤", [
      "谁都不满意。不满意的人活着看到了明天的早饭。",
    ], fx({ t: "rep", id: "ren", n: 4 }, { t: "stat", k: "virtue", n: 2 })),
    choice("strongest", "说给打到它的人", [
      "规矩简单，以后会变成强者的法。你看见了这点，还是说了。",
    ], fx({ t: "stat", k: "kill", n: 1 }, { t: "karma", id: "said-strongest" })),
  ], { eras: ["clay", "board", "witch"] }),

  ev("blood-child", "bloodsea", "海里的孩子", [
    "一个不该出现在血海里的孩子形式的灵抓着礁石。它还没有学会饿。",
  ], [
    choice("lift-child", "抱上岸", [
      "你的衣服毁了。毁了的衣服换一个还没学会害人的早晨。",
    ], fx({ t: "stat", k: "virtue", n: 4 }, { t: "stat", k: "life", n: -2 }, { t: "karma", id: "saved-sea-child" })),
    choice("call-jie", "叫截教的人来认领", [
      "他们来得很快。快说明他们真的收。收进去之后，你就不再能决定它的课。",
    ], fx({ t: "rep", id: "jie", n: 3 }, { t: "karma", id: "gave-to-jie" })),
  ]),

  ev("east-orbit", "east", "轨道上的争论", [
    "两团光争同一条将要成为白天的线。谁也不肯晚一点出来。",
  ], [
    choice("mediate-sun", "提议轮流", [
      "它们听不懂轮流。你用自己的灵气做了一个短暂的影子，逼它们一先一后。",
    ], fx({ t: "ling", n: -6 }, { t: "stat", k: "dao", n: 2 }, { t: "karma", id: "made-turn" })),
    choice("side-sun", "帮较大的那团", [
      "白天来得更亮。亮过之后，较小的那团记了你的气味。",
    ], fx({ t: "stat", k: "qi", n: 3 }, { t: "karma", id: "sided-sun" })),
  ], { eras: ["longhan", "witch", "clay", "board"] }),

  ev("edge-name-burial", "edge", "把名字埋一会儿", [
    "边上有人教你一个法子：把名字埋进土里一个时辰，看看没有名字的自己还想不想修炼。",
  ], [
    choice("bury-name", "试", [
      "没有名字的那个时辰你很慌，慌完仍坐下运功。你因此知道自己不是只为名。",
    ], fx({ t: "xiu", n: 12 }, { t: "stat", k: "demon", n: -1 })),
    choice("keep-name-on", "不试。名字是你的锚", [
      "你拒绝这种考验。拒绝也需要力量，尤其是在别人都觉得很深的时候。",
    ], fx({ t: "stat", k: "dao", n: 2 })),
  ]),
];

export const KARMA_LABEL: Record<string, string> = {
  "took-stone": "取走不周碎石",
  "buried-stone": "把碎石埋回山根",
  "returned-stone": "把直的东西还了回去",
  "held-pillar": "在天倾时垫过一寸",
  "witnessed-fall": "看清了直物如何折",
  "drank-sea": "饮过血海",
  "covered-sea": "盖住过那口红",
  "owned-hunger": "承认饿是自己的",
  "stood-with-jie": "在血海无名前站过",
  "caught-purple": "接过一缕紫气",
  "listened-only": "在紫霄门外只听不取",
  "spoke-dao": "用自己的口音说过道",
  "shaped-clay": "暖过一块多余的泥",
  "fed-furnace": "把修为送进过补天炉",
  "joined-jie": "做过截教随众",
  "stood-array": "在阵脚站满过时辰",
  "wrote-precept": "在玉虚边页写过戒",
  "left-gap": "在篱笆上留过缝",
  "planted-fence": "插过玉虚的篱笆",
  "registered-yao": "在妖庭名册上有过形",
  "nameless-yao": "拒绝把名字交给妖庭",
  "held-suns": "拉住过同时落下的光",
  "found-vein": "找到过地脉",
  "built-cave": "有了自己的洞府",
  "hatched-beast": "孵过一枚没有母亲的蛋",
  "freed-beast": "把灵兽放回海里",
  "kept-beast": "给灵兽起了名字并留下",
  "borrowed": "欠过灵石",
  "repaid": "按时还清灵石",
  "shielded-fire": "用身体给火塘挡过风",
  "made-rota": "给人族写过值夜的约",
  "spared-yao-1": "给迷路的海妖让过路",
  "stood-by-yao": "在围殴时站到海妖旁边",
  "saw-blank": "看过空白的榜",
  "left-board": "在落墨前离开封神台",
  "guarded-unnamed": "挡在未被点名的人前面",
  "answered-name": "应过故人的称呼",
  "kept-name": "从心魔手里按回自己的名字",
  "lent-name": "把一部分名字寄给过心魔",
};

export function eventById(id: string) {
  return EVENTS.find((event) => event.id === id) ?? null;
}
