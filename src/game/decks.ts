import type { NodeKind, SearchToken, TokenKind } from "./types";

// Search "pocket" tokens. Drawn one at a time in the push-your-luck Search.
const LIGHT_TOKENS: SearchToken[] = [
  { kind: "light", title: "A Guttering Candle", text: "Cupped against the dark. It holds.", light: 1 },
  { kind: "light", title: "Oil in the Well", text: "Enough to keep a flame honest a while longer.", light: 2 },
  { kind: "light", title: "Embers in the Ash", text: "You breathe on them until they remember.", light: 1 },
  { kind: "light", title: "Phosphor Bloom", text: "Cold pale fungus-light. It still counts.", light: 1 },
  { kind: "light", title: "The Keeper's Tithe", text: "An offering bowl, still full.", light: 2, lantern: 1 },
];

const RELIC_TOKENS: SearchToken[] = [
  { kind: "relic", title: "Wardbreaker Salt", text: "Flung at the nearest dark, it recoils — a tile burns clean.", lantern: 0 },
  { kind: "relic", title: "The Long Match", text: "A flare that feeds the shared Lantern and pushes the Gloom back a step.", lantern: 2 },
  { kind: "relic", title: "A Saint's Knuckle", text: "Old bone, warm to the touch. The dark gives you room.", lantern: 1, light: 1 },
];

const OMEN_TOKENS: SearchToken[] = [
  { kind: "omen", title: "The Clock With No Hands", text: "It ticks anyway. Counting down to you.", light: 1 },
  { kind: "omen", title: "Thirteen Crows, One Eye", text: "They turn to watch as one.", light: 0 },
  { kind: "omen", title: "The Mirror Lies", text: "Your reflection is one step behind. Then it isn't.", light: 0 },
  { kind: "omen", title: "The Names on the Wall", text: "Scratched fresh. Yours is being added.", light: 0 },
];

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Probability of each token kind, biased by the node's nature.
function weights(kind: NodeKind | undefined): Record<TokenKind, number> {
  switch (kind) {
    case "cache":
      return { light: 0.7, relic: 0.16, omen: 0.14 };
    case "hazard":
      return { light: 0.42, relic: 0.08, omen: 0.5 };
    case "threshold":
      return { light: 0.55, relic: 0.1, omen: 0.35 };
    case "ward":
      return { light: 0.5, relic: 0.12, omen: 0.38 };
    default:
      return { light: 0.58, relic: 0.1, omen: 0.32 };
  }
}

export function drawToken(kind: NodeKind | undefined): SearchToken {
  const w = weights(kind);
  const r = Math.random();
  if (r < w.omen) return pick(OMEN_TOKENS);
  if (r < w.omen + w.relic) return pick(RELIC_TOKENS);
  return pick(LIGHT_TOKENS);
}
