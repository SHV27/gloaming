import { create } from "zustand";

export const reducedMotion =
  typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;

export type BurstKind = "light" | "ward" | "mote" | "claim";
export interface Burst {
  id: number;
  x: number; // board-space (0..1000 / 0..720)
  y: number;
  kind: BurstKind;
  color: string;
  n: number;
}

interface FxState {
  shakeNonce: number;
  shakeIntensity: number;
  punchNonce: number;
  punchScale: number;
  flashNonce: number;
  flashColor: string;
  flashStrength: number;
  bursts: Burst[];
  shake: (intensity?: number) => void;
  punch: (scale?: number) => void;
  flash: (color: string, strength?: number) => void;
  burst: (x: number, y: number, kind: BurstKind, color: string, n?: number) => void;
  clearBurst: (id: number) => void;
}

let burstId = 0;

export const useFx = create<FxState>((set) => ({
  shakeNonce: 0,
  shakeIntensity: 0,
  punchNonce: 0,
  punchScale: 1,
  flashNonce: 0,
  flashColor: "#000",
  flashStrength: 0,
  bursts: [],
  shake: (intensity = 0.5) => {
    if (reducedMotion) {
      set((s) => ({ flashNonce: s.flashNonce + 1, flashColor: "#C2412D", flashStrength: 0.15 + intensity * 0.2 }));
      return;
    }
    set((s) => ({ shakeNonce: s.shakeNonce + 1, shakeIntensity: intensity }));
  },
  punch: (scale = 1.04) => {
    if (reducedMotion) return;
    set((s) => ({ punchNonce: s.punchNonce + 1, punchScale: scale }));
  },
  flash: (color, strength = 0.3) => set((s) => ({ flashNonce: s.flashNonce + 1, flashColor: color, flashStrength: strength })),
  burst: (x, y, kind, color, n = 10) => set((s) => ({ bursts: [...s.bursts, { id: ++burstId, x, y, kind, color, n: reducedMotion ? Math.min(4, n) : n }] })),
  clearBurst: (id) => set((s) => ({ bursts: s.bursts.filter((b) => b.id !== id) })),
}));
