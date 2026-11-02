#!/usr/bin/env node
/** Reproducible UI regression. Requires system Chromium or PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. */
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { fresh, chooseById, visibleChoices } from "../src/lib/honghuang/engine.ts";

const url = process.argv[2] ?? "http://127.0.0.1:8080/";
const output = resolve(process.argv[3] ?? "screenshots/after");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ?? "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const report = { url, viewports: [], compatibility: [], errors: [], checks: [] };
const saveKey = "honghuang-ji-save";
const readSave = (page) =>
  page.evaluate((key) => JSON.parse(localStorage.getItem(key)).state, saveKey);
const navigation = (page, label) =>
  page
    .getByRole("navigation", { name: "游戏主导航" })
    .getByRole("button", { name: new RegExp(`^${label}`) });
const invariant = (state) => ({
  sceneId: state.sceneId,
  seen: state.seen,
  stats: state.stats,
  log: state.log,
  items: state.items,
  flags: state.flags,
});

function watch(page, viewport) {
  page.on("pageerror", (error) =>
    report.errors.push({ viewport, type: "page", message: error.message }),
  );
  page.on("console", (message) => {
    if (message.type() === "error")
      report.errors.push({ viewport, type: "console", message: message.text() });
  });
  page.on("response", (response) => {
    if (response.status() >= 400 && new URL(response.url()).origin === new URL(url).origin)
      report.errors.push({
        viewport,
        type: "response",
        message: `${response.status()} ${response.url()}`,
      });
  });
}
async function settle(page) {
  await page.waitForTimeout(850);
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}
async function screen(page, name, viewport, fullPage = true) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await settle(page);
  if (fullPage) {
    // A full-page QA image should include art below the normal lazy-load viewport.
    // This affects capture only; runtime retains lazy loading for mobile performance.
    await page.locator("img").evaluateAll((images) =>
      images.forEach((image) => {
        image.loading = "eager";
      }),
    );
    await page.waitForFunction(() =>
      [...document.images].every((image) => image.complete && image.naturalWidth > 0),
    );
    await page
      .locator("img")
      .evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
  }
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
    false,
    `${viewport} ${name}: horizontal overflow`,
  );
  const broken = await page
    .locator("img")
    .evaluateAll((images) =>
      images
        .filter((image) => image.complete && image.naturalWidth === 0)
        .map((image) => image.currentSrc),
    );
  assert.deepEqual(broken, [], `${viewport} ${name}: broken art`);
  await page.screenshot({ path: `${output}/${name}-${viewport}.png`, fullPage });
  report.checks.push(`${viewport}/${name}: rendered, images loaded, no horizontal overflow`);
}
async function goto(page) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.locator(".title-screen, .shell").waitFor();
  await settle(page);
}
async function loadSave(page, state) {
  await page.evaluate(
    ({ key, value }) => localStorage.setItem(key, JSON.stringify({ state: value, version: 1 })),
    { key: saveKey, value: state },
  );
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator(".shell").waitFor();
  await settle(page);
}

try {
  for (const [viewport, size] of [
    ["mobile", { width: 390, height: 844 }],
    ["desktop", { width: 1440, height: 1000 }],
    ["narrow", { width: 320, height: 740 }],
  ]) {
    const context = await browser.newContext({ viewport: size });
    const page = await context.newPage();
    watch(page, viewport);
    await goto(page);
    await screen(page, "title", viewport, false);
    await page.locator(".fate-button").click();
    await page.locator(".choice").first().waitFor();
    await screen(page, "play", viewport);
    await page.getByPlaceholder("不取则随根骨赐号").fill("问青");
    await page.locator(".choice").filter({ hasText: "以道应之" }).click();
    await page.waitForFunction(
      (key) => JSON.parse(localStorage.getItem(key)).state.sceneId === "cleave",
      saveKey,
    );
    let expected = { ...fresh(), started: true, screen: "play", seen: ["awaken"] };
    expected = chooseById(expected, "dao", "问青");
    assert.deepEqual(invariant(await readSave(page)), invariant(expected));
    assert.equal((await readSave(page)).name, "问青");
    await screen(page, "cleave", viewport, false);
    await page.keyboard.press("1");
    expected = chooseById(expected, "help");
    await page.waitForFunction(
      (key) => JSON.parse(localStorage.getItem(key)).state.sceneId === "fall",
      saveKey,
    );
    assert.deepEqual(invariant(await readSave(page)), invariant(expected));
    report.checks.push(
      `${viewport}: new game, name, root choice and keyboard follow original engine deltas`,
    );

    await navigation(page, "本纪").click();
    await screen(page, "novel", viewport);
    assert.equal(await page.locator(".reader-chapter-link").count(), 28);
    assert.equal(
      await page.getByRole("button", { name: "上一章", exact: true }).isDisabled(),
      true,
    );
    await page.getByRole("button", { name: "下一章", exact: true }).click();
    assert.equal((await readSave(page)).novelIndex, 1);
    await page.getByRole("button", { name: "上一章", exact: true }).click();
    assert.equal((await readSave(page)).novelIndex, 0);
    const mobileDirectory = page.locator(".reader-mobile-directory");
    if (await mobileDirectory.isVisible()) {
      await mobileDirectory.locator("summary").click();
      await mobileDirectory.locator(".reader-chapter-link").nth(7).click();
      assert.equal(await mobileDirectory.getAttribute("open"), null);
    } else await page.locator(".reader-directory .reader-chapter-link").nth(7).click();
    assert.equal((await readSave(page)).novelIndex, 7);
    await page.getByRole("button", { name: "增大阅读字号", exact: true }).click();
    assert.equal(await page.locator(".reader-large-text").count(), 1);
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.locator(".reader-chapter-title").waitFor();
    assert.equal((await readSave(page)).novelIndex, 7);
    report.checks.push(
      `${viewport}: fourteen chapter directory, previous/next, larger type and persisted chapter 8`,
    );

    await navigation(page, "天书").click();
    await screen(page, "codex", viewport);
    const allEntries = await page.locator(".codex-entry").count();
    assert.ok(allEntries > 10);
    await page.locator(".codex-category-link").filter({ hasText: "法宝" }).click();
    assert.ok((await page.locator(".codex-entry").count()) < allEntries);
    await page.getByRole("searchbox", { name: "检索天书标题和正文" }).fill("不存在的神名零零零");
    assert.equal(await page.locator(".codex-empty").isVisible(), true);
    await page.getByRole("button", { name: "重阅全卷", exact: true }).click();
    assert.equal(await page.locator(".codex-entry").count(), allEntries);
    await page.getByRole("searchbox", { name: "检索天书标题和正文" }).fill("盘古");
    assert.ok((await page.locator(".codex-entry").count()) > 0);
    await page.getByRole("searchbox", { name: "检索天书标题和正文" }).fill("");
    const expand = page.getByRole("button", { name: "展开全篇", exact: true });
    if (await expand.count()) await expand.click();
    await page.waitForTimeout(100);
    assert.equal(await page.locator(".codex-entry[open]").count(), allEntries);
    report.checks.push(
      `${viewport}: codex category, full text search, no-results reset and expand all`,
    );

    await navigation(page, "山河").click();
    await screen(page, "land", viewport);
    const beforeAtlas = invariant(await readSave(page));
    await page
      .getByRole("group", { name: "地域分类" })
      .getByRole("button", { name: "海", exact: true })
      .click();
    assert.equal(await page.locator(".atlas-place-card").count(), 1);
    await page.locator(".atlas-place-card").filter({ hasText: "蓬莱" }).click();
    assert.equal(await page.locator(".atlas-detail h2").textContent(), "蓬莱");
    assert.deepEqual(invariant(await readSave(page)), beforeAtlas);
    await page.getByRole("button", { name: /^昆仑，/ }).click();
    assert.equal(await page.locator(".atlas-detail h2").textContent(), "昆仑");
    if (size.width <= 959) {
      await page.waitForTimeout(100);
      const detailTop = await page
        .locator(".atlas-detail")
        .evaluate((element) => element.getBoundingClientRect().top);
      assert.ok(
        detailTop >= 0 && detailTop < size.height / 2,
        `${viewport}: map marker scrolls detail into view`,
      );
    }
    assert.deepEqual(invariant(await readSave(page)), beforeAtlas);
    report.checks.push(
      `${viewport}: atlas region and marker inspection leave original gameplay data unchanged`,
    );

    await navigation(page, "我的").click();
    await screen(page, "self", viewport);
    await page.getByRole("textbox", { name: "改定道号", exact: true }).fill("云归");
    await page.getByRole("button", { name: "改定", exact: true }).click();
    assert.equal((await readSave(page)).name, "云归");
    await page
      .locator(".self-action-buttons")
      .getByRole("button", { name: "钟声开", exact: true })
      .click();
    assert.equal((await readSave(page)).sound, false);
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.locator(".self-page").waitFor();
    assert.equal((await readSave(page)).sound, false);
    assert.equal((await readSave(page)).name, "云归");
    report.checks.push(`${viewport}: rename and sound-off survive reload`);

    const dock = await page.locator(".dock").boundingBox();
    assert.ok(dock.y < size.height && dock.y + dock.height <= size.height + 1);
    const targets = await page.locator(".dock-item").evaluateAll((buttons) =>
      buttons.map((button) => {
        const box = button.getBoundingClientRect();
        return { width: box.width, height: box.height };
      }),
    );
    assert.ok(targets.every((box) => box.width >= 44 && box.height >= 44));
    const collapse = { ...expected, screen: "play", sceneId: "collapse" };
    await loadSave(page, collapse);
    await screen(page, "collapse", viewport, false);
    assert.ok(await page.locator(".scene-calamity").count());
    report.viewports.push({ viewport, ...size, ok: true });
    await context.close();
  }

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  await context.addInitScript(() => {
    window.__qaAudioContexts = 0;
    const NativeAudioContext = window.AudioContext;
    if (NativeAudioContext)
      window.AudioContext = new Proxy(NativeAudioContext, {
        construct(target, args) {
          window.__qaAudioContexts += 1;
          return Reflect.construct(target, args);
        },
      });
  });
  const page = await context.newPage();
  watch(page, "compatibility");
  await goto(page);
  const activeAnimations = await page
    .locator(".title-lockup h1, .mist-bank, .rune-drift, .celestial-light, .spirit-mote")
    .evaluateAll((elements) => elements.map((element) => getComputedStyle(element).animationName));
  assert.ok(activeAnimations.length > 0 && activeAnimations.every((name) => name === "none"));
  report.compatibility.push(
    "prefers-reduced-motion disables all sampled title and atmospheric animations",
  );

  const review = await readFile(
    new URL("../docs/compatibility-review.md", import.meta.url),
    "utf8",
  );
  const fixture = JSON.parse(review.match(/```json\n([\s\S]*?)\n```/)[1]).state;
  fixture.pastLives = [
    {
      name: "前尘君",
      origin: "ren",
      ending: "守火人",
      seal: "火",
      lines: ["曾护住一缕香火。", "火塘边有人记得。"],
    },
  ];
  await loadSave(page, fixture);
  assert.deepEqual(await readSave(page), fixture);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator(".scene-chapter").waitFor();
  assert.deepEqual(await readSave(page), fixture);
  await navigation(page, "我的").click();
  assert.equal(await page.locator(".self-items h3").textContent(), "紫气一缕");
  assert.equal(await page.locator(".self-flags li").count(), 3);
  assert.ok((await page.locator(".self-past h3").allTextContents()).includes("前尘君"));
  await screen(page, "restore", "mobile");
  report.compatibility.push(
    "untouched original v1 road fixture restores all stats, items, flags, logs, seen, chapter, sound and archived past life",
  );
  await navigation(page, "入世").click();
  const beforeMuted = await readSave(page);
  await page.locator(".choice").filter({ hasText: "昆仑" }).first().click();
  assert.equal((await readSave(page)).sound, false);
  assert.notEqual((await readSave(page)).sceneId, beforeMuted.sceneId);
  assert.equal(await page.evaluate(() => window.__qaAudioContexts), 0);
  report.compatibility.push(
    "muted choice advances normally without creating an AudioContext or requiring autoplay permission",
  );
  let journey = await readSave(page);
  for (const id of ["disciple", "peace", "hold", "offer", "shield", "end-dao"]) {
    const option = visibleChoices(journey).find((item) => item.choice.id === id && item.open);
    assert.ok(option, `original ending path offers ${id}`);
    await page.locator(".choice").filter({ hasText: option.choice.text }).click();
    journey = chooseById(journey, id);
    await page.waitForFunction(
      ({ key, scene }) => JSON.parse(localStorage.getItem(key)).state.sceneId === scene,
      { key: saveKey, scene: journey.sceneId },
    );
    assert.deepEqual(invariant(await readSave(page)), invariant(journey));
  }
  assert.equal(journey.sceneId, "end-dao");
  await screen(page, "ending", "mobile");
  const beforeRestart = await readSave(page);
  await page.getByRole("button", { name: "再入混沌", exact: true }).click();
  await page.getByRole("dialog").waitFor();
  const dialogBox = await page.getByRole("dialog").boundingBox();
  assert.ok(
    dialogBox.x >= 0 && dialogBox.width <= 390 && dialogBox.y >= 0 && dialogBox.height <= 844,
  );
  await page.getByRole("button", { name: "留下", exact: true }).click();
  assert.equal(await page.getByRole("dialog").count(), 0);
  assert.deepEqual(await readSave(page), beforeRestart);
  await page.getByRole("button", { name: "再入混沌", exact: true }).click();
  await page.getByRole("button", { name: "确认重开", exact: true }).click();
  await page.waitForFunction(
    (key) => JSON.parse(localStorage.getItem(key)).state.sceneId === "awaken",
    saveKey,
  );
  const restarted = await readSave(page);
  assert.equal(restarted.sound, false);
  assert.equal(restarted.novelIndex, 7);
  assert.equal(restarted.pastLives.length, 2);
  assert.equal(restarted.pastLives.at(-1).ending, "听完的人");
  assert.equal(restarted.name, "");
  assert.deepEqual(restarted.items, []);
  assert.deepEqual(restarted.flags, []);
  await navigation(page, "我的").click();
  assert.equal(await page.locator(".self-past li.bronze-panel").count(), 2);
  report.compatibility.push(
    "original dao path reaches its ending; restart cancel preserves all fields; confirm archives life and retains novel chapter/sound with usable mobile modal and dock",
  );
  await context.close();

  assert.deepEqual(report.errors, [], "browser errors or failed local assets");
  report.ok = true;
} catch (error) {
  report.ok = false;
  report.failure = { message: error.message, stack: error.stack };
  process.exitCode = 1;
} finally {
  await writeFile(`${output}/verdict.json`, JSON.stringify(report, null, 2));
  await browser.close();
  console.log(JSON.stringify(report, null, 2));
}
