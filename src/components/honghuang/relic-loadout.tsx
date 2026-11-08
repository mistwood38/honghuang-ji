import { useState } from "react";
import { useSave } from "@/lib/honghuang/store";
import { ITEMS } from "@/lib/honghuang/world";
import { activeRelic, RELIC_USES } from "@/lib/honghuang/roam/relics";
import type { RoamAct, RoamReport } from "@/lib/honghuang/roam/state";
import { RelicList } from "./item-art";
import { ActionButton } from "./action-button";
import { ActionOutcome } from "./action-outcome";
import "./cultivation-growth.css";

export function RelicLoadout({ onAct }: { onAct: (act: RoamAct) => void }) {
  const save = useSave();
  const [receipt, setReceipt] = useState<{ id: string | null; report: RoamReport } | null>(null);
  if (!save.world) return null;
  const current = activeRelic(save);
  const items = [...new Set(save.items)].filter((id) => Object.hasOwn(RELIC_USES, id));
  function equip(id: string | null) {
    const before = activeRelic(useSave.getState());
    onAct({ type: "equip-relic", id });
    const after = useSave.getState();
    if (before !== activeRelic(after) && after.world?.report)
      setReceipt({ id, report: after.world.report });
  }
  return (
    <section className="relic-loadout" aria-label="御器">
      <p className="eyebrow">一器随身 · 万象相应</p>
      <h2>让器物回应此生</h2>
      <p className="growth-guidance">
        同一时刻只御使一件。收起或换用不会消耗收藏，也不改变旧篇因缘；换器前先按原器物结算已过去的挂机。
      </p>
      {current ? (
        <div className="relic-current">
          <p>
            正在御使 · <strong>{ITEMS[current]!.name}</strong>
          </p>
          <ActionButton label="收起御器" emblem="censer" onClick={() => equip(null)} />
        </div>
      ) : (
        <p className="growth-guidance">当前未御使器物。先从已有收藏中择取一件。</p>
      )}
      {receipt?.id === null ? <ActionOutcome report={receipt.report} label="御器结果" /> : null}
      <div className="relic-loadout-grid">
        {items.map((id) => (
          <article className={`relic-use${id === current ? " is-attuned" : ""}`} key={id}>
            <RelicList ids={[id]} />
            <h3>{RELIC_USES[id]!.use}</h3>
            <p>{RELIC_USES[id]!.detail}</p>
            <ActionButton
              label={id === current ? `正在御使${ITEMS[id]!.name}` : `御使${ITEMS[id]!.name}`}
              surface="plaque"
              disabled={id === current}
              aria-pressed={id === current}
              onClick={() => equip(id)}
            />
            {receipt?.id === id ? <ActionOutcome report={receipt.report} label="御器结果" /> : null}
          </article>
        ))}
      </div>
      {!items.length ? (
        <p className="roam-empty">
          尚无可御使的器物。游历奇遇与旧篇因缘都可能留下器物；获得后会列在这里。
        </p>
      ) : null}
    </section>
  );
}
