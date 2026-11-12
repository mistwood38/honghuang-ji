import type { Origin, SaveData } from "../types.ts";
import { GOODS, ROAM_PLACES } from "./catalog.ts";
import { LINEAGES } from "./lineage-data.ts";
import { adjustFaction, establishTruce, trialBattle } from "./politics.ts";
import type { Effect, LineageProgress, WorldAct } from "./state.ts";
export { LINEAGES } from "./lineage-data.ts";
const ORIGINS: Origin[] = ["dao", "wu", "yao", "ren"];
const object = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
export function normalizeLineages(raw: unknown): Partial<Record<Origin, LineageProgress>> {
  const source = object(raw),
    result: Partial<Record<Origin, LineageProgress>> = {};
  for (const origin of ORIGINS) {
    if (!Object.hasOwn(source, origin)) continue;
    const value = object(source[origin]),
      definition = LINEAGES[origin];
    const history: LineageProgress["history"] = [];
    for (const row of (Array.isArray(value.history) ? value.history : []).slice(0, 6)) {
      const entry = object(row),
        chapter = definition.chapters[history.length]!;
      const choice = chapter.choices.find((choice) => choice.id === entry.choice);
      if (!choice || entry.chapter !== history.length) break;
      history.push({
        chapter: history.length,
        choice: choice.id,
        day:
          typeof entry.day === "number" && Number.isFinite(entry.day)
            ? Math.max(1, Math.min(1_000_000, Math.floor(entry.day)))
            : 1,
        title: chapter.title,
        text: [...choice.result],
      });
    }
    const last = history.at(-1);
    const ending =
      history.length === 6
        ? (definition.chapters[5]!.choices.find((choice) => choice.id === last!.choice)?.ending
            ?.name ?? null)
        : null;
    result[origin] = {
      stage: history.length,
      history,
      ending,
      nextDay:
        typeof value.nextDay === "number" && Number.isFinite(value.nextDay)
          ? Math.max(1, Math.min(1_000_000, Math.floor(value.nextDay)))
          : 1,
    };
  }
  return result;
}
export const trialProof = (origin: Origin) => `lineage-trial-${origin}`;
export function lineageRequirement(save: SaveData): string | null {
  const world = save.world,
    origin = save.origin;
  if (!world || !origin) return "先在此生选定根骨。";
  const progress = world.lineages[origin];
  if (!progress) return null;
  if (progress.ending) return "此卷已成。你仍可修炼、游历与参与世局。";
  const definition = LINEAGES[origin],
    chapter = definition.chapters[progress.stage]!;
  if (world.day < progress.nextDay) return `前事尚待回响，第 ${progress.nextDay} 日后再续此章。`;
  if (world.place !== chapter.place) return `此章在${ROAM_PLACES[chapter.place].name}继续。`;
  if (
    chapter.gate === "repair" &&
    world.living.sites[`${chapter.place}-ruin`]?.state !== "restored"
  )
    return "先在游历页修好当地遗迹，并等它经住数日风雨。";
  if (
    chapter.gate === "standing" &&
    (world.reputation[definition.faction] ?? 0) < 3 &&
    (world.relations[definition.witness] ?? 0) < 4
  )
    return "先通过世局中的支援或巡护建立信任，或完成同行者的一次托付。";
  if (chapter.gate === "trial" && save.stats.dao < 12) return "先修炼至炼气境，再来直面这一场。";
  return null;
}
export type LineageOption = {
  act: Extract<WorldAct, { type: "lineage" }>;
  label: string;
  hint?: string;
  disabled: boolean;
};
export function lineageOptions(save: SaveData): LineageOption[] {
  const world = save.world,
    origin = save.origin;
  if (!world || !origin || world.phase !== "free" || world.retreat) return [];
  const progress = world.lineages[origin];
  if (!progress)
    return [
      {
        act: { type: "lineage", what: "begin" },
        label: "展开这一族的长卷",
        hint: "此后可随时停笔，继续自己的修行",
        disabled: false,
      },
    ];
  if (lineageRequirement(save)) return [];
  const chapter = LINEAGES[origin].chapters[progress.stage]!;
  if (chapter.gate === "trial" && !world.karma.includes(trialProof(origin)))
    return [
      {
        act: { type: "lineage", what: "trial", chapter: progress.stage },
        label: "直面这一场",
        hint: save.stats.life < 20 ? "道躯不足 20，先到修行页调息" : "进入斗法 · 可以脱身，养好伤再来",
        disabled: save.stats.life < 20,
      },
    ];
  return chapter.choices.map((choice) => ({
    act: { type: "lineage", what: "choose", chapter: progress.stage, choiceId: choice.id },
    label: choice.text,
    hint: choice.cost ? `需 ${choice.cost.count} ${GOODS[choice.cost.good]}` : undefined,
    disabled: Boolean(choice.cost && (world.bag[choice.cost.good] ?? 0) < choice.cost.count),
  }));
}
export function performLineage(
  save: SaveData,
  action: Extract<WorldAct, { type: "lineage" }>,
  apply: (effects: Effect[]) => string[],
): number {
  const world = save.world!,
    origin = save.origin!,
    definition = LINEAGES[origin];
  if (action.what === "begin") {
    world.lineages[origin] = { stage: 0, nextDay: world.day, history: [], ending: null };
    world.report = {
      title: definition.name,
      paragraphs: [
        definition.subtitle,
        "这一卷由你的脚步来写，不替你关上别的路。去往卷中所记之地，随时可以回来续笔。",
      ],
      changes: [],
    };
    return 0;
  }
  const progress = world.lineages[origin]!,
    chapter = definition.chapters[progress.stage]!;
  if (action.what === "trial") {
    const names = { dao: "吞声之影", wu: "折骨凶灵", yao: "窃名潮影", ren: "索火凶灵" };
    world.phase = "battle";
    world.eventId = null;
    world.battle = trialBattle(
      save,
      `lineage-${origin}`,
      names[origin],
      [
        { t: "karma", id: trialProof(origin) },
        { t: "xiu", n: 6 },
      ],
      ["那一道阻拦散了。你可以回到「族脉」，亲自决定如何处理留下来的事。"],
    );
    world.report = { title: chapter.title, paragraphs: [...chapter.prose], changes: [] };
    return 1;
  }
  const choice = chapter.choices.find((choice) => choice.id === action.choiceId)!;
  const effects: Effect[] = [...(choice.effects ?? [])];
  if (choice.cost) effects.unshift({ t: "good", id: choice.cost.good, n: -choice.cost.count });
  const changes = apply(effects);
  progress.history.push({
    chapter: progress.stage,
    choice: choice.id,
    day: world.day + 1,
    title: chapter.title,
    text: [...choice.result],
  });
  progress.stage += 1;
  progress.nextDay = world.day + 3;
  const paragraphs = [...choice.result];
  if (choice.ending) {
    progress.ending = choice.ending.name;
    changes.push(
      ...apply([
        { t: "art", id: definition.art },
        { t: "stone", n: 12 },
        { t: "karma", id: `lineage-${origin}-${choice.id}` },
      ]),
    );
    if (choice.ending.peace) {
      const [a, b] =
        origin === "wu" || origin === "yao" ? (["wu", "yao"] as const) : (["chan", "jie"] as const);
      establishTruce(world, a, b, 64);
      changes.push("两方立约停战六十四个游戏日");
    } else {
      adjustFaction(world, definition.faction, 10, 4);
      changes.push("所护势力的声威与补给增强");
    }
    const region = world.living.regions[chapter.place]!;
    region.prosperity = Math.min(3, region.prosperity + 1);
    region.strain = Math.max(0, region.strain - 1);
    const first = definition.chapters[0]!.choices.find(
      (entry) => entry.id === progress.history[0]!.choice,
    )!;
    paragraphs.push(
      `当初你曾选择「${first.text}」。那一念并没有被最后这一笔抹去，沿途的人仍记得你怎样走到这里。`,
      `此卷落款：${choice.ending.name}。此生仍在继续。`,
    );
    changes.push(`族脉长卷完成 · ${choice.ending.name}`);
  }
  world.report = { title: choice.ending ? choice.ending.name : chapter.title, paragraphs, changes };
  return 1;
}
