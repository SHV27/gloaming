# GLOAMING — Monetization (the honest, player-first way)

> Status: **architecture only.** No live payments, no real-money flows, and no credential
> capture exist in this repo. This document is the plan; the foundations (cosmetics + profile)
> are built and working. Turning on payments is a deliberate later step.

## Principles (non-negotiable)

- **Cosmetic-only. Never pay-to-win.** Nothing purchasable may touch the rules, odds, or balance.
- **No dark patterns.** No loot boxes / gacha, no randomized purchases, no FOMO countdown timers,
  no manipulative or hidden pricing, no "energy" gates, no nagging.
- **The core game is free, forever.** Every Survivor, scenario, and mechanic is free.
- **Transparent.** What you buy is exactly what you see. Earned cosmetics stay earned.

This isn't only ethics — it's the better business model. Fair, cosmetic-only games (Fortnite,
Path of Exile, Among Us) grow larger audiences and higher lifetime value than extractive ones,
because the flywheel is **trust → word-of-mouth → scale**, not coercion.

## What's already built (the foundation)

- **Data-driven cosmetics layer** (`src/game/cosmetics.ts`): board/Gloom **color themes** that recolor
  the world via CSS variables and a board accent. They are *purely visual* and pass through none of the
  game logic. Adding a cosmetic = adding a data entry.
- **Local profile + stats** (`src/store/profile.ts`): games played, escapes, wins, longest survival,
  favorite Survivor, and unlocked cosmetics — persisted to `localStorage`. Structured so an optional
  account + cloud sync could be layered on later without touching gameplay.
- **Earned cosmetics, working today:** themes unlock **by playing** — *Emberfall* (escape once),
  *Bonefrost* (play 3 games), *Wormwood* (light all 3 Wards in one game). Proof the unlock pipeline works.

## The someday-paid tier (not enabled)

- **Cosmetic packs:** additional board/Gloom themes, **Survivor skins** (alt sigils/colors), and
  **narrator voice/tone packs** (e.g., a colder narrator, a crueller one) — all visual/audio only.
- **"Director's Cut" scenario pack:** *new* Haunt scenarios as optional content. To stay non-pay-to-win,
  paid scenarios are **side content**, never required, and never strengthen a paying player against others
  in a shared game (pass-and-play is one screen anyway).
- **"Support the dark" / name-your-price tip** for players who just want to fund development.

## How payments would be added later (and safely)

- A hosted checkout (e.g., **Stripe Checkout** / payment links) or a store wrapper — entitlements verified
  server-side; the client only ever learns "owns pack X" (a cosmetic flag).
- **No secrets in the repo, ever.** Publishable keys via env at build; secret keys only on a server/edge
  function. `.gitignore` already covers `.env*`.
- Until then, cosmetics remain unlock-by-play only.

## The growth flywheel

Free, gorgeous, instantly-shareable (the **Ledger run-card** export + social unfurl) → friends paste the
link → it teaches itself in one turn → broad, happy base → a small slice happily pays for *optional*
cosmetics and side scenarios. The product sells the product.
