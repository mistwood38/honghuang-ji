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
  | "youming"
  | "worldmap"
  | "fengshen"
  | "earth"
  | "kunlun"
  | "buzhou"
  | "war"
  | "edge"
  | "clay"
  | "heavens"
  | "relics"
  | "sanctuary";
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
  worldmap: {
    src: "/art/world-atlas.webp",
    small: "/art/world-atlas-small.webp",
    alt: "洪荒天地分层意象舆图：云上天宫、大地山海与幽冥静河",
  },
  fengshen: {
    src: "/art/fengshen.webp",
    small: "/art/fengshen-small.webp",
    alt: "古老封神台上，一卷未落名字的金色长卷悬于天地之间",
  },
  earth: {
    src: "/art/earth.webp",
    small: "/art/earth-small.webp",
    alt: "盘古的身躯横卧成山，河流从胸膛流下，化作洪荒大地",
  },
  kunlun: {
    src: "/art/kunlun.webp",
    small: "/art/kunlun-small.webp",
    alt: "西极昆仑的玉色崖阶与古殿，晨光只照到一条长阶",
  },
  buzhou: {
    src: "/art/buzhou.webp",
    small: "/art/buzhou-small.webp",
    alt: "未折的不周天柱，青铜兽面箍住黑暗，直顶低沉的天",
  },
  war: {
    src: "/art/war.webp",
    small: "/art/war-small.webp",
    alt: "巫妖未分胜负，骨甲与日轮金车隔着山谷对峙，天柱仍在远处",
  },
  edge: {
    src: "/art/edge.webp",
    small: "/art/edge-small.webp",
    alt: "混沌边上的静湖与一方空石，像一张没有人的旧床",
  },
  clay: {
    src: "/art/clay.webp",
    small: "/art/clay-small.webp",
    alt: "女娲在夜里抟泥，炉火旁一个泥人刚刚睁眼",
  },
  heavens: {
    src: "/art/heavens.webp",
    small: "/art/heavens-small.webp",
    alt: "三十三天层层宫阙叠在云上，越往上越淡",
  },
  relics: {
    src: "/art/relics.webp",
    small: "/art/relics-small.webp",
    alt: "玄青石台上的古铜钟、灵石、古骨与玉片，器物纹理映着微光",
  },
  sanctuary: {
    src: "/art/cultivation-sanctuary.webp",
    small: "/art/cultivation-sanctuary-small.webp",
    alt: "修士在古松石台上静坐，铜炉与古卷相伴，远方是苍青群山和云海",
  },
};

/** Chapter IDs keep their illustration when the reading order changes. */
export const CHAPTER_ART: Record<string, ArtKey> = {
  c1: "chaos",
  c2: "chaos",
  c3: "earth",
  c4: "palace",
  c5: "palace",
  c6: "kunlun",
  c7: "buzhou",
  c8: "east",
  c9: "calamity",
  c10: "clay",
  c11: "nuwa",
  c12: "tribes",
  c13: "fengshen",
  c14: "edge",
  w1: "east",
  w2: "east",
  w3: "buzhou",
  w4: "buzhou",
  w5: "clay",
  w6: "nuwa",
  w7: "tribes",
  w8: "penglai",
  w9: "bloodsea",
  w10: "edge",
  w11: "fengshen",
  w12: "sanctuary",
  w13: "sanctuary",
  w14: "sanctuary",
  w15: "east",
  w16: "penglai",
};

export type WitnessKey = "pangu" | "hongjun" | "witch" | "dijun" | "yuanshi" | "tongtian";
export const WITNESS: Record<WitnessKey, { src: string; small: string; name: string; alt: string }> = {
  pangu: {
    src: "/art/figure-pangu.webp",
    small: "/art/figure-pangu-small.webp",
    name: "盘古",
    alt: "石骨青铜的盘古，斧垂在身侧",
  },
  hongjun: {
    src: "/art/figure-hongjun.webp",
    small: "/art/figure-hongjun-small.webp",
    name: "鸿钧",
    alt: "麻衣闭目的鸿钧，一缕紫气绕过青铜灯",
  },
  witch: {
    src: "/art/figure-witch.webp",
    small: "/art/figure-witch-small.webp",
    name: "祖巫",
    alt: "骨甲铜环的祖巫，面容沉静",
  },
  dijun: {
    src: "/art/figure-dijun.webp",
    small: "/art/figure-dijun-small.webp",
    name: "帝俊",
    alt: "羽氅与日轮的帝俊，立在扶桑之前",
  },
  yuanshi: {
    src: "/art/figure-yuanshi.webp",
    small: "/art/figure-yuanshi-small.webp",
    name: "元始",
    alt: "素净玉衣的元始，侧立在昆仑薄雾里，并不看人",
  },
  tongtian: {
    src: "/art/figure-tongtian.webp",
    small: "/art/figure-tongtian-small.webp",
    name: "通天",
    alt: "赤黑衣的通天，一手仍开着门，身后是血海",
  },
};

const PLACE_ART: Record<string, ArtKey> = {
  chaos: "chaos",
  edge: "edge",
  earth: "earth",
  zixiao: "palace",
  "thirty-three": "heavens",
  kunlun: "kunlun",
  bloodsea: "bloodsea",
  buzhou: "buzhou",
  east: "east",
  wahuan: "nuwa",
  youming: "youming",
  penglai: "penglai",
  tribes: "tribes",
  board: "fengshen",
};
const SCENE_ART: Partial<Record<string, ArtKey>> = {
  collapse: "calamity",
  "end-wu": "calamity",
  war: "war",
  mend: "nuwa",
  clay: "clay",
  "end-dao": "palace",
  "end-hidden": "penglai",
  cleave: "chaos",
};
const SCENE_WITNESS: Partial<Record<string, WitnessKey>> = {
  cleave: "pangu",
  lecture: "hongjun",
  road: "hongjun",
  witch: "witch",
  yaoting: "dijun",
  "end-yao": "dijun",
  kunlun: "yuanshi",
  bloodsea: "tongtian",
};
export function artForPlace(place: string) {
  return ART[PLACE_ART[place] ?? "mountain"];
}
export function artForScene(scene: Scene) {
  const key = SCENE_ART[scene.id];
  return key ? ART[key] : artForPlace(scene.place);
}
export function witnessForScene(scene: Scene) {
  const key = SCENE_WITNESS[scene.id];
  return key ? WITNESS[key] : null;
}
export function moodForScene(scene: Scene): SceneMood {
  if (["collapse", "war"].includes(scene.id)) return "calamity";
  if (scene.ending || scene.place === "youming" || scene.place === "edge") return "still";
  if (["wahuan", "tribes", "bloodsea"].includes(scene.place)) return "embers";
  if (["east", "penglai"].includes(scene.place)) return "tide";
  if (scene.id === "cleave" || scene.place === "zixiao") return "radiance";
  return "mist";
}
