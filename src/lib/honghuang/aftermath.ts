import type { Origin, SaveData, StatKey } from "./types.ts";
import { STAT_ORDER } from "./world.ts";

export type StatChange = { key: StatKey; value: number };

/** What a choice actually did. Shown only after the choice, never on the button. */
export type Aftermath = {
  text: string;
  deltas: StatChange[];
  gained: string[];
  lost: string[];
  origin: Origin | null;
};

export function buildAftermath(before: SaveData, after: SaveData, choiceText: string): Aftermath {
  return {
    text: choiceText,
    deltas: STAT_ORDER.map((key) => ({ key, value: after.stats[key] - before.stats[key] })).filter(
      (row) => row.value !== 0,
    ),
    gained: after.items.filter((id) => !before.items.includes(id)),
    lost: before.items.filter((id) => !after.items.includes(id)),
    origin: before.origin !== after.origin ? after.origin : null,
  };
}
