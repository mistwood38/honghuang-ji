import { useState } from "react";
import { useSave } from "@/lib/honghuang/store";
import { ROAM_PLACES } from "@/lib/honghuang/roam/catalog";
import {
  HERITAGES,
  PEOPLE,
  localOptions,
  regionCondition,
  sitesAt,
  siteState,
  type LocalOption,
} from "@/lib/honghuang/roam/local-world";
import type { RoamAct, RoamReport } from "@/lib/honghuang/roam/state";
import { ActionButton } from "./action-button";
import { ActionOutcome } from "./action-outcome";
import { WayfarerCard } from "./wayfarer-card";
import "./local-world.css";

export function LocalWorld({ onAct }: { onAct: (action: RoamAct) => void }) {
  const save = useSave();
  const [receipt, setReceipt] = useState<{
    owner: string;
    report: RoamReport;
    place: string;
    day: number;
  } | null>(null);
  const world = save.world;
  if (!world) return null;
  const activeReceipt =
    receipt?.place === world.place && receipt.day === world.day ? receipt : null;
  const options = localOptions(save);
  const localNews = world.living.news
    .filter((entry) => world.known.includes(entry.place))
    .slice(-6)
    .reverse();
  const actors = PEOPLE.filter(
    (p) =>
      world.living.people[p.id]?.met ||
      world.living.people[p.id]?.place === world.place ||
      world.living.errands[p.id],
  );
  function perform(action: RoamAct) {
    const before = useSave.getState().world?.report;
    onAct(action);
    const after = useSave.getState().world;
    const owner =
      action.type === "local" ? action.site : action.type === "person" ? action.id : null;
    if (owner && after?.report && before !== after.report)
      setReceipt({ owner, report: after.report, place: after.place, day: after.day });
  }
  function buttons(items: LocalOption[]) {
    return (
      <div className="local-actions">
        {items.map((option) => (
          <div key={JSON.stringify(option.act)}>
            <ActionButton
              label={option.label}
              hint={option.hint}
              emblem={
                option.act.type === "person"
                  ? "scroll"
                  : option.act.what === "gather"
                    ? "censer"
                    : option.act.what === "rest"
                      ? "lotus"
                      : "mountain"
              }
              disabled={option.disabled}
              onClick={() => perform(option.act)}
            />
            {option.disabled && option.reason ? (
              <p className="local-cost">{option.reason}</p>
            ) : null}
          </div>
        ))}
      </div>
    );
  }
  return (
    <section className="local-world" aria-label="此地山河与来往之人">
      <header className="local-heading">
        <p className="eyebrow">境内 · 第 {world.day} 日</p>
        <h2>{ROAM_PLACES[world.place].name}，不止一条路</h2>
        <p>
          {regionCondition(world)}
          {save.origin ? ` · ${HERITAGES[save.origin].name}` : ""}
        </p>
        <p>走近一处，才知道能做什么。亲手修补、取用或送物，都会留下重访时看得见的痕迹。</p>
      </header>
      {world.report && !activeReceipt ? (
        <div className="local-result" role="status" aria-label="此地行动结果">
          <strong>{world.report.title}</strong>
          {world.report.paragraphs.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
          {world.report.changes.length ? (
            <ul>
              {world.report.changes.map((line, index) => (
                <li key={index}>{line}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      <div className="local-sites">
        {sitesAt(world.place).map((site, index) => {
          const state = siteState(world, site.id);
          const stateText = !state.visited
            ? "尚未走近"
            : state.state === "mending"
              ? "修补待稳"
              : state.state === "restored"
                ? "生息已接续"
                : state.state === "stripped"
                  ? "残材已取走"
                  : state.cooldown > world.day
                    ? "休养中"
                    : "已察看";
          return (
            <article key={site.id} className="local-site">
              <div className="local-site-title">
                <span
                  className={`action-emblem emblem-${site.kind === "source" ? "censer" : site.kind === "ruin" ? "mountain" : "lotus"}`}
                  aria-hidden="true"
                />
                <div>
                  <p className="eyebrow">
                    零{["一", "二", "三"][index]} ·{" "}
                    {site.kind === "source" ? "物产" : site.kind === "ruin" ? "遗迹" : "歇脚"}
                  </p>
                  <h3>{site.name}</h3>
                </div>
                <span className="local-state">{stateText}</span>
              </div>
              <p>{site.line}</p>
              {state.method ? (
                <p className="local-memory">
                  你曾在此{state.method}。
                  {state.state === "mending"
                    ? "让山水自己过上几日，再来看。"
                    : "这番照应仍留在地脉里。"}
                </p>
              ) : null}
              {state.state === "stripped" && state.cooldown > world.day ? (
                <p className="local-memory">第 {state.cooldown} 日后可再尝试修补。</p>
              ) : null}
              {activeReceipt?.owner === site.id ? (
                <ActionOutcome report={activeReceipt.report} label="此地行动结果" />
              ) : null}
              {buttons(
                options.filter(
                  (option) => option.act.type === "local" && option.act.site === site.id,
                ),
              )}
            </article>
          );
        })}
      </div>
      <section className="local-people" aria-label="来往之人与托付">
        <p className="eyebrow">来往之人 · 行踪与托付</p>
        <h3>相逢有后日</h3>
        <p>他们每六个游戏日启程，也会改道照看疲敝的地方。交谈不耗时；托付不设失约倒计时。</p>
        {!actors.length ? (
          <p className="roam-empty">此刻没有相识的人停在这里。继续走，或等山风换向。</p>
        ) : null}
        {actors.map((person) => (
          <WayfarerCard
            key={person.id}
            person={person}
            actions={buttons(
              options.filter(
                (option) => option.act.type === "person" && option.act.id === person.id,
              ),
            )}
            report={activeReceipt?.owner === person.id ? activeReceipt.report : undefined}
            onAct={onAct}
          />
        ))}
      </section>
      {localNews.length ? (
        <details className="local-news">
          <summary>山河近闻 · {localNews.length}</summary>
          <ol>
            {localNews.map((entry, index) => (
              <li key={`${entry.day}-${index}`}>
                <span>
                  第 {entry.day} 日 · {ROAM_PLACES[entry.place].name}
                </span>
                <p>{entry.text}</p>
              </li>
            ))}
          </ol>
        </details>
      ) : null}
    </section>
  );
}
