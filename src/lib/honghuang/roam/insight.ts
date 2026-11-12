import type { SaveData } from "../types.ts";
import type { RoamState, GoodId } from "./state.ts";
import { TECHNIQUES, type Technique } from "./techniques.ts";
import { GOODS } from "./catalog.ts";

export const INSIGHT_NAMES = ["初悟", "会通", "圆融"] as const;
export const INSIGHT_STEPS = [
  {
    level: 1 as const,
    dao: 12,
    realm: "炼气",
    qi: 6,
    stones: 4,
    goods: { dew: 2 } as Partial<Record<GoodId, number>>,
    benefit: "本门招式每次少耗 1 灵气。",
  },
  {
    level: 2 as const,
    dao: 26,
    realm: "筑基",
    qi: 10,
    stones: 10,
    goods: { dew: 4, ore: 2 } as Partial<Record<GoodId, number>>,
    benefit: "保留省气；原有攻势倍率增加 15 个百分点，原有恢复与护势各增加 2。",
  },
];
export function normalizeInsights(raw: unknown, learned: string[]): Record<string, 1 | 2> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return Object.fromEntries(
    Object.entries(raw).filter(
      ([id, level]) =>
        learned.includes(id) && Object.hasOwn(TECHNIQUES, id) && (level === 1 || level === 2),
    ),
  );
}
export function insightLevel(world: RoamState, id: string): number {
  return world.insights?.[id] ?? 0;
}
export function techniqueFor(world: RoamState, id: string): Technique | undefined {
  if (!Object.hasOwn(TECHNIQUES, id)) return undefined;
  const base = TECHNIQUES[id]!,
    level = insightLevel(world, id);
  if (!level) return base;
  const result = {
    ...base,
    cost: Math.max(1, base.cost - 1),
    power: base.power > 0 && level >= 2 ? base.power + 0.15 : base.power,
    guard: base.guard > 0 && level >= 2 ? base.guard + 2 : base.guard,
    heal: base.heal > 0 && level >= 2 ? base.heal + 2 : base.heal,
  };
  result.detail =
    [
      result.power ? `以 ${Math.round(result.power * 100)}% 攻势出击` : "",
      result.heal ? `恢复 ${result.heal} 道躯` : "",
      result.guard ? `本回合护势 +${result.guard}` : "",
      result.bind ? "牵制敌人，使其本回合无法还击" : "",
    ]
      .filter(Boolean)
      .join("，") + "。";
  return result;
}
export function insightCost(step: (typeof INSIGHT_STEPS)[number]): string {
  return [
    `${step.stones} 灵石`,
    `${step.qi} 灵气`,
    ...Object.entries(step.goods).map(([id, n]) => `${n} ${GOODS[id as GoodId]}`),
    "一日",
  ].join(" · ");
}
export function insightRequirement(save: SaveData, id: string, level: number): string | null {
  const w = save.world,
    step = INSIGHT_STEPS.find((s) => s.level === level);
  if (!w || w.phase !== "free" || w.retreat) return "战外、出关后才能参悟。";
  if (!step || !w.arts.includes(id) || !Object.hasOwn(TECHNIQUES, id)) return "先学会此门功法。";
  if (insightLevel(w, id) + 1 !== level) return "此层已悟，或尚未到这一步。";
  if (save.stats.dao < step.dao) return `先修至${step.realm}境，再参此层。`;
  if (w.stones < step.stones) return `还需 ${step.stones - w.stones} 灵石。`;
  if (w.lingqi < step.qi) return `灵气不足 ${step.qi}，可先调息。`;
  for (const [good, count] of Object.entries(step.goods))
    if ((w.bag[good as GoodId] ?? 0) < count!)
      return `还需 ${count! - (w.bag[good as GoodId] ?? 0)} ${GOODS[good as GoodId]}。`;
  return null;
}
