import { motion } from "framer-motion";
import type { Card } from "@/game/types";

const KIND_META: Record<string, { label: string; color: string }> = {
  cache: { label: "A CACHE", color: "#8BE0B0" },
  boon: { label: "A BOON", color: "#FFD27A" },
  hazard: { label: "A HAZARD", color: "#C2412D" },
  omen: { label: "AN OMEN", color: "#B9A7D6" },
  manifest: { label: "A MANIFESTATION", color: "#C2412D" },
};

function delta(label: string, n: number | undefined, color: string) {
  if (!n) return null;
  return (
    <span className="font-mono text-sm" style={{ color }}>
      {n > 0 ? "+" : ""}
      {n} {label}
    </span>
  );
}

export default function CardDraw({ card, onDismiss }: { card: Card; onDismiss: () => void }) {
  const meta = KIND_META[card.kind];
  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center bg-void/80 p-6 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onDismiss}
    >
      <motion.div
        initial={{ rotateY: 90, opacity: 0, scale: 0.9 }}
        animate={{ rotateY: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 16 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border bg-surface p-7 text-center shadow-2xl"
        style={{ borderColor: meta.color, boxShadow: `0 0 60px -10px ${meta.color}80` }}
      >
        <p className="font-mono text-xs uppercase tracking-[0.4em]" style={{ color: meta.color }}>
          {meta.label}
        </p>
        <h3 className="mt-3 font-display text-2xl font-semibold tracking-wide text-bone">{card.title}</h3>
        <p className="mt-4 font-body text-[1.05rem] italic leading-relaxed text-ash">{card.text}</p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          {delta("Light", card.light, "#FFD27A")}
          {delta("Lantern", card.lantern, "#F5A623")}
          {delta("Dread", card.dread, "#C2412D")}
          {delta(card.omen && card.omen > 1 ? "Omens" : "Omen", card.omen, "#B9A7D6")}
        </div>

        <button
          onClick={onDismiss}
          className="mt-7 w-full rounded-xl border py-3 font-display tracking-widest text-bone transition hover:bg-void/40"
          style={{ borderColor: meta.color }}
        >
          ACCEPT IT
        </button>
      </motion.div>
    </motion.div>
  );
}
