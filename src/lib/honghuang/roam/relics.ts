import type { SaveData } from "../types.ts";

/** Optional open-world uses; possession and the original chronicle effects stay unchanged. */
export const RELIC_USES: Record<string, { use: string; detail: string }> = {
  "chaos-qi": { use: "含混守一", detail: "主动闭关一日时，灵气消耗由 2 降为 1。" },
  "pangu-bone": { use: "古骨护身", detail: "敌人每次还击的伤害减少 2，最低仍受 1 点伤害。" },
  "purple-qi": {
    use: "紫气叩关",
    detail: "突破大境界时，成功机会增加 5 个百分点，仍受原有上限限制。",
  },
  zhuxian: { use: "剑意随身", detail: "斗法基础攻势增加 2，普通攻击与招式均按实际攻势结算。" },
  "wu-blood": {
    use: "血脉承重",
    detail: "承受还击前，道躯低于 50 时伤害减少 3，最低仍受 1 点伤害。",
  },
  bell: { use: "一响定形", detail: "每场斗法第一回合的还击伤害减少 4，最低仍受 1 点伤害。" },
  xirang: { use: "温养药圃", detail: "采收成熟药圃时，额外收获 2 份灵草。" },
  "buzhou-stone": { use: "倚石调息", detail: "主动调息时额外恢复 3 点道躯，仍不超过 100。" },
  incense: { use: "余火护归", detail: "斗法获胜后恢复 4 点道躯，仍不超过 100；失败或脱身不生效。" },
};
export function normalizeRelic(raw: unknown): string | null {
  return typeof raw === "string" && Object.hasOwn(RELIC_USES, raw) ? raw : null;
}
export function activeRelic(save: SaveData): string | null {
  const id = normalizeRelic(save.world?.relic);
  return id && save.items.includes(id) ? id : null;
}
export function relicGuard(save: SaveData, round: number): number {
  const id = activeRelic(save);
  return id === "pangu-bone"
    ? 2
    : id === "wu-blood" && save.stats.life < 50
      ? 3
      : id === "bell" && round === 1
        ? 4
        : 0;
}
