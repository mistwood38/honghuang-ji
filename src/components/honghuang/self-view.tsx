import { useState } from "react";
import { flagLabel } from "@/lib/honghuang/engine";
import { useSave } from "@/lib/honghuang/store";
import { ITEMS, ORIGINS, realmOf } from "@/lib/honghuang/world";
import { LifeCopy } from "./life-copy";
import { RestartButton } from "./restart-button";
import { StatList } from "./stats";

export function SelfView() {
  const state = useSave();
  const rename = useSave((save) => save.rename);
  const setSound = useSave((save) => save.setSound);
  const [draft, setDraft] = useState(state.name);
  const origin = state.origin ? ORIGINS[state.origin] : null;

  return (
    <section className="mx-auto grid w-full max-w-3xl gap-6 px-4 py-6">
      <header>
        <p className="text-xs tracking-widest text-gold">我</p>
        <h1 className="mt-1 font-serif text-3xl">{state.name || "未名"}</h1>
        <p className="mt-2 text-sm text-dim">
          {origin ? `${origin.name} · ${origin.line}` : "尚未应答混沌。"} {state.started ? realmOf(state.stats.dao).name : ""}
        </p>
      </header>

      <div className="border border-line-dark bg-raised p-4">
        <StatList stats={state.stats} />
      </div>

      <div className="manuscript p-5">
        <h2 className="font-serif text-xl">道号</h2>
        <form
          className="mt-3 flex flex-wrap gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            rename(draft);
          }}
        >
          <input
            value={draft}
            maxLength={8}
            onChange={(event) => setDraft(event.target.value)}
            className="min-h-12 min-w-40 flex-1 border-0 border-b border-line bg-transparent font-serif text-lg text-fg outline-none"
            aria-label="道号"
          />
          <button type="submit" className="btn-ink">
            改定
          </button>
        </form>
      </div>

      <div className="manuscript p-5">
        <h2 className="font-serif text-xl">所携</h2>
        {state.items.length === 0 ? (
          <p className="mt-3 font-serif leading-relaxed">身无外物。</p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {state.items.map((id) => {
              const item = ITEMS[id];
              return (
                <li key={id}>
                  <p className="font-serif text-lg">{item?.name ?? id}</p>
                  <p className="text-sm leading-relaxed opacity-80">{item?.lore}</p>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="manuscript p-5">
        <h2 className="font-serif text-xl">因果</h2>
        {state.flags.length === 0 ? (
          <p className="mt-3 font-serif leading-relaxed">因果尚薄。</p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {state.flags.map((flag) => (
              <li key={flag} className="border border-line px-2 py-1 text-sm">
                {flagLabel(flag)}
              </li>
            ))}
          </ul>
        )}
        {state.log.length > 0 ? (
          <ol className="mt-5 grid gap-2 border-t border-line pt-4">
            {state.log.map((line, index) => (
              <li key={`${line.sceneId}-${index}`} className="text-sm leading-relaxed">
                <span className="text-cinnabar">{line.title}</span>
                <span> · {line.choice}</span>
              </li>
            ))}
          </ol>
        ) : null}
      </div>

      {state.pastLives.length > 0 ? (
        <div>
          <h2 className="font-serif text-xl text-fog">前尘</h2>
          <ul className="mt-3 grid gap-3">
            {state.pastLives.map((life, index) => (
              <li key={`${life.name}-${index}`} className="border border-line-dark px-4 py-3">
                <p className="font-serif text-lg">
                  {life.seal} · {life.name} · {life.ending}
                </p>
                <p className="mt-1 text-sm text-dim">{life.lines[life.lines.length - 1]}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn-ghost" onClick={() => setSound(!state.sound)}>
          钟声{state.sound ? "开" : "关"}
        </button>
        <LifeCopy />
        <RestartButton label="弃此生重开" />
      </div>
    </section>
  );
}
