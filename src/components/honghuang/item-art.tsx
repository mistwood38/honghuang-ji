import type { CSSProperties } from "react";
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
/** The illustrated icon is decorative; its adjacent original item name remains canonical. */
export function ItemArt({ id }: { id: string }) {
  const cell = ITEM_CELLS[id];
  return (
    <span
      className={`item-art${cell === undefined ? " item-art-unknown" : ""}`}
      aria-hidden="true"
      style={
        cell === undefined
          ? undefined
          : ({
              "--item-x": `${(cell % 3) * 50}%`,
              "--item-y": `${Math.floor(cell / 3) * 50}%`,
            } as CSSProperties)
      }
    />
  );
}
