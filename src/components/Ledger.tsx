import { motion } from "framer-motion";
import { useGame } from "@/store/game";
import { buildLedger } from "@/game/ledger";

export default function Ledger() {
  const { players, scenarioName, round, result, dread, log, reset } = useGame((s) => ({
    players: s.players,
    scenarioName: s.scenarioName,
    round: s.round,
    result: s.result,
    dread: s.dread,
    log: s.log,
    reset: s.reset,
  }));

  const won = result === "win";
  const ledger = buildLedger({
    players,
    scenarioName,
    rounds: round,
    won,
    dread,
    topLog: log.slice(-3).map((l) => l.text),
  });

  return (
    <div className="relative mx-auto flex min-h-[100svh] max-w-2xl flex-col items-center justify-center px-6 py-16">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: won
            ? "radial-gradient(80% 60% at 50% 30%, rgba(245,166,35,0.16), transparent 70%)"
            : "radial-gradient(80% 60% at 50% 30%, rgba(59,42,87,0.45), transparent 70%)",
        }}
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4 }}
        className="relative font-mono text-xs uppercase tracking-[0.5em] text-ash"
      >
        the ledger
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1.2, delay: 0.2 }}
        className={`relative mt-4 text-center font-display text-4xl font-bold tracking-[0.1em] sm:text-5xl ${
          won ? "ember-text" : "text-bone"
        }`}
      >
        {ledger.title}
      </motion.h1>

      <div className="relative mt-10 space-y-5">
        {ledger.verses.map((v, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6 + i * 0.5 }}
            className="font-body text-[1.1rem] leading-relaxed text-bone first-letter:font-display first-letter:text-2xl first-letter:text-ember"
          >
            {v}
          </motion.p>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 + ledger.verses.length * 0.5 }}
        className="relative mt-10 flex flex-wrap justify-center gap-3"
      >
        {players.map((p) => (
          <span
            key={p.id}
            className="rounded-full border px-4 py-1.5 font-mono text-xs tracking-wide"
            style={{
              borderColor: p.escaped ? p.color : "#3B2A57",
              color: p.escaped ? p.color : "#8C8398",
              opacity: p.escaped ? 1 : 0.6,
            }}
          >
            {p.name} — {p.traitor ? "slipped away" : p.escaped ? "escaped" : "claimed"}
          </span>
        ))}
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 + ledger.verses.length * 0.5 }}
        onClick={reset}
        className="relative mt-12 rounded-xl bg-ember px-10 py-3.5 font-display text-lg tracking-widest text-void shadow-ember transition hover:bg-ember-bright hover:shadow-ember-lg"
      >
        AGAIN, IN THE DARK
      </motion.button>
    </div>
  );
}
