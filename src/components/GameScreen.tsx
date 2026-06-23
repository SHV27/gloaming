import { useGame } from "@/store/game";
import Board from "./Board";
import NarratorBar from "./NarratorBar";
import StatusBar from "./StatusBar";

const CLEANSE_COST = 3;
const OMEN_THRESHOLD = 5;

export default function GameScreen() {
  const s = useGame();
  const current = s.players[s.turnIndex];
  const onHeart = current?.nodeId === s.board.heartId;
  const inGloom = current ? s.gloom.includes(current.nodeId) : false;
  const canMove = s.rolled && !s.resolved && s.movesLeft > 0 && !s.cardDraw;
  const canCleanse = s.lantern >= CLEANSE_COST && !s.cardDraw;
  const canRitual = s.hauntFired && onHeart && !s.cardDraw;
  const accent = s.accentColor;

  return (
    <div className="flex min-h-[100svh] flex-col lg:h-[100svh] lg:overflow-hidden">
      <StatusBar
        dread={s.dread}
        omens={s.omens}
        omenThreshold={OMEN_THRESHOLD}
        lantern={s.lantern}
        round={s.round}
        ritualProgress={s.ritualProgress}
        ritualGoal={s.ritualGoal}
        hauntFired={s.hauntFired}
        scenarioName={s.scenarioName}
      />

      <div className="grid flex-1 gap-3 p-3 lg:min-h-0 lg:grid-cols-[1fr_22rem]">
        {/* board + narrator */}
        <div className="flex min-h-0 flex-col gap-3">
          <div
            className="relative flex-1 overflow-hidden rounded-2xl border border-rot/40 bg-void/40"
            style={{ minHeight: "46vh" }}
          >
            {current && (
              <div className="pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full border border-rot/50 bg-deep/80 px-4 py-1.5 backdrop-blur-sm">
                <span className="font-mono text-xs tracking-wide">
                  <span style={{ color: current.color }}>{current.name}</span>
                  <span className="text-ash">
                    {" "}
                    &middot;{" "}
                    {!s.rolled
                      ? "roll to move"
                      : canMove
                        ? `${s.movesLeft} step${s.movesLeft > 1 ? "s" : ""} left`
                        : "search, then end turn"}
                  </span>
                </span>
              </div>
            )}
            <Board
              board={s.board}
              players={s.players}
              current={current}
              gloom={s.gloom}
              manifests={s.manifests}
              movesLeft={s.movesLeft}
              canMove={canMove}
              canCleanse={canCleanse}
              accent={accent}
              onMove={s.moveTo}
              onCleanse={s.cleanse}
            />
          </div>
          <NarratorBar line={s.narratorLine} dread={s.dread} />
        </div>

        {/* sidebar */}
        <aside className="flex min-h-0 flex-col gap-3 lg:overflow-y-auto">
          {/* players */}
          <div className="space-y-2">
            {s.players.map((p) => {
              const isCurrent = p.id === current?.id;
              const onGloom = s.gloom.includes(p.nodeId);
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2 transition ${
                    isCurrent ? "border-ember bg-surface/60 shadow-ember" : "border-rot/40 bg-deep/50"
                  } ${p.escaped ? "opacity-50" : ""}`}
                >
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: p.color }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-body text-bone">
                      {p.name}
                      {p.traitor && <span className="ml-1.5 font-mono text-[0.6rem] text-blood">betrayer</span>}
                      {p.escaped && !p.traitor && <span className="ml-1.5 font-mono text-[0.6rem] text-ash">out</span>}
                    </p>
                    {onGloom && !p.escaped && <p className="font-mono text-[0.6rem] text-blood">in the Gloom</p>}
                  </div>
                  <span className="font-mono text-sm text-ember-bright" title="personal Light">
                    ☀ {p.light}
                  </span>
                </div>
              );
            })}
          </div>

          {/* controls */}
          <div className="mt-auto space-y-2 rounded-xl border border-rot/40 bg-deep/60 p-3">
            {!s.rolled ? (
              <button onClick={s.rollMove} className="btn-primary w-full">
                Roll the worn die
              </button>
            ) : (
              <>
                {!s.resolved && (
                  <button onClick={s.searchNode} className="btn-primary w-full">
                    Search this place
                  </button>
                )}
                {canRitual && (
                  <button onClick={s.ritualStep} className="btn-ritual w-full">
                    Speak the ritual ({s.ritualProgress}/{s.ritualGoal})
                  </button>
                )}
                <div className="flex gap-2">
                  <button onClick={s.feedLantern} disabled={!current || current.light <= 0} className="btn-ghost flex-1">
                    Feed lantern
                  </button>
                  <button onClick={s.takeLight} disabled={s.lantern <= 0} className="btn-ghost flex-1">
                    Take light
                  </button>
                </div>
                {s.resolved && (
                  <button onClick={s.endTurn} className="btn-secondary w-full">
                    End {current?.name}&rsquo;s turn
                  </button>
                )}
              </>
            )}
            <p className="pt-1 text-center font-body text-[0.7rem] italic leading-snug text-ash/70">
              {inGloom
                ? "You stand in the Gloom. Move out, or it takes more of you."
                : canCleanse
                  ? "Click a glowing dark tile beside you to burn the Gloom back (3 lantern)."
                  : s.hauntFired && !onHeart
                    ? "Reach the Heart at the center to speak the ritual."
                    : "Move along the lit paths. Search where you land."}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
