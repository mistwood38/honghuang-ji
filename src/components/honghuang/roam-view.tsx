import { useEffect, useRef, useState } from "react";
import { storyScrollTop } from "@/lib/honghuang/music";
import { useSave } from "@/lib/honghuang/store";
import { realmOf, nextRealm } from "@/lib/honghuang/world";
import { artForPlace, type SceneMood } from "@/lib/honghuang/visuals";
import { ORIGINS } from "@/lib/honghuang/world";
import {
  ARTS,
  CHAINS,
  eraName,
  farmChoices,
  farmOutlook,
  layerName,
  GOODS,
  menuActs,
  ROAM_PLACES,
  SECTS,
  visibleChoices,
} from "@/lib/honghuang/roam/engine";
import { eventById } from "@/lib/honghuang/roam/events";
import { BATTLE_PLANS } from "@/lib/honghuang/roam/battle-plans";
import { HERITAGES, PEOPLE } from "@/lib/honghuang/roam/local-world";
import { preparedTechniques, TECHNIQUES } from "@/lib/honghuang/roam/techniques";
import type { Origin } from "@/lib/honghuang/types";
import type { BattlePlan, PlaceId, RoamAct } from "@/lib/honghuang/roam/state";
import { Artwork, Atmosphere } from "./art";
import { ActionButton } from "./action-button";
import { LineageView } from "./lineage-view";
import { WorldAffairs } from "./world-affairs";
import { LINEAGES, trialProof } from "@/lib/honghuang/roam/lineages";
import { LocalWorld } from "./local-world";
import { CultivationLibrary } from "./cultivation-library";
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
  const phase = world?.phase;
  const retreat = Boolean(world?.retreat);
  const idleKind = world?.idle?.kind;
  const [sheet, setSheet] = useState<"move" | "make" | "sect" | null>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (phase !== "free" || retreat || idleKind !== "wander") return;
    const tick = () => {
      if (document.visibilityState === "hidden") return;
      roam({ type: "idle", what: "fight" });
    };
    tick();
    const timer = window.setInterval(tick, 2500);
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [roam, phase, retreat, idleKind]);

  function revealResult() {
    const target = document.getElementById("roam-now");
    if (!target) return;
    const header = document.querySelector(".game-header")?.getBoundingClientRect().height ?? 0;
    window.scrollTo({ top: storyScrollTop(target.getBoundingClientRect().top, window.scrollY, header), behavior: "auto" });
    target.focus({ preventScroll: true });
  }

  if (!world) return null;

  function act(action: Parameters<typeof roam>[0]) {
    setSheet(null);
    const battleActions = document.querySelector(".roam-battle .roam-actions");
    const previousTop = battleActions?.getBoundingClientRect().top;
    const oldPhase = useSave.getState().world?.phase;
    roam(action);
    requestAnimationFrame(() => {
      if (useSave.getState().screen !== "play") return;
      const nextWorld = useSave.getState().world;
      if (action.type === "combat" && nextWorld?.phase === "battle" && previousTop !== undefined) {
        const top = document.querySelector(".roam-battle .roam-actions")?.getBoundingClientRect().top;
        if (top !== undefined) window.scrollBy({ top: top - previousTop, behavior: "instant" });
      } else if (oldPhase !== nextWorld?.phase || action.type === "travel" || action.type === "choose") {
        // Navigation follows an explicit player action; idle ticks never enter here.
        revealResult();
      }
    });
  }

  const place = ROAM_PLACES[world.place];
  const era = eraName(world);
  const realm = realmOf(save.stats.dao);
  const art = artForPlace(world.place);
  const event = world.eventId ? eventById(world.eventId) : null;
  const techniques = preparedTechniques(world);
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
              {world.idle ? ` · ${world.idle.kind === "sit" ? "打坐挂机中" : "游历挂机中"}` : ""}
            </p>
          </div>
        </div>

        {world.phase === "origin" ? (
          <OriginGate draft={draft} setDraft={setDraft} onPick={(origin, name) => act({ type: "origin", origin, name })} />
        ) : null}

        {world.phase !== "origin" ? (
          <div className="roam-body" id="roam-now" tabIndex={-1}>
            <div className="copy roam-prose" aria-label={world.phase === "free" ? "行动结果" : undefined}>
              <button type="button" className="roam-readback" onClick={revealResult}>回看行记 ↑</button>
              <p className="roam-section-label">{world.phase === "event" ? "路逢 · 此刻" : world.phase === "battle" ? "斗法 · 临阵" : "行记 · 已然"}</p>
              <h2>{world.report?.title ?? place.name}</h2>
              {(world.report?.paragraphs ?? place.intro).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {world.report && world.report.changes.length > 0 && world.phase === "free" ? (
              <div className="roam-after" aria-label="已经发生的变化">
                <p><span className="choice-result-seal">已落印</span>已然</p>
                <ul>
                  {world.report.changes.map((change) => (
                    <li key={change}>{change}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {world.phase === "free" && !world.retreat ? <FarmDesk onAct={act} /> : null}

            {world.phase === "event" && event ? (
              <div className="choice-list">
                <h2>此刻</h2>
                {visibleChoices(world, event).map((choice, index) => (
                  <ActionButton label={choice.text} surface="plaque" key={choice.id} className="choice" onClick={() => act({ type: "choose", choiceId: choice.id })}>
                    <span className="choice-number">{index + 1}</span>
                    <span className="choice-copy">
                      <span className="block font-serif text-lg leading-snug">{choice.text}</span>
                    </span>
                  </ActionButton>
                ))}
              </div>
            ) : null}

            {world.phase === "battle" && world.battle ? (
              <div className="roam-battle">
                <p className="eyebrow">{world.battle.name}</p>
                <p className="battle-vitals">道躯 {save.stats.life} / 100 · 灵气 {Math.floor(world.lingqi)} · 第 {world.battle.round} 回合</p>
                <div className="roam-hp" aria-hidden="true">
                  <span style={{ width: `${Math.max(6, (world.battle.hp / world.battle.max) * 100)}%` }} />
                </div>
                <div className="copy">
                  {world.battle.log.slice(-4).map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
                <div className="roam-actions">
                  <ActionButton label="攻" hint="普通攻势" action={{ type: "combat", move: "strike" }} onClick={() => act({ type: "combat", move: "strike" })} />
                  <ActionButton label="法" hint="耗 4 灵气" action={{ type: "combat", move: "spell" }} onClick={() => act({ type: "combat", move: "spell" })} />
                  <ActionButton label="守" hint="卸下还击" action={{ type: "combat", move: "guard" }} onClick={() => act({ type: "combat", move: "guard" })} />
                  <ActionButton label="脱身" hint="尝试离开" action={{ type: "combat", move: "flee" }} onClick={() => act({ type: "combat", move: "flee" })} />
                  {techniques.map((id) => {
                    const technique = TECHNIQUES[id]!;
                    return <ActionButton key={id} label={`${technique.name} · ${technique.cost} 灵气`} action={{ type: "combat", move: "technique", artId: id }} surface="plaque" className="technique-action" disabled={world.lingqi < technique.cost} onClick={() => act({ type: "combat", move: "technique", artId: id })} />;
                  })}
                </div>
                {techniques.map((id) => <p key={id} className="roam-risk"><strong>{TECHNIQUES[id]!.name}：</strong>{TECHNIQUES[id]!.detail}</p>)}
              </div>
            ) : null}

            {world.phase === "free" && world.retreat ? (
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
          {world.idle ? <li>{world.idle.kind === "sit" ? "打坐挂机" : "游历挂机"} · 离开也算</li> : null}
          {(world.haul?.breaths ?? 0) > 0 ? <li>有一段修行可收</li> : null}
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

function FarmDesk({ onAct }: { onAct: (act: RoamAct) => void }) {
  const save = useSave();
  const world = save.world;
  const [tab, setTab] = useState<"farm" | "travel" | "arts" | "bag" | "beast" | "home" | "lineage" | "affairs">("farm");
  const tabs = useRef<HTMLDivElement>(null);
  function openTab(next: typeof tab) {
    setTab(next);
    // Only an explicit panel change navigates here; background ticks never do.
    requestAnimationFrame(() => {
      if (!tabs.current) return;
      const header = document.querySelector(".game-header")?.getBoundingClientRect().height ?? 0;
      window.scrollTo({ top: storyScrollTop(tabs.current.getBoundingClientRect().top, window.scrollY, header), behavior: "auto" });
    });
  }
  if (!world) return null;
  const realm = realmOf(save.stats.dao);
  const next = nextRealm(save.stats.dao);
  const maps = farmChoices(save);
  const acts = menuActs(save);

  return (
    <div className="farm-desk">
      <div className="farm-head">
        <p className="farm-realm">
          {realm.name} · {layerName(world.layer)}
          {next ? ` · 大关 ${next.name}` : ""}
        </p>
        <div className="farm-bar" aria-label="修为">
          <span style={{ width: `${Math.max(4, Math.min(100, world.xiuwei))}%` }} />
        </div>
        <p className="farm-bar-note">
          {world.xiuwei >= 100 ? (world.layer >= 9 ? "大关已满，可以破境" : "这一层已满，可以突破") : world.idle ? (world.idle.kind === "sit" ? "打坐挂机中" : "挂机中，修为条自己在涨") : "挂机已停止，可自行修炼或游历"}
          {world.gear > 0 ? ` · 护身 ${world.gear} 档` : ""}
        </p>
      </div>
      <div className="roam-tabs" ref={tabs}>
        {(
          [
            ["farm", "修行"],
            ["travel", "游历"],
            ["arts", "功法"],
            ["bag", "储物"],
            ["beast", "灵兽"],
            ["home", "洞府"],
            ["lineage", "族脉"],
            ["affairs", "世局"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" aria-pressed={tab === id} className={tab === id ? "is-on" : ""} onClick={() => openTab(id)}>
            {label}
          </button>
        ))}
      </div>
      {tab === "lineage" ? (
        <LineageView
          onAct={onAct}
          onExplore={() => openTab("travel")}
          onAffairs={() => openTab("affairs")}
          onPractice={() => openTab("farm")}
        />
      ) : null}
      {tab === "affairs" ? <WorldAffairs onAct={onAct} /> : null}
      {tab === "farm" &&
      save.origin &&
      world.lineages[save.origin]?.stage === 4 &&
      world.karma.includes(trialProof(save.origin)) ? (
        <ActionButton label="回看族脉后续" emblem="scroll" onClick={() => openTab("lineage")} />
      ) : null}
      {tab === "farm" ? (
        <>
          <div className="roam-actions">
            {world.xiuwei >= 100 ? (
              <ActionButton label={world.layer >= 9 ? "破开大境界" : "突破这一层"} surface="plaque" className="farm-break" onClick={() => onAct({ type: "breakthrough", pill: false })} />
            ) : (
              <ActionButton label="火候未满" hint="修为充盈时，可尝试破境" surface="plaque" className="farm-break" disabled />
            )}
            <ActionButton label={world.riftLeft > 0 ? `闯秘境 · 还剩 ${world.riftLeft} 次` : "秘境今日已尽"} emblem="sword" disabled={world.riftLeft <= 0} onClick={() => onAct({ type: "idle", what: "rift" })} />
            {(world.bag["pill-break"] ?? 0) > 0 && world.xiuwei >= 100 ? (
              <ActionButton label="服丹突破" action={{ type: "breakthrough", pill: true }} onClick={() => onAct({ type: "breakthrough", pill: true })} />
            ) : null}
            {(world.haul?.breaths ?? 0) > 0 ? (
              <ActionButton label="收起离线收获" action={{ type: "idle", what: "claim" }} onClick={() => onAct({ type: "idle", what: "claim" })} />
            ) : null}
            <ActionButton label="撞一场奇遇" action={{ type: "explore" }} onClick={() => onAct({ type: "explore" })} />
            <ActionButton label="调息" action={{ type: "rest" }} onClick={() => onAct({ type: "rest" })} />
            <ActionButton label="入定" action={{ type: "retreat", what: "enter" }} onClick={() => onAct({ type: "retreat", what: "enter" })} />
            {acts
              .filter((item) => ["cultivate", "gather", "idle-sit", "idle-stop"].includes(item.id) || (!world.idle && item.id === "idle-wander"))
              .map((item) => (
                <ActionButton key={item.id} label={item.label} action={item.act} onClick={() => onAct(item.act)} />
              ))}
          </div>
          <details className="farm-idle-panel"><summary>挂机行记 <span>{world.idle ? "正在修行" : "已停下"} · 展开查看</span></summary>
          <fieldset className="battle-plans">
            <legend>临阵之策</legend>
            <div className="battle-plan-options">
              {(Object.keys(BATTLE_PLANS) as BattlePlan[]).map((plan) => <ActionButton key={plan}
                label={BATTLE_PLANS[plan].name} emblem={plan === "assault" ? "sword" : plan === "reserve" ? "lotus" : "mountain"}
                aria-pressed={world.battlePlan === plan}
                onClick={() => onAct({ type: "battle-plan", plan })} />)}
            </div>
            <p>{BATTLE_PLANS[world.battlePlan].detail}道躯低于 35 时自动调息一轮；可随时停下挂机。</p>
          </fieldset>
          <p className="farm-map-label">挂机地点 · {ROAM_PLACES[world.farm ?? world.place].name}</p>
          <div className="farm-maps">
            {maps.map((place) => (
              <ActionButton
                label={ROAM_PLACES[place].name}
                surface="bare"
                key={place}
                aria-pressed={place === (world.farm ?? world.place)}
                className={place === (world.farm ?? world.place) ? "is-on" : ""}
                onClick={() => onAct({ type: "idle", what: "farm", place })}
              >
                <img className="farm-map-art" src={artForPlace(place).small} alt="" width="52" height="72" loading="lazy" />
                <span><strong>{ROAM_PLACES[place].name}</strong><small>{farmOutlook(save, place)}</small></span>
              </ActionButton>
            ))}
          </div>
          <p className="farm-map-label">战报 · 主辅招式与手动斗法共用规则</p>
          <ol className="farm-log">
            {(world.farmLog.length ? world.farmLog : ["挂机还没打出第一场。"]).map((line, index) => (
              <li key={`${index}-${line}`}>{line}</li>
            ))}
          </ol>
          </details>
        </>
      ) : null}
      {tab === "arts" ? <CultivationLibrary onAct={onAct} onStudy={() => openTab("home")} /> : null}
      {tab === "travel" ? (
        <section className="travel-atlas" aria-label="可游历地点">
          <LocalWorld onAct={onAct} />
          <div className="travel-heading"><p className="eyebrow">足下有路 · 天地无涯</p><h2>往何处去</h2><p>行路会暂歇挂机。越过险地之前，先看清山势。</p></div>
          <div className="travel-cards">
            {acts.filter((item) => item.act.type === "travel").map((item) => {
              if (item.act.type !== "travel") return null;
              const place = ROAM_PLACES[item.act.place];
              return <ActionButton key={item.id} label={item.label} surface="bare" className="travel-card" onClick={() => onAct(item.act)}>
                <img src={artForPlace(place.id).small} alt="" loading="lazy" width="640" height="360" />
                <span className="travel-card-copy"><span className="travel-danger">{place.danger >= 4 ? "险地" : place.danger >= 2 ? "须谨慎" : "风平"} · 灵气 {place.spirit}</span><strong>{place.name}</strong><span>{place.intro[0]}</span><span className="travel-go">前往此地 →</span></span>
              </ActionButton>;
            })}
          </div>
        </section>
      ) : null}
      {tab === "bag" ? (
        <div className="roam-actions">
          {acts
            .filter((item) => item.id.startsWith("alchemy") || item.id.startsWith("use-") || item.id.startsWith("buy") || item.id.startsWith("sell") || item.id.startsWith("plot"))
            .map((item) => (
              <ActionButton key={item.id} label={item.label} action={item.act} onClick={() => onAct(item.act)} />
            ))}
          {Object.entries(world.bag).length === 0 ? <p className="roam-empty">储物是空的。挂机打怪会掉材料。</p> : null}
        </div>
      ) : null}
      {tab === "beast" ? (
        <div className="roam-actions">
          {world.beast ? <p className="farm-map-label">{world.beast.name}{world.beast.bond >= 36 ? " · 相熟" : " · 还在认你"}</p> : <p className="roam-empty">还没有灵兽。奇遇里遇见了，可以留下。</p>}
          {acts
            .filter((item) => item.id === "feed" || item.id === "train" || item.id === "release")
            .map((item) => (
              <ActionButton key={item.id} label={item.label} action={item.act} onClick={() => onAct(item.act)} />
            ))}
        </div>
      ) : null}
      {tab === "home" ? (
        <div className="roam-actions">
          {acts
            .filter((item) => item.id.startsWith("cave") || item.id === "join" || item.id === "task" || item.id === "learn" || item.id === "leave" || item.id.startsWith("chain-") || item.id.startsWith("notice-"))
            .map((item) => (
              <ActionButton key={item.id} label={item.label} action={item.act} onClick={() => onAct(item.act)} />
            ))}
          <p className="roam-empty">{world.cave > 0 ? "洞府已经立住。" : "还没有自己的洞府。石头够了就可以经营。"}</p>
        </div>
      ) : null}
    </div>
  );
}

function continuing(world: NonNullable<ReturnType<typeof useSave.getState>["world"]>) {
  const stories = CHAINS.filter((chain) => world.quests[chain.id]?.status === "active").map(
    (chain) => chain.name,
  );
  const errands = PEOPLE.flatMap((person) => {
    const task = world.living.errands[person.id];
    return task && task.stage !== "done"
      ? [`${person.name}所托${task.stage === "delivered" ? "（待复命）" : "（待送达）"}`]
      : [];
  });
  const paths = Object.entries(world.lineages).flatMap(([origin, path]) =>
    path && !path.ending ? [`${LINEAGES[origin as Origin].name}（第 ${path.stage + 1} 章）`] : [],
  );
  return [...stories, ...errands, ...paths].join("、");
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
          <ActionButton key={origin} label={ORIGINS[origin].name} surface="plaque" onClick={() => onPick(origin, draft)}>
            <span>
            <strong>{ORIGINS[origin].name}</strong>
            <span>{ORIGINS[origin].line}</span><small>{HERITAGES[origin].name} · 探索解法：{HERITAGES[origin].action}</small>
            </span>
          </ActionButton>
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
    ["cultivate", "retreat-enter", "retreat-watch", "retreat-leave", "explore", "gather", "rest", "break", "break-pill", "idle-sit", "idle-wander", "idle-stop", "idle-claim"].includes(item.id),
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
          <ActionButton key={item.id} label={item.label} action={item.act} onClick={() => onAct(item.act)} />
        ))}
        {shown.length === 0 ? <p className="roam-empty">这里暂时没有这一类事。</p> : null}
      </div>
    </div>
  );
}
