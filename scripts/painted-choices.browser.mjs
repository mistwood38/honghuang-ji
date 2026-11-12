import assert from "node:assert/strict";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";
import { fresh } from "../src/lib/honghuang/engine.ts";
import { applyRoam } from "../src/lib/honghuang/roam/engine.ts";
import { LINEAGES, normalizeLineages } from "../src/lib/honghuang/roam/lineages.ts";
import { GOODS } from "../src/lib/honghuang/roam/catalog.ts";
import { SCENES } from "../src/lib/honghuang/story.ts";
import { checkedUrl } from "./browser-guard.mjs";

const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/");
const out = "/workspace/screenshots/painted-choices";
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(existsSync(chromium.executablePath()) ? {} : { executablePath: "/usr/bin/chromium" }),
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const results = [];
const read = (page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("honghuang-ji-save")).state);
async function settle(page) {
  await page.waitForFunction(() => !document.querySelector('.game-action[aria-busy="true"]'));
  await page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
}
async function click(page, name) {
  await page.getByRole("button", { name, exact: true }).click();
  await settle(page);
}
function fixture(origin, stage = 0) {
  const save = applyRoam(fresh(), { type: "origin", origin, name: "行者" }, () => 0.6);
  save.sound = false;
  save.world.idle = null;
  save.world.day = 10;
  save.world.place = LINEAGES[origin].chapters[stage].place;
  save.world.lineages = normalizeLineages({
    [origin]: {
      history: LINEAGES[origin].chapters
        .slice(0, stage)
        .map((ch, chapter) => ({ chapter, choice: ch.choices[0].id, day: chapter + 1 })),
    },
  });
  return save;
}
async function load(page, save, tab = "族脉") {
  await page.goto(url);
  await page.evaluate(
    (save) =>
      localStorage.setItem("honghuang-ji-save", JSON.stringify({ state: save, version: 1 })),
    save,
  );
  await page.reload();
  await page.locator(".title-screen, .farm-desk, .scene-reading-panel").first().waitFor();
  if (await page.locator(".title-screen").count())
    await page.getByRole("button", { name: /继.*续.*此.*生/ }).click();
  if (tab) await click(page, tab);
}
async function readable(page, locator) {
  const geometry = await locator.evaluate((target) => {
    const box = target.getBoundingClientRect(),
      header = document.querySelector(".game-header").getBoundingClientRect().bottom;
    const bottom = Math.min(
      innerHeight,
      document.querySelector(".dock").getBoundingClientRect().top,
    );
    return { y: box.top, height: box.height, header, bottom };
  });
  const { y, height, header, bottom } = geometry;
  assert.ok(y >= header + 10, JSON.stringify(geometry));
  assert.ok(
    bottom - y >= Math.min(height, (bottom - header - 12) * 0.65) - 2,
    `insufficient reading room: ${JSON.stringify(geometry)}`,
  );
}
try {
  const cases = process.argv.includes("--quick")
    ? [[360, "wu"]]
    : [
        [320, "dao"],
        [360, "wu"],
        [412, "yao"],
        [1280, "ren"],
      ];
  for (const [width, origin] of cases) {
    const page = await browser.newPage({
      viewport: { width, height: 844 },
      isMobile: width < 600,
      hasTouch: width < 600,
      reducedMotion: width === 360 ? "reduce" : "no-preference",
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    try {
      await load(page, fixture(origin));
      const group = page.getByRole("group", { name: "此章抉择", exact: true });
      const buttons = group.locator(".game-action--vow");
      assert.equal(await buttons.count(), 2);
      const art = await buttons.first().evaluate(async (el) => {
        const css = getComputedStyle(el),
          image = new Image();
        image.src = css.borderImageSource.match(/url\(["']?(.*?)["']?\)/)[1];
        await image.decode();
        const rect = el.getBoundingClientRect();
        return {
          source: image.src,
          width: image.naturalWidth,
          height: image.naturalHeight,
          slice: css.borderImageSlice,
          touchHeight: rect.height,
          textWidth: el.querySelector(".action-copy").getBoundingClientRect().width,
        };
      });
      assert.ok(art.source.endsWith(`/art/choice-${origin}.webp`));
      assert.equal(art.width, 1024);
      assert.equal(art.height, 256);
      assert.equal(art.slice, "48 fill");
      assert.ok(art.touchHeight >= 44 && art.textWidth >= 120);
      const emblems = await buttons
        .locator(".action-emblem")
        .evaluateAll((els) => els.map((el) => el.className));
      assert.notEqual(
        emblems[0],
        emblems[1],
        "the two actions have distinct painted intent emblems",
      );
      await group.scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${out}/choices-${width}.png` });
      results.push({
        width,
        origin,
        name: "original-nine-slice-material-readable-labels-and-intent-art",
        ok: true,
      });

      const chosen = buttons.first();
      await chosen.focus();
      await chosen.evaluate((el) => {
        window.__choiceBusy = false;
        const observer = new MutationObserver(() => {
          if (el.getAttribute("aria-busy") === "true") window.__choiceBusy = true;
        });
        observer.observe(el, { attributes: true, attributeFilter: ["aria-busy"] });
        el.addEventListener(
          "click",
          () => {
            queueMicrotask(() => el.click());
          },
          { once: true },
        );
      });
      await page.keyboard.press("Enter");
      await settle(page);
      const changed = await read(page);
      assert.equal(
        changed.world.lineages[origin].stage,
        1,
        "keyboard activation and rapid second click commit only once",
      );
      assert.equal(changed.world.lineages[origin].history.length, 1);
      if (width !== 360) assert.equal(await page.evaluate(() => window.__choiceBusy), true);
      const outcome = page.getByRole("status", { name: "族脉行动结果", exact: true });
      await readable(page, outcome);
      await page.screenshot({ path: `${out}/result-${width}.png` });
      await click(page, "续读下一章");
      await readable(page, page.locator(".lineage-chapter"));
      assert.deepEqual(await read(page), changed, "continuation remains free reading");
      results.push({
        width,
        origin,
        name: "keyboard-commit-lock-and-long-result-reading-space",
        ok: true,
      });
      await click(page, "修行");
      const rift = page.getByRole("button", { name: /^闯秘境 · 还剩/ });
      assert.equal(
        await rift.getAttribute("aria-describedby"),
        null,
        "cost already in the accessible name is not announced twice",
      );

      const costly = LINEAGES[origin].chapters[2].choices.find((c) => c.cost),
        costSave = fixture(origin, 2);
      costSave.world.bag[costly.cost.good] = 0;
      await load(page, costSave);
      const costButton = page.getByRole("button", { name: costly.text, exact: true });
      assert.equal(await costButton.isDisabled(), true);
      const expected = `需 ${costly.cost.count} ${GOODS[costly.cost.good]}`;
      const description = await costButton.evaluate((el) => ({
        name: el.getAttribute("aria-label"),
        text: (el.getAttribute("aria-describedby") ?? "")
          .split(/\s+/)
          .map((id) => document.getElementById(id)?.textContent ?? "")
          .join(" "),
      }));
      assert.equal(description.name, costly.text);
      assert.equal(description.text, expected);
      const before = await read(page);
      await costButton.evaluate((el) => el.click());
      assert.deepEqual(await read(page), before, "insufficient materials cannot commit");
      await costButton.scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${out}/cost-${width}.png` });
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(errors, []);
      results.push({
        width,
        origin,
        name: "disabled-cost-hint-accessible-and-save-unchanged",
        ok: true,
      });
      const legacy = fresh();
      legacy.started = true;
      legacy.screen = "play";
      legacy.sound = false;
      await load(page, legacy, null);
      const firstScene = SCENES.find((scene) => scene.id === "awaken");
      for (const option of firstScene.choices) {
        const button = page.getByRole("button", { name: option.text, exact: true });
        const description = await button.evaluate(
          (el) => document.getElementById(el.getAttribute("aria-describedby"))?.textContent,
        );
        assert.equal(
          description,
          option.sub,
          "custom story content has an accessible hint as well",
        );
      }
      assert.deepEqual(errors, []);
      results.push({
        width,
        origin,
        name: "legacy-story-hints-remain-readable-with-custom-button-content",
        ok: true,
      });
    } catch (error) {
      results.push({ width, origin, ok: false, error: error.message });
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
