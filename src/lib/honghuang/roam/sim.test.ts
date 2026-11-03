import assert from "node:assert/strict";
import test from "node:test";
import { fresh } from "../engine.ts";
import { readImportedSave } from "../store.ts";
import { EVENTS } from "./events.ts";
import {
  applyRoam,
  contentStats,
  labelsLeakNumbers,
  legalActs,
  menuActs,
  visibleChoices,
} from "./engine.ts";
import type { RoamAct } from "./state.ts";

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
  for (let seed = 1; seed <= 24; seed += 1) play(seed, 40);
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
