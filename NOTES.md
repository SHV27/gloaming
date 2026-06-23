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

## Cut for time (ask for these next session)
- Audio (ambient drone, dice, whispers) — hook left, behind a mute toggle.
- Seeded/random board layouts — currently one hand-tuned 21-node board.
- Bespoke per-scenario art and animated manifestation creatures (now: marked nodes + narration).
- An actual end-to-end click-through screenshot pass in a real browser.
- LLM narrator adapter wired into `narrator.ts` (kept scripted by design).
