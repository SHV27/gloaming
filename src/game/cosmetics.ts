// Cosmetic-only, data-driven. Themes recolor the world; they NEVER touch the rules.
// Unlocked by playing (see profile store). Architecture is ready for paid cosmetic
// packs later — but nothing here gates or alters gameplay. See MONETIZATION.md.

export interface Theme {
  id: string;
  name: string;
  blurb: string;
  unlock: string; // human-readable unlock condition ("" = always available)
  vars: {
    ember: string;
    emberBright: string;
    rot: string;
    accent: string; // default Gloom body color when no Haunt accent is set
  };
}

export const THEMES: Theme[] = [
  {
    id: "lantern",
    name: "Lantern",
    blurb: "The original dying-lantern dark. Warm amber against cold violet rot.",
    unlock: "",
    vars: { ember: "#F5A623", emberBright: "#FFD27A", rot: "#3B2A57", accent: "#4a2f6e" },
  },
  {
    id: "emberfall",
    name: "Emberfall",
    blurb: "A forge gone cold. Molten copper light bleeding into ash.",
    unlock: "Escape once",
    vars: { ember: "#FF7A3C", emberBright: "#FFC07A", rot: "#4a2438", accent: "#6e2f3f" },
  },
  {
    id: "bonefrost",
    name: "Bonefrost",
    blurb: "The Long Night made permanent. Pale witchlight over a drowned blue dark.",
    unlock: "Play 3 games",
    vars: { ember: "#7CE0D0", emberBright: "#C8FFF4", rot: "#27406b", accent: "#2f5a8a" },
  },
  {
    id: "wormwood",
    name: "Wormwood",
    blurb: "Something grew in the dark and learned to glow. Sickly green over rot.",
    unlock: "Light all 3 Wards in one game",
    vars: { ember: "#B6E04A", emberBright: "#E6FF9A", rot: "#2f3b22", accent: "#3f5a2a" },
  },
];

export function themeById(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
