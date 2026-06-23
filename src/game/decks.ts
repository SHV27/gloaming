import type { Card } from "./types";

// The Manifestation deck. Hand-authored, in-voice. Drawn on node resolution.
// Weighted by appearing multiple times implicitly via the spread of kinds.
export const MANIFESTATION_DECK: Card[] = [
  // caches — the Light you live and die by
  { id: "c1", title: "A Guttering Candle", kind: "cache", text: "Someone left it burning. You cup the flame and carry it on.", light: 2 },
  { id: "c2", title: "The Forgotten Lantern", kind: "cache", text: "Oil still in the well. The dark hates this.", light: 3 },
  { id: "c3", title: "Embers in the Ash", kind: "cache", text: "You breathe on them until they remember how to glow.", light: 2 },
  { id: "c4", title: "A Match, the Last One", kind: "cache", text: "One strike. One chance. It catches.", light: 1, lantern: 1 },
  { id: "c5", title: "Phosphor Bloom", kind: "boon", text: "Pale fungus lights the wall. Cold, but it counts.", light: 2 },
  { id: "c6", title: "The Keeper's Tithe", kind: "cache", text: "An old offering bowl, still full of light.", lantern: 3 },

  // hazards — the dark bites back
  { id: "h1", title: "A Hand from the Floor", kind: "hazard", text: "It closes around your ankle. You tear free, but it took something.", light: -2, dread: 4 },
  { id: "h2", title: "The Cold That Thinks", kind: "hazard", text: "It studies you. The studying is the wound.", dread: 6 },
  { id: "h3", title: "Spilled Oil", kind: "hazard", text: "Your light runs out across the stone and drowns.", light: -2 },
  { id: "h4", title: "The Long Fall", kind: "hazard", text: "The floor was never there. You climb back up changed.", light: -1, dread: 5 },
  { id: "h5", title: "Whispering Mold", kind: "hazard", text: "It says your name in your own voice. You drop the lantern.", lantern: -2, dread: 3 },
  { id: "h6", title: "A Door That Wasn't", kind: "hazard", text: "You walk through it and arrive nowhere good.", dread: 5 },

  // omens — the Haunt creeps closer
  { id: "o1", title: "The Clock With No Hands", kind: "omen", text: "It ticks anyway. Something is counting down to you.", omen: 1, dread: 2 },
  { id: "o2", title: "Thirteen Crows, One Eye", kind: "omen", text: "They turn to watch as one. The board is taking notes.", omen: 1, dread: 2 },
  { id: "o3", title: "The Mirror Lies", kind: "omen", text: "Your reflection is one step behind. Then it isn't.", omen: 1, dread: 3 },
  { id: "o4", title: "A Tooth in the Bread", kind: "omen", text: "Not yours. Not anyone's you'd want to meet.", omen: 1, light: 1 },
  { id: "o5", title: "The Names on the Wall", kind: "omen", text: "Scratched fresh. Yours is being added even now.", omen: 2, dread: 4 },

  // manifestations — they spawn and stay
  { id: "m1", title: "THE GNAW", kind: "manifest", text: "It uncurls from the corner. It is hungry and it is patient.", manifest: "The Gnaw", dread: 5, omen: 1 },
  { id: "m2", title: "THE HOLLOW CHOIR", kind: "manifest", text: "Voices with no mouths fill the room. They learn the hymn quickly.", manifest: "The Hollow Choir", dread: 4, lantern: -1 },
  { id: "m3", title: "THE TALL VISITOR", kind: "manifest", text: "It has to fold to fit the doorway. It does not mind folding.", manifest: "The Tall Visitor", dread: 6, omen: 1 },
];

// distinct piles so we can bias draws by node kind without losing variety
export const CACHE_CARDS = MANIFESTATION_DECK.filter((c) => c.kind === "cache" || c.kind === "boon");
export const HAZARD_CARDS = MANIFESTATION_DECK.filter((c) => c.kind === "hazard");
export const OMEN_CARDS = MANIFESTATION_DECK.filter((c) => c.kind === "omen" || c.kind === "manifest");

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
