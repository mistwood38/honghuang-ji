import { useState } from "react";
import { useSave } from "@/lib/honghuang/store";

export function RestartButton({ label, ink = false }: { label: string; ink?: boolean }) {
  const restart = useSave((state) => state.restart);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className={ink ? "btn-ink" : "btn-ghost"} onClick={() => setOpen(true)}>
        {label}
      </button>
      {open ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-ink/80 px-4" role="dialog" aria-modal="true" aria-labelledby="restart-title">
          <div className="manuscript w-full max-w-md p-6">
            <h2 id="restart-title" className="font-serif text-2xl">
              弃此生
            </h2>
            <p className="mt-3 font-serif text-base leading-relaxed">
              这一世会收进前尘。道号、物与因果都让位，本纪的阅读进度还在。
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setOpen(false);
                  restart();
                }}
              >
                确认重开
              </button>
              <button type="button" className="btn-ink" onClick={() => setOpen(false)}>
                留下
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
