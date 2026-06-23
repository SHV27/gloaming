import { motion } from "framer-motion";

interface Section {
  glyph: string;
  color: string;
  title: string;
  body: string;
}

const SECTIONS: Section[] = [
  { glyph: "✦", color: "#F5A623", title: "The goal", body: "Light the 3 Wards, open the Heart, and finish the Escape Ritual — before Dread fills to 100." },
  { glyph: "→", color: "#7AB8FF", title: "Move", body: "Roll, then step along the lit paths. Violet tiles (Tainted) cost more; black ones (Flooded) bite your Light. Stay in the light." },
  { glyph: "☀", color: "#FFD27A", title: "Search — push your luck", body: "Dig a tile for Light. Press your luck for more… but draw too many Omens in one Search and the tile collapses: a Hollow spawns, you're wounded, your haul is lost." },
  { glyph: "✚", color: "#8BE0B0", title: "Kindle & burn", body: "On a Ward, Kindle it with Light. Anywhere, spend the shared Lantern to Burn the Gloom back from a tile beside you." },
  { glyph: "◆", color: "#6b4ea0", title: "The Gloom & the Hunt", body: "Each round the Gloom floods inward and the Hollow step toward the nearest survivor — their path is shown in red. Three Wounds and you're Claimed." },
  { glyph: "☾", color: "#C2412D", title: "The Haunt", body: "Fill the Omen track and the board wakes with a scheme — every game a different one. Some open the Gate for only a few. Choose well." },
];

export default function HowToPlay({ onClose }: { onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-[65] flex items-center justify-center bg-void/90 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88svh] w-full max-w-lg overflow-y-auto rounded-2xl border border-rot/60 bg-deep/95 p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl tracking-wide text-bone">How to survive</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-md px-2 py-1 font-mono text-ash transition hover:text-bone">✕</button>
        </div>
        <p className="mt-1 font-body text-sm italic text-ash">The board will teach you the rest as you go. It enjoys that part.</p>

        <div className="mt-5 space-y-3">
          {SECTIONS.map((s) => (
            <div key={s.title} className="flex gap-3 rounded-xl border border-rot/40 bg-void/40 p-3">
              <motion.span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-lg"
                style={{ background: `${s.color}1a`, color: s.color, border: `1px solid ${s.color}` }}
                animate={{ scale: [1, 1.12, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2.4, repeat: Infinity }}
              >
                {s.glyph}
              </motion.span>
              <div>
                <p className="font-display text-sm tracking-wide text-bone">{s.title}</p>
                <p className="font-body text-sm leading-snug text-ash">{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        <button onClick={onClose} className="mt-6 w-full rounded-xl bg-ember py-3 font-display tracking-widest text-void shadow-ember transition hover:bg-ember-bright">
          STEP IN
        </button>
      </motion.div>
    </motion.div>
  );
}
