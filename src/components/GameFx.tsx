import { useEffect, useRef } from "react";
import { useGame } from "@/store/game";
import { useFx } from "@/store/fx";
import { shortestPath } from "@/game/board";
import { sfx, setDread, startAudio } from "@/audio/sound";

// Watches the game state and turns transitions into sound + screenshake + particles.
// Keeps all the "juice" out of the pure logic store.
export default function GameFx() {
  const s = useGame();
  const fx = useFx;
  const prevCollapsed = useRef(false);
  const prev = useRef({
    phase: s.phase,
    lightTotal: 0,
    litWards: 0,
    woundsTotal: 0,
    ritualProgress: 0,
    floodedCount: 0,
    omens: 0,
    searchLen: 0,
    hollowMin: 99,
    inited: false,
  });

  const nodeXY = (id: string) => {
    const n = s.board.nodes.find((x) => x.id === id);
    return n ? { x: n.x, y: n.y } : { x: 500, y: 360 };
  };

  useEffect(() => {
    setDread(s.dread);
  }, [s.dread]);

  useEffect(() => {
    const p = prev.current;
    const lightTotal = s.players.reduce((a, x) => a + x.light, 0);
    const litWards = s.board.wardIds.filter((w) => (s.wardProgress[w] ?? 0) >= s.wardGoal).length;
    const woundsTotal = s.players.reduce((a, x) => a + x.wounds, 0);
    const floodedCount = s.board.nodes.filter((n) => s.nodeState[n.id] === "flooded").length;
    const searchLen = s.search?.draws.length ?? 0;
    const lastTok = s.search?.lastToken;
    const cur = s.players[s.turnIndex];
    const curXY = cur ? nodeXY(cur.nodeId) : { x: 500, y: 360 };

    // nearest Hollow proximity (for the approach stinger)
    const targets = s.players.filter((x) => x.alive && !x.escaped);
    let hollowMin = 99;
    s.hollows.forEach((h) => targets.forEach((t) => { const d = shortestPath(s.board, h.nodeId, t.nodeId).length - 1; if (d >= 0 && d < hollowMin) hollowMin = d; }));

    if (!p.inited) {
      Object.assign(p, { phase: s.phase, lightTotal, litWards, woundsTotal, ritualProgress: s.ritualProgress, floodedCount, omens: s.omens, searchLen, hollowMin, inited: true });
      return;
    }

    // a Search draw landed
    if (searchLen > p.searchLen && lastTok) {
      if (lastTok.kind === "omen") { sfx.omen(); fx.getState().flash("#C2412D", 0.18); }
      else if (lastTok.kind === "relic") { sfx.relic(); fx.getState().burst(curXY.x, curXY.y, "light", "#8BE0B0", 12); }
      else { sfx.light(); fx.getState().burst(curXY.x, curXY.y, "light", "#FFD27A", 10); }
    }

    // collapse (search ended with collapsed)
    if (s.search?.collapsed && !prevCollapsed.current) {
      prevCollapsed.current = true;
      sfx.collapse();
      fx.getState().shake(0.55);
      fx.getState().burst(curXY.x, curXY.y, "mote", "#C2412D", 16);
    }
    if (!s.search) prevCollapsed.current = false;

    // a Ward lit
    if (litWards > p.litWards) {
      sfx.ward();
      fx.getState().punch(1.03);
      fx.getState().burst(curXY.x, curXY.y, "ward", "#FFD27A", 22);
    }

    // someone wounded
    if (woundsTotal > p.woundsTotal) {
      sfx.hollow(0.9);
      fx.getState().shake(0.5);
      s.players.forEach((pl) => { if (pl.wounds > 0 && pl.marked) { const xy = nodeXY(pl.nodeId); fx.getState().burst(xy.x, xy.y, "mote", "#C2412D", 8); } });
    }

    // a ritual step
    if (s.ritualProgress > p.ritualProgress) {
      sfx.ritual();
      fx.getState().punch(1.03);
      fx.getState().burst(nodeXY(s.board.heartId).x, nodeXY(s.board.heartId).y, "ward", "#FFD27A", 18);
    }

    // the Gloom advanced (round end)
    if (floodedCount > p.floodedCount) {
      fx.getState().flash("#3B2A57", 0.22);
      fx.getState().shake(0.3);
      s.board.nodes.filter((n) => s.nodeState[n.id] === "flooded").slice(0, 6).forEach((n) => fx.getState().burst(n.x, n.y, "mote", "#6b4ea0", 5));
    }

    // Hollow drawing near
    if (hollowMin < p.hollowMin && hollowMin <= 2 && hollowMin >= 0) sfx.hollow(1 - hollowMin / 3);

    // phase transitions
    if (s.phase !== p.phase) {
      if (s.phase === "HAUNT") { sfx.haunt(); fx.getState().shake(0.9); fx.getState().flash("#7a5cff", 0.4); }
      if (s.phase === "END") {
        if (s.result === "win") sfx.win();
        else { sfx.lose(); fx.getState().flash("#000", 0.5); }
      }
      if (s.phase === "PLAY" && p.phase === "INTRO") startAudio();
    }

    Object.assign(p, { phase: s.phase, lightTotal, litWards, woundsTotal, ritualProgress: s.ritualProgress, floodedCount, omens: s.omens, searchLen, hollowMin });
  });

  return null;
}
