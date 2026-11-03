import { useRef, useState } from "react";
import { useSave } from "@/lib/honghuang/store";
import { Modal } from "./modal";

export function RestartButton({ label, ink = false }: { label: string; ink?: boolean }) {
  const restart = useSave((state) => state.restart);
  const [open, setOpen] = useState(false);
  const stayRef = useRef<HTMLButtonElement>(null);

  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      title="弃此生"
      titleId="restart-title"
      description="这一世会收进前尘。道号、物与因果都让位，本纪的阅读进度还在。"
      initialFocusRef={stayRef}
      trigger={
        <button type="button" className={ink ? "btn-ink" : "btn-ghost"}>
          {label}
        </button>
      }
    >
      <div className="hh-modal-actions">
        <button type="button" className="btn-ink" ref={stayRef} onClick={() => setOpen(false)}>
          留下
        </button>
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
      </div>
    </Modal>
  );
}
