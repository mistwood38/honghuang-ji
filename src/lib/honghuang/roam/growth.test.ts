import assert from "node:assert/strict";
import test from "node:test";
import { fresh } from "../engine.ts";
import { ITEMS } from "../world.ts";
import {
  applyRoam,
  automaticAction,
  farmBattle,
  normalizeRoam,
  resolveFarmBattle,
} from "./engine.ts";
import { activeRelic, RELIC_USES } from "./relics.ts";
import { insightRequirement, normalizeInsights, techniqueFor } from "./insight.ts";
import { TECHNIQUES } from "./techniques.ts";
import type { SaveData } from "../types.ts";
import type { RoamAct } from "./state.ts";
const rng = () => 0.6;
function fixture() {
  const save = applyRoam(fresh(), { type: "origin", origin: "dao", name: "行者" }, rng);
  save.world!.idle = null;
  save.world!.lingqi = 40;
  save.stats.life = 80;
  save.items = Object.keys(ITEMS);
  return save;
}
const act = (save: SaveData, action: RoamAct) => applyRoam(save, action, rng);
function equipped(id: string | null) {
  return act(fixture(), { type: "equip-relic", id });
}
function battle(save: SaveData, hp = 100, atk = 10) {
  save.world!.phase = "battle";
  save.world!.battle = {
    ...farmBattle("earth"),
    hp,
    max: hp,
    atk,
    def: 0,
    win: [{ t: "stone", n: 1 }],
    lose: [{ t: "wound", n: 1 }],
  };
  return save;
}

test("legacy and malformed growth fields normalize without removing original possessions", () => {
  const save = fixture(),
    raw = JSON.parse(JSON.stringify(save.world));
  delete raw.relic;
  delete raw.insights;
  const w = normalizeRoam(raw)!;
  assert.equal(w.relic, null);
  assert.deepEqual(w.insights, {});
  const next = act({ ...save, world: w }, { type: "equip-relic", id: "pangu-bone" });
  assert.deepEqual(next.items, save.items);
  assert.deepEqual(next.flags, save.flags);
  assert.deepEqual(normalizeRoam(JSON.parse(JSON.stringify(next.world))), next.world);
  assert.deepEqual(
    normalizeInsights({ qingjing: 1, bone: 2, form: 999, constructor: 2 }, [
      "qingjing",
      "form",
      "constructor",
    ]),
    { qingjing: 1 },
  );
  assert.equal(normalizeRoam({ ...raw, relic: "constructor" })!.relic, null);
});

test("all nine relics can be equipped alone, put away and inspected without consuming them", () => {
  assert.deepEqual(Object.keys(RELIC_USES), Object.keys(ITEMS));
  let save = fixture();
  const items = [...save.items];
  for (const id of items) {
    save = act(save, { type: "equip-relic", id });
    assert.equal(activeRelic(save), id);
    assert.deepEqual(act(save, { type: "equip-relic", id }), save);
    assert.deepEqual(save.items, items);
  }
  save = act(save, { type: "equip-relic", id: null });
  assert.equal(activeRelic(save), null);
  save.items = [];
  save.world!.relic = "zhuxian";
  assert.equal(activeRelic(save), null);
  save.world!.relic = null;
  assert.deepEqual(act(save, { type: "equip-relic", id: "zhuxian" }), save);
});

test("relic changing and comprehension are forbidden during battle, events and retreat", () => {
  for (const phase of ["battle", "event", "free"] as const) {
    const save = fixture();
    save.world!.phase = phase;
    if (phase === "free") save.world!.retreat = { watch: 0 };
    save.stats.dao = 26;
    save.world!.stones = 20;
    save.world!.bag = { dew: 10, ore: 5 };
    assert.deepEqual(act(save, { type: "equip-relic", id: "pangu-bone" }), save);
    assert.deepEqual(act(save, { type: "comprehend-art", artId: "qingjing", level: 1 }), save);
  }
});

test("changing relics settles elapsed fights with the old relic", (t) => {
  t.mock.method(Date, "now", () => 110_000);
  const save = equipped("pangu-bone");
  save.world!.idle = { kind: "wander" };
  save.world!.farm = "earth";
  save.world!.lastTick = 100_000;
  const direct = act(save, { type: "equip-relic", id: "zhuxian" });
  const synced = act(act(save, { type: "idle", what: "sync", now: 110_000 }), {
    type: "equip-relic",
    id: "zhuxian",
  });
  assert.deepEqual(direct, synced);
  assert.equal(direct.world!.relic, "zhuxian");
});

test("chaos qi reduces only the known active cultivation cost", () => {
  const without = act(equipped(null), { type: "cultivate" });
  const withRelic = act(equipped("chaos-qi"), { type: "cultivate" });
  assert.equal(withRelic.world!.lingqi, without.world!.lingqi + 1);
  assert.equal(withRelic.world!.xiuwei, without.world!.xiuwei);
});

for (const [id, life, round, reduction] of [
  ["pangu-bone", 80, 1, 2],
  ["wu-blood", 49, 1, 3],
  ["wu-blood", 50, 1, 0],
  ["bell", 80, 1, 4],
  ["bell", 80, 2, 0],
] as const) {
  test(`${id}: guarded reply at life ${life}, round ${round}`, () => {
    const a = battle(equipped(null)),
      b = battle(equipped(id));
    a.stats.life = b.stats.life = life;
    a.world!.battle!.round = b.world!.battle!.round = round;
    const plain = act(a, { type: "combat", move: "strike" }),
      protectedSave = act(b, { type: "combat", move: "strike" });
    assert.equal(protectedSave.stats.life - plain.stats.life, reduction);
  });
}

test("sword intent increases real outgoing damage; absent or unowned relics do not", () => {
  const plain = act(battle(equipped(null)), { type: "combat", move: "strike" });
  const strong = act(battle(equipped("zhuxian")), { type: "combat", move: "strike" });
  assert.equal(plain.world!.battle!.hp - strong.world!.battle!.hp, 2);
  const unowned = battle(equipped("zhuxian"));
  unowned.items = [];
  assert.equal(
    act(unowned, { type: "combat", move: "strike" }).world!.battle!.hp,
    plain.world!.battle!.hp,
  );
});

test("purple qi can change a major breakthrough outcome within the existing cap", () => {
  const plain = equipped(null),
    purple = equipped("purple-qi");
  for (const s of [plain, purple]) {
    s.stats.dao = 0;
    s.stats.qi = 0;
    s.world!.wuxing = 5;
    s.world!.xiuwei = 100;
    s.world!.layer = 9;
  }
  assert.equal(act(plain, { type: "breakthrough", pill: false }).stats.dao, 0);
  assert.equal(act(purple, { type: "breakthrough", pill: false }).stats.dao, 12);
  purple.world!.wuxing = 100;
  assert.equal(applyRoam(purple, { type: "breakthrough", pill: false }, () => 0.93).stats.dao, 0);
});

test("living soil affects actual harvest once, and pillar stone improves capped rest", () => {
  const plain = equipped(null),
    soil = equipped("xirang");
  for (const s of [plain, soil]) s.world!.plot = { ready: s.world!.day };
  const a = act(plain, { type: "plot", what: "harvest" }),
    b = act(soil, { type: "plot", what: "harvest" });
  assert.equal(b.world!.bag.herb! - a.world!.bag.herb!, 2);
  assert.equal(act(b, { type: "plot", what: "harvest" }).world!.bag.herb, b.world!.bag.herb);
  assert.equal(
    act(equipped("buzhou-stone"), { type: "rest" }).stats.life,
    act(equipped(null), { type: "rest" }).stats.life + 3,
  );
  const cap = equipped("buzhou-stone");
  cap.stats.life = 99;
  assert.equal(act(cap, { type: "rest" }).stats.life, 100);
});

test("incense restores life only after victory, not retreat or defeat", () => {
  const won = act(battle(equipped("incense"), 1), { type: "combat", move: "strike" });
  const plain = act(battle(equipped(null), 1), { type: "combat", move: "strike" });
  assert.equal(won.stats.life - plain.stats.life, 4);
  const fled = applyRoam(battle(equipped("incense")), { type: "combat", move: "flee" }, () => 0);
  assert.equal(fled.stats.life, 80);
  const a = act(battle(equipped(null), 100, 999), { type: "combat", move: "strike" });
  const b = act(battle(equipped("incense"), 100, 999), { type: "combat", move: "strike" });
  assert.equal(a.stats.life, b.stats.life);
  const cap = battle(equipped("incense"), 1);
  cap.stats.life = 99;
  assert.equal(act(cap, { type: "combat", move: "strike" }).stats.life, 100);
});

test("two comprehension stages require realm and real costs; stale submissions cannot pay twice", () => {
  let save = fixture();
  save.world!.stones = 20;
  save.world!.bag = { dew: 10, ore: 5 };
  save.stats.dao = 11;
  const first = { type: "comprehend-art", artId: "qingjing", level: 1 } as const;
  assert.match(insightRequirement(save, "qingjing", 1)!, /炼气/);
  assert.deepEqual(act(save, first), save);
  save.stats.dao = 12;
  const before = structuredClone(save);
  save = act(save, first);
  assert.equal(save.world!.insights.qingjing, 1);
  assert.equal(save.world!.day, before.world!.day + 1);
  assert.equal(save.world!.stones, 16);
  assert.equal(save.world!.bag.dew, 8);
  assert.equal(save.world!.lingqi, 34);
  assert.equal(techniqueFor(save.world!, "qingjing")!.cost, 3);
  assert.deepEqual(act(save, first), save);
  const second = { ...first, level: 2 as const };
  assert.deepEqual(act(save, second), save);
  save.stats.dao = 26;
  save = act(save, second);
  assert.equal(save.world!.insights.qingjing, 2);
  assert.equal(save.world!.stones, 6);
  assert.equal(save.world!.bag.dew, 4);
  assert.equal(save.world!.bag.ore, 3);
  assert.equal(save.world!.lingqi, 24);
  assert.equal(techniqueFor(save.world!, "qingjing")!.heal, 8);
  assert.deepEqual(act(save, second), save);
  assert.deepEqual(normalizeRoam(JSON.parse(JSON.stringify(save.world))), save.world);
});

test("comprehension never spends materials if elapsed idle combat exhausts its qi", (t) => {
  t.mock.method(Date, "now", () => 105_000);
  const save = fixture();
  save.stats.dao = 26;
  save.world!.arts = ["qingjing", "zhuxian"];
  save.world!.equipped = "zhuxian";
  save.world!.idle = { kind: "wander" };
  save.world!.lastTick = 100_000;
  save.world!.farm = "chaos";
  save.world!.lingqi = 6;
  save.world!.stones = 20;
  save.world!.bag = { dew: 10 };
  const next = act(save, { type: "comprehend-art", artId: "qingjing", level: 1 });
  assert.ok(next.world!.lingqi < 6);
  assert.equal(next.world!.insights.qingjing, undefined);
  assert.equal(next.world!.stones, 20);
  assert.equal(next.world!.bag.dew, 10);
  assert.equal(next.world!.idle, null);
  assert.equal(next.world!.report!.title, "先整顿气息");
});

test("all nine techniques improve without mutating their base definitions", () => {
  const world = fixture().world!,
    bases = structuredClone(TECHNIQUES);
  for (const id of Object.keys(TECHNIQUES)) {
    world.insights[id] = 2;
    const enhanced = techniqueFor(world, id)!,
      base = TECHNIQUES[id]!;
    assert.equal(enhanced.cost, base.cost - 1);
    assert.equal(enhanced.heal, base.heal ? base.heal + 2 : 0);
    assert.equal(enhanced.guard, base.guard ? base.guard + 2 : 0);
    assert.equal(enhanced.bind, base.bind);
  }
  assert.deepEqual(TECHNIQUES, bases);
});

test("relics and mastered main/auxiliary techniques use identical manual and automatic combat", () => {
  for (const relic of Object.keys(RELIC_USES))
    for (const id of Object.keys(TECHNIQUES))
      for (const plan of ["balanced", "assault", "reserve"] as const) {
        const save = equipped(relic);
        save.stats.dao = 26;
        save.stats.life = 40;
        save.world!.farm = "earth";
        save.world!.arts = Object.keys(TECHNIQUES);
        save.world!.equipped = id;
        save.world!.prepared = [
          id === "qingjing" ? "bone" : "qingjing",
          id === "form" ? "hearth" : "form",
        ];
        save.world!.insights = Object.fromEntries(save.world!.arts.map((art) => [art, 2]));
        save.world!.battlePlan = plan;
        const auto = resolveFarmBattle(save, rng);
        let manual = structuredClone(save);
        manual.world!.phase = "battle";
        manual.world!.battle = farmBattle("earth");
        for (let i = 0; manual.world!.phase === "battle" && i < 8; i++)
          manual = act(manual, automaticAction(manual));
        assert.equal(auto.life, manual.stats.life, `${relic}/${id}/${plan}`);
        assert.equal(auto.lingqi, manual.world!.lingqi);
        assert.equal(auto.wound, manual.world!.wound);
      }
});
