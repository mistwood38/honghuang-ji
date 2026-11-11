import assert from "node:assert/strict";
import test from "node:test";
import { fresh } from "../engine.ts";
import { ITEMS } from "../world.ts";
import { applyRoam, normalizeRoam, visibleChoices } from "./engine.ts";
import { EVENTS } from "./events.ts";
import { RELIC_JOURNEYS, RELIC_JOURNEY_EVENTS } from "./relic-journeys.ts";
import { activeRelic, relicGuard } from "./relics.ts";
import type { PlaceId, RoamAct } from "./state.ts";
import type { SaveData } from "../types.ts";
const act = (save: SaveData, action: RoamAct) => applyRoam(save, action, () => 0);

test("all nine existing relics have open-world acquisition effects", () => {
  const obtainable = new Set(
    EVENTS.flatMap((e) =>
      e.choices.flatMap((c) => c.effects.filter((f) => f.t === "item").map((f) => f.id)),
    ),
  );
  for (const id of Object.keys(ITEMS)) assert.ok(obtainable.has(id), id);
  assert.equal(new Set(EVENTS.map((e) => e.id)).size, EVENTS.length);
});
for (const [index, item] of ["pangu-bone", "zhuxian", "xirang"].entries()) {
  test(`${item}: discover, spend, defer, receive once, equip and restore without injecting the item`, () => {
    const chain = RELIC_JOURNEYS[index]!;
    const first = RELIC_JOURNEY_EVENTS.find((e) => e.id === chain.stages[0])!;
    const second = RELIC_JOURNEY_EVENTS.find((e) => e.id === chain.stages[1])!;
    let save = act(fresh(), { type: "origin", origin: "dao", name: "旧姓名" });
    save.world!.idle = null;
    save.flags = ["old-chronicle"];
    save.world!.place = first.place as PlaceId;
    save.world!.bag = { herb: 8, ore: 8, dew: 8, seed: 8, clay: 8 };
    save = act(save, { type: "explore" });
    assert.equal(
      save.world!.eventId,
      first.id,
      "an ordinary regional exploration can discover the story",
    );
    save = act(save, { type: "choose", choiceId: first.choices[0]!.id });
    save = act(save, { type: "continue", chainId: chain.id });
    assert.equal(save.world!.eventId, second.id);
    const short = structuredClone(save);
    short.world!.bag = {};
    assert.deepEqual(act(short, { type: "choose", choiceId: second.choices[0]!.id }), short);
    assert.equal(visibleChoices(short.world!, second)[0]!.id, "wait");
    const postponed = act(short, { type: "choose", choiceId: "wait" });
    assert.equal(postponed.world!.quests[chain.id]!.status, "active");
    assert.equal(act(postponed, { type: "continue", chainId: chain.id }).world!.eventId, second.id);
    save = act(save, { type: "choose", choiceId: second.choices[0]!.id });
    assert.equal(save.world!.quests[chain.id]!.status, "done");
    const due = save.world!.delayed.find((e) => e.event.endsWith("-gift"))!;
    assert.ok(due);
    assert.equal(save.items.includes(item), false);
    save.world = normalizeRoam(save.world);
    while (save.world!.day < due.due) save = act(save, { type: "rest" });
    assert.equal(
      save.items.includes(item),
      false,
      "the passage of time does not silently grant the gift",
    );
    save = act(save, { type: "rest" });
    assert.equal(save.world!.eventId, due.event);
    save = act(save, { type: "choose", choiceId: "receive" });
    assert.equal(save.items.filter((id) => id === item).length, 1);
    assert.deepEqual(act(save, { type: "choose", choiceId: "receive" }), save);
    save = act(save, { type: "equip-relic", id: item });
    save.world = normalizeRoam(save.world);
    assert.equal(activeRelic(save), item);
    assert.equal(save.name, "旧姓名");
    assert.deepEqual(save.flags, ["old-chronicle"]);
    if (item === "pangu-bone") assert.equal(relicGuard(save, 1), 2);
    if (item === "xirang") {
      save.world!.plot = { ready: save.world!.day };
      const without = structuredClone(save);
      without.world!.relic = null;
      const harvest = act(save, { type: "plot", what: "harvest" });
      const ordinary = act(without, { type: "plot", what: "harvest" });
      assert.equal(harvest.world!.bag.herb, (ordinary.world!.bag.herb ?? 0) + 2);
    }
  });
}
