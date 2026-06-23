# DESIGN.md — GLOAMING — Council Verdict (LOCKED)

> One page. Converged. This is what we ship tonight.

## Core loop
Pass-and-play, 2–4 players trapped in a living board. Each turn:
**Move** (spend movement from a d6) → **Resolve node** (draw Manifestation deck: cache / hazard / omen) →
**Spend or share Light** (shared lantern pool + personal Light) → at end of round **the Gloom advances**
(floods edge nodes inward) → **the board narrates** by name. Omens fill the **Omen track**; at threshold the
**HAUNT** fires (one of 6 scenarios), sharpening the win condition. Reach the **Heart**, perform the
multi-step **Ritual** under max Dread → **Ledger** fable ending names every name and choice.

## Win / Lose
- **Win:** Ritual completed at the Heart before Dread maxes / Gloom claims the Heart.
- **Lose:** Dread reaches 100 (the Gloom devours the board) OR the Heart node is flooded.
- **Bittersweet:** finite escapes — some scenarios save fewer than all. Whoever stands on the Heart at
  ritual completion escapes; the rest are claimed. The Ledger tells who got out.

## 3–4 Signature thrill moments
1. **The Gloom advance** — at round end, edge nodes flood inward with a creeping violet-black SVG tide and a screen pulse. The map visibly *shrinks*. Cheers/groans guaranteed.
2. **The Haunt reveal** — full-screen cinematic takeover: the board names its scheme for this session. Color temperature shifts, Dread jumps, rules sharpen.
3. **The Whisper** (3–4P, off by default) — "Hand the device to {player}." A private full-screen offer: betray the group for a guaranteed exit. Jackbox-style secrecy.
4. **The Ritual climax + Ledger** — multi-step pound-the-table sequence at max Dread, then a dark hand-authored fable that you screenshot and send to the group chat.

## Visual direction — TOKENS (locked)
Theme: a dying lantern in a living dark. Warm light fighting cold rot. NOT the AI-default looks.
```
--gloam-void:    #0A0710   /* page background — near-black with a violet bruise */
--gloam-deep:    #140B1E   /* panels / sunken surfaces */
--gloam-surface: #1E1330   /* elevated cards */
--gloam-rot:     #3B2A57   /* the Gloom's body — cold violet decay */
--ember:         #F5A623   /* THE LIGHT — warm lantern amber, the emotional center */
--ember-bright:  #FFD27A   /* light at full strength / glow */
--bone:          #EDE6D6   /* primary text — warm bone-white, never pure #fff */
--ash:           #8C8398   /* muted text */
--blood:         #C2412D   /* danger / hazard / Dread spikes */
```
**Signature element:** the Gloom — a living violet-black tide spreading across the SVG board, with a
soft animated noise/fog and a pulse on every advance. Everything else stays quiet so it dominates.

## Type
- **Display:** *Cinzel* (engraved, ritual, gravestone gravitas) — titles, Haunt name, Ledger headings. Restraint.
- **Body:** *Spectral* (a literary serif with warmth) — narration + UI prose. Carries the "great game writer" voice.
- **Mono/stats:** *Space Mono* — Light counts, Dread %, turn number, omen pips.

## Narrator
Fully scripted, zero network. Line-bank keyed by Dread tier (calm → ominous → menacing → devouring) and
event type, with `{playerName} {node} {turn} {omenCount}` slots. Escalates cruelty with Dread; references
prior events. Typewriter reveal in the NarratorBar.

## Cut-list (NOT building tonight)
- Audio (ship muted/absent; never risks build). Hook left for later.
- Seeded/random board layout — ship ONE hand-designed 21-node board.
- Per-scenario bespoke art — scenarios change rules + narration + color, reuse board.
- LLM narrator adapter — leave `narrator.ts` clean enough to swap later, but no network tonight.
- Animated manifestation creature art — represent manifestations as marked nodes + narration, not sprites.

---

## v2 VERDICT — "the real game" (locked, supersedes the above where they conflict)

Source of truth is now `GLOAMING_RULEBOOK.md`. v1 ran but wasn't a *game*: invisible Gloom, no
threat hunting you, no goal clarity, flat visuals. v2 fixes the fundamentals.

**Goal (legible in 20s):** relight **3 Wards** → the **Heart** opens → finish the **Escape Ritual**
before **Dread** hits 100. Always-on objective tracker. A 15s skippable in-world intro states it.

**Two crossing pressures (the thrill):**
- **The Gloom** — a living violet-black tide. Nodes are **Lit → Tainted → Flooded**. Each round end:
  Tainted→Flooded, Lit-next-to-Gloom→Tainted; consumed count scales with Dread. The safe board shrinks.
  Flooded costs movement + bites Light. THE signature visual (layered SVG turbulence/fog + tendrils + pulse).
- **The Hunt** — **the Hollow**: mobile predators that BFS one step toward the nearest living player at
  round end. **Path is telegraphed before it moves.** Contact = Wound + Marked. 3 Wounds = Claimed.

**Push-your-luck Search (micro-loop):** draw from a node's pocket — Light (common) / Relic (rare) /
Omen (uncommon). Press luck for more or bank. **2nd Omen in one Search = node collapses:** Hollow spawns,
a Wound, banked gains lost. Every draw is a cheers/groans beat.

**Loud Dread clock:** big rising tide meter, vignette that tightens, palette desaturates, heartbeat
quickens as Dread climbs.

**Aware narrator:** rewritten to name the player + node + the actual action just taken + prior events,
escalating calm→ominous→menacing→devouring.

**Node states & icons:** Lit (warm rim), Tainted (violet creep), Flooded (rot fog). Wards show kindle
progress; Heart shows locked vs open; Hollow reads as a predator; Marked player flickers wrong.

### Cut to Session 3 (explicitly deferred)
- **Survivor roles** (Lampwright/Cartographer/Warden/Forsaken) — lobby stays name-entry for now.
- **Full Haunt scenario-deck rewrites** (Collector/Flood/Mimic/etc. rule-changes) — the existing
  cinematic Haunt reveal + a Dread spike are kept; per-scenario mechanic rewrites deferred.
- **The Whisper** mechanics tied to the Marked player — the existing Whisper screen is kept but not
  rewired to Marked-targeting / finite-Gate scenarios this session.
- Sound (Session 4).

## Architecture (locked, per §3)
`src/game` (types, board, decks, scenarios, narrator, engine helpers) · `src/store` (zustand + persist) ·
`src/components` (Lobby, Board, NarratorBar, PlayerPanel, CardDraw, OmenTrack, HauntReveal, WhisperScreen,
RitualClimax, Ledger) · `src/design` (tokens). Phases: `LOBBY → PLAY → HAUNT → CLIMAX → END`.
