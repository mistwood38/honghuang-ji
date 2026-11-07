import assert from "node:assert/strict";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";
import { fresh } from "../src/lib/honghuang/engine.ts";
import { applyRoam } from "../src/lib/honghuang/roam/engine.ts";
import { LINEAGES, normalizeLineages } from "../src/lib/honghuang/roam/lineages.ts";
import { checkedUrl } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/");
const widths = process.argv.includes("--quick") ? [360] : [320, 360, 412, 1280];
const out = "/workspace/screenshots/reading-flow";
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
  await page.getByRole("button", { name, exact: true }).click();
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
  await page.evaluate(
    (save) =>
      localStorage.setItem("honghuang-ji-save", JSON.stringify({ state: save, version: 1 })),
    save,
  );
  await page.reload();
  await page.locator(".title-screen, .farm-desk").first().waitFor();
  if (await page.locator(".title-screen").count())
    await page.getByRole("button", { name: /继.*续.*此.*生/ }).click();
  await page.locator(".farm-desk").waitFor();
}
async function resultInView(page, label) {
  const locator = page.getByRole("status", { name: label });
  assert.equal(await locator.count(), 1);
  const box = await locator.boundingBox();
  const header = await page.locator(".game-header").boundingBox();
  assert.ok(
    box.y >= header.y + header.height - 2 && box.y < 650,
    `result start outside reading area: ${box.y}`,
  );
}
async function escape(page) {
  for (let n = 0; n < 10 && (await read(page)).world.phase === "battle"; n++)
    await click(page, "脱身");
  assert.equal((await read(page)).world.phase, "free");
}
const cases = {
  async "lineage-result-and-explicit-continuation"(page, width) {
    await load(page, fixture());
    await click(page, "族脉");
    await click(page, "展开这一族的长卷");
    await click(page, LINEAGES.dao.chapters[0].choices[1].text);
    await resultInView(page, "族脉行动结果");
    assert.equal((await read(page)).world.lineages.dao.stage, 1);
    assert.equal(
      await page.locator(".lineage-chapter h3").textContent(),
      LINEAGES.dao.chapters[0].title,
    );
    assert.equal(
      await page
        .getByRole("button", { name: LINEAGES.dao.chapters[0].choices[1].text, exact: true })
        .count(),
      0,
    );
    await page.screenshot({ path: `${out}/result-${width}.png` });
    const before = await read(page);
    await click(page, "续读下一章");
    assert.equal(
      await page.locator(".lineage-chapter h3").textContent(),
      LINEAGES.dao.chapters[1].title,
    );
    assert.deepEqual(await read(page), before, "reading next chapter is not another paid action");
    await page.reload();
    await page.locator(".farm-desk").waitFor();
    await click(page, "族脉");
    assert.equal((await read(page)).world.lineages.dao.stage, 1);
  },
  async "aid-result-stays-by-faction-controls"(page, width) {
    const save = fixture();
    save.world.place = "buzhou";
    save.world.bag = { ore: 6, dew: 8 };
    await load(page, save);
    await click(page, "世局");
    await click(page, "支援巫族护路");
    await resultInView(page, "世局行动结果");
    assert.equal((await read(page)).world.bag.ore, 3);
    const parent = page
      .getByRole("status", { name: "世局行动结果" })
      .locator("xpath=ancestor::details");
    assert.equal(await parent.count(), 1, "result belongs to the faction acted upon");
    await page.screenshot({ path: `${out}/aid-${width}.png` });
    await click(page, "替巫族递停战书");
    await resultInView(page, "世局行动结果");
    assert.equal((await read(page)).world.bag.dew, 4);
  },
  async "trial-and-patrol-return-to-their-panel"(page) {
    const save = fixture();
    save.world.place = "edge";
    save.world.lineages.dao = normalizeLineages({
      dao: {
        history: LINEAGES.dao.chapters
          .slice(0, 4)
          .map((ch, chapter) => ({ chapter, choice: ch.choices[0].id, day: 1 })),
      },
    }).dao;
    await load(page, save);
    await click(page, "族脉");
    await click(page, "直面这一场");
    await page.reload();
    await page.locator(".roam-battle").waitFor();
    await escape(page);
    assert.equal(
      await page.getByRole("button", { name: "族脉", exact: true }).getAttribute("aria-pressed"),
      "true",
    );
    const patrol = fixture();
    patrol.world.place = "buzhou";
    await load(page, patrol);
    await click(page, "世局");
    await click(page, "为巫族巡护");
    await escape(page);
    assert.equal(
      await page.getByRole("button", { name: "世局", exact: true }).getAttribute("aria-pressed"),
      "true",
    );
    const top = await page.locator("#roam-now").boundingBox();
    assert.ok(top.y >= 0 && top.y < 200, "battle outcome remains visible");
  },
};
try {
  for (const width of widths)
    for (const [name, run] of Object.entries(cases)) {
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
        await run(page, width);
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
          false,
        );
        assert.deepEqual(errors, []);
        results.push({ name, width, ok: true });
      } catch (e) {
        results.push({ name, width, ok: false, error: e.message });
        await page.screenshot({ path: `${out}/failure-${name}-${width}.png` });
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
