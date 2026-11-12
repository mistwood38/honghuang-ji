import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useSave } from "@/lib/honghuang/store";
import { PEOPLE, routeTo } from "@/lib/honghuang/roam/local-world";
import { GOODS, ROAM_PLACES } from "@/lib/honghuang/roam/catalog";
import { wayfarerScene, type TalkTopic } from "@/lib/honghuang/roam/wayfarer-dialogue";
import type { RoamAct, RoamReport } from "@/lib/honghuang/roam/state";
import { ActionButton } from "./action-button";
import { ActionOutcome } from "./action-outcome";
import { EncounterArt } from "./encounter-art";
import { focusReadingTarget } from "./reading-focus";

const TITLES: Record<string, string> = {
  qingxing: "青衣负药 · 以草木照看伤处",
  wuwei: "循潮负盐 · 知道另一条路",
  pansheng: "负石补山 · 肩上仍有人间",
  axin: "携火远行 · 不让今夜冷下去",
};
const TOPICS: { id: TalkTopic; label: string }[] = [
  { id: "road", label: "问沿途" },
  { id: "past", label: "谈往事" },
  { id: "promise", label: "说牵挂" },
];

export function WayfarerCard({
  person,
  actions,
  report,
  onAct,
}: {
  person: (typeof PEOPLE)[number];
  actions: ReactNode;
  report?: RoamReport;
  onAct: (action: RoamAct) => void;
}) {
  const save = useSave(),
    world = save.world!;
  const actor = world.living.people[person.id]!;
  const errand = world.living.errands[person.id];
  const here = actor.place === world.place;
  const destination = errand?.stage === "carrying" ? errand.destination : actor.place;
  const path = routeTo(world, destination);
  const [topic, setTopic] = useState<TalkTopic>("road");
  const dialogue = useRef<HTMLDivElement>(null);
  const dialogueId = useId();
  const scene = here && actor.met ? wayfarerScene(save, person.id, topic) : null;
  const conversation = report?.title === person.name;
  useEffect(() => {
    if (report?.title === person.name) {
      setTopic("road");
      focusReadingTarget(dialogue.current);
    }
  }, [report, person.name]);
  function readTopic(next: TalkTopic) {
    setTopic(next);
    requestAnimationFrame(() => focusReadingTarget(dialogue.current));
  }
  return (
    <article
      className={`local-person wayfarer-card${here ? " is-present" : " is-away"}`}
      aria-label={person.name}
    >
      <div className="wayfarer-stage">
        <div className="wayfarer-portrait">
          <EncounterArt kind="person" id={person.id} />
        </div>
        <div className="wayfarer-nameplate">
          <p className="eyebrow">{here ? "山河相逢" : "故人行迹"}</p>
          <h4>{person.name}</h4>
          <p>{TITLES[person.id]}</p>
        </div>
        <span className="wayfarer-seal" aria-hidden="true">
          {here ? "逢" : "行"}
        </span>
      </div>
      <div className="wayfarer-content">
        <div className="wayfarer-location">
          <span>
            {here ? "此刻与你同在" : "行踪"} · {ROAM_PLACES[actor.place].name}
          </span>
          <span>第 {actor.nextMove} 日再启程</span>
        </div>
        {scene ? (
          <>
            <div className="wayfarer-topics" role="group" aria-label={`与${person.name}闲谈`}>
              {TOPICS.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  aria-pressed={topic === item.id}
                  aria-controls={dialogueId}
                  onClick={() => readTopic(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div
              className="wayfarer-dialogue"
              ref={dialogue}
              tabIndex={-1}
              id={dialogueId}
              role="region"
              aria-label={`${person.name}对话`}
            >
              <p className="eyebrow">
                {person.name} · {scene.title}
              </p>
              <div key={topic} className="wayfarer-spoken">
                {(conversation && topic === "road" ? report.paragraphs : scene.paragraphs).map(
                  (line, i) => (
                    <p key={i}>{line}</p>
                  ),
                )}
              </div>
              {scene.memory ? <p className="wayfarer-memory">{scene.memory}</p> : null}
            </div>
          </>
        ) : (
          <p className="wayfarer-arrival">
            {here ? person.greeting : `${person.name}仍在路上。${person.goal}。`}
          </p>
        )}
        {errand ? (
          <p className="local-errand">
            {errand.stage === "carrying"
              ? `待送达：${ROAM_PLACES[errand.destination].name} · 需 2 ${GOODS[person.good]}。`
              : errand.stage === "delivered"
                ? `物资已送达，带回信找${person.name}复命。`
                : `已完成 ${errand.count} 次托付。${world.day < errand.completed + 4 ? `第 ${errand.completed + 4} 日后可再问近况。` : "重逢时可以再问近况。"}`}
          </p>
        ) : null}
        {report && !conversation ? <ActionOutcome report={report} label="此地行动结果" /> : null}
        {actions}
        {path[0] ? (
          <div className="local-actions">
            <ActionButton
              label={`循路往${ROAM_PLACES[destination].name}`}
              hint={`下一程：${ROAM_PLACES[path[0]].name} · 正常行路，可能遇险`}
              emblem="cloud"
              onClick={() => onAct({ type: "travel", place: path[0]! })}
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}
