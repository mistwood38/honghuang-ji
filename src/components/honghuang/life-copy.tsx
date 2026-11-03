import { useRef, useState } from "react";
import { lifeText } from "@/lib/honghuang/engine";
import { useSave } from "@/lib/honghuang/store";
import { Modal } from "./modal";

export function LifeCopy({ ink = false }: { ink?: boolean }) {
  const state = useSave();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [copying, setCopying] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const copyAttempt = useRef(0);
  const text = lifeText(state);

  function changeOpen(next: boolean) {
    copyAttempt.current += 1;
    setNote("");
    setCopying(false);
    setOpen(next);
  }

  async function copy() {
    const attempt = ++copyAttempt.current;
    if (!navigator.clipboard?.writeText) {
      setNote("浏览器未提供剪贴板，请选取全文后使用系统复制。");
      return;
    }
    setCopying(true);
    setNote("");
    try {
      await navigator.clipboard.writeText(text);
      if (attempt === copyAttempt.current) setNote("已抄到剪贴板");
    } catch {
      if (attempt === copyAttempt.current) setNote("复制未成，请选取全文后使用系统复制。");
    } finally {
      if (attempt === copyAttempt.current) setCopying(false);
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={changeOpen}
      title="此生抄本"
      titleId="copy-title"
      description="此生所历，皆录于此。可抄至剪贴板，亦可选取文字留存。"
      initialFocusRef={textareaRef}
      trigger={
        <button type="button" className={ink ? "btn-ink" : "btn-ghost"}>
          抄录此生
        </button>
      }
    >
      <textarea
        ref={textareaRef}
        aria-label="此生抄本"
        readOnly
        value={text}
        className="hh-modal-text"
      />
      <div className="hh-modal-actions">
        <button
          type="button"
          className="btn-primary"
          disabled={copying}
          onClick={() => void copy()}
        >
          {copying ? "抄录中…" : "复制"}
        </button>
        <button
          type="button"
          className="btn-ink"
          onClick={() => {
            const textarea = textareaRef.current;
            if (!textarea) return;
            textarea.focus();
            textarea.select();
            textarea.setSelectionRange(0, text.length);
            setNote("已选取全文，可使用系统复制。");
          }}
        >
          选取全文
        </button>
        <button type="button" className="btn-ink" onClick={() => changeOpen(false)}>
          合上
        </button>
      </div>
      <p className="hh-modal-note" role="status" aria-live="polite">
        {note}
      </p>
    </Modal>
  );
}
