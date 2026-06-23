import { create } from "zustand";
import { persist } from "zustand/middleware";

interface HintState {
  seen: Record<string, boolean>;
  see: (id: string) => void;
  resetHints: () => void;
}

// First-time teaching flags. Persisted across games so we only teach once.
export const useHints = create<HintState>()(
  persist(
    (set) => ({
      seen: {},
      see: (id) => set((s) => ({ seen: { ...s.seen, [id]: true } })),
      resetHints: () => set({ seen: {} }),
    }),
    { name: "gloaming-hints-v2" },
  ),
);
