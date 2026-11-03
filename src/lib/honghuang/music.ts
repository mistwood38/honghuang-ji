import type { SceneMood } from "./visuals.ts";
import type { Screen } from "./types.ts";

/** One playable bed. Screens and scene moods do not share a track. */
export type MusicCue =
  | "title"
  | "novel"
  | "codex"
  | "land"
  | "self"
  | SceneMood;

export type MusicTrack = {
  src: string;
  /** Linear gain after the fade-in. Orchestral beds sit lower than solo guqin. */
  level: number;
  title: string;
};

export const MUSIC: Record<MusicCue, MusicTrack> = {
  title: { src: "/audio/pei-lan.ogg", level: 0.72, title: "佩兰" },
  novel: { src: "/audio/kongzi.ogg", level: 0.68, title: "孔子读易" },
  codex: { src: "/audio/shenren.ogg", level: 0.66, title: "神人畅" },
  land: { src: "/audio/liu-shui.ogg", level: 0.7, title: "流水" },
  self: { src: "/audio/pingsha.ogg", level: 0.64, title: "平沙落雁" },
  mist: { src: "/audio/qiu-feng.ogg", level: 0.66, title: "秋风辞" },
  radiance: { src: "/audio/yangguan.ogg", level: 0.68, title: "阳关三叠" },
  still: { src: "/audio/zuiyu.ogg", level: 0.6, title: "醉渔唱晚" },
  embers: { src: "/audio/jiu-kuang.ogg", level: 0.66, title: "酒狂" },
  tide: { src: "/audio/improvisation.ogg", level: 0.62, title: "即兴其一" },
  calamity: { src: "/audio/battle.ogg", level: 0.4, title: "Hope" },
};

export function musicCue(screen: Screen, mood: SceneMood): MusicCue {
  if (screen === "play") return mood;
  return screen;
}

/** Place beds reuse the scene cues. Calamity, tide and embers stay distinct. */
export function cueForPlace(place: string): MusicCue {
  if (place === "bloodsea" || place === "buzhou" || place === "board") return "calamity";
  if (place === "youming" || place === "edge" || place === "chaos") return "still";
  if (place === "east" || place === "penglai") return "tide";
  if (place === "wahuan" || place === "tribes") return "embers";
  if (place === "zixiao") return "radiance";
  return "mist";
}

/** Where to place the new prose: under the sticky header, not at the document top. */
export function storyScrollTop(viewportTop: number, scrollY: number, headerHeight: number) {
  if (!Number.isFinite(viewportTop) || !Number.isFinite(scrollY) || !Number.isFinite(headerHeight)) {
    return Math.max(0, scrollY);
  }
  return Math.max(0, Math.round(viewportTop + scrollY - Math.max(0, headerHeight) - 10));
}
