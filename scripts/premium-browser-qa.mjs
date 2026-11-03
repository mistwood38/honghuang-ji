#!/usr/bin/env node
/** Premium UI regression; uses the unchanged full UI suite plus focused visual invariants. */
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { fresh, chooseById, fill } from "../src/lib/honghuang/engine.ts";
import { SCENES } from "../src/lib/honghuang/story.ts";
import { ITEMS, PLACES } from "../src/lib/honghuang/world.ts";

const url = process.argv[2] ?? "http://127.0.0.1:8080/";
const output = resolve(process.argv[3] ?? "screenshots/premium");
const production = /premium-production$/.test(output);
const report = {
  url,
  ok: false,
  checks: [],
  errors: [],
  screenshots: [],
  viewports: [],
  contrastSamples: [],
};
const saveKey = "honghuang-ji-save";
const run = promisify(execFile);
await mkdir(output, { recursive: true });
let browser;
const readSave = (page) =>
  page.evaluate((key) => JSON.parse(localStorage.getItem(key)).state, saveKey);
const invariant = ({ sceneId, seen, stats, log, items, flags }) => ({
  sceneId,
  seen,
  stats,
  log,
  items,
  flags,
});
const nav = (page, name) =>
  page
    .getByRole("navigation", { name: "游戏主导航" })
    .getByRole("button", { name: new RegExp(`^${name}`) });
const escapePattern = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const screenshotPlan = new Set(
  production
    ? ["play-mobile", "self-items-mobile"]
    : [
        "title-desktop",
        "title-mobile",
        "play-mobile",
        "land-desktop",
        "self-desktop",
        "self-items-mobile",
        "novel-mobile",
        "codex-desktop",
        "ending-mobile",
      ],
);

function watch(page, context) {
  page.on("pageerror", (error) =>
    report.errors.push({ context, kind: "page", message: error.message }),
  );
  page.on("console", (message) => {
    if (message.type() === "error")
      report.errors.push({ context, kind: "console", message: message.text() });
  });
  page.on("response", (response) => {
    if (response.status() >= 400 && new URL(response.url()).origin === new URL(url).origin)
      report.errors.push({
        context,
        kind: "asset",
        message: `${response.status()} ${response.url()}`,
      });
  });
}
async function settle(page) {
  await page.locator(".title-screen, .shell").waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(180);
}
async function loadSave(page, state) {
  await page.evaluate(
    ({ key, state }) => localStorage.setItem(key, JSON.stringify({ state, version: 1 })),
    { key: saveKey, state },
  );
  await page.reload({ waitUntil: "domcontentloaded" });
  await settle(page);
}
function rooted(origin = "dao", screen = "play") {
  let state = { ...fresh(), started: true, screen: "play", seen: ["awaken"], sound: false };
  state = chooseById(state, origin);
  state.screen = screen;
  return state;
}
async function assertLayout(page, context) {
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),
    false,
    `${context}: horizontal overflow`,
  );
  const visibleImages = page.locator("img").filter({ visible: true });
  await visibleImages.evaluateAll(async (images) => {
    await Promise.all(
      images
        .filter((image) => {
          const box = image.getBoundingClientRect();
          return box.width && box.height && box.top < innerHeight && box.bottom > 0;
        })
        .map((image) => image.decode()),
    );
  });
  const dock = page.locator(".dock");
  if (await dock.count()) {
    const box = await dock.boundingBox();
    const viewport = page.viewportSize();
    assert.ok(
      box.y >= 0 && box.y + box.height <= viewport.height + 1,
      `${context}: dock within viewport`,
    );
    assert.ok(
      await page
        .locator(".dock-item")
        .evaluateAll((items) => items.every((item) => item.getBoundingClientRect().height >= 44)),
      `${context}: dock targets >=44px`,
    );
  }
}
async function capture(page, name) {
  if (!screenshotPlan.has(name)) return;
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${output}/${name}.png`, fullPage: false });
  report.screenshots.push(`${name}.png`);
}
async function readable(page, selector, label) {
  const sample = await page
    .locator(selector)
    .first()
    .evaluate((element) => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext("2d");
      const chain = [];
      let ancestor = element;
      while (ancestor) {
        chain.unshift(ancestor);
        ancestor = ancestor.parentElement;
      }
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 1, 1);
      for (const node of chain) {
        ctx.fillStyle = getComputedStyle(node).backgroundColor;
        ctx.fillRect(0, 0, 1, 1);
      }
      const background = [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3);
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = getComputedStyle(element).color;
      ctx.fillRect(0, 0, 1, 1);
      const foreground = [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3);
      return { foreground, background, size: getComputedStyle(element).fontSize };
    });
  const lum = (rgb) =>
    rgb
      .map((value) => {
        const x = value / 255;
        return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
      })
      .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
  const a = lum(sample.foreground);
  const b = lum(sample.background);
  const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  report.contrastSamples.push({
    label,
    ...sample,
    ratio: Math.round(ratio * 100) / 100,
    method:
      "Computed foreground against resolved solid CSS backgrounds; artwork textures are excluded.",
  });
  assert.ok(ratio >= 4.5, `${label}: critical reading text contrast ${ratio.toFixed(2)} <4.5`);
}

try {
  // Keep the established state/interaction suite intact. Captures here are temporary;
  // its JSON verdict is retained alongside the focused premium evidence.
  if (!process.argv.includes("--skip-base")) {
    const temporary = await mkdtemp("/workspace/honghuang-premium-base-");
    const baseDir = `${temporary}/refinement-production`;
    const args = [
      "--experimental-strip-types",
      fileURLToPath(new URL("./art-browser-qa.mjs", import.meta.url)),
      url,
      baseDir,
      "--refinement",
    ];
    let baseProcessError;
    try {
      const result = await run(process.execPath, args, {
        maxBuffer: 2 * 1024 * 1024,
        timeout: 300000,
      });
      await writeFile(`${output}/base-output.log`, result.stdout + result.stderr);
    } catch (error) {
      await writeFile(
        `${output}/base-output.log`,
        String(error.stdout ?? "") + String(error.stderr ?? ""),
      );
      baseProcessError = error;
    }
    const base = JSON.parse(await readFile(`${baseDir}/verdict.json`, "utf8"));
    await writeFile(`${output}/base-verdict.json`, JSON.stringify(base, null, 2));
    report.baseChecks = base.checks.length;
    if (!base.ok || baseProcessError) {
      report.baseFailure = base.failure;
      report.errors.push(...base.errors);
      throw new Error(
        `Established full/refinement browser suite failed: ${base.failure?.message ?? baseProcessError?.message}`,
      );
    }
    report.checks.push(
      "Established full/refinement browser suite passes unchanged, including actual v1 restore, choice deltas, modal focus, reduced motion and complete dao ending/restart",
    );
  }
  browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ?? "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  for (const [label, viewport] of [
    ["mobile", { width: 390, height: 844 }],
    ["narrow", { width: 320, height: 740 }],
    ["desktop", { width: 1440, height: 1000 }],
    ["landscape", { width: 844, height: 390 }],
  ]) {
    const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
    const page = await context.newPage();
    watch(page, label);
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await settle(page);
    for (const screen of ["title", "play", "land", "self", "novel", "codex"]) {
      let state = rooted("yao", screen);
      if (screen === "title") state = fresh();
      if (screen === "play")
        state = { ...fresh(), started: true, screen: "play", seen: ["awaken"], sound: false };
      if (screen === "self") state.items = Object.keys(ITEMS);
      await loadSave(page, state);
      await assertLayout(page, `${label}/${screen}`);
      if (screen === "play") {
        await readable(page, "#scene-story p", `${label}/story`);
        await readable(page, ".choice-copy > span:first-child", `${label}/choice`);
        assert.ok(
          await page
            .locator(".choice")
            .evaluateAll((buttons) =>
              buttons.every((button) => button.getBoundingClientRect().height >= 44),
            ),
        );
        if (label === "mobile") await capture(page, "play-mobile");
      }
      if (screen === "novel") await readable(page, ".reader-copy p", `${label}/novel`);
      if (screen === "codex")
        await readable(page, ".codex-entry[open] .codex-entry-copy p", `${label}/codex`);
      if (label === "desktop" && ["title", "land", "self", "codex"].includes(screen))
        await capture(page, `${screen}-desktop`);
      if (label === "mobile" && screen === "title") await capture(page, "title-mobile");
      if (label === "mobile" && screen === "novel") await capture(page, "novel-mobile");
    }
    report.viewports.push({ label, ...viewport, ok: true });
    report.checks.push(
      `${label}: all six pages render with no horizontal overflow, decoded visible art, readable primary text and reachable dock`,
    );
    await context.close();
  }

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  watch(page, "assets-and-endings");
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await settle(page);
  const origins = [
    ["dao", "pilgrim"],
    ["wu", "origin-wu"],
    ["yao", "origin-yao"],
    ["ren", "origin-ren"],
  ];
  const portraits = [];
  for (const [origin, filename] of origins) {
    const state = rooted(origin, "self");
    state.items = Object.keys(ITEMS);
    await loadSave(page, state);
    const portrait = page.locator(".self-portrait img");
    await portrait.evaluate((image) => image.decode());
    const details = await portrait.evaluate((image) => ({
      src: image.currentSrc,
      width: image.naturalWidth,
      height: image.naturalHeight,
    }));
    assert.match(new URL(details.src).pathname, new RegExp(`/art/${filename}(?:-small)?\\.webp$`));
    assert.ok(details.width > 0 && details.height > details.width);
    assert.deepEqual(await readSave(page), state);
    portraits.push({ origin, ...details });
  }
  report.portraits = portraits;
  report.checks.push(
    "All four existing roots select distinct decoded local portrait artwork without changing any save field",
  );

  assert.equal(await page.locator(".self-items .item-art").count(), Object.keys(ITEMS).length);
  assert.deepEqual(
    await page.locator(".self-items h3").allTextContents(),
    Object.values(ITEMS).map((item) => item.name),
  );
  const iconData = await page.locator(".self-items .item-art").evaluateAll((icons) =>
    icons.map((icon) => {
      const style = getComputedStyle(icon);
      return {
        image: style.backgroundImage,
        position: style.backgroundPosition,
        size: style.backgroundSize,
      };
    }),
  );
  assert.equal(new Set(iconData.map((icon) => icon.position)).size, 9);
  for (const icon of iconData) {
    assert.match(icon.image, /relic-icons(?:-small)?\.webp/);
    assert.equal(icon.size, "300% 300%");
  }
  const sprite = iconData[0].image.match(/url\(["']?(.*?)["']?\)/)[1];
  const spriteSize = await page.evaluate(async (src) => {
    const image = new Image();
    image.src = src;
    await image.decode();
    return { width: image.naturalWidth, height: image.naturalHeight };
  }, sprite);
  assert.equal(spriteSize.width, spriteSize.height);
  report.itemIcons = { cells: iconData, spriteSize };
  await page.locator(".self-items").evaluate((element) => {
    window.scrollTo({ top: window.scrollY + element.getBoundingClientRect().top - 110 });
  });
  await capture(page, "self-items-mobile");
  report.checks.push(
    "All nine original item names/lore remain; the actual local icon atlas decodes and uses nine distinct 3x3 sprite positions",
  );

  await nav(page, "山河").click();
  const worldmap = page.locator(".atlas-map img");
  await worldmap.evaluate((image) => image.decode());
  assert.match(
    await worldmap.evaluate((image) => image.currentSrc),
    /world-atlas(?:-small)?\.webp/,
  );
  const beforeMap = invariant(await readSave(page));
  for (const place of PLACES) {
    await page
      .locator(".atlas-place-card")
      .filter({
        has: page.locator(".atlas-place-name", {
          hasText: new RegExp(`^${escapePattern(place.name)}$`),
        }),
      })
      .click();
    assert.equal(await page.locator(".atlas-detail h2").textContent(), place.name);
    const detail = await page.locator(".atlas-detail").textContent();
    assert.ok(
      detail.includes(place.summary) && detail.includes(place.detail),
      `${place.name}: complete original description`,
    );
    assert.deepEqual(invariant(await readSave(page)), beforeMap);
  }
  report.checks.push(
    "Layered original world atlas loads; all fourteen places expose complete original descriptions without moving the player",
  );

  for (const id of ["incense", "final", "end-board"]) {
    const state = { ...rooted(), sceneId: id };
    await loadSave(page, state);
    const image = page.locator(".scene-hero img");
    await image.evaluate((node) => node.decode());
    assert.match(await image.evaluate((node) => node.currentSrc), /fengshen(?:-small)?\.webp/);
    assert.deepEqual(await readSave(page), state);
  }
  report.checks.push(
    "Fengshen altar artwork is correctly mapped to the existing board/final story scenes and does not alter state",
  );

  for (const scene of SCENES.filter((scene) => scene.ending)) {
    let state = { ...rooted(), sceneId: scene.id, name: "观照" };
    if (scene.id === "end-ren") {
      state = { ...fresh(), started: true, screen: "play", seen: ["awaken"], sound: false };
      for (const id of [
        "ren",
        "watch",
        "listen",
        "down",
        "ren",
        "help",
        "ren",
        "save",
        "flame",
        "shield",
        "end-ren",
      ])
        state = chooseById(state, id);
    }
    await loadSave(page, state);
    assert.ok(
      (await page.locator("h1").allTextContents()).some((text) => text === scene.ending.name),
    );
    const text = await page.locator("#scene-story").textContent();
    for (const paragraph of scene.paragraphs)
      assert.ok(text.includes(fill(paragraph, state)), `${scene.id}: original ending paragraph`);
    assert.equal(await page.getByRole("button", { name: "再入混沌", exact: true }).count(), 1);
    assert.equal(await page.getByRole("button", { name: "抄录此生", exact: true }).count(), 1);
    assert.deepEqual(await readSave(page), state);
    await assertLayout(page, scene.id);
    if (scene.id === "end-ren") await capture(page, "ending-mobile");
  }
  report.endings = SCENES.filter((scene) => scene.ending).map((scene) => ({
    id: scene.id,
    title: scene.ending.name,
  }));
  report.checks.push(
    "All nine existing endings preserve their full original paragraphs and actions, render without overflow, and keep v1 save data unchanged",
  );
  await context.close();
  assert.deepEqual(report.errors, [], "runtime/console/local asset errors");
  report.ok = true;
} catch (error) {
  report.failure = { message: error.message, stack: error.stack };
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  await writeFile(`${output}/verdict.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
