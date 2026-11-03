import assert from "node:assert/strict";
import test from "node:test";
import { readImportedSave } from "./store.ts";

const blob = {
  state: {
    version: 1,
    screen: "play",
    started: true,
    name: "玄澄",
    origin: "dao",
    sceneId: "kunlun",
    stats: { dao: 40, qi: 22, kill: 2, virtue: 8, demon: 0, life: 88 },
    items: [],
    flags: ["kunlun-disciple"],
    log: [],
    seen: ["kunlun"],
    pastLives: [],
    novelIndex: 2,
    sound: false,
  },
  version: 1,
};

test("reads a wrapped v1 save", () => {
  const save = readImportedSave(JSON.stringify(blob));
  assert.equal(save.name, "玄澄");
  assert.equal(save.sceneId, "kunlun");
  assert.equal(save.sound, false);
  assert.equal(save.stats.dao, 40);
});

test("reads a bare v1 save", () => {
  const save = readImportedSave(JSON.stringify(blob.state));
  assert.equal(save.sceneId, "kunlun");
});

test("rejects literary text and foreign versions", () => {
  assert.throws(() => readImportedSave("昆仑的风很薄。"), /存档文本/);
  assert.throws(() => readImportedSave(JSON.stringify({ version: 2, sceneId: "kunlun", stats: {} })), /这一版/);
});
