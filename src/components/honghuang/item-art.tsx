import { useState, type CSSProperties } from "react";
import { ITEMS } from "@/lib/honghuang/world";
import { Modal } from "./modal";

const ITEM_CELLS: Record<string, number> = {
  "chaos-qi": 0,
  "pangu-bone": 1,
  "purple-qi": 2,
  zhuxian: 3,
  "wu-blood": 4,
  bell: 5,
  xirang: 6,
  "buzhou-stone": 7,
  incense: 8,
};

/** Motion is per object. None of these spin the painting. */
const RELIC: Record<string, { fx: string; tone: string }> = {
  "chaos-qi": { fx: "chaos", tone: "两团未分的气在壳里对绕，不往一个方向转。" },
  "pangu-bone": { fx: "bone", tone: "骨很沉，裂光只顺着纹理慢慢亮。" },
  "purple-qi": { fx: "purple", tone: "一缕紫气贴着器物往上走。" },
  zhuxian: { fx: "sword", tone: "没有剑身，只有一道掠过去的锋。" },
  "wu-blood": { fx: "blood", tone: "血沿边沿往下滴，不打旋。" },
  bell: { fx: "bell", tone: "钟不转。响是一圈一圈漾开的。" },
  xirang: { fx: "earth", tone: "土从底下自己长起来。" },
  "buzhou-stone": { fx: "pillar", tone: "一根直的光，到顶会折一下。" },
  incense: { fx: "incense", tone: "烟往上走，火只在底下一跳一跳。" },
};

/** The illustrated icon is decorative; its adjacent original item name remains canonical. */
export function ItemArt({ id, large = false }: { id: string; large?: boolean }) {
  const cell = ITEM_CELLS[id];
  const fx = RELIC[id]?.fx;
  return (
    <span
      className={`item-art${large ? " item-art-large" : ""}${fx ? ` relic-${fx}` : " item-art-unknown"}`}
      aria-hidden="true"
      style={
        cell === undefined
          ? undefined
          : ({
              "--item-x": `${(cell % 3) * 50}%`,
              "--item-y": `${Math.floor(cell / 3) * 50}%`,
            } as CSSProperties)
      }
    >
      {fx ? <i className="relic-fx" /> : null}
    </span>
  );
}

export function RelicList({ ids }: { ids: string[] }) {
  return (
    <ul className="relic-list">
      {ids.map((id) => (
        <li key={id}>
          <RelicCard id={id} />
        </li>
      ))}
    </ul>
  );
}

function RelicCard({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const item = ITEMS[id];
  const fx = RELIC[id];
  const name = item?.name ?? id;
  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      title={name}
      titleId={`relic-${id}`}
      description={item?.lore ?? "此物没有留下记载。"}
      media={
        <div className={`relic-stage relic-${fx?.fx ?? "unknown"}`}>
          <ItemArt id={id} large />
          {fx ? <p>{fx.tone}</p> : null}
        </div>
      }
      trigger={
        <button type="button" className="relic-card">
          <ItemArt id={id} />
          <span>
            <strong>{name}</strong>
            <em>{fx?.tone ?? "点开再看"}</em>
          </span>
        </button>
      }
    >
      {null}
    </Modal>
  );
}
