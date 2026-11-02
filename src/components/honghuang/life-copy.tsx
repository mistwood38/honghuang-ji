import { useState } from "react";
import { lifeText } from "@/lib/honghuang/engine";
import { useSave } from "@/lib/honghuang/store";

export function LifeCopy() {
  const state = useSave();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const text = lifeText(state);

  return (
    <>
      <button type="button" className="btn-ink" onClick={() => setOpen(true)}>
        抄录此生
      </button>
      {open ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-ink/80 px-4" role="dialog" aria-modal="true" aria-labelledby="copy-title">
          <div className="manuscript max-h-[80vh] w-full max-w-lg overflow-auto p-6">
            <h2 id="copy-title" className="font-serif text-2xl">
              此生抄本
            </h2>
            <textarea readOnly value={text} className="mt-4 h-56 w-full border border-line bg-paper-deep p-3 font-serif text-sm leading-relaxed text-fg" />
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  void navigator.clipboard
                    ?.writeText(text)
                    .then(() => setNote("已抄到剪贴板"))
                    .catch(() => setNote("复制未成，可直接选取上面的字"));
                }}
              >
                复制
              </button>
              <button type="button" className="btn-ink" onClick={() => setOpen(false)}>
                合上
              </button>
              {note ? <span className="self-center text-sm">{note}</span> : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
