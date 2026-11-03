import { useEffect, useRef, useState } from "react";
import { CHAPTERS, NOVEL_PREFACE } from "@/lib/honghuang/novel";
import { NOVEL_NAME } from "@/lib/honghuang/world";
import { useSave } from "@/lib/honghuang/store";
import { ART, type ArtKey } from "@/lib/honghuang/visuals";
import { Artwork, PageHeading } from "./art";
import "./reading-views.css";

const VOLUMES = [...new Set(CHAPTERS.map((chapter) => chapter.volume))];
const CHAPTER_ART: ArtKey[] = [
  "chaos",
  "chaos",
  "mountain",
  "palace",
  "palace",
  "mountain",
  "mountain",
  "east",
  "calamity",
  "nuwa",
  "nuwa",
  "tribes",
  "fengshen",
  "mountain",
];

export function NovelView() {
  const index = useSave((state) => state.novelIndex);
  const setNovelIndex = useSave((state) => state.setNovelIndex);
  const safe = Math.min(CHAPTERS.length - 1, Math.max(0, index));
  const chapter = CHAPTERS[safe]!;
  const titleRef = useRef<HTMLHeadingElement>(null);
  const lastChapter = useRef(safe);
  const directoryRef = useRef<HTMLDetailsElement>(null);
  const directorySummaryRef = useRef<HTMLElement>(null);
  const desktopDirectoryRef = useRef<HTMLElement>(null);
  const [largeText, setLargeText] = useState(false);

  useEffect(() => {
    if (lastChapter.current === safe) return;
    lastChapter.current = safe;
    titleRef.current?.focus({ preventScroll: true });
    titleRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
  }, [safe]);

  function goToChapter(next: number) {
    setNovelIndex(next);
    if (directoryRef.current) directoryRef.current.open = false;
  }

  function returnToDirectory() {
    if (window.matchMedia("(min-width: 1000px)").matches) {
      const selected =
        desktopDirectoryRef.current?.querySelector<HTMLButtonElement>('[aria-current="page"]');
      selected?.focus({ preventScroll: true });
      selected?.scrollIntoView({ block: "nearest", behavior: "auto" });
      return;
    }
    if (directoryRef.current) directoryRef.current.open = true;
    directorySummaryRef.current?.focus({ preventScroll: true });
    directorySummaryRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
  }

  function chapterDirectory() {
    return VOLUMES.map((volume) => (
      <div
        className="reader-volume"
        key={volume}
        data-current={volume === chapter.volume ? "true" : undefined}
      >
        <p className="reader-volume-label">{volume}</p>
        <ol>
          {CHAPTERS.map((item, itemIndex) =>
            item.volume === volume ? (
              <li key={item.id}>
                <button
                  type="button"
                  className="reader-chapter-link"
                  onClick={() => goToChapter(itemIndex)}
                  aria-current={itemIndex === safe ? "page" : undefined}
                >
                  <span className="reader-chapter-number">
                    {String(itemIndex + 1).padStart(2, "0")}
                  </span>
                  <span className="reader-chapter-name">{item.title}</span>
                  {itemIndex === safe ? (
                    <span className="reader-reading-mark" aria-label="正在阅读">
                      读
                    </span>
                  ) : null}
                </button>
              </li>
            ) : null,
          )}
        </ol>
      </div>
    ));
  }

  return (
    <section className="page-wrap reader-page">
      <PageHeading label="本纪 · 五卷十四章" title={NOVEL_NAME}>
        <p>天地初开，万灵有名。翻开这一方洪荒的正史。</p>
      </PageHeading>
      <div className="reader-layout">
        <aside
          className="reader-directory bronze-panel"
          aria-label="本纪卷册目录"
          ref={desktopDirectoryRef}
        >
          <div className="reader-directory-heading">
            <span className="seal" aria-hidden="true">
              纪
            </span>
            <div>
              <p className="eyebrow">卷册目录</p>
              <p className="reader-directory-subtitle">自混沌至余响</p>
            </div>
          </div>
          <nav>{chapterDirectory()}</nav>
          <p className="reader-directory-note">阅读进度随此世一同留存</p>
        </aside>
        <div className="reader-main">
          <details className="reader-mobile-directory bronze-panel" ref={directoryRef}>
            <summary ref={directorySummaryRef}>
              <span>卷册目录</span>
              <span>
                {safe + 1} / {CHAPTERS.length} · {chapter.title}
              </span>
              <span aria-hidden="true">⌄</span>
            </summary>
            <nav aria-label="本纪卷册目录">{chapterDirectory()}</nav>
          </details>
          <details className="reader-preface bronze-panel">
            <summary>
              卷首 · 关于本纪<span aria-hidden="true">＋</span>
            </summary>
            <div>
              {NOVEL_PREFACE.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </details>
          <article
            className={`manuscript reader-manuscript ${largeText ? "reader-large-text" : ""}`}
          >
            <div className="reader-leaf-art" key={`art-${chapter.id}`}>
              <Artwork art={ART[CHAPTER_ART[safe] ?? "mountain"]} eager />
              <span aria-hidden="true" className="reader-art-inscription">
                {chapter.volume}
              </span>
              <span className="reader-leaf-number" aria-hidden="true">
                <span>本纪</span>
                <b>{String(safe + 1).padStart(2, "0")}</b>
                <i> / {CHAPTERS.length}</i>
              </span>
            </div>
            <div className="reader-leaf-body" key={chapter.id}>
              <div className="reader-chapter-meta">
                <p>{chapter.volume}</p>
                <button
                  type="button"
                  onClick={() => setLargeText(!largeText)}
                  aria-pressed={largeText}
                  aria-label={largeText ? "恢复标准字号" : "增大阅读字号"}
                >
                  字 <span aria-hidden="true">{largeText ? "−" : "＋"}</span>
                </button>
              </div>
              <h2 ref={titleRef} tabIndex={-1} className="reader-chapter-title">
                <span className="reader-chapter-order">第 {safe + 1} 章</span>
                {chapter.title}
              </h2>
              <div className="reader-chapter-ornament" aria-hidden="true">
                <span />◇<span />
              </div>
              <div className="copy reader-copy">
                {chapter.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <p className="reader-end-mark" aria-hidden="true">
                · 卷叶留香 ·
              </p>
              <nav className="reader-pagination" aria-label="本纪章节翻页">
                <button
                  type="button"
                  className="btn-ink"
                  disabled={safe === 0}
                  onClick={() => goToChapter(safe - 1)}
                >
                  上一章
                </button>
                <span className="reader-page-number">
                  {safe + 1} <span>/ {CHAPTERS.length}</span>
                </span>
                <button
                  type="button"
                  className="btn-ink"
                  disabled={safe === CHAPTERS.length - 1}
                  onClick={() => goToChapter(safe + 1)}
                >
                  下一章
                </button>
              </nav>
              <div className="reader-chapter-footer">
                <button
                  type="button"
                  className="reader-return-directory"
                  onClick={returnToDirectory}
                >
                  回到目录
                </button>
                {safe < CHAPTERS.length - 1 ? (
                  <p className="reader-next-label">下章 · {CHAPTERS[safe + 1]!.title}</p>
                ) : (
                  <p className="reader-next-label">本纪终，天地仍在。</p>
                )}
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
