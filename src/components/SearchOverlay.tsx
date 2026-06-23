import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/store/game";
import { nodeById } from "@/game/board";

const KIND_META: Record<string, { label: string; color: string }> = {
  light: { label: "LIGHT", color: "#FFD27A" },
  relic: { label: "RELIC", color: "#8BE0B0" },
  omen: { label: "OMEN", color: "#C2412D" },
};

export default function SearchOverlay() {
  const search = useGame((s) => s.search);
  const board = useGame((s) => s.board);
  const pressLuck = useGame((s) => s.pressLuck);
  const bankSearch = useGame((s) => s.bankSearch);
  if (!search) return null;

  const token = search.lastToken;
  const meta = token ? KIND_META[token.kind] : KIND_META.light;
  const oneOmen = search.omensThisSearch === 1 && !search.collapsed;
  const node = nodeById(board, search.nodeId);

  return (
    <motion.div className="fixed inset-0 z-40 flex items-center justify-center bg-void/85 p-6 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm rounded-2xl border bg-surface p-6 text-center shadow-2xl"
        style={{ borderColor: search.collapsed ? "#C2412D" : meta.color, boxShadow: `0 0 60px -10px ${search.collapsed ? "#C2412D" : meta.color}80` }}
      >
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.35em] text-ash">
          searching · {node.label ?? "the dark"}
        </p>

        <AnimatePresence mode="wait">
          {token && (
            <motion.div key={search.draws.length} initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 140, damping: 16 }} className="mt-4">
              <p className="font-mono text-xs uppercase tracking-[0.4em]" style={{ color: search.collapsed ? "#C2412D" : meta.color }}>
                {search.collapsed ? "COLLAPSE" : meta.label}
              </p>
              <h3 className="mt-2 font-display text-2xl tracking-wide text-bone">{search.collapsed ? "THE FLOOR GIVES WAY" : token.title}</h3>
              <p className="mt-3 font-body text-[1.02rem] italic leading-relaxed text-ash">
                {search.collapsed ? "A Hollow climbs from the ruin. You are wounded — and everything you gathered here is lost to the dark." : token.text}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* haul so far */}
        <div className="mt-5 flex items-center justify-center gap-1.5">
          {search.draws.map((d, i) => (
            <span key={i} className="h-2.5 w-2.5 rounded-full" style={{ background: KIND_META[d.kind].color }} title={d.title} />
          ))}
        </div>
        {!search.collapsed && (
          <p className="mt-2 font-mono text-sm text-ember-bright">banked: +{search.bankedLight} Light</p>
        )}

        {oneOmen && (
          <motion.p animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1, repeat: Infinity }} className="mt-3 font-body text-sm font-semibold text-blood">
            One Omen drawn. Another, and this place collapses.
          </motion.p>
        )}

        {search.collapsed ? (
          <button onClick={bankSearch} className="mt-6 w-full rounded-xl border-2 border-blood py-3 font-display tracking-widest text-blood transition hover:bg-blood/10">
            FLEE THE RUIN
          </button>
        ) : (
          <div className="mt-6 flex gap-3">
            <button onClick={pressLuck} className="flex-1 rounded-xl border-2 border-blood py-3 font-display tracking-wide text-blood transition hover:bg-blood/10">
              Press your luck
            </button>
            <button onClick={bankSearch} className="flex-1 rounded-xl border-2 border-ember bg-ember/10 py-3 font-display tracking-wide text-ember-bright transition hover:bg-ember/20">
              Bank &amp; stop
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
