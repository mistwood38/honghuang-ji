import type { Origin } from "../types.ts";
import type { Effect, FactionId, GoodId, PlaceId } from "./state.ts";
export type LineageChoice = {
  id: string;
  text: string;
  result: string[];
  cost?: { good: GoodId; count: number };
  effects?: Effect[];
  ending?: { name: string; peace: boolean };
};
export type LineageChapter = {
  title: string;
  place: PlaceId;
  prose: string[];
  objective: string;
  gate?: "repair" | "standing" | "trial";
  choices: LineageChoice[];
};
export type LineageDef = {
  name: string;
  subtitle: string;
  faction: FactionId;
  witness: string;
  art: string;
  chapters: LineageChapter[];
};
export const LINEAGES: Record<Origin, LineageDef> = {
  dao: {
    name: "灵族 · 无名之声",
    subtitle: "从一缕不肯散去的气，走到能替万灵留名的人。",
    faction: "chan",
    witness: "qingxing",
    art: "yuxu",
    chapters: [
      {
        title: "一 · 风里缺了一声",
        place: "earth",
        objective: "在洪荒大地听完无名者的请求。",
        prose: [
          "青荇把一片空叶交给你。叶上没有字，却有数种呼吸互相避让，仿佛只要谁响一点，别的就要被抹掉。",
          "「他们不是不愿说话，」她说，「是还没有被允许拥有声音。你愿意先记下谁？」",
        ],
        choices: [
          {
            id: "names",
            text: "逐一听清，把名字留在叶上",
            result: ["你等到每道细声都说完。叶子重了一点，从此路上的无名精灵会认得这份耐心。"],
            effects: [{ t: "karma", id: "lineage-dao-names" }],
          },
          {
            id: "breath",
            text: "不分名字，先让他们同呼吸",
            result: [
              "你没有替他们排次序，只留出一段共同呼吸的空处。青荇把叶柄系在你腕上，叫你别忘记空处也会被人占走。",
            ],
            effects: [{ t: "karma", id: "lineage-dao-breath" }],
          },
        ],
      },
      {
        title: "二 · 松下有断脉",
        place: "kunlun",
        gate: "repair",
        objective: "修复昆仑的松下残阵，并等地脉重新稳定。",
        prose: [
          "昆仑松下，清气沿完整的石纹向上走，散灵却总被漏下。山门说这叫筛选，叶上的呼吸叫它另一种散失。",
          "你要先亲手把断处接好，才有资格问那一道门究竟替谁而开。",
        ],
        choices: [
          {
            id: "measure",
            text: "把修补的纹理留给守门人",
            result: ["守门人低头看了很久。他第一次发现，规矩之外还有一条不会伤到后来者的走法。"],
          },
          {
            id: "listen",
            text: "让来路上的散灵先试着经过",
            result: [
              "细小的声音一一过去，没有谁因此从叶上消失。你把这件事记下，预备有一天在更高的门前说出来。",
            ],
          },
        ],
      },
      {
        title: "三 · 门框外的回信",
        place: "edge",
        objective: "备两份清露，替界风中的散灵留住回声。",
        prose: [
          "世界的边有一封没有落款的回信。它问：若所有名字终究都要归于一道，记住它们还有什么用？",
          "风在信纸上穿来穿去。你要先让它湿润、完整，才能写下自己的回答。",
        ],
        choices: [
          {
            id: "return",
            text: "写下：有人愿意回来寻找你",
            cost: { good: "dew", count: 2 },
            result: ["露沿纸脉展开。回信没有许诺永恒，只许诺仍会有人回头；散灵因此肯再等一等。"],
          },
          {
            id: "free",
            text: "写下：归去也不必抹去来过",
            cost: { good: "dew", count: 2 },
            result: ["你给散去也留下了位置。界风慢下来，像是终于不必证明自己与屋里的风相同。"],
          },
        ],
      },
      {
        title: "四 · 玉虚问席",
        place: "kunlun",
        gate: "standing",
        objective: "获得玉虚的基本信任，或完成青荇的托付后再来。",
        prose: [
          "守门人认出了修补的石纹，却仍问你：若每一缕气都有自己的名字，这山门拿什么维持秩序？",
          "你带来的不是一句漂亮话。护路的物资、沿途的回信，已经替你证明你肯承担说话之后的事。",
        ],
        choices: [
          {
            id: "order",
            text: "约定守门的责任，不约定谁更高贵",
            result: [
              "守门人将旧名册翻到背面，添了守门者也必须遵守的一行。门没有因此消失，却不再只有进门的人受审。",
            ],
            effects: [{ t: "rep", id: "chan", n: 3 }],
          },
          {
            id: "wander",
            text: "不入门墙，仍愿为往来者作证",
            result: ["你把客席推回去。山门没有许给你名分，却答应下一次争执时听你说完。"],
            effects: [{ t: "rep", id: "jie", n: 3 }],
          },
        ],
      },
      {
        title: "五 · 只有一声的影子",
        place: "edge",
        gate: "trial",
        objective: "抵达炼气境后，在界边击退吞声之影。",
        prose: [
          "你回来时，回信被一团整齐的影子盖住。它不吼叫，只把每一道呼吸变成与自己相同的一声。",
          "这次需要真正的力量。你可以退去修炼，也可以用已经学会的招式，守住那些不肯相同的声音。",
        ],
        choices: [
          {
            id: "hold",
            text: "留在缺口，等每一道声音过去",
            result: ["影子被击退后，你没有立刻离开。直到叶上最后一声也找到归路，你才收回护势。"],
          },
          {
            id: "carry",
            text: "携回声音，让他们自己选择归处",
            result: ["你把回信举到风里。声音没有跟你排成一队，而是向各自想去的地方散开。"],
          },
        ],
      },
      {
        title: "六 · 山门与万灵",
        place: "kunlun",
        objective: "带着界边的见证，为这一卷落款。",
        prose: [
          "山门前多了一块没有写满的石碑。守门人把凿子交给你，说最后一行不能由山门自己替万灵写。",
          "你知道落款会留下位置，也会留下责任。此卷写完以后，你仍要在这个世界里过自己的日子。",
        ],
        choices: [
          {
            id: "open",
            text: "留一行空白，供后来者添名",
            result: [
              "碑没有完成，门却第一次显得完整。玉虚与截教收到同一份见证，答应暂息门墙之争，给往来者留出路。",
            ],
            ending: { name: "万灵有席", peace: true },
          },
          {
            id: "keeper",
            text: "刻下自己的名字，承担守门之责",
            result: [
              "你不是第一位守门人，却决定让每个后来者知道该向谁追问。玉虚将一卷戒法交给你，守门从此有了可被记住的责任。",
            ],
            ending: { name: "有名之门", peace: false },
          },
        ],
      },
    ],
  },
  wu: {
    name: "巫族 · 山骨行记",
    subtitle: "肩上所负，不只是一块不会说话的石头。",
    faction: "wu",
    witness: "pansheng",
    art: "wuxue",
    chapters: [
      {
        title: "一 · 谁来接下一肩",
        place: "buzhou",
        objective: "在不周听磐生说完这次负山的缘由。",
        prose: [
          "磐生肩上有一圈旧伤。他将一块将裂未裂的石交给你，说族里又要选一个最能扛的人。",
          "「扛得最久的那个人，」他说，「往往最后才知道山下住着谁。」",
        ],
        choices: [
          {
            id: "shoulder",
            text: "接过石头，先与他换一肩",
            result: ["重量压进骨中。磐生终于有空转身，指给你看石下面那条被遮住的小路。"],
            effects: [{ t: "karma", id: "lineage-wu-shoulder" }],
          },
          {
            id: "road",
            text: "先问清山下的人要往哪里去",
            result: [
              "磐生沉默片刻，把石放在地上。你们一起画出绕山的路，负担第一次有了可以商量的方向。",
            ],
            effects: [{ t: "karma", id: "lineage-wu-road" }],
          },
        ],
      },
      {
        title: "二 · 石堰之后",
        place: "earth",
        gate: "repair",
        objective: "修好洪荒大地的断流石堰，等下游重新通水。",
        prose: [
          "下游的人不认巫族的称号，只认水有没有回来。断堰旁有人看着你的肩，说若你只会把石举高，水仍会从他们头上落下。",
          "这一次负山不能只证明力气。你得让重量真正落在不伤人的地方。",
        ],
        choices: [
          {
            id: "banks",
            text: "沿两岸走一遍，再收回肩背",
            result: ["水走过原先干裂的土。你这才卸力，听见岸边的人把你的脚步记成一种可靠的声音。"],
          },
          {
            id: "teach",
            text: "把撑石的方法教给后来的人",
            result: [
              "你把受力的位置刻在木上。下一次不必等到最强的人赶来，小些的肩背也能一同接住水。",
            ],
          },
        ],
      },
      {
        title: "三 · 沉默里的祖声",
        place: "youming",
        objective: "带两份玄矿，在幽冥为旧日负山者立下记号。",
        prose: [
          "幽冥没有替死者排功劳。水边只摆着一排磨平的石，每一块都曾被肩背托过。",
          "你用玄矿补上缺失的几块，想起活着的人也常被称为一件好用的器物。",
        ],
        choices: [
          {
            id: "names",
            text: "刻下负山者的名字",
            cost: { good: "ore", count: 2 },
            result: [
              "每个名字旁都留了一道指痕。你没有替他们说自己不曾听过的豪言，只让他们不再只剩一个重量。",
            ],
          },
          {
            id: "rest",
            text: "刻下：此处可以卸肩",
            cost: { good: "ore", count: 2 },
            result: [
              "没有祖声回答你。可离开时，那种催你永远站直的力量轻了一点，像有人终于被允许坐下。",
            ],
          },
        ],
      },
      {
        title: "四 · 号角与河岸",
        place: "buzhou",
        gate: "standing",
        objective: "为巫族护路建立信任，或完成磐生的托付。",
        prose: [
          "营中在磨兵，河岸却在等下一批撑堤的石。两边都来叫你的名字，好像你只能成为其中一边的肩。",
          "磐生把号角放到地上，让你先回答：这一身力，究竟要保护什么？",
        ],
        choices: [
          {
            id: "stand",
            text: "守住族地，也不越过无辜者的河岸",
            result: [
              "你把界线画在水边，而非别人的额头上。营中有人不快，也有人终于知道该在哪里停手。",
            ],
            effects: [{ t: "rep", id: "wu", n: 3 }],
          },
          {
            id: "bridge",
            text: "替两岸留桥，不替号角挑敌人",
            result: [
              "你没有接旗，只接下修桥的绳。族里仍记得你是同族，河对面也开始记得你不是一个称号。",
            ],
            effects: [{ t: "rep", id: "yao", n: 3 }],
          },
        ],
      },
      {
        title: "五 · 折骨者",
        place: "buzhou",
        gate: "trial",
        objective: "抵达炼气境后，击退借山势伤人的折骨凶灵。",
        prose: [
          "有东西学会了号角的声音。它驱使松石冲向河岸，再把每一次伤亡说成族人应付的代价。",
          "你认得真正的重量，也认得有人借重量说谎的声音。这一回不能只把肩低下去。",
        ],
        choices: [
          {
            id: "brace",
            text: "托住落石，让两岸的人先过",
            result: [
              "凶灵散后仍有石头滚动。你站到最后一块也停住，才发现两岸都有人伸手来接你的肩。",
            ],
          },
          {
            id: "break",
            text: "折断号角，让重量回到大地",
            result: ["号角碎了。那些被逼着站成一排的人慢慢散开，第一次各自决定下一步往哪里走。"],
          },
        ],
      },
      {
        title: "六 · 山骨有归处",
        place: "earth",
        objective: "回到石堰，决定往后如何使用这一身力量。",
        prose: [
          "水路通了，岸边长出一排新的草。磐生来时没有背石，只带来两只够人坐下的木凳。",
          "「现在再说一次，」他问，「你愿意扛的是什么？」",
        ],
        choices: [
          {
            id: "bridge",
            text: "守两岸的路，让人不必先分敌我",
            result: [
              "你把巫与妖的护路人请到同一岸上。暂息兵戈的约写得很短，却足以让下一代先学会渡河。",
            ],
            ending: { name: "两岸皆可渡", peace: true },
          },
          {
            id: "mountain",
            text: "回族中接肩，也教他们何时卸肩",
            result: [
              "巫族把承山的血法传给你。你将幽冥带回的那句话添在口诀最后：身体不是永远不能放下的器物。",
            ],
            ending: { name: "山骨可息", peace: false },
          },
        ],
      },
    ],
  },
  yao: {
    name: "妖族 · 借名渡海",
    subtitle: "名册可以给你位置，名字却须由自己活出来。",
    faction: "yao",
    witness: "wuwei",
    art: "sunheart",
    chapters: [
      {
        title: "一 · 册外的尾影",
        place: "east",
        objective: "在东海听雾尾讲一位未入名册的同族。",
        prose: [
          "雾尾在盐滩上擦去一串爪印，说那是一个不肯报上真名的小妖。朝命来过三次，海却从来不查它的名字。",
          "她递给你一页空册，问你是否也曾向风借来一种形状。",
        ],
        choices: [
          {
            id: "true",
            text: "写下真名，让来者能当面追问",
            result: ["你把名字写得很慢。雾尾没有劝阻，只说既留下名字，就别让别人替你解释它。"],
            effects: [{ t: "karma", id: "lineage-yao-true" }],
          },
          {
            id: "shadow",
            text: "留一道尾影，暂不交出真名",
            result: [
              "尾影在纸上转了一个弯。雾尾笑了一下，说不是每次躲开目光，都等于不愿承担事情。",
            ],
            effects: [{ t: "karma", id: "lineage-yao-shadow" }],
          },
        ],
      },
      {
        title: "二 · 漂离的岛",
        place: "penglai",
        gate: "repair",
        objective: "修复蓬莱的浮岛锚石，等岛路重新安稳。",
        prose: [
          "蓬莱的小妖把行囊放在一边，等浮岛自己漂回旧路。它们说借来的形状已经够多，不愿再向任何朝命借一条回家的路。",
          "锚石松开之后，海不问谁有名册。你得先替这群人留住可以自己走的地。",
        ],
        choices: [
          {
            id: "route",
            text: "把绕潮的走法留给岛上居民",
            result: [
              "你沿兽径试过最浅的路，再将脚印留给更小的同族。锚石稳了，岛不必靠服从来证明自己属于这里。",
            ],
          },
          {
            id: "signal",
            text: "升起信灯，让失散者认得归处",
            result: [
              "灯没有画朝徽，只画一片向岸边收拢的叶。第一艘小船回来的时候，没有人先问船上是谁的臣属。",
            ],
          },
        ],
      },
      {
        title: "三 · 盐与陌生的锅",
        place: "tribes",
        objective: "带两份海盐晶来到人族火塘，兑现沿海的约定。",
        prose: [
          "火塘边的人见你带着妖形，没有立刻收起锅。他们只是问盐从哪里来，会不会在开价之后又索要别的东西。",
          "雾尾说过，路是来回走的。你如今终于站在路的另一头。",
        ],
        choices: [
          {
            id: "meal",
            text: "放下盐，与他们共食一锅",
            cost: { good: "salt", count: 2 },
            result: [
              "你们互相问了不怎么聪明的问题，也互相答了。盐落进锅里以后，妖与人的称呼终于没有盖过饭的气味。",
            ],
          },
          {
            id: "pledge",
            text: "写清往来的约，不拿饥饿压价",
            cost: { good: "salt", count: 2 },
            result: [
              "约上没有谁天生高贵，只写货物、归期和谁来承担失约。守火的人给你留了一份副本。",
            ],
          },
        ],
      },
      {
        title: "四 · 扶桑点名",
        place: "east",
        gate: "standing",
        objective: "为妖庭护路取得信任，或完成雾尾的托付。",
        prose: [
          "使者终于读到你的名字。她称赞你的来往，又问是否愿意把每一处安全渡口都写进朝中的名册。",
          "你想到蓬莱的信灯，也想到火塘里的盐。把路画出来，和把路交出去，并不是同一件事。",
        ],
        choices: [
          {
            id: "court",
            text: "入册任事，但明写渡口由居民共守",
            result: [
              "使者改了两遍条文。你的名字仍在册上，后面却多了一句不那么好看的限制，足够让人日后拿来对照。",
            ],
            effects: [{ t: "rep", id: "yao", n: 3 }],
          },
          {
            id: "free",
            text: "不领朝位，只认已经许下的往来",
            result: [
              "你退回册页，留下往来的约。朝中没有因此忘记你，海上的人却知道，求一条路不必先求到一张座。",
            ],
            effects: [{ t: "rep", id: "hearth", n: 3 }],
          },
        ],
      },
      {
        title: "五 · 窃名的潮影",
        place: "east",
        gate: "trial",
        objective: "抵达炼气境后，击退借你的名字截路的潮影。",
        prose: [
          "盐船被拦下，对方亮出一页与你相同的名册。潮影没有自己的脸，却能把你说过的话反过来压在陌生人身上。",
          "名字既被拿来伤人，你就必须亲自到场。",
        ],
        choices: [
          {
            id: "witness",
            text: "请船上的人共同辨认，让冒名者无处藏",
            result: [
              "潮影散去后，你没有独自收走那页册。每个被它伤过的人都留下一道记号，往后的路不再只听一种声音。",
            ],
          },
          {
            id: "burn",
            text: "烧去假册，把同行者先送过海",
            result: ["纸在海风里燃尽。你逐一送过那些不敢再报名字的人，才在最后一班潮水里返回。"],
          },
        ],
      },
      {
        title: "六 · 海上自有名",
        place: "penglai",
        objective: "回到浮岛，为名字与道路定下最后的约。",
        prose: [
          "信灯仍亮着。雾尾站在灯下，没有再问你是否向风借过形状，只问这一路有没有把自己借丢。",
          "你摸到衣内的回信，知道名字已经不止存在于纸上。",
        ],
        choices: [
          {
            id: "sea",
            text: "守开放的渡口，让各族都能留下自己的名",
            result: [
              "巫与妖的护路人接到同一封信。你们不曾变得相同，却答应给渡海的人留下一段不必选边的潮水。",
            ],
            ending: { name: "千形共渡", peace: true },
          },
          {
            id: "sun",
            text: "带着自己的条件回庭任事",
            result: [
              "扶桑的心光落在你掌中。你将火塘的副本和蓬莱的信灯记入行册，让朝位也记得自己须向谁交代。",
            ],
            ending: { name: "有约之名", peace: false },
          },
        ],
      },
    ],
  },
  ren: {
    name: "人族 · 薪火有后",
    subtitle: "短命的人，也能把承诺留到比自己更远的地方。",
    faction: "hearth",
    witness: "axin",
    art: "mudra",
    chapters: [
      {
        title: "一 · 谁守下一夜",
        place: "tribes",
        objective: "在火塘听阿薪讲完守夜人的难题。",
        prose: [
          "阿薪守火时睡着了。没有人受冻，可他醒来之后一直不肯碰那根拨火的木棍。",
          "你看见火塘边只有一个人的位置，却有整个聚落的人要靠它过夜。",
        ],
        choices: [
          {
            id: "shift",
            text: "排下轮值，让守夜不再靠一个人",
            result: [
              "你把空位拉成一圈，问每个人哪一夜能来。阿薪终于肯把木棍交出去，火没有因此小下去。",
            ],
            effects: [{ t: "karma", id: "lineage-ren-shift" }],
          },
          {
            id: "stay",
            text: "先替他守完这一夜，再谈以后的办法",
            result: [
              "你没有要求他立刻从羞愧里站起。天亮时，阿薪在你旁边放了一碗热水，答应一起想明夜怎么办。",
            ],
            effects: [{ t: "karma", id: "lineage-ren-stay" }],
          },
        ],
      },
      {
        title: "二 · 雨不能挑人",
        place: "tribes",
        gate: "repair",
        objective: "修好避雨火棚，等它经住数日风雨。",
        prose: [
          "棚顶漏雨，火塘边的人便按强弱挪位置。最外一圈的人没有争，只把孩子往里面推。",
          "你若只把火拨得更旺，雨还是会落在同一批人身上。",
        ],
        choices: [
          {
            id: "wide",
            text: "把干燥的地方向外多留一圈",
            result: [
              "修好的棚没有门槛。雨落下时，最先发现自己不必再挪位置的人，替你把木梁托了起来。",
            ],
          },
          {
            id: "craft",
            text: "留下图样，让别处也能搭起同样的棚",
            result: [
              "你在泥上划出梁与绳的位置。火塘的人把图样晾干，像保存一份能让陌生人也过夜的约。",
            ],
          },
        ],
      },
      {
        title: "三 · 余泥的问话",
        place: "wahuan",
        objective: "备两份息壤泥，在娲皇宫旁学习补缺。",
        prose: [
          "捏泥棚里有一尊总也站不稳的小像。看棚的人说，你可以把它捏得强一点，也可以替它补一块合适的地。",
          "你想到火棚最外面的一圈，迟迟没有先去捏小像的腿。",
        ],
        choices: [
          {
            id: "ground",
            text: "先补脚下的地，再让它自己站",
            cost: { good: "clay", count: 2 },
            result: [
              "泥地平了，小像终于不必借你的手站立。看棚的人把补缺的印记留在你掌心，没有替你指明该拿它换什么。",
            ],
          },
          {
            id: "hands",
            text: "做几双能互相扶持的手",
            cost: { good: "clay", count: 2 },
            result: [
              "小像仍然不算强，却不再独自向一边倒。你将余泥收好，预备回去教给那些总站在棚外的人。",
            ],
          },
        ],
      },
      {
        title: "四 · 谁替众人说话",
        place: "tribes",
        gate: "standing",
        objective: "为火塘护路建立信任，或完成阿薪的托付。",
        prose: [
          "有人来请你做火首，说名字只须写一个，众人的意思以后都能由你转述。阿薪把轮值的木片摆在桌上，没有先答应。",
          "你知道一个名字可以让话传得更快，也可以让别人的话再也传不上来。",
        ],
        choices: [
          {
            id: "council",
            text: "让每一轮守夜人都有一片说话的木简",
            result: [
              "议事慢了一点，也吵了一点。可第一次有棚外的人说完自己的那一句，没有被谁替他归成大意。",
            ],
            effects: [{ t: "rep", id: "hearth", n: 3 }],
          },
          {
            id: "vow",
            text: "接下火首之名，也留下众人能撤回的约",
            result: [
              "你将自己的名字写在约的最后。火塘不是从此永远属于你，而是暂时把一件须归还的事交给了你。",
            ],
            effects: [{ t: "rep", id: "hearth", n: 3 }],
          },
        ],
      },
      {
        title: "五 · 灭火者",
        place: "tribes",
        gate: "trial",
        objective: "抵达炼气境后，击退借恐惧索取香火的凶灵。",
        prose: [
          "凶灵来时没有立刻灭火。它说只要众人每日先供它，便可以允许这一团火继续烧下去。",
          "有人已经想跪。你握住补缺留下的印记，知道不能让过夜的资格变成它赐下的恩。",
        ],
        choices: [
          {
            id: "circle",
            text: "守住人群，让他们自己重新添柴",
            result: [
              "凶灵退去后，没人替大家宣告火永远不会再灭。众人只是一起站起来，把下一夜的柴添了进去。",
            ],
          },
          {
            id: "seed",
            text: "分出火种，让一处熄灭也不至全暗",
            result: [
              "火种被送进不同的手里。你望见远处陆续亮起的光，终于知道守火不必把所有人留在同一个火塘边。",
            ],
          },
        ],
      },
      {
        title: "六 · 后来人的夜",
        place: "wahuan",
        objective: "把火塘的约带回捏泥棚，为这一卷留下余地。",
        prose: [
          "你带来的不是供奉，是一片写着轮值与归还的木简。看棚的人读完，将它放在站稳的小像旁边。",
          "「若有一日你不在了呢？」她问。你想起远处那些不必靠你拨动的火。",
        ],
        choices: [
          {
            id: "many",
            text: "让约与火种同行，不让任何一座高台独占",
            result: [
              "补缺的残印留在你掌心，木简却被送向更多聚落。玉虚与截教也收到一份：争道之前，先让地上的人过完这一夜。",
            ],
            ending: { name: "万家有后夜", peace: true },
          },
          {
            id: "hearth",
            text: "回去守约，也教后来人如何接手",
            result: [
              "你接受了补缺的残印，却没有把它锁成一家人的传物。火塘将你的名字记在轮值之后，那里仍有许多空格。",
            ],
            ending: { name: "薪火可相传", peace: false },
          },
        ],
      },
    ],
  },
};
