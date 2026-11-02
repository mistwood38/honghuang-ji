import { sceneById } from "@/lib/honghuang/story";
import { useSave } from "@/lib/honghuang/store";
import { LAYERS, PLACES } from "@/lib/honghuang/world";

const REGIONS = ["未开", "天", "洪荒", "人境", "海", "下"];

export function LandView() {
  const sceneId = useSave((state) => state.sceneId);
  const seen = useSave((state) => state.seen);
  const started = useSave((state) => state.started);
  const currentPlace = sceneById(sceneId)?.place;
  const visited = new Set(
    seen
      .map((id) => sceneById(id)?.place)
      .filter((place): place is string => Boolean(place)),
  );

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-6">
      <header>
        <p className="text-xs tracking-widest text-gold">山河</p>
        <h1 className="mt-1 font-serif text-3xl">地志</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-dim">
          大事件发生在这些地方。你改变不了山折与否，只能决定自己站在哪一层风里。
        </p>
      </header>
      <ol className="mt-6 grid gap-2">
        {LAYERS.map((layer) => (
          <li key={layer.name} className="border border-line-dark bg-raised px-4 py-3">
            <p className="font-serif text-lg text-gold">{layer.name}</p>
            <p className="mt-1 text-sm leading-relaxed text-dim">{layer.note}</p>
          </li>
        ))}
      </ol>
      {REGIONS.map((region) => {
        const places = PLACES.filter((place) => place.region === region);
        if (places.length === 0) return null;
        return (
          <section key={region} className="mt-8">
            <h2 className="font-serif text-sm tracking-widest text-gold">{region}</h2>
            <div className="mt-3 grid gap-3">
              {places.map((place) => {
                const here = started && currentPlace === place.id;
                const been = visited.has(place.id);
                return (
                  <article key={place.id} className="border border-line-dark px-4 py-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-serif text-xl">{place.name}</h3>
                      {here ? <span className="text-xs text-gold">你在此处</span> : been ? <span className="text-xs text-dim">曾至</span> : null}
                    </div>
                    <p className="mt-1 text-sm text-gold">{place.summary}</p>
                    <p className="mt-2 text-sm leading-relaxed text-dim">{place.detail}</p>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </section>
  );
}
