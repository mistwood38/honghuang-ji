import { CHAPTERS, NOVEL_PREFACE } from "@/lib/honghuang/novel";
import { NOVEL_NAME } from "@/lib/honghuang/world";
import { useSave } from "@/lib/honghuang/store";

export function NovelView() {
  const index = useSave((state) => state.novelIndex);
  const setNovelIndex = useSave((state) => state.setNovelIndex);
  const safe = Math.min(CHAPTERS.length - 1, Math.max(0, index));
  const chapter = CHAPTERS[safe]!;

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-6">
      <header className="mb-5">
        <p className="text-xs tracking-widest text-gold">{NOVEL_NAME}</p>
        <h1 className="mt-1 font-serif text-3xl text-fog">正史</h1>
        <div className="mt-3 max-w-2xl text-sm leading-relaxed text-dim">
          {NOVEL_PREFACE.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </header>
      <div className="flex gap-2 overflow-x-auto pb-3">
        {CHAPTERS.map((item, itemIndex) => {
          const current = itemIndex === safe;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setNovelIndex(itemIndex)}
              className={
                current
                  ? "shrink-0 bg-cinnabar px-3 py-2 font-serif text-sm text-paper"
                  : "shrink-0 border border-line-dark px-3 py-2 font-serif text-sm text-fog"
              }
              aria-current={current ? "true" : undefined}
            >
              {item.title}
            </button>
          );
        })}
      </div>
      <article className="manuscript rise p-5 md:p-10" key={chapter.id}>
        <p className="text-xs tracking-widest text-cinnabar">{chapter.volume}</p>
        <h2 className="mt-2 font-serif text-3xl">{chapter.title}</h2>
        <div className="copy mt-6">
          {chapter.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3 border-t border-line pt-5">
          <button type="button" className="btn-ink" disabled={safe === 0} onClick={() => setNovelIndex(safe - 1)}>
            上一章
          </button>
          <button
            type="button"
            className="btn-ink"
            disabled={safe === CHAPTERS.length - 1}
            onClick={() => setNovelIndex(safe + 1)}
          >
            下一章
          </button>
          <span className="self-center text-sm text-fg/70">
            {safe + 1} / {CHAPTERS.length}
          </span>
        </div>
      </article>
    </section>
  );
}
