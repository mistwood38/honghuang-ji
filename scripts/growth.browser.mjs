import assert from "node:assert/strict";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";
import { fresh } from "../src/lib/honghuang/engine.ts";
import { ITEMS } from "../src/lib/honghuang/world.ts";
import { applyRoam } from "../src/lib/honghuang/roam/engine.ts";
import { TECHNIQUES } from "../src/lib/honghuang/roam/techniques.ts";
import { checkedUrl } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/");
const out = "/workspace/screenshots/growth";
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
async function load(page, save) {
  await page.goto(url);
  await page.evaluate(
    (save) =>
      localStorage.setItem("honghuang-ji-save", JSON.stringify({ state: save, version: 1 })),
    save,
  );
  await page.reload();
  await page.locator(".title-screen, .farm-desk").first().waitFor();
  if (await page.locator(".title-screen").count()) await click(page, /继.*续.*此.*生/);
  await page.locator(".farm-desk").waitFor();
}
try {
  for (const width of process.argv.includes("--quick") ? [360] : [320, 360, 412, 1280]) {
    const page = await browser.newPage({
      viewport: { width, height: 844 },
      isMobile: width < 600,
      hasTouch: width < 600,
    });
    if (width === 360) await page.emulateMedia({ reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    try {
      const save = applyRoam(fresh(), { type: "origin", origin: "dao", name: "行者" }, () => 0.6);
      save.sound = false;
      save.stats.life = 60;
      save.stats.dao = 26;
      save.items = Object.keys(ITEMS);
      save.flags = ["old-story"];
      save.world.idle = null;
      save.world.lingqi = 40;
      save.world.stones = 20;
      save.world.bag = { dew: 10, ore: 5 };
      save.world.arts = Object.keys(TECHNIQUES);
      delete save.world.relic;
      delete save.world.insights;
      await load(page, save);
      await click(page, "储物");
      await page.getByRole("region", { name: "御器", exact: true }).waitFor();
      await click(page, "御使盘古骨");
      assert.equal((await read(page)).world.relic, "pangu-bone");
      assert.deepEqual((await read(page)).items, save.items);
      await page.getByRole("status", { name: "御器结果" }).scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${out}/relic-${width}.png` });
      for (const item of Object.values(ITEMS)) {
        await page.locator(".relic-use .relic-card").filter({ hasText: item.name }).click();
        const dialog = page.getByRole("dialog");
        await dialog.waitFor();
        assert.equal(await dialog.locator(".item-art-large").count(), 1);
        assert.ok((await dialog.textContent()).includes("开放游历中可在储物页御使"));
        await page.keyboard.press("Escape");
        await dialog.waitFor({ state: "hidden" });
      }
      await click(page, "御使诛仙剑意");
      await page.reload();
      await page.locator(".farm-desk").waitFor();
      await click(page, "储物");
      assert.equal((await read(page)).world.relic, "zhuxian");
      assert.ok((await read(page)).flags.includes("old-story"));
      await click(page, "收起御器");
      assert.equal((await read(page)).world.relic, null);
      results.push({ width, name: "legacy-possessions-nine-details-equip-switch-save", ok: true });
      await click(page, "功法");
      for (const name of ["主修清净吐纳", "参悟清净吐纳·会通"]) {
        assert.ok(
          (
            await page
              .getByRole("button", { name, exact: true })
              .evaluate((el) => getComputedStyle(el).backgroundImage)
          ).includes("choice-bronze.webp"),
          `${name} must retain its painted action surface`,
        );
      }
      await page
        .getByRole("button", { name: "参悟清净吐纳·会通", exact: true })
        .scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${out}/study-choice-${width}.png` });
      await click(page, "参悟清净吐纳·会通");
      let current = await read(page);
      assert.equal(current.world.insights.qingjing, 1);
      assert.equal(current.world.stones, 16);
      assert.equal(current.world.bag.dew, 8);
      assert.equal(current.world.lingqi, 34);
      assert.equal(
        await page.getByRole("button", { name: "参悟清净吐纳·会通", exact: true }).count(),
        0,
      );
      await click(page, "参悟清净吐纳·圆融");
      current = await read(page);
      assert.equal(current.world.insights.qingjing, 2);
      assert.equal(current.world.stones, 6);
      assert.equal(current.world.bag.dew, 4);
      assert.equal(current.world.bag.ore, 3);
      assert.equal(current.world.lingqi, 24);
      await page.getByRole("status", { name: "参悟结果" }).scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${out}/insight-${width}.png` });
      await page.reload();
      await page.locator(".farm-desk").waitFor();
      assert.equal((await read(page)).world.insights.qingjing, 2);
      await click(page, /^闯秘境/);
      const qi = (await read(page)).world.lingqi;
      await click(page, "息归一元 · 3 灵气");
      current = await read(page);
      assert.equal(current.world.lingqi, qi - 3);
      assert.ok(current.world.battle.log.some((line) => line.includes("道躯 +8")));
      await page.locator(".roam-battle").scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${out}/battle-${width}.png` });
      results.push({
        width,
        name: "two-comprehensions-pay-once-persist-and-change-real-combat",
        ok: true,
      });
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(errors, []);
      results.push({ width, name: "layout-and-console", ok: true });
    } catch (e) {
      results.push({ width, ok: false, error: e.message });
      await page.screenshot({ path: `${out}/failure-${width}.png` });
    } finally {
      await page.close();
    }
  }
} finally {
  await browser.close();
}
writeFileSync(`${out}/results.json`, JSON.stringify({ url, results }, null, 2));
console.log(JSON.stringify(results, null, 2));
if (results.some((r) => !r.ok)) process.exitCode = 1;
