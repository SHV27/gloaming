import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RoleId } from "@/game/roles";

export interface RunSummary {
  won: boolean;
  rounds: number;
  scenario: string | null;
  roles: RoleId[];
  litAllWards: boolean;
  escapedCount: number;
}

interface ProfileState {
  gamesPlayed: number;
  wins: number;
  totalEscapes: number;
  longestSurvival: number; // rounds
  roleCounts: Record<string, number>;
  unlocked: string[]; // theme ids
  theme: string; // selected theme id
  guided: boolean; // prefer Guided Game
  // settings
  setTheme: (id: string) => void;
  setGuided: (v: boolean) => void;
  recordRun: (r: RunSummary) => string[]; // returns newly-unlocked theme ids
}

function evalUnlocks(s: Pick<ProfileState, "gamesPlayed" | "totalEscapes" | "unlocked"> & { litAll: boolean }): string[] {
  const out: string[] = [];
  const has = (id: string) => s.unlocked.includes(id) || out.includes(id);
  if (s.totalEscapes >= 1 && !has("emberfall")) out.push("emberfall");
  if (s.gamesPlayed >= 3 && !has("bonefrost")) out.push("bonefrost");
  if (s.litAll && !has("wormwood")) out.push("wormwood");
  return out;
}

export const useProfile = create<ProfileState>()(
  persist(
    (set, get) => ({
      gamesPlayed: 0,
      wins: 0,
      totalEscapes: 0,
      longestSurvival: 0,
      roleCounts: {},
      unlocked: ["lantern"],
      theme: "lantern",
      guided: true,
      setTheme: (id) => set({ theme: id }),
      setGuided: (v) => set({ guided: v }),
      recordRun: (r) => {
        const s = get();
        const roleCounts = { ...s.roleCounts };
        r.roles.forEach((id) => (roleCounts[id] = (roleCounts[id] ?? 0) + 1));
        const gamesPlayed = s.gamesPlayed + 1;
        const totalEscapes = s.totalEscapes + r.escapedCount;
        const longestSurvival = Math.max(s.longestSurvival, r.rounds);
        const newly = evalUnlocks({ gamesPlayed, totalEscapes, unlocked: s.unlocked, litAll: r.litAllWards });
        set({
          gamesPlayed,
          wins: s.wins + (r.won ? 1 : 0),
          totalEscapes,
          longestSurvival,
          roleCounts,
          unlocked: [...s.unlocked, ...newly],
        });
        return newly;
      },
    }),
    { name: "gloaming-profile-v1" },
  ),
);

export function favoriteRole(roleCounts: Record<string, number>): RoleId | null {
  const entries = Object.entries(roleCounts);
  if (!entries.length) return null;
  return entries.sort((a, b) => b[1] - a[1])[0][0] as RoleId;
}
