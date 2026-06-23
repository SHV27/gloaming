import type { Scenario } from "./types";

// The Haunt deck (cinematic reveal + Dread/Gloom shift). Per-scenario rule rewrites
// are deferred to Session 3; this session keeps the act-break drama and pressure jump.
export const SCENARIOS: Scenario[] = [
  {
    id: "collector",
    name: "THE COLLECTOR",
    subtitle: "It has always been keeping you.",
    reveal:
      "The walls were never walls. They were shelves. The Collector turns its lamp on you — and the Hunt remembers it is hungry.",
    dreadSpike: 16,
    gloomSurge: 1,
    accent: "#7a5cff",
  },
  {
    id: "flood",
    name: "THE FLOOD",
    subtitle: "The dark learned to pour.",
    reveal:
      "Far off, a seam gives way. The Gloom is no longer creeping — it is rising, higher every breath. Reach the Heart before the floor goes under.",
    dreadSpike: 12,
    gloomSurge: 2,
    accent: "#2f6fb0",
  },
  {
    id: "longnight",
    name: "THE LONG NIGHT",
    subtitle: "Dawn was a rumor.",
    reveal:
      "There is no morning coming. There never was. Every light you hold is a debt against a dark that does not forgive. Finish, or join the night.",
    dreadSpike: 20,
    gloomSurge: 1,
    accent: "#5a4a78",
  },
  {
    id: "harvest",
    name: "THE HARVEST",
    subtitle: "You were planted here.",
    reveal:
      "Now you understand the Wards. Now you understand the names on the wall. You are not the first crop, and the dark is so very ready to bring you in.",
    dreadSpike: 15,
    gloomSurge: 2,
    accent: "#9a3b5a",
  },
];

export function drawScenario(): Scenario {
  return SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
}
