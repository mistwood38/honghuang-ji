import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { chromium } from "playwright";
import { fresh } from "../src/lib/honghuang/engine.ts";
import { applyRoam } from "../src/lib/honghuang/roam/engine.ts";
import { checkedUrl } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/");
const out = "/workspace/screenshots/living-world";
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
    const save = applyRoam(fresh(), { type: "origin", origin: "wu", name: "行者" }, () => 0.6);
    save.sound = false;
    save.world.idle = null;
    save.world.arts.push("form", "qingjing");
    save.stats.life = 80;
    delete save.world.living;
    delete save.world.prepared;
    save.items = ["pangu-bone"];
    save.flags = ["old-footprints"];
    await page.addInitScript((save) => {
      if (!localStorage.getItem("honghuang-ji-save"))
        localStorage.setItem("honghuang-ji-save", JSON.stringify({ state: save, version: 1 }));
    }, save);
    try {
      await page.goto(url);
      await click(page, /继.*续.*此.*生/);
      await click(page, "游历");
      await page.getByRole("region", { name: "此地山河与来往之人" }).waitFor();
      await click(page, "走近断流石堰");
      assert.equal((await read(page)).world.living.sites["earth-ruin"].visited, true);
      await click(page, "负石定山根");
      assert.equal((await read(page)).stats.life, 72);
      assert.equal((await read(page)).world.living.sites["earth-ruin"].state, "mending");
      await page.locator(".local-sites").scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${out}/local-${width}.png` });
      await click(page, "走近青芽滩");
      await click(page, "采撷青芽滩");
      assert.equal((await read(page)).world.bag.herb, 2);
      assert.equal(
        await page.getByRole("button", { name: "采撷青芽滩", exact: true }).isDisabled(),
        true,
      );
      await click(page, "接下青荇的托付");
      await page.locator(".local-people").scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${out}/people-${width}.png` });
      await click(page, "循路往昆仑");
      await click(page, "送达青荇所托");
      assert.equal((await read(page)).world.living.errands.qingxing.stage, "delivered");
      assert.equal((await read(page)).world.bag.herb, undefined);
      await click(page, "循路往洪荒大地");
      await click(page, "向青荇复命");
      let current = await read(page);
      assert.equal(current.world.living.errands.qingxing.stage, "done");
      assert.equal(current.world.stones, 5);
      assert.equal(current.world.living.sites["earth-ruin"].state, "restored");
      assert.equal(await page.getByRole("button", { name: "向青荇复命", exact: true }).count(), 0);
      assert.deepEqual(current.items, save.items);
      assert.deepEqual(current.flags, save.flags);
      results.push({ width, name: "old-save-local-repair-delivery-return", ok: true });
      await click(page, "修行");
      await click(page, "在此游历挂机");
      await click(page, "游历");
      await page.locator(".local-people").scrollIntoViewIfNeeded();
      const scroll = await page.evaluate(() => scrollY),
        day = (await read(page)).world.day;
      await page.waitForTimeout(5300);
      assert.ok(
        Math.abs((await page.evaluate(() => scrollY)) - scroll) < 3,
        "idle cannot pull a local-world reader away",
      );
      assert.equal((await read(page)).world.day, day);
      await click(page, "修行");
      await click(page, "停下挂机");
      results.push({ width, name: "idle-keeps-local-reading-position", ok: true });
      await click(page, "功法");
      await page.getByRole("combobox", { name: "辅修1", exact: true }).selectOption("qingjing");
      await page.getByRole("combobox", { name: "辅修2", exact: true }).selectOption("form");
      assert.deepEqual((await read(page)).world.prepared, ["qingjing", "form"]);
      await page.locator(".prepared-loadout").scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${out}/loadout-${width}.png` });
      await page.reload();
      await page.locator(".farm-desk").waitFor();
      assert.deepEqual((await read(page)).world.prepared, ["qingjing", "form"]);
      await click(page, /^闯秘境/);
      const qi = (await read(page)).world.lingqi;
      await click(page, "借影缚形 · 6 灵气");
      current = await read(page);
      assert.equal(current.world.lingqi, qi - 6);
      assert.ok(current.world.battle.log.some((line) => line.includes("借影缚形")));
      await page.locator(".roam-battle").scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${out}/battle-${width}.png` });
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(errors, []);
      results.push({ width, name: "prepared-loadout-persists-and-acts-in-battle", ok: true });
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
