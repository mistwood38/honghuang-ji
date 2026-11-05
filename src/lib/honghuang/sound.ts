import { DEFAULT_MIX, normalizeMix, type AudioMix } from "./audio-settings.ts";
import { MUSIC, type MusicCue } from "./music.ts";

export type UiSound = "tap" | "confirm" | "tab" | "panel" | "item" | "skill";
let mix: AudioMix = { ...DEFAULT_MIX };
let lastUiAt = -Infinity;

let ctx: AudioContext | null = null;
let wantEnabled = false;
let wantCue: MusicCue = "title";
let listening = false;
let token = 0;
let pendingCue: MusicCue | null = null;
let bed: { cue: MusicCue; gain: GainNode; stop: (at: number) => void } | null = null;
let cached: { src: string; buffer: AudioBuffer } | null = null;
const uiCache: Partial<Record<UiSound, AudioBuffer>> = {};
const positions = new Map<string, number>();
const activeUi = new Set<AudioBufferSourceNode>();

function stopUi() {
  for (const source of activeUi) {
    try {
      source.stop();
    } catch {
      /* already ended */
    }
  }
  activeUi.clear();
}

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
  if (typeof document === "undefined") return;
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
      stopUi();
      return;
    }
    const audio = ctx;
    if (!audio) return;
    if (audio.state === "suspended") {
      void audio
        .resume()
        .then(settle)
        .catch(() => undefined);
      return;
    }
    settle();
  });
}

/** Gesture-only. Does nothing if the context cannot be created. */
export function unlockSound() {
  const audio = createContext();
  if (!audio) return;
  if (audio.state === "suspended")
    void audio
      .resume()
      .then(settle)
      .catch(() => undefined);
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
  if (!mix.music || mix.musicVolume <= 0) return;
  if (bed && MUSIC[bed.cue].src === MUSIC[cue].src) {
    if (pendingCue) {
      token += 1;
      pendingCue = null;
    }
    bed.cue = cue;
    bed.gain.gain.setTargetAtTime(MUSIC[cue].level * mix.musicVolume, audio.currentTime, 0.12);
    return;
  }
  if (bed?.cue === cue || pendingCue === cue) return;
  const mine = ++token;
  pendingCue = cue;
  const spec = MUSIC[cue];
  try {
    const buffer = await loadBuffer(audio, spec.src);
    if (
      mine !== token ||
      !wantEnabled ||
      !mix.music ||
      mix.musicVolume <= 0 ||
      wantCue !== cue ||
      audio.state !== "running"
    )
      return;
    if (typeof document !== "undefined" && document.hidden) return;
    if (bed) bed.stop(audio.currentTime + 0.9);
    const source = audio.createBufferSource();
    const gain = audio.createGain();
    source.buffer = buffer;
    source.loop = true;
    const now = audio.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(spec.level * mix.musicVolume, now + 1.1);
    source.connect(gain);
    gain.connect(audio.destination);
    const offset = (positions.get(spec.src) ?? 0) % buffer.duration;
    source.start(0, offset);
    source.onended = () => {
      source.disconnect();
      gain.disconnect();
    };
    pendingCue = null;
    bed = {
      cue,
      gain,
      stop: (at) => {
        positions.set(spec.src, (offset + audio.currentTime - now) % buffer.duration);
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
    stopUi();
    return;
  }
  if (!ctx || ctx.state !== "running") return;
  void startBed(ctx, cue);
}

const UI_SRC: Record<UiSound, string> = {
  tap: "/audio/ui-soft-tap.ogg",
  confirm: "/audio/ui-soft-confirm.ogg",
  tab: "/audio/ui-soft-tab.ogg",
  panel: "/audio/ui-soft-panel.ogg",
  item: "/audio/ui-soft-item.ogg",
  skill: "/audio/ui-soft-skill.ogg",
};

/** Short interface sound. Call only from a gesture, and only when sound is on. */
export function setAudioMix(value: AudioMix) {
  mix = normalizeMix(value);
  if (!mix.effects || mix.effectsVolume === 0) stopUi();
  if (!mix.music || mix.musicVolume === 0) {
    stopBed(0.2);
    return;
  }
  if (bed && ctx)
    bed.gain.gain.setTargetAtTime(MUSIC[bed.cue].level * mix.musicVolume, ctx.currentTime, 0.12);
  else settle();
}

export function playUi(kind: UiSound) {
  if (!mix.effects || mix.effectsVolume <= 0) return;
  const audio = createContext();
  if (!audio) return;
  const go = () => {
    if (audio.state !== "running" || audio.currentTime - lastUiAt < 0.07) return;
    lastUiAt = audio.currentTime;
    void playBuffer(audio, kind);
    if (wantEnabled && !document.hidden) void startBed(audio, wantCue);
  };
  if (audio.state === "suspended") {
    void audio
      .resume()
      .then(go)
      .catch(() => undefined);
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
    if (!wantEnabled || !mix.effects || document.hidden) return;
    const source = audio.createBufferSource();
    const gain = audio.createGain();
    source.buffer = buffer;
    gain.gain.value = mix.effectsVolume;
    source.connect(gain);
    gain.connect(audio.destination);
    activeUi.add(source);
    source.onended = () => {
      activeUi.delete(source);
      source.disconnect();
      gain.disconnect();
    };
    source.start();
  } catch {
    /* missing asset or closed context */
  }
}

/** Stop the bed without forgetting that the player still wants sound, and without creating a context. */
export function pauseAmbience() {
  stopBed(0.12);
  stopUi();
}

/** Continue only if a gesture already created the context and sound is still wanted. */
export function resumeAmbience() {
  if (!wantEnabled || !ctx || typeof document === "undefined" || document.hidden) return;
  if (ctx.state === "suspended") {
    void ctx
      .resume()
      .then(settle)
      .catch(() => undefined);
    return;
  }
  settle();
}
