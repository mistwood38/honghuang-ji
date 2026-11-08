import { useState } from "react";
import { useSave } from "@/lib/honghuang/store";
import { ARTS, SECTS } from "@/lib/honghuang/roam/catalog";
import { TECHNIQUES } from "@/lib/honghuang/roam/techniques";
import {
  INSIGHT_NAMES,
  INSIGHT_STEPS,
  insightCost,
  insightLevel,
  insightRequirement,
  techniqueFor,
} from "@/lib/honghuang/roam/insight";
import type { RoamAct, RoamReport } from "@/lib/honghuang/roam/state";

import { ActionButton } from "./action-button";
import { ActionOutcome } from "./action-outcome";
import "./cultivation-growth.css";

const COVERS: Record<string, string> = {
  qingjing: "kunlun",
  bone: "buzhou",
  form: "youming",
  hearth: "tribes",
  yuxu: "palace",
  zhuxian: "bloodsea",
  wuxue: "war",
  sunheart: "east",
  mudra: "nuwa",
};

export function CultivationLibrary({
  onAct,
  onStudy,
}: {
  onAct: (act: RoamAct) => void;
  onStudy: () => void;
}) {
  const save = useSave(),
    world = save.world;
  const [receipt, setReceipt] = useState<{ id: string; report: RoamReport } | null>(null);
  function comprehend(id: string, level: 1 | 2) {
    const before = useSave.getState().world?.report;
    onAct({ type: "comprehend-art", artId: id, level });
    const after = useSave.getState().world;
    if (after?.report && after.report !== before) setReceipt({ id, report: after.report });
  }
  if (!world) return null;
  const learned = [...new Set(world.arts)].filter((id) => Object.hasOwn(ARTS, id));
  const sect = SECTS.find((sect) => sect.id === world.sect);
  return (
    <section className="cultivation-library" aria-label="功法藏卷">
      <div className="cultivation-hero">
        <picture>
          <source media="(max-width: 640px)" srcSet="/art/cultivation-sanctuary-small.webp" />
          <img
            src="/art/cultivation-sanctuary.webp"
            width="1200"
            height="800"
            loading="lazy"
            alt="苍青群山前，修士于古松石台静坐，玉光照见身旁古卷"
          />
        </picture>
        <div>
          <p className="eyebrow">识海藏卷 · 已悟 {learned.length} 部</p>
          <h2>一念择道</h2>
          <p>一途为本，两法相辅。</p>
        </div>
      </div>
      <p className="library-guidance">
        主修影响闭关、打坐与战斗攻势；另可准备两门已悟招式，临阵自由选择。辅修不叠加被动数值，消耗仍按各招式结算。只能在战外调整，挂机也会使用准备好的招式。
      </p>
      <div className="prepared-loadout" aria-label="行前备法">
        {([0, 1] as const).map((slot) => (
          <label key={slot}>
            <span>辅修{slot === 0 ? "一" : "二"}</span>
            <select
              aria-label={`辅修${slot + 1}`}
              value={world.prepared[slot] ?? ""}
              onChange={(event) =>
                onAct({ type: "prepare-art", slot, artId: event.target.value || null })
              }
            >
              <option value="">留一处空位</option>
              {learned
                .filter((id) => id !== world.equipped && world.prepared[1 - slot] !== id)
                .map((id) => (
                  <option key={id} value={id}>
                    {ARTS[id]!.name} · {TECHNIQUES[id]?.name}
                  </option>
                ))}
            </select>
          </label>
        ))}
        {world.report?.title === "行前备法" ? (
          <p role="status">{world.report.paragraphs[0]}</p>
        ) : null}
      </div>
      <div className="art-scrolls">
        {learned.map((id) => {
          const art = ARTS[id]!;
          const technique = techniqueFor(world, id);
          const level = insightLevel(world, id),
            step = INSIGHT_STEPS[level];
          const requirement = step ? insightRequirement(save, id, step.level) : null;
          const selected = world.equipped === id;
          return (
            <article key={id} className={`art-scroll ${selected ? "is-equipped" : ""}`}>
              <div className="art-scroll-cover">
                <img
                  src={`/art/${COVERS[id]}-small.webp`}
                  alt=""
                  loading="lazy"
                  width="640"
                  height="360"
                />
                <span>{selected ? "主修" : "已悟"}</span>
                <h3>{art.name}</h3>
              </div>
              <div className="art-scroll-copy">
                <p>{art.line}</p>
                <p className="insight-status">领悟 · {INSIGHT_NAMES[level]}</p>
                <dl className="art-measures">
                  <div>
                    <dt>修炼助益</dt>
                    <dd>+{art.xiu}</dd>
                  </div>
                  <div>
                    <dt>战斗攻势</dt>
                    <dd>+{art.combat}</dd>
                  </div>
                </dl>
                {technique ? (
                  <div className="art-technique">
                    <p>
                      <strong>{technique.name}</strong>
                      <span>耗 {technique.cost} 灵气</span>
                    </p>
                    <p>{technique.detail}</p>
                  </div>
                ) : null}
                <ActionButton
                  label={selected ? "此法正在运转" : "定为主修"}
                  emblem="scroll"
                  aria-label={`主修${art.name}`}
                  aria-pressed={selected}
                  disabled={selected}
                  onClick={() => onAct({ type: "equip-art", artId: id })}
                />
                <div className="insight-study">
                  <h4>{step ? `参悟至${INSIGHT_NAMES[step.level]}` : "此卷已圆融"}</h4>
                  {step ? (
                    <>
                      <p>{step.benefit}</p>
                      <p>
                        需 {step.realm}境 · {insightCost(step)}
                      </p>
                      {requirement ? <p className="local-cost">{requirement}</p> : null}
                      <ActionButton
                        label={`参悟${art.name}·${INSIGHT_NAMES[step.level]}`}
                        surface="plaque"
                        emblem="scroll"
                        disabled={Boolean(requirement)}
                        onClick={() => comprehend(id, step.level)}
                      />
                    </>
                  ) : (
                    <p>此门功法的两层体悟已成，主修与辅修招式都沿用当前领悟。</p>
                  )}
                  {receipt?.id === id ? (
                    <ActionOutcome report={receipt.report} label="参悟结果" />
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {!learned.length ? (
        <p className="roam-empty">识海尚无成卷。可在游历中寻找传承，或前往山门请教。</p>
      ) : null}
      <div className="library-study">
        <p>
          {sect
            ? `${sect.name} · 当前贡献 ${world.contrib}。在山门积累 8 贡献后，可请教师传；已学传承不会重复扣费。`
            : "散修也可寻得传承。游历中的古卷与山门师承，都能成为你往后的道路。"}
        </p>
        <button type="button" onClick={onStudy}>
          查看师承与洞府
        </button>
      </div>
    </section>
  );
}
