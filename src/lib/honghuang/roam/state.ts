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
  "herb" | "dew" | "ore" | "clay" | "salt" | "seed" | "pill-qi" | "pill-life" | "pill-break";

export type FactionId = "chan" | "jie" | "wu" | "yao" | "hearth";
export type PoliticsState = {
  nextDay: number;
  cycle: number;
  factions: Record<
    FactionId,
    { power: number; supply: number; lastAid: number; lastPatrol: number; lastTalk: number }
  >;
  relations: Record<string, number>;
  truces: Record<string, number>;
  control: Partial<Record<PlaceId, FactionId>>;
  history: { day: number; text: string }[];
};
export type LineageProgress = {
  stage: number;
  nextDay: number;
  history: { chapter: number; choice: string; day: number; title: string; text: string[] }[];
  ending: string | null;
};
export type WorldAct =
  | { type: "affairs"; faction: FactionId; what: "aid" | "mediate" | "patrol" }
  | { type: "lineage"; what: "begin" | "choose" | "trial"; chapter?: number; choiceId?: string };

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
  | { t: "place"; id: PlaceId }
  | { t: "faction"; id: FactionId; power: number; supply: number };

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

export type RetreatState = { watch: number };

export type PlotState = { ready: number };

export type IdleKind = "sit" | "wander";
export type BattlePlan = "balanced" | "assault" | "reserve";

export type IdleState = { kind: IdleKind };

/** Unclaimed time. Numbers stay here until the player collects. */
export type Haul = {
  breaths: number;
  xiu: number;
  ling: number;
  stones: number;
  wound: number;
  goods: Partial<Record<GoodId, number>>;
};

export type RoamReport = { title: string; paragraphs: string[]; changes: string[] };

export type LocalAct =
  | {
      type: "local";
      what: "survey" | "gather" | "restore" | "heritage" | "strip" | "rest" | "tend";
      site: string;
    }
  | { type: "person"; what: "talk" | "accept" | "deliver" | "finish"; id: string };
export type SiteState = {
  visited: boolean;
  state: "wild" | "mending" | "restored" | "stripped";
  ready: number;
  cooldown: number;
  method: string;
};
export type LivingWorld = {
  lastDay: number;
  sites: Record<string, SiteState>;
  regions: Record<string, { strain: number; prosperity: number }>;
  people: Record<string, { place: PlaceId; nextMove: number; journey: number; met: boolean }>;
  errands: Record<
    string,
    {
      stage: "carrying" | "delivered" | "done";
      destination: PlaceId;
      completed: number;
      count: number;
    }
  >;
  news: { day: number; place: PlaceId; text: string }[];
};

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
  relic: string | null;
  insights: Record<string, 1 | 2>;
  /** Additional learned techniques prepared outside combat. Passive bonuses stay on the main art. */
  prepared: [string | null, string | null];
  /** Automatic combat preference. Old saves default to balanced. */
  battlePlan: BattlePlan;
  /** Local objects, inhabitants and their consequences; absent in older saves. */
  living: LivingWorld;
  politics: PoliticsState;
  lineages: Partial<Record<Origin, LineageProgress>>;
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
  /** Set while the day is already spent inside seclusion. */
  retreat: RetreatState | null;
  /** Herb bed. `ready` is the day it can be picked. */
  plot: PlotState | null;
  /** What keeps going while the player is away. */
  idle: IdleState | null;
  /** Last time the idle clock was settled, in ms. 0 means unset. */
  lastTick: number;
  haul: Haul | null;
  /** Map currently being farmed. */
  farm: PlaceId | null;
  farmLog: string[];
  /** Cultivation past a full bar, spent on the next breakthrough. */
  spare: number;
  /** Stage inside the current realm, 1 through 9. The ninth is the realm gate. */
  layer: number;
  /** Best protective gear found while farming, 0 through 8. */
  gear: number;
  /** Secret-realm entries left today. */
  riftLeft: number;
  riftDay: number;
  eraSkew: number;
  eraSeen: string[];
};

export type RoamAct =
  | LocalAct
  | WorldAct
  | { type: "origin"; origin: Origin; name: string }
  | { type: "cultivate" }
  | { type: "equip-art"; artId: string }
  | { type: "equip-relic"; id: string | null }
  | { type: "comprehend-art"; artId: string; level: 1 | 2 }
  | { type: "prepare-art"; slot: 0 | 1; artId: string | null }
  | { type: "battle-plan"; plan: BattlePlan }
  | { type: "breakthrough"; pill: boolean }
  | { type: "explore" }
  | { type: "choose"; choiceId: string }
  | { type: "travel"; place: PlaceId }
  | { type: "gather" }
  | { type: "rest" }
  | { type: "alchemy"; recipe: string }
  | { type: "use"; id: GoodId }
  | { type: "cave"; what: "upgrade" | "meditate" }
  | { type: "retreat"; what: "enter" | "watch" | "leave" }
  | { type: "plot"; what: "plant" | "harvest" }
  | { type: "sect"; what: "join" | "task" | "leave" | "learn" }
  | { type: "trade"; what: "buy" | "sell"; id: GoodId }
  | { type: "beast"; what: "feed" | "release" | "train" }
  | {
      type: "idle";
      what: "sit" | "wander" | "stop" | "sync" | "claim" | "fight" | "farm" | "rift";
      now?: number;
      place?: PlaceId;
    }
  | { type: "combat"; move: "strike" | "spell" | "guard" | "flee" | "technique"; artId?: string }
  | { type: "continue"; chainId: string }
  | { type: "notice"; eventId: string };
