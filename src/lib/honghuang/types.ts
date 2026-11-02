export type Origin = "dao" | "wu" | "yao" | "ren";

export type StatKey = "dao" | "qi" | "kill" | "virtue" | "demon" | "life";

export type Stats = Record<StatKey, number>;

export type Screen = "title" | "play" | "novel" | "codex" | "land" | "self";

export type Cond =
  | { kind: "statMin"; stat: StatKey; value: number }
  | { kind: "statMax"; stat: StatKey; value: number }
  | { kind: "item"; id: string }
  | { kind: "anyItem"; ids: string[] }
  | { kind: "flag"; id: string }
  | { kind: "notFlag"; id: string }
  | { kind: "origin"; id: Origin }
  | { kind: "anyFlag"; ids: string[] }
  | { kind: "or"; any: Cond[] }
  | { kind: "and"; all: Cond[] };

export type Choice = {
  id: string;
  text: string;
  sub?: string;
  requires?: Cond[];
  /** lock: show disabled. hide: omit until requirements pass. */
  visibility?: "lock" | "hide";
  to: string;
  delta?: Partial<Stats>;
  addItems?: string[];
  removeOneOf?: string[];
  addFlags?: string[];
  setOrigin?: Origin;
  setName?: string;
  record?: string;
};

export type Aside = {
  requires?: Cond[];
  text: string;
};

export type EndingInfo = {
  name: string;
  seal: string;
};

export type Scene = {
  id: string;
  era: string;
  title: string;
  place: string;
  paragraphs: string[];
  asides?: Aside[];
  choices: Choice[];
  /** Last stance: choices come from the life you actually lived. */
  resolve?: boolean;
  ending?: EndingInfo;
};

export type LogLine = {
  sceneId: string;
  title: string;
  choice: string;
};

export type PastLife = {
  name: string;
  origin: Origin | null;
  ending: string;
  seal: string;
  lines: string[];
};

export type SaveData = {
  version: 1;
  screen: Screen;
  started: boolean;
  name: string;
  origin: Origin | null;
  sceneId: string;
  stats: Stats;
  items: string[];
  flags: string[];
  log: LogLine[];
  seen: string[];
  novelIndex: number;
  sound: boolean;
  pastLives: PastLife[];
};
