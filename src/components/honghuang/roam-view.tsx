import { useEffect, useState } from "react";
import { storyScrollTop } from "@/lib/honghuang/music";
import { useSave } from "@/lib/honghuang/store";
import { realmOf } from "@/lib/honghuang/world";
import { artForPlace, type SceneMood } from "@/lib/honghuang/visuals";
import { ORIGINS } from "@/lib/honghuang/world";
import {
  ARTS,
  CHAINS,
  eraName,
  GOODS,
  menuActs,
  ROAM_PLACES,
  SECTS,
  visibleChoices,
} from "@/lib/honghuang/roam/engine";
import { eventById } from "@/lib/honghuang/roam/events";
import type { Origin } from "@/lib/honghuang/types";
import type { PlaceId, RoamAct } from "@/lib/honghuang/roam/state";
import { Artwork, Atmosphere } from "./art";
import "./roam.css";

function moodForPlace(place: PlaceId): SceneMood {
  if (place === "bloodsea" || place === "buzhou" || place === "board") return "calamity";
  if (place === "youming" || place === "edge" || place === "chaos") return "still";
  if (place === "east" || place === "penglai") return "tide";
  if (place === "wahuan" || place === "tribes") return "embers";
  if (place === "zixiao") return "radiance";
  return "mist";
}

export function RoamView() {
  const save = useSave();
  const roam = useSave((state) => state.roam);
  const world = save.world;
  const [sheet, setSheet] = useState<"move" | "make" | "sect" | null>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const target = document.getElementById("roam-now");
    if (!target) return;
    const header = document.querySelector(".game-header");
    const offset = header?.getBoundingClientRect().height ?? 0;
    const top = storyScrollTop(target.getBoundingClientRect().top, window.scrollY, offset);
    window.scrollTo({ top, behavior: "auto" });
  }, [world?.day, world?.eventId, world?.phase, world?.battle?.round, world?.report?.title]);

  if (!world) return null;

  function act(action: Parameters<typeof roam>[0]) {
    setSheet(null);
    roam(action);
  }

  const place = ROAM_PLACES[world.place];
  const era = eraName(world);
  const realm = realmOf(save.stats.dao);
  const art = artForPlace(world.place);
  const event = world.eventId ? eventById(world.eventId) : null;
  const xiuLabel = world.xiuwei >= 100 ? "火候已至" : world.xiuwei >= 60 ? "将满" : world.xiuwei >= 25 ? "半途" : "初凝";

  return (
    <section id="roam-top" className="page-wrap roam-page">
      <article className={`roam-stage scene-${moodForPlace(world.place)}`}>
        <div className="scene-hero roam-hero">
          <Artwork art={art} eager decorative />
          <Atmosphere mood={moodForPlace(world.place)} />
          <div className="scene-hero-shade" aria-hidden="true" />
          <div className="scene-caption">
            <p className="eyebrow">
              {era.name} <span>/</span> 第 {world.day} 日
            </p>
            <h1>{place.name}</h1>
            <p className="roam-realm">
              {save.name || "未名"} · {realm.name} · 修为{xiuLabel}
            </p>
          </div>
        </div>

        {world.phase === "origin" ? (
          <OriginGate draft={draft} setDraft={setDraft} onPick={(origin, name) => act({ type: "origin", origin, name })} />
        ) : null}

        {world.phase !== "origin" ? (
          <div className="roam-body" id="roam-now">
            <div className="copy roam-prose">
              <h2>{world.report?.title ?? place.name}</h2>
              {(world.report?.paragraphs ?? place.intro).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {world.report && world.report.changes.length > 0 && world.phase === "free" ? (
              <div className="roam-after" aria-label="已经发生的变化">
                <p>已然</p>
                <ul>
                  {world.report.changes.map((change) => (
                    <li key={change}>{change}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {world.phase === "event" && event ? (
              <div className="choice-list">
                <h2>此刻</h2>
                {visibleChoices(world, event).map((choice, index) => (
                  <button key={choice.id} type="button" className="choice" onClick={() => act({ type: "choose", choiceId: choice.id })}>
                    <span className="choice-number">{index + 1}</span>
                    <span className="choice-copy">
                      <span className="block font-serif text-lg leading-snug">{choice.text}</span>
                    </span>
                  </button>
                ))}
              </div>
            ) : null}

            {world.phase === "battle" && world.battle ? (
              <div className="roam-battle">
                <p className="eyebrow">{world.battle.name}</p>
                <div className="roam-hp" aria-hidden="true">
                  <span style={{ width: `${Math.max(6, (world.battle.hp / world.battle.max) * 100)}%` }} />
                </div>
                <div className="copy">
                  {world.battle.log.slice(-4).map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
                <div className="roam-actions">
                  <button type="button" onClick={() => act({ type: "combat", move: "strike" })}>攻</button>
                  <button type="button" onClick={() => act({ type: "combat", move: "spell" })}>法</button>
                  <button type="button" onClick={() => act({ type: "combat", move: "guard" })}>守</button>
                  <button type="button" onClick={() => act({ type: "combat", move: "flee" })}>脱身</button>
                </div>
              </div>
            ) : null}

            {world.phase === "free" ? (
              <FreeActions
                sheet={sheet}
                setSheet={setSheet}
                onAct={(action) => act(action)}
                risk={
                  world.wound >= 3
                    ? "你身上的伤还在响。这一关不会因为心急就变轻。"
                    : "火候若已到，就只剩你自己撑不撑得开那道缝。"
                }
              />
            ) : null}
          </div>
        ) : null}
      </article>
      <aside className="roam-side">
        <p className="eyebrow">行囊</p>
        <ul>
          <li>灵气 {world.lingqi < 8 ? "枯竭" : world.lingqi < 24 ? "寻常" : "充沛"}</li>
          <li>伤势 {world.wound === 0 ? "无" : world.wound < 3 ? "未愈" : "沉重"}</li>
          <li>灵石 {world.stones}</li>
          {world.equipped ? <li>功法 {ARTS[world.equipped]?.name}</li> : null}
          {world.sect ? <li>{SECTS.find((sect) => sect.id === world.sect)?.name} · {SECTS.find((sect) => sect.id === world.sect)?.rank[world.sectRank]}</li> : <li>散修</li>}
          {world.beast ? <li>{world.beast.name}{world.beast.bond >= 36 ? " · 相熟" : ""}</li> : null}
          {world.retreat ? <li>定中 · 时辰未完</li> : null}
          {world.plot ? <li>{world.day >= world.plot.ready ? "药圃可采" : "药圃未成"}</li> : null}
          {Object.entries(world.bag).map(([id, count]) => (
            <li key={id}>{GOODS[id as keyof typeof GOODS]} {count}</li>
          ))}
        </ul>
        {continuing(world) ? (
          <p className="roam-quests">未完之事：{continuing(world)}</p>
        ) : (
          <p className="roam-quests">此刻没有必须去做的事。</p>
        )}
      </aside>
    </section>
  );
}

function continuing(world: NonNullable<ReturnType<typeof useSave.getState>["world"]>) {
  return CHAINS.filter((chain) => world.quests[chain.id]?.status === "active")
    .map((chain) => chain.name)
    .join("、");
}

function OriginGate({
  draft,
  setDraft,
  onPick,
}: {
  draft: string;
  setDraft: (value: string) => void;
  onPick: (origin: Origin, name: string) => void;
}) {
  return (
    <div className="roam-body">
      <div className="copy">
        <h2>你是哪一种不肯散</h2>
        <p>没有人会把后果先写在选项旁边。根骨只说明你起初怎么呼吸，不说明你死在哪一边。</p>
      </div>
      <label className="roam-name">
        称呼
        <input value={draft} maxLength={8} placeholder="可留空，日后能改" onChange={(event) => setDraft(event.target.value)} />
      </label>
      <div className="roam-origins">
        {(Object.keys(ORIGINS) as Origin[]).map((origin) => (
          <button key={origin} type="button" onClick={() => onPick(origin, draft)}>
            <strong>{ORIGINS[origin].name}</strong>
            <span>{ORIGINS[origin].line}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function FreeActions({
  sheet,
  setSheet,
  onAct,
  risk,
}: {
  sheet: "move" | "make" | "sect" | null;
  setSheet: (value: "move" | "make" | "sect" | null) => void;
  onAct: (act: RoamAct) => void;
  risk: string;
}) {
  const save = useSave();
  const acts = menuActs(save);
  const primary = acts.filter((item) =>
    ["cultivate", "retreat-enter", "retreat-watch", "retreat-leave", "explore", "gather", "rest", "break", "break-pill"].includes(item.id),
  );
  const moves = acts.filter((item) => item.id.startsWith("go-") || item.id.startsWith("notice-") || item.id.startsWith("chain-"));
  const make = acts.filter(
    (item) =>
      item.id.startsWith("alchemy") ||
      item.id.startsWith("use-") ||
      item.id.startsWith("cave") ||
      item.id.startsWith("buy") ||
      item.id.startsWith("sell") ||
      item.id.startsWith("plot") ||
      item.id === "feed" ||
      item.id === "train" ||
      item.id === "release",
  );
  const sect = acts.filter((item) => ["join", "task", "learn", "leave"].includes(item.id));
  const shown = sheet === "move" ? moves : sheet === "make" ? make : sheet === "sect" ? sect : primary;

  return (
    <div className="roam-free">
      {sheet === null && save.world?.retreat ? <p className="roam-risk">你还在定中。时辰走完或你自己起身之前，山河先不放你。</p> : null}
      {sheet === null && save.world && !save.world.retreat && save.world.xiuwei >= 100 ? <p className="roam-risk">{risk}</p> : null}
      <div className="roam-tabs">
        <button type="button" className={sheet === null ? "is-on" : ""} onClick={() => setSheet(null)}>日课</button>
        <button type="button" className={sheet === "move" ? "is-on" : ""} onClick={() => setSheet("move")}>山河</button>
        <button type="button" className={sheet === "make" ? "is-on" : ""} onClick={() => setSheet("make")}>营生</button>
        <button type="button" className={sheet === "sect" ? "is-on" : ""} onClick={() => setSheet("sect")}>人事</button>
      </div>
      <div className="roam-actions">
        {shown.map((item) => (
          <button key={item.id} type="button" onClick={() => onAct(item.act)}>
            {item.label}
          </button>
        ))}
        {shown.length === 0 ? <p className="roam-empty">这里暂时没有这一类事。</p> : null}
      </div>
    </div>
  );
}
