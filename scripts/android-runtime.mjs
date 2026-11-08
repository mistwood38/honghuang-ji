/** Runs against the installed debug APK in an isolated Android emulator, never a user device. */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { setTimeout as pause } from "node:timers/promises";
import { chromium } from "playwright";
import { fresh } from "../src/lib/honghuang/engine.ts";
import { applyRoam } from "../src/lib/honghuang/roam/engine.ts";
import { ITEMS } from "../src/lib/honghuang/world.ts";

const pkg = "app.honghuang.ji",
  out = "screenshots/android-runtime";
const results = [];
let browser, page;
mkdirSync(out, { recursive: true });
const adb = (...args) => execFileSync("adb", args, { encoding: "utf8", timeout: 20000 }).trim();
assert.equal(
  adb("shell", "getprop", "ro.kernel.qemu"),
  "1",
  "This test writes fixture saves: use an emulator only",
);
const read = () => page.evaluate(() => JSON.parse(localStorage.getItem("honghuang-ji-save")).state);
async function connect() {
  adb("shell", "am", "start", "-n", `${pkg}/.MainActivity`);
  let reason;
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      const pid = adb("shell", "pidof", pkg).split(" ")[0];
      adb("forward", "tcp:9222", `localabstract:webview_devtools_remote_${pid}`);
      // WebView has no browser download/context manager; preserve its native focus lifecycle too.
      browser = await chromium.connectOverCDP("http://127.0.0.1:9222", {
        timeout: 3000,
        noDefaults: true,
      });
      page = browser.contexts()[0].pages()[0];
      if (!page) throw new Error("WebView page not yet available");
      page.setDefaultTimeout(20000);
      await page.locator(".title-screen, .farm-desk").first().waitFor();
      return;
    } catch (error) {
      reason = error.message;
      await browser?.close().catch(() => {});
      await pause(500);
    }
  }
  throw new Error(`Cannot connect to debug WebView: ${reason}`);
}
async function click(name) {
  await page.getByRole("button", { name, exact: typeof name === "string" }).click();
  await page.waitForFunction(() => !document.querySelector('.game-action[aria-busy="true"]'));
}
async function enter() {
  if (await page.locator(".title-screen").count()) await click(/继.*续.*此.*生/);
  await page.locator(".farm-desk").waitFor();
}
try {
  adb("shell", "cmd", "connectivity", "airplane-mode", "enable");
  adb("shell", "svc", "wifi", "disable");
  adb("shell", "svc", "data", "disable");
  assert.equal(adb("shell", "settings", "get", "global", "airplane_mode_on"), "1");
  await connect();
  assert.match(page.url(), /^https?:\/\/localhost\//);
  await page.screenshot({ path: `${out}/offline-title.png` });
  results.push({ name: "APK cold-start in airplane mode", ok: true });

  const save = applyRoam(fresh(), { type: "origin", origin: "dao", name: "安卓行者" }, () => 0.6);
  save.sound = false;
  save.stats.dao = 26;
  save.stats.life = 60;
  save.items = Object.keys(ITEMS);
  save.flags = ["old-story"];
  save.world.idle = null;
  save.world.lingqi = 40;
  save.world.stones = 20;
  save.world.bag = { dew: 10, ore: 5 };
  delete save.world.relic;
  delete save.world.insights;
  await page.evaluate(
    (state) => localStorage.setItem("honghuang-ji-save", JSON.stringify({ state, version: 1 })),
    save,
  );
  await page.addInitScript(() => {
    const Native = window.AudioContext;
    window.__qaAudio = { starts: 0, stops: 0, offsets: [] };
    window.AudioContext = class extends Native {
      createBufferSource() {
        const source = super.createBufferSource(),
          start = source.start.bind(source),
          stop = source.stop.bind(source);
        source.start = (...args) => {
          if (source.loop) {
            window.__qaAudio.starts++;
            window.__qaAudio.offsets.push(args[1] ?? 0);
          }
          return start(...args);
        };
        source.stop = (...args) => {
          if (source.loop) window.__qaAudio.stops++;
          return stop(...args);
        };
        return source;
      }
    };
  });
  await page.reload();
  await enter();
  await click("储物");
  await click("御使盘古骨");
  let current = await read();
  assert.equal(current.world.relic, "pangu-bone");
  assert.deepEqual(current.items, save.items);
  assert.ok(current.flags.includes("old-story"));
  await click("功法");
  await click("参悟清净吐纳·会通");
  current = await read();
  assert.equal(current.world.insights.qingjing, 1);
  assert.equal(current.world.stones, 16);
  await page.screenshot({ path: `${out}/comprehension.png` });
  results.push({
    name: "Legacy fields migrate; real equip and paid comprehension persist",
    ok: true,
  });

  const files = readdirSync("public/audio").filter((name) => name.endsWith(".ogg"));
  assert.equal(files.length, 12);
  const lengths = await page.evaluate(async (names) => {
    const ctx = new AudioContext(),
      lengths = [];
    try {
      for (const name of names) {
        const response = await fetch(`/audio/${name}`);
        if (!response.ok) throw new Error(`Missing local audio ${name}`);
        const buffer = await ctx.decodeAudioData(await response.arrayBuffer());
        lengths.push({ file: name, seconds: buffer.duration });
      }
    } finally {
      await ctx.close();
    }
    return lengths;
  }, files);
  assert.ok(lengths.every((row) => row.seconds > 0));
  results.push({ name: "All 12 local audio files decode while offline", ok: true, files: lengths });
  await click("乐声关");
  await page.waitForFunction(() => window.__qaAudio.starts > 0);
  await pause(1200);
  const stops = await page.evaluate(() => window.__qaAudio.stops);
  adb("shell", "input", "keyevent", "KEYCODE_HOME");
  await pause(1500);
  adb("shell", "am", "start", "-n", `${pkg}/.MainActivity`);
  await page.waitForFunction(
    (before) => window.__qaAudio.stops > before && window.__qaAudio.offsets.at(-1) > 0,
    stops,
  );
  assert.equal((await read()).world.insights.qingjing, 1);
  results.push({ name: "Android HOME/foreground stops music and resumes its position", ok: true });

  await browser.close();
  browser = undefined;
  adb("shell", "am", "force-stop", pkg);
  await connect();
  await enter();
  current = await read();
  assert.equal(current.name, "安卓行者");
  assert.equal(current.world.relic, "pangu-bone");
  assert.equal(current.world.insights.qingjing, 1);
  assert.equal(current.world.stones, 16);
  assert.deepEqual(current.items, save.items);
  assert.ok(current.flags.includes("old-story"));
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.screenshot({ path: `${out}/offline-restart.png` });
  results.push({
    name: "Force-stop and offline relaunch retain character, relics, history and paid progress",
    ok: true,
  });
} catch (error) {
  results.push({ name: "Android runtime", ok: false, error: error.message });
  if (page && !page.isClosed())
    await page.screenshot({ path: `${out}/failure.png`, timeout: 5000 }).catch(() => {});
  process.exitCode = 1;
} finally {
  writeFileSync(
    `${out}/results.json`,
    JSON.stringify({ platform: "Android 15 / API 35 emulator", results }, null, 2),
  );
  console.log(JSON.stringify(results, null, 2));
  await browser?.close().catch(() => {});
}
