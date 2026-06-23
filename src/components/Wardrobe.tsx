import { motion } from "framer-motion";
import { useProfile, favoriteRole } from "@/store/profile";
import { THEMES } from "@/game/cosmetics";
import { ROLES } from "@/game/roles";

export default function Wardrobe({ onClose }: { onClose: () => void }) {
  const { gamesPlayed, wins, totalEscapes, longestSurvival, roleCounts, unlocked, theme, setTheme } = useProfile();
  const fav = favoriteRole(roleCounts);

  const stat = (label: string, value: string) => (
    <div className="rounded-lg border border-rot/40 bg-void/40 px-3 py-2 text-center">
      <p className="font-mono text-lg text-ember-bright">{value}</p>
      <p className="font-mono text-[0.55rem] uppercase tracking-widest text-ash">{label}</p>
    </div>
  );

  return (
    <motion.div className="fixed inset-0 z-[65] flex items-center justify-center bg-void/90 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(e) => e.stopPropagation()} className="max-h-[88svh] w-full max-w-lg overflow-y-auto rounded-2xl border border-rot/60 bg-deep/95 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl tracking-wide text-bone">Your Ledger</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-md px-2 py-1 font-mono text-ash transition hover:text-bone">✕</button>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {stat("games", String(gamesPlayed))}
          {stat("escaped", String(totalEscapes))}
          {stat("wins", String(wins))}
          {stat("longest", `${longestSurvival}r`)}
        </div>
        {fav && (
          <p className="mt-3 font-body text-sm text-ash">
            Favored Survivor: <span style={{ color: ROLES[fav].color }}>{ROLES[fav].sigil} {ROLES[fav].name}</span>
          </p>
        )}

        <p className="mt-6 mb-2 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-ash">Wardrobe — board themes (cosmetic only)</p>
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map((t) => {
            const isUnlocked = unlocked.includes(t.id);
            const selected = theme === t.id;
            return (
              <button
                key={t.id}
                disabled={!isUnlocked}
                onClick={() => isUnlocked && setTheme(t.id)}
                className="rounded-xl border p-3 text-left transition disabled:cursor-not-allowed"
                style={{ borderColor: selected ? t.vars.ember : "#2a1c44", background: selected ? `${t.vars.ember}14` : "transparent", opacity: isUnlocked ? 1 : 0.5 }}
              >
                <div className="flex items-center gap-2">
                  <span className="flex gap-1">
                    <span className="h-3 w-3 rounded-full" style={{ background: t.vars.emberBright }} />
                    <span className="h-3 w-3 rounded-full" style={{ background: t.vars.accent }} />
                    <span className="h-3 w-3 rounded-full" style={{ background: t.vars.rot }} />
                  </span>
                  <span className="font-display text-sm tracking-wide text-bone">{t.name}</span>
                  {selected && <span className="ml-auto font-mono text-[0.55rem] text-ember">equipped</span>}
                </div>
                <p className="mt-1 font-body text-[0.72rem] leading-snug text-ash">{t.blurb}</p>
                {!isUnlocked && <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-wide text-blood">🔒 {t.unlock}</p>}
              </button>
            );
          })}
        </div>
        <p className="mt-4 font-body text-[0.7rem] italic text-ash/70">Cosmetics are earned by playing and never affect the game. No pay-to-win, ever.</p>
      </motion.div>
    </motion.div>
  );
}
