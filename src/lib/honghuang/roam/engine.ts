import type { Origin, SaveData, StatKey } from "../types.ts";
import { cleanName } from "../engine.ts";
import { activeRelic, normalizeRelic, relicGuard, RELIC_USES } from "./relics.ts";
import { INSIGHT_NAMES, INSIGHT_STEPS, insightLevel, insightRequirement, normalizeInsights, techniqueFor } from "./insight.ts";
import { REALMS, ITEMS } from "../world.ts";
import {
  ARTS,
  BEASTS,
  CULTIVATE_LINES,
  ENEMIES,
  ERAS,
  GOODS,
  MARKETS,
  QUIET,
  RECIPES,
  ROAM_PLACES,
  SECTS,
  TASK_LINES,
  clamp,
  eraOf,
} from "./catalog.ts";
import { CHAINS, EVENTS, eventById } from "./events.ts";
import { adjustFaction, affairsOptions, createPolitics, normalizePolitics, performAffairs } from "./politics.ts";
import { lineageOptions, normalizeLineages, performLineage } from "./lineages.ts";
import { BATTLE_PLANS } from "./battle-plans.ts";
import { normalizePrepared, preparedTechniques, TECHNIQUES } from "./techniques.ts";
import { advanceLiving, createLiving, localOptions, normalizeLiving, performLocal, sameLocalAct } from "./local-world.ts";
import type {
  BattleState,
  Effect,
  EventChoice,
  GoodId,
  PlaceId,
  RoamAct,
  RoamEvent,
  RoamState,
} from "./state.ts";

const CAP: Record<StatKey, number> = {
  dao: 400,
  qi: 160,
  kill: 160,
  virtue: 160,
  demon: 100,
  life: 100,
};

const ERA_NOTICE: Record<string, string> = {
  cleave: "era-cleave",
  longhan: "era-longhan",
  witch: "era-witch",
  clay: "era-clay",
  board: "era-board",
};

const STAT_NAME: Record<StatKey, string> = {
  dao: "道行",
  qi: "气运",
  kill: "杀伐",
  virtue: "仁德",
  demon: "心魔",
  life: "道躯",
};

export function createRoam(): RoamState {
  return {
    phase: "origin",
    day: 1,
    place: "chaos",
    known: ["chaos", "earth", "edge"],
    xiuwei: 0,
    lingqi: 20,
    wuxing: 5,
    wound: 0,
    stones: 0,
    arts: [],
    equipped: null,
    relic: null,
    insights: {},
    prepared: [null, null],
    battlePlan: "balanced",
    living: createLiving(),
    politics: createPolitics(),
    lineages: {},
    spells: [],
    bag: {},
    relations: {},
    reputation: {},
    sect: null,
    sectRank: 0,
    contrib: 0,
    quests: {},
    karma: [],
    delayed: [],
    notices: [],
    seen: [],
    log: [],
    report: null,
    eventId: null,
    battle: null,
    cave: 0,
    beast: null,
    retreat: null,
    plot: null,
    idle: null,
    lastTick: 0,
    haul: null,
    farm: null,
    farmLog: [],
    spare: 0,
    layer: 1,
    gear: 0,
    riftLeft: 3,
    riftDay: 1,
    eraSkew: 0,
    eraSeen: ["chaos"],
  };
}

export function normalizeRoam(raw: unknown): RoamState | null {
  if (!raw || typeof raw !== "object") return null;
  const body = raw as Partial<RoamState>;
  if (typeof body.place !== "string" || !(body.place in ROAM_PLACES)) return null;
  if (body.phase !== "origin" && body.phase !== "free" && body.phase !== "event" && body.phase !== "battle") {
    return null;
  }
  const base = createRoam();
  const day = Number.isFinite(Number(body.day)) ? clamp(Math.floor(Number(body.day)), 1, 1_000_000) : 1;
  const learned = Array.isArray(body.arts) ? body.arts.filter((id) => typeof id === "string") : [];
  const main = body.equipped && learned.includes(body.equipped) && Object.hasOwn(ARTS, body.equipped)
    ? body.equipped : learned.find((id) => Object.hasOwn(ARTS, id)) ?? null;
  return {
    ...base,
    ...body,
    place: body.place,
    phase: body.phase,
    known: Array.isArray(body.known) ? body.known.filter((id): id is PlaceId => id in ROAM_PLACES) : base.known,
    bag: body.bag && typeof body.bag === "object" ? body.bag : {},
    arts: learned,
    equipped: main,
    relic: normalizeRelic(body.relic),
    insights: normalizeInsights(body.insights, learned),
    prepared: normalizePrepared(body.prepared, learned, main),
    battlePlan: body.battlePlan && Object.hasOwn(BATTLE_PLANS, body.battlePlan) ? body.battlePlan : "balanced",
    living: normalizeLiving(body.living, day),
    politics: normalizePolitics(body.politics, day),
    lineages: normalizeLineages(body.lineages),
    spells: Array.isArray(body.spells) ? body.spells.filter((id) => typeof id === "string") : [],
    karma: Array.isArray(body.karma) ? body.karma.filter((id) => typeof id === "string") : [],
    seen: Array.isArray(body.seen) ? body.seen.filter((id) => typeof id === "string") : [],
    notices: Array.isArray(body.notices) ? body.notices.filter((id) => typeof id === "string") : [],
    delayed: Array.isArray(body.delayed) ? body.delayed.filter((item) => item && typeof item.event === "string") : [],
    quests: body.quests && typeof body.quests === "object" ? body.quests : {},
    relations: body.relations && typeof body.relations === "object" ? body.relations : {},
    reputation: body.reputation && typeof body.reputation === "object" ? body.reputation : {},
    log: Array.isArray(body.log) ? body.log.slice(-40) : [],
    xiuwei: clamp(Number(body.xiuwei) || 0, 0, 100),
    lingqi: clamp(Number(body.lingqi) || 0, 0, 80),
    wound: clamp(Number(body.wound) || 0, 0, 6),
    day,
    retreat:
      body.retreat && typeof body.retreat.watch === "number"
        ? { watch: clamp(body.retreat.watch, 0, 3) }
        : null,
    plot: body.plot && typeof body.plot.ready === "number" ? { ready: Math.max(1, body.plot.ready) } : null,
    idle: body.idle?.kind === "sit" || body.idle?.kind === "wander" ? { kind: body.idle.kind } : null,
    lastTick: Number(body.lastTick) > 0 ? Number(body.lastTick) : 0,
    haul: sanitizeHaul(body.haul),
    farm: body.farm && body.farm in ROAM_PLACES ? body.farm : null,
    farmLog: Array.isArray(body.farmLog) ? body.farmLog.filter((line) => typeof line === "string").slice(-12) : [],
    spare: clamp(Number(body.spare) || 0, 0, 300),
    layer: clamp(Number(body.layer) || 1, 1, 9),
    gear: clamp(Number(body.gear) || 0, 0, 8),
    riftLeft: clamp(Number(body.riftLeft ?? 3), 0, 3),
    riftDay: Math.max(1, Number(body.riftDay) || 1),
  };
}

function sanitizeHaul(raw: RoamState["haul"] | undefined): RoamState["haul"] {
  if (!raw || typeof raw !== "object") return null;
  const breaths = Math.max(0, Math.floor(Number(raw.breaths) || 0));
  if (breaths <= 0) return null;
  const goods: Partial<Record<GoodId, number>> = {};
  if (raw.goods && typeof raw.goods === "object") {
    for (const [id, count] of Object.entries(raw.goods)) {
      if (id in GOODS && Number(count) > 0) goods[id as GoodId] = Math.floor(Number(count));
    }
  }
  return {
    breaths,
    xiu: Math.max(0, Number(raw.xiu) || 0),
    ling: Math.max(0, Number(raw.ling) || 0),
    stones: Math.max(0, Math.floor(Number(raw.stones) || 0)),
    wound: Math.max(0, Math.floor(Number(raw.wound) || 0)),
    goods,
  };
}

export function realmIndex(dao: number) {
  let index = 0;
  REALMS.forEach((realm, i) => {
    if (dao >= realm.min) index = i;
  });
  return index;
}

/** Ordinary progress cannot substitute for a successful major breakthrough. */
function gainDao(save: SaveData, amount: number, changes: string[]) {
  const before = save.stats.dao;
  const nextRealm = REALMS[realmIndex(before) + 1];
  const ceiling = nextRealm ? nextRealm.min - 1 : CAP.dao;
  const next = clamp(before + amount, 0, ceiling);
  save.stats.dao = next;
  if (next > before) changes.push(`道行 +${next - before}`);
  if (before + amount > ceiling && nextRealm) {
    const message = "道行已至本境关口，需以突破打开下一境";
    if (!changes.includes(message)) changes.push(message);
  }
}

function hasKarma(world: RoamState, id: string) {
  return world.karma.includes(id);
}

function eventVisible(world: RoamState, save: SaveData, event: RoamEvent) {
  if (event.once !== false && world.seen.includes(event.id) && event.weight !== 0) return false;
  if (event.minRealm !== undefined && realmIndex(save.stats.dao) < event.minRealm) return false;
  if (event.maxRealm !== undefined && realmIndex(save.stats.dao) > event.maxRealm) return false;
  if (event.eras && !event.eras.includes(eraOf(world.day + world.eraSkew).id)) return false;
  if (event.need && event.need.some((id) => !hasKarma(world, id))) return false;
  if (event.block && event.block.some((id) => hasKarma(world, id))) return false;
  if (event.sect && world.sect !== event.sect) return false;
  if (event.chain && event.stage && event.stage > 0) return false;
  if (event.chain && event.stage === 0 && world.quests[event.chain]) return false;
  if (event.weight === 0) return false;
  return true;
}

export function choiceAffordable(world: RoamState, choice: EventChoice) {
  for (const effect of choice.effects) {
    if (effect.t === "good" && effect.n < 0 && (world.bag[effect.id] ?? 0) < -effect.n) return false;
    if (effect.t === "stone" && effect.n < 0 && world.stones < -effect.n) return false;
  }
  return true;
}

export function visibleChoices(world: RoamState, event: RoamEvent): EventChoice[] {
  const list = event.choices.filter((choice) => {
    if (choice.when && !hasKarma(world, choice.when)) return false;
    if (choice.unless && hasKarma(world, choice.unless)) return false;
    return choiceAffordable(world, choice);
  });
  if (list.length > 0) return list;
  return [
    {
      id: "__leave",
      text: "先离开。这一步你现在做不到",
      result: ["你没有硬做。日子还在，路也还在。"],
      effects: [],
    },
  ];
}

function remember(world: RoamState, title: string, line: string) {
  world.log.push({ day: world.day, title, line });
  if (world.log.length > 40) world.log.splice(0, world.log.length - 40);
}

function openEvent(world: RoamState, event: RoamEvent, lead: string[] = []) {
  const extra = (event.variants ?? [])
    .filter((variant) => hasKarma(world, variant.when))
    .flatMap((variant) => variant.paragraphs);
  world.phase = "event";
  world.eventId = event.id;
  world.battle = null;
  if (!world.seen.includes(event.id)) world.seen.push(event.id);
  world.notices = world.notices.filter((id) => id !== event.id);
  world.report = {
    title: event.title,
    paragraphs: [...lead, ...extra, ...event.prose],
    changes: [],
  };
  remember(world, event.title, event.prose[0] ?? event.title);
}

function spend(world: RoamState, days: number) {
  const before = eraOf(world.day + world.eraSkew).id;
  world.day += days;
  if (world.day > world.riftDay) {
    world.riftLeft = 3;
    world.riftDay = world.day;
  }
  const after = eraOf(world.day + world.eraSkew).id;
  if (before === after) return;
  if (!world.eraSeen.includes(after)) world.eraSeen.push(after);
  const notice = ERA_NOTICE[after];
  if (notice && !world.seen.includes(notice) && !world.notices.includes(notice)) world.notices.push(notice);
}

function recover(save: SaveData, world: RoamState, changes: string[]) {
  if (save.stats.life > 0) return;
  save.stats.life = 18;
  world.wound = clamp(world.wound + 2, 0, 6);
  world.place = "edge";
  if (!world.known.includes("edge")) world.known.push("edge");
  if (!hasKarma(world, "scattered-once")) world.karma.push("scattered-once");
  changes.push("道躯散了一半，被世界的边接住");
}

function applyEffects(save: SaveData, world: RoamState, effects: Effect[], rng: () => number) {
  const changes: string[] = [];
  let battleId: string | null = null;
  for (const effect of effects) {
    if (effect.t === "stat") {
      if (effect.k === "dao" && effect.n > 0) {
        gainDao(save, effect.n, changes);
        continue;
      }
      const next = clamp(save.stats[effect.k] + effect.n, 0, CAP[effect.k]);
      const delta = next - save.stats[effect.k];
      save.stats[effect.k] = next;
      if (delta !== 0) changes.push(`${STAT_NAME[effect.k]} ${delta > 0 ? "+" : ""}${delta}`);
    } else if (effect.t === "good") {
      const have = world.bag[effect.id] ?? 0;
      const next = Math.max(0, have + effect.n);
      if (next === 0) delete world.bag[effect.id];
      else world.bag[effect.id] = next;
      const delta = next - have;
      if (delta !== 0) changes.push(`${GOODS[effect.id]} ${delta > 0 ? "+" : ""}${delta}`);
    } else if (effect.t === "stone") {
      const next = Math.max(0, world.stones + effect.n);
      const delta = next - world.stones;
      world.stones = next;
      if (delta !== 0) changes.push(`灵石 ${delta > 0 ? "+" : ""}${delta}`);
    } else if (effect.t === "karma") {
      if (!world.karma.includes(effect.id)) {
        world.karma.push(effect.id);
        changes.push("结下新的因果");
      }
    } else if (effect.t === "drop") {
      world.karma = world.karma.filter((id) => id !== effect.id);
      save.items = save.items.filter((id) => id !== effect.id);
      if (world.relic === effect.id) world.relic = null;
    } else if (effect.t === "rel") {
      world.relations[effect.id] = clamp((world.relations[effect.id] ?? 0) + effect.n, -100, 100);
      changes.push(effect.n >= 0 ? "有人记住了你的好" : "有人记住了你的拒绝");
    } else if (effect.t === "rep") {
      world.reputation[effect.id] = clamp((world.reputation[effect.id] ?? 0) + effect.n, -100, 100);
      changes.push("一方声望有了变化");
    } else if (effect.t === "quest") {
      world.quests[effect.id] = { stage: effect.stage, status: effect.status ?? "active" };
    } else if (effect.t === "delay") {
      world.delayed.push({ event: effect.event, due: world.day + effect.days });
    } else if (effect.t === "wound") {
      world.wound = clamp(world.wound + effect.n, 0, 6);
      if (effect.n > 0) changes.push("伤势加重");
      if (effect.n < 0) changes.push("伤势减轻");
    } else if (effect.t === "ling") {
      const next = clamp(world.lingqi + effect.n, 0, 80);
      const delta = next - world.lingqi;
      world.lingqi = next;
      if (delta !== 0) changes.push(`灵气 ${delta > 0 ? "+" : ""}${delta}`);
    } else if (effect.t === "xiu") {
      world.xiuwei = clamp(world.xiuwei + effect.n, 0, 100);
      changes.push(effect.n >= 0 ? "修为有所积累" : "修为损耗");
    } else if (effect.t === "art") {
      if (ARTS[effect.id] && !world.arts.includes(effect.id)) {
        world.arts.push(effect.id);
        world.equipped ??= effect.id;
        changes.push(`悟得${ARTS[effect.id]!.name}`);
      }
    } else if (effect.t === "spell") {
      if (!world.spells.includes(effect.id)) world.spells.push(effect.id);
    } else if (effect.t === "equip") {
      if (world.arts.includes(effect.id)) {
        world.equipped = effect.id;
        world.prepared = normalizePrepared(world.prepared, world.arts, world.equipped);
      }
    } else if (effect.t === "sect") {
      world.sect = effect.id;
      world.sectRank = effect.rank ?? 0;
      if (!effect.id) world.contrib = 0;
      changes.push(effect.id ? `与${SECTS.find((sect) => sect.id === effect.id)?.name ?? "一方"}有了名分` : "离开了门墙");
    } else if (effect.t === "contrib") {
      world.contrib = Math.max(0, world.contrib + effect.n);
    } else if (effect.t === "beast") {
      if (!effect.id) world.beast = null;
      else {
        const info = BEASTS[effect.id];
        world.beast = { id: effect.id, name: info?.name ?? "灵兽", bond: 10 };
        changes.push(`${world.beast.name}跟了你`);
      }
    } else if (effect.t === "bond") {
      if (world.beast) world.beast.bond = clamp(world.beast.bond + effect.n, 0, 100);
    } else if (effect.t === "cave") {
      world.cave = clamp(world.cave + effect.n, 0, 3);
      if (effect.n > 0) changes.push("洞府更深了一层");
    } else if (effect.t === "know") {
      if (!world.known.includes(effect.place)) world.known.push(effect.place);
    } else if (effect.t === "item") {
      if (!save.items.includes(effect.id)) {
        save.items.push(effect.id);
        changes.push("获得一件物事");
      }
    } else if (effect.t === "battle") {
      battleId = effect.id;
    } else if (effect.t === "skew") {
      world.eraSkew += effect.n;
    } else if (effect.t === "faction") {
      if (Object.hasOwn(world.politics.factions, effect.id)) {
        adjustFaction(world, effect.id, effect.power, effect.supply);
        changes.push("护路势力的声威与补给改变");
      }
    } else if (effect.t === "place") {
      world.place = effect.id;
      if (!world.known.includes(effect.id)) world.known.push(effect.id);
    }
  }
  if (battleId) startBattle(world, battleId, rng);
  recover(save, world, changes);
  return changes;
}

function startBattle(world: RoamState, id: string, rng: () => number) {
  const enemy = ENEMIES[id] ?? ENEMIES.stone!;
  world.phase = "battle";
  world.battle = {
    id,
    name: enemy.name,
    hp: enemy.hp,
    max: enemy.hp,
    atk: enemy.atk,
    def: enemy.def,
    guard: 0,
    round: 1,
    log: [`${enemy.name}拦住了你。`],
    win: [],
    lose: [],
    winText: enemy.winText,
    loseText: enemy.loseText,
  };
  void rng;
}

function powerOf(save: SaveData, world: RoamState) {
  const art = world.equipped ? ARTS[world.equipped] : undefined;
  const bond = world.beast ? Math.floor(world.beast.bond / 25) : 0;
  return 6 + realmIndex(save.stats.dao) * 3 + Math.floor((world.layer - 1) / 2) + world.gear * 2 + Math.floor(save.stats.kill / 10) + (art?.combat ?? 0) + bond + (activeRelic(save) === "zhuxian" ? 2 : 0);
}

function finishBattle(save: SaveData, world: RoamState, win: boolean, rng: () => number) {
  const battle = world.battle;
  if (!battle) return;
  const paragraphs = win ? battle.winText : battle.loseText;
  const changes = win
    ? applyEffects(save, world, battle.win.length ? battle.win : [{ t: "stat", k: "kill", n: 1 }, { t: "good", id: "ore", n: 1 }], rng)
    : applyEffects(save, world, battle.lose.length ? battle.lose : [{ t: "wound", n: 1 }], rng);
  world.phase = "free";
  world.battle = null;
  world.eventId = null;
  if (win && battle.id.startsWith("rift-") && world.gear < 8 && rng() < .35) {
    world.gear += 1;
    changes.push("护身之物更好了一档");
  }
  if (win && activeRelic(save) === "incense") {
    const healed = Math.min(4, CAP.life - save.stats.life);
    save.stats.life += healed;
    if (healed) changes.push(`人族香火护归 · 道躯 +${healed}`);
  }
  world.report = { title: win ? "这一场停了" : "你退了下来", paragraphs, changes };
  remember(world, world.report.title, paragraphs[0] ?? "");
}

function strikeEnemy(save: SaveData, world: RoamState, amount: number, rng: () => number) {
  const battle = world.battle;
  if (!battle) return;
  battle.hp = Math.max(0, battle.hp - amount);
  battle.log.push(`你打中${battle.name}，它的势头弱了一截。`);
  if (battle.hp <= 0) finishBattle(save, world, true, rng);
}

function enemyStrike(save: SaveData, world: RoamState, rng: () => number) {
  const battle = world.battle;
  if (!battle || world.phase !== "battle") return;
  const relicProtection = relicGuard(save, battle.round);
  const reduced = battle.guard + relicProtection;
  battle.guard = 0;
  const damage = Math.max(1, battle.atk - realmIndex(save.stats.dao) - reduced);
  if (relicProtection && damage < Math.max(1, battle.atk - realmIndex(save.stats.dao) - reduced + relicProtection)) battle.log.push(`${ITEMS[activeRelic(save)!]!.name}为你承住一部分攻势。`);
  save.stats.life = clamp(save.stats.life - damage, 0, CAP.life);
  battle.log.push(`${battle.name}还击，你的道躯承了这一下。`);
  battle.round += 1;
  if (save.stats.life <= 0) {
    const changes: string[] = [];
    recover(save, world, changes);
    world.phase = "free";
    world.battle = null;
    world.report = {
      title: "边上传来的风",
      paragraphs: [...battle.loseText, "你没有死成传说。世界的边把残魂按回身体里。"],
      changes,
    };
    return;
  }
  if (battle.round > 8) {
    battle.log.push("你们谁也没有把对方留下。这场斗自己散了。");
    finishBattle(save, world, false, rng);
  }
}

function interrupt(world: RoamState) {
  const index = world.delayed.findIndex((item) => item.due <= world.day);
  if (index < 0) return false;
  const due = world.delayed[index]!;
  world.delayed.splice(index, 1);
  const event = eventById(due.event);
  if (!event) return false;
  openEvent(world, event, ["你另有安排。安排没有你的因果跑得快。"]);
  return true;
}

function canReach(world: RoamState, place: PlaceId) {
  if (place === world.place) return true;
  const here = ROAM_PLACES[world.place];
  if (here.neighbors.includes(place) || world.known.includes(place)) return gate(world, place) === null;
  return false;
}

function gate(world: RoamState, place: PlaceId): string | null {
  if (place === "zixiao") {
    const heard = ["caught-purple", "listened-only", "entered-zixiao", "spoke-dao"].some((id) =>
      hasKarma(world, id),
    );
    if (!heard && world.day < 8 && world.equipped !== "qingjing") {
      return "台阶太清，你的道躯还站不稳。再走几日，或先把气息练直。";
    }
  }
  if (place === "board") {
    const era = eraOf(world.day + world.eraSkew).id;
    if (era !== "board" && !hasKarma(world, "approached-board")) return "榜还未立。空等它，不如先过自己的日子。";
  }
  return null;
}

function travelOptions(save: SaveData): PlaceId[] {
  const world = save.world;
  if (!world) return [];
  const here = ROAM_PLACES[world.place];
  const ids = new Set<PlaceId>([...here.neighbors, ...world.known]);
  ids.delete(world.place);
  return [...ids].filter((place) => gate(world, place) === null);
}

function pickEvent(save: SaveData, world: RoamState, rng: () => number): RoamEvent | null {
  const continuable = CHAINS.map((chain) => {
    const quest = world.quests[chain.id];
    if (!quest || quest.status !== "active") return null;
    const id = chain.stages[quest.stage];
    const event = id ? eventById(id) : null;
    if (!event) return null;
    if (event.place !== "any" && event.place !== world.place) return null;
    return event;
  }).filter((event): event is RoamEvent => Boolean(event));
  if (continuable.length && rng() < 0.42) return continuable[Math.floor(rng() * continuable.length)]!;

  const pool = EVENTS.filter((event) => {
    if (event.place !== "any" && event.place !== world.place) return false;
    return eventVisible(world, save, event);
  });
  if (!pool.length) return null;
  const total = pool.reduce((sum, event) => sum + (event.weight ?? 1), 0);
  let roll = rng() * total;
  for (const event of pool) {
    roll -= event.weight ?? 1;
    if (roll <= 0) return event;
  }
  return pool[0] ?? null;
}

function originOf(act: Extract<RoamAct, { type: "origin" }>, save: SaveData, world: RoamState) {
  const name = cleanName(act.name) || "未名";
  save.name = name;
  save.origin = act.origin;
  save.started = true;
  const table: Record<Origin, { art: string; wuxing: number; stats: Partial<SaveData["stats"]>; ling: number }> = {
    dao: { art: "qingjing", wuxing: 7, stats: { dao: 3, qi: 2 }, ling: 26 },
    wu: { art: "bone", wuxing: 4, stats: { kill: 4, life: 100 }, ling: 18 },
    yao: { art: "form", wuxing: 6, stats: { qi: 5 }, ling: 22 },
    ren: { art: "hearth", wuxing: 5, stats: { virtue: 5 }, ling: 16 },
  };
  const picked = table[act.origin];
  world.wuxing = picked.wuxing;
  world.lingqi = picked.ling;
  world.arts = [picked.art];
  world.equipped = picked.art;
  world.spells = ARTS[picked.art]?.spell ? [picked.art] : [];
  for (const [key, value] of Object.entries(picked.stats) as [StatKey, number][]) {
    save.stats[key] = clamp((save.stats[key] ?? 0) + value, 0, CAP[key]);
  }
  world.phase = "free";
  world.place = "earth";
  world.farm = "earth";
  world.idle = { kind: "wander" };
  world.lastTick = Date.now();
  world.farmLog = ["你在洪荒大地开始挂机。妖兽会自己送上门。"];
  world.report = {
    title: "日子从这里开始",
    paragraphs: [
      `${name}在新分开的天地里有了一个称呼。称呼不是结局。`,
      "没有人规定你下一息必须去见圣人。你可以修炼，可以赶路，可以装作什么大事都还没发生。",
      "大事仍会按自己的时候到来。到来之前，这一天是你的。",
    ],
    changes: [`根骨已定`, `初习${ARTS[picked.art]!.name}`],
  };
}

function cloneSave(save: SaveData): SaveData {
  return {
    version: save.version,
    screen: save.screen,
    started: save.started,
    name: save.name,
    origin: save.origin,
    sceneId: save.sceneId,
    stats: { ...save.stats },
    items: [...save.items],
    flags: [...save.flags],
    log: save.log.map((line) => ({ ...line })),
    seen: [...save.seen],
    novelIndex: save.novelIndex,
    sound: save.sound,
    pastLives: save.pastLives.map((life) => ({ ...life, lines: [...life.lines] })),
    world: save.world ? structuredClone(save.world) : null,
  };
}

export function applyRoam(save: SaveData, act: RoamAct, rng: () => number = Math.random): SaveData {
  if (act.type === "idle" && act.what === "sync") {
    const now = act.now ?? Date.now();
    const world = save.world;
    if (!world?.idle || world.phase !== "free") return save;
    if (now >= world.lastTick && now - (world.lastTick || now) < (world.idle.kind === "wander" ? 2500 : 20_000)) return save;
  }
  const next = cloneSave(save);
  next.world = next.world ?? createRoam();
  next.world.living ??= createLiving(next.world.day);
  next.world.prepared ??= [null, null];
  next.world.politics ??= createPolitics(next.world.day);
  next.world.lineages ??= {};
  next.world.insights ??= {};
  next.world.relic = activeRelic(next);
  dispatch(next, next.world, act, rng);
  advanceLiving(next.world);
  next.version = 2;
  return next;
}

function dispatch(save: SaveData, world: RoamState, act: RoamAct, rng: () => number) {
  if (act.type === "origin") {
    if (world.phase !== "origin") return;
    originOf(act, save, world);
    return;
  }
  if (world.phase === "origin") return;
  if (world.phase === "battle") {
    if (act.type !== "combat") return;
    combat(save, world, act.move, rng, act.artId);
    return;
  }
  if (world.phase === "event") {
    if (act.type !== "choose") return;
    choose(save, world, act.choiceId, rng);
    return;
  }
  if (act.type === "affairs" || act.type === "lineage") {
    const options = () => (act.type === "affairs" ? affairsOptions(save) : lineageOptions(save));
    const same = (candidate: RoamAct) =>
      candidate.type === act.type &&
      candidate.what === act.what &&
      (candidate.type === "affairs" && act.type === "affairs"
        ? candidate.faction === act.faction
        : candidate.type === "lineage" &&
          act.type === "lineage" &&
          candidate.chapter === act.chapter &&
          candidate.choiceId === act.choiceId);
    let option = options().find((item) => same(item.act));
    if (!option || option.disabled) return;
    if (!(act.type === "lineage" && act.what === "begin")) {
      accrueIdle(save, world, Date.now(), rng);
      world.idle = null;
      option = options().find((item) => same(item.act));
      if (!option || option.disabled) {
        world.report = {
          title: "先整顿行囊",
          paragraphs: ["刚才那段修行已结算，如今的资源或道躯不足以继续。没有再扣除这一步的消耗。"],
          changes: ["挂机已停下"],
        };
        return;
      }
    }
    const apply = (effects: Effect[]) => applyEffects(save, world, effects, rng);
    const days =
      act.type === "affairs" ? performAffairs(save, act, apply) : performLineage(save, act, apply);
    if (days) spend(world, days);
    if (world.report) remember(world, world.report.title, world.report.paragraphs[0] ?? "");
  } else if (act.type === "cultivate") cultivate(save, world, rng);
  else if (act.type === "local" || act.type === "person") {
    const option = localOptions(save).find((option) => sameLocalAct(option.act, act));
    if (!option || option.disabled) return;
    if (act.type === "local" && act.what !== "survey" || act.type === "person" && act.what === "deliver") {
      accrueIdle(save, world, Date.now(), rng);
      world.idle = null;
      const settled = localOptions(save).find((item) => sameLocalAct(item.act, act));
      if (!settled || settled.disabled) {
        world.report = { title: "先歇一歇", paragraphs: ["刚才那段游历已经结算，当前道躯或灵气不足以完成这一步。没有再次扣除材料，可先调息再来。"], changes: ["挂机已停下"] };
        return;
      }
    }
    const days = performLocal(save, act);
    if (days) spend(world, days);
    if (world.report) remember(world, world.report.title, world.report.paragraphs[0] ?? "");
  }
  else if (act.type === "equip-relic") {
    if (world.retreat || act.id === world.relic || act.id !== null && (!Object.hasOwn(RELIC_USES, act.id) || !save.items.includes(act.id))) return;
    accrueIdle(save, world, Date.now(), rng);
    world.relic = act.id;
    world.report = { title: "御器", paragraphs: [act.id ? `你将${ITEMS[act.id]!.name}引入周身气机。此物仍在行囊，不因御使而消失。` : "你收回了器物上的气机。收藏与旧有因缘仍然留着。"], changes: [act.id ? RELIC_USES[act.id]!.detail : "当前未御使器物"] };
  }
  else if (act.type === "comprehend-art") {
    if (insightRequirement(save, act.artId, act.level)) return;
    accrueIdle(save, world, Date.now(), rng);
    world.idle = null;
    const blocked = insightRequirement(save, act.artId, act.level);
    if (blocked) { world.report = { title: "先整顿气息", paragraphs: [blocked, "挂机已结算并停下，没有扣除参悟费用。"], changes: [] }; return; }
    const step = INSIGHT_STEPS[act.level - 1]!;
    const effects: Effect[] = [{ t: "stone", n: -step.stones }, { t: "ling", n: -step.qi }, ...Object.entries(step.goods).map(([id, n]) => ({ t: "good" as const, id: id as GoodId, n: -n! }))];
    const changes = applyEffects(save, world, effects, rng);
    world.insights[act.artId] = act.level;
    spend(world, 1);
    world.report = { title: `${ARTS[act.artId]!.name} · ${INSIGHT_NAMES[act.level]}`, paragraphs: [act.level === 1 ? "你没有多背一篇口诀，只把熟悉的气息重新走了一遍。原来浪费的那一点，终于肯留在体内。" : "境界撑开了旧法的余地。招式仍是那一式，出手与收手之间却多了自己的分寸。", techniqueFor(world, act.artId)!.detail], changes: [...changes, `领悟至${INSIGHT_NAMES[act.level]}`, `招式现耗 ${techniqueFor(world, act.artId)!.cost} 灵气`] };
    remember(world, world.report.title, world.report.paragraphs[0]!);
  }
  else if (act.type === "equip-art") equipArt(save, world, act.artId, rng);
  else if (act.type === "prepare-art") {
    if (world.retreat || ![0, 1].includes(act.slot) || act.artId === world.equipped ||
      act.artId !== null && (!world.arts.includes(act.artId) || !Object.hasOwn(TECHNIQUES, act.artId) || world.prepared.includes(act.artId))) return;
    if (world.prepared[act.slot] === act.artId) return;
    accrueIdle(save, world, Date.now(), rng);
    world.prepared[act.slot] = act.artId;
    world.report = { title: "行前备法", paragraphs: [act.artId ? `你将${TECHNIQUES[act.artId]!.name}纳入行前演练。主修的根基未变，临阵时多了一种应对。` : "你将这一路辅修收回识海，旧日所学仍然保留。"], changes: [act.artId ? `辅修${act.slot + 1} · ${ARTS[act.artId]!.name}` : `辅修${act.slot + 1}已收起`] };
  }
  else if (act.type === "battle-plan") {
    if (world.retreat || !Object.hasOwn(BATTLE_PLANS, act.plan) || act.plan === world.battlePlan) return;
    accrueIdle(save, world, Date.now(), rng);
    world.battlePlan = act.plan;
    world.report = { title: "临阵之策", paragraphs: [BATTLE_PLANS[act.plan].detail], changes: [`斗法策略 · ${BATTLE_PLANS[act.plan].name}`] };
  }
  else if (act.type === "breakthrough") breakthrough(save, world, act.pill, rng);
  else if (act.type === "explore") explore(save, world, rng);
  else if (act.type === "travel") travel(save, world, act.place, rng);
  else if (act.type === "gather") gather(save, world, rng);
  else if (act.type === "rest") rest(save, world);
  else if (act.type === "alchemy") alchemy(save, world, act.recipe);
  else if (act.type === "use") takeGood(save, world, act.id);
  else if (act.type === "cave") caveAct(save, world, act.what);
  else if (act.type === "retreat") retreatAct(save, world, act.what, rng);
  else if (act.type === "plot") plotAct(save, world, act.what);
  else if (act.type === "sect") sectAct(save, world, act.what, rng);
  else if (act.type === "trade") trade(save, world, act.what, act.id);
  else if (act.type === "beast") beastAct(save, world, act.what);
  else if (act.type === "idle") idleAct(save, world, act, rng);
  else if (act.type === "continue") continueChain(save, world, act.chainId);
  else if (act.type === "notice") notice(world, act.eventId);
}

function equipArt(save: SaveData, world: RoamState, id: string, rng: () => number) {
  if (world.retreat || !world.arts.includes(id) || !Object.hasOwn(ARTS, id) || world.equipped === id) return;
  // Settle seated cultivation using the previous art before changing its bonus.
  accrueIdle(save, world, Date.now(), rng);
  world.equipped = id;
  world.prepared = normalizePrepared(world.prepared, world.arts, id);
  world.report = { title: "转修", paragraphs: [`你将${ARTS[id]!.name}定为主修。旧日所学仍留在识海，不因这一念而散。`], changes: [`主修 · ${ARTS[id]!.name}`] };
  remember(world, "转修", world.report.paragraphs[0]!);
}

function cultivate(save: SaveData, world: RoamState, rng: () => number) {
  if (interrupt(world)) return;
  const line = CULTIVATE_LINES[Math.floor(rng() * CULTIVATE_LINES.length)]!;
  const art = world.equipped ? ARTS[world.equipped] : undefined;
  const place = ROAM_PLACES[world.place];
  let gain = 7 + world.wuxing * 0.45 + place.spirit * 1.4 + (art?.xiu ?? 0) + world.cave * 2;
  gain *= 0.86 + rng() * 0.28;
  if (world.wound >= 3) gain *= 0.75;
  const realm = REALMS[realmIndex(save.stats.dao)]!;
  const nextRealm = REALMS[realmIndex(save.stats.dao) + 1];
  const changes: string[] = [];
  const cultivationCost = activeRelic(save) === "chaos-qi" ? 1 : 2;
  if (world.lingqi >= cultivationCost) {
    world.lingqi -= cultivationCost;
    changes.push(`灵气 -${cultivationCost}${cultivationCost === 1 ? " · 混沌气含护" : ""}`);
  } else {
    gain *= 0.55;
    changes.push("灵气不足，这一日只进了一半");
  }
  const before = world.xiuwei;
  world.xiuwei = clamp(world.xiuwei + gain, 0, 100);
  if (world.xiuwei >= 100 && before < 100) changes.push("火候已满，可以尝试突破");
  else if (world.xiuwei > before) changes.push("修为有所积累");
  if (rng() > 0.45) {
    gainDao(save, 1, changes);
  }
  spend(world, 1);
  world.report = {
    title: art ? art.name : "无功法的一日",
    paragraphs: [
      line,
      `${place.name}的灵气${place.spirit >= 4 ? "厚，坐在这里比坐在荒地上多一分进境" : "薄，薄就薄，呼吸仍要做完"}。`,
      nextRealm
        ? `此刻是${realm.name}。要看见${nextRealm.name}，先把这一炉火候坐满，而不是点一下就跳过去。`
        : "境界已经顶到檐下。这一日仍把呼吸做完，日子并不因此结束。",
      art ? art.line : "你还没有成篇的法，只有不肯散的那一口气。",
    ],
    changes,
  };
  remember(world, "修炼", line);
}

function breakthrough(save: SaveData, world: RoamState, pill: boolean, rng: () => number) {
  if (world.xiuwei < 100) {
    world.report = {
      title: "火候未到",
      paragraphs: ["关口还在前面。把日子继续堆上去，比现在硬撞更像修行。"],
      changes: [],
    };
    return;
  }
  const index = realmIndex(save.stats.dao);
  const next = REALMS[index + 1];
  if (!next) {
    world.report = {
      title: "檐下",
      paragraphs: ["此生的境界已经顶到准圣的檐。再往上不是多坐一日就能声称的事。你仍可以生活、救人、闯祸。"],
      changes: [],
    };
    return;
  }
  const usedPill = pill && (world.bag["pill-break"] ?? 0) > 0;
  if (usedPill) {
    world.bag["pill-break"] = (world.bag["pill-break"] ?? 1) - 1;
    if ((world.bag["pill-break"] ?? 0) <= 0) delete world.bag["pill-break"];
  }
  let chance = 0.4 + world.wuxing * 0.035 + (save.stats.qi / 160) * 0.16 - world.wound * 0.09;
  chance += usedPill ? 0.22 : 0;
  chance += world.cave * 0.04;
  if (activeRelic(save) === "purple-qi") chance += 0.05;
  chance -= (save.stats.demon / 100) * 0.15;
  chance = clamp(chance, 0.08, 0.92);
  spend(world, 1);
  if ((world.layer ?? 1) < 9) {
    if (rng() < 0.82 + world.wuxing * 0.01) {
      world.layer += 1;
      const changes: string[] = [];
      gainDao(save, 1, changes);
      world.xiuwei = Math.min(100, world.spare);
      world.spare = Math.max(0, world.spare - world.xiuwei);
      const realm = REALMS[realmIndex(save.stats.dao)] ?? REALMS[0]!;
      world.report = {
        title: `${realm.name} · ${LAYER_NAME[world.layer - 1]}`,
        paragraphs: ["这一层开了。火候重新开始攒，挂机不会停。"],
        changes: [`升到${LAYER_NAME[world.layer - 1]}`, ...changes],
      };
      return;
    }
    world.xiuwei = 72;
    world.report = {
      title: "这一层没稳住",
      paragraphs: ["气息散了一截。挂机继续，过一会儿还能再撞这一层。"],
      changes: ["火候回落"],
    };
    return;
  }
  if (rng() < chance) {
    save.stats.dao = clamp(Math.max(save.stats.dao, next.min), 0, CAP.dao);
    world.layer = 1;
    world.xiuwei = Math.min(100, world.spare);
    world.spare = Math.max(0, world.spare - world.xiuwei);
    save.stats.life = clamp(save.stats.life + 8, 0, CAP.life);
    world.wound = clamp(world.wound - 1, 0, 6);
    world.report = {
      title: `入${next.name}`,
      paragraphs: [
        next.line,
        usedPill ? "丹在关口上替你扛了一下，然后碎了。碎得干净。" : "没有外物。是你自己的气息把那道缝撑开的。",
        "大境界打开了。层数从头再数。挂机仍在。",
      ],
      changes: [`境界至${next.name}`, "道躯 +8"],
    };
    remember(world, next.name, next.line);
    return;
  }
  world.xiuwei = 58;
  save.stats.life = clamp(save.stats.life - 10, 0, CAP.life);
  world.wound = clamp(world.wound + 1, 0, 6);
  save.stats.demon = clamp(save.stats.demon + 2, 0, CAP.demon);
  const changes = ["修为回落", "道躯 -10", "心魔 +2", "伤势加重"];
  recover(save, world, changes);
  world.report = {
    title: "关口把你退了回来",
    paragraphs: [
      "不是天罚。是你的气息在缝上散了。",
      world.wound >= 3 ? "伤还在响。下一次若仍带着这些伤去撞，会更难看。" : "你还坐得住。坐得住就可以再来。",
    ],
    changes,
  };
  remember(world, "突破未成", "关口把你退了回来。");
}

function explore(save: SaveData, world: RoamState, rng: () => number) {
  if (interrupt(world)) return;
  spend(world, 1);
  const event = pickEvent(save, world, rng);
  if (!event) {
    const line = QUIET[world.place];
    world.lingqi = clamp(world.lingqi + 1, 0, 80);
    world.report = { title: ROAM_PLACES[world.place].name, paragraphs: line, changes: ["灵气 +1"] };
    remember(world, "空过", line[0] ?? "");
    return;
  }
  openEvent(world, event);
}

function travel(save: SaveData, world: RoamState, place: PlaceId, rng: () => number) {
  if (!canReach(world, place)) {
    const why = gate(world, place);
    world.report = {
      title: "此路不通",
      paragraphs: [why ?? "你还不知道怎么走到那里，或者中间的地界还没肯认你。"],
      changes: [],
    };
    return;
  }
  if (interrupt(world)) return;
  // Settle the old location before starting a manual journey.
  accrueIdle(save, world, Date.now(), rng);
  world.idle = null;
  world.place = place;
  if (!world.known.includes(place)) world.known.push(place);
  spend(world, 1);
  const placeDef = ROAM_PLACES[place];
  if (placeDef.danger >= 3 && realmIndex(save.stats.dao) < 3 && rng() < 0.2) {
    world.report = {
      title: placeDef.name,
      paragraphs: ["路走到一半，有东西不肯让开。"],
      changes: [],
    };
    startBattle(world, placeDef.danger >= 4 ? "grave" : "tide", rng);
    return;
  }
  world.report = { title: placeDef.name, paragraphs: placeDef.intro, changes: [] };
  remember(world, placeDef.name, placeDef.intro[0] ?? "");
}

function gather(save: SaveData, world: RoamState, rng: () => number) {
  if (interrupt(world)) return;
  const place = ROAM_PLACES[world.place];
  const amount = 1 + (rng() > 0.72 ? 1 : 0);
  world.bag[place.good] = (world.bag[place.good] ?? 0) + amount;
  const changes = [`${GOODS[place.good]} +${amount}`];
  const paragraphs = [`你在${place.name}寻到${GOODS[place.good]}。它不说话，可它真实。`];
  if (rng() < place.danger * 0.07) {
    world.wound = clamp(world.wound + 1, 0, 6);
    paragraphs.push("地或水或火刮了你一下。采集从来不是伸手就完。");
    changes.push("伤势加重");
  }
  spend(world, 1);
  world.report = { title: "采集", paragraphs, changes };
  void save;
}

function rest(save: SaveData, world: RoamState) {
  if (interrupt(world)) return;
  const heal = 7 + world.cave * 2 + (activeRelic(save) === "buzhou-stone" ? 3 : 0);
  const before = save.stats.life;
  save.stats.life = clamp(save.stats.life + heal, 0, CAP.life);
  world.wound = clamp(world.wound - 1, 0, 6);
  world.lingqi = clamp(world.lingqi + 2 + world.cave, 0, 80);
  spend(world, 1);
  world.report = {
    title: "调息",
    paragraphs: [
      world.cave > 0 ? "洞府的壁替你挡住了一部分噪声。噪声少的时候，伤自己会退。" : "你找了一处背风的地方，把呼吸放回肚子里。",
    ],
    changes: [`道躯 +${save.stats.life - before}`, "伤势减轻"],
  };
}

function alchemy(save: SaveData, world: RoamState, recipeId: string) {
  const recipe = RECIPES.find((item) => item.id === recipeId);
  if (!recipe) return;
  for (const [id, count] of Object.entries(recipe.need) as [GoodId, number][]) {
    if ((world.bag[id] ?? 0) < count) {
      world.report = {
        title: "药材不足",
        paragraphs: ["炉可以等。缺的东西不会因为你心急就自己长出来。"],
        changes: [],
      };
      return;
    }
  }
  for (const [id, count] of Object.entries(recipe.need) as [GoodId, number][]) {
    world.bag[id] = (world.bag[id] ?? 0) - count;
    if ((world.bag[id] ?? 0) <= 0) delete world.bag[id];
  }
  const ruined = world.cave === 0 && world.wound >= 4 && world.lingqi < 4;
  spend(world, 1);
  if (ruined) {
    world.wound = clamp(world.wound + 1, 0, 6);
    world.report = {
      title: "炉翻了",
      paragraphs: ["火候和伤叠在一起。药材进了灰，丹没有成。你还活着，所以可以再备一炉。"],
      changes: ["药材耗去", "伤势加重"],
    };
    return;
  }
  world.bag[recipe.out] = (world.bag[recipe.out] ?? 0) + 1;
  world.report = {
    title: recipe.name,
    paragraphs: [recipe.text, world.cave > 0 ? "洞壁把火托住了。这一炉比在风口上稳。" : "风会进来。你用手把最关键的一下捂住了。"],
    changes: [`${GOODS[recipe.out]} +1`],
  };
  void save;
}

function takeGood(save: SaveData, world: RoamState, id: GoodId) {
  if ((world.bag[id] ?? 0) <= 0) return;
  world.bag[id] = (world.bag[id] ?? 1) - 1;
  if ((world.bag[id] ?? 0) <= 0) delete world.bag[id];
  if (id === "pill-qi") {
    world.lingqi = clamp(world.lingqi + 16, 0, 80);
    world.report = { title: "凝气散", paragraphs: ["凉意散开。它不替你悟，只把枯掉的地方暂时浇湿。"], changes: ["灵气 +16"] };
  } else if (id === "pill-life") {
    const before = save.stats.life;
    save.stats.life = clamp(save.stats.life + 16, 0, CAP.life);
    world.wound = clamp(world.wound - 1, 0, 6);
    world.report = {
      title: "续命丹",
      paragraphs: ["苦味提醒你还在。提醒不是大道，可它让下一步走得成。"],
      changes: [`道躯 +${save.stats.life - before}`, "伤势减轻"],
    };
  } else if (id === "pill-break") {
    world.xiuwei = clamp(world.xiuwei + 12, 0, 100);
    world.report = {
      title: "破境丹",
      paragraphs: ["你没有拿它去撞关口，只把它化成一段积累。关口还在，只是近了些。"],
      changes: ["修为有所积累"],
    };
  } else {
    world.report = { title: GOODS[id], paragraphs: ["你把它用掉了。"], changes: [] };
  }
}

function caveAct(save: SaveData, world: RoamState, what: "upgrade" | "meditate") {
  if (what === "upgrade") {
    if (world.cave >= 3) return;
    const cost = 6 * (world.cave + 1);
    if (world.stones < cost) {
      world.report = { title: "石不够", paragraphs: ["洞府不接受许诺。它要已经在手里的石头。"], changes: [] };
      return;
    }
    world.stones -= cost;
    world.cave += 1;
    spend(world, 1);
    world.report = {
      title: "洞府",
      paragraphs: ["你把一天拍进土里。墙记住你的手掌，比记住你的道号更早。"],
      changes: [`灵石 -${cost}`, "洞府更深了一层"],
    };
    return;
  }
  if (world.cave <= 0) return;
  if (interrupt(world)) return;
  world.xiuwei = clamp(world.xiuwei + 8 * world.cave, 0, 100);
  world.lingqi = clamp(world.lingqi + world.cave, 0, 80);
  spend(world, 1);
  world.report = {
    title: "洞中",
    paragraphs: ["外面的纪元仍在走。你在墙里只走自己的一息。两件事同时为真。"],
    changes: ["修为有所积累"],
  };
  void save;
}

const WATCHES = [
  { name: "子时", line: "夜还没有退出骨头。你把呼吸放慢到能听见自己的血，而不去数它。" },
  { name: "卯时", line: "外面大概亮了。你不睁眼。亮与不亮，都不准改你这一息的长短。" },
  { name: "午时", line: "火候走到最吵的地方。吵的是念头，不是钟。你让念头过去，不请它们留下。" },
  { name: "酉时", line: "光退了。退的时候最容易把没做成的事谎称已经做成。你把谎按住。" },
];

function retreatAct(save: SaveData, world: RoamState, what: "enter" | "watch" | "leave", rng: () => number) {
  if (what === "enter") {
    if (world.retreat) return;
    if (interrupt(world)) return;
    world.retreat = { watch: 0 };
    spend(world, 1);
    world.report = {
      title: "入定",
      paragraphs: [
        "你把今天剩下的路按住。这一日已经交给打坐，不是交给赶路。",
        "时辰要一个一个坐。坐到一半可以起身，起身不会把已经过去的白天还你。",
      ],
      changes: ["这一日已经入定"],
    };
    remember(world, "入定", "你把今天交给打坐。");
    return;
  }
  if (!world.retreat) return;
  if (what === "leave") {
    const sat = world.retreat.watch;
    world.retreat = null;
    world.report = {
      title: "出关",
      paragraphs: [
        sat > 0
          ? "时辰还没走完，你已经起身。起身不是失败。外面还有你想看见的东西。"
          : "你几乎没有坐。门还是原来的门，只是这一日已经不在赶路上。",
      ],
      changes: sat > 0 ? ["提前出关"] : [],
    };
    return;
  }
  if (interrupt(world)) {
    world.retreat = null;
    return;
  }
  const watch = WATCHES[world.retreat.watch] ?? WATCHES[WATCHES.length - 1]!;
  const art = world.equipped ? ARTS[world.equipped] : undefined;
  const place = ROAM_PLACES[world.place];
  let gain = 3.2 + world.wuxing * 0.18 + place.spirit * 0.45 + (art?.xiu ?? 0) * 0.35 + world.cave * 0.8;
  const changes: string[] = [];
  if (world.lingqi >= 1) {
    world.lingqi -= 1;
    changes.push("灵气 -1");
  } else {
    gain *= 0.5;
    changes.push("灵气枯了，这一时辰很浅");
  }
  if (world.wound >= 3) gain *= 0.8;
  const before = world.xiuwei;
  world.xiuwei = clamp(world.xiuwei + gain, 0, 100);
  if (world.xiuwei >= 100 && before < 100) changes.push("火候已满，可以尝试突破");
  else if (world.xiuwei > before) changes.push("修为有所积累");
  world.retreat.watch += 1;
  const finished = world.retreat.watch >= WATCHES.length;
  const paragraphs = [watch.line, `${place.name}不因为你闭眼就停止。你只是暂时不回应它。`];
  if (finished) {
    world.retreat = null;
    if (rng() < 0.16 + save.stats.demon / 400) {
      save.stats.demon = clamp(save.stats.demon + 1, 0, CAP.demon);
      changes.push("心魔 +1");
      paragraphs.push("最后一个时辰里，有个声音把没做完的事说成已经做完。你听见了，没有照做。");
    } else {
      paragraphs.push("四个时辰走完。这一日没有被切成赶路和应付。火候是坐出来的，不是点出来的。");
    }
    world.report = { title: "一日入定", paragraphs, changes };
    remember(world, "出定", paragraphs[0] ?? "");
    return;
  }
  world.report = { title: watch.name, paragraphs, changes };
  remember(world, watch.name, watch.line);
}

function plotAct(save: SaveData, world: RoamState, what: "plant" | "harvest") {
  if (world.retreat) {
    world.report = { title: "定中", paragraphs: ["你还坐着。土里的事等出关再说。"], changes: [] };
    return;
  }
  if (what === "plant") {
    if (world.plot || (world.bag.herb ?? 0) < 1) return;
    const fertile = world.cave > 0 || ["earth", "wahuan", "tribes", "kunlun", "penglai"].includes(world.place);
    if (!fertile) {
      world.report = { title: "种不活", paragraphs: ["这块地不肯留根。换一处有土或有洞壁的地方。"], changes: [] };
      return;
    }
    if (interrupt(world)) return;
    world.bag.herb = (world.bag.herb ?? 1) - 1;
    if ((world.bag.herb ?? 0) <= 0) delete world.bag.herb;
    const wait = world.cave > 0 ? 2 : 4;
    world.plot = { ready: world.day + wait };
    spend(world, 1);
    world.report = {
      title: "药圃",
      paragraphs: [
        world.cave > 0
          ? "你把一株灵草按进洞壁下的土。土记得你的手，比记得你的道号早。"
          : "你在露天种下它。露天长得慢，慢是它要付的风。",
        "它不会在你转身的时候就成熟。你得去做别的事，再回来看。",
      ],
      changes: ["灵草 -1", "药圃种下了"],
    };
    return;
  }
  if (!world.plot || world.day < world.plot.ready) {
    world.report = { title: "还没到", paragraphs: ["苗还在。拔早了，你得到的是一截不肯负责的绿。"], changes: [] };
    return;
  }
  if (interrupt(world)) return;
  world.plot = null;
  const amount = (world.cave > 0 ? 3 : 2) + (activeRelic(save) === "xirang" ? 2 : 0);
  world.bag.herb = (world.bag.herb ?? 0) + amount;
  const changes = [`灵草 +${amount}`];
  if (world.cave > 1 || world.place === "wahuan") {
    world.bag.dew = (world.bag.dew ?? 0) + 1;
    changes.push("清露 +1");
  }
  spend(world, 1);
  world.report = {
    title: "采圃",
    paragraphs: ["你收回比种下去更多的草。多出来的部分不是奇迹，是你肯等。"],
    changes,
  };
  void save;
}

function sectAct(save: SaveData, world: RoamState, what: "join" | "task" | "leave" | "learn", rng: () => number) {
  const here = SECTS.find((sect) => sect.place === world.place);
  if (what === "join") {
    if (world.sect || !here) return;
    if (here.id === "chan" && realmIndex(save.stats.dao) < 1 && save.origin !== "dao") {
      world.report = { title: "玉虚", paragraphs: ["门没有关，可风把你推回半步。你还站不稳他们要的那种安静。"], changes: [] };
      return;
    }
    if (here.id === "wu" && save.origin !== "wu" && save.stats.kill < 6 && !hasKarma(world, "lifted-ask")) {
      world.report = { title: "巫族", paragraphs: ["他们看你的肩。肩上还没有印子。印子可以以后再有，今日不收。"], changes: [] };
      return;
    }
    world.sect = here.id;
    world.sectRank = 0;
    world.reputation[here.id] = (world.reputation[here.id] ?? 0) + 4;
    world.report = {
      title: here.name,
      paragraphs: [here.creed, `你成了${here.rank[0]}。名分不是护身符，是一份以后会被拿来对照的记录。`],
      changes: ["有了名分"],
    };
    return;
  }
  if (!world.sect) return;
  const sect = SECTS.find((item) => item.id === world.sect);
  if (!sect) return;
  if (what === "leave") {
    world.reputation[sect.id] = clamp((world.reputation[sect.id] ?? 0) - 6, -100, 100);
    world.sect = null;
    world.sectRank = 0;
    world.contrib = 0;
    world.report = {
      title: "离开",
      paragraphs: ["你把名分放下。放下不是没发生过。路上的人仍可能用那个名字叫你。"],
      changes: ["离开了门墙"],
    };
    return;
  }
  if (sect.place !== world.place) {
    world.report = { title: sect.name, paragraphs: ["人不在山门，事就不算数。你若要做，先回去。"], changes: [] };
    return;
  }
  if (what === "learn") {
    if (world.contrib < 8 || world.arts.includes(sect.art)) return;
    world.contrib -= 8;
    world.arts.push(sect.art);
    world.equipped ??= sect.art;
    if (ARTS[sect.art]?.spell) world.spells.push(sect.art);
    world.report = {
      title: ARTS[sect.art]?.name ?? "传承",
      paragraphs: [ARTS[sect.art]?.line ?? "你记下了一段可以反复使用的法。"],
      changes: [`悟得${ARTS[sect.art]?.name ?? "功法"}`],
    };
    return;
  }
  if (interrupt(world)) return;
  const lines = TASK_LINES[sect.id] ?? CULTIVATE_LINES;
  const line = lines[Math.floor(rng() * lines.length)]!;
  world.contrib += 2;
  world.stones += 1;
  if (world.contrib >= 8 && world.sectRank < sect.rank.length - 1) {
    world.sectRank += 1;
  }
  spend(world, 1);
  world.report = { title: sect.name, paragraphs: [line], changes: ["贡献增加", "灵石 +1"] };
}

function trade(save: SaveData, world: RoamState, what: "buy" | "sell", id: GoodId) {
  const market = MARKETS[world.place];
  if (!market) {
    world.report = { title: "没有集市", paragraphs: ["这里的人还不用你手里的石头说话。"], changes: [] };
    return;
  }
  if (world.retreat) {
    world.report = { title: "定中", paragraphs: ["你还坐着。集市不会等，可你今天已经不在路上。"], changes: [] };
    return;
  }
  if (what === "buy") {
    const offer = market.buy.find((item) => item.id === id);
    if (!offer || world.stones < offer.cost) {
      world.report = { title: "换不成", paragraphs: ["石头不够，或者这处集市根本不卖这个。"], changes: [] };
      return;
    }
    world.stones -= offer.cost;
    world.bag[id] = (world.bag[id] ?? 0) + 1;
    world.report = {
      title: "换取",
      paragraphs: [`你在${ROAM_PLACES[world.place].name}换到${GOODS[id]}。`],
      changes: [`灵石 -${offer.cost}`, `${GOODS[id]} +1`],
    };
    return;
  }
  const offer = market.sell.find((item) => item.id === id);
  if (!offer || (world.bag[id] ?? 0) <= 0) return;
  world.bag[id] = (world.bag[id] ?? 1) - 1;
  if ((world.bag[id] ?? 0) <= 0) delete world.bag[id];
  world.stones += offer.pay;
  world.report = {
    title: "脱手",
    paragraphs: ["你把东西换成以后能用的石头。石头不神圣，所以可靠。"],
    changes: [`${GOODS[id]} -1`, `灵石 +${offer.pay}`],
  };
  void save;
}

function beastAct(save: SaveData, world: RoamState, what: "feed" | "release" | "train") {
  if (!world.beast) return;
  if (what === "release") {
    const name = world.beast.name;
    world.beast = null;
    if (!hasKarma(world, "freed-beast")) world.karma.push("freed-beast");
    world.report = {
      title: name,
      paragraphs: [`你让${name}走。走的东西若还回头看一眼，那一眼就够你记很久。`],
      changes: ["灵兽离开了"],
    };
    return;
  }
  if (what === "train") {
    if (world.retreat) return;
    if (interrupt(world)) return;
    world.beast.bond = clamp(world.beast.bond + 6, 0, 100);
    const changes = ["它更认你"];
    const paragraphs = [`你和${world.beast.name}把同一个动作做了很多遍。它不说话，可它开始在你停的地方停。`];
    if (world.beast.bond >= 36) {
      const place = ROAM_PLACES[world.place];
      world.bag[place.good] = (world.bag[place.good] ?? 0) + 1;
      changes.push(`${GOODS[place.good]} +1`);
      paragraphs.push("同练结束时，它把地上的一点东西推到你脚边。不是进贡，是它也看见了。");
    }
    spend(world, 1);
    world.report = { title: world.beast.name, paragraphs, changes };
    return;
  }
  if ((world.bag.herb ?? 0) <= 0) return;
  world.bag.herb = (world.bag.herb ?? 1) - 1;
  if ((world.bag.herb ?? 0) <= 0) delete world.bag.herb;
  world.beast.bond = clamp(world.beast.bond + 8, 0, 100);
  world.report = {
    title: world.beast.name,
    paragraphs: ["它吃得很专心。专心是一种没有被亏待过的人才有的表情，你希望自己没有看错。"],
    changes: ["灵草 -1", "它更认你"],
  };
  void save;
}

function emptyHaul(): NonNullable<RoamState["haul"]> {
  return { breaths: 0, xiu: 0, ling: 0, stones: 0, wound: 0, goods: {} };
}

function accrueIdle(save: SaveData, world: RoamState, now: number, rng: () => number = Math.random) {
  if (!world.idle) return false;
  const from = world.lastTick || now;
  if (now < from) {
    world.lastTick = now;
    return false;
  }
  if (world.idle.kind === "wander") {
    const fights = Math.floor((now - from) / 2500);
    if (fights <= 0) return false;
    bankFights(world, save, fights, rng);
    // Keep sub-tick time, discard time beyond the advertised storage cap.
    world.lastTick = fights >= 480 ? now : from + fights * 2500;
    return true;
  }
  const capBreaths = 8 * 60 * 3;
  const have = world.haul?.breaths ?? 0;
  const room = capBreaths - have;
  if (room <= 0) {
    world.lastTick = now;
    return false;
  }
  const breaths = Math.min(room, Math.floor((now - from) / 20_000));
  if (breaths <= 0) return false;
  const haul = world.haul ?? emptyHaul();
  const place = ROAM_PLACES[world.place];
  const art = world.equipped ? ARTS[world.equipped] : undefined;
  const sit = world.idle.kind === "sit";
  const per = sit ? 0.08 + place.spirit * 0.012 + world.cave * 0.02 + (art?.xiu ?? 0) * 0.01 : 0.03 + place.spirit * 0.004;
  haul.breaths += breaths;
  haul.xiu += per * breaths * (world.wound >= 3 ? 0.7 : 1);
  haul.ling += (sit ? 0.12 : 0.04) * breaths;
  if (!sit) {
    const goods = Math.floor(breaths / 6);
    if (goods > 0) haul.goods[place.good] = (haul.goods[place.good] ?? 0) + goods;
    haul.stones += Math.floor(breaths / 15);
    if (place.danger >= 3) haul.wound += Math.min(2, Math.floor(breaths / 45));
  }
  world.haul = haul;
  world.lastTick = from + breaths * 20_000;
  return true;
}

function claimHaul(save: SaveData, world: RoamState, now: number, rng: () => number = Math.random) {
  accrueIdle(save, world, now, rng);
  const haul = world.haul;
  if (!haul || haul.breaths <= 0) {
    world.report = {
      title: "还没有可收的",
      paragraphs: ["挂机刚坐下，时辰还没走完一息。你可以离开，回来再收。"],
      changes: [],
    };
    return;
  }
  const before = world.xiuwei;
  addXiu(world, haul.xiu);
  world.lingqi = clamp(world.lingqi + haul.ling, 0, 80);
  world.stones += haul.stones;
  world.wound = clamp(world.wound + haul.wound, 0, 6);
  const changes: string[] = [];
  if (world.xiuwei >= 100 && before < 100) changes.push("火候已满，可以尝试突破");
  else if (haul.xiu >= 1) changes.push("修为有所积累");
  else changes.push("气息动了一点");
  if (haul.ling >= 1) changes.push(`灵气 +${Math.floor(haul.ling)}`);
  if (haul.stones > 0) changes.push(`灵石 +${haul.stones}`);
  for (const [id, count] of Object.entries(haul.goods)) {
    if (!count) continue;
    const good = id as GoodId;
    world.bag[good] = (world.bag[good] ?? 0) + count;
    changes.push(`${GOODS[good]} +${count}`);
  }
  if (haul.wound > 0) changes.push("路上受了些伤");
  const days = Math.max(1, Math.min(8, Math.floor(haul.breaths / 90)));
  const kind = world.idle?.kind === "wander" ? "游历" : "打坐";
  world.haul = null;
  world.lastTick = now;
  spend(world, days);
  world.report = {
    title: "收起这段修行",
    paragraphs: [
      `你离开的时候，人还在${ROAM_PLACES[world.place].name}${kind}。`,
      kind === "打坐"
        ? "灵气没有因为你去看别处就停。回来时，火候比走的时候厚。"
        : "路自己在走。你不在的时候，它仍把能捡的东西留在原地。",
      "打坐最多暂存八小时，游历最多暂存四百八十轮。超过上限的时光不再累积收获。",
    ],
    changes,
  };
  remember(world, "收菜", world.report.paragraphs[0] ?? "");
}

function idleAct(save: SaveData, world: RoamState, act: Extract<RoamAct, { type: "idle" }>, rng: () => number) {
  const now = act.now ?? Date.now();
  const what = act.what;
  if (what === "farm") {
    if (!act.place || !canReach(world, act.place)) {
      world.report = { title: "这张图还去不了", paragraphs: ["先把近处的图挂熟，或者把境界抬上去。"], changes: [] };
      return;
    }
    accrueIdle(save, world, now, rng);
    world.farm = act.place;
    world.place = act.place;
    world.idle = { kind: "wander" };
    world.lastTick = now;
    pushFarm(world, `改挂${ROAM_PLACES[act.place].name}。`);
    return;
  }
  if (what === "fight") {
    fightTick(save, world, now, rng);
    return;
  }
  if (what === "rift") {
    openRift(save, world, rng);
    return;
  }
  if (what === "sync") {
    accrueIdle(save, world, now, rng);
    return;
  }
  if (what === "claim") {
    claimHaul(save, world, now, rng);
    return;
  }
  if (what === "stop") {
    accrueIdle(save, world, now, rng);
    const collected = Boolean(world.haul && world.haul.breaths > 0);
    if (world.haul && world.haul.breaths > 0) claimHaul(save, world, now, rng);
    world.idle = null;
    world.lastTick = now;
    if (!collected) {
      world.report = {
        title: "停下",
        paragraphs: ["挂机停了。停下之后，离开不再替你修炼。"],
        changes: [],
      };
    }
    return;
  }
  if (what !== "sit" && what !== "wander") return;
  if (world.retreat) {
    world.report = { title: "定中", paragraphs: ["你还在按时辰坐。出关之后再挂机。"], changes: [] };
    return;
  }
  accrueIdle(save, world, now, rng);
  world.idle = { kind: what };
  if (what === "wander") world.farm = world.place;
  world.lastTick = now;
  world.report = {
    title: what === "sit" ? "打坐挂机" : "游历挂机",
    paragraphs: [
      what === "sit"
        ? `你在${ROAM_PLACES[world.place].name}坐下。这页可以关。你回来的时候，再收这一段。`
        : `你把脚步交给${ROAM_PLACES[world.place].name}。人离开，路还在捡东西。回来再收。`,
      "按钮上不会先写你会得到多少。收的时候才知道。",
    ],
    changes: [],
  };
  remember(world, world.report.title, world.report.paragraphs[0] ?? "");
}

function pushFarm(world: RoamState, line: string) {
  world.farmLog = [...(world.farmLog ?? []), line].slice(-12);
}

function addXiu(world: RoamState, amount: number) {
  const room = 100 - world.xiuwei;
  if (amount <= room) {
    world.xiuwei += amount;
    return;
  }
  world.xiuwei = 100;
  world.spare = clamp(world.spare + (amount - room), 0, 300);
}

const LAYER_NAME = ["一层", "二层", "三层", "四层", "五层", "六层", "七层", "八层", "九层"] as const;

const FOE: Record<PlaceId, { name: string; need: number }> = {
  chaos: { name: "未散的气团", need: 6 },
  earth: { name: "土精", need: 6 },
  edge: { name: "边风", need: 6 },
  tribes: { name: "荒原凶兽", need: 10 },
  east: { name: "海妖残影", need: 12 },
  wahuan: { name: "火灵", need: 13 },
  kunlun: { name: "守山石灵", need: 14 },
  penglai: { name: "岛上老妖", need: 16 },
  zixiao: { name: "宫门外的光", need: 18 },
  buzhou: { name: "未冷的石傀", need: 20 },
  youming: { name: "阴差", need: 20 },
  bloodsea: { name: "血侍", need: 22 },
  board: { name: "台下的执笔", need: 24 },
};

function fightTick(save: SaveData, world: RoamState, now: number, rng: () => number) {
  if (world.retreat || world.phase !== "free" || world.idle?.kind !== "wander") return;
  if (!world.farm) world.farm = world.place;
  const gap = world.lastTick ? now - world.lastTick : 0;
  if (world.lastTick && gap < 2_500) {
    // Mount/visibility callbacks share the same clock as the interval.
    // Re-anchor a clock rollback without awarding a fight for it.
    if (gap < 0) world.lastTick = now;
    return;
  }
  if (world.lastTick && gap >= 8_000) {
    accrueIdle(save, world, now, rng);
    return;
  }
  const fights = Math.max(1, Math.floor(gap / 2500));
  for (let i = 0; i < fights; i++) pushFarm(world, strikeOnce(save, world, rng));
  world.lastTick = world.lastTick ? world.lastTick + fights * 2500 : now;
}

/** Same enemy state can be played manually or by the automatic decision policy. */
export function farmBattle(place: PlaceId): BattleState {
  const foe = FOE[place];
  return {
    id: `farm-${place}`, name: foe.name, hp: foe.need * 3, max: foe.need * 3,
    atk: Math.max(2, foe.need - 4), def: Math.max(0, Math.floor(foe.need / 4) - 1),
    guard: 0, round: 1, log: [], win: [], lose: [],
    winText: [`${foe.name}的气息散了。`], loseText: [`${foe.name}把你逼退。`],
  };
}

export function automaticAction(save: SaveData): Extract<RoamAct, { type: "combat" }> {
  const world = save.world;
  if (!world?.battle) return { type: "combat", move: "strike" };
  const available = preparedTechniques(world).filter((id) => world.lingqi >= techniqueFor(world, id)!.cost);
  let picked: string | undefined;
  if (save.stats.life <= 50) {
    picked = available.find((id) => techniqueFor(world, id)!.heal > 0 && CAP.life - save.stats.life >= techniqueFor(world, id)!.heal);
    if (!picked && world.battlePlan === "reserve") picked = available.find((id) => techniqueFor(world, id)!.guard > 0 || techniqueFor(world, id)!.bind);
  }
  if (!picked && world.battlePlan !== "reserve") {
    const attacks = available.filter((id) => techniqueFor(world, id)!.power > 0);
    if (world.battlePlan === "assault") attacks.sort((a, b) => techniqueFor(world, b)!.power - techniqueFor(world, a)!.power);
    if (world.battlePlan === "assault" || world.battle.round % 2 === 1) picked = attacks[0];
  }
  if (picked) return { type: "combat", move: "technique", artId: picked };
  const art = world.equipped ? ARTS[world.equipped] : undefined;
  return { type: "combat", move: world.battlePlan === "assault" && world.lingqi >= 4 && (art?.spell || world.spells.length) ? "spell" : "strike" };
}
export function automaticMove(save: SaveData): Extract<RoamAct, { type: "combat" }>["move"] {
  return automaticAction(save).move;
}

/** Only the real combat resolver decides hits, guards, healing and victory. */
export function resolveFarmBattle(save: SaveData, rng: () => number) {
  const simulated = cloneSave(save);
  const world = simulated.world!;
  const battle = farmBattle(world.farm ?? world.place);
  world.phase = "battle";
  world.battle = battle;
  const moves: string[] = [];
  for (let round = 0; round < 8 && world.phase === "battle"; round++) {
    const action = automaticAction(simulated);
    const name = action.move === "technique" ? TECHNIQUES[action.artId!]!.name : action.move === "spell" ? "施法" : "攻";
    moves.push(name);
    combat(simulated, world, action.move, rng, action.artId);
  }
  return { win: battle.hp <= 0, moves, life: simulated.stats.life, lingqi: world.lingqi, wound: world.wound };
}

type FarmReward = { xiu: number; stone: number; good?: GoodId; line: string };
function farmStep(save: SaveData, world: RoamState, rng: () => number): FarmReward {
  if (save.stats.life < 35) {
    const before = save.stats.life;
    save.stats.life = Math.min(CAP.life, before + 12);
    world.lingqi = Math.min(80, world.lingqi + 3);
    world.wound = Math.max(0, world.wound - 1);
    return { xiu: 0, stone: 0, line: `战间调息。道躯 +${save.stats.life - before}，灵气 +3。` };
  }
  const placeId = world.farm ?? world.place;
  const place = ROAM_PLACES[placeId];
  const result = resolveFarmBattle(save, rng);
  const lifeChange = result.life - save.stats.life;
  const qiChange = Math.round((result.lingqi - world.lingqi) * 10) / 10;
  save.stats.life = result.life;
  world.lingqi = result.lingqi;
  world.wound = result.wound;
  const detail = `${result.moves.join(" → ")}；道躯 ${lifeChange > 0 ? "+" : ""}${lifeChange}，灵气 ${qiChange > 0 ? "+" : ""}${qiChange}`;
  if (!result.win) return { xiu: .12, stone: 0, line: `${FOE[placeId].name}把你逼退。${detail}` };
  const xiu = 2.4 + place.spirit * .35 + world.gear * .15;
  world.lingqi = Math.min(80, world.lingqi + .2);
  const roll = rng();
  let good: GoodId | undefined;
  let stone = 0;
  let loot = "修为有所积累";
  if (roll < .08 && world.gear < 8) { world.gear += 1; loot += "，护身之物更好了一档"; }
  else if (roll < .45) { good = place.good; loot += `，${GOODS[good]} +1`; }
  else if (roll < .62) { stone = 1; loot += "，灵石 +1"; }
  return { xiu, good, stone, line: `斩了${FOE[placeId].name}。${detail}。${loot}。` };
}

function strikeOnce(save: SaveData, world: RoamState, rng: () => number) {
  const reward = farmStep(save, world, rng);
  addXiu(world, reward.xiu);
  world.stones += reward.stone;
  if (reward.good) world.bag[reward.good] = (world.bag[reward.good] ?? 0) + 1;
  return reward.line;
}

function bankFights(world: RoamState, save: SaveData, fights: number, rng: () => number) {
  const haul = world.haul ?? emptyHaul();
  const count = Math.max(0, Math.min(fights, 480 - haul.breaths));
  let last = "";
  for (let i = 0; i < count; i++) {
    const reward = farmStep(save, world, rng);
    haul.breaths += 1;
    haul.xiu += reward.xiu;
    haul.stones += reward.stone;
    if (reward.good) haul.goods[reward.good] = (haul.goods[reward.good] ?? 0) + 1;
    last = reward.line;
  }
  if (!count) return;
  world.haul = haul;
  pushFarm(world, `离线推演 ${count} 轮，沿用主修与临阵之策。收获待领取；道躯、灵气和护身已结算。末轮：${last}`);
}

function continueChain(save: SaveData, world: RoamState, chainId: string) {
  const chain = CHAINS.find((item) => item.id === chainId);
  const quest = world.quests[chainId];
  if (!chain || !quest || quest.status !== "active") return;
  const eventId = chain.stages[quest.stage];
  const event = eventId ? eventById(eventId) : null;
  if (!event) {
    quest.status = "done";
    return;
  }
  if (event.place !== "any" && event.place !== world.place) {
    if (!canReach(world, event.place)) {
      world.report = {
        title: chain.name,
        paragraphs: [`此事还在${ROAM_PLACES[event.place].name}。你此刻走不过去。`],
        changes: [],
      };
      return;
    }
    world.place = event.place;
    if (!world.known.includes(event.place)) world.known.push(event.place);
    spend(world, 1);
  }
  openEvent(world, event);
  void save;
}

function notice(world: RoamState, eventId: string) {
  const event = eventById(eventId);
  if (!event || !world.notices.includes(eventId)) return;
  openEvent(world, event, ["天地先变了一点。你可以看，也可以以后再说你看见过。"]);
}

function choose(save: SaveData, world: RoamState, choiceId: string, rng: () => number) {
  const event = world.eventId ? eventById(world.eventId) : null;
  if (!event) {
    world.phase = "free";
    return;
  }
  const choice = visibleChoices(world, event).find((item) => item.id === choiceId);
  if (!choice) return;
  const changes = applyEffects(save, world, choice.effects, rng);
  if (world.phase === "battle") {
    world.report = { title: event.title, paragraphs: choice.result, changes };
    return;
  }
  world.phase = "free";
  world.eventId = null;
  world.report = { title: event.title, paragraphs: choice.result, changes };
  remember(world, event.title, choice.result[0] ?? choice.text);
}

function combat(save: SaveData, world: RoamState, move: "strike" | "spell" | "guard" | "flee" | "technique", rng: () => number, artId?: string) {
  const battle = world.battle;
  if (!battle) return;
  const art = world.equipped ? ARTS[world.equipped] : undefined;
  if (move === "technique") {
    const id = artId ?? world.equipped;
    const technique = id && preparedTechniques(world).includes(id) ? techniqueFor(world, id) : undefined;
    if (!technique || world.lingqi < technique.cost) return;
    world.lingqi -= technique.cost;
    battle.guard = technique.guard;
    const healed = Math.min(technique.heal, CAP.life - save.stats.life);
    save.stats.life += healed;
    battle.log.push(`你使出${technique.name}。灵气 -${technique.cost}${healed ? `，道躯 +${healed}` : ""}。`);
    if (technique.power > 0) strikeEnemy(save, world, Math.max(1, Math.round(powerOf(save, world) * technique.power) - battle.def), rng);
    if (world.phase !== "battle") return;
    if (technique.bind) {
      battle.log.push(`${battle.name}被牵制，这一回合未能还击。`);
      battle.round += 1;
      if (battle.round > 8) finishBattle(save, world, false, rng);
    } else enemyStrike(save, world, rng);
    return;
  }
  if (move === "guard") {
    battle.guard = 4 + realmIndex(save.stats.dao);
    battle.log.push("你收势，准备把下一击卸开。");
    enemyStrike(save, world, rng);
    return;
  }
  if (move === "flee") {
    const odds = 0.42 + save.stats.qi / 220;
    if (rng() < odds) {
      world.phase = "free";
      world.battle = null;
      world.report = { title: "脱身", paragraphs: ["你离开了这场斗。离开不是赢，可你还走得动。"], changes: [] };
      return;
    }
    battle.log.push("你没能抽身。");
    enemyStrike(save, world, rng);
    return;
  }
  if (move === "spell") {
    const can = Boolean(art?.spell || world.spells.length);
    if (!can || world.lingqi < 4) {
      battle.log.push("法没有发出去。你只好改用更笨的办法。");
    } else {
      world.lingqi -= 4;
      const amount = Math.max(2, Math.round(powerOf(save, world) * 1.6) - battle.def);
      strikeEnemy(save, world, amount, rng);
      if (world.phase !== "battle") return;
      enemyStrike(save, world, rng);
      return;
    }
  }
  const amount = Math.max(1, powerOf(save, world) + Math.floor(rng() * 4) - battle.def);
  strikeEnemy(save, world, amount, rng);
  if (world.phase !== "battle") return;
  enemyStrike(save, world, rng);
}

export function adoptChronicle(save: SaveData): SaveData {
  const next = cloneSave(save);
  const world = createRoam();
  world.phase = next.origin ? "free" : "origin";
  world.karma = [...next.flags];
  world.xiuwei = 35;
  const known = new Set<PlaceId>(["chaos", "earth", "edge"]);
  for (const id of next.seen) {
    const place = id as PlaceId;
    if (place in ROAM_PLACES) known.add(place);
  }
  world.known = [...known];
  world.report = {
    title: "残卷之外",
    paragraphs: [
      "正史那一条路你已经走过一截。从今天起，下一件事不再由章节替你排好。",
      "大能的胜负仍写在本纪里。你的修炼、赶路、亏欠和吃饭，改由你自己过。",
    ],
    changes: [],
  };
  next.world = world;
  next.version = 2;
  next.screen = "play";
  return next;
}

export function contentStats() {
  const chainIds = new Set(CHAINS.flatMap((chain) => chain.stages));
  return {
    events: EVENTS.length,
    chains: CHAINS.length,
    chainStages: chainIds.size,
    uniqueProse: new Set(EVENTS.map((event) => event.prose.join("\n"))).size,
  };
}

export function eraName(world: RoamState) {
  return eraOf(world.day + world.eraSkew);
}

export function continuableChains(world: RoamState) {
  return CHAINS.filter((chain) => {
    const quest = world.quests[chain.id];
    return Boolean(quest && quest.status === "active" && chain.stages[quest.stage]);
  });
}

export type MenuAct = { id: string; label: string; act: RoamAct; note?: string };

export function menuActs(save: SaveData): MenuAct[] {
  const world = save.world;
  if (!world || world.phase !== "free") return [];
  if (world.retreat) {
    const last = world.retreat.watch >= WATCHES.length - 1;
    return [
      {
        id: "retreat-watch",
        label: last ? "坐完这最后一个时辰" : "再坐一个时辰",
        act: { type: "retreat", what: "watch" },
      },
      { id: "retreat-leave", label: "提前出关", act: { type: "retreat", what: "leave" } },
    ];
  }
  const acts: MenuAct[] = [
    { id: "cultivate", label: "闭关一日", act: { type: "cultivate" } },
    { id: "retreat-enter", label: "入定，按时辰坐", act: { type: "retreat", what: "enter" } },
    { id: "explore", label: "四处探寻", act: { type: "explore" } },
    { id: "gather", label: "采集", act: { type: "gather" } },
    { id: "rest", label: "调息疗伤", act: { type: "rest" } },
    { id: "idle-sit", label: world.idle?.kind === "sit" ? "继续打坐挂机" : "在此打坐挂机", act: { type: "idle", what: "sit" } },
    { id: "idle-wander", label: world.idle?.kind === "wander" ? "继续游历挂机" : "在此游历挂机", act: { type: "idle", what: "wander" } },
  ];
  if (world.idle) acts.push({ id: "idle-stop", label: "停下挂机", act: { type: "idle", what: "stop" } });
  for (const id of new Set(world.arts)) {
    if (Object.hasOwn(ARTS, id) && id !== world.equipped) acts.push({ id: `equip-${id}`, label: `主修${ARTS[id]!.name}`, act: { type: "equip-art", artId: id } });
  }
  if ((world.haul?.breaths ?? 0) > 0) acts.push({ id: "idle-claim", label: "收起这段修行", act: { type: "idle", what: "claim" } });
  if (world.xiuwei >= 100 && realmIndex(save.stats.dao) < REALMS.length - 1) {
    acts.push({ id: "break", label: "尝试突破", act: { type: "breakthrough", pill: false } });
    if ((world.bag["pill-break"] ?? 0) > 0) {
      acts.push({ id: "break-pill", label: "服丹再试突破", act: { type: "breakthrough", pill: true } });
    }
  }
  for (const place of travelOptions(save)) {
    acts.push({ id: `go-${place}`, label: `前往${ROAM_PLACES[place].name}`, act: { type: "travel", place } });
  }
  for (const recipe of RECIPES) {
    const ready = Object.entries(recipe.need).every(([id, count]) => (world.bag[id as GoodId] ?? 0) >= count);
    if (ready) acts.push({ id: `alchemy-${recipe.id}`, label: `炼制${recipe.name}`, act: { type: "alchemy", recipe: recipe.id } });
  }
  for (const id of ["pill-qi", "pill-life", "pill-break"] as const) {
    if ((world.bag[id] ?? 0) > 0) acts.push({ id: `use-${id}`, label: `服用${GOODS[id]}`, act: { type: "use", id } });
  }
  if (world.cave < 3 && world.stones >= 6 * (world.cave + 1)) {
    acts.push({ id: "cave-up", label: "经营洞府", act: { type: "cave", what: "upgrade" } });
  }
  if (world.cave > 0) acts.push({ id: "cave-med", label: "洞中打坐", act: { type: "cave", what: "meditate" } });
  const fertile = world.cave > 0 || ["earth", "wahuan", "tribes", "kunlun", "penglai"].includes(world.place);
  if (!world.plot && fertile && (world.bag.herb ?? 0) > 0) {
    acts.push({ id: "plot-plant", label: "种下药圃", act: { type: "plot", what: "plant" } });
  }
  if (world.plot && world.day >= world.plot.ready) {
    acts.push({ id: "plot-harvest", label: "采收回药圃", act: { type: "plot", what: "harvest" } });
  }
  const here = SECTS.find((sect) => sect.place === world.place);
  if (!world.sect && here) acts.push({ id: "join", label: `拜见${here.name}`, act: { type: "sect", what: "join" } });
  if (world.sect) {
    const sect = SECTS.find((item) => item.id === world.sect);
    if (sect?.place === world.place) {
      acts.push({ id: "task", label: "做一桩门中事", act: { type: "sect", what: "task" } });
      if (world.contrib >= 8 && sect && !world.arts.includes(sect.art)) {
        acts.push({ id: "learn", label: "请教师传", act: { type: "sect", what: "learn" } });
      }
    }
    acts.push({ id: "leave", label: "辞去名分", act: { type: "sect", what: "leave" } });
  }
  const market = MARKETS[world.place];
  if (market) {
    for (const offer of market.buy) {
      if (world.stones >= offer.cost) {
        acts.push({ id: `buy-${offer.id}`, label: `换取${GOODS[offer.id]} · ${offer.cost} 灵石`, act: { type: "trade", what: "buy", id: offer.id } });
      }
    }
    for (const offer of market.sell) {
      if ((world.bag[offer.id] ?? 0) > 0) {
        acts.push({ id: `sell-${offer.id}`, label: `售出${GOODS[offer.id]} · ${offer.pay} 灵石`, act: { type: "trade", what: "sell", id: offer.id } });
      }
    }
  }
  if (world.beast && (world.bag.herb ?? 0) > 0) {
    acts.push({ id: "feed", label: `喂${world.beast.name}`, act: { type: "beast", what: "feed" } });
  }
  if (world.beast) {
    acts.push({ id: "train", label: `与${world.beast.name}同练`, act: { type: "beast", what: "train" } });
    acts.push({ id: "release", label: `放${world.beast.name}离开`, act: { type: "beast", what: "release" } });
  }
  for (const chain of continuableChains(world)) {
    acts.push({ id: `chain-${chain.id}`, label: `继续「${chain.name}」`, act: { type: "continue", chainId: chain.id } });
  }
  for (const eventId of world.notices) {
    const event = eventById(eventId);
    if (event) acts.push({ id: `notice-${eventId}`, label: `观天地异象·${event.title}`, act: { type: "notice", eventId } });
  }
  return acts;
}

function openRift(save: SaveData, world: RoamState, rng: () => number) {
  if (world.riftLeft <= 0) {
    world.report = { title: "秘境今日已尽", paragraphs: ["一日三次。日子走到明天，次数会回来。"], changes: [] };
    return;
  }
  accrueIdle(save, world, Date.now(), rng);
  world.riftLeft -= 1;
  world.idle = null;
  const placeId = world.farm ?? world.place;
  const place = ROAM_PLACES[placeId];
  const battle = farmBattle(placeId);
  battle.id = `rift-${placeId}`;
  battle.name = `${battle.name} · 秘境守主`;
  battle.hp = battle.max = Math.ceil(battle.max * 1.3);
  battle.atk += 2;
  battle.win = [{ t: "xiu", n: 28 }, { t: "stone", n: 4 }, { t: "good", id: place.good, n: 3 }];
  battle.winText = [`${place.name}的秘境安静下来。你带着所得，从来路走回。`];
  world.phase = "battle";
  world.battle = battle;
  world.report = {
    title: "秘境 · 守关",
    paragraphs: [`${battle.name}守在前面。此行暂歇挂机，如何出招，由你自己来。`],
    changes: [],
  };

}

export function farmChoices(save: SaveData): PlaceId[] {
  return travelOptions(save);
}

export function farmOutlook(save: SaveData, place: PlaceId) {
  const world = save.world;
  if (!world) return "未知";
  const power = powerOf(save, world);
  const need = FOE[place].need;
  if (power >= need + 2) return "能挂";
  if (power >= need) return "刚好";
  if (power + 2 >= need) return "勉强";
  return "会吃亏";
}

export function layerName(layer: number) {
  return LAYER_NAME[clamp(layer, 1, 9) - 1] ?? "一层";
}

export function legalActs(save: SaveData): RoamAct[] {
  const world = save.world;
  if (!world) return [];
  if (world.phase === "origin") {
    return (["dao", "wu", "yao", "ren"] as Origin[]).map((origin) => ({
      type: "origin" as const,
      origin,
      name: "无名",
    }));
  }
  if (world.phase === "battle") {
    const acts: RoamAct[] = [
      { type: "combat", move: "strike" },
      { type: "combat", move: "guard" },
      { type: "combat", move: "flee" },
    ];
    const art = world.equipped ? ARTS[world.equipped] : undefined;
    if (art?.spell || world.spells.length) acts.push({ type: "combat", move: "spell" });
    for (const id of preparedTechniques(world)) {
      if (world.lingqi >= techniqueFor(world, id)!.cost) acts.push({ type: "combat", move: "technique", artId: id });
    }
    return acts;
  }
  if (world.phase === "event") {
    const event = world.eventId ? eventById(world.eventId) : null;
    if (!event) return [{ type: "choose", choiceId: "__leave" }];
    return visibleChoices(world, event).map((choice) => ({
      type: "choose" as const,
      choiceId: choice.id,
    }));
  }
  return [
    ...menuActs(save).map((item) => item.act),
    ...(!world.retreat ? save.items.filter((id) => Object.hasOwn(RELIC_USES, id) && id !== world.relic).map((id) => ({ type: "equip-relic" as const, id })) : []),
    ...world.arts.flatMap((artId) => { const level = insightLevel(world, artId) + 1; return level <= 2 && !insightRequirement(save, artId, level) ? [{ type: "comprehend-art" as const, artId, level: level as 1 | 2 }] : []; }),
    ...localOptions(save)
      .filter((item) => !item.disabled)
      .map((item) => item.act),
    ...affairsOptions(save)
      .filter((item) => !item.disabled)
      .map((item) => item.act),
    ...lineageOptions(save)
      .filter((item) => !item.disabled)
      .map((item) => item.act),
  ];
}

const LEAK = /道行\s*[+\-＋－]\s*\d|气运\s*[+\-＋－]\s*\d|心魔\s*[+\-＋－]\s*\d|仁德\s*[+\-＋－]\s*\d|杀伐\s*[+\-＋－]\s*\d|道躯\s*[+\-＋－]\s*\d/;

export function labelsLeakNumbers(labels: string[]) {
  return labels.filter((label) => LEAK.test(label));
}

export { ERAS, MARKETS, ROAM_PLACES, SECTS, RECIPES, GOODS, ARTS, CHAINS };
