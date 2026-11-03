import type { SceneMood } from "./visuals";

let ctx: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;
let bedMood: SceneMood | null = null;
let bedStop: (() => void) | null = null;
let wantEnabled = false;
let wantMood: SceneMood = "mist";
let listening = false;

/** Create a context only after a user gesture. Muted paths must never call this. */
function createContext(): AudioContext | null {
  if (typeof window === "undefined" || !window.AudioContext) return null;
  try {
    if (!ctx) ctx = new window.AudioContext();
    return ctx;
  } catch {
    return null;
  }
}
function stopBed() {
  const stop = bedStop;
  bedStop = null;
  bedMood = null;
  stop?.();
}
function settle() {
  const audio = ctx;
  if (!audio || !wantEnabled || document.hidden || audio.state !== "running") {
    if (!wantEnabled || document.hidden) stopBed();
    return;
  }
  startBed(audio, wantMood);
}
function watchVisibility() {
  if (listening || typeof document === "undefined") return;
  listening = true;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden || !wantEnabled) {
      stopBed();
      return;
    }
    const audio = ctx;
    if (!audio) return;
    if (audio.state === "suspended") {
      void audio.resume().then(settle).catch(() => undefined);
      return;
    }
    settle();
  });
}
/** Gesture-only. Does nothing if the context cannot be created. */
export function unlockSound() {
  const audio = createContext();
  if (!audio) return;
  if (audio.state === "suspended") void audio.resume().then(settle).catch(() => undefined);
  else settle();
}
function chime(audio: AudioContext, mood: SceneMood) {
  const now = audio.currentTime;
  const notes =
    mood === "calamity"
      ? [98, 146.83, 207.65]
      : mood === "radiance"
        ? [196, 293.66, 440]
        : mood === "tide"
          ? [174.61, 261.63, 349.23]
          : mood === "embers"
            ? [146.83, 220, 329.63]
            : mood === "still"
              ? [110, 164.81]
              : [392, 523.25];
  const duration = mood === "calamity" || mood === "radiance" ? 1.15 : 0.55;
  notes.forEach((frequency, index) => {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    const start = now + index * 0.05;
    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.022 / (index + 1), start + 0.03);
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
const BED: Record<SceneMood, { tones: number[]; noise: number; level: number }> = {
  mist: { tones: [110, 164.81], noise: 500, level: 0.012 },
  radiance: { tones: [196, 293.66], noise: 900, level: 0.011 },
  calamity: { tones: [73.42, 110], noise: 220, level: 0.016 },
  still: { tones: [98, 146.83], noise: 280, level: 0.008 },
  embers: { tones: [130.81, 196], noise: 360, level: 0.012 },
  tide: { tones: [146.83, 220], noise: 700, level: 0.011 },
};
function startBed(audio: AudioContext, mood: SceneMood) {
  if (bedMood === mood && bedStop) return;
  stopBed();
  if (!noiseBuffer) {
    noiseBuffer = audio.createBuffer(1, audio.sampleRate, audio.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  }
  const spec = BED[mood];
  const master = audio.createGain();
  master.gain.value = 0.0001;
  master.connect(audio.destination);
  const nodes: AudioNode[] = [master];
  spec.tones.forEach((frequency, index) => {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    gain.gain.value = index === 0 ? 0.7 : 0.35;
    osc.connect(gain);
    gain.connect(master);
    osc.start();
    nodes.push(osc, gain);
  });
  const noise = audio.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;
  const filter = audio.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = spec.noise;
  const noiseGain = audio.createGain();
  noiseGain.gain.value = 0.22;
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(master);
  noise.start();
  nodes.push(noise, filter, noiseGain);
  const begun = audio.currentTime;
  master.gain.exponentialRampToValueAtTime(spec.level, begun + 0.4);
  bedMood = mood;
  bedStop = () => {
    const now = audio.currentTime;
    try {
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(0.0001, now);
    } catch {
      /* context already closed */
    }
    nodes.forEach((node) => {
      if (node instanceof OscillatorNode || node instanceof AudioBufferSourceNode) {
        try {
          node.stop();
        } catch {
          /* already stopped */
        }
      }
      try {
        node.disconnect();
      } catch {
        /* already disconnected */
      }
    });
  };
}
/** Remember the wanted bed. Never constructs an AudioContext; a muted life therefore stays silent. */
export function setAmbience(enabled: boolean, mood: SceneMood = "mist") {
  wantEnabled = enabled;
  wantMood = mood;
  watchVisibility();
  if (!enabled || typeof document === "undefined" || document.hidden) {
    stopBed();
    return;
  }
  if (!ctx || ctx.state !== "running") return;
  startBed(ctx, mood);
}
/** Bronze chime from a user gesture. Refuses to run, and to create a context, when sound is off. */
export function playChoice(enabled: boolean, mood: SceneMood = "mist") {
  if (!enabled) return;
  const audio = createContext();
  if (!audio) return;
  const go = () => {
    if (audio.state !== "running") return;
    chime(audio, mood);
    if (wantEnabled && !document.hidden) {
      wantMood = mood;
      startBed(audio, mood);
    }
  };
  if (audio.state === "suspended") {
    void audio.resume().then(go).catch(() => undefined);
    return;
  }
  go();
}
/** Stop the bed without forgetting that the player still wants sound, and without creating a context. */
export function pauseAmbience() {
  stopBed();
}
/** Continue only if a gesture already created the context and sound is still wanted. */
export function resumeAmbience() {
  if (!wantEnabled || !ctx || typeof document === "undefined" || document.hidden) return;
  if (ctx.state === "suspended") {
    void ctx.resume().then(settle).catch(() => undefined);
    return;
  }
  settle();
}
