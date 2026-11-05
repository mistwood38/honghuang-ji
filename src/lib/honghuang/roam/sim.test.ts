import assert from "node:assert/strict";
import test from "node:test";
import { fresh } from "../engine.ts";
import { readImportedSave } from "../store.ts";
import { EVENTS } from "./events.ts";
import {
  applyRoam,
  automaticMove,
  contentStats,
  farmBattle,
  labelsLeakNumbers,
  legalActs,
  MARKETS,
  menuActs,
  resolveFarmBattle,
  visibleChoices,
} from "./engine.ts";
import type { RoamAct } from "./state.ts";
import { TECHNIQUES } from "./techniques.ts";

function rngFrom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function play(seed: number, steps: number) {
  const rng = rngFrom(seed);
  let save = applyRoam(fresh(), { type: "origin", origin: (["dao", "wu", "yao", "ren"] as const)[seed % 4]!, name: "甲" }, rng);
  const seen = new Set<string>();
  for (let i = 0; i < steps; i += 1) {
    const acts = legalActs(save);
    assert.ok(acts.length > 0, `dead end at step ${i} phase ${save.world?.phase}`);
    if (save.world?.phase === "free") {
      const leaks = labelsLeakNumbers(menuActs(save).map((item) => item.label));
      assert.deepEqual(leaks, []);
    }
    if (save.world?.phase === "event" && save.world.eventId) {
      const event = EVENTS.find((item) => item.id === save.world?.eventId);
      assert.ok(event);
      const leaks = labelsLeakNumbers(visibleChoices(save.world, event).map((choice) => choice.text));
      assert.deepEqual(leaks, []);
    }
    const act = acts[Math.floor(rng() * acts.length)]!;
    save = applyRoam(save, act, rng);
    assert.ok(save.stats.life > 0);
    assert.ok(save.world);
    assert.ok(["origin", "free", "event", "battle"].includes(save.world.phase));
    if (save.world.eventId) seen.add(save.world.eventId);
  }
  return { save, seen };
}

test("content is large enough to leave the old railroad", () => {
  const stats = contentStats();
  assert.ok(stats.events >= 80, String(stats.events));
  assert.ok(stats.chains >= 20);
  assert.equal(stats.uniqueProse, stats.events);
  for (const event of EVENTS) {
    assert.ok(event.prose.length > 0);
    assert.ok(event.choices.length > 0);
    assert.ok(!labelsLeakNumbers(event.choices.map((choice) => choice.text)).length);
  }
});

test("a life can continue for dozens of days without an ending", () => {
  const { save } = play(7, 60);
  assert.ok(save.world);
  assert.ok(save.world.day > 12);
  assert.equal(save.sceneId, "awaken");
  assert.notEqual(save.world.phase, "origin");
});

test("many seeds stay playable", () => {
  for (let seed = 1; seed <= 24; seed += 1) play(seed, 120);
});

test("the same meeting can split, and a delayed debt comes back", () => {
  const rng = rngFrom(3);
  const save = applyRoam(fresh(), { type: "origin", origin: "wu", name: "刑" }, rng);
  save.world!.phase = "event";
  save.world!.eventId = "stone-1";
  save.world!.place = "buzhou";
  const took = applyRoam(save, { type: "choose", choiceId: "take" }, rng);
  const buried = applyRoam(save, { type: "choose", choiceId: "bury" }, rng);
  assert.ok(took.world?.karma.includes("took-stone"));
  assert.ok(buried.items.includes("buzhou-stone") || buried.world?.karma.includes("buried-stone"));
  assert.ok(buried.world?.karma.includes("buried-stone"));
  assert.equal(took.world?.quests.stone?.stage, 1);
  const next = applyRoam(took, { type: "continue", chainId: "stone" }, rng);
  assert.equal(next.world?.eventId, "stone-2");
  assert.equal(next.world?.phase, "event");

  let owed = applyRoam(fresh(), { type: "origin", origin: "ren", name: "禾" }, rng);
  owed.world!.phase = "event";
  owed.world!.eventId = "debt-1";
  owed.world!.place = "tribes";
  owed = applyRoam(owed, { type: "choose", choiceId: "borrow" }, rng);
  owed.world!.phase = "event";
  owed.world!.eventId = "debt-2";
  owed = applyRoam(owed, { type: "choose", choiceId: "delay-pay" }, rng);
  assert.ok(owed.world!.delayed.some((item) => item.event === "delay-collector"));
  owed.world!.day = owed.world!.delayed[0]!.due;
  const due = applyRoam(owed, { type: "cultivate" }, rng);
  assert.equal(due.world?.eventId, "delay-collector");
  assert.equal(due.world?.phase, "event");
});

test("breakthrough can fail and succeed without ending the life", () => {
  const fail = rngFrom(1);
  const save = applyRoam(fresh(), { type: "origin", origin: "dao", name: "玄" }, fail);
  save.world!.xiuwei = 100;
  const failed = applyRoam(save, { type: "breakthrough", pill: false }, () => 0.99);
  assert.ok(failed.world);
  assert.equal(failed.world.phase, "free");
  assert.ok(failed.stats.life > 0);
  assert.ok(failed.world.xiuwei < 100);
  const succeeded = applyRoam(save, { type: "breakthrough", pill: false }, () => 0);
  assert.ok(succeeded.stats.dao > save.stats.dao);
  assert.equal(succeeded.world?.xiuwei, 0);
});

test("old v1 saves still load and can be adopted", () => {
  const save = readImportedSave(
    JSON.stringify({
      version: 1,
      screen: "play",
      started: true,
      name: "玄澄",
      origin: "dao",
      sceneId: "kunlun",
      stats: { dao: 40, qi: 22, kill: 2, virtue: 8, demon: 0, life: 88 },
      items: ["purple-qi"],
      flags: ["heard-hongjun"],
      log: [],
      seen: ["kunlun"],
      pastLives: [],
      novelIndex: 1,
      sound: true,
    }),
  );
  assert.equal(save.world, null);
  assert.equal(save.sceneId, "kunlun");
  const adopted = applyRoam(save, { type: "cultivate" });
  assert.ok(adopted.world);
  assert.equal(adopted.stats.dao >= 40, true);
});

test("gather, alchemy, sect and cave are real actions", () => {
  let save = applyRoam(fresh(), { type: "origin", origin: "ren", name: "禾" }, rngFrom(4));
  save = applyRoam(save, { type: "travel", place: "wahuan" }, rngFrom(5));
  save = applyRoam(save, { type: "gather" }, () => 0.1);
  save = applyRoam(save, { type: "gather" }, () => 0.1);
  save = applyRoam(save, { type: "travel", place: "earth" }, rngFrom(6));
  save = applyRoam(save, { type: "gather" }, () => 0.1);
  save.world!.bag.herb = 3;
  save.world!.bag.dew = 1;
  save = applyRoam(save, { type: "alchemy", recipe: "qi" });
  assert.ok((save.world?.bag["pill-qi"] ?? 0) >= 1);
  save.world!.stones = 20;
  const caved = applyRoam(save, { type: "cave", what: "upgrade" });
  assert.equal(caved.world?.cave, 1);
  const joined = applyRoam(applyRoam(caved, { type: "travel", place: "tribes" }), { type: "sect", what: "join" });
  assert.equal(joined.world?.sect, "hearth");
});

test("seclusion is several watches, and a garden can be harvested later", () => {
  let save = applyRoam(fresh(), { type: "origin", origin: "dao", name: "玄" }, rngFrom(2));
  const day = save.world!.day;
  save = applyRoam(save, { type: "retreat", what: "enter" });
  assert.equal(save.world?.retreat?.watch, 0);
  assert.ok(save.world!.day > day);
  for (let i = 0; i < 4; i += 1) save = applyRoam(save, { type: "retreat", what: "watch" });
  assert.equal(save.world?.retreat, null);
  assert.ok((save.world?.xiuwei ?? 0) > 0);
  assert.deepEqual(
    labelsLeakNumbers(menuActs(save).map((item) => item.label)),
    [],
  );
  save.world!.bag.herb = 1;
  save.world!.cave = 1;
  save = applyRoam(save, { type: "plot", what: "plant" });
  assert.ok(save.world?.plot);
  assert.equal(save.world?.bag.herb ?? 0, 0);
  save.world!.day = save.world!.plot!.ready;
  save = applyRoam(save, { type: "plot", what: "harvest" });
  assert.ok((save.world?.bag.herb ?? 0) >= 2);
  assert.equal(save.world?.plot, null);
  save = applyRoam(save, { type: "travel", place: "kunlun" });
  save.world!.stones = 4;
  save = applyRoam(save, { type: "trade", what: "buy", id: "dew" });
  assert.ok((save.world?.bag.dew ?? 0) >= 1);
  assert.ok((save.world?.stones ?? 0) < 4);
});

test("farming a map fights by itself and banks the time you were away", () => {
  let save = applyRoam(fresh(), { type: "origin", origin: "dao", name: "玄" }, rngFrom(8));
  assert.equal(save.world?.farm, "earth");
  const start = save.world!.lastTick;
  save = applyRoam(save, { type: "idle", what: "fight", now: start + 2500 }, () => 0.1);
  assert.ok((save.world?.farmLog.length ?? 0) >= 2);
  assert.ok((save.world?.xiuwei ?? 0) > 0);
  const before = save.world!.xiuwei;
  const away = applyRoam(save, { type: "idle", what: "fight", now: start + 2500 + 2_500 * 40 }, () => 0.1);
  assert.ok((away.world?.haul?.breaths ?? 0) >= 40);
  assert.equal(away.world?.xiuwei, before);
  const claimed = applyRoam(away, { type: "idle", what: "claim", now: start + 2500 + 2_500 * 40 });
  assert.ok((claimed.world?.xiuwei ?? 0) > before);
});

test("idle keeps cultivating while time passes and the reward stays hidden until collected", () => {
  let save = applyRoam(fresh(), { type: "origin", origin: "dao", name: "玄" }, rngFrom(8));
  const start = 1_700_000_000_000;
  save = applyRoam(save, { type: "idle", what: "sit", now: start });
  assert.equal(save.world?.idle?.kind, "sit");
  assert.equal(save.world?.xiuwei ?? 0, 0);
  assert.deepEqual(
    labelsLeakNumbers(["在此打坐挂机", "收起这段修行"]),
    [],
  );
  const later = applyRoam(save, { type: "idle", what: "sync", now: start + 20_000 * 30 });
  assert.ok((later.world?.haul?.breaths ?? 0) >= 30);
  assert.equal(later.world?.xiuwei ?? 0, 0);
  const claimed = applyRoam(later, { type: "idle", what: "claim", now: start + 20_000 * 30 });
  assert.ok((claimed.world?.xiuwei ?? 0) > 0);
  assert.equal(claimed.world?.haul, null);
  assert.ok(claimed.world?.report?.changes.length);
});

test("menu labels never preview exact gains", () => {
  const { save } = play(11, 15);
  const labels = menuActs(save).map((item) => item.label);
  assert.deepEqual(labelsLeakNumbers(labels), []);
  const acts: RoamAct[] = legalActs(save);
  assert.ok(acts.length > 0);
});

test("farm ticks do not award fights twice inside 2.5 seconds", () => {
  const start = 1_700_000_000_000;
  const save = applyRoam(fresh(), { type: "origin", origin: "dao", name: "玄" }, () => 0.1);
  save.world!.lastTick = start;
  for (const elapsed of [0, 0, 1, 1000, 2499]) {
    const early = applyRoam(save, { type: "idle", what: "fight", now: start + elapsed }, () => 0.5);
    assert.deepEqual(early, save);
  }
  const fought = applyRoam(save, { type: "idle", what: "fight", now: start + 2500 }, () => 0.5);
  assert.ok(fought.world!.xiuwei > save.world!.xiuwei);
  const repeated = applyRoam(fought, { type: "idle", what: "fight", now: start + 2500 }, () => 0.5);
  assert.deepEqual(repeated, fought);
});

test("idle clocks recover from a clock rollback without awarding the missing time", () => {
  const start = 1_700_000_000_000;
  const save = applyRoam(fresh(), { type: "origin", origin: "dao", name: "玄" }, () => 0.1);
  save.world!.lastTick = start;
  for (const what of ["fight", "sync"] as const) {
    const rolledBack = applyRoam(save, { type: "idle", what, now: start - 3_600_000 }, () => 0.5);
    assert.equal(rolledBack.world!.lastTick, start - 3_600_000);
    assert.equal(rolledBack.world!.xiuwei, save.world!.xiuwei);
    assert.equal(rolledBack.world!.haul, null);
  }
});

test("stopped farming stays stopped through ticks, reload and offline sync", () => {
  const start = 1_700_000_000_000;
  let save = applyRoam(fresh(), { type: "origin", origin: "dao", name: "玄" }, () => 0.5);
  save.world!.lastTick = start;
  save = applyRoam(save, { type: "idle", what: "stop", now: start });
  save = readImportedSave(JSON.stringify(save));
  const stopped = structuredClone(save);
  for (const now of [start + 2500, start + 10_000, start + 600_000]) {
    save = applyRoam(save, { type: "idle", what: "fight", now }, () => 0.5);
    save = applyRoam(save, { type: "idle", what: "sync", now }, () => 0.5);
    assert.deepEqual(save, stopped);
  }
});

test("farming ticks do not turn seated cultivation into a fight", () => {
  const start = 1_700_000_000_000;
  const save = applyRoam(applyRoam(fresh(), { type: "origin", origin: "dao", name: "玄" }), {
    type: "idle",
    what: "sit",
    now: start,
  });
  const ticked = applyRoam(save, { type: "idle", what: "fight", now: start + 2500 }, () => 0.5);
  assert.deepEqual(ticked, save);
});

test("manual travel pauses farming and resuming uses the new place", () => {
  const start = 1_700_000_000_000;
  let save = applyRoam(fresh(), { type: "origin", origin: "dao", name: "玄" }, () => 0.5);
  save.world!.lastTick = start;
  save = applyRoam(save, { type: "travel", place: "tribes" }, () => 0.5);
  assert.equal(save.world!.place, "tribes");
  assert.equal(save.world!.idle, null);
  const arrived = structuredClone(save);
  save = applyRoam(save, { type: "idle", what: "fight", now: start + 2500 }, () => 0.5);
  assert.deepEqual(save, arrived);
  save = applyRoam(save, { type: "idle", what: "wander", now: start + 5000 }, () => 0.5);
  assert.equal(save.world!.farm, "tribes");
  assert.deepEqual(save.world!.idle, { kind: "wander" });
});

test("market labels disclose the same prices that transactions settle", () => {
  for (const [place, market] of Object.entries(MARKETS)) {
    let save = applyRoam(fresh(), { type: "origin", origin: "dao", name: "玄" });
    save.world!.place = place as NonNullable<typeof save.world>["place"];
    save.world!.stones = 100;
    for (const offer of market.buy) {
      const item = menuActs(save).find((item) => item.id === `buy-${offer.id}`)!;
      assert.ok(item.label.includes(`${offer.cost} 灵石`), item.label);
      const before = save.world!.stones;
      save = applyRoam(save, item.act);
      assert.equal(save.world!.stones, before - offer.cost);
    }
    for (const offer of market.sell) {
      save.world!.bag[offer.id] = 1;
      const item = menuActs(save).find((item) => item.id === `sell-${offer.id}`)!;
      assert.ok(item.label.includes(`${offer.pay} 灵石`), item.label);
      const before = save.world!.stones;
      save = applyRoam(save, item.act);
      assert.equal(save.world!.stones, before + offer.pay);
      assert.equal(save.world!.bag[offer.id] ?? 0, 0);
    }
  }
});

function cultivationSave() {
  const save = applyRoam(fresh(), { type: "origin", origin: "dao", name: "玄" }, () => 0.5);
  save.world!.idle = null;
  save.world!.arts = ["qingjing", "bone", "form", "yuxu"];
  return save;
}

test("farming spends actual technique qi and leaves the current story in place", () => {
  const save = applyRoam(fresh(), { type: "origin", origin: "yao", name: "玄" });
  save.world!.lastTick = 1_700_000_000_000;
  const after = applyRoam(save, { type: "idle", what: "fight", now: save.world!.lastTick + 2500 }, () => 0.5);
  assert.ok(after.world!.lingqi < save.world!.lingqi, "automatic battle must actually spend technique qi");
  assert.match(after.world!.farmLog.at(-1)!, /借影缚形/);
  assert.equal(after.world!.day, save.world!.day);
  assert.deepEqual(after.world!.report, save.world!.report);
  assert.equal(after.world!.battle, null);
});

test("offline sync and farm catch-up use one settlement clock and rule set", () => {
  const save = applyRoam(fresh(), { type: "origin", origin: "yao", name: "玄" });
  save.world!.lastTick = 1_700_000_000_000;
  const now = save.world!.lastTick + 60_000;
  const sync = applyRoam(save, { type: "idle", what: "sync", now }, () => 0.5);
  const fight = applyRoam(save, { type: "idle", what: "fight", now }, () => 0.5);
  assert.deepEqual(sync, fight);
  assert.deepEqual(applyRoam(sync, { type: "idle", what: "fight", now }, () => 0.5), sync);
});

test("changing farming region settles the previous region before moving", () => {
  const save = applyRoam(fresh(), { type: "origin", origin: "dao", name: "玄" });
  save.world!.lastTick = 1_700_000_000_000;
  const after = applyRoam(save, { type: "idle", what: "farm", place: "tribes", now: save.world!.lastTick + 60_000 }, () => 0.5);
  assert.ok(after.world!.haul && after.world!.haul.breaths > 0, "elapsed work cannot disappear on region change");
  assert.equal(after.world!.farm, "tribes");
});

test("automatic fights replay exactly through manual combat for every art and plan", () => {
  for (const id of Object.keys(TECHNIQUES)) for (const plan of ["balanced", "assault", "reserve"] as const) {
    const save = cultivationSave();
    save.world!.arts = [id];
    save.world!.equipped = id;
    save.world!.battlePlan = plan;
    save.world!.farm = "kunlun";
    save.stats.life = 47;
    const original = structuredClone(save);
    const automatic = resolveFarmBattle(save, rngFrom(91));
    assert.deepEqual(save, original, "forecast must not mutate input");
    let manual = structuredClone(save);
    manual.world!.phase = "battle";
    manual.world!.battle = farmBattle("kunlun");
    const rng = rngFrom(91);
    let turns = 0;
    while (manual.world!.phase === "battle" && turns < 8) {
      manual = applyRoam(manual, { type: "combat", move: automaticMove(manual) }, rng);
      turns++;
    }
    assert.equal(automatic.moves.length, turns, `${id}/${plan}`);
    assert.equal(automatic.life, manual.stats.life, `${id}/${plan} life`);
    assert.equal(automatic.lingqi, manual.world!.lingqi, `${id}/${plan} qi`);
    assert.equal(automatic.wound, manual.world!.wound, `${id}/${plan} wound`);
    assert.equal(automatic.win, manual.world!.report?.title === "这一场停了");
  }
});

test("online rounds and offline catch-up settle identical combat and loot", () => {
  const save = applyRoam(fresh(), { type: "origin", origin: "yao", name: "玄" });
  const start = 1_700_000_000_000;
  save.world!.lastTick = start;
  let online = structuredClone(save);
  const rng = rngFrom(24);
  for (let i = 1; i <= 120; i++) online = applyRoam(online, { type: "idle", what: "fight", now: start + i * 2500 }, rng);
  const banked = applyRoam(save, { type: "idle", what: "sync", now: start + 120 * 2500 }, rngFrom(24));
  const offline = applyRoam(banked, { type: "idle", what: "claim", now: start + 120 * 2500 });
  assert.deepEqual(online.stats, offline.stats);
  for (const field of ["bag", "stones", "gear", "wound", "lingqi"] as const) assert.deepEqual(online.world![field], offline.world![field], field);
  assert.ok(Math.abs(online.world!.xiuwei - offline.world!.xiuwei) < 1e-8);
  assert.ok(Math.abs(online.world!.spare - offline.world!.spare) < 1e-8);
  const repeated = applyRoam(offline, { type: "idle", what: "claim", now: start + 120 * 2500 });
  assert.deepEqual(repeated.stats, offline.stats);
  assert.deepEqual(repeated.world!.bag, offline.world!.bag);
  assert.equal(repeated.world!.stones, offline.world!.stones);
  assert.equal(repeated.world!.spare, offline.world!.spare);
});

test("automatic plans migrate safely and make different resource decisions", () => {
  const legacy = cultivationSave();
  legacy.items = ["purple-qi", "buzhou-stone"];
  legacy.flags = ["heard-hongjun"];
  const raw = JSON.parse(JSON.stringify(legacy));
  delete raw.world.battlePlan;
  const migrated = readImportedSave(JSON.stringify(raw));
  assert.equal(migrated.world!.battlePlan, "balanced");
  assert.deepEqual(migrated.items, legacy.items);
  assert.deepEqual(migrated.flags, legacy.flags);
  migrated.world!.phase = "battle";
  migrated.world!.battle = farmBattle("kunlun");
  migrated.world!.equipped = "form";
  migrated.world!.battlePlan = "reserve";
  assert.equal(automaticMove(migrated), "strike");
  migrated.world!.battlePlan = "assault";
  assert.equal(automaticMove(migrated), "technique");
  const imported = readImportedSave(JSON.stringify(migrated));
  assert.equal(imported.world!.battlePlan, "assault");
  raw.world.battlePlan = "constructor";
  assert.equal(readImportedSave(JSON.stringify(raw)).world!.battlePlan, "balanced");
});

test("offline storage cap and stopping cannot erase or duplicate unclaimed rounds", () => {
  const save = applyRoam(fresh(), { type: "origin", origin: "dao", name: "玄" });
  const start = 1_700_000_000_000;
  save.world!.lastTick = start;
  const banked = applyRoam(save, { type: "idle", what: "sync", now: start + 86_400_000 }, () => .5);
  assert.equal(banked.world!.haul?.breaths, 480);
  const capped = applyRoam(banked, { type: "idle", what: "sync", now: start + 2 * 86_400_000 }, () => .5);
  assert.deepEqual(capped.world!.haul, banked.world!.haul);
  assert.deepEqual(capped.stats, banked.stats);
  const stopped = applyRoam(capped, { type: "idle", what: "stop", now: start + 2 * 86_400_000 }, () => .5);
  assert.equal(stopped.world!.haul, null);
  assert.equal(stopped.world!.idle, null);
  assert.ok(stopped.world!.xiuwei > save.world!.xiuwei);
  assert.ok(stopped.world!.report!.changes.length > 0, "collection result remains readable");
});

test("rifts require a real battle and award their original loot only after victory", () => {
  let save = cultivationSave();
  save.stats.dao = 300;
  const before = structuredClone(save);
  save = applyRoam(save, { type: "idle", what: "rift" }, () => .5);
  assert.equal(save.world!.phase, "battle");
  assert.equal(save.world!.riftLeft, before.world!.riftLeft - 1);
  assert.equal(save.world!.stones, before.world!.stones);
  assert.equal(save.world!.idle, null);
  for (let i = 0; i < 8 && save.world!.phase === "battle"; i++) save = applyRoam(save, { type: "combat", move: "strike" }, () => .5);
  assert.equal(save.world!.stones, before.world!.stones + 4);
  assert.equal(save.world!.bag.herb, (before.world!.bag.herb ?? 0) + 3);
  const again = applyRoam(save, { type: "combat", move: "strike" }, () => .5);
  assert.deepEqual(again, save);
});

function practiceBattle(id: string) {
  const save = cultivationSave();
  save.world!.equipped = id;
  save.world!.phase = "battle";
  save.world!.battle = { id: "stone", name: "守石者", hp: 100, max: 100, atk: 10, def: 0, guard: 0, round: 1, log: [], win: [], lose: [], winText: ["胜"], loseText: ["退"] };
  save.stats.life = 50;
  return save;
}

test("learned main arts can be switched, retained on import, and change cultivation", () => {
  const save = cultivationSave();
  const changed = applyRoam(save, { type: "equip-art", artId: "bone" });
  assert.equal(changed.world!.equipped, "bone");
  assert.deepEqual(changed.world!.arts, save.world!.arts);
  assert.equal(readImportedSave(JSON.stringify(changed)).world!.equipped, "bone");
  const quiet = applyRoam(save, { type: "cultivate" }, () => 0.5);
  const bone = applyRoam(changed, { type: "cultivate" }, () => 0.5);
  assert.ok(quiet.world!.xiuwei > bone.world!.xiuwei);
  const quietBattle = applyRoam(practiceBattle("qingjing"), { type: "combat", move: "strike" }, () => 0.5);
  const boneBattle = applyRoam(practiceBattle("bone"), { type: "combat", move: "strike" }, () => 0.5);
  assert.ok(boneBattle.world!.battle!.hp < quietBattle.world!.battle!.hp);
});

test("unlearned arts and mid-battle or seclusion switches are rejected", () => {
  const save = cultivationSave();
  for (const artId of ["zhuxian", "constructor", "absent"]) assert.deepEqual(applyRoam(save, { type: "equip-art", artId }), save);
  const battle = practiceBattle("qingjing");
  assert.deepEqual(applyRoam(battle, { type: "equip-art", artId: "bone" }), battle);
  save.world!.retreat = { watch: 1 };
  assert.deepEqual(applyRoam(save, { type: "equip-art", artId: "bone" }), save);
});

test("healing, guarding and binding techniques have distinct combat consequences", () => {
  const normal = applyRoam(practiceBattle("qingjing"), { type: "combat", move: "strike" }, () => 0.5);
  const healed = applyRoam(practiceBattle("qingjing"), { type: "combat", move: "technique" });
  assert.ok(healed.stats.life > normal.stats.life);
  assert.equal(healed.world!.battle!.hp, 100);
  const guarded = applyRoam(practiceBattle("yuxu"), { type: "combat", move: "technique" });
  assert.equal(guarded.stats.life, 49);
  assert.ok(guarded.world!.battle!.hp < 100);
  assert.equal(guarded.world!.battle!.guard, 0);
  const bound = applyRoam(practiceBattle("form"), { type: "combat", move: "technique" });
  assert.equal(bound.stats.life, 50);
  assert.equal(bound.world!.battle!.round, 2);
  assert.equal(bound.world!.lingqi, practiceBattle("form").world!.lingqi - TECHNIQUES.form!.cost);
});

test("techniques cannot spend missing spirit or act after a battle ends", () => {
  const save = practiceBattle("form");
  save.world!.lingqi = TECHNIQUES.form!.cost - 1;
  assert.deepEqual(applyRoam(save, { type: "combat", move: "technique" }), save);
  const finished = cultivationSave();
  assert.deepEqual(applyRoam(finished, { type: "combat", move: "technique" }), finished);
});

test("a sect transmission can be learned, equipped and saved without losing history", () => {
  let save = cultivationSave();
  save.world!.arts = ["qingjing"];
  save.world!.place = "kunlun";
  save = applyRoam(save, { type: "sect", what: "join" });
  for (let i = 0; i < 4; i++) save = applyRoam(save, { type: "sect", what: "task" }, () => 0.5);
  assert.ok(save.world!.contrib >= 8);
  save = applyRoam(save, { type: "sect", what: "learn" });
  assert.ok(save.world!.arts.includes("yuxu"));
  save = applyRoam(save, { type: "equip-art", artId: "yuxu" });
  const restored = readImportedSave(JSON.stringify(save));
  assert.equal(restored.world!.equipped, "yuxu");
  assert.deepEqual(restored.items, save.items);
  assert.deepEqual(restored.flags, save.flags);
  assert.deepEqual(restored.world!.quests, save.world!.quests);
  const forged = structuredClone(save);
  forged.world!.equipped = "zhuxian";
  assert.equal(readImportedSave(JSON.stringify(forged)).world!.equipped, "qingjing");
});
