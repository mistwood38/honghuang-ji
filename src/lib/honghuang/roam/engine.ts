import type { Origin, SaveData, StatKey } from "../types.ts";
import { cleanName } from "../engine.ts";
import { REALMS } from "../world.ts";
import {
  ARTS,
  BEASTS,
  CULTIVATE_LINES,
  ENEMIES,
  ERAS,
  GOODS,
  QUIET,
  RECIPES,
  ROAM_PLACES,
  SECTS,
  TASK_LINES,
  clamp,
  eraOf,
} from "./catalog.ts";
import { CHAINS, EVENTS, eventById } from "./events.ts";
import type {
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
  return {
    ...base,
    ...body,
    place: body.place,
    phase: body.phase,
    known: Array.isArray(body.known) ? body.known.filter((id): id is PlaceId => id in ROAM_PLACES) : base.known,
    bag: body.bag && typeof body.bag === "object" ? body.bag : {},
    arts: Array.isArray(body.arts) ? body.arts.filter((id) => typeof id === "string") : [],
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
    day: Math.max(1, Number(body.day) || 1),
  };
}

export function realmIndex(dao: number) {
  let index = 0;
  REALMS.forEach((realm, i) => {
    if (dao >= realm.min) index = i;
  });
  return index;
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
      if (world.arts.includes(effect.id)) world.equipped = effect.id;
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
  return 6 + realmIndex(save.stats.dao) * 3 + Math.floor(save.stats.kill / 10) + (art?.combat ?? 0) + bond;
}

function finishBattle(save: SaveData, world: RoamState, win: boolean) {
  const battle = world.battle;
  if (!battle) return;
  const paragraphs = win ? battle.winText : battle.loseText;
  const changes = win
    ? applyEffects(save, world, [{ t: "stat", k: "kill", n: 1 }, { t: "good", id: "ore", n: 1 }], Math.random)
    : applyEffects(save, world, [{ t: "wound", n: 1 }], Math.random);
  world.phase = "free";
  world.battle = null;
  world.eventId = null;
  world.report = { title: win ? "这一场停了" : "你退了下来", paragraphs, changes };
  remember(world, world.report.title, paragraphs[0] ?? "");
}

function strikeEnemy(save: SaveData, world: RoamState, amount: number) {
  const battle = world.battle;
  if (!battle) return;
  battle.hp = Math.max(0, battle.hp - amount);
  battle.log.push(`你打中${battle.name}，它的势头弱了一截。`);
  if (battle.hp <= 0) finishBattle(save, world, true);
}

function enemyStrike(save: SaveData, world: RoamState) {
  const battle = world.battle;
  if (!battle || world.phase !== "battle") return;
  const reduced = battle.guard;
  battle.guard = 0;
  const damage = Math.max(1, battle.atk - realmIndex(save.stats.dao) - reduced);
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
    finishBattle(save, world, false);
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
  const next = cloneSave(save);
  next.world = next.world ?? createRoam();
  dispatch(next, next.world, act, rng);
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
    combat(save, world, act.move, rng);
    return;
  }
  if (world.phase === "event") {
    if (act.type !== "choose") return;
    choose(save, world, act.choiceId, rng);
    return;
  }
  if (act.type === "cultivate") cultivate(save, world, rng);
  else if (act.type === "breakthrough") breakthrough(save, world, act.pill, rng);
  else if (act.type === "explore") explore(save, world, rng);
  else if (act.type === "travel") travel(save, world, act.place, rng);
  else if (act.type === "gather") gather(save, world, rng);
  else if (act.type === "rest") rest(save, world);
  else if (act.type === "alchemy") alchemy(save, world, act.recipe);
  else if (act.type === "use") takeGood(save, world, act.id);
  else if (act.type === "cave") caveAct(save, world, act.what);
  else if (act.type === "sect") sectAct(save, world, act.what, rng);
  else if (act.type === "trade") trade(save, world, act.what, act.id);
  else if (act.type === "beast") beastAct(save, world, act.what);
  else if (act.type === "continue") continueChain(save, world, act.chainId);
  else if (act.type === "notice") notice(world, act.eventId);
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
  if (world.lingqi >= 2) {
    world.lingqi -= 2;
    changes.push("灵气 -2");
  } else {
    gain *= 0.55;
    changes.push("灵气不足，这一日只进了一半");
  }
  const before = world.xiuwei;
  world.xiuwei = clamp(world.xiuwei + gain, 0, 100);
  if (world.xiuwei >= 100 && before < 100) changes.push("火候已满，可以尝试突破");
  else if (world.xiuwei > before) changes.push("修为有所积累");
  if (rng() > 0.45) {
    const nextDao = clamp(save.stats.dao + 1, 0, CAP.dao);
    if (nextDao !== save.stats.dao) {
      save.stats.dao = nextDao;
      changes.push("道行 +1");
    }
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
  chance -= (save.stats.demon / 100) * 0.15;
  chance = clamp(chance, 0.08, 0.92);
  spend(world, 1);
  if (rng() < chance) {
    save.stats.dao = clamp(Math.max(save.stats.dao, next.min), 0, CAP.dao);
    world.xiuwei = 0;
    save.stats.life = clamp(save.stats.life + 8, 0, CAP.life);
    world.wound = clamp(world.wound - 1, 0, 6);
    world.report = {
      title: `入${next.name}`,
      paragraphs: [
        next.line,
        usedPill ? "丹在关口上替你扛了一下，然后碎了。碎得干净。" : "没有外物。是你自己的气息把那道缝撑开的。",
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
  const heal = 7 + world.cave * 2;
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
  world.bag[recipe.out] = (world.bag[recipe.out] ?? 0) + 1;
  spend(world, 1);
  world.report = { title: recipe.name, paragraphs: [recipe.text], changes: [`${GOODS[recipe.out]} +1`] };
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
  if (!["east", "tribes", "penglai"].includes(world.place)) {
    world.report = { title: "没有集市", paragraphs: ["这里的人还不用你手里的石头说话。"], changes: [] };
    return;
  }
  if (what === "buy" && id === "herb") {
    if (world.stones < 2) return;
    world.stones -= 2;
    world.bag.herb = (world.bag.herb ?? 0) + 1;
    world.report = { title: "换草", paragraphs: ["草比故事便宜，也比故事有用。"], changes: ["灵石 -2", "灵草 +1"] };
    return;
  }
  if (what === "sell" && (id === "ore" || id === "salt") && (world.bag[id] ?? 0) > 0) {
    world.bag[id] = (world.bag[id] ?? 1) - 1;
    if ((world.bag[id] ?? 0) <= 0) delete world.bag[id];
    const gain = id === "ore" ? 3 : 2;
    world.stones += gain;
    world.report = { title: "脱手", paragraphs: ["你把东西换成以后能用的石头。石头不神圣，所以可靠。"], changes: [`${GOODS[id]} -1`, `灵石 +${gain}`] };
  }
  void save;
}

function beastAct(save: SaveData, world: RoamState, what: "feed" | "release") {
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

function combat(save: SaveData, world: RoamState, move: "strike" | "spell" | "guard" | "flee", rng: () => number) {
  const battle = world.battle;
  if (!battle) return;
  const art = world.equipped ? ARTS[world.equipped] : undefined;
  if (move === "guard") {
    battle.guard = 4 + realmIndex(save.stats.dao);
    battle.log.push("你收势，准备把下一击卸开。");
    enemyStrike(save, world);
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
    enemyStrike(save, world);
    return;
  }
  if (move === "spell") {
    const can = Boolean(art?.spell || world.spells.length);
    if (!can || world.lingqi < 4) {
      battle.log.push("法没有发出去。你只好改用更笨的办法。");
    } else {
      world.lingqi -= 4;
      const amount = Math.max(2, Math.round(powerOf(save, world) * 1.6) - battle.def);
      strikeEnemy(save, world, amount);
      if (world.phase !== "battle") return;
      enemyStrike(save, world);
      return;
    }
  }
  const amount = Math.max(1, powerOf(save, world) + Math.floor(rng() * 4) - battle.def);
  strikeEnemy(save, world, amount);
  if (world.phase !== "battle") return;
  enemyStrike(save, world);
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
  const acts: MenuAct[] = [
    { id: "cultivate", label: "闭关一日", act: { type: "cultivate" } },
    { id: "explore", label: "四处探寻", act: { type: "explore" } },
    { id: "gather", label: "采集", act: { type: "gather" } },
    { id: "rest", label: "调息疗伤", act: { type: "rest" } },
  ];
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
  if (["east", "tribes", "penglai"].includes(world.place)) {
    if (world.stones >= 2) acts.push({ id: "buy", label: "换一株灵草", act: { type: "trade", what: "buy", id: "herb" } });
    if ((world.bag.ore ?? 0) > 0) acts.push({ id: "sell-ore", label: "售出玄矿", act: { type: "trade", what: "sell", id: "ore" } });
    if ((world.bag.salt ?? 0) > 0) acts.push({ id: "sell-salt", label: "售出海盐晶", act: { type: "trade", what: "sell", id: "salt" } });
  }
  if (world.beast && (world.bag.herb ?? 0) > 0) {
    acts.push({ id: "feed", label: `喂${world.beast.name}`, act: { type: "beast", what: "feed" } });
  }
  if (world.beast) acts.push({ id: "release", label: `放${world.beast.name}离开`, act: { type: "beast", what: "release" } });
  for (const chain of continuableChains(world)) {
    acts.push({ id: `chain-${chain.id}`, label: `继续「${chain.name}」`, act: { type: "continue", chainId: chain.id } });
  }
  for (const eventId of world.notices) {
    const event = eventById(eventId);
    if (event) acts.push({ id: `notice-${eventId}`, label: `观天地异象·${event.title}`, act: { type: "notice", eventId } });
  }
  return acts;
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
    return acts;
  }
  if (world.phase === "event") {
    const event = world.eventId ? eventById(world.eventId) : null;
    if (!event) return [{ type: "choose", choiceId: "__leave" }];
    return visibleChoices(world, event).map((choice) => ({ type: "choose" as const, choiceId: choice.id }));
  }
  return menuActs(save).map((item) => item.act);
}

const LEAK = /道行\s*[+\-＋－]\s*\d|气运\s*[+\-＋－]\s*\d|心魔\s*[+\-＋－]\s*\d|仁德\s*[+\-＋－]\s*\d|杀伐\s*[+\-＋－]\s*\d|道躯\s*[+\-＋－]\s*\d/;

export function labelsLeakNumbers(labels: string[]) {
  return labels.filter((label) => LEAK.test(label));
}

export { ERAS, ROAM_PLACES, SECTS, RECIPES, GOODS, ARTS, CHAINS };
