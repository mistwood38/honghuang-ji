import type { SceneMood } from "./visuals";

let ctx: AudioContext | null = null;
function context(): AudioContext | null {
  if (typeof window === "undefined" || !window.AudioContext) return null;
  try {
    if (!ctx) ctx = new window.AudioContext();
    return ctx;
  } catch {
    return null;
  }
}
export function unlockSound() {
  const audio = context();
  if (audio?.state === "suspended") void audio.resume().catch(() => undefined);
}
/** Small synthesized bronze chimes; always called from a user gesture. No autoplay. */
export function playChoice(enabled: boolean, mood: SceneMood = "mist") {
  if (!enabled) return;
  const audio = context();
  if (!audio) return;
  if (audio.state === "suspended") void audio.resume().catch(() => undefined);
  const now = audio.currentTime;
  const notes =
    mood === "calamity"
      ? [98, 146.83, 207.65]
      : mood === "radiance"
        ? [196, 293.66, 440]
        : [392, 523.25];
  const duration = mood === "calamity" || mood === "radiance" ? 1.3 : 0.5;
  notes.forEach((frequency, index) => {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    const start = now + index * 0.045;
    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, start);
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.995, start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.025 / (index + 1), start + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
    osc.start(start);
    osc.stop(start + duration + 0.05);
  });
}
