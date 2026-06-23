import { motion } from "framer-motion";
import { useTypewriter } from "@/hooks/useTypewriter";
import { dreadTier } from "@/game/narrator";

const TIER_COLOR: Record<string, string> = {
  calm: "#8C8398",
  ominous: "#B9A7D6",
  menacing: "#E0A86A",
  devouring: "#C2412D",
};

export default function NarratorBar({ line, dread }: { line: string; dread: number }) {
  const tier = dreadTier(dread);
  const { shown, done } = useTypewriter(line);
  return (
    <div className="relative rounded-xl border border-rot/40 bg-deep/80 px-5 py-4 backdrop-blur-sm">
      <div className="mb-1 flex items-center gap-2">
        <motion.span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: TIER_COLOR[tier] }}
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.3em]" style={{ color: TIER_COLOR[tier] }}>
          the board speaks &middot; {tier}
        </span>
      </div>
      <p className="font-body text-[1.05rem] leading-relaxed text-bone min-h-[3.2em]">
        {shown}
        {!done && <span className="ml-0.5 inline-block w-2 animate-flicker text-ember">▍</span>}
      </p>
    </div>
  );
}
