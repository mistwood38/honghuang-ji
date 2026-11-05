import { useSave } from "@/lib/honghuang/store";
import { ARTS, SECTS } from "@/lib/honghuang/roam/catalog";
import { TECHNIQUES } from "@/lib/honghuang/roam/techniques";
import type { RoamAct } from "@/lib/honghuang/roam/state";

const COVERS: Record<string, string> = {
  qingjing: "kunlun",
  bone: "buzhou",
  form: "youming",
  hearth: "tribes",
  yuxu: "palace",
  zhuxian: "bloodsea",
  wuxue: "war",
  sunheart: "east",
  mudra: "nuwa",
};

export function CultivationLibrary({
  onAct,
  onStudy,
}: {
  onAct: (act: RoamAct) => void;
  onStudy: () => void;
}) {
  const world = useSave((save) => save.world);
  if (!world) return null;
  const learned = [...new Set(world.arts)].filter((id) => Object.hasOwn(ARTS, id));
  const sect = SECTS.find((sect) => sect.id === world.sect);
  return (
    <section className="cultivation-library" aria-label="功法藏卷">
      <div className="cultivation-hero">
        <picture>
          <source media="(max-width: 640px)" srcSet="/art/cultivation-sanctuary-small.webp" />
          <img
            src="/art/cultivation-sanctuary.webp"
            width="1200"
            height="800"
            loading="lazy"
            alt="苍青群山前，修士于古松石台静坐，玉光照见身旁古卷"
          />
        </picture>
        <div>
          <p className="eyebrow">识海藏卷 · 已悟 {learned.length} 部</p>
          <h2>一念择道</h2>
          <p>万法可学，此刻主修一途。</p>
        </div>
      </div>
      <p className="library-guidance">
        主修影响闭关、打坐与战斗攻势，并决定可施展的招式。闲时可自由转修，旧日所学仍然保留。
      </p>
      <div className="art-scrolls">
        {learned.map((id) => {
          const art = ARTS[id]!;
          const technique = TECHNIQUES[id];
          const selected = world.equipped === id;
          return (
            <article key={id} className={`art-scroll ${selected ? "is-equipped" : ""}`}>
              <div className="art-scroll-cover">
                <img
                  src={`/art/${COVERS[id]}-small.webp`}
                  alt=""
                  loading="lazy"
                  width="640"
                  height="360"
                />
                <span>{selected ? "主修" : "已悟"}</span>
                <h3>{art.name}</h3>
              </div>
              <div className="art-scroll-copy">
                <p>{art.line}</p>
                <dl className="art-measures">
                  <div>
                    <dt>修炼助益</dt>
                    <dd>+{art.xiu}</dd>
                  </div>
                  <div>
                    <dt>战斗攻势</dt>
                    <dd>+{art.combat}</dd>
                  </div>
                </dl>
                {technique ? (
                  <div className="art-technique">
                    <p>
                      <strong>{technique.name}</strong>
                      <span>耗 {technique.cost} 灵气</span>
                    </p>
                    <p>{technique.detail}</p>
                  </div>
                ) : null}
                <button
                  type="button"
                  aria-label={`主修${art.name}`}
                  aria-pressed={selected}
                  disabled={selected}
                  onClick={() => onAct({ type: "equip-art", artId: id })}
                >
                  {selected ? "此法正在运转" : "定为主修"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
      {!learned.length ? (
        <p className="roam-empty">识海尚无成卷。可在游历中寻找传承，或前往山门请教。</p>
      ) : null}
      <div className="library-study">
        <p>
          {sect
            ? `${sect.name} · 当前贡献 ${world.contrib}。在山门积累 8 贡献后，可请教师传；已学传承不会重复扣费。`
            : "散修也可寻得传承。游历中的古卷与山门师承，都能成为你往后的道路。"}
        </p>
        <button type="button" onClick={onStudy}>
          查看师承与洞府
        </button>
      </div>
    </section>
  );
}
