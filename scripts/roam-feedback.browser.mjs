import assert from "node:assert/strict";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";
import { fresh } from "../src/lib/honghuang/engine.ts";
import { applyRoam, menuActs } from "../src/lib/honghuang/roam/engine.ts";
import { eventById } from "../src/lib/honghuang/roam/events.ts";
import { checkedUrl } from "./browser-guard.mjs";

// Run against a running app: node --experimental-strip-types scripts/roam-feedback.browser.mjs
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/");
const widths = process.argv.includes("--quick") ? [360] : [320, 360, 412];
const output = "/workspace/screenshots/roam-feedback";
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(existsSync(chromium.executablePath()) ? {} : { executablePath: "/usr/bin/chromium" }),
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const results = [];
const key = "honghuang-ji-save";

function fixture() {
  const save = applyRoam(fresh(), { type: "origin", origin: "dao", name: "玄" }, () => 0.5);
  save.sound = false;
  return save;
}

async function world(page) {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key)).state.world, key);
}

async function check(name, width, save, run) {
  const page = await browser.newPage({
    viewport: { width, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  page.setDefaultTimeout(10_000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  try {
    await page.addInitScript(
      ({ key, save }) => localStorage.setItem(key, JSON.stringify({ state: save, version: 1 })),
      { key, save },
    );
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: /继.*续.*此.*生/ }).click();
    await run(page);
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
      "horizontal overflow",
    );
    assert.deepEqual(errors, [], "browser errors");
    if (width === 360)
      await page.screenshot({ path: `${output}/${name}-${width}.png` });
    results.push({ name, width, ok: true });
  } catch (error) {
    results.push({ name, width, ok: false, error: error.message });
  } finally {
    await page.close();
  }
}

try {
  for (const width of widths) {
    const choice = fixture();
    choice.world.phase = "event";
    choice.world.eventId = "stone-1";
    choice.world.place = "buzhou";
    await check("choice-result", width, choice, async (page) => {
      await page.getByRole("button", { name: /埋回山根，拍实/ }).click();
      for (const text of eventById("stone-1").choices.find((choice) => choice.id === "bury")
        .result) {
        await page.getByText(text, { exact: true }).waitFor({ state: "visible" });
      }
      assert.match(await page.getByLabel("已经发生的变化").innerText(), /玄矿/);
    });

    const trading = fixture();
    Object.assign(trading.world, {
      place: "east",
      farm: "east",
      idle: null,
      stones: 50,
      bag: { ore: 1 },
    });
    await check("trade-result", width, trading, async (page) => {
      await page.getByRole("button", { name: "储物", exact: true }).click();
      await page.getByRole("button", { name: "换取灵草 · 2 灵石", exact: true }).click();
      assert.equal((await world(page)).stones, 48);
      assert.equal((await world(page)).bag.herb, 1);
      assert.match(await page.getByLabel("已经发生的变化").innerText(), /灵石 -2/);
      await page.getByRole("button", { name: "售出玄矿 · 3 灵石", exact: true }).click();
      assert.equal((await world(page)).stones, 51);
      assert.equal((await world(page)).bag.ore ?? 0, 0);
      assert.match(await page.getByLabel("已经发生的变化").innerText(), /灵石 \+3/);
      assert.ok(
        await page.getByRole("button", { name: "换取灵草 · 2 灵石", exact: true }).isVisible(),
        "stay in storage",
      );
    });

    const active = fixture();
    await check("controls", width, active, async (page) => {
      await page.getByRole("button", { name: "停下挂机", exact: true }).click();
      const stopped = await world(page);
      assert.equal(stopped.idle, null);
      await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
      if (width === 360) await page.waitForTimeout(5200);
      assert.deepEqual(
        await world(page),
        stopped,
        "stop must survive visibility callbacks and scheduled ticks",
      );
      await page.getByRole("button", { name: "采集", exact: true }).click();
      assert.ok((await world(page)).day > stopped.day);
      const gathered = await world(page);
      await page.getByRole("button", { name: "闭关一日", exact: true }).click();
      assert.ok((await world(page)).day > gathered.day);
      await page.getByRole("button", { name: "游历", exact: true }).click();
      const travel = menuActs(active).find((item) => item.id === "go-tribes");
      assert.ok(travel, "reachable destination");
      await page.getByRole("button", { name: travel.label, exact: true }).click();
      assert.equal((await world(page)).place, "tribes");
      assert.equal((await world(page)).idle, null);
      await page.getByRole("button", { name: "挂机", exact: true }).click();
      await page.getByRole("button", { name: "在此游历挂机", exact: true }).click();
      assert.equal((await world(page)).farm, "tribes");
      if (width === 360) {
        const before = (await world(page)).xiuwei;
        await page.evaluate(() => {
          window.scrollTo(0, document.documentElement.scrollHeight);
          const scrollTo = window.scrollTo.bind(window);
          window.__roamScrollCalls = 0;
          window.scrollTo = (...args) => {
            window.__roamScrollCalls += 1;
            scrollTo(...args);
          };
        });
        await page.waitForTimeout(5200);
        assert.ok((await world(page)).xiuwei > before, "farming resumes");
        assert.equal(
          await page.evaluate(() => window.__roamScrollCalls),
          0,
          "idle tick must not force reading position",
        );
      }
    });
  }
} finally {
  await browser.close();
}
writeFileSync(`${output}/results.json`, JSON.stringify({ url, results }, null, 2));
console.log(JSON.stringify(results, null, 2));
if (results.some((result) => !result.ok)) process.exitCode = 1;
