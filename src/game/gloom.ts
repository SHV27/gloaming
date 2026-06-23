import type { Board, NodeState } from "./types";
import { neighbors } from "./board";

export function gloomSpreadCount(round: number, dread: number, gloomSurge: number): number {
  return 1 + gloomSurge + Math.floor(round / 4) + (dread >= 55 ? 1 : 0) + (dread >= 82 ? 1 : 0);
}

export interface SpreadResult {
  next: Record<string, NodeState>;
  toFlooded: string[];
  toTainted: string[];
}

// Pure, deterministic Gloom advance. Used by the store to advance, and by the
// Cartographer's foresight to PREVIEW the same result. No randomness.
// longNight: the whole board is already Tainted; the Gloom only floods at the
// frontier of existing flood (a survivable slog) and never creates new Tainted.
export function gloomSpread(board: Board, nodeState: Record<string, NodeState>, spread: number, longNight: boolean): SpreadResult {
  const next: Record<string, NodeState> = { ...nodeState };
  const toFlooded: string[] = [];
  const toTainted: string[] = [];

  if (longNight) {
    // the whole board is already Tainted; the flood creeps inward from its frontier,
    // consuming any non-flooded neighbour (incl. the Heart, so the lose path exists).
    const frontier = board.nodes
      .filter((n) => next[n.id] !== "flooded" && neighbors(board, n.id).some((m) => next[m] === "flooded"))
      .sort((a, b) => b.ring - a.ring); // outer-first: a creeping tide, the Heart falls last
    frontier.slice(0, spread).forEach((n) => {
      next[n.id] = "flooded";
      toFlooded.push(n.id);
    });
    return { next, toFlooded, toTainted };
  }

  // tainted → flooded, closest to the Heart first (it marches inward)
  const tainted = board.nodes.filter((n) => next[n.id] === "tainted").sort((a, b) => a.ring - b.ring);
  tainted.slice(0, spread).forEach((n) => {
    next[n.id] = "flooded";
    toFlooded.push(n.id);
  });
  // lit adjacent to any Gloom → tainted, outer ring first
  const frontier = board.nodes
    .filter((n) => next[n.id] === "lit" && neighbors(board, n.id).some((m) => next[m] !== "lit"))
    .sort((a, b) => b.ring - a.ring);
  frontier.slice(0, spread).forEach((n) => {
    next[n.id] = "tainted";
    toTainted.push(n.id);
  });

  return { next, toFlooded, toTainted };
}
