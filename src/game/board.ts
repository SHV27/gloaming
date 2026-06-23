import type { Board, BoardNode, NodeKind } from "./types";

// A hand-tuned concentric layout. The Heart sits at the center of a vortex;
// the Gloom spirals inward from the outer threshold-ring. Fixed = handsome & debuggable.
const CX = 500;
const CY = 360;

interface RingSpec {
  count: number;
  radius: number;
  ring: number;
  rot: number;
}

const RINGS: RingSpec[] = [
  { count: 5, radius: 132, ring: 1, rot: -Math.PI / 2 },
  { count: 8, radius: 232, ring: 2, rot: -Math.PI / 2 + Math.PI / 8 },
  { count: 7, radius: 332, ring: 3, rot: -Math.PI / 2 },
];

function nearestByAngle(node: BoardNode, candidates: BoardNode[], k: number): BoardNode[] {
  const ang = Math.atan2(node.y - CY, node.x - CX);
  return [...candidates]
    .map((c) => {
      let d = Math.abs(Math.atan2(c.y - CY, c.x - CX) - ang);
      if (d > Math.PI) d = 2 * Math.PI - d;
      return { c, d };
    })
    .sort((a, b) => a.d - b.d)
    .slice(0, k)
    .map((x) => x.c);
}

export function buildBoard(): Board {
  const nodes: BoardNode[] = [];
  const edges: [string, string][] = [];
  const seen = new Set<string>();
  const addEdge = (a: string, b: string) => {
    const key = a < b ? `${a}|${b}` : `${b}|${a}`;
    if (seen.has(key) || a === b) return;
    seen.add(key);
    edges.push([a, b]);
  };

  const heart: BoardNode = { id: "heart", x: CX, y: CY, ring: 0, kind: "heart", label: "The Heart" };
  nodes.push(heart);

  const byRing: Record<number, BoardNode[]> = {};
  RINGS.forEach((spec) => {
    const list: BoardNode[] = [];
    for (let i = 0; i < spec.count; i++) {
      const a = spec.rot + (i / spec.count) * Math.PI * 2;
      const id = `r${spec.ring}n${i}`;
      const jr = spec.radius + (i % 2 === 0 ? 10 : -8);
      const node: BoardNode = {
        id,
        x: Math.round(CX + Math.cos(a) * jr),
        y: Math.round(CY + Math.sin(a) * jr * 0.92),
        ring: spec.ring,
        kind: "plain" as NodeKind,
      };
      list.push(node);
      nodes.push(node);
    }
    byRing[spec.ring] = list;
  });

  // 3 Wards on the middle ring, spread ~120° apart (between edge and Heart)
  const wardIdx = [0, 3, 5];
  const wardIds: string[] = [];
  const wardNames = ["The Eastern Ward", "The Western Ward", "The Hollow Ward"];
  wardIdx.forEach((wi, k) => {
    const n = byRing[2][wi];
    n.kind = "ward";
    n.label = wardNames[k];
    wardIds.push(n.id);
  });
  // remaining ring-2 nodes: caches/hazards
  byRing[2].forEach((n) => {
    if (n.kind === "ward") return;
    n.kind = Math.random() < 0.5 ? "cache" : "hazard";
  });
  // inner ring: mixed pockets
  byRing[1].forEach((n, i) => {
    n.kind = i % 2 === 0 ? "cache" : "plain";
  });
  // outer ring: thresholds (the edge / where survivors begin & Gloom enters)
  byRing[3].forEach((n) => {
    n.kind = "threshold";
    n.label = "Threshold";
  });

  // edges
  byRing[1].forEach((n) => addEdge("heart", n.id));
  [1, 2, 3].forEach((r) => {
    const list = byRing[r];
    list.forEach((n, i) => addEdge(n.id, list[(i + 1) % list.length].id));
  });
  byRing[1].forEach((n) => nearestByAngle(n, byRing[2], 2).forEach((m) => addEdge(n.id, m.id)));
  byRing[2].forEach((n) => nearestByAngle(n, byRing[3], 1).forEach((m) => addEdge(n.id, m.id)));
  byRing[3].forEach((n) => nearestByAngle(n, byRing[2], 2).forEach((m) => addEdge(n.id, m.id)));

  // survivors begin together on one threshold; the Hollow spawns opposite them
  const thresholdId = byRing[3][0].id;
  const start = byRing[3][0];
  const hollowSpawn = [...byRing[3]].sort((a, b) => {
    const da = Math.hypot(a.x - start.x, a.y - start.y);
    const db = Math.hypot(b.x - start.x, b.y - start.y);
    return db - da;
  })[0];

  return { nodes, edges, heartId: "heart", wardIds, thresholdId, hollowSpawnId: hollowSpawn.id };
}

export function neighbors(board: Board, id: string): string[] {
  const out: string[] = [];
  board.edges.forEach(([a, b]) => {
    if (a === id) out.push(b);
    else if (b === id) out.push(a);
  });
  return out;
}

export function nodeById(board: Board, id: string): BoardNode {
  const n = board.nodes.find((x) => x.id === id);
  if (!n) throw new Error(`unknown node ${id}`);
  return n;
}

// BFS shortest path from -> to (inclusive). Returns [] if unreachable.
export function shortestPath(board: Board, from: string, to: string): string[] {
  if (from === to) return [from];
  const prev: Record<string, string | null> = { [from]: null };
  const q = [from];
  while (q.length) {
    const cur = q.shift()!;
    for (const nb of neighbors(board, cur)) {
      if (!(nb in prev)) {
        prev[nb] = cur;
        if (nb === to) {
          const path: string[] = [];
          let c: string | null = nb;
          while (c) {
            path.unshift(c);
            c = prev[c];
          }
          return path;
        }
        q.push(nb);
      }
    }
  }
  return [];
}
