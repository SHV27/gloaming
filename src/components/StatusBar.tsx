import { motion } from "framer-motion";

interface Props {
  dread: number;
  litWards: number;
  totalWards: number;
  heartOpen: boolean;
  ritualProgress: number;
  ritualGoal: number;
  round: number;
  scenarioName: string | null;
  scenarioRule: string | null;
  dreadFrozen: boolean;
  finite: boolean;
  escapeSlots: number;
  players: number;
}

export default function StatusBar({ dread, litWards, totalWards, heartOpen, ritualProgress, ritualGoal, round, scenarioName, scenarioRule, dreadFrozen, finite, escapeSlots, players }: Props) {
  const dreadColor = dread >= 82 ? "#C2412D" : dread >= 55 ? "#E0A86A" : "#7AB8FF";
  return (
    <header className="border-b border-rot/40 bg-deep/80 px-4 py-2.5 backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="font-display text-lg tracking-[0.2em] text-bone">
          GLOAM<span className="text-ember">ING</span>
        </span>

        <div className="flex items-center gap-1.5" title="Light the Wards to open the Heart">
          <span className="font-mono text-[0.6rem] uppercase tracking-widest text-ash">Wards</span>
          {Array.from({ length: totalWards }).map((_, i) => (
            <span key={i} className="h-3 w-3 rounded-full" style={{ background: i < litWards ? "#F5A623" : "#241738", boxShadow: i < litWards ? "0 0 8px #F5A623" : "none" }} />
          ))}
          <span className="font-mono text-xs text-bone">{litWards}/{totalWards}</span>
        </div>

        <span className="flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-wider" title="The Heart opens once the true Wards are lit">
          <span className="text-ash">Heart</span>
          {heartOpen ? <span className="text-ember-bright">{ritualProgress >= ritualGoal ? "escaped" : `ritual ${ritualProgress}/${ritualGoal}`}</span> : <span className="text-ash">locked</span>}
        </span>

        {finite && (
          <span className="font-mono text-[0.65rem] uppercase tracking-wider text-blood" title="Only this many can escape">Gate {escapeSlots}/{players}</span>
        )}

        <div className="flex min-w-[150px] flex-1 items-center gap-2" title={dreadFrozen ? "Dread is frozen this Haunt" : "At 100 the Gloom devours everything"}>
          <span className="font-mono text-[0.6rem] uppercase tracking-widest" style={{ color: dreadColor }}>Dread{dreadFrozen ? " ❄" : ""}</span>
          <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-void/80 ring-1 ring-rot/40">
            <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: `linear-gradient(90deg, #5a2a3a, ${dreadColor})` }} animate={{ width: `${Math.min(100, dread)}%` }} transition={{ duration: 0.6 }} />
            <motion.div className="absolute inset-y-0" style={{ left: `${Math.min(100, dread)}%`, width: 2, background: "#fff" }} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: Math.max(0.5, 1.5 - dread / 100), repeat: Infinity }} />
          </div>
          <span className="w-9 text-right font-mono text-xs" style={{ color: dreadColor }}>{Math.round(Math.min(100, dread))}</span>
        </div>

        <span className="font-mono text-[0.65rem] uppercase tracking-widest">
          {scenarioName ? <span className="text-blood">{scenarioName}</span> : <span className="text-ash">Round {round}</span>}
        </span>
      </div>

      {scenarioRule && (
        <p className="mt-1.5 font-body text-[0.72rem] italic text-blood/90">{scenarioName}: {scenarioRule}</p>
      )}
    </header>
  );
}
