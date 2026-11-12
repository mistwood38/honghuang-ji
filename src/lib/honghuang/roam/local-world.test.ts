import assert from "node:assert/strict";
import test from "node:test";
import { fresh } from "../engine.ts";
import { applyRoam, normalizeRoam } from "./engine.ts";
import {
  LOCAL_SITES,
  PEOPLE,
  advanceLiving,
  localOptions,
  normalizeLiving,
  regionCondition,
  routeTo,
  siteState,
} from "./local-world.ts";
import type { Origin, SaveData } from "../types.ts";
import type { LocalAct, PlaceId } from "./state.ts";

const rng = () => 0.6;
function fixture(origin: Origin = "dao") {
  const save = applyRoam(fresh(), { type: "origin", origin, name: "行者" }, rng);
  save.world!.idle = null;
  return save;
}
function local(save: SaveData, what: Extract<LocalAct, { type: "local" }>["what"], kind = "ruin") {
  return applyRoam(save, { type: "local", what, site: `${save.world!.place}-${kind}` }, rng);
}
function travelTo(save: SaveData, target: PlaceId): SaveData {
  for (let i = 0; i < 13 && save.world!.place !== target; i++) {
    const next = routeTo(save.world!, target)[0];
    assert.ok(next);
    save = applyRoam(save, { type: "travel", place: next }, rng);
    assert.equal(save.world!.phase, "free");
  }
  assert.equal(save.world!.place, target);
  return save;
}

test("local world offers all three object layers at all thirteen places", () => {
  assert.equal(LOCAL_SITES.length, 39);
  assert.equal(new Set(LOCAL_SITES.map((s) => s.id)).size, 39);
  const save = fixture();
  const before = save.world!.day;
  const discovered = local(save, "survey");
  assert.equal(discovered.world!.day, before);
  assert.ok(siteState(discovered.world!, "earth-ruin").visited);
  assert.equal(
    localOptions(discovered).filter((o) => o.act.type === "local" && o.act.site === "earth-ruin")
      .length,
    3,
  );
  assert.equal(siteState(save.world!, "earth-ruin").visited, false, "input save immutable");
});

test("four origins pay distinct real costs and repairs mature later without duplicate rewards", () => {
  for (const origin of ["dao", "wu", "yao", "ren"] as const) {
    let save = fixture(origin);
    save.world!.bag.herb = 2;
    save = local(save, "survey");
    const previous = structuredClone(save);
    save = local(save, "heritage");
    const state = siteState(save.world!, "earth-ruin");
    assert.equal(state.state, "mending", origin);
    assert.equal(save.world!.day - previous.world!.day, origin === "yao" ? 2 : 1);
    if (origin === "dao") assert.equal(save.world!.lingqi, previous.world!.lingqi - 4);
    if (origin === "wu") assert.equal(save.stats.life, previous.stats.life - 8);
    if (origin === "ren") assert.equal(save.world!.bag.herb, undefined);
    assert.deepEqual(local(save, "heritage"), save, "repeat action cannot repay or advance day");
    const due = state.ready;
    while (save.world!.day < due) save = applyRoam(save, { type: "rest" }, rng);
    assert.equal(siteState(save.world!, "earth-ruin").state, "restored");
    assert.equal(save.world!.living.regions.earth!.prosperity, 1);
    assert.ok(save.world!.karma.includes("restored-earth-ruin"));
    const stateBefore = structuredClone(save.world!.living);
    advanceLiving(save.world!);
    assert.deepEqual(save.world!.living, stateBefore);
  }
});

test("distant objects, missing costs and battle-phase actions cannot be forged", () => {
  let save = local(fixture("ren"), "survey");
  for (const act of [
    { type: "local", what: "gather", site: "east-source" },
    { type: "local", what: "heritage", site: "earth-ruin" },
    { type: "local", what: "restore", site: "earth-ruin" },
    { type: "person", what: "finish", id: "qingxing" },
    { type: "person", what: "accept", id: "wuwei" },
  ] as LocalAct[])
    assert.deepEqual(applyRoam(save, act, rng), save);
  save = applyRoam(save, { type: "idle", what: "rift" }, rng);
  const after = local(save, "strip");
  assert.deepEqual(after, save);
});

test("depletion, repair and care change actual gathering and recovery", () => {
  let save = local(fixture(), "survey");
  save = local(save, "strip");
  assert.ok(save.world!.karma.includes("stripped-earth-ruin"));
  assert.equal(save.world!.living.regions.earth!.strain, 2);
  save = local(save, "survey", "source");
  save = local(save, "gather", "source");
  assert.equal(regionCondition(save.world!), "地脉疲敝");
  const bag = structuredClone(save.world!.bag),
    day = save.world!.day;
  save = local(save, "gather", "source");
  assert.deepEqual(save.world!.bag, bag);
  assert.equal(save.world!.day, day);
  save = local(save, "survey", "haven");
  save.stats.life = 30;
  save = local(save, "rest", "haven");
  assert.equal(save.stats.life, 34);
  save.world!.bag.herb = 2;
  save = local(save, "tend", "haven");
  assert.equal(save.world!.living.regions.earth!.strain, 1);
  save = local(save, "rest", "haven");
  assert.equal(save.stats.life, 42);
});

test("a moving NPC can be tracked, fulfilled, thanked once and teach after a second delivery", () => {
  let save = fixture("wu");
  for (let cycle = 0; cycle < 2; cycle++) {
    const npc = save.world!.living.people.qingxing!;
    for (let i = 0; i < 6 && save.world!.place !== save.world!.living.people.qingxing!.place; i++)
      save = travelTo(save, save.world!.living.people.qingxing!.place);
    save = applyRoam(save, { type: "person", id: "qingxing", what: "accept" }, rng);
    const task = save.world!.living.errands.qingxing!;
    assert.equal(task.stage, "carrying");
    const duplicated = applyRoam(save, { type: "person", id: "qingxing", what: "accept" }, rng);
    assert.deepEqual(duplicated, save);
    // Real trip and delivery; relation/reward only comes after seeking the actor again.
    save = travelTo(save, task.destination);
    save.world!.bag.herb = 2;
    save = applyRoam(save, { type: "person", id: "qingxing", what: "deliver" }, rng);
    assert.equal(save.world!.living.errands.qingxing!.stage, "delivered");
    assert.equal(save.world!.bag.herb, undefined);
    assert.deepEqual(
      applyRoam(save, { type: "person", id: "qingxing", what: "deliver" }, rng),
      save,
    );
    while (save.world!.day < npc.nextMove) save = applyRoam(save, { type: "rest" }, rng);
    const position = save.world!.living.people.qingxing!.place;
    assert.notEqual(position, npc.place);
    for (let i = 0; i < 6 && save.world!.place !== save.world!.living.people.qingxing!.place; i++)
      save = travelTo(save, save.world!.living.people.qingxing!.place);
    const stones = save.world!.stones;
    save = applyRoam(save, { type: "person", id: "qingxing", what: "finish" }, rng);
    assert.equal(save.world!.stones, stones + 5);
    assert.equal(save.world!.living.errands.qingxing!.stage, "done");
    assert.deepEqual(
      applyRoam(save, { type: "person", id: "qingxing", what: "finish" }, rng),
      save,
    );
    for (let i = 0; i < 4; i++) save = applyRoam(save, { type: "rest" }, rng);
  }
  assert.ok(save.world!.arts.includes("qingjing"));
  assert.equal(save.world!.relations.qingxing, 8);
});

test("old saves retain character, treasures and history while the new world starts at the saved day", () => {
  const save = fixture();
  save.items = ["chaos-qi", "purple-qi"];
  save.flags = ["old-flag"];
  save.world!.day = 180;
  save.world!.karma = ["old-karma"];
  save.world!.quests = { old: { stage: 2, status: "done" } };
  const raw = { ...save.world, living: undefined };
  const world = normalizeRoam(raw)!;
  assert.equal(world.living.lastDay, 180);
  assert.equal(world.living.people.qingxing!.nextMove, 186);
  assert.equal(normalizeRoam({ ...raw, day: Infinity })!.day, 1);
  assert.deepEqual(world.karma, ["old-karma"]);
  assert.deepEqual(world.quests, save.world!.quests);
  const restored = { ...save, world };
  const after = local(restored, "survey");
  assert.deepEqual(after.items, save.items);
  assert.deepEqual(after.flags, save.flags);
  assert.deepEqual(normalizeRoam(after.world), after.world);
  const invalid = normalizeLiving(
    {
      sites: { "earth-ruin": { ready: Infinity, state: "oops" } },
      regions: { earth: { prosperity: Infinity, strain: 999 } },
      people: { qingxing: { place: "unknown", nextMove: NaN } },
    },
    20,
  );
  assert.equal(invalid.regions.earth!.strain, 4);
  assert.equal(invalid.regions.earth!.prosperity, 0);
  assert.equal(invalid.people.qingxing!.place, "earth");
  assert.equal(invalid.people.qingxing!.nextMove, 26);
});

test("idle ticks and sync do not move inhabitants or replace the reading result", () => {
  let save = local(fixture(), "survey");
  save = applyRoam(save, { type: "idle", what: "wander", now: 1_000_000 }, rng);
  const result = structuredClone(save.world!.report),
    living = structuredClone(save.world!.living);
  for (let i = 1; i <= 120; i++)
    save = applyRoam(save, { type: "idle", what: "fight", now: 1_000_000 + i * 2500 }, rng);
  assert.deepEqual(save.world!.report, result);
  assert.deepEqual(save.world!.living, living);
});

test("a hundred varied local actions remain bounded, serializable and playable", () => {
  for (const origin of ["dao", "wu", "yao", "ren"] as const) {
    let save = fixture(origin);
    for (let turn = 0; turn < 120; turn++) {
      const options = localOptions(save).filter((o) => !o.disabled);
      assert.ok(options.length);
      save = applyRoam(save, options[(turn * 7) % options.length]!.act, rng);
      if (turn % 5 === 0) save = applyRoam(save, { type: "rest" }, rng);
      const migrated = normalizeRoam(JSON.parse(JSON.stringify(save.world)))!;
      assert.deepEqual(migrated, save.world);
      assert.ok(save.stats.life > 0);
      assert.ok(save.world!.lingqi >= 0);
      assert.ok(save.world!.living.news.length <= 16);
      for (const p of PEOPLE) assert.ok(p.route.includes(save.world!.living.people[p.id]!.place));
    }
  }
});

test("elapsed automatic fights cannot make a previously affordable local action overspend", () => {
  let save = local(fixture(), "survey");
  save.stats.life = 40;
  save.world!.lingqi = 4;
  save.world!.idle = { kind: "wander" };
  save.world!.lastTick = Date.now() - 3000;
  save = local(save, "heritage");
  assert.ok(save.world!.lingqi >= 0);
});

test("prepared techniques migrate safely and cannot duplicate the main art", () => {
  const save = fixture();
  save.world!.arts.push("bone", "form");
  let next = applyRoam(save, { type: "prepare-art", slot: 0, artId: "bone" }, rng);
  next = applyRoam(next, { type: "prepare-art", slot: 1, artId: "form" }, rng);
  assert.deepEqual(next.world!.prepared, ["bone", "form"]);
  assert.deepEqual(applyRoam(next, { type: "prepare-art", slot: 1, artId: "bone" }, rng), next);
  assert.deepEqual(applyRoam(next, { type: "prepare-art", slot: 0, artId: "zhuxian" }, rng), next);
  next = applyRoam(next, { type: "equip-art", artId: "bone" }, rng);
  assert.deepEqual(next.world!.prepared, [null, "form"]);
  assert.deepEqual(normalizeRoam({ ...next.world, prepared: ["form", "form"] })!.prepared, [
    "form",
    null,
  ]);
  assert.deepEqual(normalizeRoam({ ...next.world, prepared: undefined })!.prepared, [null, null]);
});

test("prepared spells really affect a turn and changing loadout during combat is refused", () => {
  let save = fixture("wu");
  save.world!.arts.push("form");
  save = applyRoam(save, { type: "prepare-art", slot: 0, artId: "form" }, rng);
  save = applyRoam(save, { type: "idle", what: "rift" }, rng);
  const life = save.stats.life,
    qi = save.world!.lingqi,
    round = save.world!.battle!.round;
  assert.deepEqual(applyRoam(save, { type: "prepare-art", slot: 0, artId: null }, rng), save);
  assert.deepEqual(
    applyRoam(save, { type: "combat", move: "technique", artId: "zhuxian" }, rng),
    save,
  );
  save = applyRoam(save, { type: "combat", move: "technique", artId: "form" }, rng);
  assert.equal(save.world!.lingqi, qi - 6);
  assert.equal(save.stats.life, life, "bind prevents the counterattack");
  assert.equal(save.world!.battle!.round, round + 1);
  assert.ok(save.world!.battle!.log.some((line) => line.includes("借影缚形")));
});

test("automatic and manual turns agree with all three prepared battle plans", async () => {
  const { automaticAction, farmBattle, resolveFarmBattle } = await import("./engine.ts");
  for (const plan of ["balanced", "assault", "reserve"] as const) {
    let save = fixture("wu");
    save.world!.arts.push("qingjing", "zhuxian");
    save = applyRoam(save, { type: "prepare-art", slot: 0, artId: "qingjing" }, rng);
    save = applyRoam(save, { type: "prepare-art", slot: 1, artId: "zhuxian" }, rng);
    save.world!.battlePlan = plan;
    save.world!.lingqi = 40;
    save.stats.life = 40;
    const auto = resolveFarmBattle(save, rng);
    let manual = structuredClone(save);
    manual.world!.phase = "battle";
    manual.world!.battle = farmBattle("earth");
    for (let step = 0; step < 8 && manual.world!.phase === "battle"; step++)
      manual = applyRoam(manual, automaticAction(manual), rng);
    assert.equal(manual.stats.life, auto.life, plan);
    assert.equal(manual.world!.lingqi, auto.lingqi, plan);
    assert.equal(manual.world!.wound, auto.wound, plan);
    assert.ok(auto.moves.includes("息归一元"), "automatic combat uses prepared healing");
  }
});

test("claiming several game days keeps repairs and NPC movement in chronological order", () => {
  const world = fixture().world!;
  world.living.sites["kunlun-ruin"] = {
    visited: true,
    state: "mending",
    ready: 8,
    cooldown: 0,
    method: "玄矿修补",
  };
  world.living.regions.kunlun!.strain = 3;
  world.living.people.qingxing!.place = "earth";
  world.living.people.qingxing!.journey = 1;
  world.living.people.qingxing!.met = true;
  const daily = structuredClone(world),
    batch = structuredClone(world);
  for (let day = 2; day <= 9; day++) {
    daily.day = day;
    advanceLiving(daily);
  }
  batch.day = 9;
  advanceLiving(batch);
  assert.deepEqual(batch.living, daily.living);
});
