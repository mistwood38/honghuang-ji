import type { Origin, StatKey } from "../types.ts";

export type PlaceId =
  | "chaos"
  | "earth"
  | "kunlun"
  | "buzhou"
  | "east"
  | "bloodsea"
  | "wahuan"
  | "youming"
  | "tribes"
  | "penglai"
  | "zixiao"
  | "edge"
  | "board";

export type GoodId =
  | "herb"
  | "dew"
  | "ore"
  | "clay"
  | "salt"
  | "seed"
  | "pill-qi"
  | "pill-life"
  | "pill-break";

export type Effect =
  | { t: "stat"; k: StatKey; n: number }
  | { t: "good"; id: GoodId; n: number }
  | { t: "stone"; n: number }
  | { t: "karma"; id: string }
  | { t: "drop"; id: string }
  | { t: "rel"; id: string; n: number }
  | { t: "rep"; id: string; n: number }
  | { t: "quest"; id: string; stage: number; status?: "active" | "done" | "failed" }
  | { t: "delay"; event: string; days: number }
  | { t: "wound"; n: number }
  | { t: "ling"; n: number }
  | { t: "xiu"; n: number }
  | { t: "art"; id: string }
  | { t: "spell"; id: string }
  | { t: "equip"; id: string }
  | { t: "sect"; id: string | null; rank?: number }
  | { t: "contrib"; n: number }
  | { t: "beast"; id: string | null }
  | { t: "bond"; n: number }
  | { t: "cave"; n: number }
  | { t: "know"; place: PlaceId }
  | { t: "item"; id: string }
  | { t: "battle"; id: string }
  | { t: "skew"; n: number }
  | { t: "place"; id: PlaceId };

export type EventChoice = {
  id: string;
  text: string;
  result: string[];
  effects: Effect[];
  /** Show only after this karma exists. */
  when?: string;
  unless?: string;
};

export type RoamEvent = {
  id: string;
  place: PlaceId | "any";
  title: string;
  prose: string[];
  choices: EventChoice[];
  once?: boolean;
  weight?: number;
  chain?: string;
  stage?: number;
  minRealm?: number;
  maxRealm?: number;
  eras?: string[];
  need?: string[];
  block?: string[];
  sect?: string;
  /** Extra paragraphs if the player already carries this karma. */
  variants?: { when: string; paragraphs: string[] }[];
};

export type ChainDef = { id: string; name: string; stages: string[] };

export type BattleState = {
  id: string;
  name: string;
  hp: number;
  max: number;
  atk: number;
  def: number;
  guard: number;
  round: number;
  log: string[];
  win: Effect[];
  lose: Effect[];
  winText: string[];
  loseText: string[];
};

export type QuestState = { stage: number; status: "active" | "done" | "failed" };

export type RoamReport = { title: string; paragraphs: string[]; changes: string[] };

export type RoamState = {
  phase: "origin" | "free" | "event" | "battle";
  day: number;
  place: PlaceId;
  known: PlaceId[];
  xiuwei: number;
  lingqi: number;
  wuxing: number;
  wound: number;
  stones: number;
  arts: string[];
  equipped: string | null;
  spells: string[];
  bag: Partial<Record<GoodId, number>>;
  relations: Record<string, number>;
  reputation: Record<string, number>;
  sect: string | null;
  sectRank: number;
  contrib: number;
  quests: Record<string, QuestState>;
  karma: string[];
  delayed: { event: string; due: number }[];
  notices: string[];
  seen: string[];
  log: { day: number; title: string; line: string }[];
  report: RoamReport | null;
  eventId: string | null;
  battle: BattleState | null;
  cave: number;
  beast: { id: string; name: string; bond: number } | null;
  eraSkew: number;
  eraSeen: string[];
};

export type RoamAct =
  | { type: "origin"; origin: Origin; name: string }
  | { type: "cultivate" }
  | { type: "breakthrough"; pill: boolean }
  | { type: "explore" }
  | { type: "choose"; choiceId: string }
  | { type: "travel"; place: PlaceId }
  | { type: "gather" }
  | { type: "rest" }
  | { type: "alchemy"; recipe: string }
  | { type: "use"; id: GoodId }
  | { type: "cave"; what: "upgrade" | "meditate" }
  | { type: "sect"; what: "join" | "task" | "leave" | "learn" }
  | { type: "trade"; what: "buy" | "sell"; id: GoodId }
  | { type: "beast"; what: "feed" | "release" }
  | { type: "combat"; move: "strike" | "spell" | "guard" | "flee" }
  | { type: "continue"; chainId: string }
  | { type: "notice"; eventId: string };
