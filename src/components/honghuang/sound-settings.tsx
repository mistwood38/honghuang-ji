import { useState } from "react";
import { useAudioMix } from "@/lib/honghuang/audio-settings";
import { useSave } from "@/lib/honghuang/store";
import { playUi, unlockSound } from "@/lib/honghuang/sound";
import { Modal } from "./modal";

export function SoundSettings() {
  const [open, setOpen] = useState(false);
  const mix = useAudioMix();
  const master = useSave((state) => state.sound);
  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      title="山海有声"
      titleId="audio-settings-title"
      description="轻一点，也能听见山海。音乐和操作音效可以分别调整。"
      trigger={
        <button type="button" className="sound-settings-button" aria-label="声音设置">
          调音
        </button>
      }
    >
      <div className="audio-settings">
        {!master ? (
          <button
            type="button"
            className="btn-ink"
            onClick={() => {
              useSave.getState().setSound(true);
              unlockSound();
            }}
          >
            开启总声音
          </button>
        ) : null}
        {(
          [
            ["music", "背景音乐", "musicVolume"],
            ["effects", "操作音效", "effectsVolume"],
          ] as const
        ).map(([key, label, volume]) => (
          <div key={key} className="audio-control">
            <label>
              <input
                type="checkbox"
                checked={mix[key]}
                onChange={(event) => {
                  mix.update({ [key]: event.target.checked });
                  if (master) unlockSound();
                }}
              />
              {label}
              <span>{Math.round(mix[volume] * 100)}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              aria-label={`${label}音量`}
              value={Math.round(mix[volume] * 100)}
              onChange={(event) => mix.update({ [volume]: Number(event.target.value) / 100 })}
            />
          </div>
        ))}
        <button
          type="button"
          className="btn-ink"
          data-ui-sound="confirm"
          disabled={!master || !mix.effects}
          onClick={() => playUi("confirm")}
        >
          试听柔和确认音
        </button>
        <p>原创器乐 · 笛与拨弦、弦乐与轻鼓。阅读时更安静，临阵时节奏渐起。</p>
      </div>
    </Modal>
  );
}
