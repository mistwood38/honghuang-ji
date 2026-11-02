import { useEffect, useState } from "react";
import { deltaHint, fill, meetsCond, visibleChoices } from "@/lib/honghuang/engine";
import { playChoice, unlockSound } from "@/lib/honghuang/sound";
import { sceneById } from "@/lib/honghuang/story";
import { useSave } from "@/lib/honghuang/store";
import { ORIGINS, placeById } from "@/lib/honghuang/world";
import { LifeCopy } from "./life-copy";
import { RestartButton } from "./restart-button";
import { StatList } from "./stats";

export function PlayView() {
  const state = useSave();
  const choose = useSave((save) => save.choose);
  const begin = useSave((save) => save.begin);
  const sound = useSave((save) => save.sound);
  const scene = sceneById(state.sceneId);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    document.getElementById("scene-top")?.scrollIntoView({ block: "start" });
  }, [state.sceneId]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
      const index = Number(event.key) - 1;
      if (!Number.isInteger(index) || index < 0 || !scene || scene.ending) return;
      const options = visibleChoices(state).filter((item) => item.open);
      const pick = options[index];
      if (!pick) return;
      event.preventDefault();
      unlockSound();
      playChoice(sound);
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

  const place = placeById(scene.place);
  const asides = (scene.asides ?? []).filter((aside) =>
    (aside.requires ?? []).every((cond) => meetsCond(state, cond)),
  );
  const options = visibleChoices(state);
  let openIndex = 0;

  return (
    <section className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
      <article id="scene-top" className="manuscript rise p-5 md:p-10" key={scene.id}>
        <p className="text-xs tracking-widest text-cinnabar">
          {scene.era}
          {place ? ` · ${place.name}` : ""}
        </p>
        <h1 className="mt-2 font-serif text-3xl md:text-4xl">{scene.ending?.name ?? scene.title}</h1>
        <div className="copy mt-6">
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
              className="mt-2 w-full border-0 border-b border-line bg-transparent py-2 font-serif text-lg text-fg outline-none placeholder:text-faint"
            />
          </label>
        ) : null}

        {scene.ending ? (
          <div className="mt-8 flex flex-col items-start gap-4 border-t border-line pt-6">
            <span className="seal" aria-hidden="true">
              {scene.ending.seal}
            </span>
            <p className="font-serif text-lg">归处 · {scene.ending.name}</p>
            <div className="flex flex-wrap gap-3">
              <RestartButton ink label="再入混沌" />
              <LifeCopy />
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-3">
            <p className="text-xs tracking-widest text-cinnabar">抉择</p>
            {options.map((item) => {
              const indexLabel = item.open ? String(++openIndex) : "—";
              const hint = deltaHint(item.choice.delta);
              return (
                <button
                  key={item.choice.id}
                  type="button"
                  className="choice"
                  disabled={!item.open}
                  onClick={() => {
                    if (!item.open) return;
                    unlockSound();
                    playChoice(sound);
                    choose(item.choice, scene.id === "awaken" ? draft : undefined);
                    if (scene.id === "awaken") setDraft("");
                  }}
                >
                  <span className="font-serif text-cinnabar tabular-nums">{indexLabel}</span>
                  <span className="min-w-0">
                    <span className="block font-serif text-lg leading-snug">{item.choice.text}</span>
                    {item.choice.sub ? (
                      <span className="mt-1 block text-sm leading-relaxed opacity-80">{item.choice.sub}</span>
                    ) : null}
                    {item.open && hint ? (
                      <span className="mt-1 block text-xs tracking-wide text-cinnabar">{hint}</span>
                    ) : null}
                    {!item.open && item.reason ? <span className="mt-1 block text-xs">{item.reason}</span> : null}
                  </span>
                </button>
              );
            })}
            <p className="hidden text-xs text-faint md:block">数字键亦可抉择</p>
          </div>
        )}
      </article>
      <aside className="hidden lg:block">
        <div className="sticky top-20 border border-line-dark bg-raised p-4 text-fog">
          <Identity />
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
      <p className="mt-1 text-sm text-dim">{originInfo ? `${originInfo.seal} · ${originInfo.name}` : "根骨未定"}</p>
      <div className="mt-4">
        <StatList stats={stats} />
      </div>
    </div>
  );
}
