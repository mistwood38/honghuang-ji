import type { BattlePlan } from "./state.ts";

export const BATTLE_PLANS: Record<BattlePlan, { name: string; detail: string }> = {
  balanced: { name: "攻守相济", detail: "受伤时优先恢复；其余时候交替使用主修招式与普通攻击。" },
  assault: {
    name: "以攻破局",
    detail: "优先使用有伤害的主修招式，其次施法；灵气不足时转为普通攻击。",
  },
  reserve: { name: "留气守身", detail: "平时使用普通攻击；道躯低于一半时，才动用恢复或护身招式。" },
};
