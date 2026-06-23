# GLOAMING

> A sentient dark is eating the map. Reach the Heart, finish the ritual, and pray it doesn't already know your name.

**GLOAMING** is a pass-and-play board game for 2–4 players that runs entirely in the browser. You are trapped inside a *living* board. A creeping darkness — the **Gloom** — floods the map inward, tile by tile, while the board itself narrates your doom by name and grows crueler as Dread rises. Reach the Heart at the center, spend your light to complete the escape ritual, and get out before the dark gets you. Not everyone always makes it.

No backend. No API keys. No accounts. One static page, one screen, one room of people groaning at the same time.

## Signature moments

- **Two crossing pressures.** The **Gloom** is a living violet-black tide — nodes go Lit → Tainted → Flooded, and the safe board *visibly shrinks* inward every round. Meanwhile **the Hollow** hunt you: faceless predators that pathfind one step toward the nearest living survivor each round — and their route is **telegraphed before they move**, so you watch death close in.
- **Push-your-luck Search.** Dig a tile for Light. Press your luck for more… but a **second Omen in one Search collapses the tile** — a Hollow spawns, you take a Wound, and everything you banked is lost. Every draw is a cheers-or-groans beat.
- **The goal is legible in 20 seconds.** Relight **3 Wards** (kindle them together with Light) → the **Heart opens** → finish the **Escape Ritual** before **Dread** hits 100. An always-on tracker and a 15-second in-world intro tell you exactly what to do.
- **Dread you feel in your body.** As the meter climbs the palette desaturates, a vignette tightens, and a heartbeat quickens until the whole screen feels like it's closing in.
- **Four Survivors, real asymmetry.** Pick a role in the lobby: **The Lampwright** (every Light Search yields +1 — the group's battery), **The Cartographer** (+1 move and foresees the Gloom's next spread), **The Warden** (Burns the Gloom cheaper, takes an extra Wound — the shield), **The Forsaken** (can press their luck one Omen deeper, but the Whisper always comes for them). The mix changes your whole strategy.
- **The Haunt — a deck of 6 schemes.** Fill the Omen track and the board fully wakes with one of: **The Collector** (the Hunt doubles, Hollows steal Light), **The Flood** (the Gloom advances twice a round, unguarded Wards decay), **The Mimic** (one Ward is false — kindling it spikes Dread; deduce the two true ones), **The Long Night** (Dread freezes but the whole board turns to Gloom — a sprint to the Heart), **The Famine** (the Lantern leaks every round), **The Gate is Narrow** (finite escape — and the knife comes out).
- **The Whisper + the Ledger.** When the Gate is narrow, the board privately tempts one survivor — *"Hand the device to {name}"* — to abandon the rest for a guaranteed exit. However it ends, the run is narrated back as a dark fable naming each survivor, their role, their choice, and their fate — built to be screenshotted.

## The living narrator

The board talks. It addresses players **by name**, references where you are and what just happened, and escalates from *calm → ominous → menacing → devouring* as Dread climbs — all from a hand-authored line-bank. **Zero network, zero cost, unbreakable.** (A `narrator.ts` adapter is left clean enough to wire an LLM in later, but the default is fully scripted on purpose.)

## How to play

1. Enter 2–4 names. (3+ unlocks the Whisper.)
2. On your turn: **roll**, **move** along the paths (Tainted tiles cost extra, Flooded ones bite your Light), then take **one action**: **Search** (push-your-luck), **Kindle a Ward** you're standing on, or **Burn the Gloom back** from an adjacent tile. Feed/Take Light from the shared Lantern freely.
3. Light all **3 Wards** to open the **Heart**, then get someone onto the Heart and **speak the Escape Ritual** to completion.
4. At the end of each round: **the Hunt moves**, **the Gloom advances**, and **Dread rises**. Watch the telegraphed Hollow paths and don't get cornered — 3 Wounds and you're Claimed.
5. Escape before Dread hits 100 or the Gloom floods the Heart.

A refresh never kills a game — state persists to `localStorage`.

## Feel & onboarding

It teaches itself. Pick **Guided Game** and the board walks you through your first turn *in its own voice*
("Move toward the light. Now search — but greed wakes me."), one mechanic at a time, with contextual
just-in-time tips the first time you see a Tainted tile, a Hollow, or a Ward. There's an always-available
**How to Play** that *shows* rather than tells. A stranger can open the link cold and be playing in one turn.

And it's *alive*: a churning living-fog Gloom with tendrils that reach for you, gliding tokens with light
trails, a breathing Heart, ember particles, screenshake and freeze-frames on the big beats, and a fully
**procedural Web-Audio** score — an ambient drone, a heartbeat that quickens with Dread, a Hollow approach
stinger, Ward chimes, and warm/sour tones as you push your luck. All of it respects `prefers-reduced-motion`,
and there's a global mute.

## Make it yours (cosmetics — never pay-to-win)

Earn board/Gloom **color themes by playing** (escape once → *Emberfall*; play three → *Bonefrost*; light all
three Wards → *Wormwood*) and equip them in **Your Ledger**, which also tracks your games, escapes, longest
survival, and favorite Survivor. Cosmetics are purely visual and never touch the rules — see
[`MONETIZATION.md`](./MONETIZATION.md) for the honest, player-first model.

## Share your run

Every ending renders a downloadable **Ledger run-card** (PNG) — your scenario, who escaped, who was Claimed,
and the board's verdict — built to drop in the group chat. Pasted links unfurl with custom art and a hook.

## Run it locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build to dist/
```

## Design philosophy

Built to the doctrine in [`CLAUDE.md`](./CLAUDE.md) and the locked verdict in [`DESIGN.md`](./DESIGN.md): a Council of design personas converges on a one-page brief, then a bounded build → critique → refine loop executes it. **Anti-slop is law** — a deliberate named color system (a dying lantern's amber fighting a cold violet rot), engraved *Cinzel* display type over literary *Spectral* body text, and all the visual boldness spent in **one** place: the Gloom spreading across the board.

## Tech

Vite · React · TypeScript (strict) · Tailwind (custom token layer) · Framer Motion · Zustand (persisted). Board is inline animated SVG — no asset pipeline, nothing to break. Pure static SPA, deployed on Vercel.

---

*The board keeps your name now. It keeps everything.*
