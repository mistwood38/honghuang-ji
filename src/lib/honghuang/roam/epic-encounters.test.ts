import assert from "node:assert/strict";
import test from "node:test";
import { fresh } from "../engine.ts";
import { applyRoam } from "./engine.ts";
import { PEOPLE } from "./local-world.ts";
import { LINEAGES, normalizeLineages } from "./lineages.ts";
import { lineageEcho } from "./lineage-echoes.ts";
import { LEGACY_LINEAGE_CONTRACT } from "./lineage-contract.fixture.ts";
import { wayfarerScene } from "./wayfarer-dialogue.ts";
import type { Origin } from "../types.ts";

function fixture() {
  const save = applyRoam(fresh(), { type: "origin", origin: "dao", name: "行者" }, () => 0.6);
  save.world!.idle = null;
  return save;
}
test("rewritten chapters preserve every old choice id, cost, effect, gate and ending", () => {
  const shape = Object.fromEntries(
    Object.entries(LINEAGES).map(([id, d]) => [
      id,
      {
        faction: d.faction,
        witness: d.witness,
        art: d.art,
        chapters: d.chapters.map((ch) => ({
          place: ch.place,
          gate: ch.gate ?? null,
          choices: ch.choices.map((c) => ({
            id: c.id,
            cost: c.cost ?? null,
            effects: c.effects ?? null,
            ending: c.ending ?? null,
          })),
        })),
      },
    ]),
  );
  assert.deepEqual(shape, LEGACY_LINEAGE_CONTRACT);
});
for (const origin of ["dao", "wu", "yao", "ren"] as Origin[]) {
  test(`${origin}: all eight old endings retain complete readable archives`, () => {
    const def = LINEAGES[origin];
    for (const index of [0, 1]) {
      const history = def.chapters.map((ch, chapter) => ({
        chapter,
        choice: ch.choices[index]!.id,
        day: chapter + 1,
      }));
      const result = normalizeLineages({ [origin]: { history } })[origin]!;
      assert.equal(result.stage, 6);
      assert.equal(result.ending, def.chapters[5]!.choices[index]!.ending!.name);
      assert.deepEqual(
        result.history.map((h) => h.choice),
        history.map((h) => h.choice),
      );
      assert.ok(result.history.every((h) => h.text.length >= 2));
    }
  });
  test(`${origin}: three later chapters remember a specific prior choice without future knowledge`, () => {
    for (const stage of [1, 3, 5]) {
      const previous = stage - 1,
        choices = LINEAGES[origin].chapters[previous]!.choices;
      const a = lineageEcho(origin, stage, [{ chapter: previous, choice: choices[0]!.id }]);
      const b = lineageEcho(origin, stage, [{ chapter: previous, choice: choices[1]!.id }]);
      assert.ok(a && b);
      assert.notEqual(a, b);
      assert.equal(lineageEcho(origin, stage, []), null);
      assert.equal(
        lineageEcho(origin, stage, [{ chapter: stage + 1, choice: choices[0]!.id }]),
        null,
      );
      assert.equal(
        lineageEcho(origin, stage, [{ chapter: previous, choice: "constructor" }]),
        null,
      );
    }
  });
}
for (const person of PEOPLE) {
  test(`${person.name}: conversation reflects known errands and land without spending or granting anything`, () => {
    const save = fixture(),
      w = save.world!;
    w.place = person.route[0]!;
    w.living.people[person.id]!.place = w.place;
    const before = structuredClone(save);
    const first = wayfarerScene(save, person.id, "road")!;
    assert.equal(first.memory, null);
    assert.deepEqual(save, before);
    const talked = applyRoam(save, { type: "person", id: person.id, what: "talk" }, () => 0.6);
    assert.deepEqual(talked.world!.report!.paragraphs.slice(0, 3), first.paragraphs);
    assert.equal(talked.world!.day, w.day);
    assert.deepEqual(talked.world!.bag, w.bag);
    assert.deepEqual(talked.world!.relations, w.relations);
    const unknownPast = wayfarerScene(save, person.id, "past")!.paragraphs;
    w.relations[person.id] = 4;
    assert.notDeepEqual(wayfarerScene(save, person.id, "past")!.paragraphs, unknownPast);
    const destination = person.route[1]!;
    w.living.errands[person.id] = { stage: "carrying", destination, completed: 0, count: 0 };
    const carrying = wayfarerScene(save, person.id, "promise")!;
    assert.match(carrying.memory!, /还未送达/);
    w.living.errands[person.id]!.stage = "delivered";
    const delivered = wayfarerScene(save, person.id, "promise")!;
    assert.match(delivered.memory!, /回信尚未交还/);
    assert.notDeepEqual(delivered.paragraphs, carrying.paragraphs);
    w.living.errands[person.id]!.stage = "done";
    w.living.errands[person.id]!.count = 2;
    const returned = wayfarerScene(save, person.id, "promise")!;
    assert.match(returned.memory!, /完成 2 次/);
    assert.notDeepEqual(returned.paragraphs, delivered.paragraphs);
    w.living.regions[w.place]!.strain = 4;
    assert.notDeepEqual(wayfarerScene(save, person.id, "road")!.paragraphs, first.paragraphs);
    const snapshot = structuredClone(save);
    for (let n = 0; n < 100; n++)
      for (const topic of ["road", "past", "promise"] as const) {
        const dialogue = wayfarerScene(save, person.id, topic)!;
        assert.ok(
          dialogue.paragraphs.every(
            (line) => !line.includes("{destination}") && !line.includes("悟得"),
          ),
        );
      }
    assert.deepEqual(save, snapshot);
    w.living.people[person.id]!.place = destination;
    assert.equal(wayfarerScene(save, person.id, "road"), null, "absent people cannot answer live");
  });
}
test("unknown identities, missing worlds and unsupported topics reveal no dialogue", () => {
  assert.equal(wayfarerScene(fresh(), "qingxing", "road"), null);
  assert.equal(wayfarerScene(fixture(), "constructor", "road"), null);
  assert.equal(wayfarerScene(fixture(), "qingxing", "future" as "road"), null);
});
