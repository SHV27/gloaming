import { motion } from "framer-motion";
import { useGame } from "@/store/game";
import { buildLedger } from "@/game/ledger";

export default function Ledger() {
  const players = useGame((s) => s.players);
  const scenarioName = useGame((s) => s.scenarioName);
  const round = useGame((s) => s.round);
  const result = useGame((s) => s.result);
  const dread = useGame((s) => s.dread);
  const finite = useGame((s) => s.finite);
  const reset = useGame((s) => s.reset);

  const won = result === "win";
  const ledger = buildLedger({ players, scenarioName, finite, rounds: round, won, dread });
  const fateColor = (f: string) => (f === "escaped" ? "#8BE0B0" : f === "betrayed" ? "#C2412D" : "#8C8398");

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

      {/* the roster — each Survivor, their role, and their fate */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 + ledger.verses.length * 0.5 }}
        className="relative mt-10 w-full max-w-lg space-y-2"
      >
        {ledger.roster.map((e, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border px-4 py-2.5" style={{ borderColor: e.fate === "claimed" ? "#2a1c44" : `${e.color}66`, opacity: e.fate === "claimed" ? 0.7 : 1 }}>
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm" style={{ background: `${e.color}22`, color: e.color, border: `1px solid ${e.color}` }}>{e.sigil}</span>
            <span className="min-w-0 flex-1 font-body text-sm text-bone">
              <span className="font-display tracking-wide">{e.name}</span>
              <span className="ml-1.5 font-mono text-[0.55rem] uppercase tracking-wide text-ash">{e.roleName.replace("The ", "")}</span>
            </span>
            <span className="font-mono text-[0.65rem] uppercase tracking-widest" style={{ color: fateColor(e.fate) }}>{e.fate === "betrayed" ? "slipped away" : e.fate}</span>
          </div>
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
