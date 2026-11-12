import assert from "node:assert/strict";
import { accessSync } from "node:fs";
import test from "node:test";
import { CHAPTERS } from "./novel.ts";
import { ART, CHAPTER_ART } from "./visuals.ts";

test("every published chapter has an explicit illustration with both local image sizes", () => {
  assert.deepEqual(
    Object.keys(CHAPTER_ART).sort(),
    CHAPTERS.map((chapter) => chapter.id).sort(),
    "Update the chapter artwork when adding, removing, or renaming a chapter",
  );
  for (const chapter of CHAPTERS) {
    const art = ART[CHAPTER_ART[chapter.id]!];
    for (const source of [art.src, art.small]) {
      accessSync(new URL(`../../../public${source}`, import.meta.url));
    }
  }
});
