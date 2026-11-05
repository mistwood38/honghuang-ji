import assert from "node:assert/strict";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";
import { fresh } from "../src/lib/honghuang/engine.ts";
import { applyRoam } from "../src/lib/honghuang/roam/engine.ts";
import { checkedUrl } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/");
const output = "/workspace/screenshots/audio-renewal";
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(existsSync(chromium.executablePath()) ? {} : { executablePath: "/usr/bin/chromium" }),
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const results = [];
try {
  for (const width of [320, 360, 412, 1280]) {
    const page = await browser.newPage({
      viewport: { width, height: 844 },
      isMobile: width < 600,
      hasTouch: width < 600,
    });
    const errors = [];
    const audioRequests = [];
    page.on("request", (request) => {
      if (request.url().includes("/audio/")) audioRequests.push(request.url());
    });
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    const save = applyRoam(fresh(), { type: "origin", origin: "dao", name: "玄" }, () => 0.5);
    save.sound = false;
    save.world.idle = null;
    await page.addInitScript(
      ({ save }) => {
        if (!localStorage.getItem("honghuang-ji-save"))
          localStorage.setItem("honghuang-ji-save", JSON.stringify({ state: save, version: 1 }));
        const Native = window.AudioContext;
        window.__sound = { music: 0, effects: 0, stops: 0, contexts: 0, offsets: [] };
        window.AudioContext = class extends Native {
          constructor(...args) {
            super(...args);
            window.__sound.contexts++;
          }
          createBufferSource() {
            const node = super.createBufferSource();
            const start = node.start.bind(node),
              stop = node.stop.bind(node);
            node.start = (...args) => {
              window.__sound[node.loop ? "music" : "effects"]++;
              if (node.loop) window.__sound.offsets.push(args[1] ?? 0);
              return start(...args);
            };
            node.stop = (...args) => {
              window.__sound.stops++;
              return stop(...args);
            };
            return node;
          }
        };
      },
      { save },
    );
    try {
      await page.goto(url);
      await page.getByRole("button", { name: /继.*续.*此.*生/ }).click();
      assert.equal(
        await page.evaluate(() => window.__sound.contexts),
        0,
        "muted save must not create audio",
      );
      await page.getByRole("button", { name: "乐声关", exact: true }).click();
      await page.waitForFunction(() => window.__sound.music === 1);
      await page.getByRole("button", { name: "声音设置", exact: true }).click();
      const dialog = page.getByRole("dialog");
      await dialog.waitFor();
      await page.getByRole("slider", { name: "背景音乐音量", exact: true }).fill("26");
      await page.waitForTimeout(300);
      assert.equal(
        await page.evaluate(() => window.__sound.music),
        1,
        "volume change must not restart song",
      );
      await page.getByRole("checkbox", { name: /背景音乐/ }).uncheck();
      const stopped = await page.evaluate(() => window.__sound.stops);
      assert.ok(stopped > 0);
      await page.getByRole("checkbox", { name: /操作音效/ }).uncheck();
      assert.equal(await page.getByRole("button", { name: "试听柔和确认音" }).isDisabled(), true);
      const effects = await page.evaluate(() => window.__sound.effects);
      await page.getByRole("button", { name: "关闭对话框" }).click();
      await page.getByRole("button", { name: "声音设置" }).click();
      await page.waitForTimeout(200);
      assert.equal(
        await page.evaluate(() => window.__sound.effects),
        effects,
        "effects-off stays silent",
      );
      await page.getByRole("checkbox", { name: /操作音效/ }).check();
      await page.getByRole("button", { name: "试听柔和确认音" }).click();
      await page.waitForFunction((before) => window.__sound.effects > before, effects);
      assert.ok(audioRequests.some((src) => src.endsWith("/ui-soft-confirm.ogg")));
      assert.equal(
        await page.evaluate(() => window.__sound.music),
        1,
        "effects do not enable muted music",
      );
      await page.getByRole("checkbox", { name: /背景音乐/ }).check();
      await page.waitForFunction(() => window.__sound.music === 2);
      await page.screenshot({ path: `${output}/settings-${width}.png` });
      await page.getByRole("button", { name: "关闭对话框" }).click();
      const starts = await page.evaluate(() => window.__sound.music);
      await page.getByRole("button", { name: "闭关一日", exact: true }).click();
      await page.waitForTimeout(500);
      assert.equal(
        await page.evaluate(() => window.__sound.music),
        starts,
        "same scene action keeps the song",
      );
      await page.evaluate(() => {
        Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
        document.dispatchEvent(new Event("visibilitychange"));
      });
      assert.ok((await page.evaluate(() => window.__sound.stops)) > stopped);
      await page.evaluate(() => {
        Object.defineProperty(document, "hidden", { configurable: true, get: () => false });
        document.dispatchEvent(new Event("visibilitychange"));
      });
      await page.waitForFunction((n) => window.__sound.music > n, starts);
      assert.ok(
        await page.evaluate(() => window.__sound.offsets.at(-1) > 0),
        "foreground resumes the previous playback position",
      );
      await page.reload();
      await page.locator(".farm-desk").waitFor();
      await page.getByRole("button", { name: "声音设置" }).click();
      assert.equal(await page.getByRole("slider", { name: "背景音乐音量" }).inputValue(), "26");
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(errors, []);
      results.push({ width, ok: true });
    } catch (e) {
      results.push({ width, ok: false, error: e.message });
      await page.screenshot({ path: `${output}/failure-${width}.png` });
    }
    await page.close();
  }
  // Capture the real server-rendered loading view by holding client JavaScript only.
  for (const width of [360, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
    let release;
    const ready = new Promise((resolve) => {
      release = resolve;
    });
    await page.route("**/*.js", async (route) => {
      await ready;
      await route.continue();
    });
    try {
      await page.goto(url, { waitUntil: "commit" });
      await page.locator(".world-awakening").waitFor();
      await page.waitForFunction(() =>
        [...document.querySelectorAll(".world-awakening img")].every(
          (i) => i.complete && i.naturalWidth > 0,
        ),
      );
      await page.screenshot({ path: `${output}/loading-${width}.png` });
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      release();
      await page.locator(".title-screen").waitFor();
      results.push({ name: "loading-to-game", width, ok: true });
    } catch (e) {
      release();
      results.push({ name: "loading-to-game", width, ok: false, error: e.message });
    }
    await page.close();
  }
} finally {
  await browser.close();
}
writeFileSync(`${output}/results.json`, JSON.stringify({ url, results }, null, 2));
console.log(JSON.stringify(results, null, 2));
if (results.some((r) => !r.ok)) process.exitCode = 1;
