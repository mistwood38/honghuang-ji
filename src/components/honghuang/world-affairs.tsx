import { useState } from "react";
import { useSave } from "@/lib/honghuang/store";
import { ROAM_PLACES } from "@/lib/honghuang/roam/catalog";
import {
  FACTIONS,
  CONFLICTS,
  affairsOptions,
  factionName,
  relationKey,
} from "@/lib/honghuang/roam/politics";
import { routeTo } from "@/lib/honghuang/roam/local-world";
import { artForPlace } from "@/lib/honghuang/visuals";
import type { RoamAct, RoamReport, FactionId } from "@/lib/honghuang/roam/state";
import { ActionButton } from "./action-button";
import { ActionOutcome } from "./action-outcome";
import "./world-affairs.css";

export function WorldAffairs({ onAct }: { onAct: (act: RoamAct) => void }) {
  const [receipt, setReceipt] = useState<{
    faction: FactionId;
    what: string;
    report: RoamReport;
  } | null>(null);
  const save = useSave(),
    world = save.world;
  if (!world) return null;
  const politics = world.politics,
    options = affairsOptions(save);
  function act(action: Extract<RoamAct, { type: "affairs" }>) {
    const before = useSave.getState().world;
    onAct(action);
    const after = useSave.getState().world;
    if (
      after?.phase === "free" &&
      after.report &&
      (after.day !== before?.day || JSON.stringify(after.report) !== JSON.stringify(before?.report))
    )
      setReceipt({ faction: action.faction, what: action.what, report: after.report });
  }
  return (
    <section className="world-affairs" aria-label="神魔世局">
      <div className="affairs-cover">
        <img src="/art/war-small.webp" alt="" width="640" height="360" loading="lazy" />
        <div>
          <p className="eyebrow">神魔之间 · 山河之上</p>
          <h2>众势有来去</h2>
          <p>下一次世局推演 · 第 {politics.nextDay} 日</p>
        </div>
      </div>
      <p className="affairs-intro">
        每八个游戏日，各方护地、整备或相争。你的支援与停战书会留下影响；不必加入门墙，散修也能改变一段路的命运。
      </p>
      <div className="affairs-conflicts">
        {CONFLICTS.map((conflict) => {
          const key = relationKey(conflict.a, conflict.b),
            until = politics.truces[key] ?? 0;
          const peace = until >= world.day;
          const control = politics.control[conflict.place];
          return (
            <article key={key}>
              <p className="eyebrow">
                {factionName(conflict.a)} · {factionName(conflict.b)}
              </p>
              <h3>{conflict.name}</h3>
              <p>
                {peace
                  ? `停战约仍在 · 至第 ${until} 日`
                  : (politics.relations[key] ?? 0) <= -3
                    ? "关系紧绷，补给充足时可能再起争执。"
                    : "尚有回旋余地，旧怨未曾消失。"}
              </p>
              {control ? (
                <small>
                  {ROAM_PLACES[conflict.place].name}护路主导 · {factionName(control)}
                </small>
              ) : null}
            </article>
          );
        })}
      </div>
      <div className="affairs-factions">
        {FACTIONS.map((faction) => {
          const state = politics.factions[faction.id],
            path = routeTo(world, faction.home),
            here = faction.home === world.place;
          return (
            <details key={faction.id} className="affairs-faction" open={here || undefined}>
              <summary>
                <img
                  src={artForPlace(faction.home).small}
                  alt=""
                  width="80"
                  height="80"
                  loading="lazy"
                />
                <span>
                  <strong>{faction.name}</strong>
                  <small>
                    {ROAM_PLACES[faction.home].name} · {here ? "你正在此地" : faction.goal}
                  </small>
                </span>
              </summary>
              <div className="affairs-faction-body">
                <p>{faction.omen}</p>
                <dl>
                  <div>
                    <dt>声威</dt>
                    <dd>{state.power}</dd>
                  </div>
                  <div>
                    <dt>补给</dt>
                    <dd>{state.supply} / 12</dd>
                  </div>
                  <div>
                    <dt>与你的声望</dt>
                    <dd>{world.reputation[faction.id] ?? 0}</dd>
                  </div>
                </dl>
                <div className="local-actions">
                  {options
                    .filter((option) => option.act.faction === faction.id)
                    .map((option) => (
                      <div key={option.act.what}>
                        <ActionButton
                          label={option.label}
                          hint={option.hint}
                          emblem={
                            option.act.what === "patrol"
                              ? "sword"
                              : option.act.what === "aid"
                                ? "censer"
                                : "scroll"
                          }
                          disabled={option.disabled}
                          onClick={() => act(option.act)}
                        />
                        {option.disabled ? <p className="local-cost">{option.reason}</p> : null}
                        {receipt?.faction === faction.id && receipt.what === option.act.what ? (
                          <ActionOutcome report={receipt.report} label="世局行动结果" />
                        ) : null}
                      </div>
                    ))}
                  {path[0] ? (
                    <ActionButton
                      label={`前往${faction.name}驻地`}
                      hint={`下一程：${ROAM_PLACES[path[0]].name} · 正常行路`}
                      emblem="cloud"
                      onClick={() => onAct({ type: "travel", place: path[0]! })}
                    />
                  ) : null}
                </div>
              </div>
            </details>
          );
        })}
      </div>
      <details className="local-news">
        <summary>世局纪事 · 第 {politics.cycle} 轮</summary>
        {politics.history.length ? (
          <ol>
            {[...politics.history].reverse().map((entry, i) => (
              <li key={i}>
                <span>第 {entry.day} 日</span>
                <p>{entry.text}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="roam-empty">各方尚在整备，第一轮消息还未传来。</p>
        )}
      </details>
    </section>
  );
}
