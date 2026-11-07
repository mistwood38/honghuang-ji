/** Known costs and effects, shared by the rule engine and the technique cards. */
import type { RoamState } from "./state.ts";

export function normalizePrepared(
  raw: unknown,
  learned: string[],
  main: string | null,
): [string | null, string | null] {
  const seen = new Set([main]);
  const values = Array.isArray(raw) ? raw : [];
  return [0, 1].map((slot) => {
    const id: unknown = values[slot];
    if (
      typeof id !== "string" ||
      !learned.includes(id) ||
      !Object.hasOwn(TECHNIQUES, id) ||
      seen.has(id)
    )
      return null;
    seen.add(id);
    return id;
  }) as [string | null, string | null];
}
export function preparedTechniques(world: RoamState): string[] {
  return [...new Set([world.equipped, ...(world.prepared ?? [])])].filter((id): id is string =>
    Boolean(id && world.arts.includes(id) && Object.hasOwn(TECHNIQUES, id)),
  );
}

export type Technique = {
  name: string;
  cost: number;
  power: number;
  guard: number;
  heal: number;
  bind?: boolean;
  detail: string;
};

export const TECHNIQUES: Record<string, Technique> = {
  qingjing: {
    name: "息归一元",
    cost: 4,
    power: 0,
    guard: 2,
    heal: 6,
    detail: "恢复 6 道躯，本回合护势 +2。适合受伤时稳住气息。",
  },
  bone: {
    name: "镇岳",
    cost: 4,
    power: 0.85,
    guard: 5,
    heal: 0,
    detail: "以 85% 攻势出击，本回合护势 +5。以守带攻。",
  },
  form: {
    name: "借影缚形",
    cost: 6,
    power: 0.4,
    guard: 0,
    heal: 0,
    bind: true,
    detail: "以 40% 攻势出击，牵制敌人，使其本回合无法还击。",
  },
  hearth: {
    name: "不熄薪火",
    cost: 5,
    power: 0,
    guard: 2,
    heal: 10,
    detail: "恢复 10 道躯，本回合护势 +2。留住再战的一口气。",
  },
  yuxu: {
    name: "玉虚静界",
    cost: 5,
    power: 0.4,
    guard: 9,
    heal: 0,
    detail: "以 40% 攻势出击，本回合护势 +9。卸去迎面而来的力量。",
  },
  zhuxian: {
    name: "一线截天",
    cost: 6,
    power: 2,
    guard: 0,
    heal: 0,
    detail: "以 200% 攻势出击。全力攻杀，仍须承受敌人还击。",
  },
  wuxue: {
    name: "血骨承山",
    cost: 5,
    power: 1.2,
    guard: 4,
    heal: 0,
    detail: "以 120% 攻势出击，本回合护势 +4。血与骨一同承重。",
  },
  sunheart: {
    name: "扶桑回照",
    cost: 5,
    power: 1,
    guard: 0,
    heal: 4,
    detail: "恢复 4 道躯，以 100% 攻势出击。借心中余光反照自身。",
  },
  mudra: {
    name: "五色补缺",
    cost: 6,
    power: 0,
    guard: 6,
    heal: 6,
    detail: "恢复 6 道躯，本回合护势 +6。补合伤处，守住下一息。",
  },
};
