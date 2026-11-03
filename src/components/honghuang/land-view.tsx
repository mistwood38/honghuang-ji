import { useRef, useState } from "react";
import { sceneById } from "@/lib/honghuang/story";
import { useSave } from "@/lib/honghuang/store";
import { artForPlace } from "@/lib/honghuang/visuals";
import { LAYERS, PLACES } from "@/lib/honghuang/world";
import { Artwork, PageHeading, SectionHeading } from "./art";
import "./world-views.css";

const REGIONS = ["全部", "未开", "天", "洪荒", "人境", "海", "下"];
const MAP_PLACES = ["zixiao", "kunlun", "east", "buzhou", "bloodsea", "wahuan"];

export function LandView() {
  const sceneId = useSave((state) => state.sceneId);
  const seen = useSave((state) => state.seen);
  const started = useSave((state) => state.started);
  const currentPlace = sceneById(sceneId)?.place;
  const [selectedId, setSelectedId] = useState(currentPlace ?? "buzhou");
  const [region, setRegion] = useState("全部");
  const detailRef = useRef<HTMLElement>(null);
  const selected = PLACES.find((place) => place.id === selectedId) ?? PLACES[0]!;
  const visited = new Set(seen.map((id) => sceneById(id)?.place).filter(Boolean));
  const places = PLACES.filter((place) => region === "全部" || place.region === region);

  function selectPlace(id: string, scroll = false) {
    setSelectedId(id);
    if (scroll) {
      detailRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
      detailRef.current?.focus({ preventScroll: true });
    }
  }

  function placeStatus(id: string) {
    return started && currentPlace === id ? "你在此处" : visited.has(id) ? "曾至" : "未曾涉足";
  }

  return (
    <section className="page-wrap atlas-page">
      <PageHeading label="山河 · 天地有形" title="山河地志">
        <p>大事件发生在这些地方。你改变不了山折与否，只能决定自己站在哪一层风里。</p>
      </PageHeading>
      <div className="atlas-layout">
        <div className="atlas-map" aria-label="洪荒山河意象图">
          <picture className="artwork atlas-world-art">
            <source media="(max-width: 640px)" srcSet="/art/world-atlas-small.webp" />
            <img
              src="/art/world-atlas.webp"
              width={1440}
              height={960}
              alt=""
              loading="eager"
              decoding="async"
            />
          </picture>
          <div className="atlas-map-shade" aria-hidden="true" />
          <div className="atlas-map-inscription" aria-hidden="true">
            <span>洪荒</span>
            <small>山河一卷&#12288;天地万重</small>
          </div>
          <div className="atlas-map-note">
            <span>天 地 舆 图</span>
            <p>山河意象 · 点地名阅地志</p>
          </div>
          {MAP_PLACES.map((id) => {
            const place = PLACES.find((item) => item.id === id)!;
            return (
              <button
                type="button"
                key={id}
                className={`atlas-marker atlas-marker-${id}${selected.id === id ? " is-selected" : ""}${started && currentPlace === id ? " is-current" : ""}`}
                aria-pressed={selected.id === id}
                aria-label={`${place.name}，${placeStatus(id)}，查看地志`}
                onClick={() => selectPlace(id, window.matchMedia("(max-width: 959px)").matches)}
              >
                <span className="atlas-pin" aria-hidden="true" />
                <span>{place.name}</span>
              </button>
            );
          })}
          <div className="atlas-map-legend">
            <span>
              <i className="atlas-legend-current" />
              此生所在
            </span>
            <span>
              <i />
              可阅地志
            </span>
          </div>
        </div>
        <article
          className="atlas-detail bronze-panel"
          ref={detailRef}
          tabIndex={-1}
          aria-label="地点详情"
        >
          <div className="atlas-detail-art">
            <Artwork art={artForPlace(selected.id)} decorative />
            <span className="atlas-region-seal">{selected.region}</span>
          </div>
          <div className="atlas-detail-copy" aria-live="polite" aria-atomic="true">
            <p className="eyebrow">
              地志 · 藏卷 {String(PLACES.indexOf(selected) + 1).padStart(2, "0")} / {PLACES.length}
            </p>
            <div className="atlas-detail-title">
              <h2>{selected.name}</h2>
              <span
                className={
                  started && currentPlace === selected.id
                    ? "atlas-status is-current"
                    : "atlas-status"
                }
              >
                {placeStatus(selected.id)}
              </span>
            </div>
            <p className="atlas-summary">{selected.summary}</p>
            <p className="atlas-description">{selected.detail}</p>
          </div>
        </article>
      </div>
      <section className="atlas-places" aria-label="浏览地点">
        <SectionHeading>
          四极八荒{" "}
          <small>
            {visited.size} / {PLACES.length} 处曾至
          </small>
        </SectionHeading>
        <div className="atlas-filters" role="group" aria-label="地域分类">
          {REGIONS.map((item) => (
            <button
              type="button"
              key={item}
              aria-pressed={region === item}
              onClick={() => setRegion(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="atlas-place-grid">
          {places.map((place) => (
            <button
              type="button"
              key={place.id}
              className={`atlas-place-card${selected.id === place.id ? " is-selected" : ""}`}
              aria-pressed={selected.id === place.id}
              onClick={() => selectPlace(place.id, true)}
            >
              <span className="atlas-card-landscape">
                <Artwork art={artForPlace(place.id)} decorative />
                <span className="atlas-card-shade" />
              </span>
              <span className="atlas-card-body">
                <span className="atlas-place-top">
                  <span className="atlas-place-name">{place.name}</span>
                  <span
                    className={
                      started && currentPlace === place.id
                        ? "atlas-status is-current"
                        : "atlas-status"
                    }
                  >
                    {placeStatus(place.id)}
                  </span>
                </span>
                <span className="atlas-place-summary">{place.summary}</span>
                <span className="atlas-place-link">
                  {place.region} <span aria-hidden="true">·</span> 阅地志{" "}
                  <span aria-hidden="true">↗</span>
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>
      <section className="atlas-layers" aria-label="天地层次">
        <SectionHeading>天地四重</SectionHeading>
        <ol>
          {LAYERS.map((layer, index) => (
            <li key={layer.name}>
              <span className="atlas-layer-number" aria-hidden="true">
                {["一", "二", "三", "四"][index]}
              </span>
              <div>
                <h3>{layer.name}</h3>
                <p>{layer.note}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </section>
  );
}
