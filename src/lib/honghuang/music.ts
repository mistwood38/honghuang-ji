import type { SceneMood } from "./visuals.ts";
import type { Screen } from "./types.ts";

/** One playable bed. Screens and scene moods do not share a track. */
export type MusicCue = "title" | "novel" | "codex" | "land" | "self" | SceneMood;

export type MusicTrack = {
  src: string;
  /** Linear gain after the fade-in. Orchestral beds sit lower than solo guqin. */
  level: number;
  title: string;
};

export const MUSIC: Record<MusicCue, MusicTrack> = {
  title: { src: "/audio/score-first-light.ogg", level: 0.85, title: "开天行" },
  novel: { src: "/audio/score-ink-moon.ogg", level: 0.66, title: "墨间月" },
  codex: { src: "/audio/score-ink-moon.ogg", level: 0.66, title: "墨间月" },
  land: { src: "/audio/score-mountain-sea.ogg", level: 0.82, title: "山海无涯" },
  self: { src: "/audio/score-jade-breath.ogg", level: 0.75, title: "青岚入定" },
  mist: { src: "/audio/score-cloud-road.ogg", level: 0.8, title: "逐云" },
  radiance: { src: "/audio/score-first-light.ogg", level: 0.82, title: "开天行" },
  still: { src: "/audio/score-jade-breath.ogg", level: 0.72, title: "青岚入定" },
  embers: { src: "/audio/score-mountain-sea.ogg", level: 0.78, title: "山海无涯" },
  tide: { src: "/audio/score-cloud-road.ogg", level: 0.78, title: "逐云" },
  calamity: { src: "/audio/score-ember-oath.ogg", level: 0.86, title: "踏劫" },
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
  if (
    !Number.isFinite(viewportTop) ||
    !Number.isFinite(scrollY) ||
    !Number.isFinite(headerHeight)
  ) {
    return Math.max(0, scrollY);
  }
  return Math.max(0, Math.round(viewportTop + scrollY - Math.max(0, headerHeight) - 10));
}
