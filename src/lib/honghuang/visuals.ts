import type { Scene } from "./types";

/** Presentation only. Never persisted; the original scene/place IDs remain canonical. */
export type ArtKey = "chaos" | "mountain" | "palace" | "calamity";
export type SceneMood = "mist" | "radiance" | "calamity" | "still";
export const ART: Record<ArtKey, { src: string; small: string; alt: string }> = {
  chaos: {
    src: "/art/chaos.webp",
    small: "/art/chaos-small.webp",
    alt: "混沌云海中，盘古的远古神影立于开天裂隙之前",
  },
  mountain: {
    src: "/art/mountain.webp",
    small: "/art/mountain-small.webp",
    alt: "天光穿过苍青群峰，远古天柱耸立于层叠云海",
  },
  palace: {
    src: "/art/palace.webp",
    small: "/art/palace-small.webp",
    alt: "三十三天之上的青铜古殿，金色天光照入云海",
  },
  calamity: {
    src: "/art/calamity.webp",
    small: "/art/calamity-small.webp",
    alt: "不周天柱崩折，天河自裂隙倾泻，余烬照亮幽青群山",
  },
};

const PLACE_ART: Record<string, ArtKey> = {
  chaos: "chaos",
  edge: "chaos",
  earth: "mountain",
  zixiao: "palace",
  "thirty-three": "palace",
  kunlun: "mountain",
  bloodsea: "calamity",
  buzhou: "mountain",
  east: "palace",
  wahuan: "mountain",
  youming: "chaos",
  penglai: "mountain",
  tribes: "mountain",
  board: "palace",
};
export function artForPlace(place: string) {
  return ART[PLACE_ART[place] ?? "mountain"];
}
export function artForScene(scene: Scene) {
  if (["collapse", "war", "mend"].includes(scene.id)) return ART.calamity;
  if (scene.id === "cleave") return ART.chaos;
  return artForPlace(scene.place);
}
export function moodForScene(scene: Scene): SceneMood {
  if (["collapse", "war", "mend"].includes(scene.id)) return "calamity";
  if (scene.ending) return "still";
  if (scene.id === "cleave" || scene.place === "zixiao") return "radiance";
  return "mist";
}
