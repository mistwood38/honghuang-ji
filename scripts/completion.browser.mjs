/** Consolidated completion checks. Fixture saves only on a guarded local server. */
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";
import { fresh } from "../src/lib/honghuang/engine.ts";
import { ITEMS } from "../src/lib/honghuang/world.ts";
import { CHAPTERS } from "../src/lib/honghuang/novel.ts";
import { ART, CHAPTER_ART } from "../src/lib/honghuang/visuals.ts";
import { applyRoam, menuActs } from "../src/lib/honghuang/roam/engine.ts";
import { RELIC_JOURNEYS, RELIC_JOURNEY_EVENTS } from "../src/lib/honghuang/roam/relic-journeys.ts";
import { checkedUrl } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/");
const out = `/workspace/screenshots/complete-experience/${new URL(url).port === "8081" ? "production" : "development"}`;
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const results = [];
const read = (page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("honghuang-ji-save")).state);
async function settle(page) {
  await page.waitForFunction(() => !document.querySelector('.game-action[aria-busy="true"]'));
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
}
async function click(page, name) {
  await page.getByRole("button", { name, exact: typeof name === "string" }).click();
  await settle(page);
}
function fixture() {
  const save = applyRoam(fresh(), { type: "origin", origin: "dao", name: "行者" }, () => 0);
  save.sound = false;
  save.world.idle = null;
  save.world.lingqi = 80;
  save.stats.life = 100;
  save.flags = ["old-story"];
  save.world.bag = { ore: 20, herb: 20, dew: 20, seed: 20, clay: 20 };
  return save;
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
async function nav(page, name, selector) {
  await page
    .getByRole("navigation", { name: "游戏主导航" })
    .getByRole("button", { name: new RegExp(`^${name}`) })
    .click();
  await page.locator(selector).waitFor();
  await settle(page);
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    false,
    `${name}: overflow`,
  );
}
async function screen(page, name, width) {
  await page.waitForTimeout(250); // Let finite modal/page entrance animations finish before capture.
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images].filter((i) => i.complete).map((i) => i.decode().catch(() => {})),
    );
  });
  await page.screenshot({ path: `${out}/${name}-${width}.png` });
}
try {
  for (const width of process.argv.includes("--quick") ? [360] : [320, 360, 412, 1280]) {
    const page = await browser.newPage({
      viewport: { width, height: 844 },
      reducedMotion: width === 360 ? "reduce" : "no-preference",
    });
    page.setDefaultTimeout(12000);
    await page.addInitScript(() => {
      Math.random = () => 0;
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    try {
      const save = fixture();
      save.items = Object.keys(ITEMS);
      await load(page, save);
      await click(page, "储物");
      for (const item of Object.values(ITEMS)) {
        await page.locator(".relic-use .relic-card").filter({ hasText: item.name }).click();
        const dialog = page.getByRole("dialog");
        await dialog.waitFor();
        const art = dialog.locator(".item-art-large");
        const image = await art.evaluate((el) => getComputedStyle(el).backgroundImage);
        assert.ok(image.includes("/art/relic-icons.webp"), image);
        const box = await art.boundingBox();
        assert.ok(box.x >= 0 && box.x + box.width <= width && box.width <= 240);
        if (item.id === "pangu-bone" || item.name === "盘古骨")
          await screen(page, "relic-detail", width);
        await page.keyboard.press("Escape");
        await dialog.waitFor({ state: "hidden" });
      }
      results.push({ width, name: "nine HD relic details fit and close", ok: true });
      await nav(page, "山河", ".atlas-page");
      await page.locator(".atlas-map button").last().click();
      await page.locator(".atlas-detail").scrollIntoViewIfNeeded();
      await screen(page, "atlas", width);
      await nav(page, "我的", ".self-page");
      await screen(page, "character", width);
      await nav(page, "本纪", ".reader-page");
      const chapters = width === 360 ? CHAPTERS : [CHAPTERS[0], CHAPTERS[15], CHAPTERS.at(-1)];
      for (const chapter of chapters) {
        if (width < 1000) await page.locator(".reader-mobile-directory summary").click();
        const directory = page.locator(
          width < 1000 ? ".reader-mobile-directory" : ".reader-directory",
        );
        await directory.getByRole("button").filter({ hasText: chapter.title }).click();
        const img = page.locator(".reader-leaf-art img");
        await img.evaluate(async (el) => {
          el.loading = "eager";
          await el.decode();
        });
        const src = await img.evaluate((el) => new URL(el.currentSrc).pathname);
        const art = ART[CHAPTER_ART[chapter.id]];
        assert.ok([art.src, art.small].includes(src), `${chapter.id}: ${src}`);
        assert.ok((await page.locator(".reader-copy").innerText()).includes(chapter.paragraphs[0]));
      }
      await page.locator(".reader-leaf-art").scrollIntoViewIfNeeded();
      await screen(page, "reader", width);
      assert.equal((await read(page)).novelIndex, 29);
      await nav(page, "天书", ".codex-page");
      for (const [category, key] of [
        ["法宝", "relics"],
        ["山河", "worldmap"],
      ]) {
        await page
          .getByRole("navigation", { name: "天书分类" })
          .getByRole("button", { name: new RegExp(`^${category}`) })
          .click();
        const img = page.locator(".codex-section-heading img");
        await img.evaluate(async (el) => {
          el.loading = "eager";
          await el.decode();
        });
        assert.ok(
          [ART[key].src, ART[key].small].includes(
            await img.evaluate((el) => new URL(el.currentSrc).pathname),
          ),
        );
      }
      await page.locator(".codex-section").scrollIntoViewIfNeeded();
      await screen(page, "codex", width);
      await nav(page, "入世", ".farm-desk");
      assert.deepEqual((await read(page)).items, save.items);
      assert.deepEqual((await read(page)).flags, save.flags);
      results.push({
        width,
        name: "all five lazy pages, map browsing, chapter art and codex",
        ok: true,
      });
      if (width === 360) {
        for (const [i, item] of ["pangu-bone", "zhuxian", "xirang"].entries()) {
          const chain = RELIC_JOURNEYS[i];
          const first = RELIC_JOURNEY_EVENTS.find((e) => e.id === chain.stages[0]);
          const second = RELIC_JOURNEY_EVENTS.find((e) => e.id === chain.stages[1]);
          const questSave = fixture();
          questSave.world.place = first.place;
          await load(page, questSave);
          await click(page, "撞一场奇遇");
          assert.equal((await read(page)).world.eventId, first.id);
          await screen(page, `quest-${item}`, width);
          await click(page, first.choices[0].text);
          await click(page, "洞府");
          await click(page, `继续「${chain.name}」`);
          await click(page, second.choices[0].text);
          await click(page, "修行");
          let state = await read(page);
          const due = state.world.delayed.find((e) => e.event.endsWith("-gift"));
          while (state.world.day <= due.due && state.world.phase === "free") {
            await click(page, "调息");
            state = await read(page);
          }
          assert.equal(state.world.eventId, due.event);
          await click(page, RELIC_JOURNEY_EVENTS.find((e) => e.id === due.event).choices[0].text);
          await click(page, "储物");
          await click(page, `御使${ITEMS[item].name}`);
          assert.equal((await read(page)).world.relic, item);
          await page.reload();
          await page.locator(".farm-desk").waitFor();
          assert.equal((await read(page)).items.filter((id) => id === item).length, 1);
          results.push({ width, name: `${item}: full discover-to-equip UI and reload`, ok: true });
        }
        const gate = fixture();
        gate.stats.dao = 11;
        gate.world.layer = 9;
        gate.world.xiuwei = 100;
        await load(page, gate);
        await page.evaluate(() => {
          Math.random = () => 0.6;
        });
        await click(page, menuActs(gate).find((a) => a.act.type === "cultivate").label);
        assert.equal((await read(page)).stats.dao, 11);
        assert.match(await page.locator(".roam-after").innerText(), /关口/);
        await page.evaluate(() => {
          Math.random = () => 0;
        });
        await click(page, "破开大境界");
        assert.equal((await read(page)).stats.dao, 12);
        results.push({
          width,
          name: "cultivation respects gate; explicit breakthrough opens it",
          ok: true,
        });
        const run = fixture();
        run.world.place = "earth";
        await load(page, run);
        await page.evaluate(() => {
          const original = window.scrollTo.bind(window);
          window.__topJumps = 0;
          window.scrollTo = (...args) => {
            if ((typeof args[0] === "object" ? args[0].top : args[1]) === 0) window.__topJumps++;
            original(...args);
          };
        });
        let choices = 0;
        const visits = { earth: 1 },
          events = [];
        for (let step = 0; step < 80 && choices < 20; step++) {
          await click(page, "调息");
          if ((await read(page)).world.phase === "free") await click(page, "撞一场奇遇");
          let state = await read(page);
          if (state.world.phase === "event") {
            events.push(state.world.eventId);
            await page.locator(".choice-list button.choice").first().click();
            await settle(page);
            choices++;
            if ((await read(page)).world.phase === "battle") await click(page, "脱身");
            assert.equal((await read(page)).world.phase, "free", `choice ${choices}`);
            assert.ok(await page.evaluate(() => scrollY > 0));
            assert.ok((await page.locator(".roam-prose").innerText()).length > 15);
          } else {
            // A quiet day is legitimate. Travel to the least-visited reachable region.
            const route = menuActs(state)
              .filter((a) => a.act.type === "travel")
              .sort((a, b) => (visits[a.act.place] ?? 0) - (visits[b.act.place] ?? 0))[0];
            assert.ok(route, "an exhausted region still has a reachable road");
            await click(page, "游历");
            await click(page, route.label);
            visits[route.act.place] = (visits[route.act.place] ?? 0) + 1;
            state = await read(page);
            if (state.world.phase === "battle") await click(page, "脱身");
            if ((await read(page)).world.phase === "event") {
              events.push((await read(page)).world.eventId);
              await page.locator(".choice-list button.choice").first().click();
              await settle(page);
              choices++;
              if ((await read(page)).world.phase === "battle") await click(page, "脱身");
            }
            await click(page, "修行");
          }
        }
        assert.equal(choices, 20);
        assert.equal(await page.evaluate(() => window.__topJumps), 0);
        results.push({
          width,
          name: "20 consecutive explorations/choices retain local reading and never scroll to top",
          events,
          regions: Object.keys(visits),
          ok: true,
        });
      }
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(errors, []);
      results.push({ width, name: "console and layout", ok: true });
    } catch (error) {
      results.push({ width, ok: false, error: error.stack });
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
