import { useState } from "react";
import { CODEX, CODEX_CATEGORIES } from "@/lib/honghuang/codex-data";
import { ART, type ArtKey } from "@/lib/honghuang/visuals";
import { Artwork, PageHeading, SectionHeading } from "./art";
import "./reading-views.css";

const CATEGORY_ART: Record<string, ArtKey> = {
  总纲: "chaos",
  宇宙: "chaos",
  时间: "calamity",
  法则: "palace",
  众生: "nuwa",
  势力: "east",
  山河: "worldmap",
  法宝: "relics",
  凡例: "mountain",
};
const CATEGORY_LINES: Record<string, string> = {
  总纲: "万象之始，正史之界",
  宇宙: "清浊既分，天地有层",
  时间: "斧声为年，劫后有史",
  法则: "道行有厚薄，因果有回声",
  众生: "神魔与人，各有其在",
  势力: "门既出现，万灵分道",
  山河: "山河有骨，江海有源",
  法宝: "器有来处，物记因果",
  凡例: "循此卷，识这一方天地",
};
const FIRST_ENTRIES = CODEX_CATEGORIES.map(
  (category) => CODEX.find((entry) => entry.category === category)?.id,
).filter((id): id is string => Boolean(id));

function highlightMatches(text: string, query: string) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.split(new RegExp(`(${escaped})`, "giu")).map((part, index) =>
    index % 2 ? (
      <mark className="codex-search-match" key={index}>
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

export function CodexView() {
  const [category, setCategory] = useState("全部");
  const [query, setQuery] = useState("");
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(FIRST_ENTRIES));
  // Search disclosure is temporary: clearing the query restores the reader's open rolls.
  const [searchClosedIds, setSearchClosedIds] = useState<Set<string>>(() => new Set());
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filtered = CODEX.filter(
    (entry) =>
      (category === "全部" || entry.category === category) &&
      (!normalizedQuery ||
        `${entry.title} ${entry.paragraphs.join(" ")}`
          .toLocaleLowerCase()
          .includes(normalizedQuery)),
  );
  const isEntryOpen = (id: string) =>
    normalizedQuery ? !searchClosedIds.has(id) : openIds.has(id);
  const allOpen = filtered.length > 0 && filtered.every((entry) => isEntryOpen(entry.id));

  function toggleAll() {
    if (normalizedQuery) {
      setSearchClosedIds((current) => {
        const next = new Set(current);
        filtered.forEach((entry) => {
          if (allOpen) next.add(entry.id);
          else next.delete(entry.id);
        });
        return next;
      });
      return;
    }
    setOpenIds((current) => {
      const next = new Set(current);
      filtered.forEach((entry) => {
        if (allOpen) next.delete(entry.id);
        else next.add(entry.id);
      });
      return next;
    });
  }

  return (
    <section className="page-wrap codex-page">
      <div className="codex-cover bronze-panel">
        <Artwork art={ART.palace} className="codex-cover-art" eager decorative />
        <div className="codex-cover-content">
          <PageHeading label="天书 · 万象藏卷" title="洪荒天书">
            <p>这一方世界的全部设定。</p>
            <p>与《混沌本纪》、与你的入世，是同一套因果。不必打通关才许阅读。</p>
          </PageHeading>
          <p className="codex-collection-count">
            <span>{CODEX_CATEGORIES.length}</span> 门 <span>{CODEX.length}</span> 篇 · 开卷尽可知
          </p>
        </div>
        <span className="codex-cover-seal" aria-hidden="true">
          天<br />书
        </span>
      </div>
      <div className="codex-layout">
        <aside className="codex-directory bronze-panel">
          <p className="eyebrow">分门阅览</p>
          <nav aria-label="天书分类">
            {["全部", ...CODEX_CATEGORIES].map((item) => (
              <button
                key={item}
                type="button"
                className="codex-category-link"
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
              >
                <span>{item === "全部" ? "全卷" : item}</span>
                <span>
                  {item === "全部"
                    ? CODEX.length
                    : CODEX.filter((entry) => entry.category === item).length}
                </span>
              </button>
            ))}
          </nav>
        </aside>
        <div className="codex-main">
          <div className="codex-tools bronze-panel">
            <label className="codex-search">
              <span>检索</span>
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSearchClosedIds(new Set());
                }}
                placeholder="寻神名、山河、器物或正文…"
                type="search"
                aria-label="检索天书标题和正文"
              />
            </label>
            <div className="codex-results">
              <p role="status">
                {category === "全部" ? "万象全卷" : category} · 共 {filtered.length} 篇
                {normalizedQuery ? "相应" : ""}
              </p>
              <button type="button" onClick={toggleAll} disabled={filtered.length === 0}>
                {allOpen ? "收拢全篇" : "展开全篇"}
              </button>
            </div>
          </div>
          {filtered.length === 0 ? (
            <div className="codex-empty bronze-panel">
              <span className="seal" aria-hidden="true">
                寻
              </span>
              <h2>此卷暂未寻得</h2>
              <p>换一个词，或放眼万象全卷。</p>
              <button
                className="btn-ghost"
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory("全部");
                }}
              >
                重阅全卷
              </button>
            </div>
          ) : null}
          {CODEX_CATEGORIES.map((item) => {
            const entries = filtered.filter((entry) => entry.category === item);
            if (entries.length === 0) return null;
            return (
              <section
                className="codex-section"
                key={item}
                aria-labelledby={`codex-category-${item}`}
              >
                <div className="codex-section-heading">
                  <Artwork art={ART[CATEGORY_ART[item] ?? "mountain"]} decorative />
                  <div>
                    <SectionHeading id={`codex-category-${item}`}>{item}</SectionHeading>
                    <p>{CATEGORY_LINES[item]}</p>
                  </div>
                  <span className="codex-section-count">
                    {String(entries.length).padStart(2, "0")}
                  </span>
                </div>
                {entries.map((entry) => (
                  <details
                    key={entry.id}
                    className="codex-entry"
                    open={isEntryOpen(entry.id)}
                    onToggle={(event) => {
                      const isOpen = event.currentTarget.open;
                      if (normalizedQuery) {
                        setSearchClosedIds((current) => {
                          if (current.has(entry.id) === !isOpen) return current;
                          const next = new Set(current);
                          if (isOpen) next.delete(entry.id);
                          else next.add(entry.id);
                          return next;
                        });
                        return;
                      }
                      setOpenIds((current) => {
                        if (current.has(entry.id) === isOpen) return current;
                        const next = new Set(current);
                        if (isOpen) next.add(entry.id);
                        else next.delete(entry.id);
                        return next;
                      });
                    }}
                  >
                    <summary>
                      <span className="codex-entry-mark" aria-hidden="true">
                        {String(CODEX.indexOf(entry) + 1).padStart(2, "0")}
                      </span>
                      <h3>{highlightMatches(entry.title, query.trim())}</h3>
                      <span className="codex-entry-toggle">
                        <span className="codex-closed-label">展开</span>
                        <span className="codex-open-label">收卷</span>
                        <span aria-hidden="true" className="codex-toggle-mark">
                          ＋
                        </span>
                      </span>
                    </summary>
                    <div className="copy codex-entry-copy">
                      {entry.paragraphs.map((paragraph) => (
                        <p key={paragraph.slice(0, 32)}>
                          {highlightMatches(paragraph, query.trim())}
                        </p>
                      ))}
                    </div>
                  </details>
                ))}
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}
