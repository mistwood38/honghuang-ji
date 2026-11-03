import type { Scene } from "./types";

/** Presentation only. Never persisted; the original scene/place IDs remain canonical. */
export type ArtKey =
  | "chaos"
  | "mountain"
  | "palace"
  | "calamity"
  | "bloodsea"
  | "east"
  | "tribes"
  | "nuwa"
  | "penglai"
  | "youming";
export type SceneMood = "mist" | "radiance" | "calamity" | "still" | "embers" | "tide";
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
  bloodsea: {
    src: "/art/bloodsea.webp",
    small: "/art/bloodsea-small.webp",
    alt: "朱色深海与玄青风云相接，孤岛周围的岩峰如远古剑意直立",
  },
  east: {
    src: "/art/east.webp",
    small: "/art/east-small.webp",
    alt: "巨大的扶桑神木伸向天穹，金色日轮照见东海与青铜妖庭",
  },
  tribes: {
    src: "/art/tribes.webp",
    small: "/art/tribes-small.webp",
    alt: "苍茫山谷入夜，初民在古石居所前守住一簇火塘",
  },
  nuwa: {
    src: "/art/nuwa.webp",
    small: "/art/nuwa-small.webp",
    alt: "女娲立于大地的青铜古炉旁，托起五色灵石与补天之光",
  },
  penglai: {
    src: "/art/penglai.webp",
    small: "/art/penglai-small.webp",
    alt: "苍青大海上的蓬莱群岛，古松、白色山岩与晨雾层叠",
  },
  youming: {
    src: "/art/youming.webp",
    small: "/art/youming-small.webp",
    alt: "幽冥地底，暗玉色河流穿过沉默的石根与古老岩层",
  },
};

const PLACE_ART: Record<string, ArtKey> = {
  chaos: "chaos",
  edge: "chaos",
  earth: "mountain",
  zixiao: "palace",
  "thirty-three": "palace",
  kunlun: "mountain",
  bloodsea: "bloodsea",
  buzhou: "mountain",
  east: "east",
  wahuan: "nuwa",
  youming: "youming",
  penglai: "penglai",
  tribes: "tribes",
  board: "palace",
};
export function artForPlace(place: string) {
  return ART[PLACE_ART[place] ?? "mountain"];
}
export function artForScene(scene: Scene) {
  if (["collapse", "war"].includes(scene.id)) return ART.calamity;
  if (scene.id === "mend") return ART.nuwa;
  if (scene.id === "cleave") return ART.chaos;
  return artForPlace(scene.place);
}
export function moodForScene(scene: Scene): SceneMood {
  if (["collapse", "war"].includes(scene.id)) return "calamity";
  if (scene.ending || scene.place === "youming") return "still";
  if (["wahuan", "tribes", "bloodsea"].includes(scene.place)) return "embers";
  if (["east", "penglai"].includes(scene.place)) return "tide";
  if (scene.id === "cleave" || scene.place === "zixiao") return "radiance";
  return "mist";
}
