import { sceneById } from "./story.ts";
import type { Choice, Cond, Origin, SaveData, StatKey, Stats } from "./types.ts";
import { FLAG_LABEL, ITEMS, ORIGINS, realmOf } from "./world.ts";

const STAT_CAP: Record<StatKey, number> = {
  dao: 400,
  qi: 160,
  kill: 160,
  virtue: 160,
  demon: 100,
  life: 100,
};

export const INITIAL: SaveData = {
  version: 1,
  screen: "title",
  started: false,
  name: "",
  origin: null,
  sceneId: "awaken",
  stats: { dao: 0, qi: 0, kill: 0, virtue: 0, demon: 0, life: 100 },
  items: [],
  flags: [],
  log: [],
  seen: [],
  novelIndex: 0,
  sound: true,
  pastLives: [],
  world: null,
};

export function fresh(): SaveData {
  return structuredClone(INITIAL);
}

export function meetsCond(state: SaveData, cond: Cond): boolean {
  switch (cond.kind) {
    case "statMin":
      return state.stats[cond.stat] >= cond.value;
    case "statMax":
      return state.stats[cond.stat] <= cond.value;
    case "item":
      return state.items.includes(cond.id);
    case "anyItem":
      return cond.ids.some((id) => state.items.includes(id));
    case "flag":
      return state.flags.includes(cond.id);
    case "notFlag":
      return !state.flags.includes(cond.id);
    case "origin":
      return state.origin === cond.id;
    case "anyFlag":
      return cond.ids.some((id) => state.flags.includes(id));
    case "or":
      return cond.any.some((child) => meetsCond(state, child));
    case "and":
      return cond.all.every((child) => meetsCond(state, child));
    default:
      return false;
  }
}

export function choiceOpen(state: SaveData, choice: Choice): boolean {
  return (choice.requires ?? []).every((cond) => meetsCond(state, cond));
}

export function lockReason(state: SaveData, choice: Choice): string | null {
  if (choiceOpen(state, choice)) return null;
  for (const cond of choice.requires ?? []) {
    if (!meetsCond(state, cond)) return reasonFor(state, cond);
  }
  return "此路未开";
}

function reasonFor(state: SaveData, cond: Cond): string {
  switch (cond.kind) {
    case "statMin":
      return "尚未够到";
    case "statMax":
      return "心性过重";
    case "item":
      return `缺少${ITEMS[cond.id]?.name ?? "物"}`;
    case "anyItem":
      return "手中没有能投入的物";
    case "flag":
    case "notFlag":
    case "anyFlag":
      return "因果未至";
    case "origin":
      return "根骨不合";
    case "or":
      return "此门未开";
    case "and": {
      const failed = cond.all.find((child) => !meetsCond(state, child));
      return failed ? reasonFor(state, failed) : "此路未开";
    }
    default:
      return "此路未开";
  }
}

export type ResolvedChoice = {
  choice: Choice;
  open: boolean;
  reason: string | null;
};

export function qualDao(state: SaveData): boolean {
  return (
    state.stats.dao >= 96 &&
    state.stats.virtue >= 36 &&
    state.stats.demon < 34 &&
    (state.flags.includes("heard-hongjun") || state.flags.includes("listened-breath"))
  );
}

export function qualWu(state: SaveData): boolean {
  return (
    state.stats.kill >= 36 &&
    ["side-wu", "faction-wu", "wu-blood", "wu-wrestled"].some((flag) => state.flags.includes(flag))
  );
}

export function qualYao(state: SaveData): boolean {
  return (
    state.stats.qi >= 26 &&
    ["side-yao", "faction-yao", "heard-bell", "true-form"].some((flag) => state.flags.includes(flag))
  );
}

export function qualRen(state: SaveData): boolean {
  return (
    state.stats.virtue >= 52 &&
    ["helped-nuwa", "saved-clay", "shielded-humans", "blood-in-clay", "stole-for-humans", "side-ren"].some(
      (flag) => state.flags.includes(flag),
    )
  );
}

export function qualDemon(state: SaveData): boolean {
  return state.stats.demon >= 40;
}

export function qualHidden(state: SaveData): boolean {
  return state.flags.includes("walked-away") && state.stats.demon < 32;
}

export function qualBoard(state: SaveData): boolean {
  return state.flags.includes("entered-board");
}

function endingChoice(id: string, text: string, sub: string, record: string): Choice {
  return { id, text, sub, to: id, record, visibility: "hide" };
}

export function bestEnding(state: SaveData): string {
  if (state.stats.life <= 0) return "end-fallen";
  if (qualDemon(state)) return "end-demon";
  if (qualDao(state)) return "end-dao";
  if (qualRen(state)) return "end-ren";
  if (qualWu(state)) return "end-wu";
  if (qualYao(state)) return "end-yao";
  if (qualHidden(state)) return "end-hidden";
  if (qualBoard(state)) return "end-board";
  return "end-free";
}

export function rawChoices(state: SaveData): Choice[] {
  const scene = sceneById(state.sceneId);
  if (!scene) return [];
  if (scene.ending) return [];
  if (!scene.resolve) return scene.choices;
  const list: Choice[] = [];
  if (qualDao(state)) {
    list.push(endingChoice("end-dao", "走向混元之门", "以所闻证自己，不证权位", "你走到混元之门前，没有跪。"));
  }
  if (qualWu(state)) {
    list.push(endingChoice("end-wu", "以巫骨立于天地之间", "不成圣，成为重量", "你选择继续用身体说话。"));
  }
  if (qualYao(state)) {
    list.push(endingChoice("end-yao", "坐上妖庭空着的那一侧", "形终于被认作同类", "你在日月之侧坐下。"));
  }
  if (qualRen(state)) {
    list.push(endingChoice("end-ren", "留在人族的火旁", "一碗饭，一夜班", "你留下守火，不立神位。"));
  }
  if (qualDemon(state)) {
    list.push(endingChoice("end-demon", "让心魔把你说完", "饿已经比道号更大", "你让饥饿替你收束这一生。"));
  }
  if (qualHidden(state)) {
    list.push(endingChoice("end-hidden", "走出这一劫，不再回头", "把自己留在屋子外面", "你留在世界边上，不回去做句子的主语。"));
  }
  if (qualBoard(state)) {
    list.push(endingChoice("end-board", "把名字写进榜里", "字会改你", "你让名字落墨。"));
  }
  list.push({
    id: "fate",
    text: "任因果自行落定",
    sub: "不抢结局，看这一生最像什么",
    to: "@best",
    record: "你松开手，让这一生自己收束。",
  });
  return list;
}

export function visibleChoices(state: SaveData): ResolvedChoice[] {
  return rawChoices(state)
    .filter((choice) => choice.visibility !== "hide" || choiceOpen(state, choice))
    .map((choice) => ({
      choice,
      open: choiceOpen(state, choice),
      reason: lockReason(state, choice),
    }));
}

function clampStat(key: StatKey, value: number): number {
  return Math.max(0, Math.min(STAT_CAP[key], value));
}

export function fill(text: string, state: SaveData): string {
  const name = state.name || "未名";
  return text.replaceAll("{{name}}", name);
}

export function cleanName(raw: string): string {
  const trimmed = raw.replace(/\s+/g, "").slice(0, 8);
  return trimmed;
}

export function applyChoice(state: SaveData, choice: Choice, nameOverride?: string): SaveData {
  const scene = sceneById(state.sceneId);
  if (!scene || scene.ending) return state;
  if (!choiceOpen(state, choice)) return state;

  const next: SaveData = {
    ...state,
    stats: { ...state.stats },
    items: [...state.items],
    flags: [...state.flags],
    log: [...state.log],
    seen: [...state.seen],
  };

  if (choice.setOrigin) next.origin = choice.setOrigin;
  if (choice.setName) next.name = choice.setName;
  const override = nameOverride ? cleanName(nameOverride) : "";
  if (override) next.name = override;

  if (choice.delta) {
    for (const key of Object.keys(choice.delta) as StatKey[]) {
      const amount = choice.delta[key];
      if (typeof amount !== "number") continue;
      next.stats[key] = clampStat(key, next.stats[key] + amount);
    }
  }

  for (const itemId of choice.addItems ?? []) {
    if (!next.items.includes(itemId)) next.items.push(itemId);
  }
  if (choice.removeOneOf) {
    const hit = choice.removeOneOf.find((itemId) => next.items.includes(itemId));
    if (hit) next.items = next.items.filter((itemId) => itemId !== hit);
  }
  for (const flag of choice.addFlags ?? []) {
    if (!next.flags.includes(flag)) next.flags.push(flag);
  }

  if (!next.seen.includes(scene.id)) next.seen.push(scene.id);

  const record = fill(choice.record ?? choice.text, next);
  next.log.push({ sceneId: scene.id, title: scene.title, choice: record });

  let to = choice.to === "@best" ? bestEnding(next) : choice.to;
  if (next.stats.life <= 0) to = "end-fallen";
  const dest = sceneById(to);
  if (!dest) return state;
  next.sceneId = dest.id;
  if (!next.seen.includes(dest.id)) next.seen.push(dest.id);
  return next;
}

export function chooseById(state: SaveData, id: string, nameOverride?: string): SaveData {
  const found = rawChoices(state).find((choice) => choice.id === id);
  if (!found) throw new Error(`no choice ${id} in ${state.sceneId}`);
  if (!choiceOpen(state, found)) throw new Error(`locked ${id} in ${state.sceneId}`);
  return applyChoice(state, found, nameOverride);
}

export function deltaHint(delta?: Partial<Stats>): string {
  if (!delta) return "";
  const labels: Record<StatKey, string> = {
    dao: "道行",
    qi: "气运",
    kill: "杀伐",
    virtue: "仁德",
    demon: "心魔",
    life: "道躯",
  };
  return (Object.keys(delta) as StatKey[])
    .filter((key) => typeof delta[key] === "number" && delta[key] !== 0)
    .map((key) => {
      const amount = delta[key] ?? 0;
      const sign = amount > 0 ? "+" : "";
      return `${labels[key]}${sign}${amount}`;
    })
    .join(" ");
}

export function lifeText(state: SaveData): string {
  const origin = state.origin ? ORIGINS[state.origin].name : "未选根骨";
  const scene = sceneById(state.sceneId);
  const lines = [
    `《${state.name || "未名"}》`,
    `${origin} · ${realmOf(state.stats.dao).name}`,
    "",
    ...state.log.map((line) => `${line.title}：${line.choice}`),
  ];
  if (scene?.ending) {
    lines.push("", `归处：${scene.ending.name}`);
  }
  return lines.join("\n");
}

export function archiveLife(state: SaveData): SaveData["pastLives"][number] | null {
  if (!state.started && state.log.length === 0) return null;
  if (state.log.length === 0 && !state.origin) return null;
  const scene = sceneById(state.sceneId);
  return {
    name: state.name || "未名",
    origin: state.origin,
    ending: scene?.ending?.name ?? "未竟",
    seal: scene?.ending?.seal ?? "止",
    lines: state.log.map((line) => `${line.title}：${line.choice}`),
  };
}

export function flagLabel(flag: string): string {
  return FLAG_LABEL[flag] ?? flag;
}

export function originOf(id: Origin | null) {
  if (!id) return null;
  return ORIGINS[id];
}
