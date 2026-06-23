import type { Scenario } from "./types";

// The Haunt deck — 6 schemes, each rewriting the stakes with real mechanics.
// Mechanics are read at runtime via scenarioFor(scenarioId) so functions never persist.
export const SCENARIOS: Scenario[] = [
  {
    id: "collector",
    name: "THE COLLECTOR",
    subtitle: "It has always been keeping you.",
    reveal:
      "The walls were never walls. They were shelves. The Collector turns its lamp on you — the Hunt doubles, and every Hollow that touches you will pocket your light.",
    rule: "The Hunt doubles. Hollows steal Light on contact.",
    accent: "#7a5cff",
    dreadSpike: 14,
    gloomSurge: 0,
    hollowDouble: true,
    hollowSteal: true,
  },
  {
    id: "flood",
    name: "THE FLOOD",
    subtitle: "The dark learned to pour.",
    reveal:
      "Far off, a seam gives way. The Gloom is no longer creeping — it is rising, twice as fast, and the Wards you leave unguarded will gutter out behind you.",
    rule: "The Gloom advances twice each round. Unguarded Wards decay.",
    accent: "#2f6fb0",
    dreadSpike: 10,
    gloomSurge: 1,
    gloomDouble: true,
    wardDecay: true,
  },
  {
    id: "mimic",
    name: "THE MIMIC",
    subtitle: "One of these Wards is lying.",
    reveal:
      "It has been wearing the shape of safety. One of the three Wards is false — kindle it and the dark laughs in Dread. Find the two that are true.",
    rule: "One Ward is false: kindling it spikes Dread and never counts. The Heart opens on the two true Wards.",
    accent: "#3fae8e",
    dreadSpike: 12,
    gloomSurge: 0,
    mimicWard: true,
  },
  {
    id: "longnight",
    name: "THE LONG NIGHT",
    subtitle: "Dawn was a rumor.",
    reveal:
      "There is no morning coming. The whole board goes to gloom at once — but the dark, gorged, slows. Dread will not rise. This is a sprint through the dark to the Heart.",
    rule: "Dread freezes. The whole board turns Tainted. Flooding slows — race to the Heart.",
    accent: "#5a4a78",
    dreadSpike: 18,
    gloomSurge: 0,
    longNight: true,
  },
  {
    id: "famine",
    name: "THE FAMINE",
    subtitle: "The light runs out.",
    reveal:
      "The shared Lantern has a wound in it you cannot see. It leaks now, every round, into the dark. Every flame you hold has become precious beyond counting.",
    rule: "The shared Lantern leaks 2 Light every round.",
    accent: "#c0653a",
    dreadSpike: 13,
    gloomSurge: 0,
    lanternLeak: 2,
  },
  {
    id: "narrow-gate",
    name: "THE GATE IS NARROW",
    subtitle: "It will not open for everyone.",
    reveal:
      "The Heart speaks now, and it speaks in arithmetic. When the Ritual completes, the Gate opens for only those standing upon it — and not all of you will fit. Choose who.",
    rule: "Finite escape: only those on the Heart at Ritual's end get out — and not enough room for all.",
    accent: "#9a3b5a",
    dreadSpike: 15,
    gloomSurge: 0,
    finite: true,
  },
];

export function drawScenario(): Scenario {
  return SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
}

export function scenarioById(id: string | null): Scenario | null {
  return SCENARIOS.find((s) => s.id === id) ?? null;
}

// finite-escape capacity for a given player count (only used by finite scenarios)
export function gateCapacity(players: number): number {
  return Math.max(1, players - 1);
}
