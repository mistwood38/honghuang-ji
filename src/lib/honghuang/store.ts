import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { applyChoice, archiveLife, cleanName, fresh, INITIAL } from "./engine.ts";
import { adoptChronicle, applyRoam, createRoam, normalizeRoam } from "./roam/engine.ts";
import type { RoamAct } from "./roam/state.ts";
import { sceneById } from "./story.ts";
import type { Choice, SaveData, Screen } from "./types.ts";

type Store = SaveData & {
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  setScreen: (screen: Screen) => void;
  begin: () => void;
  choose: (choice: Choice, nameOverride?: string) => void;
  setNovelIndex: (index: number) => void;
  setSound: (sound: boolean) => void;
  rename: (name: string) => void;
  restart: () => void;
  importSave: (raw: string) => void;
  roam: (act: RoamAct) => void;
  openWorld: () => void;
  beginChronicle: () => void;
};

function memoryStorage(): Storage {
  const mem = new Map<string, string>();
  return {
    get length() {
      return mem.size;
    },
    clear: () => mem.clear(),
    getItem: (key) => mem.get(key) ?? null,
    key: (index) => [...mem.keys()][index] ?? null,
    removeItem: (key) => {
      mem.delete(key);
    },
    setItem: (key, value) => {
      mem.set(key, value);
    },
  };
}

function browserStorage(): Storage {
  if (typeof window === "undefined") return memoryStorage();
  return {
    get length() {
      return localStorage.length;
    },
    clear: () => localStorage.clear(),
    key: (index) => localStorage.key(index),
    getItem: (key) => {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem: (key, value) => {
      try {
        const prev = localStorage.getItem(key);
        if (prev) localStorage.setItem(`${key}-bak`, prev);
        localStorage.setItem(key, value);
      } catch {
        /* private mode or quota: keep the in-memory store */
      }
    },
    removeItem: (key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    },
  };
}

function sanitize(persisted: unknown): SaveData {
  const base = fresh();
  if (!persisted || typeof persisted !== "object") return base;
  const raw = persisted as Partial<SaveData>;
  const stats = { ...base.stats, ...(raw.stats ?? {}) };
  const next: SaveData = {
    ...base,
    ...raw,
    version: 1,
    stats,
    items: Array.isArray(raw.items) ? raw.items.filter((item) => typeof item === "string") : [],
    flags: Array.isArray(raw.flags) ? raw.flags.filter((flag) => typeof flag === "string") : [],
    log: Array.isArray(raw.log) ? raw.log : [],
    seen: Array.isArray(raw.seen) ? raw.seen.filter((id) => typeof id === "string") : [],
    pastLives: Array.isArray(raw.pastLives) ? raw.pastLives.slice(-8) : [],
    novelIndex: typeof raw.novelIndex === "number" ? raw.novelIndex : 0,
    sound: raw.sound !== false,
    name: typeof raw.name === "string" ? raw.name : "",
    sceneId: typeof raw.sceneId === "string" ? raw.sceneId : "awaken",
    screen: raw.screen ?? "title",
    started: Boolean(raw.started),
    origin: raw.origin ?? null,
    world: normalizeRoam((raw as { world?: unknown }).world),
  };
  next.version = next.world ? 2 : 1;
  if (!sceneById(next.sceneId)) next.sceneId = "awaken";
  return next;
}

/** Accept the on-disk v1 blob, or the same blob wrapped by the persist middleware. */
export function readImportedSave(raw: string): SaveData {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("没有可导入的文本");
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new Error("这不是存档文本。抄录此生的句子不能当存档导入。");
  }
  if (!parsed || typeof parsed !== "object") throw new Error("这不是存档文本");
  const record = parsed as Record<string, unknown>;
  const payload =
    record.state && typeof record.state === "object" ? record.state : parsed;
  if (!payload || typeof payload !== "object") throw new Error("这不是存档文本");
  const body = payload as Record<string, unknown>;
  if (body.version !== 1 && body.version !== 2) {
    throw new Error("只接受这一版游戏的存档");
  }
  if (typeof body.sceneId !== "string" || typeof body.stats !== "object") {
    throw new Error("只接受这一版游戏的存档");
  }
  return sanitize(payload);
}

export const useSave = create<Store>()(
  persist(
    (set, get) => ({
      ...INITIAL,
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),
      setScreen: (screen) => set({ screen }),
      begin: () => {
        const cur = get();
        if (!cur.started) {
          set({
            started: true,
            screen: "play",
            version: 2,
            world: createRoam(),
            sceneId: "awaken",
            seen: ["awaken"],
          });
          return;
        }
        set({ screen: "play" });
      },
      beginChronicle: () => {
        const cur = get();
        if (cur.world) {
          set({ screen: "play" });
          return;
        }
        if (!cur.started) {
          set({
            started: true,
            screen: "play",
            version: 1,
            world: null,
            sceneId: "awaken",
            seen: ["awaken"],
          });
          return;
        }
        set({ screen: "play" });
      },
      choose: (choice, nameOverride) => {
        const cur = get();
        set(applyChoice(cur, choice, nameOverride));
      },
      roam: (act) => {
        set(applyRoam(get(), act));
      },
      openWorld: () => {
        set(adoptChronicle(get()));
      },
      setNovelIndex: (index) => set({ novelIndex: index }),
      setSound: (sound) => set({ sound }),
      rename: (name) => set({ name: cleanName(name) }),
      restart: () => {
        const cur = get();
        const archived = archiveLife(cur);
        const pastLives = archived ? [...cur.pastLives, archived].slice(-8) : cur.pastLives;
        set({
          ...fresh(),
          world: createRoam(),
          version: 2,
          hydrated: true,
          screen: "play",
          started: true,
          sceneId: "awaken",
          seen: ["awaken"],
          novelIndex: cur.novelIndex,
          sound: cur.sound,
          pastLives,
        });
      },
      importSave: (raw) => {
        set({ ...readImportedSave(raw), hydrated: true });
      },
    }),
    {
      name: "honghuang-ji-save",
      version: 1,
      skipHydration: true,
      storage: createJSONStorage(browserStorage),
      partialize: (state) => {
        const {
          hydrated: _hydrated,
          setHydrated: _a,
          setScreen: _b,
          begin: _c,
          choose: _d,
          setNovelIndex: _e,
          setSound: _f,
          rename: _g,
          restart: _h,
          importSave: _i,
          roam: _j,
          openWorld: _k,
          beginChronicle: _l,
          ...data
        } = state;
        return data;
      },
      merge: (persisted, current) => {
        const data = sanitize(persisted);
        return { ...current, ...data, hydrated: current.hydrated };
      },
    },
  ),
);
