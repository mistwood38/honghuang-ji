import { useSave } from "@/lib/honghuang/store";
import { GOODS, ROAM_PLACES } from "@/lib/honghuang/roam/catalog";
import {
  HERITAGES,
  PEOPLE,
  localOptions,
  regionCondition,
  routeTo,
  sitesAt,
  siteState,
  type LocalOption,
} from "@/lib/honghuang/roam/local-world";
import type { RoamAct } from "@/lib/honghuang/roam/state";
import { ActionButton } from "./action-button";
import "./local-world.css";

export function LocalWorld({ onAct }: { onAct: (action: RoamAct) => void }) {
  const save = useSave();
  const world = save.world;
  if (!world) return null;
  const options = localOptions(save);
  const localNews = world.living.news
    .filter((entry) => world.known.includes(entry.place))
    .slice(-6)
    .reverse();
  const actors = PEOPLE.filter(
    (p) =>
      world.living.people[p.id]?.met ||
      world.living.people[p.id]?.place === world.place ||
      world.living.errands[p.id],
  );
  function buttons(items: LocalOption[]) {
    return (
      <div className="local-actions">
        {items.map((option) => (
          <div key={JSON.stringify(option.act)}>
            <ActionButton
              label={option.label}
              hint={option.hint}
              emblem={
                option.act.type === "person"
                  ? "scroll"
                  : option.act.what === "gather"
                    ? "censer"
                    : option.act.what === "rest"
                      ? "lotus"
                      : "mountain"
              }
              disabled={option.disabled}
              onClick={() => onAct(option.act)}
            />
            {option.disabled && option.reason ? (
              <p className="local-cost">{option.reason}</p>
            ) : null}
          </div>
        ))}
      </div>
    );
  }
  return (
    <section className="local-world" aria-label="此地山河与来往之人">
      <header className="local-heading">
        <p className="eyebrow">境内 · 第 {world.day} 日</p>
        <h2>{ROAM_PLACES[world.place].name}，不止一条路</h2>
        <p>
          {regionCondition(world)}
          {save.origin ? ` · ${HERITAGES[save.origin].name}` : ""}
        </p>
        <p>走近一处，才知道能做什么。亲手修补、取用或送物，都会留下重访时看得见的痕迹。</p>
      </header>
      {world.report ? (
        <div className="local-result" role="status" aria-label="此地行动结果">
          <strong>{world.report.title}</strong>
          {world.report.paragraphs.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
          {world.report.changes.length ? (
            <ul>
              {world.report.changes.map((line, index) => (
                <li key={index}>{line}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      <div className="local-sites">
        {sitesAt(world.place).map((site, index) => {
          const state = siteState(world, site.id);
          const stateText = !state.visited
            ? "尚未走近"
            : state.state === "mending"
              ? "修补待稳"
              : state.state === "restored"
                ? "生息已接续"
                : state.state === "stripped"
                  ? "残材已取走"
                  : state.cooldown > world.day
                    ? "休养中"
                    : "已察看";
          return (
            <article key={site.id} className="local-site">
              <div className="local-site-title">
                <span
                  className={`action-emblem emblem-${site.kind === "source" ? "censer" : site.kind === "ruin" ? "mountain" : "lotus"}`}
                  aria-hidden="true"
                />
                <div>
                  <p className="eyebrow">
                    零{["一", "二", "三"][index]} ·{" "}
                    {site.kind === "source" ? "物产" : site.kind === "ruin" ? "遗迹" : "歇脚"}
                  </p>
                  <h3>{site.name}</h3>
                </div>
                <span className="local-state">{stateText}</span>
              </div>
              <p>{site.line}</p>
              {state.method ? (
                <p className="local-memory">
                  你曾在此{state.method}。
                  {state.state === "mending"
                    ? "让山水自己过上几日，再来看。"
                    : "这番照应仍留在地脉里。"}
                </p>
              ) : null}
              {state.state === "stripped" && state.cooldown > world.day ? (
                <p className="local-memory">第 {state.cooldown} 日后可再尝试修补。</p>
              ) : null}
              {buttons(
                options.filter(
                  (option) => option.act.type === "local" && option.act.site === site.id,
                ),
              )}
            </article>
          );
        })}
      </div>
      <section className="local-people" aria-label="来往之人与托付">
        <p className="eyebrow">来往之人 · 行踪与托付</p>
        <h3>相逢有后日</h3>
        <p>他们每六个游戏日启程，也会改道照看疲敝的地方。交谈不耗时；托付不设失约倒计时。</p>
        {!actors.length ? (
          <p className="roam-empty">此刻没有相识的人停在这里。继续走，或等山风换向。</p>
        ) : null}
        {actors.map((person) => {
          const actor = world.living.people[person.id]!;
          const errand = world.living.errands[person.id];
          const here = actor.place === world.place;
          const destination = errand?.stage === "carrying" ? errand.destination : actor.place;
          const path = routeTo(world, destination);
          return (
            <article className="local-person" key={person.id}>
              <div className="local-person-heading">
                <h4>{person.name}</h4>
                <span>{here ? "此刻在场" : ROAM_PLACES[actor.place].name}</span>
              </div>
              <p>
                {person.goal}。第 {actor.nextMove} 日再启程。
              </p>
              {errand ? (
                <p className="local-errand">
                  {errand.stage === "carrying"
                    ? `待送达：${ROAM_PLACES[errand.destination].name} · 需 2 ${GOODS[person.good]}。`
                    : errand.stage === "delivered"
                      ? `物资已送达，带回信找${person.name}复命。`
                      : `已完成 ${errand.count} 次托付。${world.day < errand.completed + 4 ? `第 ${errand.completed + 4} 日后可再问近况。` : "重逢时可以再问近况。"}`}
                </p>
              ) : null}
              {buttons(
                options.filter(
                  (option) => option.act.type === "person" && option.act.id === person.id,
                ),
              )}
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
            </article>
          );
        })}
      </section>
      {localNews.length ? (
        <details className="local-news">
          <summary>山河近闻 · {localNews.length}</summary>
          <ol>
            {localNews.map((entry, index) => (
              <li key={`${entry.day}-${index}`}>
                <span>
                  第 {entry.day} 日 · {ROAM_PLACES[entry.place].name}
                </span>
                <p>{entry.text}</p>
              </li>
            ))}
          </ol>
        </details>
      ) : null}
    </section>
  );
}
