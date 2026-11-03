import { MUSIC, type MusicCue } from "./music.ts";

export type UiSound = "tap" | "confirm";

let ctx: AudioContext | null = null;
let wantEnabled = false;
let wantCue: MusicCue = "title";
let listening = false;
let token = 0;
let pendingCue: MusicCue | null = null;
let bed: { cue: MusicCue; stop: (at: number) => void } | null = null;
let cached: { src: string; buffer: AudioBuffer } | null = null;
const uiCache: Partial<Record<UiSound, AudioBuffer>> = {};

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

export function audioContextExists() {
  return ctx !== null;
}

function stopBed(fade = 0.2) {
  token += 1;
  pendingCue = null;
  const current = bed;
  bed = null;
  const audio = ctx;
  if (!current || !audio) return;
  current.stop(audio.currentTime + fade);
}

function settle() {
  const audio = ctx;
  if (!audio || !wantEnabled || document.hidden || audio.state !== "running") {
    if (!wantEnabled || document.hidden) stopBed(0.15);
    return;
  }
  void startBed(audio, wantCue);
}

function watchVisibility() {
  if (listening || typeof document === "undefined") return;
  listening = true;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden || !wantEnabled) {
      stopBed(0.12);
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

async function loadBuffer(audio: AudioContext, src: string) {
  if (cached?.src === src) return cached.buffer;
  const response = await fetch(src);
  if (!response.ok) throw new Error(src);
  const buffer = await audio.decodeAudioData(await response.arrayBuffer());
  cached = { src, buffer };
  return buffer;
}

async function startBed(audio: AudioContext, cue: MusicCue) {
  if (bed?.cue === cue || pendingCue === cue) return;
  const mine = ++token;
  pendingCue = cue;
  if (bed) {
    const previous = bed;
    bed = null;
    previous.stop(audio.currentTime + 0.9);
  }
  const spec = MUSIC[cue];
  try {
    const buffer = await loadBuffer(audio, spec.src);
    if (mine !== token || !wantEnabled || wantCue !== cue || audio.state !== "running") return;
    if (typeof document !== "undefined" && document.hidden) return;
    const source = audio.createBufferSource();
    const gain = audio.createGain();
    source.buffer = buffer;
    source.loop = true;
    const now = audio.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(spec.level, now + 1.1);
    source.connect(gain);
    gain.connect(audio.destination);
    source.start();
    pendingCue = null;
    bed = {
      cue,
      stop: (at) => {
        const when = Math.max(at, audio.currentTime);
        try {
          gain.gain.cancelScheduledValues(audio.currentTime);
          const current = Math.max(gain.gain.value, 0.0001);
          gain.gain.setValueAtTime(current, audio.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, when);
          source.stop(when + 0.05);
        } catch {
          /* context already closed */
        }
      },
    };
  } catch {
    if (mine === token) pendingCue = null;
  }
}

/** Remember the wanted bed. Never constructs an AudioContext. */
export function setAmbience(enabled: boolean, cue: MusicCue = "mist") {
  wantEnabled = enabled;
  wantCue = cue;
  watchVisibility();
  if (!enabled || typeof document === "undefined" || document.hidden) {
    stopBed(enabled ? 0.15 : 0.25);
    return;
  }
  if (!ctx || ctx.state !== "running") return;
  void startBed(ctx, cue);
}

const UI_SRC: Record<UiSound, string> = {
  tap: "/audio/ui-tap.ogg",
  confirm: "/audio/ui-confirm.ogg",
};

/** Short interface sound. Call only from a gesture, and only when sound is on. */
export function playUi(kind: UiSound) {
  const audio = createContext();
  if (!audio) return;
  const go = () => {
    if (audio.state !== "running") return;
    void playBuffer(audio, kind);
    if (wantEnabled && !document.hidden) void startBed(audio, wantCue);
  };
  if (audio.state === "suspended") {
    void audio.resume().then(go).catch(() => undefined);
    return;
  }
  go();
}

async function playBuffer(audio: AudioContext, kind: UiSound) {
  try {
    let buffer = uiCache[kind];
    if (!buffer) {
      const response = await fetch(UI_SRC[kind]);
      if (!response.ok) return;
      buffer = await audio.decodeAudioData(await response.arrayBuffer());
      uiCache[kind] = buffer;
    }
    const source = audio.createBufferSource();
    const gain = audio.createGain();
    source.buffer = buffer;
    gain.gain.value = kind === "confirm" ? 0.55 : 0.38;
    source.connect(gain);
    gain.connect(audio.destination);
    source.start();
  } catch {
    /* missing asset or closed context */
  }
}

/** Stop the bed without forgetting that the player still wants sound, and without creating a context. */
export function pauseAmbience() {
  stopBed(0.12);
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
