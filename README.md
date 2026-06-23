# GLOAMING

> A sentient dark is eating the map. Reach the Heart, finish the ritual, and pray it doesn't already know your name.

**GLOAMING** is a pass-and-play board game for 2–4 players that runs entirely in the browser. You are trapped inside a *living* board. A creeping darkness — the **Gloom** — floods the map inward, tile by tile, while the board itself narrates your doom by name and grows crueler as Dread rises. Reach the Heart at the center, spend your light to complete the escape ritual, and get out before the dark gets you. Not everyone always makes it.

No backend. No API keys. No accounts. One static page, one screen, one room of people groaning at the same time.

## Signature moments

- **The Gloom advance** — at the end of every round the darkness floods inward across the SVG board with a living, animated fog. The map *visibly shrinks*. You can feel the walls closing.
- **The Haunt** — fill the Omen track and the board reveals its true scheme for this session, drawn from a deck of 6 scenarios (The Collector, The Flood, The Mimic, The Long Night, The Bargain, The Harvest). The world's color shifts, Dread jolts, and the rules sharpen. Every game tells a different story.
- **The Whisper** *(3–4 players, optional)* — the board privately offers **one** player a clean way out, in exchange for betraying the rest. Delivered Jackbox-style: *"Hand the device to {name}."* Everyone else looks away.
- **The Ledger** — however it ends, the run is narrated back as a dark fable that names every name and every choice. Built to be screenshotted and dropped in the group chat.

## The living narrator

The board talks. It addresses players **by name**, references where you are and what just happened, and escalates from *calm → ominous → menacing → devouring* as Dread climbs — all from a hand-authored line-bank. **Zero network, zero cost, unbreakable.** (A `narrator.ts` adapter is left clean enough to wire an LLM in later, but the default is fully scripted on purpose.)

## How to play

1. Enter 2–4 names. (3+ unlocks the Whisper.)
2. On your turn: **roll** the worn four-faced die, **move** along the lit paths, then **search** where you land — caches give Light, hazards bite, omens wake the Haunt.
3. Spend and share **Light**: feed the shared lantern or take from it, burn the Gloom back from a tile beside you, or pour it into the ritual at the Heart.
4. At the end of each round the **Gloom advances** and **Dread rises**.
5. Get someone onto the **Heart** and speak the full ritual before Dread maxes or the dark floods the Heart.

A refresh never kills a game — state persists to `localStorage`.

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
