import { useState } from "react";
import { portraitForOrigin } from "@/lib/honghuang/portrait";
import { flagLabel } from "@/lib/honghuang/engine";
import { playChoice, setAmbience, unlockSound } from "@/lib/honghuang/sound";
import { useSave } from "@/lib/honghuang/store";
import { ITEMS, ORIGINS, realmOf } from "@/lib/honghuang/world";
import { PageHeading, SectionHeading } from "./art";
import { ItemArt } from "./item-art";
import { LifeCopy } from "./life-copy";
import { RestartButton } from "./restart-button";
import { StatList } from "./stats";
import "./world-views.css";

export function SelfView() {
  const state = useSave();
  const rename = useSave((save) => save.rename);
  const setSound = useSave((save) => save.setSound);
  const [draft, setDraft] = useState(state.name);
  const [renamed, setRenamed] = useState(false);
  const origin = state.origin ? ORIGINS[state.origin] : null;
  const realm = realmOf(state.stats.dao);
  const portrait = portraitForOrigin(state.origin);

  return (
    <section className={`page-wrap self-page self-origin-${state.origin ?? "unknown"}`}>
      <PageHeading label="此身 · 此世 · 此间因果" title="灵识照影">
        <p>身在天地之间，所携、所欠、所记，皆是一生。</p>
      </PageHeading>
      <div className="self-overview bronze-panel">
        <div className="self-portrait">
          <picture>
            <source media="(max-width: 640px)" srcSet={portrait.small} />
            <img
              src={portrait.src}
              alt={portrait.alt}
              width={1000}
              height={1500}
              loading="eager"
              decoding="async"
            />
          </picture>
          <div className="self-portrait-shade" aria-hidden="true" />
          <span className="self-portrait-edition" aria-hidden="true">
            此身 · 一念成形
          </span>
          <div className="self-portrait-caption">
            <span className="self-origin-seal">{origin?.seal ?? "灵"}</span>
            <div>
              <p>
                {origin?.name ?? "混沌灵"} · {state.started ? realm.name : "尚未入世"}
              </p>
              <h2>{state.name || "未名"}</h2>
              <span>不肯散的那一缕</span>
            </div>
          </div>
        </div>
        <div className="self-identity">
          <div className="self-dossier-heading">
            <div>
              <p className="eyebrow">此 生 · 灵 识 六 相</p>
              <h3>观照此身</h3>
            </div>
            <span className="self-dossier-mark" aria-hidden="true">
              命
            </span>
          </div>
          <p className="self-origin-line">
            {origin ? `${origin.name} · ${origin.line}` : "尚未应答混沌。"}
          </p>
          <div className="self-realm">
            <span>此生留痕</span>
            <strong>{state.log.length} 段因果</strong>
            <span>
              {state.items.length} 物 · {state.flags.length} 印
            </span>
          </div>
          <div className="self-stats">
            <StatList stats={state.stats} />
          </div>
          <form
            className="self-rename"
            onSubmit={(event) => {
              event.preventDefault();
              rename(draft);
              setRenamed(true);
            }}
          >
            <label htmlFor="self-name">改定道号</label>
            <div>
              <input
                id="self-name"
                value={draft}
                maxLength={8}
                onChange={(event) => {
                  setDraft(event.target.value);
                  setRenamed(false);
                }}
                placeholder="未名"
              />
              <button type="submit" className="btn-ghost">
                改定
              </button>
            </div>
            <p role="status">{renamed ? "道号已记。" : "至多八字，留空则为未名。"}</p>
          </form>
        </div>
      </div>
      <div className="self-record-grid">
        <section className="self-inventory bronze-panel">
          <div className="self-relic-art">
            <picture>
              <source media="(max-width: 640px)" srcSet="/art/relics-small.webp" />
              <img
                src="/art/relics.webp"
                alt="古铜钟、灵石、苍玉与盘古遗骨构成的古器静物画"
                width={1536}
                height={1024}
                loading="lazy"
                decoding="async"
              />
            </picture>
            <span>器物有灵&#12288;因果有重</span>
          </div>
          <div className="self-section-body">
            <SectionHeading>
              所携 <small>{state.items.length} 物</small>
            </SectionHeading>
            {state.items.length === 0 ? (
              <p className="self-empty">
                身无外物。<span>天地初醒，一念随身。</span>
              </p>
            ) : (
              <ul className="self-items">
                {state.items.map((id) => {
                  const item = ITEMS[id];
                  return (
                    <li key={id}>
                      <ItemArt id={id} />
                      <div>
                        <h3>{item?.name ?? id}</h3>
                        <p>{item?.lore}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
        <section className="self-karma bronze-panel">
          <SectionHeading>
            因果 <small>{state.flags.length} 印</small>
          </SectionHeading>
          {state.flags.length === 0 ? (
            <p className="self-empty">因果尚薄。</p>
          ) : (
            <ul className="self-flags">
              {state.flags.map((flag) => (
                <li key={flag}>{flagLabel(flag)}</li>
              ))}
            </ul>
          )}
          {state.log.length > 0 ? (
            <ol className="self-timeline">
              {state.log.map((line, index) => (
                <li key={`${line.sceneId}-${index}`}>
                  <span className="self-timeline-number" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3>{line.title}</h3>
                    <p>{line.choice}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="self-history-note">你走过的路，会在这里留下笔迹。</p>
          )}
        </section>
      </div>
      <section className="self-past" aria-label="前尘">
        <SectionHeading>
          前尘 <small>{state.pastLives.length} 世</small>
        </SectionHeading>
        {state.pastLives.length === 0 ? (
          <p className="self-past-empty">前尘尚空。这是你正在写的一生。</p>
        ) : (
          <ul>
            {state.pastLives.map((life, index) => (
              <li className="bronze-panel" key={`${life.name}-${index}`}>
                <span className="self-past-seal">{life.seal}</span>
                <div>
                  <p className="eyebrow">
                    第 {index + 1} 世 · {life.ending}
                  </p>
                  <h3>{life.name || "未名"}</h3>
                  <p className="self-past-ending">{life.lines[life.lines.length - 1]}</p>
                  <details>
                    <summary>翻阅此生</summary>
                    <ol>
                      {life.lines.map((line, lineIndex) => (
                        <li key={`${lineIndex}-${line}`}>{line}</li>
                      ))}
                    </ol>
                  </details>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <div className="self-actions bronze-panel">
        <div>
          <p className="eyebrow">此世留痕</p>
          <p>钟声、抄录与轮回</p>
        </div>
        <div className="self-action-buttons">
          <button
            type="button"
            className="btn-ghost"
            aria-pressed={state.sound}
            onClick={() => {
              if (!state.sound) {
                unlockSound();
                playChoice(true);
              } else {
                setAmbience(false);
              }
              setSound(!state.sound);
            }}
          >
            钟声{state.sound ? "开" : "关"}
          </button>
          <LifeCopy />
          <RestartButton label="弃此生重开" />
        </div>
      </div>
    </section>
  );
}
