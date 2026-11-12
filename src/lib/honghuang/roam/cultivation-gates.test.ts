import assert from "node:assert/strict";
import test from "node:test";
import { fresh } from "../engine.ts";
import { REALMS } from "../world.ts";
import { applyRoam, normalizeRoam, realmIndex } from "./engine.ts";

function fixture(dao = 11) {
  const save = applyRoam(fresh(), { type: "origin", origin: "dao", name: "行者" }, () => 0.6);
  save.stats.dao = dao;
  save.world!.idle = null;
  save.world!.lingqi = 80;
  return save;
}
test("ordinary cultivation cannot bypass any major realm gate", () => {
  for (const realm of REALMS.slice(1)) {
    const before = fixture(realm.min - 1);
    const after = applyRoam(before, { type: "cultivate" }, () => 0.6);
    assert.equal(after.stats.dao, before.stats.dao);
    assert.equal(realmIndex(after.stats.dao), realmIndex(before.stats.dao));
    assert.match(after.world!.report!.changes.join(" "), /关口/);
  }
});
test("event rewards also stop at the gate without hiding that consequence", () => {
  const save = fixture();
  save.world!.place = "edge";
  save.world!.phase = "event";
  save.world!.eventId = "edge-name-burial";
  const result = applyRoam(save, { type: "choose", choiceId: "keep-name-on" }, () => 0.6);
  assert.equal(result.stats.dao, 11);
  assert.match(result.world!.report!.changes.join(" "), /关口/);
});
test("minor breakthrough advances a layer without silently advancing the major realm", () => {
  const save = fixture();
  save.world!.layer = 8;
  save.world!.xiuwei = 100;
  const result = applyRoam(save, { type: "breakthrough", pill: false }, () => 0);
  assert.equal(result.world!.layer, 9);
  assert.equal(result.stats.dao, 11);
  assert.equal(result.world!.xiuwei, 0);
});
test("only a successful ninth-layer breakthrough opens the next major realm", () => {
  const save = fixture();
  save.world!.layer = 9;
  save.world!.xiuwei = 100;
  const success = applyRoam(save, { type: "breakthrough", pill: false }, () => 0);
  assert.equal(success.stats.dao, 12);
  assert.equal(success.world!.layer, 1);
  const failure = applyRoam(save, { type: "breakthrough", pill: false }, () => 0.999);
  assert.equal(failure.stats.dao, 11);
  assert.equal(failure.world!.layer, 9);
  assert.ok(failure.world!.wound > save.world!.wound);
});
test("existing saved realms and top realm cultivation remain intact", () => {
  for (const realm of REALMS) {
    const save = fixture(realm.min);
    save.world = normalizeRoam(save.world);
    const restored = applyRoam(save, { type: "rest" }, () => 0.6);
    assert.equal(restored.stats.dao, realm.min);
  }
  const top = fixture(400);
  assert.equal(applyRoam(top, { type: "cultivate" }, () => 0.6).stats.dao, 400);
});
