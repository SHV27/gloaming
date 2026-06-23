import { motion, AnimatePresence } from "framer-motion";
import { useGame, scenarioById } from "@/store/game";
import { useHints } from "@/store/hints";
import { useProfile } from "@/store/profile";
import { role as roleDef } from "@/game/roles";
import { gloomSpread, gloomSpreadCount } from "@/game/gloom";
import { neighbors, shortestPath } from "@/game/board";
import { themeById } from "@/game/cosmetics";
import Board from "./Board";
import NarratorBar from "./NarratorBar";
import StatusBar from "./StatusBar";

export default function GameScreen() {
  const s = useGame();
  const { seen, see } = useHints();
  const guided = useProfile((st) => st.guided);
  const themeId = useProfile((st) => st.theme);
  const current = s.players[s.turnIndex];
  if (!current) return null;
  const cr = roleDef(current.role);
  const boardAccent = s.accentColor ?? themeById(themeId).vars.accent;

  const litWards = s.board.wardIds.filter((w) => (s.wardProgress[w] ?? 0) >= s.wardGoal).length;
  const onWard = s.board.wardIds.includes(current.nodeId) && (s.wardProgress[current.nodeId] ?? 0) < s.wardGoal;
  const onHeart = current.nodeId === s.board.heartId;
  const inGloom = (s.nodeState[current.nodeId] ?? "lit") !== "lit";
  const canMove = s.rolled && !s.search;
  const canAct = s.rolled && !s.acted && !s.search;
  const canKindle = canAct && onWard && (current.light > 0 || s.lantern > 0);
  const canRitual = canAct && s.heartOpen && onHeart;
  const canBurn = canAct && s.lantern >= cr.burnCost;

  // Cartographer foresight — preview next round's Gloom spread (same pure fn the store uses)
  const foresightOn = s.players.some((p) => p.alive && !p.escaped && roleDef(p.role).foresight);
  let foresight: string[] = [];
  if (foresightOn) {
    const scen = scenarioById(s.scenarioId);
    const spread = gloomSpreadCount(s.round + 1, s.dread, s.gloomSurge);
    const res = gloomSpread(s.board, s.nodeState, spread, !!scen?.longNight);
    foresight = [...res.toFlooded, ...res.toTainted];
  }

  // contextual situational awareness
  const wardInReach = s.board.wardIds.some((w) => (current ? neighbors(s.board, current.nodeId).includes(w) || current.nodeId === w : false) && (s.wardProgress[w] ?? 0) < s.wardGoal);
  const adjacentDanger = current ? neighbors(s.board, current.nodeId).some((m) => (s.nodeState[m] ?? "lit") !== "lit") : false;
  let hollowMin = 99;
  s.players.filter((p) => p.alive && !p.escaped).forEach((p) => s.hollows.forEach((h) => { const d = shortestPath(s.board, h.nodeId, p.nodeId).length - 1; if (d >= 0 && d < hollowMin) hollowMin = d; }));

  // GUIDED coach — the board walks you through the first turns, in-voice, gated to the legal action.
  const coaching = guided && s.turnCount < s.players.length * 2;
  let coach: string | null = null;
  if (coaching) {
    if (!s.rolled) coach = "Begin, child. Roll the worn die — those are your steps through my dark.";
    else if (canRitual) coach = "The Heart is open. Speak the Ritual here. Finish it, and you walk out of me.";
    else if (canKindle) coach = "You stand on a Ward. Kindle it — pour your Light in. Three Wards lit, and the Heart opens. Together, now.";
    else if (canMove && s.movesLeft > 0 && !s.acted) coach = "Move toward the light. Tap a glowing tile. Keep to the lit ground — the violet bites.";
    else if (canAct) coach = "Now search this place for Light. Press your luck if you're brave… but greed wakes me.";
    else if (s.acted) coach = "Good. End your turn — and let me take mine.";
  }

  // first-time / just-in-time teaching (once each)
  const hints: { id: string; on: boolean; text: string }[] = [
    { id: `role-${current.role}`, on: s.rolled && !s.acted, text: cr.hint },
    { id: "tainted", on: adjacentDanger, text: "That violet tile is Tainted — the Gloom is creeping in. It costs more to enter, and black (Flooded) tiles drink your Light. Burn it back, or go around." },
    { id: "hunt", on: hollowMin <= 2, text: "A Hollow is close. The red trail is exactly where it steps next round. Reach it and you're Wounded and Marked — don't be standing in its path." },
    { id: "ward", on: wardInReach, text: "A Ward is within reach. Stand on it and Kindle it with Light. Three true Wards lit opens the Heart." },
    { id: "search", on: s.rolled && !s.acted && !onWard && !canRitual, text: "Search a tile to dig for Light. Press your luck for more — but a second Omen in one Search collapses the tile and spawns a Hollow." },
    { id: "ritual", on: canRitual, text: "The Heart is open. Speak the Ritual here — finish every step before Dread hits 100." },
  ];
  const hint = !coach ? hints.find((h) => h.on && !seen[h.id]) : undefined;

  return (
    <div className="flex min-h-[100svh] flex-col lg:h-[100svh] lg:overflow-hidden">
      <StatusBar
        dread={s.dread}
        litWards={litWards}
        totalWards={s.board.wardIds.length}
        heartOpen={s.heartOpen}
        ritualProgress={s.ritualProgress}
        ritualGoal={s.ritualGoal}
        round={s.round}
        scenarioName={s.scenarioName}
        scenarioRule={s.scenarioRule}
        dreadFrozen={s.dreadFrozen}
        finite={s.finite}
        escapeSlots={s.escapeSlots}
        players={s.players.length}
      />

      <div className="grid flex-1 gap-3 p-3 lg:min-h-0 lg:grid-cols-[1fr_22rem]">
        <div className="flex min-h-0 flex-col gap-3">
          <div className="relative flex-1 overflow-hidden rounded-2xl border border-rot/40 bg-void/40" style={{ minHeight: "46vh" }}>
            <div className="pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full border border-rot/50 bg-deep/85 px-4 py-1.5 backdrop-blur-sm">
              <span className="font-mono text-xs tracking-wide">
                <span style={{ color: current.color }}>{cr.sigil} {current.name}</span>
                <span className="text-ash"> · {cr.name.replace("The ", "")} · {!s.rolled ? "roll to begin" : canMove && s.movesLeft > 0 ? `${s.movesLeft} move left` : s.acted ? "end your turn" : "take an action"}</span>
              </span>
            </div>

            <Board
              board={s.board}
              players={s.players}
              current={current}
              nodeState={s.nodeState}
              wardProgress={s.wardProgress}
              wardGoal={s.wardGoal}
              litWards={litWards}
              hollows={s.hollows}
              movesLeft={s.movesLeft}
              canMove={canMove}
              canBurn={canBurn}
              accent={boardAccent}
              heartOpen={s.heartOpen}
              foresight={foresight}
              mimicRevealed={s.mimicRevealed ? s.mimicWardId : null}
              onMove={s.moveTo}
              onBurn={s.burnBack}
            />

            <AnimatePresence mode="wait">
              {coach ? (
                <motion.div key={coach} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute bottom-3 left-1/2 z-10 w-[min(94%,32rem)] -translate-x-1/2 rounded-xl border-2 border-ember/70 bg-deep/95 px-5 py-3.5 shadow-ember-lg backdrop-blur">
                  <p className="mb-0.5 font-mono text-[0.55rem] uppercase tracking-[0.3em] text-ember">the board guides you</p>
                  <p className="font-body text-[0.95rem] italic leading-snug text-bone">{coach}</p>
                </motion.div>
              ) : hint ? (
                <motion.div key={hint.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute bottom-3 left-1/2 z-10 w-[min(92%,30rem)] -translate-x-1/2 rounded-xl border border-ember/60 bg-deep/95 px-4 py-3 shadow-ember backdrop-blur">
                  <p className="font-body text-sm leading-snug text-bone">{hint.text}</p>
                  <button onClick={() => see(hint.id)} className="mt-2 font-mono text-[0.65rem] uppercase tracking-widest text-ember transition hover:text-ember-bright">got it ✓</button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <NarratorBar line={s.narratorLine} dread={s.dread} />
        </div>

        {/* sidebar */}
        <aside className="flex min-h-0 flex-col gap-3 lg:overflow-y-auto">
          <div className="space-y-2">
            {s.players.map((p) => {
              const pr = roleDef(p.role);
              const isCurrent = p.id === current.id;
              const onG = (s.nodeState[p.nodeId] ?? "lit") !== "lit" && p.alive && !p.escaped;
              return (
                <div key={p.id} className={`rounded-xl border px-3 py-2 transition ${isCurrent ? "border-ember bg-surface/60 shadow-ember" : "border-rot/40 bg-deep/50"} ${!p.alive || p.escaped ? "opacity-50" : ""}`}>
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-xs" style={{ background: `${p.color}22`, color: p.color, border: `1px solid ${p.color}` }}>{pr.sigil}</span>
                    <span className="min-w-0 flex-1 truncate font-body text-bone">
                      {p.name}
                      <span className="ml-1.5 font-mono text-[0.55rem] uppercase tracking-wide text-ash">{pr.name.replace("The ", "")}</span>
                      {p.traitor && <span className="ml-1.5 font-mono text-[0.6rem] text-blood">betrayer</span>}
                      {!p.alive && <span className="ml-1.5 font-mono text-[0.6rem] text-ash">claimed</span>}
                      {p.escaped && p.alive && <span className="ml-1.5 font-mono text-[0.6rem] text-ember">escaped</span>}
                    </span>
                    <span className="font-mono text-sm text-ember-bright" title="personal Light">☀ {p.light}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 pl-[1.85rem]">
                    <span className="flex gap-1" title={`Wounds — ${pr.woundsMax} and you're Claimed`}>
                      {Array.from({ length: pr.woundsMax }).map((_, i) => (
                        <span key={i} className="h-1.5 w-3.5 rounded-full" style={{ background: i < p.wounds ? "#C2412D" : "#241738" }} />
                      ))}
                    </span>
                    {p.marked && p.alive && <span className="font-mono text-[0.6rem] text-blood">marked</span>}
                    {onG && <span className="font-mono text-[0.6rem] text-blood">in the Gloom</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* controls */}
          <div className="mt-auto space-y-2 rounded-xl border border-rot/40 bg-deep/60 p-3">
            <div className="flex items-center justify-between font-mono text-[0.65rem] uppercase tracking-widest text-ash">
              <span>🔥 Lantern {s.lantern}</span>
              {s.rolled && <span>🎲 {s.lastRoll}</span>}
            </div>

            {!s.rolled ? (
              <button onClick={s.rollMove} className="btn-primary w-full">Roll the worn die</button>
            ) : (
              <>
                {canKindle && <button onClick={s.kindleWard} className="btn-ritual w-full">Kindle the Ward (1 Light)</button>}
                {canRitual && <button onClick={s.ritualStep} className="btn-ritual w-full">Speak the Ritual ({s.ritualProgress}/{s.ritualGoal})</button>}
                {canAct && <button onClick={s.startSearch} className="btn-primary w-full">Search this place</button>}
                {s.acted && <p className="text-center font-body text-xs italic text-ash/70">Action taken. End your turn.</p>}
                <div className="flex gap-2">
                  <button onClick={s.shareToLantern} disabled={current.light <= 0} className="btn-ghost flex-1">Feed Lantern</button>
                  <button onClick={s.takeFromLantern} disabled={s.lantern <= 0} className="btn-ghost flex-1">Take Light</button>
                </div>
                <button onClick={s.endTurn} className="btn-secondary w-full">End {current.name}&rsquo;s turn</button>
              </>
            )}

            <p className="pt-1 text-center font-body text-[0.72rem] italic leading-snug text-ash/70">
              {inGloom
                ? "You stand in the Gloom — move to lit ground before it drains you."
                : canBurn
                  ? `Click a violet tile beside you to burn the Gloom back (${cr.burnCost} Lantern).`
                  : !s.heartOpen
                    ? `Light the Wards (${litWards} lit) to open the Heart.`
                    : "The Heart is open — get to the center and finish the Ritual."}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
