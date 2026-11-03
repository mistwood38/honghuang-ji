import type { SceneMood } from "./visuals";

let ctx: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;
let bedMood: SceneMood | null = null;
let bedStop: (() => void) | null = null;
let wantEnabled = false;
let wantMood: SceneMood = "mist";
let listening = false;

function context(): AudioContext | null {
  if (typeof window === "undefined" || !window.AudioContext) return null;
  try {
    if (!ctx) ctx = new window.AudioContext();
    return ctx;
  } catch {
    return null;
  }
}
function watchVisibility() {
  if (listening || typeof document === "undefined") return;
  listening = true;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopBed();
    else if (wantEnabled) setAmbience(true, wantMood);
  });
}
export function unlockSound() {
  const audio = context();
  if (audio?.state === "suspended") void audio.resume().catch(() => undefined);
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
function stopBed() {
  bedStop?.();
  bedStop = null;
  bedMood = null;
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
  noiseGain.gain.value = 0.35;
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(master);
  noise.start();
  nodes.push(noise, filter, noiseGain);
  master.gain.exponentialRampToValueAtTime(spec.level, audio.currentTime + 0.6);
  bedMood = mood;
  bedStop = () => {
    const now = audio.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
    window.setTimeout(() => {
      nodes.forEach((node) => {
        if (node instanceof OscillatorNode || node instanceof AudioBufferSourceNode) {
          try {
            node.stop();
          } catch {
            /* already stopped */
          }
        }
        node.disconnect();
      });
    }, 280);
  };
}
/** Continuous synthesized air for the current scene. Not a recorded score. No autoplay: it starts only after a gesture has resumed the audio context. */
export function setAmbience(enabled: boolean, mood: SceneMood = "mist") {
  wantEnabled = enabled;
  wantMood = mood;
  watchVisibility();
  const audio = context();
  if (!audio || !enabled || document.hidden) {
    stopBed();
    return;
  }
  const go = () => {
    if (!wantEnabled || wantMood !== mood || document.hidden) return;
    startBed(audio, mood);
  };
  if (audio.state === "suspended") {
    void audio.resume().then(go).catch(() => undefined);
    return;
  }
  go();
}
/** Bronze chimes for a choice. Always called from a user gesture. */
export function playChoice(enabled: boolean, mood: SceneMood = "mist") {
  if (!enabled) return;
  const audio = context();
  if (!audio) return;
  const go = () => {
    chime(audio, mood);
    if (wantEnabled) setAmbience(true, mood);
  };
  if (audio.state === "suspended") {
    void audio.resume().then(go).catch(() => undefined);
    return;
  }
  go();
}
