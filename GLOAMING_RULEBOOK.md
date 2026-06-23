# GLOAMING — THE RULEBOOK (v2, the real game)

> *The board is awake. The light is dying. Get out together — or don't get out at all.*
>
> This is both the player rulebook AND the upgraded design bible. Claude Code: treat this as the
> new source of truth. Sync the relevant parts into `DESIGN.md` and `CLAUDE.md`.

---

## THE FICTION (what's happening)

You and the others opened something you shouldn't have, and it pulled you *inside*. You are now standing on a living board in the dark. A hungry darkness — **the Gloom** — is eating the world from the edges inward. Things move in it: **the Hollow**, faceless hunters that smell the living. The only way out is to relight the **three Wards**, reach the **Heart** at the center, and finish the **Escape Ritual** before the dark swallows everything.

The board can speak. It knows your names. It is not on your side.

---

## HOW YOU WIN / HOW YOU LOSE

- **WIN (escape):** Light all **3 Wards**, then complete the multi-step **Escape Ritual** at the **Heart** before **Dread** hits 100.
- **LOSE (claimed):** Dread reaches 100 (the Gloom devours the board) **OR** the Heart node is flooded by the Gloom **OR** every living player is Claimed.
- **BITTERSWEET (finite escape):** In some Haunt scenarios, the Gate only opens for a limited number. Whoever is standing on the Heart when the Ritual completes escapes. The rest are Claimed. The **Ledger** ending names who got out, who didn't, and why.

A game runs ~20–35 minutes. It is meant to be replayed immediately.

---

## THE BOARD

- An organic **node-graph** of 21 nodes, hand-designed (not random scatter), rendered in living SVG.
- **Heart** — the center node. The goal. It pulses like a slow heartbeat; the pulse quickens with Dread.
- **3 Wards** — special nodes set between the edge and the Heart. Each must be *kindled* (fed Light + a ritual action).
- **Threshold nodes** — the outer edge, where players start. Also where the Gloom enters.
- **Caches / Hazards** — ordinary nodes hold "pockets" you Search.
- A node is in one of three states: **Lit** (safe), **Tainted** (Gloom creeping in — risky), **Flooded** (full Gloom — dangerous, costs to enter, drains Light).

---

## SETUP

1. Each player picks a **Survivor** (asymmetric role + ability — see ROLES). 2–4 players, one screen, pass-and-play.
2. All players start together on a Threshold node.
3. The **Lantern** (shared Light pool) starts at a set value; each player also has **personal Light**.
4. The **Gloom** seeds the outermost ring. One **Hollow** spawns at a far edge.
5. **Dread** = 0. **Omens** = 0. Round = 1.
6. A 15-second **intro** states the goal in-world, then a one-line tooltip teaches the first action. The objective tracker (**Wards 0/3 · Heart locked · escape status**) is always visible.

---

## A TURN (the active player)

On your turn you do **Move → Act → the board narrates.**

### 1) MOVE
Spend movement (a d6 roll, modified by your role) to walk along edges.
- Entering a **Tainted** node: costs +1 movement.
- Entering a **Flooded** node: costs +2 and you lose 1 personal Light (the dark bites). Avoid it unless desperate.

### 2) ACT — choose one (and Search can be pressed, see below)
- **Search** the node — the push-your-luck engine (below). Your main source of Light & Relics.
- **Kindle a Ward** (only on a Ward node) — spend Light to advance that Ward toward Lit. Wards take cumulative Light across turns, so the group must converge and defend.
- **Burn back the Gloom** — spend 3 Lantern Light to cleanse one adjacent Tainted/Flooded node back to Lit. Buys space, slows the squeeze.
- **Share / bank Light** — move Light between your pocket and the Lantern, or hand Light to an ally on your node. Co-op resource management.
- **Use your Ability** — role-specific (see ROLES).

### 3) THE BOARD NARRATES
After your action, the living narrator speaks — **by name, about what you just did, where, and how the dark feels about it.** It escalates with Dread (calm → ominous → menacing → devouring) and references your earlier choices. This is the soul; it must feel *aware*.

---

## THE PUSH-YOUR-LUCK SEARCH (the addictive core)

When you Search, you draw one token from the node's **pocket**:
- **Light** (most common) — add to your personal Light. Good.
- **Relic** (rare) — a one-use power (extra move, ward a Hollow off, a free Burn, etc.).
- **Omen** (uncommon) — adds to the Omen track and bumps Dread. Bad.

After any draw you may **press your luck**: draw again for more — or **bank** and end the action safely.
- **The catch:** if you draw a **second Omen in the same Search**, the node **collapses** — a **Hollow spawns here** and you take a **Wound**. Everything you banked this turn is lost.

Every draw is a cheers-or-groans moment. Greed vs. safety. This is the heartbeat of the game.

---

## END OF ROUND (after everyone has acted) — the squeeze

Resolve in this order, with full animation and sound:

1. **THE HUNT MOVES.** Each Hollow pathfinds one step along the **shortest route to the nearest living player.** Its path is highlighted *before* it moves (you see death coming). If a Hollow reaches a player: that player takes a **Wound** and becomes **Marked** (the Hunt now prioritizes the Marked; the Whisper later targets them).
2. **THE GLOOM ADVANCES.** Tainted nodes become Flooded; Lit nodes adjacent to Gloom become Tainted. The number of new nodes consumed scales up as Dread rises. The board visibly shrinks inward.
3. **DREAD RISES.** Base +X per round, +1 per Omen on the track, +more per uncleansed Flooded node near the Heart. The Dread tide and vignette tighten; the heartbeat quickens.
4. **OMEN / HAUNT CHECK.** When Omens reach the threshold, the **HAUNT** fires once (below).

**Wounds:** 3 Wounds = **Claimed.** A Claimed player is out — but the board may turn them into a hazard the Gloom uses against the living (a lurching echo that blocks nodes). Losing a teammate hurts the whole group.

---

## THE HAUNT (the act break — "level to infinity")

Mid-game, when Omens hit the threshold, the board **fully wakes.** Full-screen cinematic takeover: color temperature shifts, Dread jumps, and the board reveals its **scheme for this session**, drawn from a deck of scenarios. Each rewrites the stakes:

- **The Collector** — the Hunt doubles; Hollows now steal Light on contact.
- **The Flood** — the Gloom advances twice per round; Wards decay if left unguarded.
- **The Mimic** — one Ward is false; kindling it spikes Dread. Find the true ones.
- **The Long Night** — Dread is frozen but every node is Tainted; pure survival sprint to the Heart.
- **The Famine** — the Lantern leaks every round; Light becomes precious.
- **The Gate is Narrow** — finite escape: only N players can get out. Triggers the Whisper.

Different scheme every game = real replayability.

---

## THE WHISPER (betrayal — toggleable, 3–4P only)

In finite-escape scenarios, after the Haunt the board makes a private offer to the **Marked** player: *"Step onto the Heart first. Leave them. I'll open the Gate for you alone."* Delivered via a **"Hand the device to {player}"** full-screen private screen. They can accept (secret sabotage + guaranteed exit) or refuse (loyalty, shared risk). The Ledger reveals what they chose. Off by default; absent in 2-player (which stays pure co-op vs. the board).

---

## SURVIVOR ROLES (asymmetry = identity + depth + replay)

Each player picks one. Pick-and-combo is part of the strategy.

- **The Lampwright** — Searches yield +1 Light; can store extra personal Light. The group's battery.
- **The Cartographer** — sees the Hunt's next move **and** the Gloom's next spread before they happen; +1 movement. The brain.
- **The Warden** — Burns back the Gloom for 2 instead of 3; takes one extra Wound before being Claimed. The shield.
- **The Forsaken** — the one who opened the board. Powerful Search (can press luck once more safely) but the Whisper *always* targets them first. High risk, heavy story.

(Start with these 4; more can be added later.)

---

## THE FEEL — non-negotiable production bar

This is where v1 failed. The game must *look and sound alive*:

- **The Gloom is the star:** a gorgeous, churning violet-black living tide (layered SVG turbulence/fog, slow tendrils reaching toward players), not flat fills. On every advance: a screen pulse and a low sound.
- **The Hollow read as predators:** distinct menacing tokens, a telegraphed attack path, an approach stinger that gets louder as they near a player.
- **Dread is felt in the body:** a large rising visual, a vignette that tightens, color slowly desaturating, a heartbeat that quickens with the meter.
- **The Heart breathes:** a warm amber pulse, the one source of hope in the dark, brightening as Wards light.
- **Tokens have presence:** player tokens glow and trail light; the Marked player flickers wrong.
- **The narrator typewriters in** with weight; whispers on the soundtrack when it speaks.
- **Onboarding:** legible in 20 seconds. Intro states the goal in-world; tooltips teach on first encounter; the objective is always on screen. A confused player is a bug.
- **Sound** (Session 4 if needed): ambient drone, heartbeat, whispers, Hollow stinger, Ward-light chime, the Haunt sting. Global mute. Never breaks the build.
