import { motion } from "framer-motion";

interface Props {
  dread: number;
  omens: number;
  omenThreshold: number;
  lantern: number;
  round: number;
  ritualProgress: number;
  ritualGoal: number;
  hauntFired: boolean;
  scenarioName: string | null;
}

export default function StatusBar({
  dread,
  omens,
  omenThreshold,
  lantern,
  round,
  ritualProgress,
  ritualGoal,
  hauntFired,
  scenarioName,
}: Props) {
  const dreadColor = dread >= 82 ? "#C2412D" : dread >= 55 ? "#E0A86A" : "#7AB8FF";
  return (
    <header className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-rot/40 bg-deep/70 px-4 py-2.5 backdrop-blur-sm">
      <span className="font-display text-lg tracking-[0.2em] text-bone">
        GLOAM<span className="text-ember">ING</span>
      </span>

      {/* Dread meter — the doom clock */}
      <div className="flex min-w-[160px] flex-1 items-center gap-2">
        <span className="font-mono text-[0.6rem] uppercase tracking-widest text-ash">Dread</span>
        <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-void/80">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ background: dreadColor }}
            animate={{ width: `${Math.min(100, dread)}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
        <span className="w-9 text-right font-mono text-xs" style={{ color: dreadColor }}>
          {Math.round(Math.min(100, dread))}
        </span>
      </div>

      {/* Lantern */}
      <div className="flex items-center gap-1.5" title="Shared Lantern pool">
        <span className="text-ember">🔥</span>
        <span className="font-mono text-sm text-ember">{lantern}</span>
      </div>

      {/* Omen pips / ritual progress */}
      {hauntFired ? (
        <div className="flex items-center gap-1.5" title="Ritual progress">
          <span className="font-mono text-[0.6rem] uppercase tracking-widest text-ash">Ritual</span>
          {Array.from({ length: ritualGoal }).map((_, i) => (
            <span
              key={i}
              className="h-2.5 w-2.5 rounded-sm"
              style={{ background: i < ritualProgress ? "#F5A623" : "#241738" }}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-1.5" title="Omen track">
          <span className="font-mono text-[0.6rem] uppercase tracking-widest text-ash">Omens</span>
          {Array.from({ length: omenThreshold }).map((_, i) => (
            <span
              key={i}
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: i < omens ? "#B9A7D6" : "#241738", boxShadow: i < omens ? "0 0 8px #B9A7D6" : "none" }}
            />
          ))}
        </div>
      )}

      <span className="font-mono text-[0.65rem] uppercase tracking-widest text-ash">
        {scenarioName ? <span className="text-blood">{scenarioName}</span> : `Round ${round}`}
      </span>
    </header>
  );
}
