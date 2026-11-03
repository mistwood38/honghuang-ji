import { useState } from "react";
import { useSave } from "@/lib/honghuang/store";
import "./save-transfer.css";

const KEY = "honghuang-ji-save";

export function SaveTransfer() {
  const importSave = useSave((state) => state.importSave);
  const [note, setNote] = useState("");
  const [text, setText] = useState("");
  const native = typeof window !== "undefined" && "Capacitor" in window;

  async function exportSave() {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(KEY);
    } catch {
      raw = null;
    }
    if (!raw) {
      setNote("这一处还没有存档。");
      return;
    }
    try {
      await navigator.clipboard.writeText(raw);
      setNote("已抄出存档文本。换到另一处时粘贴导入。网页和安装包不会自动同步。");
    } catch {
      setText(raw);
      setNote("剪贴板不可用。下面是存档文本，请自行复制。");
    }
  }

  function importText() {
    try {
      importSave(text);
      setNote("已导入。此后这一处的进度以这份存档为准。");
    } catch (error) {
      setNote(error instanceof Error ? error.message : "无法导入");
    }
  }

  return (
    <details className="save-transfer">
      <summary>存档搬移</summary>
      <p>
        {native
          ? "安装包里的进度只留在这台手机。网页上的存档不会自动进来。"
          : "存档只留在当前浏览器。装到手机上的应用不会自动带走它。"}
      </p>
      <div className="save-transfer-actions">
        <button type="button" className="btn-ghost" onClick={() => void exportSave()}>
          导出存档
        </button>
        <button type="button" className="btn-ghost" onClick={importText}>
          导入存档
        </button>
      </div>
      <label className="save-transfer-label">
        存档文本
        <textarea
          className="save-transfer-text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="把另一处导出的存档文本粘贴在这里"
        />
      </label>
      {note ? <p className="save-transfer-note">{note}</p> : null}
    </details>
  );
}
