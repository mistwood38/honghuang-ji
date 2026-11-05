import assert from "node:assert/strict";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";
import { fresh } from "../src/lib/honghuang/engine.ts";
import { applyRoam, menuActs } from "../src/lib/honghuang/roam/engine.ts";
import { eventById } from "../src/lib/honghuang/roam/events.ts";
import { checkedUrl } from "./browser-guard.mjs";

const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/");
const output = "/workspace/screenshots/bronze-actions";
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(existsSync(chromium.executablePath()) ? {} : { executablePath: "/usr/bin/chromium" }),
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const widths = process.argv.includes("--quick") ? [360] : [320, 360, 412, 1280];
const results = [];
const onlyCase = process.argv.find((arg) => arg.startsWith("--case="))?.slice(7);
const key = "honghuang-ji-save";
const read = (page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key)).state, key);
async function settled(page) {
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
  await page.waitForFunction(() => !document.querySelector('.game-action[aria-busy="true"]'));
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
}
async function click(page, label) {
  await page.getByRole("button", { name: label, exact: true }).click();
  await settled(page);
}
function fixture() {
  const save = applyRoam(fresh(), { type: "origin", origin: "yao", name: "玄" }, () => 0.5);
  save.sound = false;
  save.world.idle = null;
  return save;
}
async function check(name, width, save, run, reduced = false) {
  if (onlyCase && onlyCase !== name) return;
  const page = await browser.newPage({
    viewport: { width, height: 844 },
    isMobile: width < 600,
    hasTouch: width < 600,
    reducedMotion: reduced ? "reduce" : "no-preference",
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  try {
    await page.addInitScript(
      ({ key, save }) => {
        if (!localStorage.getItem(key))
          localStorage.setItem(key, JSON.stringify({ state: save, version: 1 }));
      },
      { key, save },
    );
    await page.goto(url);
    await page.getByRole("button", { name: /继.*续.*此.*生/ }).click();
    await run(page);
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    assert.deepEqual(errors, []);
    results.push({ name, width, reduced, ok: true });
  } catch (error) {
    await page.screenshot({ path: `${output}/failure-${name}-${width}.png` });
    results.push({ name, width, ok: false, error: error.message });
  } finally {
    await page.close();
  }
}
async function capture(page, name, width) {
  await page.waitForTimeout(450);
  await page.screenshot({ path: `${output}/${name}-${width}.png` });
}
try {
  for (const width of widths) {
    const save = fixture();
    const event = eventById("stone-1");
    Object.assign(save.world, {
      phase: "event",
      eventId: event.id,
      place: "buzhou",
      report: { title: event.title, paragraphs: event.prose, changes: [] },
    });
    await check("choice-art-lock", width, save, async (page) => {
      const choice = page.getByRole("button", { name: "埋回山根，拍实", exact: true });
      await choice.scrollIntoViewIfNeeded();
      assert.match(
        await choice.evaluate((el) => getComputedStyle(el).backgroundImage),
        /choice-bronze.webp/,
      );
      await page.locator(".choice-list").evaluate((el) => el.scrollIntoView({ block: "start" }));
      await capture(page, "choice", width);
      await choice.evaluate((el) => {
        el.click();
        el.click();
      });
      assert.equal(await page.locator('.game-action[aria-busy="true"]').count(), 1);
      assert.equal(await page.locator(".choice:not(:disabled)").count(), 0);
      await settled(page);
      const after = await read(page);
      assert.equal(after.world.bag.ore, 1, "one click result despite double dispatch");
      assert.equal(after.world.karma.filter((k) => k === "buried-stone").length, 1);
      for (const line of event.choices.find((c) => c.id === "bury").result)
        await page.getByText(line, { exact: true }).waitFor();
    });
    await check("action-art-and-plan", width, fixture(), async (page) => {
      await page.getByRole("button", { name: "撞一场奇遇", exact: true }).scrollIntoViewIfNeeded();
      const missing = await page
        .locator(".roam-actions .game-action--seal")
        .evaluateAll((els) => els.filter((el) => !el.querySelector(".action-emblem")).length);
      assert.equal(missing, 0);
      await capture(page, "actions", width);
      await page.locator(".farm-idle-panel > summary").click();
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
        "expanded farming controls must not widen the mobile page",
      );
      await click(page, "以攻破局");
      assert.equal((await read(page)).world.battlePlan, "assault");
      await page.getByRole("group", { name: "临阵之策" }).scrollIntoViewIfNeeded();
      await capture(page, "tactics", width);
      await page.reload();
      assert.equal((await read(page)).world.battlePlan, "assault");
    });
    const fighter = fixture();
    fighter.stats.dao = 300;
    await check("rift-and-technique", width, fighter, async (page) => {
      await click(page, "闯秘境 · 还剩 3 次");
      assert.equal((await read(page)).world.phase, "battle");
      await page
        .getByRole("button", { name: "借影缚形 · 6 灵气", exact: true })
        .scrollIntoViewIfNeeded();
      await capture(page, "battle", width);
      const before = await read(page);
      await click(page, "借影缚形 · 6 灵气");
      assert.equal((await read(page)).world.lingqi, before.world.lingqi - 6);
      for (let i = 0; i < 8 && (await read(page)).world.phase === "battle"; i++)
        await click(page, "攻");
      assert.equal((await read(page)).world.phase, "free");
      assert.equal((await read(page)).world.stones, 4);
    });
  }
  const longLife = fixture();
  longLife.stats.dao = 40;
  longLife.world.gear = 8;
  await check("twenty-choices", 360, longLife, async (page) => {
    let choices = 0;
    let explorations = 0;
    const visited = { earth: 1 };
    for (let i = 0; i < 90 && choices < 20; i++) {
      const phase = (await read(page)).world.phase;
      if (phase === "free") {
        if (explorations > 0 && explorations % 3 === 0) {
          const trips = menuActs(await read(page)).filter((item) => item.act.type === "travel");
          trips.sort((a, b) => (visited[a.act.place] ?? 0) - (visited[b.act.place] ?? 0));
          const trip = trips[0];
          if (trip) {
            await click(page, "游历");
            await click(page, trip.label);
            visited[trip.act.place] = (visited[trip.act.place] ?? 0) + 1;
            explorations++;
            if ((await read(page)).world.phase !== "free") continue;
            await click(page, "修行");
          }
        }
        await click(page, "撞一场奇遇");
        explorations++;
      } else if (phase === "battle") await click(page, "攻");
      else {
        const first = page.locator(".choice").first();
        assert.doesNotMatch(await first.innerText(), /(?:修为|灵石|道行)\s*\+\d/);
        await first.click();
        await settled(page);
        choices++;
        assert.equal(await page.locator('.game-action[aria-busy="true"]').count(), 0);
        const y = await page.evaluate(() => scrollY);
        await page.waitForTimeout(150);
        assert.equal(
          await page.evaluate(() => scrollY),
          y,
          "reading position settles after explicit navigation",
        );
      }
    }
    assert.equal(choices, 20);
  });
  await check(
    "reduced-motion",
    320,
    fixture(),
    async (page) => {
      await click(page, "闭关一日");
      assert.ok((await read(page)).world.day > 1);
      assert.equal(
        await page
          .locator(".game-action")
          .first()
          .evaluate((el) => getComputedStyle(el).transitionDuration),
        "0s",
      );
    },
    true,
  );
  const legacy = fresh();
  Object.assign(legacy, {
    started: true,
    origin: "dao",
    name: "玄",
    sceneId: "kunlun",
    sound: false,
  });
  await check("legacy-choice-keyboard", 360, legacy, async (page) => {
    const first = page.locator(".choice:not(:disabled)").first();
    await first.scrollIntoViewIfNeeded();
    assert.match(
      await first.evaluate((el) => getComputedStyle(el).backgroundImage),
      /choice-bronze.webp/,
    );
    const before = (await read(page)).log.length;
    await page.keyboard.press("1");
    await page.keyboard.press("1");
    await settled(page);
    assert.equal((await read(page)).log.length, before + 1);
    await capture(page, "legacy-result", 360);
  });
} finally {
  await browser.close();
}
writeFileSync(`${output}/results.json`, JSON.stringify({ url, results }, null, 2));
console.log(JSON.stringify(results, null, 2));
if (results.some((r) => !r.ok)) process.exitCode = 1;
