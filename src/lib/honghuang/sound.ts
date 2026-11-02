let ctx: AudioContext | null = null;

function context(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const WebAudio = window.AudioContext;
  if (!WebAudio) return null;
  if (!ctx) ctx = new WebAudio();
  return ctx;
}

export function unlockSound() {
  const audio = context();
  if (audio?.state === "suspended") void audio.resume();
}

export function playChoice(enabled: boolean) {
  if (!enabled) return;
  const audio = context();
  if (!audio) return;
  if (audio.state === "suspended") void audio.resume();
  const now = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(392, now);
  osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.18);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.035, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(now);
  osc.stop(now + 0.4);
}
