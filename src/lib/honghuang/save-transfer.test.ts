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
  assert.throws(() => readImportedSave(JSON.stringify({ version: 9, sceneId: "kunlun", stats: {} })), /这一版/);
});

test("keeps a v1 chronicle and accepts a v2 life", () => {
  const old = readImportedSave(JSON.stringify(blob.state));
  assert.equal(old.world, null);
  assert.equal(old.version, 1);
  const life = {
    ...blob.state,
    version: 2,
    world: {
      phase: "free",
      day: 4,
      place: "kunlun",
      known: ["chaos", "earth", "kunlun"],
      xiuwei: 20,
      lingqi: 12,
      wuxing: 5,
      wound: 0,
      stones: 1,
      arts: [],
      equipped: null,
      spells: [],
      bag: {},
      relations: {},
      reputation: {},
      sect: null,
      sectRank: 0,
      contrib: 0,
      quests: { stone: { stage: 1, status: "active" } },
      karma: ["took-stone"],
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
    },
  };
  const save = readImportedSave(JSON.stringify(life));
  assert.equal(save.version, 2);
  assert.equal(save.world?.place, "kunlun");
  assert.equal(save.world?.quests.stone?.status, "active");
  assert.equal(save.stats.dao, 40);
});
