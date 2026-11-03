import { useEffect, useState } from "react";
import { fill, meetsCond, visibleChoices } from "@/lib/honghuang/engine";
import { playChoice, unlockSound } from "@/lib/honghuang/sound";
import { sceneById } from "@/lib/honghuang/story";
import { useSave } from "@/lib/honghuang/store";
import { artForScene, moodForScene } from "@/lib/honghuang/visuals";
import { Artwork, Atmosphere } from "./art";
import { portraitForOrigin } from "@/lib/honghuang/portrait";
import type { StatKey } from "@/lib/honghuang/types";
import { ORIGINS, STAT_LABEL, placeById } from "@/lib/honghuang/world";
import { LifeCopy } from "./life-copy";
import { RestartButton } from "./restart-button";
import { StatList } from "./stats";
import "./play-navigation.css";

export function PlayView() {
  const state = useSave();
  const choose = useSave((save) => save.choose);
  const begin = useSave((save) => save.begin);
  const sound = useSave((save) => save.sound);
  const scene = sceneById(state.sceneId);
  const [draft, setDraft] = useState("");
  const portrait = portraitForOrigin(state.origin);

  useEffect(() => {
    document.querySelector<HTMLElement>(".scene-caption h1")?.focus({ preventScroll: true });
    document.getElementById("scene-top")?.scrollIntoView({ block: "start" });
  }, [state.sceneId]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.isComposing ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.repeat
      )
        return;
      const live = useSave.getState();
      if (!state.started || !live.started || live.screen !== "play" || live.sceneId !== scene?.id)
        return;
      if (document.querySelector('[role="dialog"], [role="alertdialog"]')) return;
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest('input, textarea, select, [contenteditable="true"]')
      )
        return;
      const index = Number(event.key) - 1;
      if (!Number.isInteger(index) || index < 0 || !scene || scene.ending) return;
      const options = visibleChoices(state).filter((item) => item.open);
      const pick = options[index];
      if (!pick) return;
      event.preventDefault();
      if (sound) unlockSound();
      const next = sceneById(pick.choice.to);
      playChoice(sound, next ? moodForScene(next) : "mist");
      choose(pick.choice, scene.id === "awaken" ? draft : undefined);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choose, draft, scene, sound, state]);

  if (!state.started || !scene) {
    return (
      <section className="mx-auto w-full max-w-xl px-4 py-10">
        <div className="manuscript p-6 md:p-8">
          <h1 className="font-serif text-3xl">尚未入世</h1>
          <div className="copy mt-4">
            <p>混沌里还有一缕不肯散的灵。正史已经写完，缝还空着。</p>
          </div>
          <button type="button" className="btn-primary mt-6" onClick={() => begin()}>
            踏入混沌
          </button>
        </div>
      </section>
    );
  }

  function goToSection(id: "scene-story" | "scene-choices") {
    const target = document.getElementById(id);
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: "start", behavior: "auto" });
  }

  const place = placeById(scene.place);
  const asides = (scene.asides ?? []).filter((aside) =>
    (aside.requires ?? []).every((cond) => meetsCond(state, cond)),
  );
  const options = visibleChoices(state);
  let openIndex = 0;

  return (
    <section id="scene-top" className="page-wrap play-layout">
      <article
        className={`scene-chapter scene-${moodForScene(scene)}${scene.ending ? " is-ending" : ""}`}
        data-ending={scene.ending ? scene.id : undefined}
        key={scene.id}
      >
        <div className="scene-hero">
          <Artwork art={artForScene(scene)} eager decorative />
          <Atmosphere mood={moodForScene(scene)} />
          <div className="scene-hero-shade" aria-hidden="true" />
          <div className="scene-caption">
            <p className="eyebrow">
              {scene.era} <span> / </span> {place?.name ?? "洪荒"}
            </p>
            <h1 tabIndex={-1}>{scene.ending?.name ?? scene.title}</h1>
            <p className="scene-place-line">{place?.summary}</p>
          </div>
          {scene.ending ? (
            <span className="ending-hero-seal" aria-hidden="true">
              {scene.ending.seal}
            </span>
          ) : null}
          <span className="scene-volume" aria-hidden="true">
            入世 · 第{String(state.log.length + 1).padStart(2, "0")}笔
          </span>
        </div>
        <div className="scene-paper scene-reading-panel">
          {scene.ending ? (
            <div className="ending-record">
              <p className="eyebrow">此生已成卷</p>
              <p className="ending-record-name">{state.name || "未名"}</p>
              <div>
                <span>{state.log.length} 段因果</span>
                <span>{state.items.length} 件所携</span>
                <span>{state.flags.length} 道印记</span>
              </div>
            </div>
          ) : null}
          <div className="narrative-label">
            <span>因 果 正 文</span>
            {scene.ending ? (
              <span aria-hidden="true">—— ◇ ——</span>
            ) : (
              <button
                type="button"
                className="scene-jump"
                onClick={() => goToSection("scene-choices")}
              >
                前往抉择 <span aria-hidden="true">↓</span>
              </button>
            )}
          </div>
          <div className="copy" id="scene-story" tabIndex={-1} aria-label="本幕剧情">
            {scene.paragraphs.map((paragraph) => (
              <p key={paragraph}>{fill(paragraph, state)}</p>
            ))}
          </div>
          {asides.length > 0 ? (
            <div className="mt-6 grid gap-3">
              {asides.map((aside) => (
                <p key={aside.text} className="aside">
                  {fill(aside.text, state)}
                </p>
              ))}
            </div>
          ) : null}

          {scene.id === "awaken" ? (
            <label className="mt-8 block">
              <span className="text-sm text-faint">道号，可留空</span>
              <input
                value={draft}
                maxLength={8}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="不取则随根骨赐号"
                className="scene-name-input"
              />
            </label>
          ) : null}

          {scene.ending ? (
            <div className="ending-actions mt-8">
              <span className="seal" aria-hidden="true">
                {scene.ending.seal}
              </span>
              <p className="ending-signature">归处 · {scene.ending.name}</p>
              <div className="flex flex-wrap gap-3">
                <RestartButton label="再入混沌" />
                <LifeCopy />
              </div>
            </div>
          ) : (
            <div className="choice-list mt-8 grid gap-3">
              <div className="choice-heading">
                <h2 id="scene-choices" tabIndex={-1}>
                  此 刻 · 抉 择
                </h2>
                <button
                  type="button"
                  className="scene-jump scene-jump-back"
                  onClick={() => goToSection("scene-story")}
                >
                  回看剧情 <span aria-hidden="true">↑</span>
                </button>
              </div>
              {options.map((item) => {
                const indexLabel = item.open ? String(++openIndex) : "—";
                const changes = Object.entries(item.choice.delta ?? {}).filter(
                  ([, value]) => value !== 0,
                );
                return (
                  <button
                    key={item.choice.id}
                    type="button"
                    className="choice"
                    disabled={!item.open}
                    onClick={() => {
                      if (!item.open || useSave.getState().sceneId !== scene.id) return;
                      if (sound) unlockSound();
                      const next = sceneById(item.choice.to);
                      playChoice(sound, next ? moodForScene(next) : "mist");
                      choose(item.choice, scene.id === "awaken" ? draft : undefined);
                      if (scene.id === "awaken") setDraft("");
                    }}
                  >
                    <span className={`choice-number${item.choice.setOrigin ? " choice-root" : ""}`}>
                      {item.choice.setOrigin ? ORIGINS[item.choice.setOrigin].seal : indexLabel}
                      <small>{item.choice.setOrigin ? indexLabel : ""}</small>
                    </span>
                    <span className="choice-copy min-w-0">
                      <span className="block font-serif text-lg leading-snug">
                        {item.choice.text}
                      </span>
                      {item.choice.sub ? (
                        <span className="mt-1 block text-sm leading-relaxed opacity-80">
                          {item.choice.sub}
                        </span>
                      ) : null}
                      {item.open && changes.length ? (
                        <span className="choice-deltas">
                          {changes.map(([key, value]) => (
                            <span
                              className={value! < 0 ? "delta-cost" : "delta-gain"}
                              data-stat={key}
                              key={key}
                            >
                              {STAT_LABEL[key as StatKey]} {value! > 0 ? "+" : ""}
                              {value}
                            </span>
                          ))}
                        </span>
                      ) : null}
                      {!item.open && item.reason ? (
                        <span className="mt-1 block text-xs">{item.reason}</span>
                      ) : null}
                    </span>
                    <span className="choice-arrow" aria-hidden="true">
                      ⟶
                    </span>
                  </button>
                );
              })}
              <p className="hidden text-xs text-faint md:block">数字键亦可抉择</p>
            </div>
          )}
        </div>
      </article>
      <aside className="play-sidebar">
        <div className="identity-card bronze-panel">
          <picture className="identity-portrait">
            <source media="(max-width: 640px)" srcSet={portrait.small} />
            <img src={portrait.src} width={1000} height={1500} loading="lazy" alt={portrait.alt} />
          </picture>
          <div className="identity-content">
            <p className="eyebrow">此 世 · 灵 识</p>
            <Identity />
            <div className="identity-foot">
              <span>所携 {state.items.length}</span>
              <span>因果 {state.flags.length}</span>
            </div>
            <button
              type="button"
              className="identity-link"
              onClick={() => useSave.getState().setScreen("self")}
            >
              观照此身 <span aria-hidden="true">⟶</span>
            </button>
          </div>
        </div>
        <div className="play-note">
          <p className="eyebrow">正史既定 · 此生由你</p>
          <p>
            大能的胜负已写在本纪里。
            <br />
            你的自由，是在天地之间，
            <br />
            决定自己站在哪里。
          </p>
        </div>
      </aside>
    </section>
  );
}

export function Identity() {
  const name = useSave((state) => state.name);
  const origin = useSave((state) => state.origin);
  const stats = useSave((state) => state.stats);
  const originInfo = origin ? ORIGINS[origin] : null;
  return (
    <div>
      <p className="font-serif text-xl text-gold">{name || "未名"}</p>
      <p className="mt-1 text-sm text-dim">
        {originInfo ? `${originInfo.seal} · ${originInfo.name}` : "根骨未定"}
      </p>
      <div className="mt-4">
        <StatList stats={stats} />
      </div>
    </div>
  );
}
