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
  swell(audio, now, mood);
}

/** A short synthesized air, not a recorded score. Still gated by the sound toggle and a user gesture. */
function swell(audio: AudioContext, now: number, mood: SceneMood) {
  const length = Math.floor(audio.sampleRate * 0.7);
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
  const noise = audio.createBufferSource();
  noise.buffer = buffer;
  const filter = audio.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = mood === "calamity" ? 240 : mood === "still" ? 180 : 420;
  const gain = audio.createGain();
  const peak = mood === "calamity" ? 0.035 : mood === "still" || mood === "tide" ? 0.018 : 0.01;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peak, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(audio.destination);
  noise.onended = () => {
    noise.disconnect();
    filter.disconnect();
    gain.disconnect();
  };
  noise.start(now);
  noise.stop(now + 0.72);
}
