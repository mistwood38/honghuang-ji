import assert from "node:assert/strict";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";
import { fresh } from "../src/lib/honghuang/engine.ts";
import { applyRoam } from "../src/lib/honghuang/roam/engine.ts";
import { PEOPLE } from "../src/lib/honghuang/roam/local-world.ts";
import { LINEAGES, normalizeLineages } from "../src/lib/honghuang/roam/lineages.ts";
import { lineageEcho } from "../src/lib/honghuang/roam/lineage-echoes.ts";
import { wayfarerScene } from "../src/lib/honghuang/roam/wayfarer-dialogue.ts";
import { checkedUrl } from "./browser-guard.mjs";

const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/");
const out = "/workspace/screenshots/epic-encounters";
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(existsSync(chromium.executablePath()) ? {} : { executablePath: "/usr/bin/chromium" }),
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const results = [];
const read = (page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("honghuang-ji-save")).state);
async function click(page, name, within = page) {
  await within.getByRole("button", { name, exact: typeof name === "string" }).click();
  await page.waitForFunction(() => !document.querySelector('.game-action[aria-busy="true"]'));
  await page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
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
function fixture(origin) {
  const save = applyRoam(fresh(), { type: "origin", origin, name: "行者" }, () => 0.6);
  save.sound = false;
  save.world.idle = null;
  save.stats.dao = 26;
  save.world.bag = { herb: 10, ore: 10, salt: 10, seed: 10 };
  save.world.lingqi = 80;
  save.items = ["pangu-bone"];
  save.flags = ["old-story"];
  return save;
}
async function checkArt(page, id, ratio) {
  const art = page.locator(`.painted-atlas[data-art-id="${id}"]`).first();
  await art.scrollIntoViewIfNeeded();
  await art.locator("img").evaluate(async (img) => {
    await img.decode();
  });
  const rect = await art.boundingBox();
  assert.ok(Math.abs(rect.width / rect.height - ratio) < 0.03, `${id} atlas must not stretch`);
  const source = await art.locator("img").evaluate((img) => img.currentSrc);
  if (page.viewportSize().width < 641) assert.ok(source.includes("-small.webp"));
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
    });
    if (width === 360) await page.emulateMedia({ reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    try {
      const person = PEOPLE.find((p) => p.origin === origin),
        save = fixture(origin);
      save.world.place = person.route[0];
      const first = wayfarerScene(save, person.id, "road");
      await load(page, save);
      await click(page, "游历");
      const card = page.getByRole("article", { name: person.name, exact: true });
      await checkArt(page, person.id, 1);
      await click(page, `与${person.name}交谈`, card);
      const dialogue = page.getByRole("region", { name: `${person.name}对话`, exact: true });
      assert.ok((await dialogue.textContent()).includes(first.paragraphs[0]));
      const beforeTopics = await read(page),
        variants = [];
      for (const name of ["谈往事", "说牵挂", "问沿途"]) {
        await click(page, name, card);
        variants.push(await dialogue.textContent());
      }
      assert.equal(new Set(variants).size, 3);
      assert.deepEqual(
        await read(page),
        beforeTopics,
        "reading dialogue costs nothing and does not farm relationships",
      );
      await card.scrollIntoViewIfNeeded();
      await dialogue
        .locator(".wayfarer-spoken")
        .evaluate((element) =>
          Promise.all(element.getAnimations().map((animation) => animation.finished)),
        );
      await page.screenshot({ path: `${out}/person-${width}.png` });
      await click(page, "谈往事", card);
      await click(page, `与${person.name}交谈`, card);
      assert.equal(
        await card
          .getByRole("button", { name: "问沿途", exact: true })
          .getAttribute("aria-pressed"),
        "true",
        "fresh conversation must reveal its own reply after another topic",
      );
      const talked = await read(page);
      assert.ok((await dialogue.textContent()).includes(talked.world.report.paragraphs[0]));
      await click(page, `接下${person.name}的托付`, card);
      await click(page, "说牵挂", card);
      assert.match(await dialogue.textContent(), /还未送达/);
      let current = await read(page);
      // Delivery and return fixtures isolate these actual actions; route navigation is covered separately.
      const destination = current.world.living.errands[person.id].destination;
      current.world.place = destination;
      await load(page, current);
      await click(page, "游历");
      await click(page, `送达${person.name}所托`);
      current = await read(page);
      assert.equal(current.world.bag[person.good], 8);
      assert.equal(current.world.living.errands[person.id].stage, "delivered");
      current.world.place = current.world.living.people[person.id].place;
      await load(page, current);
      await click(page, "游历");
      await click(page, `向${person.name}复命`);
      await click(page, "说牵挂", card);
      assert.match(await dialogue.textContent(), /完成 1 次/);
      const completed = await read(page);
      assert.equal(completed.world.living.errands[person.id].count, 1);
      assert.equal(completed.world.relations[person.id], 4);
      assert.deepEqual(completed.items, save.items);
      assert.deepEqual(completed.flags, save.flags);
      results.push({
        width,
        origin,
        name: "painted-person-three-free-topics-delivery-return-and-memory",
        ok: true,
      });

      const definition = LINEAGES[origin],
        seenEchoes = [];
      for (const choiceIndex of [0, 1]) {
        const story = fixture(origin);
        story.world.place = definition.chapters[0].place;
        await load(page, story);
        await click(page, "族脉");
        await checkArt(page, origin, 836 / 470);
        await click(page, "展开这一族的长卷");
        if (!choiceIndex) {
          await page.locator(".lineage-chapter .local-actions").scrollIntoViewIfNeeded();
          await page.screenshot({ path: `${out}/choices-${width}.png` });
        }
        await click(page, definition.chapters[0].choices[choiceIndex].text);
        const outcome = page.getByRole("status", { name: "族脉行动结果", exact: true });
        const bounds = await outcome.boundingBox();
        assert.ok(bounds.y > 0 && bounds.y < 650, "result remains near the reading viewport");
        const beforeContinue = await read(page);
        await click(page, "续读下一章");
        assert.deepEqual(await read(page), beforeContinue);
        const echo = page.getByRole("complementary", { name: "前事回响" });
        const expected = lineageEcho(origin, 1, beforeContinue.world.lineages[origin].history);
        assert.ok((await echo.textContent()).includes(expected));
        seenEchoes.push(expected);
        if (!choiceIndex) {
          await page.locator(".lineage-cover").scrollIntoViewIfNeeded();
          await page.screenshot({ path: `${out}/lineage-${width}.png` });
          await echo.scrollIntoViewIfNeeded();
          await page.screenshot({ path: `${out}/echo-${width}.png` });
        }
      }
      assert.notEqual(seenEchoes[0], seenEchoes[1]);
      results.push({
        width,
        origin,
        name: "painted-lineage-keeps-reading-flow-and-remembers-both-choices",
        ok: true,
      });

      const old = fixture(origin);
      old.world.lineages = normalizeLineages({
        [origin]: {
          history: definition.chapters.map((ch, chapter) => ({
            chapter,
            choice: ch.choices[1].id,
            day: chapter + 1,
          })),
        },
      });
      await load(page, old);
      await click(page, "族脉");
      assert.ok(
        (await page.locator(".lineage-last-word").textContent()).includes(
          definition.chapters[5].choices[1].result[0],
        ),
      );
      await page.getByText("重读已写下的 6 章", { exact: true }).click();
      assert.equal(await page.locator(".lineage-archive article").count(), 6);
      assert.equal(await page.locator(".lineage-archive .lineage-echo").count(), 3);
      await click(page, "继续自己的修行");
      await page.getByRole("button", { name: "修行", exact: true }).waitFor();
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(errors, []);
      results.push({
        width,
        origin,
        name: "old-ending-readable-archive-continues-and-no-overflow-or-errors",
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
