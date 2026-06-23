import { useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/store/game";

export default function Lobby() {
  const newGame = useGame((s) => s.newGame);
  const [names, setNames] = useState<string[]>(["", ""]);
  const [whisper, setWhisper] = useState(false);

  const valid = names.filter((n) => n.trim().length > 0);
  const canStart = valid.length >= 2;
  const whisperAvailable = names.length >= 3;

  const setName = (i: number, v: string) => setNames((a) => a.map((x, j) => (j === i ? v.slice(0, 16) : x)));
  const addPlayer = () => names.length < 4 && setNames((a) => [...a, ""]);
  const removePlayer = (i: number) => names.length > 2 && setNames((a) => a.filter((_, j) => j !== i));

  return (
    <div className="relative mx-auto flex min-h-[100svh] max-w-3xl flex-col items-center justify-center px-6 py-16">
      {/* a single guttering lantern — the hero is atmosphere, not a logo+button */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[22%] h-72 w-72 -translate-x-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(245,166,35,0.22), transparent 70%)" }}
        animate={{ opacity: [0.5, 0.85, 0.45, 0.7], scale: [1, 1.05, 0.98, 1.02] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative text-center"
      >
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.5em] text-ash">a living board game</p>
        <h1 className="font-display title-glow text-6xl font-bold tracking-[0.18em] text-bone sm:text-8xl">
          GLOAM<span className="ember-text">ING</span>
        </h1>
        <p className="mx-auto mt-5 max-w-md font-body text-lg italic leading-relaxed text-ash">
          A sentient dark is eating the map. Reach the Heart, finish the ritual,
          and pray it doesn&rsquo;t already know your name.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.4 }}
        className="relative mt-12 w-full max-w-md rounded-2xl border border-rot/60 bg-deep/70 p-6 backdrop-blur-sm"
      >
        <p className="mb-4 font-mono text-[0.7rem] uppercase tracking-[0.3em] text-ash">
          who walks in &mdash; {valid.length}/4
        </p>
        <div className="space-y-3">
          {names.map((n, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: ["#F5A623", "#7AB8FF", "#8BE0B0", "#E083C0"][i] }} />
              <input
                value={n}
                onChange={(e) => setName(i, e.target.value)}
                placeholder={`Wanderer ${i + 1}`}
                className="w-full rounded-lg border border-rot/50 bg-void/60 px-4 py-2.5 font-body text-bone placeholder:text-ash/50 focus:border-ember focus:outline-none"
              />
              {names.length > 2 && (
                <button
                  onClick={() => removePlayer(i)}
                  aria-label={`Remove player ${i + 1}`}
                  className="shrink-0 rounded-md px-2 py-1 font-mono text-ash transition hover:text-blood"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {names.length < 4 && (
          <button
            onClick={addPlayer}
            className="mt-4 w-full rounded-lg border border-dashed border-rot/60 py-2 font-mono text-xs uppercase tracking-widest text-ash transition hover:border-ember hover:text-ember"
          >
            + add another soul
          </button>
        )}

        <label
          className={`mt-5 flex items-start gap-3 rounded-lg border p-3 transition ${
            whisperAvailable ? "border-rot/50 bg-void/40 cursor-pointer" : "border-rot/20 opacity-40"
          }`}
        >
          <input
            type="checkbox"
            checked={whisper && whisperAvailable}
            disabled={!whisperAvailable}
            onChange={(e) => setWhisper(e.target.checked)}
            className="mt-1 h-4 w-4 accent-ember"
          />
          <span>
            <span className="font-display text-sm tracking-wide text-bone">The Whisper</span>
            <span className="block font-body text-sm text-ash">
              The dark will privately offer one of you a way out &mdash; if you betray the rest.
              {!whisperAvailable && " (needs 3+ players)"}
            </span>
          </span>
        </label>

        <button
          onClick={() => canStart && newGame(valid, whisper)}
          disabled={!canStart}
          className="mt-6 w-full rounded-xl bg-ember py-3.5 font-display text-lg font-semibold tracking-widest text-void shadow-ember transition enabled:hover:bg-ember-bright enabled:hover:shadow-ember-lg disabled:cursor-not-allowed disabled:opacity-30"
        >
          ENTER THE GLOAMING
        </button>
      </motion.div>

      <p className="relative mt-8 max-w-sm text-center font-body text-xs italic text-ash/60">
        2 players: pure co-op against the board. 3&ndash;4: co-op, with a knife in the dark.
      </p>
    </div>
  );
}
