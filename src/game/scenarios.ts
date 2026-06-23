import type { Scenario } from "./types";

// The Haunt deck. One is drawn the first time the Omen track fills.
// Each rewrites the stakes for THIS session → every game tells a different story.
export const SCENARIOS: Scenario[] = [
  {
    id: "collector",
    name: "THE COLLECTOR",
    subtitle: "It has always been keeping you.",
    reveal:
      "The walls were never walls. They were shelves. The Collector turns its lamp on you — it only has room for some of you, and it has already chosen its favorites.",
    ritualGoal: 5,
    escapeCapacity: (p) => Math.max(1, p - 1), // one gets left on the shelf
    dreadSpike: 18,
    gloomSurge: 1,
    accent: "#7a5cff",
  },
  {
    id: "flood",
    name: "THE FLOOD",
    subtitle: "The dark learned to pour.",
    reveal:
      "Far off, a seam gives way. The Gloom is no longer creeping — it is rising. Higher every breath. Reach the Heart before the floor goes under for good.",
    ritualGoal: 4,
    escapeCapacity: (p) => p,
    dreadSpike: 14,
    gloomSurge: 2, // floods faster
    accent: "#2f6fb0",
  },
  {
    id: "mimic",
    name: "THE MIMIC",
    subtitle: "One of these lanterns is lying.",
    reveal:
      "It has been wearing the shape of safety. The caches you trusted now trust nothing back. The Mimic wants the ritual to fail — and it knows the words too.",
    ritualGoal: 6,
    escapeCapacity: (p) => p,
    dreadSpike: 16,
    gloomSurge: 1,
    accent: "#3fae8e",
  },
  {
    id: "longnight",
    name: "THE LONG NIGHT",
    subtitle: "Dawn was a rumor.",
    reveal:
      "There is no morning coming. There was never a morning coming. Every light you hold is a debt against a dark that does not forgive. Finish, or join the night.",
    ritualGoal: 5,
    escapeCapacity: (p) => p,
    dreadSpike: 22, // brutal dread
    gloomSurge: 1,
    accent: "#5a4a78",
  },
  {
    id: "bargain",
    name: "THE BARGAIN",
    subtitle: "It would love to make a deal.",
    reveal:
      "The Heart speaks now, and it speaks in offers. It will let some of you go cheaply — if the rest pay dearly. Not everyone walks out whole, and the board prefers it that way.",
    ritualGoal: 5,
    escapeCapacity: (p) => Math.max(1, Math.ceil(p / 2)),
    dreadSpike: 17,
    gloomSurge: 1,
    accent: "#c0653a",
  },
  {
    id: "harvest",
    name: "THE HARVEST",
    subtitle: "You were planted here.",
    reveal:
      "Now you understand the lanterns. Now you understand the names on the wall. You are not the first crop, and the Gloom is so very ready to bring you in.",
    ritualGoal: 6,
    escapeCapacity: (p) => p,
    dreadSpike: 15,
    gloomSurge: 2,
    accent: "#9a3b5a",
  },
];

export function drawScenario(): Scenario {
  return SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
}
