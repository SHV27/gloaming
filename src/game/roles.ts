export type RoleId = "lampwright" | "cartographer" | "warden" | "forsaken";

export interface Role {
  id: RoleId;
  name: string;
  fantasy: string; // one-line identity
  blurb: string; // what the ability does, in plain words
  color: string; // token / identity color
  sigil: string; // single glyph used on the token & cards
  // tunable, data-driven ability knobs (defaults in comments)
  searchLightBonus: number; // +Light per non-omen token drawn (default 0)
  moveBonus: number; // +movement on roll (default 0)
  burnCost: number; // Lantern cost to Burn back the Gloom (default 3)
  woundsMax: number; // Wounds before Claimed (default 3)
  searchCollapseAt: number; // omens-in-one-Search that collapse the tile (default 2)
  foresight: boolean; // sees the Gloom's next spread (Hunt is telegraphed for all)
  whisperPriority: boolean; // the Whisper targets this Survivor first
  hint: string; // contextual teaching line on first ability use
}

export const ROLES: Record<RoleId, Role> = {
  lampwright: {
    id: "lampwright",
    name: "The Lampwright",
    fantasy: "The group's battery. Where she digs, light follows.",
    blurb: "Every Light you Search yields +1. You are how the others stay lit.",
    color: "#F5A623",
    sigil: "✷",
    searchLightBonus: 1,
    moveBonus: 0,
    burnCost: 3,
    woundsMax: 3,
    searchCollapseAt: 2,
    foresight: false,
    whisperPriority: false,
    hint: "Lampwright: each Light token you draw is worth +1. Search greedily — you fund the whole escape.",
  },
  cartographer: {
    id: "cartographer",
    name: "The Cartographer",
    fantasy: "The brain. She reads the dark before it moves.",
    blurb: "+1 movement, and you foresee the Gloom's next spread (dimmed tiles) — plan the routes.",
    color: "#7AB8FF",
    sigil: "✦",
    searchLightBonus: 0,
    moveBonus: 1,
    burnCost: 3,
    woundsMax: 3,
    searchCollapseAt: 2,
    foresight: true,
    whisperPriority: false,
    hint: "Cartographer: the faintly-pulsing tiles are where the Gloom spreads NEXT round. Route the group around them.",
  },
  warden: {
    id: "warden",
    name: "The Warden",
    fantasy: "The shield. He stands where it's worst and holds.",
    blurb: "Burn back the Gloom for 2 Light instead of 3, and survive one extra Wound.",
    color: "#8BE0B0",
    sigil: "✚",
    searchLightBonus: 0,
    moveBonus: 0,
    burnCost: 2,
    woundsMax: 4,
    searchCollapseAt: 2,
    foresight: false,
    whisperPriority: false,
    hint: "Warden: you Burn the Gloom for 2 (not 3) and take 4 Wounds before being Claimed. Hold the front line.",
  },
  forsaken: {
    id: "forsaken",
    name: "The Forsaken",
    fantasy: "The one who opened the board. The dark knows your name best.",
    blurb: "Your Search collapses only on the THIRD omen — press deeper. But the Whisper always comes for you.",
    color: "#E083C0",
    sigil: "✸",
    searchLightBonus: 0,
    moveBonus: 0,
    burnCost: 3,
    woundsMax: 3,
    searchCollapseAt: 3,
    foresight: false,
    whisperPriority: true,
    hint: "Forsaken: you can push your luck one omen further — the tile collapses on the 3rd, not the 2nd. The dark will tempt you first.",
  },
};

export const ROLE_LIST: Role[] = [ROLES.lampwright, ROLES.cartographer, ROLES.warden, ROLES.forsaken];

export function role(id: RoleId): Role {
  return ROLES[id];
}
