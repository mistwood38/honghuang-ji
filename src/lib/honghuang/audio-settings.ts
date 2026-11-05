import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AudioMix = {
  music: boolean;
  effects: boolean;
  musicVolume: number;
  effectsVolume: number;
};
export const DEFAULT_MIX: AudioMix = {
  music: true,
  effects: true,
  musicVolume: 0.55,
  effectsVolume: 0.35,
};
export function normalizeMix(raw: unknown): AudioMix {
  const value = raw && typeof raw === "object" ? (raw as Partial<AudioMix>) : {};
  const volume = (n: unknown, fallback: number) =>
    typeof n === "number" && Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : fallback;
  return {
    music: typeof value.music === "boolean" ? value.music : true,
    effects: typeof value.effects === "boolean" ? value.effects : true,
    musicVolume: volume(value.musicVolume, DEFAULT_MIX.musicVolume),
    effectsVolume: volume(value.effectsVolume, DEFAULT_MIX.effectsVolume),
  };
}
export const useAudioMix = create<AudioMix & { update: (value: Partial<AudioMix>) => void }>()(
  persist(
    (set) => ({
      ...DEFAULT_MIX,
      update: (value) => set((state) => normalizeMix({ ...state, ...value })),
    }),
    {
      name: "honghuang-ji-audio",
      skipHydration: true,
      merge: (saved, current) => ({ ...current, ...normalizeMix(saved) }),
    },
  ),
);
