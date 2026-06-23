import { useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/store/game";
import { useProfile } from "@/store/profile";
import { ROLE_LIST, ROLES } from "@/game/roles";
import type { RoleId } from "@/game/roles";
import Wardrobe from "./Wardrobe";

interface Slot {
  name: string;
  role: RoleId;
}

const DEFAULTS: RoleId[] = ["lampwright", "cartographer", "warden", "forsaken"];

export default function Lobby({ onHelp }: { onHelp?: () => void }) {
  const newGame = useGame((s) => s.newGame);
  const guided = useProfile((s) => s.guided);
  const setGuided = useProfile((s) => s.setGuided);
  const [wardrobe, setWardrobe] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([
    { name: "", role: "lampwright" },
    { name: "", role: "cartographer" },
  ]);
  const [whisper, setWhisper] = useState(false);

  const valid = slots.filter((s) => s.name.trim().length > 0);
  const canStart = valid.length >= 2;
  const whisperAvailable = slots.length >= 3;

  const setName = (i: number, v: string) => setSlots((a) => a.map((x, j) => (j === i ? { ...x, name: v.slice(0, 16) } : x)));
  const setRole = (i: number, role: RoleId) => setSlots((a) => a.map((x, j) => (j === i ? { ...x, role } : x)));
  const addPlayer = () => slots.length < 4 && setSlots((a) => [...a, { name: "", role: DEFAULTS[a.length] }]);
  const removePlayer = (i: number) => slots.length > 2 && setSlots((a) => a.filter((_, j) => j !== i));

  return (
    <div className="relative mx-auto flex min-h-[100svh] max-w-3xl flex-col items-center justify-center px-6 py-16">
      <motion.div aria-hidden className="pointer-events-none absolute left-1/2 top-[14%] h-72 w-72 -translate-x-1/2 rounded-full" style={{ background: "radial-gradient(circle, rgba(245,166,35,0.22), transparent 70%)" }} animate={{ opacity: [0.5, 0.85, 0.45, 0.7], scale: [1, 1.05, 0.98, 1.02] }} transition={{ duration: 6, repeat: Infinity }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="relative text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.5em] text-ash">a living board game</p>
        <h1 className="font-display title-glow text-6xl font-bold tracking-[0.18em] text-bone sm:text-8xl">GLOAM<span className="ember-text">ING</span></h1>
        <p className="mx-auto mt-5 max-w-md font-body text-lg italic leading-relaxed text-ash">Choose who you are. A sentient dark is eating the map — relight the Wards, reach the Heart, and pray it doesn&rsquo;t know your name.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.3 }} className="relative mt-10 w-full max-w-xl space-y-3">
        {slots.map((slot, i) => {
          const r = ROLES[slot.role];
          return (
            <div key={i} className="rounded-2xl border border-rot/60 bg-deep/70 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-base" style={{ background: `${r.color}22`, color: r.color, border: `1px solid ${r.color}` }}>{r.sigil}</span>
                <input value={slot.name} onChange={(e) => setName(i, e.target.value)} placeholder={`Wanderer ${i + 1}`} className="w-full rounded-lg border border-rot/50 bg-void/60 px-4 py-2 font-body text-bone placeholder:text-ash/50 focus:border-ember focus:outline-none" />
                {slots.length > 2 && <button onClick={() => removePlayer(i)} aria-label={`Remove player ${i + 1}`} className="shrink-0 rounded-md px-2 py-1 font-mono text-ash transition hover:text-blood">✕</button>}
              </div>

              <div className="mt-3 grid grid-cols-4 gap-1.5">
                {ROLE_LIST.map((role) => {
                  const sel = slot.role === role.id;
                  return (
                    <button key={role.id} onClick={() => setRole(i, role.id)} title={role.fantasy}
                      className="flex flex-col items-center gap-0.5 rounded-lg border px-1 py-2 transition"
                      style={{ borderColor: sel ? role.color : "#2a1c44", background: sel ? `${role.color}1a` : "transparent" }}>
                      <span className="text-base" style={{ color: sel ? role.color : "#8C8398" }}>{role.sigil}</span>
                      <span className="font-mono text-[0.55rem] uppercase tracking-wide" style={{ color: sel ? role.color : "#8C8398" }}>{role.name.replace("The ", "")}</span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 font-body text-[0.8rem] italic text-ash">
                <span style={{ color: r.color }}>{r.name}</span> — {r.blurb}
              </p>
            </div>
          );
        })}

        {slots.length < 4 && (
          <button onClick={addPlayer} className="w-full rounded-lg border border-dashed border-rot/60 py-2 font-mono text-xs uppercase tracking-widest text-ash transition hover:border-ember hover:text-ember">+ add another soul</button>
        )}

        <label className={`flex items-start gap-3 rounded-lg border p-3 transition ${whisperAvailable ? "cursor-pointer border-rot/50 bg-void/40" : "border-rot/20 opacity-40"}`}>
          <input type="checkbox" checked={whisper && whisperAvailable} disabled={!whisperAvailable} onChange={(e) => setWhisper(e.target.checked)} className="mt-1 h-4 w-4 accent-ember" />
          <span>
            <span className="font-display text-sm tracking-wide text-bone">The Whisper</span>
            <span className="block font-body text-sm text-ash">If the Gate proves too narrow, the dark will privately tempt one of you to leave the rest behind.{!whisperAvailable && " (needs 3+ players)"}</span>
          </span>
        </label>

        {/* Guided vs Straight In */}
        <div className="flex items-center gap-2 rounded-lg border border-rot/50 bg-void/40 p-1.5">
          {([["Guided Game", true], ["Straight In", false]] as const).map(([label, val]) => (
            <button key={label} onClick={() => setGuided(val)} className="flex-1 rounded-md py-2 font-mono text-[0.7rem] uppercase tracking-widest transition"
              style={{ background: guided === val ? "var(--ember)" : "transparent", color: guided === val ? "#0A0710" : "#8C8398" }}>
              {label}
            </button>
          ))}
        </div>
        <p className="-mt-1 px-1 font-body text-[0.72rem] italic text-ash/70">
          {guided ? "The board will teach you your first turn, in its own voice." : "No tutorial. The dark will not be gentle."}
        </p>

        <button onClick={() => canStart && newGame(valid, whisper)} disabled={!canStart} className="w-full rounded-xl bg-ember py-3.5 font-display text-lg font-semibold tracking-widest text-void shadow-ember transition enabled:hover:bg-ember-bright enabled:hover:shadow-ember-lg disabled:cursor-not-allowed disabled:opacity-30">
          ENTER THE GLOAMING
        </button>

        <div className="flex gap-2">
          <button onClick={onHelp} className="flex-1 rounded-lg border border-rot/50 py-2 font-mono text-[0.7rem] uppercase tracking-widest text-ash transition hover:border-ember hover:text-ember">How to Play</button>
          <button onClick={() => setWardrobe(true)} className="flex-1 rounded-lg border border-rot/50 py-2 font-mono text-[0.7rem] uppercase tracking-widest text-ash transition hover:border-ember hover:text-ember">Your Ledger</button>
        </div>
      </motion.div>

      {wardrobe && <Wardrobe onClose={() => setWardrobe(false)} />}

      <p className="relative mt-6 max-w-sm text-center font-body text-xs italic text-ash/60">2 players: pure co-op against the board. 3&ndash;4: co-op, with a knife in the dark.</p>
    </div>
  );
}
