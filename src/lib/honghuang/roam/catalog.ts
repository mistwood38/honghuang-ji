import type { Origin } from "../types.ts";
import type { GoodId, PlaceId } from "./state.ts";

export type PlaceDef = {
  id: PlaceId;
  name: string;
  spirit: number;
  danger: number;
  neighbors: PlaceId[];
  good: GoodId;
  intro: string[];
};

export const ROAM_PLACES: Record<PlaceId, PlaceDef> = {
  chaos: {
    id: "chaos",
    name: "混沌余隙",
    spirit: 2,
    danger: 1,
    neighbors: ["earth", "edge"],
    good: "dew",
    intro: ["这里没有边。边是你自己不肯散，才勉强有的那一点。", "清与浊仍挤在一起，像一口没决定醒不醒的呼吸。"],
  },
  earth: {
    id: "earth",
    name: "洪荒大地",
    spirit: 3,
    danger: 2,
    neighbors: ["chaos", "kunlun", "buzhou", "east", "tribes", "wahuan", "edge"],
    good: "herb",
    intro: ["盘古倒下之后，呼吸先变成风。风经过的地方，开始有前后。", "大地还不习惯被踩。你每走一步，土都会记一下。"],
  },
  kunlun: {
    id: "kunlun",
    name: "昆仑",
    spirit: 5,
    danger: 2,
    neighbors: ["earth", "zixiao", "penglai"],
    good: "dew",
    intro: ["山很高，高处的风很薄。薄风最擅长把人的借口吹走。", "玉虚的门不看来人手里拿着什么，只看他肯不肯把算计放下。"],
  },
  buzhou: {
    id: "buzhou",
    name: "不周",
    spirit: 3,
    danger: 4,
    neighbors: ["earth", "youming", "bloodsea"],
    good: "ore",
    intro: ["这是一根不肯弯的骨头。直的东西，后来最容易被用来证明道理。", "山脚下有人用身体说话。他们说话的声音像搬石头。"],
  },
  east: {
    id: "east",
    name: "东海扶桑",
    spirit: 4,
    danger: 3,
    neighbors: ["earth", "penglai", "bloodsea"],
    good: "salt",
    intro: ["树上挂着太多光。光还没决定自己是一颗太阳，还是许多颗。", "海边的精魂喜欢被叫出名字。名字一旦叫顺，就很难再散回海里。"],
  },
  bloodsea: {
    id: "bloodsea",
    name: "血海",
    spirit: 4,
    danger: 4,
    neighbors: ["buzhou", "east", "youming"],
    good: "salt",
    intro: ["海是红的，因为那不是水，是还没冷却的生命。", "有人在这里讲：万物都该有座。这句话很干净，干净的话最难防。"],
  },
  wahuan: {
    id: "wahuan",
    name: "娲皇宫",
    spirit: 4,
    danger: 1,
    neighbors: ["earth", "tribes"],
    good: "clay",
    intro: ["宫不在天上。它在泥、火和还没成形的呼吸旁边。", "炉里烧的不是石头本身，是肯被烧掉的那一点。"],
  },
  youming: {
    id: "youming",
    name: "幽冥",
    spirit: 2,
    danger: 3,
    neighbors: ["buzhou", "bloodsea"],
    good: "ore",
    intro: ["浊气沉到不能再沉。这里还没有桥，也没有衙门。", "沉默比黑暗更厚。后土不回答，可她都听见了。"],
  },
  tribes: {
    id: "tribes",
    name: "人族火塘",
    spirit: 2,
    danger: 2,
    neighbors: ["earth", "wahuan", "board"],
    good: "seed",
    intro: ["火会灭，所以必须有人守。最早的职位不是官，是「你若睡了，大家就冷」。", "锅里的气味很轻。天上有些饿，是从这口锅开始认得地面的。"],
  },
  penglai: {
    id: "penglai",
    name: "蓬莱",
    spirit: 5,
    danger: 1,
    neighbors: ["east", "kunlun"],
    good: "dew",
    intro: ["山从海里浮出来，美得不适合打仗。", "有些老灵退到这里，不是因为勇敢，是因为他们已经看过太多次胜负。"],
  },
  zixiao: {
    id: "zixiao",
    name: "紫霄宫外",
    spirit: 6,
    danger: 2,
    neighbors: ["kunlun"],
    good: "dew",
    intro: ["宫不占地方，可所有地方都能看见它的影子。", "门开着。开着的门比关上的门更难进，因为你得自己承认你进不去。"],
  },
  edge: {
    id: "edge",
    name: "世界的边",
    spirit: 3,
    danger: 1,
    neighbors: ["chaos", "earth"],
    good: "dew",
    intro: ["斧只是在混沌身上开了一间屋子。屋子叫洪荒。这里是门框。", "闭关的人把时间烧在门框上。烧完，有的回去，有的不再要名字。"],
  },
  board: {
    id: "board",
    name: "封神台",
    spirit: 3,
    danger: 3,
    neighbors: ["tribes"],
    good: "seed",
    intro: ["台子先于字。空白的榜比写满更可怕，因为任何名字都还来得及被叫到。", "风从台下往上走，像有人在清点还没答应的人。"],
  },
};

export const ERAS = [
  { id: "chaos", name: "混沌未散", day: 0 },
  { id: "cleave", name: "开天", day: 8 },
  { id: "longhan", name: "龙汉", day: 28 },
  { id: "witch", name: "巫妖", day: 64 },
  { id: "clay", name: "造人", day: 108 },
  { id: "board", name: "封神将至", day: 160 },
] as const;

export function eraOf(day: number) {
  let cur: (typeof ERAS)[number] = ERAS[0];
  for (const era of ERAS) if (day >= era.day) cur = era;
  return cur;
}

export const GOODS: Record<GoodId, string> = {
  herb: "灵草",
  dew: "清露",
  ore: "玄矿",
  clay: "息壤泥",
  salt: "海盐晶",
  seed: "火种",
  "pill-qi": "凝气散",
  "pill-life": "续命丹",
  "pill-break": "破境丹",
};

export const RECIPES: {
  id: string;
  name: string;
  need: Partial<Record<GoodId, number>>;
  out: GoodId;
  text: string;
}[] = [
  {
    id: "qi",
    name: "凝气散",
    need: { herb: 2, dew: 1 },
    out: "pill-qi",
    text: "草汁与露水在掌心混成一小粒凉。它不替你悟道，只让枯掉的灵气暂时回来。",
  },
  {
    id: "life",
    name: "续命丹",
    need: { herb: 2, clay: 1 },
    out: "pill-life",
    text: "泥是温的。温不是治愈，是提醒道躯：你还可以再留一天。",
  },
  {
    id: "break",
    name: "破境丹",
    need: { herb: 3, ore: 1, salt: 1 },
    out: "pill-break",
    text: "矿的涩和盐的醒叠在一起。这丹不保证破境，它只是在关口上替你多扛一下。",
  },
];

export type ArtDef = {
  id: string;
  name: string;
  line: string;
  xiu: number;
  combat: number;
  spell?: boolean;
  origin?: Origin;
};

export const ARTS: Record<string, ArtDef> = {
  qingjing: {
    id: "qingjing",
    name: "清净吐纳",
    line: "把一口气留到下一息。留住，比留住道理更难。",
    xiu: 3,
    combat: 1,
    origin: "dao",
  },
  bone: {
    id: "bone",
    name: "承重式",
    line: "力不走巧。你把重量放回骨头里，骨头就记住你。",
    xiu: 1,
    combat: 4,
    origin: "wu",
  },
  form: {
    id: "form",
    name: "借形诀",
    line: "向风借轮廓，向海借鳞。借来的东西，到时要还。",
    xiu: 2,
    combat: 3,
    origin: "yao",
    spell: true,
  },
  hearth: {
    id: "hearth",
    name: "守火心法",
    line: "不求火更大，只求火在你睡过去之前还在。",
    xiu: 2,
    combat: 1,
    origin: "ren",
  },
  yuxu: {
    id: "yuxu",
    name: "玉虚戒",
    line: "先问这一步挡了谁的风。问完再动。",
    xiu: 4,
    combat: 2,
  },
  zhuxian: {
    id: "zhuxian",
    name: "诛仙剑意",
    line: "还没有剑。意已经够把人分成两边。",
    xiu: 2,
    combat: 5,
    spell: true,
  },
  wuxue: {
    id: "wuxue",
    name: "巫血承山",
    line: "口诀写不进血里。血只认你扛过的那一下。",
    xiu: 2,
    combat: 5,
  },
  sunheart: {
    id: "sunheart",
    name: "扶桑心光",
    line: "把多余的光收回胸腔，免得它去烧还没长成的人。",
    xiu: 3,
    combat: 3,
    spell: true,
  },
  mudra: {
    id: "mudra",
    name: "补天残印",
    line: "不求把天补成原来的样子。只补会漏到火塘上的那一块。",
    xiu: 3,
    combat: 2,
  },
};

export const SECTS: {
  id: string;
  name: string;
  place: PlaceId;
  art: string;
  creed: string;
  rank: string[];
}[] = [
  {
    id: "chan",
    name: "玉虚",
    place: "kunlun",
    art: "yuxu",
    creed: "先有规矩，再有位置。",
    rank: ["记名", "外门", "内门", "亲传"],
  },
  {
    id: "jie",
    name: "截教",
    place: "bloodsea",
    art: "zhuxian",
    creed: "万物有灵，皆可入座。",
    rank: ["随众", "执剑", "阵眼", "亲传"],
  },
  {
    id: "wu",
    name: "巫族",
    place: "buzhou",
    art: "wuxue",
    creed: "道理要能被身体扛住。",
    rank: ["力士", "祭司", "骨座", "祖影"],
  },
  {
    id: "yao",
    name: "妖庭",
    place: "east",
    art: "sunheart",
    creed: "有名，才有朝。",
    rank: ["精魂", "朝臣", "侍日", "侧席"],
  },
  {
    id: "hearth",
    name: "火塘",
    place: "tribes",
    art: "mudra",
    creed: "先让人活过今夜。",
    rank: ["守夜", "药徒", "约长", "火首"],
  },
];

export const ENEMIES: Record<
  string,
  {
    name: string;
    hp: number;
    atk: number;
    def: number;
    winText: string[];
    loseText: string[];
  }
> = {
  stone: {
    name: "未冷的石傀",
    hp: 32,
    atk: 7,
    def: 3,
    winText: ["石傀裂开时没有叫。它本来就不是活物，只是一块还记得盘古站姿的骨头。", "裂缝里滚出一点矿。矿是温的。"],
    loseText: ["你被石纹压进土里。土并不恨你，它只是还没学会让路。", "你爬出来的时候，少了一块能用力的地方。"],
  },
  tide: {
    name: "海妖残影",
    hp: 26,
    atk: 8,
    def: 1,
    winText: ["残影散成盐。它被钟声召过一次，已经不太记得自己原来的脸。", "你没有补上那张脸。"],
    loseText: ["潮把你掀倒。海里的东西喜欢把站不稳的人当成同类。", "你拒绝变成同类，所以只剩下伤。"],
  },
  demon: {
    name: "心魔夜谈",
    hp: 24,
    atk: 6,
    def: 0,
    winText: ["夜谈停了。它没有死，它只是暂时没话说。", "你知道它还会回来，可这一夜是你的。"],
    loseText: ["它用你自己的声音把话说完。你听完，很难立刻反驳。", "反驳不了的那一句，留在胸口。"],
  },
  raider: {
    name: "夺火的影子",
    hp: 30,
    atk: 9,
    def: 2,
    winText: ["影子退走时丢下半截火种。它不是来讲道理的，它是来取暖的。", "火塘还在。"],
    loseText: ["火被踩暗了一瞬。人的惊呼比你的伤更响。", "你躺着，还能听见有人把灰重新拢起来。"],
  },
  grave: {
    name: "幽冥里的饿",
    hp: 36,
    atk: 8,
    def: 2,
    winText: ["饿退回沉默里。后土没有称赞你，沉默本身就是放行。"],
    loseText: ["你在最底下多躺了一会儿。躺着的时候，名字变得很轻。"],
  },
};

export const CULTIVATE_LINES = [
  "你把呼吸放慢到能听见自己的骨头。骨头里有一点不肯散的劲，和开天之前一样。",
  "功法走到一半卡住了。卡住不是失败，是你终于碰到自己不懂的那一句。",
  "灵气从地里上来，经过伤处时顿了顿。伤处记住了这种凉。",
  "你试图不想结局。不想结局的时候，道反而清楚一点。",
  "山风或海风或炉火替你数息。数到后来，你分不清是谁在数。",
  "有一瞬你看见了下一重心的门。门没有开。看见门，已经比昨天多。",
  "心魔在旁边坐着，像一个多余的听众。你没有赶它，只是不把气息分给它。",
  "这一日没有异象。没有异象的修行，往往比有异象的更真。",
];

export const QUIET: Record<PlaceId, string[]> = {
  chaos: ["余隙里什么也没发生。没有发生，正是这里的常态。你把常态吸进肚子里，像储存一种以后会用完的黑。"],
  earth: ["大地上只有风。风把你的脚印抹浅，又没有完全抹掉。你顺着没抹掉的那一截往回看，看见自己还在。"],
  kunlun: ["昆仑今日不收人，也不赶人。你在门外坐到影子换了一座山，门里的钟没有为你响。"],
  buzhou: ["山很直。你靠着它站了一会儿，觉得自己的弯处都被比了出来。比出来也好。"],
  east: ["扶桑上的光今日很乖，没有往下掉。海边的人因此多说了几句废话。废话让世界像真的。"],
  bloodsea: ["海面平静时更可怕。平静说明下面的饿暂时同意等待。你没有打扰这份同意。"],
  wahuan: ["炉火自己响。没有人叫你去补天，也没有人叫你离开。泥在你指甲里干成一小片白。"],
  youming: ["下面没有白天。你数自己的心跳来代替时辰，数到后来不敢数了，怕把心跳数少。"],
  tribes: ["火塘边有人在教孩子认烟的方向。烟往哪边斜，兽就从哪边来。你听完，把这句记下了。"],
  penglai: ["仙山把日子过得很慢。慢不是空，是他们故意不把日子交给劫。你借了这份慢。"],
  zixiao: ["紫霄的影子今日偏低。偏低的时候，门外的人会以为自己听见了道。你没有把这份以为当成听见。"],
  edge: ["世界的边在呼吸。屋子里的战争、讲道、封榜，到了边上都会变成同一种风。"],
  board: ["榜还空着，或者已经开始有字。你站远一点。远一点，名字就不那么容易自己跳上去。"],
};

export const TASK_LINES: Record<string, string[]> = {
  chan: [
    "你替玉虚把一段被听错的戒律抄直。抄的时候发现，直的句子也会伤人。",
    "山门外有灵来求一句判断。你按戒律说了。说完，你自己先不安。",
    "你在薄风里守了一夜门。门里没有人出来感谢。规矩本来就不靠感谢活着。",
  ],
  jie: [
    "你在血海边给一个没有座位的精魂让出半步。半步很小，阵却记住了。",
    "有人要你把剑意对准同类。你把剑意对准了浪，没有对准那个人。",
    "你修补阵脚。阵脚喜欢吞人。你补的时候一直数自己的手指，确认还在。",
  ],
  wu: [
    "你替一座将塌的石梁多扛了一个时辰。时辰结束，梁还在，你的肩不在原来的位置。",
    "祖巫没有看你。不看，有时是承认你扛得动。",
    "你把一块多余的骨头从路上搬开。搬开之后，后来的人不知道你做过这件事。",
  ],
  yao: [
    "你在朝上少说了一句邀功的话。钟声因此没有把你归进今日的名单。",
    "你替一只还没成形的精魂挡住过分热情的赐名。名字可以以后再要。",
    "海边的税是光。你交出一点光，留下自己的轮廓。",
  ],
  hearth: [
    "你守到后半夜，把打瞌睡的人推醒前，先自己站直。",
    "有人争一块干粮。你没有讲大道，只把干粮按人头切开。切口不公平，但都活了。",
    "你用泥把漏风的墙糊上。墙外的神魔看不见这面墙。墙内的孩子看得见。",
  ],
};

export const BEASTS: Record<string, { name: string; line: string }> = {
  scale: { name: "未名小蛟", line: "鳞还软。它跟着你，是因为你没有先给它起死名。" },
  ember: { name: "炉边雀", line: "一只不肯离火的鸟。它的体温比道行诚实。" },
  shade: { name: "影犬", line: "幽冥里跟出来的影子。喂它，它就不咬你的名字。" },
};

export function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}
