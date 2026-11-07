import assert from "node:assert/strict";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";
import { fresh } from "../src/lib/honghuang/engine.ts";
import { applyRoam } from "../src/lib/honghuang/roam/engine.ts";
import { LINEAGES, normalizeLineages } from "../src/lib/honghuang/roam/lineages.ts";
import { createPolitics } from "../src/lib/honghuang/roam/politics.ts";
import { checkedUrl } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/");
const out = "/workspace/screenshots/factions-lineages";
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(existsSync(chromium.executablePath()) ? {} : { executablePath: "/usr/bin/chromium" }),
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const results = [];
const read = (page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("honghuang-ji-save")).state);
async function click(page, name) {
  await page.getByRole("button", { name, exact: typeof name === "string" }).click();
  await page.waitForFunction(() => !document.querySelector('.game-action[aria-busy="true"]'));
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
}
function fixture() {
  const save = applyRoam(fresh(), { type: "origin", origin: "dao", name: "行者" }, () => 0.6);
  save.sound = false;
  save.world.idle = null;
  save.stats.life = 100;
  save.stats.dao = 12;
  save.world.lingqi = 80;
  return save;
}
async function load(page, save) {
  await page.goto(url);
  await page.evaluate((save) => {
    localStorage.setItem("honghuang-ji-save", JSON.stringify({ state: save, version: 1 }));
  }, save);
  await page.reload();
  await page.locator(".title-screen, .farm-desk").first().waitFor();
  if (await page.getByRole("button", { name: /继.*续.*此.*生/ }).count())
    await click(page, /继.*续.*此.*生/);
  await page.locator(".farm-desk").waitFor();
}
async function checks(page, errors) {
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    false,
    "horizontal overflow",
  );
  assert.deepEqual(errors, []);
}
try {
  for (const width of [320, 360, 412, 1280]) {
    const page = await browser.newPage({
      viewport: { width, height: 844 },
      isMobile: width < 600,
      hasTouch: width < 600,
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    try {
      const legacy = fixture();
      delete legacy.world.politics;
      delete legacy.world.lineages;
      legacy.items = ["pangu-bone"];
      legacy.flags = ["old-footprints"];
      await load(page, legacy);
      await click(page, "族脉");
      await click(page, "展开这一族的长卷");
      const choice = LINEAGES.dao.chapters[0].choices[0];
      await page.locator(".lineage-chapter").scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${out}/lineage-${width}.png` });
      await click(page, choice.text);
      let current = await read(page);
      assert.equal(current.world.lineages.dao.stage, 1);
      assert.ok(current.world.karma.includes(choice.effects[0].id));
      assert.equal(await page.getByRole("button", { name: choice.text, exact: true }).count(), 0);
      assert.ok(current.items.includes("pangu-bone"));
      assert.ok(current.flags.includes("old-footprints"));
      await page.reload();
      await page.locator(".farm-desk").waitFor();
      await click(page, "族脉");
      assert.equal((await read(page)).world.lineages.dao.stage, 1);
      await checks(page, errors);
      results.push({
        width,
        name: "legacy-save-chapter-choice-persists-and-cannot-repeat",
        ok: true,
      });

      const trial = fixture();
      trial.world.place = "edge";
      trial.world.lineages.dao = normalizeLineages({
        dao: {
          history: LINEAGES.dao.chapters
            .slice(0, 4)
            .map((ch, chapter) => ({ chapter, choice: ch.choices[0].id, day: 1 })),
        },
      }).dao;
      await load(page, trial);
      await click(page, "族脉");
      await click(page, "直面这一场");
      assert.equal((await read(page)).world.phase, "battle");
      for (let i = 0; i < 8 && (await read(page)).world.phase === "battle"; i++)
        await click(page, "攻");
      current = await read(page);
      assert.ok(current.world.karma.includes("lineage-trial-dao"));
      await click(page, "回看族脉后续");
      await click(page, LINEAGES.dao.chapters[4].choices[0].text);
      assert.equal((await read(page)).world.lineages.dao.stage, 5);
      // Travel through the actual UI; the final chapter is at Kunlun.
      for (let i = 0; i < 10 && (await read(page)).world.place !== "kunlun"; i++)
        await click(page, "循路往昆仑");
      current = await read(page);
      if (current.world.day < current.world.lineages.dao.nextDay) {
        await click(page, "暂搁此卷，先去修炼");
        // Persisted fixture only advances the waiting clock; ending is still chosen through UI.
        current.world.day = current.world.lineages.dao.nextDay;
        await load(page, current);
        await click(page, "族脉");
      }
      await click(page, LINEAGES.dao.chapters[5].choices[0].text);
      current = await read(page);
      assert.equal(current.world.lineages.dao.ending, "万灵有席");
      assert.ok(current.world.politics.truces["chan:jie"] > current.world.day);
      await page.locator(".lineage-ending").scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${out}/ending-${width}.png` });
      await click(page, "继续自己的修行");
      await page.locator(".farm-desk").waitFor();
      await checks(page, errors);
      results.push({ width, name: "trial-real-victory-travel-ending-and-continue", ok: true });

      const affairs = fixture();
      affairs.world.place = "buzhou";
      affairs.world.day = 64;
      affairs.world.politics = createPolitics(64);
      affairs.world.bag = { ore: 6, dew: 8 };
      await load(page, affairs);
      await click(page, "世局");
      await click(page, "支援巫族护路");
      current = await read(page);
      assert.equal(current.world.bag.ore, 3);
      assert.equal(current.world.reputation.wu, 3);
      assert.equal(
        await page.getByRole("button", { name: "支援巫族护路", exact: true }).isDisabled(),
        true,
      );
      await click(page, "替巫族递停战书");
      current = await read(page);
      assert.equal(current.world.bag.dew, 4);
      assert.ok(current.world.politics.truces["wu:yao"] > current.world.day);
      current = applyRoam(current, { type: "idle", what: "wander", now: Date.now() }, () => 0.6);
      await load(page, current);
      await click(page, "世局");
      await page.locator(".affairs-conflicts").scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${out}/affairs-${width}.png` });
      const before = await page.evaluate(() => scrollY);
      const tickBefore = (await read(page)).world.lastTick;
      await page.waitForTimeout(5300);
      assert.ok((await read(page)).world.lastTick > tickBefore, "background fights actually ran");
      assert.ok(
        Math.abs((await page.evaluate(() => scrollY)) - before) <= 2,
        "no background scroll jump",
      );
      await click(page, "修行");
      await click(page, "停下挂机");
      for (
        let i = 0;
        i < 20 && ((await read(page)).stats.life < 95 || (await read(page)).world.wound > 0);
        i++
      )
        await click(page, "调息");
      await click(page, "世局");
      await click(page, "为巫族巡护");
      for (let i = 0; i < 8 && (await read(page)).world.phase === "battle"; i++)
        await click(page, "攻");
      assert.equal((await read(page)).world.reputation.wu, 9);
      await click(page, "世局");
      await checks(page, errors);
      results.push({ width, name: "aid-truce-patrol-real-rewards-and-stable-scroll", ok: true });
    } catch (e) {
      results.push({ width, ok: false, error: e.message });
      await page.screenshot({ path: `${out}/failure-${width}.png` });
    }
    await page.close();
  }
} finally {
  await browser.close();
}
writeFileSync(`${out}/results.json`, JSON.stringify({ url, results }, null, 2));
console.log(JSON.stringify(results, null, 2));
if (results.some((r) => !r.ok)) process.exitCode = 1;
