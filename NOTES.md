# NOTES — build log & dead-ends (so future passes don't repeat them)

- **Tailwind opacity on token colors:** defining `colors` as `var(--x)` breaks `bg-x/40` opacity
  modifiers (PostCSS: "class does not exist"). Fixed by giving Tailwind the literal hex values;
  CSS vars stay in `index.css` only for raw-CSS usages (body bg, scrollbar, `.ember-text`).
- **Persisting the scenario:** `Scenario.escapeCapacity` is a function → not serializable. Store only
  primitives (`scenarioId`, `escapeSlots`, `ritualGoal`, `accentColor`, …); re-derive the live object
  via `scenarioFor(id)` if ever needed.
- **Soft-lock guards (verified by headless sim):** board is fully connected (movement never dead-ends);
  Gloom flood marches inward and reaches the Heart by ~round 8 (the lose path always terminates);
  a player can always just *search in place*, so being surrounded by Gloom is not a lock; 0-Light is
  legal (movement is from the die, not Light).
- **Verification done without a browser screenshot tool:** `tsc --noEmit` clean, `vite build` green
  (417 modules), dev server boots and transforms `main.tsx`/`App.tsx` with no errors, plus an engine
  invariant smoke test (connectivity / flood-termination / scenario caps).

## Session 2 (v2 — "the real game") notes
- Reworked to the rulebook: 3-state nodes (lit/tainted/flooded as a `Record<id,state>`), Wards→Heart→Ritual
  win path, the Hollow (BFS `shortestPath` hunt, telegraphed in Board), push-luck Search (a `SearchSession`
  sub-state machine; 2nd omen in one search = collapse → spawn Hollow + wound + lose banked), wounds→Marked
  →Claimed, loud Dread clock (DreadAtmosphere: vignette + backdrop saturate + heartbeat), aware narrator
  (per-action banks + recall slot), Intro + always-on objective tracker (StatusBar) + first-time tooltips
  (separate `gloaming-hints-v2` store so they survive a game reset).
- **Save bumped to `gloaming-save-v2`** — v1 saves are a different shape and are simply ignored (no migration).
- Re-verified by headless sim against the real board: win path reachable, Hunt path legal, Gloom floods the
  Heart by ~round 11 (always terminates), push-luck distribution makes collapse possible but not guaranteed.
- Deferred to S3 (kept minimal-but-present where it already existed): Survivor roles (lobby still name-entry),
  full Haunt per-scenario rule rewrites (reveal + Dread/Gloom spike kept), Marked-targeted finite-Gate Whisper
  (existing Whisper screen kept; now *prefers* a Marked target when offered).

## Session 3 (v3 — "Depth & Identity") notes
- Roles are fully data-driven in `roles.ts` (knobs: searchLightBonus, moveBonus, burnCost, woundsMax,
  searchCollapseAt, foresight, whisperPriority). Add a Survivor = add an entry. Store reads `role(p.role)`
  for every ability; wounds pips/burn cost are per-role in the UI.
- Scenario mechanics live as flags on the `SCENARIOS` array and are read at runtime via
  `scenarioById(scenarioId)` — functions/flags are NOT persisted (only scenarioId + display strings + the
  derived `escapeSlots`). 6 scenarios, each changes win/lose math.
- `gloom.ts` is the single source of truth for the Gloom advance; the Cartographer's foresight calls the
  exact same pure fn to preview next round — guaranteed to match what actually happens.
- **Bug caught in sim & fixed:** Long Night kept the Heart "lit" while only flooding Tainted tiles, so the
  Heart could never flood and (Dread frozen) the scenario could stall forever. Fixed: longNight flood now
  consumes any non-flooded neighbour, outer-first (creeping tide) → Heart falls ~round 11 = survivable sprint.
- Finite escape (`_win`): only players on the Heart at Ritual completion escape, capped at gateCapacity =
  players−1; traitors already out count against it. Non-finite scenarios keep the co-op "all alive escape".
- Whisper: finite-only, 3–4P, target priority Forsaken → Marked → random. Accept = traitor + escaped + secret
  lantern/dread sabotage. Absent in 2P (whisperMode forced off when <3 players).
- Save bumped to `gloaming-save-v3` (Player gains `role`; new scenario/foresight/finite fields).

## Session 4 (v4 — "Ship & Shine", final) notes
- **Audio** is 100% procedural Web Audio (`src/audio/sound.ts`) — no asset files, no network, every call
  try/caught so it can never break the build. Context resumes on first `pointerdown` (autoplay-safe).
- **Juice** is decoupled from logic: `useFx` store (shake/punch/flash/particle bursts) + `FxLayer` wrapper;
  `GameFx` is a mount-once component that *diffs* game state each render and fires sound + fx + bursts. The
  pure store stays clean. `prefers-reduced-motion` → `<MotionConfig reducedMotion="user">` globally, shake→
  flash, ambient embers stilled, burst counts clamped.
- **Tokens glide** by rendering players/Hollows in a top-level layer of `motion.g` animating to node coords
  (spring) instead of redrawing per-node — gives continuity.
- **Teaching:** Guided coach in `GameScreen` derives the in-voice instruction from state (auto-advances, no
  manual dismiss) for the first ~2 rounds; JIT tips (first Tainted/Hollow/Ward) via the `useHints` once-store.
- **Cosmetics/profile** are separate persisted stores (`gloaming-profile-v1`) so they survive game resets and
  saves. Themes recolor via CSS vars (`--ember`, `--ember-bright`, `--gloam-rot`) + the board accent fallback.
- **Persistence hardened:** game store `merge` validates the board shape and falls back to fresh state → a
  corrupt/stale save can't white-screen. Plus a top-level `ErrorBoundary` with an in-world "clear & restart".
- **OG image is `public/og.svg`.** Modern crawlers (Slack/Discord/Telegram/X) render it; LinkedIn/WhatsApp
  may want a PNG — rasterizing og.svg→og.png is the one follow-up for perfect unfurl everywhere (no tooling
  in this env to rasterize cleanly; didn't want to risk the build installing native image libs).
- Lazy-loaded overlays (HauntReveal/WhisperScreen/HowToPlay/Ledger) are code-split chunks; initial JS ~115kB gz.

## Cut for time (ask for these next session)
- Audio (ambient drone, dice, whispers) — hook left, behind a mute toggle.
- Seeded/random board layouts — currently one hand-tuned 21-node board.
- Bespoke per-scenario art and animated manifestation creatures (now: marked nodes + narration).
- An actual end-to-end click-through screenshot pass in a real browser.
- LLM narrator adapter wired into `narrator.ts` (kept scripted by design).
