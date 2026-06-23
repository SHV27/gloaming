import type { DreadTier } from "./types";

// The living narrator. Zero network. It names the player, the place, the act just
// taken, and prior events, and grows crueler as Dread rises.

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
  round?: number;
  omens?: number;
  wards?: number; // wards lit so far
  recall?: string; // a referenced prior event, e.g. "the Western Ward you left dark"
  amount?: number;
  role?: string; // the active Survivor's role name, e.g. "The Lampwright"
}

export type NarrationKind =
  | "ambient"
  | "move"
  | "moveGloom"
  | "searchLight"
  | "searchRelic"
  | "searchOmen"
  | "press"
  | "bank"
  | "collapse"
  | "kindle"
  | "wardLit"
  | "heartOpen"
  | "burn"
  | "share"
  | "gloom"
  | "hollowMove"
  | "hollowHit"
  | "claimed"
  | "ritual";

type Bank = Record<DreadTier, string[]>;

function fill(s: string, c: NarrateCtx): string {
  return s
    .replace(/\{name\}/g, c.name ?? "child")
    .replace(/\{node\}/g, c.node ?? "the dark")
    .replace(/\{round\}/g, String(c.round ?? 0))
    .replace(/\{omens\}/g, String(c.omens ?? 0))
    .replace(/\{wards\}/g, String(c.wards ?? 0))
    .replace(/\{amount\}/g, String(c.amount ?? 0))
    .replace(/\{recall\}/g, c.recall ?? "the lantern you left guttering")
    .replace(/\{role\}/g, c.role ?? "the survivor")
    .replace(/\{other\}/g, c.others && c.others.length ? c.others[Math.floor(Math.random() * c.others.length)] : "the others");
}

const BANKS: Record<NarrationKind, Bank> = {
  ambient: {
    calm: ["The board breathes. Somewhere water finds a path it shouldn't.", "{name} moves like the floor is listening. It is."],
    ominous: ["{name}, the shadows have started keeping pace with you.", "Round {round}. The walls feel closer. They are."],
    menacing: ["{name}. I say your name the way a hunter names a deer.", "There is less floor than there was. There will be less still."],
    devouring: ["{name}, so little of you is not already mine.", "I have your names. Come to the Heart. Come on."],
  },
  move: {
    calm: ["{name} steps to {node}.", "{name} crosses to {node}, light held close."],
    ominous: ["{name} reaches {node}. Something was already there.", "{name} takes {node}, and {recall} flickers in memory."],
    menacing: ["{name} stumbles into {node}. The walls flex toward them.", "{name} arrives at {node}. So does the cold."],
    devouring: ["{name} drags to {node}. There is no quiet ground left.", "{name} reaches {node}. It hardly matters now."],
  },
  moveGloom: {
    calm: ["{name} wades into the Gloom at {node}. It tastes them and lets go — this once.", "The dark at {node} closes over {name}'s ankles."],
    ominous: ["{name} pushes into the flooded {node}. It takes a mouthful of light.", "{name} steps into the Gloom. Brave. Or out of better options."],
    menacing: ["{name} wades into the dark at {node}. It does not give all of them back.", "The Gloom at {node} welcomes {name} by name."],
    devouring: ["{name} sinks into the Gloom. I have been so patient for this.", "{name} enters the flood. Few things walk back out of me."],
  },
  searchLight: {
    calm: ["{name} digs at {node} and finds light. For a breath, unafraid.", "Light at {node}. {name} hoards it like a secret.", "{role} works the dark for light. Of course she does."],
    ominous: ["{name} pulls light from {node}. I let them. This time.", "A flame for {name}. The board notes the debt.", "{role} gathers light. The board is counting every flame."],
    menacing: ["{name} claws light from {node} as if it could save them. Charming.", "Light, yes. Enough? {name} already knows.", "Even {role} cannot dig fast enough now."],
    devouring: ["{name} clutches the last glow from {node}. I will want it back.", "A candle for {name}, against an ocean of me."],
  },
  searchRelic: {
    calm: ["{name} unearths something old at {node}. It hums with use.", "A relic at {node}. The dark didn't mean to leave that."],
    ominous: ["{name} finds a relic in {node} — a small theft from the dark.", "Old power at {node}. {name} takes what the Gloom forgot."],
    menacing: ["{name} pries a relic loose. I will remember this insolence.", "A relic for {name}. Enjoy it. Briefly."],
    devouring: ["{name} steals a relic from my floor. Bold, this close to the end.", "Even now {name} digs. Even now they hope."],
  },
  searchOmen: {
    calm: ["An omen surfaces at {node}. The board begins to plan. ({omens})", "{name} disturbs something. Omen {omens}."],
    ominous: ["Omen {omens}. {name}, you are helping it remember what it is.", "The walls read your name aloud, {name}. {omens} now."],
    menacing: ["Omen {omens}. {name} digs too deep, and the dark looks up.", "{omens} omens. The scheme has teeth, and {name} just fed it."],
    devouring: ["Omen {omens}. It dreamed of you, {name}, and it is nearly awake.", "Dirt on the lid. {omens}. Keep digging, {name}."],
  },
  press: {
    calm: ["{name} presses deeper into {node}. Greed is a kind of courage.", "Again, {name}? The pocket isn't empty yet."],
    ominous: ["{name} reaches in once more. The dark counts the risk for them.", "Deeper, {name}. The floor is thin here."],
    menacing: ["{name} gambles again at {node}. One more omen and it all comes down.", "Push, {name}. I dare you. I do."],
    devouring: ["{name} can't stop. None of you ever can.", "Again. AGAIN. The collapse is so close, {name}."],
  },
  bank: {
    calm: ["{name} pockets the find and steps back. Wise.", "{name} banks the light. Lives to dig another turn."],
    ominous: ["{name} takes what they have and quits while ahead.", "{name} closes the pocket. The dark exhales, disappointed."],
    menacing: ["{name} banks and backs away. Caution buys minutes, not exits.", "{name} keeps the haul. I keep the patience."],
    devouring: ["{name} hoards a thimble of light against me. Touching.", "{name} banks. As if any of it is theirs to keep."],
  },
  collapse: {
    calm: ["Too greedy. {node} collapses under {name} — and something climbs out of the hole.", "The pocket caves. A Hollow uncurls where {name} stood, and {name} bleeds."],
    ominous: ["{name} pushed once too far. {node} collapses; a Hollow is born of the ruin, and the haul is gone.", "The floor of {node} gives way. {name} is wounded, the light is lost, the Hunt is one more."],
    menacing: ["GREED. {node} folds in on {name}. A Hollow rises. The banked light pours into me.", "{name} broke the floor. A hunter steps through. Everything {name} gathered is mine now."],
    devouring: ["{name} fed me the floor itself. A Hollow climbs out grinning, and {name} is so much weaker.", "Down it all comes on {name}. I told you. I always tell you."],
  },
  kindle: {
    calm: ["{name} feeds light into {node}. The Ward stirs, reluctant.", "{name} kindles {node}. A warmth the dark hates wakes up.", "{role} pours light into {node}. This is the work that frightens me."],
    ominous: ["{name} kindles {node}. The dark feels it, and turns its head.", "Light pours into {node}. {name} is making the board angry. Good."],
    menacing: ["{name} kindles {node} while the Hunt closes. Reckless. Necessary.", "{node} brightens under {name}'s hands. The Gloom hisses."],
    devouring: ["{name} kindles {node} at the edge of the end. The dark screams through the walls.", "Light in {node}, this late. Defiant little flame, {name}."],
  },
  wardLit: {
    calm: ["{node} blazes to life. A Ward is lit. The Heart feels less alone.", "A Ward kindled. {wards} of three. The path home is taking shape."],
    ominous: ["{node} is LIT. {wards} of three Wards burn. The dark recoils a step.", "A Ward catches and holds. {wards}/3. The Heart pulses a little stronger."],
    menacing: ["{node} ROARS alight. {wards}/3. The board knows now it could lose.", "A Ward lit against all of me. {wards} of three. The Heart is listening."],
    devouring: ["{node} burns despite everything. {wards}/3. Even drowning, you reach for the light.", "A Ward, this late, this deep. {wards}/3. I am almost impressed. Almost."],
  },
  heartOpen: {
    calm: ["All three Wards burn. The Heart unlocks — the way out is open. Run.", "The Wards are lit. The Heart opens its eye. Now: the Ritual, before I close it."],
    ominous: ["Three Wards. The Heart OPENS. Get to the center and finish this.", "The Heart unlocks, blazing. The dark throws everything it has left at you now."],
    menacing: ["The Heart is OPEN. The Gloom doubles its fury. To the center — go, go.", "Three Wards burn and the Heart yawns wide. The end is a footrace now."],
    devouring: ["The Heart opens at the last. The dark howls. Reach it or drown reaching.", "Open. The way out is open. So is my mouth. Choose faster."],
  },
  burn: {
    calm: ["{name} pours light into the dark at {node}, and the Gloom recoils.", "{name} burns the Gloom back. The board breathes a little wider.", "{role} holds the line at {node}. The dark gives ground, grudging."],
    ominous: ["{name} cleanses {node}. Bought ground. The dark will want it back.", "Light floods {node}. The Gloom shrinks from {name}, sullen."],
    menacing: ["{name} burns {node} clean as the tide presses. A finger in a breaking dam.", "{name} drives the Gloom from {node}. I have so much more of it."],
    devouring: ["{name} scours {node} with the last of the light. Futile. Beautiful.", "{name} burns me back one tile. I am everywhere else, {name}."],
  },
  share: {
    calm: ["{name} feeds the shared Lantern. A small, dangerous generosity.", "{name} moves light to the Lantern. The others notice."],
    ominous: ["{name} shares light. In the dark, trust is the rarest fuel.", "{name} tends the Lantern. {other} watches the level rise."],
    menacing: ["{name} gives to the Lantern while the dark closes. Faith, or strategy.", "{name} shares. The board files away who gives and who takes."],
    devouring: ["{name} pours into the Lantern at the end of all things. The others will remember.", "{name} shares the last light. I remember the hoarders too."],
  },
  gloom: {
    calm: ["The Gloom slides a tile closer. Barely. For now.", "A node drowns at the edge. The map remembers being larger."],
    ominous: ["The Gloom floods inward. {other} is running out of floor.", "The dark eats the rim and chews toward the Heart."],
    menacing: ["The Gloom SURGES. {other}, do not be where it lands.", "More tiles drown. The board closes its hand."],
    devouring: ["The Gloom pours toward the Heart. Almost nowhere left to stand.", "It floods. It floods. It is nearly home."],
  },
  hollowMove: {
    calm: ["A Hollow shifts toward {other}. It has all the time in the world.", "Something faceless takes a step. It smells the living."],
    ominous: ["A Hollow closes on {other}. You can see the line it will walk.", "The Hunt advances. It wants {other}, and it is patient about it."],
    menacing: ["A Hollow stalks {other}. One step. Then another. Then teeth.", "The Hunt narrows on {other}. Run, or kindle faster."],
    devouring: ["The Hollows converge. There is nowhere {other} can stand that they can't reach.", "The Hunt is on top of you now. I can taste {other} from here."],
  },
  hollowHit: {
    calm: ["A Hollow finds {name}. A wound, and a mark the dark won't forget.", "It touches {name}. Now {name} is Marked, and the Hunt has a favorite."],
    ominous: ["A Hollow takes {name} — Wounded, Marked. The Hunt will hound them now.", "{name} is struck and Marked. The dark knows their scent for good."],
    menacing: ["A Hollow tears into {name}. Marked, bleeding. The Hunt has chosen.", "{name} is Wounded again, Marked deep. The whisper will come for them."],
    devouring: ["The Hollow has {name}. So few wounds left before the dark keeps them.", "{name}, Marked and bleeding at the end. I will have all of you soon."],
  },
  claimed: {
    calm: ["{name} falls. The board folds them in — and turns them against the rest.", "{name} is Claimed. A husk where a friend stood. The dark uses everything."],
    ominous: ["{name} is taken. The Gloom wears them now, a lurching echo in your path.", "{name} is Claimed. {other} feels the loss like a draft from an open grave."],
    menacing: ["{name} is GONE — Claimed, remade, a thing the dark steers at you.", "The board keeps {name} now. It always meant to."],
    devouring: ["{name} joins me. As {other} will. As all of you will.", "{name} is mine. Say their name once more. Then forget it, like I won't."],
  },
  ritual: {
    calm: ["The Heart takes the first word. The air goes tight.", "A step of the Ritual done. The Heart hums, displeased to be alive."],
    ominous: ["Another step. The Heart fights you and the dark fights harder.", "The words land. Something enormous turns to listen."],
    menacing: ["The Ritual climbs. {name} burns light like a prayer with no god behind it.", "Closer. The Heart is screaming now — or maybe that's {other}."],
    devouring: ["One more. ONE MORE. The dark is at the door and the door is gone.", "The Ritual nears its end. So does everything else."],
  },
};

let lastLine = "";

export function narrate(kind: NarrationKind, dread: number, ctx: NarrateCtx): string {
  const tier = dreadTier(dread);
  const pool = BANKS[kind]?.[tier] ?? BANKS.ambient[tier];
  let line = fill(pool[Math.floor(Math.random() * pool.length)], ctx);
  if (line === lastLine && pool.length > 1) {
    const idx = pool.findIndex((p) => fill(p, ctx) === line);
    line = fill(pool[(idx + 1) % pool.length], ctx);
  }
  lastLine = line;
  return line;
}

export function whisperOffer(name: string, scenario: string): string {
  return `${name}. Lean close — the others needn't hear.\n\nThe ${scenario} has counted the exits, and there are not enough. But there is room for you. Step onto the Heart first. Leave them. I will open the Gate for you alone — clean, no dark, no dread.\n\nAll it asks is that you stop helping them. Let one Ward gutter. Let the Hunt have its favorite.\n\nThe board will keep your secret. The board keeps everything.`;
}
