import assert from "node:assert/strict";
import { test } from "node:test";
import { chooseById, fresh, qualDao, qualDemon, qualRen, visibleChoices } from "./engine.ts";
import type { SaveData } from "./types.ts";

function run(ids: string[]): SaveData {
  let state = fresh();
  for (const id of ids) state = chooseById(state, id);
  return state;
}

test("dao path can hear the unfinished sentence", () => {
  const state = run(["dao", "help", "listen", "sit", "kunlun", "disciple", "peace", "hold", "offer", "shield"]);
  assert.equal(state.sceneId, "final");
  assert.equal(qualDao(state), true);
  assert.ok(visibleChoices(state).some((item) => item.choice.id === "end-dao"));
  const ended = chooseById(state, "end-dao");
  assert.equal(ended.sceneId, "end-dao");
});

test("spending the body on every blow scatters", () => {
  const state = run(["wu", "help", "listen", "sit", "wu", "wrestle", "wu", "hold", "flame"]);
  assert.equal(state.sceneId, "end-fallen");
  assert.equal(state.stats.life, 0);
});

test("ren path can keep the fire", () => {
  const state = run(["ren", "watch", "listen", "down", "ren", "help", "ren", "save", "flame", "shield"]);
  assert.equal(state.sceneId, "final");
  assert.equal(qualRen(state), true);
  assert.equal(qualDao(state), false);
  assert.ok(visibleChoices(state).some((item) => item.choice.id === "end-ren"));
});

test("hunger can finish a life", () => {
  const state = run(["wu", "swallow", "blood", "outside", "jie", "stain", "wu", "loot", "aside", "tear"]);
  assert.equal(qualDemon(state), true);
  assert.equal(state.sceneId, "final");
  const ended = chooseById(state, "fate");
  assert.equal(ended.sceneId, "end-demon");
});

test("low comprehension sits at the edge of the hall", () => {
  const state = run(["ren", "watch", "blood"]);
  const ids = visibleChoices(state).map((item) => item.choice.id);
  assert.ok(ids.includes("partial"));
  assert.equal(ids.includes("sit"), false);
  assert.throws(() => chooseById(state, "sit"));
});

test("each gate is offered once", () => {
  const state = run(["dao", "help", "listen", "sit"]);
  assert.equal(state.sceneId, "road");
  const labels = visibleChoices(state).map((item) => item.choice.text);
  assert.equal(labels.filter((label) => label === "上昆仑").length, 1);
  assert.equal(labels.filter((label) => label === "赴血海").length, 1);
  assert.equal(labels.filter((label) => label === "去不周，见祖巫").length, 1);
  assert.equal(labels.filter((label) => label === "去东海妖庭").length, 1);
});
