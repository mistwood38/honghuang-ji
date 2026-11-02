import { useEffect } from "react";
import { sceneById } from "@/lib/honghuang/story";
import { playChoice, unlockSound } from "@/lib/honghuang/sound";
import { useSave } from "@/lib/honghuang/store";
import { APP_NAME, NOVEL_NAME, realmOf, STAT_LABEL, STAT_ORDER } from "@/lib/honghuang/world";
import { ART } from "@/lib/honghuang/visuals";
import type { Screen } from "@/lib/honghuang/types";
import { Artwork, Atmosphere } from "./art";
import { CodexView } from "./codex-view";
import { LandView } from "./land-view";
import { NovelView } from "./novel-view";
import { PlayView } from "./play-view";
import { RestartButton } from "./restart-button";
import { SelfView } from "./self-view";

const DOCK: { id: Screen; label: string; mark: string; note: string }[] = [
  { id: "play", label: "入世", mark: "世", note: "一生因果" },
  { id: "land", label: "山河", mark: "山", note: "天地舆图" },
  { id: "self", label: "我的", mark: "我", note: "灵识六相" },
  { id: "novel", label: "本纪", mark: "纪", note: "混沌正史" },
  { id: "codex", label: "天书", mark: "书", note: "万象典藏" },
];

export function GameApp() {
  useEffect(() => {
    void Promise.resolve(useSave.persist.rehydrate()).finally(() =>
      useSave.getState().setHydrated(true),
    );
  }, []);
  const hydrated = useSave((state) => state.hydrated);
  return hydrated ? (
    <Shell />
  ) : (
    <div className="awakening" role="status">
      <span className="seal">洪</span>
      <p>天地未明，灵识将醒。</p>
    </div>
  );
}

function Shell() {
  const screen = useSave((state) => state.screen);
  const setScreen = useSave((state) => state.setScreen);
  const name = useSave((state) => state.name);
  const stats = useSave((state) => state.stats);
  const started = useSave((state) => state.started);
  const sceneId = useSave((state) => state.sceneId);
  const scene = sceneById(sceneId);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [screen]);

  if (screen === "title") return <TitleScreen />;
  return (
    <div className="shell">
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
            <span className="brand-seal" aria-hidden="true">
              洪
            </span>
            {APP_NAME}
            <span className="brand-caption">天地一卷 · 众生一笔</span>
          </button>
          <div className="header-meta">
            <span className="header-identity">
              {started
                ? `${name || "未名"} · ${scene?.ending?.name ?? realmOf(stats.dao).name}`
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
        {screen === "play" ? <PlayView /> : null}
        {screen === "novel" ? <NovelView /> : null}
        {screen === "codex" ? <CodexView /> : null}
        {screen === "land" ? <LandView /> : null}
        {screen === "self" ? <SelfView /> : null}
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
    <button
      type="button"
      className="sound-button"
      aria-label={`钟声${sound ? "开" : "关"}`}
      aria-pressed={sound}
      onClick={() => {
        if (!sound) {
          unlockSound();
          playChoice(true);
        }
        setSound(!sound);
      }}
    >
      <span className={`sound-bars ${sound ? "sound-on" : ""}`} aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>钟声{sound ? "开" : "关"}</span>
    </button>
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
        <p className="title-line">
          斧声之前，
          <br className="mobile-break" />
          你已不肯散。
        </p>
        <p className="title-description">
          从混沌到封神，山河皆有定数。
          <br />
          在天地的缝隙里，写下属于你的一笔。
        </p>
        <button
          type="button"
          className="fate-button"
          onClick={() => {
            if (sound) {
              unlockSound();
              playChoice(sound, "radiance");
            }
            begin();
          }}
        >
          <span className="fate-button-edge" aria-hidden="true">
            ◇
          </span>
          <span>
            {started ? "续 写 因 果" : "踏 入 混 沌"}
            <small>{started ? "回到你的因果" : "一缕灵识 · 一世洪荒"}</small>
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
