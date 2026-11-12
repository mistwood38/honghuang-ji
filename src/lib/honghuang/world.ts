import type { Origin, StatKey } from "./types.ts";

export const APP_NAME = "洪荒纪";
export const NOVEL_NAME = "混沌本纪";

export const STAT_LABEL: Record<StatKey, string> = {
  dao: "道行",
  qi: "气运",
  kill: "杀伐",
  virtue: "仁德",
  demon: "心魔",
  life: "道躯",
};

export const STAT_ORDER: StatKey[] = ["dao", "qi", "kill", "virtue", "demon", "life"];

export const ORIGINS: Record<
  Origin,
  { name: string; seal: string; line: string; daoName: string }
> = {
  dao: {
    name: "道胎",
    seal: "道",
    daoName: "玄澄",
    line: "以悟为骨。听得见，也容易被大道理压折。",
  },
  wu: {
    name: "巫骨",
    seal: "巫",
    daoName: "刑岳",
    line: "以力承天。转弯慢，撞得动不该撞的东西。",
  },
  yao: {
    name: "妖形",
    seal: "妖",
    daoName: "照黎",
    line: "以形借气运。善变，也容易被钟声归类。",
  },
  ren: {
    name: "人愿",
    seal: "人",
    daoName: "薪禾",
    line: "以护持为种。起初最弱，香火以后会来找你。",
  },
};

export const REALMS: { min: number; name: string; line: string }[] = [
  { min: 0, name: "混沌灵", line: "尚未成形的记得。" },
  { min: 12, name: "炼气", line: "能把一口气留住。" },
  { min: 26, name: "筑基", line: "在新世界里有了站处。" },
  { min: 44, name: "金丹", line: "道在体内结成一粒，不借日月。" },
  { min: 66, name: "元婴", line: "灵识可以短时间离开道躯去听。" },
  { min: 92, name: "化神", line: "神意能盖过一方山水。" },
  { min: 122, name: "炼虚", line: "触到盘古没说完的那一句。" },
  { min: 156, name: "合体", line: "内外不再互相拆台。" },
  { min: 196, name: "大乘", line: "再进一步，就是圣人的门缝。" },
  { min: 240, name: "准圣", line: "门缝里的风已经像你的呼吸。此生极难真正站稳。" },
];

export function realmOf(dao: number) {
  let cur = REALMS[0]!;
  for (const realm of REALMS) {
    if (dao >= realm.min) cur = realm;
  }
  return cur;
}

export function nextRealm(dao: number) {
  return REALMS.find((realm) => realm.min > dao) ?? null;
}

export type ItemInfo = { name: string; lore: string };

export const ITEMS: Record<string, ItemInfo> = {
  "chaos-qi": {
    name: "混沌气",
    lore: "开天时吞下的一口未分之夜。它记得斧子以前，也记得饿。",
  },
  "pangu-bone": {
    name: "盘古骨",
    lore: "一块未冷的骨。山的祖形，也很沉。",
  },
  "purple-qi": {
    name: "紫气一缕",
    lore: "紫霄灯里溢出来的。被世界允许了一点点的感觉。",
  },
  zhuxian: {
    name: "诛仙剑意",
    lore: "还没有剑。意已经够伤人。",
  },
  "wu-blood": {
    name: "巫血",
    lore: "承重的方法，写在血里，不写在口诀里。",
  },
  bell: {
    name: "钟声一缕",
    lore: "东皇钟没有借你，只是有一响落进了识海。形会短暂归类。",
  },
  xirang: {
    name: "息壤",
    lore: "会自己长的土。女娲抟人时用过同类的湿。",
  },
  "buzhou-stone": {
    name: "不周石",
    lore: "天柱折下来的碎。直的东西留下的最后一点直。",
  },
  incense: {
    name: "人族香火",
    lore: "不是神位。是有人在吃饭时想起你，气便往上走。",
  },
};

export const FLAG_LABEL: Record<string, string> = {
  "bore-axe": "压过开天斧",
  swallowed: "吞过混沌",
  watcher: "旁观开天",
  bone: "取过盘古骨",
  "listened-breath": "听过盘古最后一口气",
  "blood-sea": "随血入海",
  "heard-hongjun": "紫霄入座",
  "heard-partial": "末座断续而听",
  outside: "立在紫霄门外",
  "sought-clay": "循泥与火而下",
  "faction-kunlun": "走近昆仑",
  "faction-jie": "走近血海",
  "faction-wu": "走近祖巫",
  "faction-yao": "走近妖庭",
  "faction-ren": "走向未生的人",
  "kunlun-disciple": "昆仑戒律加身",
  "kunlun-guest": "借昆仑修行",
  "left-kunlun": "自昆仑门前离开",
  "jie-sword": "接了诛仙剑意",
  "jie-array": "学了截教阵法",
  stained: "血海里越洗越深",
  "wu-wrestled": "与祖巫角力",
  "wu-blood": "学了巫血承重",
  "warned-zhou": "曾警告天柱",
  "heard-bell": "听过东皇钟",
  "true-form": "扶桑下长出真形",
  "stole-for-humans": "把温热送往人族",
  "helped-nuwa": "助女娲抟土",
  "blood-in-clay": "先天之物入泥",
  "watched-creation": "远观造人",
  retreated: "曾闭关",
  "side-wu": "战中偏巫",
  "side-yao": "战中偏妖",
  "side-peace": "试图劝住不周",
  "side-ren": "先去护人",
  "held-sky": "扛过倾天",
  looted: "取过天倾的石头",
  "saved-clay": "从天河里捞起泥人",
  "offered-stone": "把物投入补天炉",
  "entered-flame": "灵识入过补天火",
  "stood-aside": "袖手补天",
  "tore-board": "撕过封神榜",
  "shielded-humans": "护住人族香火",
  "entered-board": "走入封神局",
  "walked-away": "走出量劫",
};

export type PlaceInfo = {
  id: string;
  name: string;
  region: string;
  summary: string;
  detail: string;
};

export const LAYERS: { name: string; note: string }[] = [
  { name: "紫霄宫", note: "讲道处。不在三十三天之内，在其上看见一切层的影子。" },
  { name: "三十三天", note: "清气折成的台阶。越高越清，越不适合血肉久留。" },
  { name: "洪荒大地", note: "盘古所化。西北曾被不周撑起，折后倾而漏水。" },
  { name: "幽冥", note: "浊气的最底。后土的沉默。此时还不是衙门。" },
];

export const PLACES: PlaceInfo[] = [
  {
    id: "chaos",
    name: "混沌",
    region: "未开",
    summary: "没有边的黑，黑里有极慢的搏动。",
    detail:
      "清浊未分之处。大多数灵在这里亮一下就回去了。你是不肯散的那一粒。斧落之后，混沌没有消失，它退到屋子外边，仍像一张旧床。",
  },
  {
    id: "earth",
    name: "初成天地",
    region: "洪荒",
    summary: "盘古倒下的第一阵风。",
    detail:
      "呼吸刚刚变成风，血刚刚汇成海，骨刚刚想起自己可以是山。星辰开始有位置。这时拾骨、追气、入海，都会被天地记住。",
  },
  {
    id: "zixiao",
    name: "紫霄宫",
    region: "天",
    summary: "三十三天之上，鸿钧讲道的影子。",
    detail:
      "宫不占地方，可所有地方都能看见它。座位有数，门却开着。座上的人学习安静，门外的人还握着一口饿、一掌力或一口混沌。灯里会溢紫气。",
  },
  {
    id: "thirty-three",
    name: "三十三天",
    region: "天",
    summary: "清气叠起来的台阶。",
    detail:
      "不是宝座，是分层。大能在这里往来，血肉不宜久站。封神之后，许多空着的位子会被写成官职。本纪里你更多次只是仰头看见它。",
  },
  {
    id: "kunlun",
    name: "昆仑",
    region: "洪荒",
    summary: "西方高处。元始立规矩的山。",
    detail:
      "玉虚的门看你的因果，不看你的礼物是否贵重。抢来的道进不去。你可以跪受戒律，可以只借山修行，也可以看一眼就走。高处的篱笆护苗，也挡风。",
  },
  {
    id: "bloodsea",
    name: "血海",
    region: "洪荒",
    summary: "通天立教处。剑意比海先冷。",
    detail:
      "这里收得最多。最多就有阵，阵会把个人收成阵的一部分。有人来接诛仙的意，有人只学阵，有人以为能把心魔洗掉，结果把魔洗深。",
  },
  {
    id: "buzhou",
    name: "不周山",
    region: "洪荒",
    summary: "最直的一根天骨。直的东西容易折。",
    detail:
      "十二祖巫在这一带用身体讲道理。共工败于太阳之一后，用头与这根骨头争一个道理。山折，天倾西北，天河倒灌。折声很短，短过开天之斧。",
  },
  {
    id: "east",
    name: "东海妖庭",
    region: "洪荒",
    summary: "扶桑、众日、太一的月、东皇的钟。",
    detail:
      "帝俊把散居的精魂收成朝。华美，近乎残忍。钟是礼也是刑。你可以借一缕钟声，可以在树下长自己的真形，也可以把一丝温热偷偷送去人将生的地方。",
  },
  {
    id: "wahuan",
    name: "娲皇宫",
    region: "人境",
    summary: "不在天上。在泥与火旁边。",
    detail:
      "女娲抟土、炼五色石的地方。宫门对三清的座位之争关着。这里讨论的是冷、是同类、是天的洞要不要只盖住宝座。炉火吃的是「肯被烧」。",
  },
  {
    id: "youming",
    name: "幽冥",
    region: "下",
    summary: "地的最底，后土的沉默。",
    detail:
      "浊气沉到不能再沉的地方。此时没有奈何桥的繁文。死者若有，也只是被大地容纳。封神之后人们才开始在这里修衙门。你此生或许只远远知道它在。",
  },
  {
    id: "penglai",
    name: "蓬莱",
    region: "海",
    summary: "海中仙山。大事很少在这里发生。",
    detail:
      "很美，美到不适合做量劫的战场。龙汉后退走的一些老灵会经过。若你最终隐去，未必定居，但风会提一句这个名字。",
  },
  {
    id: "tribes",
    name: "人族火塘",
    region: "人境",
    summary: "会灭的火，所以必须有人守。",
    detail:
      "最早的职位不是官，是「你若睡了，大家就冷」。符号、草药、约，都从火塘边长出来。香火也是。天上的饿，是从这口锅开始的。",
  },
  {
    id: "board",
    name: "封神台",
    region: "人境",
    summary: "竖着一块还没写字的榜。",
    detail:
      "空白比写满可怕。撕、护、入、走，没有一种干净。字比人硬。一旦写上，名字就不再只属于你。",
  },
  {
    id: "edge",
    name: "世界的边",
    region: "未开",
    summary: "屋子之外，混沌那张旧床。",
    detail:
      "闭关的人在边附近把时间烧成道行。走出量劫的人回到这里。散尽的人也会被风送回这张床，小到不能再选。",
  },
];

export function placeById(id: string) {
  return PLACES.find((place) => place.id === id) ?? null;
}
