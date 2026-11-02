import { useEffect } from "react";
import { BookOpen, Compass, Library, ScrollText, UserRound } from "lucide-react";
import { sceneById } from "@/lib/honghuang/story";
import { useSave } from "@/lib/honghuang/store";
import { APP_NAME, NOVEL_NAME, realmOf, STAT_LABEL, STAT_ORDER } from "@/lib/honghuang/world";
import type { Screen } from "@/lib/honghuang/types";
import { CodexView } from "./codex-view";
import { LandView } from "./land-view";
import { NovelView } from "./novel-view";
import { PlayView } from "./play-view";
import { RestartButton } from "./restart-button";
import { SelfView } from "./self-view";

const DOCK: { id: Screen; label: string; icon: typeof BookOpen }[] = [
  { id: "play", label: "入世", icon: ScrollText },
  { id: "novel", label: "本纪", icon: BookOpen },
  { id: "codex", label: "天书", icon: Library },
  { id: "land", label: "山河", icon: Compass },
  { id: "self", label: "我", icon: UserRound },
];

export function GameApp() {
  useEffect(() => {
    void useSave.persist.rehydrate();
  }, []);

  return <Shell />;
}

function Shell() {
  const screen = useSave((state) => state.screen);
  const setScreen = useSave((state) => state.setScreen);
  const name = useSave((state) => state.name);
  const stats = useSave((state) => state.stats);
  const started = useSave((state) => state.started);
  const sceneId = useSave((state) => state.sceneId);
  const scene = sceneById(sceneId);

  if (screen === "title") return <TitleScreen />;

  return (
    <div className="shell">
      <header className="sticky top-0 z-20 border-b border-line-dark bg-ink/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <button type="button" className="font-serif text-xl text-gold" onClick={() => setScreen("title")}>
            {APP_NAME}
          </button>
          <p className="truncate text-right text-sm text-dim">
            {started ? (
              <>
                <span className="text-fog">{name || "未名"}</span>
                <span> · {scene?.ending?.name ?? realmOf(stats.dao).name}</span>
              </>
            ) : (
              "尚未入世"
            )}
          </p>
        </div>
        {screen === "play" && started ? (
          <div className="border-t border-line-dark px-4 py-2 lg:hidden">
            <CompactStats />
          </div>
        ) : null}
      </header>
      <main>
        {screen === "play" ? <PlayView /> : null}
        {screen === "novel" ? <NovelView /> : null}
        {screen === "codex" ? <CodexView /> : null}
        {screen === "land" ? <LandView /> : null}
        {screen === "self" ? <SelfView /> : null}
      </main>
      <nav className="dock" aria-label="章节">
        <ul className="mx-auto grid w-full max-w-5xl grid-cols-5">
          {DOCK.map((item) => {
            const Icon = item.icon;
            const current = screen === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={
                    current
                      ? "flex min-h-14 w-full flex-col items-center justify-center gap-1 text-gold"
                      : "flex min-h-14 w-full flex-col items-center justify-center gap-1 text-dim"
                  }
                  aria-current={current ? "page" : undefined}
                  onClick={() => setScreen(item.id)}
                >
                  <Icon size={18} strokeWidth={1.5} aria-hidden="true" />
                  <span className="text-xs">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

function CompactStats() {
  const stats = useSave((state) => state.stats);
  return (
    <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-dim">
      {STAT_ORDER.map((key) => (
        <span key={key}>
          {STAT_LABEL[key]} <span className="tabular-nums text-fog">{stats[key]}</span>
        </span>
      ))}
    </p>
  );
}

function TitleScreen() {
  const started = useSave((state) => state.started);
  const begin = useSave((state) => state.begin);
  const setScreen = useSave((state) => state.setScreen);
  const past = useSave((state) => state.pastLives.length);
  const name = useSave((state) => state.name);
  const sceneId = useSave((state) => state.sceneId);
  const ending = sceneById(sceneId)?.ending?.name;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-5 py-16">
      <span className="seal" aria-hidden="true">
        洪
      </span>
      <h1 className="mt-6 font-serif text-5xl text-fog md:text-6xl">{APP_NAME}</h1>
      <p className="mt-2 font-serif text-lg text-gold">{NOVEL_NAME}</p>
      <p className="mt-6 max-w-md font-serif text-xl leading-relaxed text-fog">斧声之前，你已不肯散。</p>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-dim">
        正史从混沌写到封神余响，天书是整套世界。入世不改大事件，只把你写成缝里的那一笔。
      </p>
      <div className="mt-8 flex flex-col items-start gap-3">
          <button type="button" className="btn-primary" onClick={() => begin()}>
            {started ? "回到你的因果" : "踏入混沌"}
          </button>
          <button type="button" className="btn-ghost" onClick={() => setScreen("novel")}>
            阅读《{NOVEL_NAME}》
          </button>
          <button type="button" className="btn-ghost" onClick={() => setScreen("codex")}>
            翻开天书
          </button>
          <button type="button" className="btn-ghost" onClick={() => setScreen("land")}>
            看山河
          </button>
          {started ? <RestartButton label="弃此生重开" /> : null}
          {started ? (
            <p className="text-sm text-dim">
              当前：{name || "未名"}
              {ending ? ` · ${ending}` : ""}
              {past > 0 ? ` · 已有${past}世前尘` : ""}
            </p>
          ) : null}
        </div>
    </div>
  );
}
