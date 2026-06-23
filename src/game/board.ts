import type { Board, BoardNode, NodeKind } from "./types";

// A hand-tuned concentric layout. The Heart sits at the center of a vortex;
// the Gloom spirals inward from the outer lantern-ring. Fixed = handsome & debuggable.
const CX = 500;
const CY = 360;

interface RingSpec {
  count: number;
  radius: number;
  ring: number;
  rot: number; // rotation offset (radians)
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

  // ring layout
  const byRing: Record<number, BoardNode[]> = {};
  RINGS.forEach((spec) => {
    const list: BoardNode[] = [];
    for (let i = 0; i < spec.count; i++) {
      const a = spec.rot + (i / spec.count) * Math.PI * 2;
      const id = `r${spec.ring}n${i}`;
      // gentle organic jitter so it doesn't read as a perfect machine circle
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

  // assign kinds: outer ring = lanterns (spawns), then sprinkle caches/hazards
  const spawnIds: string[] = [];
  byRing[3].forEach((n, i) => {
    if (i % 2 === 0) {
      n.kind = "lantern";
      n.label = "Lantern";
      spawnIds.push(n.id);
    }
  });
  // guarantee at least 4 spawns
  byRing[3].forEach((n) => {
    if (spawnIds.length < 4 && n.kind !== "lantern") {
      n.kind = "lantern";
      n.label = "Lantern";
      spawnIds.push(n.id);
    }
  });
  // caches in ring 2, hazards mixed
  byRing[2].forEach((n, i) => {
    if (i % 3 === 0) n.kind = "cache";
    else if (i % 3 === 1) n.kind = "hazard";
  });
  byRing[1].forEach((n, i) => {
    n.kind = i % 2 === 0 ? "cache" : "plain";
  });

  // edges: heart -> inner ring
  byRing[1].forEach((n) => addEdge("heart", n.id));
  // ring adjacency (polygon loops) for each ring
  [1, 2, 3].forEach((r) => {
    const list = byRing[r];
    list.forEach((n, i) => addEdge(n.id, list[(i + 1) % list.length].id));
  });
  // radial connections by angle proximity
  byRing[1].forEach((n) => nearestByAngle(n, byRing[2], 2).forEach((m) => addEdge(n.id, m.id)));
  byRing[2].forEach((n) => nearestByAngle(n, byRing[3], 1).forEach((m) => addEdge(n.id, m.id)));
  // a couple of extra ring2->ring3 spokes so the outer ring isn't a bottleneck
  byRing[3].forEach((n) => nearestByAngle(n, byRing[2], 2).forEach((m) => addEdge(n.id, m.id)));

  return { nodes, edges, heartId: "heart", spawnIds };
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
