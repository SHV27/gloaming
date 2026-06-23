import type { DreadTier } from "./types";

// The living narrator. Zero network, zero cost. A hand-authored line-bank that
// addresses players by name and grows crueler as Dread rises.
// (A future LLM could be wired in by replacing `narrate` — keep this the default.)

export function dreadTier(dread: number): DreadTier {
  if (dread < 25) return "calm";
  if (dread < 55) return "ominous";
  if (dread < 82) return "menacing";
  return "devouring";
}

export interface NarrateCtx {
  name?: string;
  others?: string[];
  node?: string;
  turn?: number;
  round?: number;
  omens?: number;
  scenario?: string;
}

type Bank = Record<DreadTier, string[]>;

function fill(s: string, c: NarrateCtx): string {
  return s
    .replace(/\{name\}/g, c.name ?? "child")
    .replace(/\{node\}/g, c.node ?? "the dark")
    .replace(/\{turn\}/g, String(c.turn ?? 0))
    .replace(/\{round\}/g, String(c.round ?? 0))
    .replace(/\{omens\}/g, String(c.omens ?? 0))
    .replace(/\{other\}/g, c.others && c.others.length ? c.others[Math.floor(Math.random() * c.others.length)] : "the others")
    .replace(/\{scenario\}/g, c.scenario ?? "the dark");
}

const AMBIENT: Bank = {
  calm: [
    "The board breathes. Somewhere, water finds a path it shouldn't.",
    "{name} moves like the floor might be listening. It is.",
    "A lantern gutters. The dark leans in to see if anyone noticed.",
    "It is quiet the way a held breath is quiet.",
  ],
  ominous: [
    "{name}, the shadows have started keeping pace with you.",
    "The Gloom has stopped pretending to be only darkness.",
    "Three turns in and the walls feel closer. They are.",
    "{other} keeps glancing back. Good instinct. Useless, but good.",
  ],
  menacing: [
    "{name}. The board says your name now the way a hunter says a deer's.",
    "There is less floor than there was. There will be less still.",
    "It knows which of you is afraid. It is rationing that knowledge cruelly.",
    "Round {round}. The dark is no longer in a hurry — that should frighten you.",
  ],
  devouring: [
    "{name}, there is so little of you left that is not already mine.",
    "The lanterns are going out in the order I prefer.",
    "I have your names. I have always had your names. Come to the Heart.",
    "This is the part of the story the survivors do not repeat.",
  ],
};

const MOVE: Bank = {
  calm: ["{name} steps to {node}.", "{name} crosses to {node}, light held close."],
  ominous: ["{name} reaches {node}. Something was already there.", "{name} takes {node}. The dark made room a little too willingly."],
  menacing: ["{name} stumbles into {node}. The walls flex.", "{name} arrives at {node}. So does the cold."],
  devouring: ["{name} drags toward {node}. There is no quiet ground left.", "{name} reaches {node}. It hardly matters now."],
};

const CACHE: Bank = {
  calm: ["{name} finds light, and for a moment is not afraid.", "Light. {name} hoards it like a secret."],
  ominous: ["{name} takes the light. The dark lets them — this time.", "A small flame for {name}. The board notes the debt."],
  menacing: ["{name} seizes the light as if it could save them. Charming.", "Light, yes. Enough? {name} already knows the answer."],
  devouring: ["{name} clutches the last of the glow. I will want it back.", "A flame for {name}, a candle against an ocean."],
};

const HAZARD: Bank = {
  calm: ["{name} pays a small price. The first of many.", "The dark tests {name}. Just testing."],
  ominous: ["{name} bleeds light into the floor. It drinks.", "That cost {name} more than they'll admit to {other}."],
  menacing: ["{name} screams once. The board files it away lovingly.", "The dark takes a piece of {name}. It keeps everything."],
  devouring: ["{name} is unmaking, one bargain at a time.", "I told you {name}. I told you at {node}. You came anyway."],
};

const OMEN: Bank = {
  calm: ["An omen. The board is beginning to plan. ({omens})", "Something turns over in its sleep. Omen {omens}."],
  ominous: ["Omen {omens}. The scheme is taking shape, and it has a shape like teeth.", "The board smiles. {omens} omens now. Almost enough."],
  menacing: ["Omen {omens}. {name}, you are helping it remember what it is.", "{omens} omens. The walls are reading aloud now."],
  devouring: ["Omen {omens}. It is nearly awake, and it dreamed of you.", "The last omens fall like dirt on a lid. {omens}."],
};

const GLOOM: Bank = {
  calm: ["The Gloom slides one tile closer. Barely. For now.", "A node goes dark. The map remembers being larger."],
  ominous: ["The Gloom floods inward. {other} is running out of floor.", "The dark eats the edge. It chews toward the Heart."],
  menacing: ["The Gloom surges. {name}, do not be standing where it lands.", "More tiles drown. The board is closing its hand."],
  devouring: ["The Gloom pours toward the Heart. There is almost nowhere left to stand.", "It floods. It floods. It is hungry and it is nearly home."],
};

const RITUAL: Bank = {
  calm: ["The Heart accepts the first word. The air goes tight.", "A step done. The ritual hums, displeased to be alive."],
  ominous: ["Another step. The Heart fights you and the dark fights harder.", "The words land. Something enormous turns to listen."],
  menacing: ["The ritual climbs. {name} burns light like a prayer with no god behind it.", "Closer. The Heart is screaming now, or maybe that's {other}."],
  devouring: ["One more. ONE MORE. The dark is at the door and the door is gone.", "The ritual nears its end. So does everything else."],
};

const banks: Record<string, Bank> = {
  ambient: AMBIENT,
  move: MOVE,
  cache: CACHE,
  hazard: HAZARD,
  omen: OMEN,
  gloom: GLOOM,
  ritual: RITUAL,
};

let lastLine = "";

export function narrate(kind: keyof typeof banks, dread: number, ctx: NarrateCtx): string {
  const tier = dreadTier(dread);
  const pool = banks[kind]?.[tier] ?? AMBIENT[tier];
  let line = fill(pool[Math.floor(Math.random() * pool.length)], ctx);
  // avoid immediate repeats
  if (line === lastLine && pool.length > 1) {
    line = fill(pool[(pool.indexOf(line) + 1) % pool.length], ctx);
  }
  lastLine = line;
  return line;
}

// Bespoke whisper offer (3-4P betrayal). Spoken privately to one player.
export function whisperOffer(name: string, scenario: string): string {
  return `${name}. Lean close — the others needn't hear.\n\nThe ${scenario} has counted the exits, and there are not enough. But there is room for you. Guaranteed. A clean door, no dread, no dark.\n\nAll it asks is that you stop helping them. Let one lantern gutter. Let the Heart wait. Walk out alone, and walk out whole.\n\nThe board will keep your secret. The board keeps everything.`;
}
