import { lazy, Suspense, useEffect } from "react";
import { cueForPlace, musicCue } from "@/lib/honghuang/music";
import { eraName, ROAM_PLACES } from "@/lib/honghuang/roam/engine";
import { sceneById } from "@/lib/honghuang/story";
import { playUi, setAmbience, setAudioMix, unlockSound } from "@/lib/honghuang/sound";
import { useSave } from "@/lib/honghuang/store";
import { useAudioMix } from "@/lib/honghuang/audio-settings";
import { LoadingView } from "./loading-view";
import { SoundSettings } from "./sound-settings";
import { ART, artForPlace, artForScene, moodForScene } from "@/lib/honghuang/visuals";
import { APP_NAME, NOVEL_NAME, realmOf, STAT_LABEL, STAT_ORDER } from "@/lib/honghuang/world";
import type { Screen } from "@/lib/honghuang/types";
import { Artwork, Atmosphere } from "./art";
import { RestartButton } from "./restart-button";
import { SaveTransfer } from "./save-transfer";
import "./cinematic.css";
import "./experience.css";
import "./page-unfolding.css";

const CodexView = lazy(() =>
  import("./codex-view").then((module) => ({ default: module.CodexView })),
);
const LandView = lazy(() => import("./land-view").then((module) => ({ default: module.LandView })));
const NovelView = lazy(() =>
  import("./novel-view").then((module) => ({ default: module.NovelView })),
);
const PlayView = lazy(() => import("./play-view").then((module) => ({ default: module.PlayView })));
const SelfView = lazy(() => import("./self-view").then((module) => ({ default: module.SelfView })));

const DOCK: { id: Screen; label: string; mark: string; note: string }[] = [
  { id: "play", label: "入世", mark: "世", note: "一生因果" },
  { id: "land", label: "山河", mark: "山", note: "天地舆图" },
  { id: "self", label: "我的", mark: "我", note: "灵识六相" },
  { id: "novel", label: "本纪", mark: "纪", note: "混沌正史" },
  { id: "codex", label: "天书", mark: "书", note: "万象典藏" },
];

export function GameApp() {
  useEffect(() => {
    void useAudioMix.persist.rehydrate();
    void Promise.resolve(useSave.persist.rehydrate()).finally(() =>
      useSave.getState().setHydrated(true),
    );
  }, []);
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!useSave.getState().sound) return;
      const element =
        event.target instanceof Element ? event.target.closest("button, summary") : null;
      if (!(element instanceof HTMLElement)) return;
      if (element instanceof HTMLButtonElement && element.disabled) return;
      const confirm =
        element.classList.contains("choice") ||
        element.classList.contains("fate-button") ||
        element.classList.contains("game-action--plaque");
      const kind = element.dataset.uiSound;
      playUi(
        kind === "skill" || kind === "item" || kind === "confirm"
          ? kind
          : confirm
            ? "confirm"
            : element.classList.contains("dock-item") || element.closest(".roam-tabs")
              ? "tab"
              : element.tagName === "SUMMARY"
                ? "panel"
                : "tap",
      );
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, []);
  const hydrated = useSave((state) => state.hydrated);
  return hydrated ? (
    <>
      <Ambience />
      <Shell />
    </>
  ) : (
    <LoadingView />
  );
}

function Shell() {
  const screen = useSave((state) => state.screen);
  const setScreen = useSave((state) => state.setScreen);
  const name = useSave((state) => state.name);
  const stats = useSave((state) => state.stats);
  const started = useSave((state) => state.started);
  const sceneId = useSave((state) => state.sceneId);
  const world = useSave((state) => state.world);
  const scene = sceneById(sceneId);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [screen]);

  if (screen === "title") return <TitleScreen />;
  return (
    <div className={`shell shell-${screen}`}>
      <div className="world-backdrop" aria-hidden="true">
        <Artwork
          art={
            screen === "codex"
              ? ART.palace
              : screen === "land"
                ? ART.worldmap
                : screen === "play" && world
                  ? artForPlace(world.place)
                  : screen === "play" && scene
                    ? artForScene(scene)
                    : ART.mountain
          }
          decorative
        />
      </div>
      <a className="skip-link" href="#game-content">
        跳至正文
      </a>
      <header className="game-header">
        <div className="header-inner">
          <button
            type="button"
            className="game-brand"
            onClick={() => setScreen("title")}
            aria-label="洪荒纪 · 返回封面"
          >
            <img
              className="brand-emblem"
              src="/art/app-emblem.webp"
              alt=""
              width="36"
              height="36"
            />
            {APP_NAME}
            <span className="brand-caption">洪荒神话 · 沉浸叙事</span>
          </button>
          <div className="header-meta">
            <span className="header-chapter">{DOCK.find((item) => item.id === screen)?.note}</span>
            <span className="header-identity">
              {started
                ? world
                  ? `${name || "未名"} · ${eraName(world).name} · ${ROAM_PLACES[world.place].name}`
                  : `${name || "未名"} · ${scene?.ending?.name ?? realmOf(stats.dao).name}`
                : "尚未入世"}
            </span>
            <SoundButton />
          </div>
        </div>
        {screen === "play" && started ? (
          <div className="compact-stats">
            <CompactStats />
          </div>
        ) : null}
      </header>
      <main id="game-content" className="screen-enter" key={screen}>
        <Suspense
          fallback={
            <div className="page-unfolding" role="status">
              正在展开此卷…
            </div>
          }
        >
          {screen === "play" ? <PlayView /> : null}
          {screen === "novel" ? <NovelView /> : null}
          {screen === "codex" ? <CodexView /> : null}
          {screen === "land" ? <LandView /> : null}
          {screen === "self" ? <SelfView /> : null}
        </Suspense>
      </main>
      <nav className="dock" aria-label="游戏主导航">
        <ul>
          {DOCK.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`dock-item ${screen === item.id ? "is-current" : ""}`}
                aria-current={screen === item.id ? "page" : undefined}
                onClick={() => setScreen(item.id)}
              >
                <span className="dock-mark" aria-hidden="true">
                  {item.mark}
                </span>
                <span className="dock-label">{item.label}</span>
                <span className="dock-note">{item.note}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
function Ambience() {
  const mix = useAudioMix();
  useEffect(() => setAudioMix(mix), [mix]);
  const screen = useSave((state) => state.screen);
  const sound = useSave((state) => state.sound);
  const sceneId = useSave((state) => state.sceneId);
  const place = useSave((state) => state.world?.place);
  const phase = useSave((state) => state.world?.phase);
  const seated = useSave(
    (state) => Boolean(state.world?.retreat) || state.world?.idle?.kind === "sit",
  );
  useEffect(() => {
    if (!sound) {
      setAmbience(false);
      return;
    }
    if (screen === "play" && place) {
      setAmbience(true, phase === "battle" ? "calamity" : seated ? "self" : cueForPlace(place));
      return;
    }
    const scene = sceneById(sceneId);
    setAmbience(true, musicCue(screen, scene ? moodForScene(scene) : "mist"));
  }, [screen, sound, sceneId, place, phase, seated]);
  return null;
}
function primeSound() {
  const live = useSave.getState();
  const scene = sceneById(live.sceneId);
  const cue = live.world
    ? cueForPlace(live.world.place)
    : musicCue(live.screen, scene ? moodForScene(scene) : "mist");
  setAmbience(true, cue);
  unlockSound();
  live.setSound(true);
}
function CompactStats() {
  const stats = useSave((state) => state.stats);
  return (
    <p>
      {STAT_ORDER.map((key) => (
        <span key={key}>
          {STAT_LABEL[key]} <b>{stats[key]}</b>
        </span>
      ))}
    </p>
  );
}
function SoundButton() {
  const sound = useSave((state) => state.sound);
  const setSound = useSave((state) => state.setSound);
  return (
    <div className="sound-controls">
      <button
        type="button"
        className="sound-button"
        aria-label={`乐声${sound ? "开" : "关"}`}
        aria-pressed={sound}
        onClick={() => {
          if (!sound) primeSound();
          else {
            setAmbience(false);
            setSound(false);
          }
        }}
      >
        <span className={`sound-bars ${sound ? "sound-on" : ""}`} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>乐声{sound ? "开" : "关"}</span>
      </button>
      <SoundSettings />
    </div>
  );
}
function TitleScreen() {
  const started = useSave((state) => state.started);
  const begin = useSave((state) => state.begin);
  const setScreen = useSave((state) => state.setScreen);
  const sound = useSave((state) => state.sound);
  const past = useSave((state) => state.pastLives.length);
  const name = useSave((state) => state.name);
  const sceneId = useSave((state) => state.sceneId);
  const world = useSave((state) => state.world);
  const openWorld = useSave((state) => state.openWorld);
  const beginChronicle = useSave((state) => state.beginChronicle);
  const ending = sceneById(sceneId)?.ending?.name;
  return (
    <div className="title-screen">
      <Artwork art={ART.chaos} className="title-art" eager decorative />
      <div className="title-shade" aria-hidden="true" />
      <Atmosphere mood="radiance" />
      <header className="title-top">
        <span className="title-edition">东方神话 · 文字叙事</span>
        <SoundButton />
      </header>
      <main className="title-content">
        <p className="eyebrow title-kicker">
          <span /> 混 沌 初 醒 · 万 象 未 名
        </p>
        <div className="title-lockup">
          <h1>{APP_NAME}</h1>
          <span className="title-seal" aria-hidden="true">
            天地
            <br />
            初开
          </span>
        </div>
        <p className="title-subtitle">{NOVEL_NAME}</p>
        <div className="title-divider" aria-hidden="true">
          <span />◇<span />
        </div>
        <p className="title-line">斧声之前，你已不肯散。日子很长，不必十几步就写成结局。</p>
        <p className="title-description">
          山河有时代，没有人强迫你跟着时代跑完。
          <br />
          修炼、赶路、结怨、吃饭，都算这一世。
        </p>
        <button
          type="button"
          className="fate-button"
          onClick={() => {
            if (sound) primeSound();
            begin();
          }}
        >
          <span className="fate-button-edge" aria-hidden="true">
            ◇
          </span>
          <span>
            {started ? "继 续 此 生" : "踏 入 洪 荒"}
            <small>
              {started
                ? world
                  ? "回到你停下的那一日"
                  : "回到残卷"
                : "自由游历 · 不是十几步的结局"}
            </small>
          </span>
          <span className="fate-button-arrow" aria-hidden="true">
            ⟶
          </span>
        </button>
        {started ? (
          <p className="title-save">
            {name || "未名"} · {ending || "此生未尽"}
            {past > 0 ? ` · ${past}世前尘` : ""}
            <span>因果已存于此间</span>
          </p>
        ) : (
          <p className="title-save">因果随行 · 自动留存于当前浏览器</p>
        )}
        <SaveTransfer />
        {!started ? (
          <p className="title-save">
            <button
              type="button"
              onClick={() => {
                if (sound) primeSound();
                beginChronicle();
              }}
            >
              先沿残卷入世
            </button>
          </p>
        ) : null}
        {started && !world ? (
          <p className="title-save">
            <button type="button" onClick={() => openWorld()}>
              离开残卷，自行游历
            </button>
          </p>
        ) : null}
        <nav className="title-links" aria-label="阅览世界">
          <button type="button" onClick={() => setScreen("novel")}>
            <span>壹</span>读本纪
          </button>
          <button type="button" onClick={() => setScreen("land")}>
            <span>贰</span>观山河
          </button>
          <button type="button" onClick={() => setScreen("codex")}>
            <span>叁</span>阅天书
          </button>
        </nav>
        {started ? (
          <div className="title-restart">
            <RestartButton label="弃此生重开" />
          </div>
        ) : null}
      </main>
      <aside className="title-verse" aria-hidden="true">
        清浊未分之际
        <br />
        你是那一缕不肯散的灵
      </aside>
      <footer className="title-footer">
        <span>洪 荒 纪</span>
        <p>一部可阅读、可入世的洪荒神话</p>
        <span>卷一 · 混沌</span>
      </footer>
    </div>
  );
}
