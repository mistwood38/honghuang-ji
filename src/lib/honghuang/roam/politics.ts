import type { SaveData } from "../types.ts";
import { REALMS } from "../world.ts";
import { GOODS, ROAM_PLACES, SECTS, clamp, eraOf } from "./catalog.ts";
import type {
  BattleState,
  Effect,
  FactionId,
  GoodId,
  PlaceId,
  PoliticsState,
  RoamState,
  WorldAct,
} from "./state.ts";

export const FACTIONS: {
  id: FactionId;
  name: string;
  home: PlaceId;
  good: GoodId;
  goal: string;
  omen: string;
}[] = [
  {
    id: "chan",
    name: "玉虚",
    home: "kunlun",
    good: "dew",
    goal: "护住昆仑秩序，收束散乱道统",
    omen: "山门会先护持自身道场，再向断裂的地脉伸手。",
  },
  {
    id: "jie",
    name: "截教",
    home: "bloodsea",
    good: "salt",
    goal: "为异类留席，争取行路与传法的自由",
    omen: "座次越紧，门下越要为被赶下席的人争一条路。",
  },
  {
    id: "wu",
    name: "巫族",
    home: "buzhou",
    good: "ore",
    goal: "守住山骨，抵御外来的号令",
    omen: "不周的裂响会把他们从营中唤起，也会耗掉粮与力。",
  },
  {
    id: "yao",
    name: "妖庭",
    home: "east",
    good: "salt",
    goal: "联结群妖，维持东海与扶桑的声望",
    omen: "朝命需要道路与供给。路断得久，名册便只剩纸上的声威。",
  },
  {
    id: "hearth",
    name: "火塘",
    home: "tribes",
    good: "herb",
    goal: "保全聚落，让来年仍有人守火",
    omen: "火塘不争高座，却会收留从争斗里退下来的人。",
  },
];
export const CONFLICTS: {
  id: string;
  a: FactionId;
  b: FactionId;
  place: PlaceId;
  name: string;
  from: number;
}[] = [
  { id: "wu-yao", a: "wu", b: "yao", place: "buzhou", name: "山骨与天光", from: 28 },
  { id: "chan-jie", a: "chan", b: "jie", place: "earth", name: "门墙与众生", from: 108 },
];
export const relationKey = (a: FactionId, b: FactionId) => [a, b].sort().join(":");
const ids = FACTIONS.map((f) => f.id);
const object = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
const num = (value: unknown, fallback: number, min: number, max: number) =>
  typeof value === "number" && Number.isFinite(value)
    ? clamp(Math.floor(value), min, max)
    : fallback;
export function createPolitics(day = 1): PoliticsState {
  return {
    nextDay: day + 8,
    cycle: 0,
    factions: Object.fromEntries(
      ids.map((id) => [
        id,
        { power: id === "hearth" ? 24 : 36, supply: 5, lastAid: -9, lastPatrol: -9, lastTalk: -9 },
      ]),
    ) as PoliticsState["factions"],
    relations: { "wu:yao": -1, "chan:jie": -1 },
    truces: {},
    control: {},
    history: [],
  };
}
export function normalizePolitics(raw: unknown, day: number): PoliticsState {
  const source = object(raw),
    next = createPolitics(day);
  next.nextDay = num(source.nextDay, day + 8, day + 1, 1_000_008);
  next.cycle = num(source.cycle, 0, 0, 125000);
  for (const id of ids) {
    const value = object(object(source.factions)[id]);
    next.factions[id] = {
      power: num(value.power, next.factions[id].power, 5, 100),
      supply: num(value.supply, 5, 0, 12),
      lastAid: num(value.lastAid, -9, -9, day),
      lastPatrol: num(value.lastPatrol, -9, -9, day),
      lastTalk: num(value.lastTalk, -9, -9, day),
    };
  }
  for (const conflict of CONFLICTS) {
    const key = relationKey(conflict.a, conflict.b);
    next.relations[key] = num(object(source.relations)[key], -1, -10, 10);
    const truce = num(object(source.truces)[key], 0, 0, 1_000_064);
    if (truce) next.truces[key] = truce;
  }
  for (const [place, id] of Object.entries(object(source.control)))
    if (Object.hasOwn(ROAM_PLACES, place) && ids.includes(id as FactionId))
      next.control[place as PlaceId] = id as FactionId;
  if (Array.isArray(source.history))
    next.history = source.history
      .flatMap((row) => {
        const value = object(row);
        return typeof value.text === "string"
          ? [{ day: num(value.day, day, 1, day), text: value.text.slice(0, 240) }]
          : [];
      })
      .slice(-24);
  return next;
}
function record(world: RoamState, day: number, text: string) {
  world.politics.history.push({ day, text });
  world.politics.history = world.politics.history.slice(-24);
}
export function adjustFaction(world: RoamState, id: FactionId, power: number, supply: number) {
  const state = world.politics.factions[id];
  state.power = clamp(state.power + power, 5, 100);
  state.supply = clamp(state.supply + supply, 0, 12);
}
export function establishTruce(world: RoamState, a: FactionId, b: FactionId, days: number) {
  const key = relationKey(a, b);
  world.politics.relations[key] = clamp((world.politics.relations[key] ?? 0) + 4, -10, 10);
  world.politics.truces[key] = Math.max(world.politics.truces[key] ?? 0, world.day + days);
}
/** Called by the shared game-day scheduler, after repairs and before inhabitants move. */
export function advancePoliticsAt(world: RoamState, day: number) {
  if (world.politics.nextDay !== day) return;
  const politics = world.politics;
  politics.cycle += 1;
  for (const faction of FACTIONS) {
    const state = politics.factions[faction.id],
      region = world.living.regions[faction.home]!;
    if (region.strain >= 3 && state.supply >= 2) {
      state.supply -= 2;
      region.strain -= 1;
      state.power = Math.min(100, state.power + 1);
      record(
        world,
        day,
        `${faction.name}从存粮中拨出物资，修护${ROAM_PLACES[faction.home].name}。当地疲敝稍缓，门下补给也薄了。`,
      );
    } else if (state.supply < 4) {
      state.supply += 2;
      state.power = Math.max(5, state.power - 1);
      record(world, day, `${faction.name}收束行伍补给，暂缓外争。声威退去一点，仓中渐有余粮。`);
    } else {
      state.supply = Math.min(12, state.supply + 1 + (region.prosperity > 0 ? 1 : 0));
      state.power = Math.min(100, state.power + 1);
    }
  }
  const age = day + world.eraSkew;
  for (const conflict of CONFLICTS) {
    const key = relationKey(conflict.a, conflict.b);
    if (age < conflict.from) continue;
    if ((politics.truces[key] ?? 0) >= day) {
      record(
        world,
        day,
        `${conflict.name}仍守着停战之约。往日送到的言语，今日替路人挡了一场争斗。`,
      );
      continue;
    }
    politics.relations[key] = Math.max(-10, (politics.relations[key] ?? 0) - 1);
    const a = politics.factions[conflict.a],
      b = politics.factions[conflict.b];
    if (politics.relations[key]! > -3 || a.supply < 3 || b.supply < 3) continue;
    a.supply -= 3;
    b.supply -= 3;
    const winner =
      a.power === b.power
        ? politics.cycle % 2
          ? conflict.a
          : conflict.b
        : a.power > b.power
          ? conflict.a
          : conflict.b;
    const loser = winner === conflict.a ? conflict.b : conflict.a;
    adjustFaction(world, winner, 2, 0);
    adjustFaction(world, loser, -3, 0);
    politics.control[conflict.place] = winner;
    const region = world.living.regions[conflict.place]!;
    region.strain = Math.min(4, region.strain + 1);
    region.prosperity = Math.max(0, region.prosperity - 1);
    record(
      world,
      day,
      `${conflict.name}再起争执。${FACTIONS.find((f) => f.id === winner)!.name}占住了${ROAM_PLACES[conflict.place].name}的护路主导，双方补给俱损，当地生息受扰。`,
    );
  }
  if (!politics.history.some((line) => line.day === day))
    record(
      world,
      day,
      `${eraOf(age).name}之中，各方暂收锋芒，整备道场与补给。山河还留着行路的余地。`,
    );
  politics.nextDay += 8;
}
export type AffairsOption = {
  act: Extract<WorldAct, { type: "affairs" }>;
  label: string;
  hint: string;
  disabled: boolean;
  reason?: string;
};
export function affairsOptions(save: SaveData): AffairsOption[] {
  const world = save.world;
  if (!world || world.phase !== "free" || world.retreat) return [];
  return FACTIONS.flatMap((faction) => {
    if (world.place !== faction.home) return [];
    const state = world.politics.factions[faction.id];
    const options: AffairsOption[] = [
      {
        act: { type: "affairs", faction: faction.id, what: "aid" },
        label: `支援${faction.name}护路`,
        hint: `耗 3 ${GOODS[faction.good]} · 一日`,
        disabled: (world.bag[faction.good] ?? 0) < 3 || world.day < state.lastAid + 3,
        reason: world.day < state.lastAid + 3 ? `第 ${state.lastAid + 3} 日后再来` : "物资不足",
      },
      {
        act: { type: "affairs", faction: faction.id, what: "patrol" },
        label: `为${faction.name}巡护`,
        hint: "进入真实斗法 · 胜后结算",
        disabled: world.day < state.lastPatrol + 3 || save.stats.life < 20,
        reason:
          world.day < state.lastPatrol + 3
            ? `第 ${state.lastPatrol + 3} 日后再来`
            : "道躯至少 20 才宜出行",
      },
    ];
    if (CONFLICTS.some((c) => c.a === faction.id || c.b === faction.id))
      options.push({
        act: { type: "affairs", faction: faction.id, what: "mediate" },
        label: `替${faction.name}递停战书`,
        hint: "耗 4 清露 · 一日 · 散修也可调停",
        disabled: (world.bag.dew ?? 0) < 4 || world.day < state.lastTalk + 8,
        reason: world.day < state.lastTalk + 8 ? `第 ${state.lastTalk + 8} 日后再议` : "清露不足",
      });
    return options;
  });
}
export function trialBattle(
  save: SaveData,
  id: string,
  name: string,
  win: Effect[],
  winText: string[],
): BattleState {
  const realm = Math.max(0, REALMS.filter((r) => save.stats.dao >= r.min).length - 1);
  return {
    id,
    name,
    hp: 26 + realm * 7,
    max: 26 + realm * 7,
    atk: 7 + realm * 2,
    def: 1 + Math.floor(realm / 3),
    guard: 0,
    round: 1,
    log: [`${name}拦在前方。你仍可以脱身，养足气力再来。`],
    win,
    lose: [{ t: "wound", n: 1 }],
    winText,
    loseText: ["你暂退了一步。此事没有被判成失败的一生，养好伤，仍能再来。"],
  };
}
export function performAffairs(
  save: SaveData,
  action: Extract<WorldAct, { type: "affairs" }>,
  apply: (effects: Effect[]) => string[],
): number {
  const world = save.world!,
    faction = FACTIONS.find((f) => f.id === action.faction)!;
  const state = world.politics.factions[faction.id];
  if (action.what === "patrol") {
    state.lastPatrol = world.day;
    world.phase = "battle";
    world.eventId = null;
    const effects: Effect[] = [
      { t: "rep", id: faction.id, n: 4 },
      { t: "stone", n: 3 },
      { t: "faction", id: faction.id, power: 3, supply: 1 },
    ];
    if (world.sect === faction.id) effects.push({ t: "contrib", n: 2 });
    world.battle = trialBattle(
      save,
      `patrol-${faction.id}-${world.day}`,
      `${ROAM_PLACES[faction.home].name}劫路凶灵`,
      effects,
      ["路口安静下来，来往的人终于肯往前走。你交回护路的凭据，对方才把盘缠递给你。"],
    );
    world.report = {
      title: `${faction.name}巡护`,
      paragraphs: ["巡护的名册没有替你击退任何东西。眼前这一场，仍须自己出手。"],
      changes: [],
    };
    return 1;
  }
  if (action.what === "aid") {
    state.lastAid = world.day;
    const changes = apply([
      { t: "good", id: faction.good, n: -3 },
      { t: "rep", id: faction.id, n: 3 },
      { t: "faction", id: faction.id, power: 2, supply: 4 },
      ...(world.sect === faction.id ? [{ t: "contrib" as const, n: 2 }] : []),
    ]);
    world.living.regions[faction.home]!.strain = Math.max(
      0,
      world.living.regions[faction.home]!.strain - 1,
    );
    world.report = {
      title: "物资入了护路仓",
      paragraphs: [
        `${faction.name}的人记下了你的名字。东西没有化成一句赞许，而是分到了沿途真正需要它的地方。`,
      ],
      changes,
    };
    return 1;
  }
  state.lastTalk = world.day;
  const conflict = CONFLICTS.find((c) => c.a === faction.id || c.b === faction.id)!;
  const changes = apply([
    { t: "good", id: "dew", n: -4 },
    { t: "rep", id: faction.id, n: 2 },
  ]);
  establishTruce(world, conflict.a, conflict.b, 16);
  world.report = {
    title: "停战书被接下",
    paragraphs: [
      "清露洗去纸上的燥意，双方终于肯先读完对方的话。仇怨未必消失，但这十六日，护路的人答应先把手放下。",
    ],
    changes: [...changes, "两方停战十六个游戏日"],
  };
  record(world, world.day, `你为${conflict.name}递书，双方立下十六日停战约。`);
  return 1;
}
export function factionName(id: FactionId) {
  return SECTS.find((s) => s.id === id)?.name ?? id;
}
