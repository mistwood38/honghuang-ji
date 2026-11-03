import assert from "node:assert/strict";
import { test } from "node:test";
import { buildAftermath } from "./aftermath.ts";
import { fresh } from "./engine.ts";
import { musicCue, storyScrollTop, MUSIC } from "./music.ts";
import { audioContextExists, setAmbience } from "./sound.ts";

test("each screen and mood has its own bed", () => {
  const cues = [
    musicCue("title", "mist"),
    musicCue("novel", "mist"),
    musicCue("codex", "mist"),
    musicCue("land", "mist"),
    musicCue("self", "mist"),
    musicCue("play", "mist"),
    musicCue("play", "radiance"),
    musicCue("play", "calamity"),
    musicCue("play", "still"),
    musicCue("play", "embers"),
    musicCue("play", "tide"),
  ];
  assert.equal(new Set(cues).size, cues.length);
  for (const cue of cues) {
    assert.equal(MUSIC[cue].src.startsWith("/audio/"), true);
  }
  assert.equal(MUSIC.calamity.title, "Hope");
  assert.notEqual(MUSIC.land.src, MUSIC.tide.src);
});

test("story stays under the header instead of jumping to zero", () => {
  assert.equal(storyScrollTop(420, 640, 96), 954);
  assert.equal(storyScrollTop(20, 0, 120), 0);
  assert.equal(storyScrollTop(Number.NaN, 40, 80), 40);
});

test("attribute changes stay hidden until the choice resolves", () => {
  const before = fresh();
  before.stats = { dao: 10, qi: 4, kill: 0, virtue: 0, demon: 0, life: 100 };
  before.items = ["chaos-qi"];
  const after = fresh();
  after.stats = { dao: 22, qi: 4, kill: 6, virtue: 0, demon: 0, life: 80 };
  after.items = ["purple-qi"];
  after.origin = "dao";
  const result = buildAftermath(before, after, "扑上斧脊");
  assert.deepEqual(
    result.deltas.map((row) => [row.key, row.value]),
    [
      ["dao", 12],
      ["kill", 6],
      ["life", -20],
    ],
  );
  assert.deepEqual(result.gained, ["purple-qi"]);
  assert.deepEqual(result.lost, ["chaos-qi"]);
  assert.equal(result.origin, "dao");
  assert.equal(result.text, "扑上斧脊");
});

test("a muted life does not construct an audio context", () => {
  setAmbience(false);
  setAmbience(true, "title");
  assert.equal(audioContextExists(), false);
  setAmbience(false);
});
