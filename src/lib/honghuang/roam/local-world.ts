import { advancePoliticsAt } from "./politics.ts";
import type { Origin, SaveData } from "../types.ts";
import { ARTS, GOODS, ROAM_PLACES, clamp } from "./catalog.ts";
import type { GoodId, LivingWorld, LocalAct, PlaceId, RoamState, SiteState } from "./state.ts";

export const HERITAGES: Record<
  Origin,
  { name: string; action: string; cost: string; line: string }
> = {
  dao: {
    name: "灵族 · 道胎",
    action: "循灵脉接续",
    cost: "耗 4 灵气 · 一日",
    line: "你不碰断石，只把两股走散的灵气轻轻接在一起。山脉先认出了你的呼吸。",
  },
  wu: {
    name: "巫族 · 巫骨",
    action: "负石定山根",
    cost: "耗 8 道躯 · 一日",
    line: "你用肩背抵住断处。石头终于停下时，骨头还记着它的重量。",
  },
  yao: {
    name: "妖族 · 妖形",
    action: "循兽径引活水",
    cost: "寻路两日",
    line: "你沿小兽留下的湿痕绕过断口。旧道没有变直，水却重新找到了下游。",
  },
  ren: {
    name: "人族 · 人愿",
    action: "结草绳联众手",
    cost: "耗 2 灵草 · 一日",
    line: "你把草搓成绳，再把散开的手联在一起。没有谁独自举起山，山却被托住了。",
  },
};

type SiteKind = "source" | "ruin" | "haven";
export type LocalSite = { id: string; place: PlaceId; kind: SiteKind; name: string; line: string };
const LANDMARKS: Record<PlaceId, [string, string, string, string, string, string]> = {
  chaos: [
    "凝露隙",
    "清浊交界处，一滴水迟迟不肯落。",
    "裂隙石环",
    "石环断了半边，散气总从缺口漏走。",
    "无声坳",
    "这里的回声比声音先坐下来。",
  ],
  earth: [
    "青芽滩",
    "退水后的泥里，青芽正托起细碎的露。",
    "断流石堰",
    "旧水路被崩石截住，下游的草一半青、一半枯。",
    "背风火台",
    "石台上留着灰，来往的人仍愿意添一根柴。",
  ],
  kunlun: [
    "玉露阶",
    "松针接住了高处的露，石阶因此常年湿润。",
    "松下残阵",
    "阵脚倾斜，山风将守山的细线吹得很乱。",
    "听雪亭",
    "亭中没有坐席，积雪替每位过客留下一块空白。",
  ],
  buzhou: [
    "玄矿壁",
    "矿纹露在岩外，像山骨未合的伤口。",
    "倾山石础",
    "石础正一点点滑落，路从它下面经过。",
    "负山营",
    "巫人歇肩处，一圈大石还带着余温。",
  ],
  east: [
    "退潮盐滩",
    "盐花嵌在贝壳之间，海鸟只踩干燥的那一侧。",
    "潮门旧柱",
    "旧柱倒向海中，潮流每日换一条危险的路。",
    "扶桑渡",
    "渡口有一盏避风的灯，树影在灯外摇。",
  ],
  bloodsea: [
    "赤晶浅湾",
    "赤晶结在浅湾，深处的涌动从不肯停。",
    "止潮骨堤",
    "骨堤散了，红潮漫进原本可以歇脚的地方。",
    "无浪礁",
    "礁顶恰好够一人落脚，风里有被盐封住的话。",
  ],
  wahuan: [
    "温泥池",
    "温泥托着细小的气泡，尚未学会成为形体。",
    "五色炉脚",
    "炉脚裂开，火候从缝里一点点逃散。",
    "捏泥棚",
    "半成形的泥偶排在檐下，等一阵不会伤它们的风。",
  ],
  youming: [
    "沉光矿脉",
    "黑石里有微光，取走太多，路便看不见了。",
    "无桥石岸",
    "两边都有人影，河却还没有记住渡法。",
    "听魂湾",
    "水不流动时，远处的声音反而听得清。",
  ],
  tribes: [
    "余烬草圃",
    "草茎包着未灭的火种，采时需要留下一截根。",
    "避雨火棚",
    "棚顶漏雨，守火的人已经几夜不敢睡熟。",
    "共食火塘",
    "每个来人都能靠火坐下，锅沿仍有一处缺口。",
  ],
  penglai: [
    "海雾露林",
    "雾在叶背凝住，老灵只取天亮前的一滴。",
    "浮岛锚石",
    "锚石松开，岛沿的小路随潮水轻轻漂移。",
    "望潮庐",
    "竹门半掩，门里的人把争执都留在了海上。",
  ],
  zixiao: [
    "阶前紫露",
    "露水悬在阶前，不往上，也不往下。",
    "问道残阶",
    "少了一级的台阶，让每个问道者都多停一息。",
    "宫外松阴",
    "松阴容得下等待，却容不下催促。",
  ],
  edge: [
    "界风凝露",
    "风擦过边界，留下不知来自哪一边的露。",
    "门框裂石",
    "门框仍在，裂纹却让屋外的风吹进了洪荒。",
    "归息岩",
    "有人曾在这里把名字放下，只带走呼吸。",
  ],
  board: [
    "台下薪田",
    "薪田挨着高台，每一茎草都像尚未落笔的一画。",
    "空榜台基",
    "台基有裂口，风从尚未写下的名字间穿过。",
    "候名长廊",
    "长廊不问来处，只留下脚步停过的灰。",
  ],
};
export const LOCAL_SITES: LocalSite[] = Object.entries(LANDMARKS).flatMap(([place, row]) =>
  (["source", "ruin", "haven"] as const).map((kind, i) => ({
    id: `${place}-${kind}`,
    place: place as PlaceId,
    kind,
    name: row[i * 2]!,
    line: row[i * 2 + 1]!,
  })),
);
export const sitesAt = (place: PlaceId) => LOCAL_SITES.filter((site) => site.place === place);
/** Suggest existing roads only; every step still goes through normal travel rules. */
export function routeTo(world: RoamState, destination: PlaceId): PlaceId[] {
  if (world.place === destination) return [];
  if (world.known.includes(destination)) return [destination];
  const queue: PlaceId[][] = [[world.place]],
    visited = new Set<PlaceId>([world.place]);
  while (queue.length) {
    const path = queue.shift()!;
    for (const next of ROAM_PLACES[path.at(-1)!].neighbors) {
      if (visited.has(next)) continue;
      const route = [...path, next];
      if (next === destination) return route.slice(1);
      visited.add(next);
      queue.push(route);
    }
  }
  return [];
}
export const siteState = (world: RoamState, id: string): SiteState =>
  world.living.sites[id] ?? { visited: false, state: "wild", ready: 0, cooldown: 0, method: "" };

export const PEOPLE: {
  id: string;
  name: string;
  origin: Origin;
  route: PlaceId[];
  good: GoodId;
  art: string;
  goal: string;
  greeting: string;
}[] = [
  {
    id: "qingxing",
    name: "青荇",
    origin: "dao",
    route: ["earth", "kunlun", "wahuan"],
    good: "herb",
    art: "qingjing",
    goal: "寻找受损的灵脉，替沿途伤者采药",
    greeting: "「药要送到需要它的人手里，才算从山上采下来。」",
  },
  {
    id: "wuwei",
    name: "雾尾",
    origin: "yao",
    route: ["east", "earth", "tribes"],
    good: "salt",
    art: "form",
    goal: "循潮换物，替断了往来的聚落带路",
    greeting: "「我卖的是盐，也卖一条还走得通的路。后一样常常不收钱。」",
  },
  {
    id: "pansheng",
    name: "磐生",
    origin: "wu",
    route: ["buzhou", "earth", "wahuan"],
    good: "ore",
    art: "bone",
    goal: "沿山补堤，先往崩裂更重的地方去",
    greeting: "「缺的不是好石头，是肯把它送到缺口的人。」",
  },
  {
    id: "axin",
    name: "阿薪",
    origin: "ren",
    route: ["tribes", "wahuan", "earth"],
    good: "seed",
    art: "hearth",
    goal: "走访火塘，把一处的余火带给另一处",
    greeting: "「一路走过来，我总问一声：昨夜有没有人冷着？」",
  },
];
const finite = (value: unknown, fallback = 0, max = 1_000_000) =>
  typeof value === "number" && Number.isFinite(value) ? clamp(Math.floor(value), 0, max) : fallback;
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

export function createLiving(day = 1): LivingWorld {
  return {
    lastDay: day,
    sites: {},
    errands: {},
    news: [],
    regions: Object.fromEntries(
      Object.keys(ROAM_PLACES).map((id) => [id, { strain: 0, prosperity: 0 }]),
    ),
    people: Object.fromEntries(
      PEOPLE.map((p) => [p.id, { place: p.route[0]!, nextMove: day + 6, journey: 0, met: false }]),
    ),
  };
}
export function normalizeLiving(raw: unknown, day: number): LivingWorld {
  const data = record(raw),
    next = createLiving(day);
  next.lastDay = Math.min(day, finite(data.lastDay, day));
  for (const site of LOCAL_SITES) {
    const value = record(record(data.sites)[site.id]);
    if (!Object.keys(value).length) continue;
    next.sites[site.id] = {
      visited: value.visited === true,
      state: ["wild", "mending", "restored", "stripped"].includes(String(value.state))
        ? (value.state as SiteState["state"])
        : "wild",
      ready: finite(value.ready),
      cooldown: finite(value.cooldown),
      method: typeof value.method === "string" ? value.method.slice(0, 40) : "",
    };
  }
  for (const place of Object.keys(ROAM_PLACES)) {
    const region = record(record(data.regions)[place]);
    next.regions[place] = {
      strain: finite(region.strain, 0, 4),
      prosperity: finite(region.prosperity, 0, 3),
    };
  }
  for (const person of PEOPLE) {
    const value = record(record(data.people)[person.id]);
    next.people[person.id] = {
      place: person.route.includes(value.place as PlaceId)
        ? (value.place as PlaceId)
        : person.route[0]!,
      nextMove: finite(value.nextMove, day + 6),
      journey: finite(value.journey),
      met: value.met === true,
    };
    const errand = record(record(data.errands)[person.id]);
    if (
      ["carrying", "delivered", "done"].includes(String(errand.stage)) &&
      person.route.includes(errand.destination as PlaceId)
    )
      next.errands[person.id] = {
        stage: errand.stage as "carrying" | "delivered" | "done",
        destination: errand.destination as PlaceId,
        completed: finite(errand.completed),
        count: finite(errand.count, 0, 1000),
      };
  }
  if (Array.isArray(data.news))
    next.news = data.news
      .flatMap((entry) => {
        const v = record(entry);
        return typeof v.text === "string" && Object.hasOwn(ROAM_PLACES, String(v.place))
          ? [{ day: finite(v.day, day), place: v.place as PlaceId, text: v.text.slice(0, 180) }]
          : [];
      })
      .slice(-16);
  return next;
}
function news(world: RoamState, day: number, place: PlaceId, text: string) {
  world.living.news.push({ day, place, text });
  world.living.news = world.living.news.slice(-16);
}
/** Advance only game days, never wall-clock idle ticks; no rewards or forced scenes. */
export function advanceLiving(world: RoamState) {
  const living = world.living;
  if (world.day <= living.lastDay) return;
  // A claim can advance up to eight game days. Resolve events by their due date,
  // so a later repair cannot influence an inhabitant's earlier departure.
  for (;;) {
    const pendingSites = LOCAL_SITES.filter((site) => living.sites[site.id]?.state === "mending");
    const due = Math.min(
      ...pendingSites.map((site) => living.sites[site.id]!.ready),
      ...PEOPLE.map((person) => living.people[person.id]!.nextMove),
      world.politics.nextDay,
    );
    if (due > world.day) break;
    for (const site of pendingSites) {
      const state = living.sites[site.id]!;
      if (state.ready !== due) continue;
      state.state = "restored";
      const region = living.regions[site.place]!;
      region.prosperity = Math.min(3, region.prosperity + 1);
      region.strain = Math.max(0, region.strain - 2);
      news(
        world,
        due,
        site.place,
        `${site.name}重新通了气。你留下的修补经住了几日风雨，当地物产与歇息处也渐渐恢复。`,
      );
      const key = `restored-${site.id}`;
      if (!world.karma.includes(key)) world.karma.push(key);
    }
    advancePoliticsAt(world, due);
    for (const person of PEOPLE) {
      const actor = living.people[person.id]!;
      if (actor.nextMove !== due) continue;
      actor.journey += 1;
      const needy = person.route.filter(
        (id) => id !== actor.place && living.regions[id]!.strain >= 3,
      );
      actor.place = needy[0] ?? person.route[actor.journey % person.route.length]!;
      actor.nextMove += 6;
      if (actor.met)
        news(
          world,
          due,
          actor.place,
          `${person.name}沿旧路到了${ROAM_PLACES[actor.place].name}。${person.goal}。`,
        );
    }
  }
  living.lastDay = world.day;
}
export function regionCondition(world: RoamState, place = world.place) {
  const region = world.living.regions[place]!;
  return region.strain >= 3 ? "地脉疲敝" : region.prosperity > 0 ? "生息渐复" : "山水如常";
}
export type LocalOption = {
  label: string;
  hint: string;
  act: LocalAct;
  disabled?: boolean;
  reason?: string;
};
export function localOptions(save: SaveData): LocalOption[] {
  const world = save.world;
  if (!world || world.phase !== "free" || world.retreat) return [];
  const options: LocalOption[] = [];
  for (const site of sitesAt(world.place)) {
    const state = siteState(world, site.id);
    if (!state.visited) {
      options.push({
        label: `走近${site.name}`,
        hint: "察看 · 不耗时",
        act: { type: "local", what: "survey", site: site.id },
      });
      continue;
    }
    if (site.kind === "source") {
      const tired = state.cooldown > world.day;
      options.push({
        label: `采撷${site.name}`,
        hint: tired ? `第 ${state.cooldown} 日再来` : "留根采撷 · 一日",
        act: { type: "local", what: "gather", site: site.id },
        disabled: tired,
      });
    } else if (
      site.kind === "ruin" &&
      (state.state === "wild" || state.state === "stripped") &&
      state.cooldown <= world.day
    ) {
      options.push({
        label: "以玄矿修补",
        hint: "耗 2 玄矿 · 一日",
        act: { type: "local", what: "restore", site: site.id },
        disabled: (world.bag.ore ?? 0) < 2,
        reason: "玄矿不足",
      });
      if (save.origin) {
        const heritage = HERITAGES[save.origin];
        const enough =
          save.origin === "dao"
            ? world.lingqi >= 4
            : save.origin === "wu"
              ? save.stats.life > 8
              : save.origin === "ren"
                ? (world.bag.herb ?? 0) >= 2
                : true;
        options.push({
          label: heritage.action,
          hint: heritage.cost,
          act: { type: "local", what: "heritage", site: site.id },
          disabled: !enough,
          reason: "根骨所需消耗不足",
        });
      }
      options.push({
        label: "拆取残存灵材",
        hint: "此地恐难自复 · 一日",
        act: { type: "local", what: "strip", site: site.id },
      });
    } else if (site.kind === "haven") {
      options.push({
        label: `在${site.name}歇息`,
        hint: "一日 · 按此地生息恢复",
        act: { type: "local", what: "rest", site: site.id },
      });
      options.push({
        label: "添药护养此地",
        hint: "耗 2 灵草 · 一日",
        act: { type: "local", what: "tend", site: site.id },
        disabled: (world.bag.herb ?? 0) < 2 || world.living.regions[world.place]!.strain === 0,
        reason: "需灵草，且此地尚有疲敝",
      });
    }
  }
  for (const person of PEOPLE) {
    const actor = world.living.people[person.id]!;
    const errand = world.living.errands[person.id];
    if (actor.place === world.place) {
      options.push({
        label: `与${person.name}交谈`,
        hint: "不耗时",
        act: { type: "person", what: "talk", id: person.id },
      });
      if (!errand || (errand.stage === "done" && world.day >= errand.completed + 4))
        options.push({
          label: `接下${person.name}的托付`,
          hint: `送物时需 2 ${GOODS[person.good]}`,
          act: { type: "person", what: "accept", id: person.id },
        });
      if (errand?.stage === "delivered")
        options.push({
          label: `向${person.name}复命`,
          hint: "当面交还回信",
          act: { type: "person", what: "finish", id: person.id },
        });
    }
    if (errand?.stage === "carrying" && errand.destination === world.place)
      options.push({
        label: `送达${person.name}所托`,
        hint: `耗 2 ${GOODS[person.good]} · 一日`,
        act: { type: "person", what: "deliver", id: person.id },
        disabled: (world.bag[person.good] ?? 0) < 2,
        reason: "行囊中的所需物资不足",
      });
  }
  return options;
}
export function sameLocalAct(a: LocalAct, b: LocalAct) {
  return (
    a.type === b.type &&
    a.what === b.what &&
    (a.type === "local" && b.type === "local"
      ? a.site === b.site
      : a.type === "person" && b.type === "person" && a.id === b.id)
  );
}
/** Validated by the engine against localOptions. Returns game days consumed. */
export function performLocal(save: SaveData, action: LocalAct): number {
  const world = save.world!,
    living = world.living;
  const changes: string[] = [];
  const changeGood = (id: GoodId, amount: number) => {
    const next = (world.bag[id] ?? 0) + amount;
    if (next > 0) world.bag[id] = next;
    else delete world.bag[id];
    changes.push(`${GOODS[id]} ${amount > 0 ? "+" : ""}${amount}`);
  };
  const report = (title: string, paragraphs: string[]) => {
    world.report = { title, paragraphs, changes };
  };
  if (action.type === "person") {
    const person = PEOPLE.find((p) => p.id === action.id)!;
    const actor = living.people[person.id]!;
    actor.met = true;
    const errand = living.errands[person.id];
    if (action.what === "talk") {
      const friendly = (world.relations[person.id] ?? 0) >= 4;
      report(person.name, [
        person.greeting,
        friendly
          ? "对方认出了你，先问你近来走的路是否平安。往日托付没有随日子散去。"
          : person.goal + "。",
        `还会在${ROAM_PLACES[actor.place].name}停留到第 ${actor.nextMove} 日。`,
      ]);
      return 0;
    }
    if (action.what === "accept") {
      const destinations = person.route.filter((place) => place !== actor.place);
      const destination = destinations[(errand?.count ?? 0) % destinations.length]!;
      living.errands[person.id] = {
        stage: "carrying",
        destination,
        completed: 0,
        count: errand?.count ?? 0,
      };
      report(`${person.name}的托付`, [
        person.greeting,
        `请将两份${GOODS[person.good]}送到${ROAM_PLACES[destination].name}的歇脚处。物资由你筹集，送达后再来找我；不限定归期，若我已启程，可循行踪寻我。`,
      ]);
      return 0;
    }
    if (action.what === "deliver") {
      changeGood(person.good, -2);
      errand!.stage = "delivered";
      const region = living.regions[world.place]!;
      region.strain = Math.max(0, region.strain - 1);
      region.prosperity = Math.min(3, region.prosperity + 1);
      changes.push(`${ROAM_PLACES[world.place].name}的生息有所恢复`);
      report("物资送到了", [
        `歇脚处的人数过物资，把一封带着烟火味的回信交给你。请带回给${person.name}。`,
        "这一程没有替谁赢得天地，只让下一位过路的人多了一处可以停留的地方。",
      ]);
      news(
        world,
        world.day + 1,
        world.place,
        `${person.name}托付的物资已送达，当地的歇脚处重新有了照应。`,
      );
      return 1;
    }
    errand!.stage = "done";
    errand!.completed = world.day;
    errand!.count += 1;
    world.stones += 5;
    world.relations[person.id] = clamp((world.relations[person.id] ?? 0) + 4, -100, 100);
    const key = `trusted-${person.id}`;
    if (!world.karma.includes(key)) world.karma.push(key);
    changes.push("灵石 +5", `${person.name}更加信任你`);
    if (errand!.count >= 2 && !world.arts.includes(person.art)) {
      world.arts.push(person.art);
      if (ARTS[person.art]?.spell && !world.spells.includes(person.art))
        world.spells.push(person.art);
      changes.push(`悟得${ARTS[person.art]!.name}`);
    }
    report("回信落了地", [
      `${person.name}将回信读了两遍，才把预备的盘缠交给你。`,
      errand!.count >= 2
        ? "「你已经走过不止一回。我记着。」对方把自己走路、守气的法子也说给你听。"
        : "「下回再相逢，先坐下来喝一口水。」",
    ]);
    return 0;
  }
  const site = LOCAL_SITES.find((s) => s.id === action.site)!;
  const state = (living.sites[site.id] ??= { ...siteState(world, site.id) });
  const region = living.regions[site.place]!;
  if (action.what === "survey") {
    state.visited = true;
    report(site.name, [
      site.line,
      site.kind === "ruin"
        ? "你看清了断处。可以备料修补，也可以顺着自己的根骨另想办法；拆取残材虽快，却会损伤此地生息。"
        : site.kind === "source"
          ? "此地会重新长出物产，也需要休养。接连索取，终有疲敝的时候。"
          : "你记住了这处歇脚地。山水安稳时，在这里歇息也更容易。",
    ]);
    return 0;
  }
  if (action.what === "gather") {
    const amount = region.strain >= 3 ? 1 : 2 + Math.min(1, region.prosperity);
    changeGood(ROAM_PLACES[site.place].good, amount);
    state.cooldown = world.day + 4;
    region.strain = Math.min(4, region.strain + 1);
    report(site.name, [
      region.strain >= 3
        ? "你只取到少许。叶下已经露出干土，这片山水需要有人归还一点照应。"
        : "你顺着纹理取下灵材，留下还能够生长的根。过几日再来，山水才有余力回应。",
    ]);
    return 1;
  }
  if (action.what === "strip") {
    state.state = "stripped";
    state.cooldown = world.day + 6;
    region.strain = Math.min(4, region.strain + 2);
    region.prosperity = Math.max(0, region.prosperity - 1);
    changeGood(ROAM_PLACES[site.place].good, 4);
    if (!world.karma.includes(`stripped-${site.id}`)) world.karma.push(`stripped-${site.id}`);
    report(site.name, [
      "残材进了行囊，原本尚能连在一起的地脉却断开了。这里要缓上几日，才能再动手补救。",
    ]);
    news(world, world.day + 1, site.place, `${site.name}的残材被取走，附近的生息愈发艰难。`);
    return 1;
  }
  if (action.what === "restore" || action.what === "heritage") {
    let days = 1,
      line = "你用玄矿补齐支点，一寸一寸把残缺的地方撑住。";
    if (action.what === "restore") changeGood("ore", -2);
    else {
      const origin = save.origin!;
      line = HERITAGES[origin].line;
      if (origin === "dao") {
        world.lingqi -= 4;
        changes.push("灵气 -4");
      }
      if (origin === "wu") {
        save.stats.life -= 8;
        changes.push("道躯 -8");
      }
      if (origin === "ren") changeGood("herb", -2);
      if (origin === "yao") days = 2;
    }
    state.state = "mending";
    state.ready = world.day + days + 3;
    state.method = action.what === "restore" ? "玄矿修补" : HERITAGES[save.origin!].action;
    report(site.name, [line, "修补还需要经受风雨。几日后重访，才知道这番照应有没有真正落进山水。"]);
    changes.push("已留下修补，尚待时日");
    return days;
  }
  if (action.what === "tend") {
    changeGood("herb", -2);
    region.strain = Math.max(0, region.strain - 2);
    report(site.name, ["你将药草分给过客，也留下一份温养伤处。来去的人慢下来，这片地也得以喘息。"]);
    changes.push("当地疲敝减轻");
    return 1;
  }
  const healed = Math.min(
    100 - save.stats.life,
    region.strain >= 3 ? 4 : 8 + region.prosperity * 2,
  );
  save.stats.life += healed;
  const qi = Math.min(80 - world.lingqi, 3 + region.prosperity);
  world.lingqi += qi;
  world.wound = Math.max(0, world.wound - 1);
  changes.push(`道躯 +${healed}`, `灵气 +${qi}`, "伤势减轻");
  report(site.name, [
    region.strain >= 3
      ? "地脉不稳，睡得也浅。你歇过一阵，仍能听见远处的断裂声。"
      : "风被挡在外面。这里有人照应山水，山水也给过路的人留下一口安稳的气。",
  ]);
  return 1;
}
