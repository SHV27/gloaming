import { motion } from "framer-motion";
import { useTypewriter } from "@/hooks/useTypewriter";

interface Props {
  name: string;
  subtitle: string;
  reveal: string;
  rule: string;
  accent: string;
  onDismiss: () => void;
}

export default function HauntReveal({ name, subtitle, reveal, rule, accent, onDismiss }: Props) {
  const { shown, done } = useTypewriter(reveal, 22);
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ background: `radial-gradient(120% 100% at 50% 30%, ${accent}33, #050309 70%)` }}
    >
      <motion.div aria-hidden className="pointer-events-none absolute inset-0" animate={{ opacity: [0, 0.5, 0] }} transition={{ duration: 1.2, times: [0, 0.2, 1] }} style={{ background: accent }} />
      <div className="relative max-w-2xl text-center">
        <motion.p initial={{ opacity: 0, letterSpacing: "0.1em" }} animate={{ opacity: 1, letterSpacing: "0.5em" }} transition={{ duration: 1.2 }} className="font-mono text-xs uppercase tracking-[0.5em]" style={{ color: accent }}>
          the board wakes
        </motion.p>
        <motion.h2 initial={{ opacity: 0, scale: 1.3, filter: "blur(12px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} transition={{ duration: 1, delay: 0.2 }} className="mt-3 font-display text-5xl font-bold tracking-[0.12em] text-bone sm:text-7xl" style={{ textShadow: `0 0 50px ${accent}` }}>
          {name}
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-2 font-display text-lg italic tracking-wide text-ash">
          {subtitle}
        </motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="mx-auto mt-7 max-w-xl font-body text-lg leading-relaxed text-bone min-h-[6em]">
          {shown}
        </motion.p>
        {done && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <p className="mx-auto mb-6 max-w-md rounded-lg border px-4 py-2 font-mono text-xs uppercase tracking-wider" style={{ borderColor: `${accent}88`, color: accent }}>
              {rule}
            </p>
            <button onClick={onDismiss} className="rounded-xl border-2 px-10 py-3 font-display text-lg tracking-widest text-bone transition hover:bg-void/40" style={{ borderColor: accent, boxShadow: `0 0 40px -8px ${accent}` }}>
              FACE IT
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
