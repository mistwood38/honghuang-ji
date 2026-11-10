import type { Origin } from "@/lib/honghuang/types";
import type { ActionEmblem } from "./action-button";

// Depicts the stated action, never its reward, success chance or ending.
const EMBLEMS: Record<Origin, Record<string, ActionEmblem>> = {
  dao: {
    names: "scroll",
    breath: "lotus",
    measure: "mountain",
    listen: "cloud",
    return: "scroll",
    free: "cloud",
    order: "scroll",
    wander: "cloud",
    hold: "mountain",
    carry: "cloud",
    open: "scroll",
    keeper: "mountain",
  },
  wu: {
    shoulder: "mountain",
    road: "cloud",
    banks: "cloud",
    teach: "scroll",
    names: "scroll",
    rest: "lotus",
    stand: "mountain",
    bridge: "cloud",
    brace: "mountain",
    break: "sword",
    mountain: "mountain",
  },
  yao: {
    true: "scroll",
    shadow: "cloud",
    route: "cloud",
    signal: "censer",
    meal: "censer",
    pledge: "scroll",
    court: "scroll",
    free: "cloud",
    witness: "scroll",
    burn: "censer",
    sea: "cloud",
    sun: "scroll",
  },
  ren: {
    shift: "scroll",
    stay: "censer",
    wide: "mountain",
    craft: "scroll",
    ground: "mountain",
    hands: "lotus",
    council: "scroll",
    vow: "censer",
    circle: "mountain",
    seed: "censer",
    many: "cloud",
    hearth: "censer",
  },
};

export function lineageChoiceEmblem(origin: Origin, choice?: string): ActionEmblem {
  const known = EMBLEMS[origin];
  return choice && Object.hasOwn(known, choice) ? known[choice]! : "scroll";
}
