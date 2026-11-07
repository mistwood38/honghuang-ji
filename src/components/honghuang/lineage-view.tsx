import { useRef, useState } from "react";
import { useSave } from "@/lib/honghuang/store";
import { LINEAGES, lineageOptions, lineageRequirement } from "@/lib/honghuang/roam/lineages";
import { routeTo } from "@/lib/honghuang/roam/local-world";
import { ROAM_PLACES } from "@/lib/honghuang/roam/catalog";
import { artForPlace } from "@/lib/honghuang/visuals";
import type { RoamAct, RoamReport } from "@/lib/honghuang/roam/state";
import { ActionButton } from "./action-button";
import { ActionOutcome } from "./action-outcome";
import { focusReadingTarget } from "./reading-focus";
import "./world-affairs.css";

export function LineageView({
  onAct,
  onExplore,
  onAffairs,
  onPractice,
}: {
  onAct: (act: RoamAct) => void;
  onExplore: () => void;
  onAffairs: () => void;
  onPractice: () => void;
}) {
  const [receipt, setReceipt] = useState<{
    stage: number;
    report: RoamReport;
    selected: string;
  } | null>(null);
  const chapterTarget = useRef<HTMLElement>(null);
  const save = useSave(),
    world = save.world,
    origin = save.origin;
  if (!world || !origin)
    return <p className="roam-empty">先在此生选定根骨，再展开属于你的长卷。</p>;
  const definition = LINEAGES[origin],
    progress = world.lineages[origin];
  const shownStage = receipt?.stage ?? progress?.stage ?? 0;
  const chapter = definition.chapters[shownStage];
  const place = chapter?.place ?? definition.chapters[5]!.place;
  const path = routeTo(world, place),
    requirement = lineageRequirement(save);
  const options = lineageOptions(save);
  function choose(action: RoamAct, selected: string) {
    const stage = useSave.getState().world?.lineages[origin!]?.stage;
    onAct(action);
    const after = useSave.getState().world;
    if (
      action.type === "lineage" &&
      action.what === "choose" &&
      stage !== undefined &&
      after?.lineages[origin!]?.stage === stage + 1 &&
      after.report
    )
      setReceipt({ stage, selected, report: after.report });
  }
  function continueReading() {
    setReceipt(null);
    requestAnimationFrame(() => focusReadingTarget(chapterTarget.current));
  }
  return (
    <section className="lineage-view" aria-label="族脉长卷">
      <div className="affairs-cover">
        <img src={artForPlace(place).small} alt="" width="640" height="360" loading="lazy" />
        <div>
          <p className="eyebrow">
            此生可书 · {progress?.ending ? "六章已成" : `第 ${shownStage + 1} / 6 章`}
          </p>
          <h2>{definition.name}</h2>
          <p>{definition.subtitle}</p>
        </div>
      </div>
      {progress?.ending && !receipt ? (
        <article className="lineage-ending" ref={chapterTarget} tabIndex={-1}>
          <p className="eyebrow">此卷落款</p>
          <h3>{progress.ending}</h3>
          <p>
            这一卷已经写完，此生仍在继续。你留下的因果、停战之约和所学，会跟随之后的修炼与游历。
          </p>
          <ActionButton label="继续自己的修行" emblem="lotus" onClick={onPractice} />
        </article>
      ) : (
        <article className="lineage-chapter" ref={chapterTarget} tabIndex={-1}>
          <p className="eyebrow">{ROAM_PLACES[place].name}</p>
          <h3>{chapter!.title}</h3>
          {chapter!.prose.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
          <p className="lineage-objective">此章要做：{chapter!.objective}</p>
          {requirement && !receipt ? <p className="lineage-requirement">{requirement}</p> : null}
          {receipt ? (
            <div className="lineage-receipt">
              <ActionOutcome
                report={receipt.report}
                selected={receipt.selected}
                label="族脉行动结果"
              />
              <ActionButton
                label={progress?.ending ? "查看此卷结局" : "续读下一章"}
                surface="plaque"
                emblem="scroll"
                onClick={continueReading}
              />
            </div>
          ) : (
            <div className="local-actions">
              {options.map((option) => (
                <ActionButton
                  key={option.act.choiceId ?? option.act.what}
                  label={option.label}
                  hint={option.hint}
                  surface="plaque"
                  disabled={option.disabled}
                  onClick={() => choose(option.act, option.label)}
                />
              ))}
            </div>
          )}
          {progress && !receipt ? (
            <div className="lineage-navigation">
              {path[0] ? (
                <ActionButton
                  label={`循路往${ROAM_PLACES[place].name}`}
                  hint={`下一程：${ROAM_PLACES[path[0]].name}`}
                  emblem="cloud"
                  onClick={() => onAct({ type: "travel", place: path[0]! })}
                />
              ) : null}
              {chapter!.gate === "repair" || chapter!.choices.some((choice) => choice.cost) ? (
                <ActionButton label="查看此地与行囊所需" emblem="mountain" onClick={onExplore} />
              ) : null}
              {chapter!.gate === "standing" ? (
                <ActionButton label="查看世局与护路" emblem="scroll" onClick={onAffairs} />
              ) : null}
              <ActionButton label="暂搁此卷，先去修炼" emblem="lotus" onClick={onPractice} />
            </div>
          ) : null}
        </article>
      )}
      {progress?.history.length ? (
        <details className="lineage-archive">
          <summary>重读已写下的 {progress.history.length} 章</summary>
          {progress.history.map((entry) => (
            <article key={entry.chapter}>
              <p className="eyebrow">第 {entry.day} 日</p>
              <h4>{entry.title}</h4>
              {entry.text.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </article>
          ))}
        </details>
      ) : null}
    </section>
  );
}
