import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";
import { focusReadingTarget } from "./reading-focus.ts";

function setup(
  t: TestContext,
  {
    top = 600,
    height = 90,
    header = 64,
    dock = 700,
    viewportHeight = 800,
    visualViewport = null as { offsetTop: number; height: number } | null,
  } = {},
) {
  const scrolls: ScrollToOptions[] = [];
  const focuses: FocusOptions[] = [];
  const events: string[] = [];
  const globals = {
    innerHeight: viewportHeight,
    window: {
      innerHeight: viewportHeight,
      visualViewport,
      scrollBy: (options: ScrollToOptions) => {
        scrolls.push(options);
        events.push("scroll");
      },
    },
    document: {
      querySelector: (selector: string) => {
        if (selector === ".game-header")
          return { getBoundingClientRect: () => ({ bottom: header }) };
        if (selector === ".dock") return { getBoundingClientRect: () => ({ top: dock }) };
        return null;
      },
    },
  };
  for (const [name, value] of Object.entries(globals)) {
    const original = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { configurable: true, value });
    t.after(() => {
      if (original) Object.defineProperty(globalThis, name, original);
      else Reflect.deleteProperty(globalThis, name);
    });
  }
  const target = {
    getBoundingClientRect: () => ({ top, height, bottom: top + height }),
    focus: (options: FocusOptions) => {
      focuses.push(options);
      events.push("focus");
    },
  } as unknown as HTMLElement;
  return {
    target,
    scrolls,
    focuses,
    events,
    resultingTop: () => top - (scrolls[0]?.top ?? 0),
  };
}

test("a short, fully visible response near the dock does not scroll", (t) => {
  const context = setup(t);
  focusReadingTarget(context.target);
  assert.equal(context.scrolls.length, 0);
  assert.deepEqual(context.focuses, [{ preventScroll: true }]);
});

test("a long response near the dock gets enough reading space without jumping to the top", (t) => {
  const context = setup(t, { top: 650, height: 900 });
  focusReadingTarget(context.target);
  const available = 700 - (64 + 12);
  assert.equal(context.scrolls.length, 1);
  assert.ok(700 - context.resultingTop() >= available * 0.65 - 0.01);
  assert.ok(context.resultingTop() > 64 + 12);
});

test("a long response already occupying enough of the viewport stays put", (t) => {
  const context = setup(t, { top: 200, height: 900 });
  focusReadingTarget(context.target);
  assert.equal(context.scrolls.length, 0);
});

test("a target above the reading area moves only below the header", (t) => {
  const context = setup(t, { top: -120, height: 90 });
  focusReadingTarget(context.target);
  assert.equal(context.resultingTop(), 64 + 12);
  assert.ok((context.scrolls[0].top ?? 0) < 0);
});

test("a short target below the viewport is fully revealed with minimal scrolling", (t) => {
  const context = setup(t, { top: 900, height: 90 });
  focusReadingTarget(context.target);
  assert.equal(context.resultingTop(), 700 - 90);
});

test("a long target below the viewport leaves room above its opening", (t) => {
  const context = setup(t, { top: 1000, height: 900 });
  focusReadingTarget(context.target);
  assert.ok(Math.abs(context.resultingTop() - (700 - (700 - 76) * 0.65)) < 0.01);
});

test("keyboard height and visual viewport offset bound the reading area", (t) => {
  const context = setup(t, {
    top: 580,
    height: 900,
    visualViewport: { offsetTop: 200, height: 300 },
  });
  focusReadingTarget(context.target);
  const available = 500 - 212;
  assert.ok(Math.abs(context.resultingTop() - (500 - available * 0.65)) < 0.01);
  assert.ok(context.resultingTop() >= 212);
});

test("an opening above a shifted visual viewport is moved into that viewport", (t) => {
  const context = setup(t, {
    top: 100,
    height: 90,
    visualViewport: { offsetTop: 200, height: 300 },
  });
  focusReadingTarget(context.target);
  assert.equal(context.resultingTop(), 212);
});

test("focus always prevents an additional browser scroll", (t) => {
  const context = setup(t, { top: 900, height: 90 });
  focusReadingTarget(context.target);
  assert.deepEqual(context.events, ["scroll", "focus"]);
  assert.deepEqual(context.focuses, [{ preventScroll: true }]);
  assert.equal(context.scrolls[0].behavior, "instant");
});

test("null is safe without reading browser globals", () => {
  assert.doesNotThrow(() => focusReadingTarget(null));
});

test("an extremely small visible area never positions the opening outside it", (t) => {
  const context = setup(t, {
    top: 300,
    height: 900,
    header: 0,
    dock: 800,
    visualViewport: { offsetTop: 200, height: 20 },
  });
  focusReadingTarget(context.target);
  assert.ok(context.resultingTop() >= 212);
  assert.ok(context.resultingTop() <= 220);
});

test("an entirely occluded viewport focuses without a meaningless scroll", (t) => {
  const context = setup(t, {
    top: 300,
    height: 900,
    visualViewport: { offsetTop: 0, height: 40 },
  });
  focusReadingTarget(context.target);
  assert.equal(context.scrolls.length, 0);
  assert.deepEqual(context.focuses, [{ preventScroll: true }]);
});
