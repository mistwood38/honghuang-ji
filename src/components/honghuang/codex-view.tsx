import { CODEX, CODEX_CATEGORIES } from "@/lib/honghuang/world";

export function CodexView() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-6">
      <header className="mb-4">
        <p className="text-xs tracking-widest text-gold">天书</p>
        <h1 className="mt-1 font-serif text-3xl">这一方世界的全部设定</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-dim">
          与《混沌本纪》、与你的入世，是同一套因果。不必打通关才许阅读。
        </p>
      </header>
      {CODEX_CATEGORIES.map((category) => (
        <section key={category} className="mt-6">
          <h2 className="font-serif text-sm tracking-widest text-gold">{category}</h2>
          {CODEX.filter((entry) => entry.category === category).map((entry) => (
            <details key={entry.id} className="entry">
              <summary>
                <span>{entry.title}</span>
                <span className="text-xs text-dim">展开</span>
              </summary>
              <div className="copy pb-4">
                {entry.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </div>
            </details>
          ))}
        </section>
      ))}
    </section>
  );
}
