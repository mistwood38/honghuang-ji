import assert from "node:assert/strict";
import test from "node:test";
import { fresh } from "../engine.ts";
import type { Origin, SaveData } from "../types.ts";
import { applyRoam, automaticAction, normalizeRoam } from "./engine.ts";
import { LINEAGES, lineageOptions, normalizeLineages, trialProof } from "./lineages.ts";
import { affairsOptions, createPolitics, relationKey } from "./politics.ts";
import { advanceLiving, routeTo } from "./local-world.ts";
import type { PlaceId, RoamAct } from "./state.ts";

const rng = () => 0.6;
function fixture(origin: Origin = "dao") {
  const save = applyRoam(fresh(), { type: "origin", origin, name: "行者" }, rng);
  save.world!.idle = null;
  return save;
}
function act(save: SaveData, action: RoamAct) {
  return applyRoam(save, action, rng);
}
function travel(save: SaveData, place: PlaceId) {
  for (let n = 0; save.world!.place !== place && n < 14; n++) {
    const next = routeTo(save.world!, place)[0];
    assert.ok(next);
    save = act(save, { type: "travel", place: next });
  }
  assert.equal(save.world!.place, place);
  return save;
}
function win(save: SaveData) {
  for (let i = 0; save.world!.phase === "battle" && i < 10; i++)
    save = act(save, automaticAction(save));
  assert.equal(save.world!.phase, "free");
  return save;
}
function restUntil(save: SaveData, day: number) {
  while (save.world!.day < day) save = act(save, { type: "rest" });
  return save;
}
// Walk the real roads, pay repair/aid/delivery costs and win the actual trial.
// Starting combat stats represent an existing established character; no chapter proof is injected.
function campaign(origin: Origin, branch: number) {
  let save = fixture(origin);
  save.stats.dao = 12;
  save.stats.life = 100;
  save.world!.lingqi = 80;
  save.world!.bag = { herb: 30, dew: 30, ore: 30, salt: 30, clay: 30 };
  save = act(save, { type: "lineage", what: "begin" });
  const definition = LINEAGES[origin];
  for (let i = 0; i < 6; i++) {
    const chapter = definition.chapters[i]!;
    save = restUntil(save, save.world!.lineages[origin]!.nextDay);
    save = travel(save, chapter.place);
    if (chapter.gate === "repair") {
      save = act(save, { type: "local", what: "survey", site: `${chapter.place}-ruin` });
      save = act(save, { type: "local", what: "heritage", site: `${chapter.place}-ruin` });
      const site = save.world!.living.sites[`${chapter.place}-ruin`]!;
      assert.equal(site.state, "mending");
      save = restUntil(save, site.ready);
      assert.equal(save.world!.living.sites[`${chapter.place}-ruin`]!.state, "restored");
    }
    if (chapter.gate === "standing")
      save = act(save, { type: "affairs", faction: definition.faction, what: "aid" });
    if (chapter.gate === "trial") {
      save = act(save, { type: "rest" });
      save = act(save, { type: "lineage", what: "trial", chapter: i });
      assert.equal(save.world!.phase, "battle");
      assert.equal(save.world!.lineages[origin]!.stage, i);
      save = win(save);
      assert.ok(
        save.world!.karma.includes(trialProof(origin)),
        `${origin}: trial must really be won`,
      );
    }
    const option = lineageOptions(save)[branch]!;
    assert.ok(option && !option.disabled, `${origin}: chapter ${i} available`);
    save = act(save, option.act);
    assert.equal(save.world!.lineages[origin]!.stage, i + 1);
    assert.deepEqual(act(save, option.act), save, "stale chapter action cannot pay twice");
    assert.deepEqual(
      normalizeRoam(JSON.parse(JSON.stringify(save.world))),
      save.world,
      "chapter survives import",
    );
  }
  return save;
}

for (const origin of ["dao", "wu", "yao", "ren"] as const) {
  for (const branch of [0, 1])
    test(`${origin}: six chapters, real repairs, aid, battle and ending ${branch}`, () => {
      let save = campaign(origin, branch);
      const world = save.world!,
        progress = world.lineages[origin]!;
      assert.equal(progress.history.length, 6);
      assert.ok(progress.ending);
      assert.ok(world.arts.includes(LINEAGES[origin].art));
      assert.equal(lineageOptions(save).length, 0);
      const key = origin === "wu" || origin === "yao" ? "wu:yao" : "chan:jie";
      if (branch === 0) assert.ok(world.politics.truces[key]! > world.day + 60);
      else
        assert.ok(
          world.politics.factions[LINEAGES[origin].faction].power >= (origin === "ren" ? 34 : 46),
        );
      assert.deepEqual(act(save, { type: "lineage", what: "begin" }), save);
      save = act(save, { type: "cultivate" });
      assert.ok(save.world!.day > world.day);
      assert.equal(save.world!.lineages[origin]!.ending, progress.ending);
    });
}

test("lineages enforce location, resources and trial proof; invalid imported stages cannot unlock endings", () => {
  let save = fixture("wu");
  save = act(save, { type: "lineage", what: "begin" });
  assert.equal(lineageOptions(save).length, 0);
  assert.deepEqual(
    act(save, { type: "lineage", what: "choose", chapter: 0, choiceId: "carry" }),
    save,
  );
  const fake = normalizeLineages({
    wu: { stage: 6, ending: "free reward", history: [], nextDay: NaN },
  });
  assert.equal(fake.wu!.stage, 0);
  assert.equal(fake.wu!.ending, null);
  assert.deepEqual(normalizeLineages({ unknown: {} }), {});
});

test("patrol is a real battle: fleeing pays nothing, victory pays once", () => {
  let save = fixture("wu");
  save.world!.place = "buzhou";
  save.stats.dao = 12;
  save.stats.life = 100;
  save.world!.lingqi = 80;
  const action = { type: "affairs", faction: "wu", what: "patrol" } as const;
  const money = save.world!.stones;
  save = act(save, action);
  assert.equal(save.world!.phase, "battle");
  assert.equal(save.world!.stones, money);
  save = applyRoam(save, { type: "combat", move: "flee" }, () => 0);
  assert.equal(save.world!.phase, "free");
  assert.equal(save.world!.stones, money);
  assert.equal(save.world!.reputation.wu ?? 0, 0);
  save = restUntil(save, save.world!.politics.factions.wu.lastPatrol + 3);
  save = win(act(save, action));
  assert.equal(save.world!.stones, money + 3);
  assert.equal(save.world!.reputation.wu, 4);
  assert.deepEqual(act(save, { type: "combat", move: "strike" }), save);
});

test("aid consumes goods once, respects cooldown and changes actual regional/faction state", () => {
  let save = fixture();
  save.world!.place = "kunlun";
  save.world!.bag.dew = 6;
  save.world!.living.regions.kunlun!.strain = 2;
  const action = { type: "affairs", faction: "chan", what: "aid" } as const;
  save = act(save, action);
  assert.equal(save.world!.bag.dew, 3);
  assert.equal(save.world!.reputation.chan, 3);
  assert.equal(save.world!.politics.factions.chan.supply, 9);
  assert.equal(save.world!.living.regions.kunlun!.strain, 1);
  assert.deepEqual(act(save, action), save);
  save.world!.place = "earth";
  assert.equal(affairsOptions(save).length, 0);
});

test("mediation holds off conflict, expires, and faction power determines road control", () => {
  let save = fixture("wu");
  const w = save.world!;
  w.place = "buzhou";
  w.day = 64;
  w.politics = createPolitics(64);
  w.bag.dew = 4;
  w.politics.relations["wu:yao"] = -10;
  w.politics.factions.yao.power = 80;
  save = act(save, { type: "affairs", faction: "wu", what: "mediate" });
  assert.equal(save.world!.bag.dew ?? 0, 0);
  assert.equal(save.world!.politics.truces[relationKey("wu", "yao")], 80);
  save = restUntil(save, 80);
  assert.equal(save.world!.politics.control.buzhou, undefined);
  save = restUntil(save, 88);
  assert.equal(save.world!.politics.control.buzhou, "yao");
  assert.ok(save.world!.living.regions.buzhou!.strain > 0);
});

test("chronological bulk advancement agrees with daily processing, including repairs and politics", () => {
  const daily = fixture().world!,
    bulk = structuredClone(daily);
  bulk.day = 161;
  advanceLiving(bulk);
  for (let day = 2; day <= 161; day++) {
    daily.day = day;
    advanceLiving(daily);
  }
  assert.deepEqual(bulk.politics, daily.politics);
  assert.deepEqual(bulk.living, daily.living);
  assert.equal(bulk.politics.cycle, 20);
  assert.ok(bulk.politics.history.length <= 24);
});

test("background battle ticks do not advance politics, overwrite chapter results or move the game day", () => {
  let save = fixture();
  save = act(save, { type: "lineage", what: "begin" });
  save = act(save, { type: "idle", what: "wander", now: 1_000_000 });
  const politics = structuredClone(save.world!.politics),
    day = save.world!.day,
    report = structuredClone(save.world!.report);
  for (let i = 1; i <= 120; i++)
    save = act(save, { type: "idle", what: "fight", now: 1_000_000 + i * 2500 });
  assert.deepEqual(save.world!.politics, politics);
  assert.deepEqual(save.world!.report, report);
  assert.equal(save.world!.day, day);
});

test("legacy saves migrate without replacing person, relics, original story or local progress", () => {
  const save = fixture();
  save.items = ["pangu-bone"];
  save.flags = ["original-story"];
  const raw = JSON.parse(JSON.stringify(save.world));
  delete raw.politics;
  delete raw.lineages;
  save.world = normalizeRoam(raw)!;
  const next = act(save, { type: "lineage", what: "begin" });
  assert.equal(next.name, save.name);
  assert.deepEqual(next.items, save.items);
  assert.deepEqual(next.flags, save.flags);
  assert.deepEqual(next.world!.living, save.world.living);
  assert.deepEqual(normalizeRoam(JSON.parse(JSON.stringify(next.world))), next.world);
});

test("trial escape and defeat never write victory proof or advance the chapter", () => {
  for (const outcome of ["flee", "loss"] as const) {
    let save = fixture();
    save.stats.dao = 12;
    save.stats.life = 25;
    save.world!.place = "edge";
    save.world!.lineages.dao = normalizeLineages({
      dao: {
        history: LINEAGES.dao.chapters
          .slice(0, 4)
          .map((ch, chapter) => ({ chapter, choice: ch.choices[0]!.id, day: 1 })),
      },
    }).dao!;
    save = act(save, { type: "lineage", what: "trial", chapter: 4 });
    assert.equal(save.world!.phase, "battle");
    if (outcome === "loss") {
      save.world!.battle!.atk = 300;
      save.stats.life = 1;
    }
    save = applyRoam(
      save,
      { type: "combat", move: outcome === "flee" ? "flee" : "strike" },
      () => 0,
    );
    assert.equal(save.world!.phase, "free");
    assert.equal(save.world!.lineages.dao!.stage, 4);
    assert.ok(!save.world!.karma.includes(trialProof("dao")));
    save = restUntil(save, save.world!.day + 10);
    assert.ok(
      lineageOptions(save).some((option) => option.act.what === "trial" && !option.disabled),
    );
  }
});

test("chapter costs are validated in the engine, never pre-awarded or spent below zero", () => {
  let save = fixture();
  save.world!.place = "edge";
  save.world!.lineages.dao = normalizeLineages({
    dao: {
      history: LINEAGES.dao.chapters
        .slice(0, 2)
        .map((ch, chapter) => ({ chapter, choice: ch.choices[0]!.id, day: 1 })),
    },
  }).dao!;
  const options = lineageOptions(save);
  assert.ok(options.length === 2 && options.every((o) => o.disabled));
  assert.deepEqual(act(save, options[0]!.act), save);
  save.world!.bag.dew = 2;
  save = act(save, options[0]!.act);
  assert.equal(save.world!.bag.dew ?? 0, 0);
  assert.equal(save.world!.lineages.dao!.stage, 3);
});
