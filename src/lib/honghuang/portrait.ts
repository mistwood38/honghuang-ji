import type { Origin } from "./types";

/** Anonymous symbolic forms, selected from existing roots; never part of save data. */
export function portraitForOrigin(origin: Origin | null) {
  const key =
    origin === "wu" || origin === "yao" || origin === "ren" ? `origin-${origin}` : "pilgrim";
  return {
    src: `/art/${key}.webp`,
    small: `/art/${key}-small.webp`,
    alt:
      origin === "wu"
        ? "承天之力的无名巫骨灵识，沉稳立于古岩"
        : origin === "yao"
          ? "羽衣与灵气交织的无名妖形，面容藏于幽光"
          : origin === "ren"
            ? "无名人愿灵识在苍茫山野护住一簇火"
            : "青衣道胎灵识立于云气之间，面容藏于天地之中",
  };
}
