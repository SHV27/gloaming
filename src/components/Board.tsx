import { AnimatePresence, motion } from "framer-motion";
import type { Board as BoardT, Hollow, NodeState, Player } from "@/game/types";
import { neighbors, shortestPath } from "@/game/board";

interface Props {
  board: BoardT;
  players: Player[];
  current: Player | undefined;
  nodeState: Record<string, NodeState>;
  wardProgress: Record<string, number>;
  wardGoal: number;
  litWards: number;
  hollows: Hollow[];
  movesLeft: number;
  canMove: boolean;
  canBurn: boolean;
  accent: string | null;
  onMove: (id: string) => void;
  onBurn: (id: string) => void;
}

function moveCost(state: NodeState): number {
  return state === "flooded" ? 3 : state === "tainted" ? 2 : 1;
}

export default function Board({
  board,
  players,
  current,
  nodeState,
  wardProgress,
  wardGoal,
  litWards,
  hollows,
  movesLeft,
  canMove,
  canBurn,
  accent,
  onMove,
  onBurn,
}: Props) {
  const reach = current ? new Set(neighbors(board, current.nodeId)) : new Set<string>();
  const playersOn = (id: string) => players.filter((p) => p.nodeId === id && p.alive && !p.escaped);
  const heartBright = 0.5 + (litWards / Math.max(1, board.wardIds.length)) * 0.5;
  const targets = players.filter((p) => p.alive && !p.escaped);

  // telegraph each Hollow's next step toward the nearest living player
  const hunts = hollows.map((h) => {
    const marked = targets.filter((t) => t.marked);
    const pool = marked.length ? marked : targets;
    let best: string[] = [];
    for (const t of pool) {
      const path = shortestPath(board, h.nodeId, t.nodeId);
      if (path.length > 1 && (best.length === 0 || path.length < best.length)) best = path;
    }
    return { h, path: best };
  });

  return (
    <svg viewBox="0 0 1000 720" className="h-full w-full select-none" role="img" aria-label="The Gloaming board">
      <defs>
        <radialGradient id="heartGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD27A" stopOpacity={heartBright} />
          <stop offset="50%" stopColor="#F5A623" stopOpacity={heartBright * 0.3} />
          <stop offset="100%" stopColor="#F5A623" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="floodGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent ?? "#4a2f6e"} stopOpacity="0.95" />
          <stop offset="70%" stopColor="#1a0e2b" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#0A0710" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="taintGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent ?? "#3B2A57"} stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0A0710" stopOpacity="0" />
        </radialGradient>
        <filter id="tide" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.014" numOctaves={3} seed={11} result="n">
            <animate attributeName="baseFrequency" dur="18s" values="0.008 0.014;0.016 0.01;0.008 0.014" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="n" scale={34} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="soft"><feGaussianBlur stdDeviation="5" /></filter>
        <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* edges */}
      <g strokeWidth={2.2}>
        {board.edges.map(([a, b]) => {
          const na = board.nodes.find((n) => n.id === a)!;
          const nb = board.nodes.find((n) => n.id === b)!;
          const dark = nodeState[a] !== "lit" && nodeState[b] !== "lit";
          return <line key={`${a}-${b}`} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke={dark ? "#2a1c44" : "#241738"} strokeOpacity={dark ? 0.6 : 0.85} />;
        })}
      </g>

      {/* THE GLOOM — living tide (signature element) */}
      <g filter="url(#tide)">
        <AnimatePresence>
          {board.nodes
            .filter((n) => nodeState[n.id] !== "lit")
            .map((n) => {
              const flooded = nodeState[n.id] === "flooded";
              return (
                <motion.circle
                  key={`gloom-${n.id}`}
                  cx={n.x}
                  cy={n.y}
                  fill={flooded ? "url(#floodGrad)" : "url(#taintGrad)"}
                  initial={{ r: 0, opacity: 0 }}
                  animate={{ r: flooded ? 72 : 56, opacity: flooded ? 1 : 0.7 }}
                  exit={{ r: 0, opacity: 0 }}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                />
              );
            })}
        </AnimatePresence>
      </g>

      {/* tendrils reaching from the flood toward the living */}
      <g stroke={accent ?? "#6b4ea0"} strokeWidth={1.4} fill="none" opacity={0.35}>
        {board.nodes
          .filter((n) => nodeState[n.id] === "flooded")
          .slice(0, 5)
          .map((n) => {
            let near: Player | undefined;
            let nd = Infinity;
            targets.forEach((t) => {
              const tn = board.nodes.find((x) => x.id === t.nodeId)!;
              const d = Math.hypot(tn.x - n.x, tn.y - n.y);
              if (d < nd) {
                nd = d;
                near = t;
              }
            });
            if (!near || nd > 260) return null;
            const tn = board.nodes.find((x) => x.id === near!.nodeId)!;
            const mx = (n.x + tn.x) / 2 + (n.y - tn.y) * 0.12;
            const my = (n.y + tn.y) / 2 + (tn.x - n.x) * 0.12;
            return (
              <path key={`tendril-${n.id}`} d={`M ${n.x} ${n.y} Q ${mx} ${my} ${tn.x} ${tn.y}`} strokeDasharray="4 10">
                <animate attributeName="stroke-dashoffset" from="0" to="-28" dur="2.4s" repeatCount="indefinite" />
              </path>
            );
          })}
      </g>

      {/* Hollow telegraph paths (you see death coming) */}
      {hunts.map(({ h, path }) =>
        path.length > 1 ? (
          <g key={`tel-${h.id}`}>
            <polyline
              points={path.map((id) => { const n = board.nodes.find((x) => x.id === id)!; return `${n.x},${n.y}`; }).join(" ")}
              fill="none"
              stroke="#C2412D"
              strokeWidth={2.5}
              strokeDasharray="2 7"
              opacity={0.7}
            >
              <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="0.9s" repeatCount="indefinite" />
            </polyline>
            {(() => { const n = board.nodes.find((x) => x.id === path[1])!; return (
              <circle cx={n.x} cy={n.y} r={20} fill="none" stroke="#C2412D" strokeWidth={2}>
                <animate attributeName="r" dur="1.1s" values="14;24;14" repeatCount="indefinite" />
                <animate attributeName="opacity" dur="1.1s" values="0.9;0.2;0.9" repeatCount="indefinite" />
              </circle>
            ); })()}
          </g>
        ) : null,
      )}

      {/* heart aura */}
      {(() => {
        const hh = board.nodes.find((n) => n.id === board.heartId)!;
        return (
          <motion.circle
            cx={hh.x}
            cy={hh.y}
            r={90}
            fill="url(#heartGlow)"
            animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.07, 1] }}
            transition={{ duration: Math.max(1.2, 4 - litWards), repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: `${hh.x}px ${hh.y}px` }}
          />
        );
      })()}

      {/* nodes */}
      {board.nodes.map((n) => {
        const st = nodeState[n.id] ?? "lit";
        const isReach = reach.has(n.id);
        const cost = moveCost(st);
        const movable = canMove && isReach && movesLeft >= cost;
        const burnable = canBurn && (isReach || n.id === current?.nodeId) && st !== "lit";
        const isHeart = n.kind === "heart";
        const isWard = n.kind === "ward";
        const wardLit = isWard && (wardProgress[n.id] ?? 0) >= wardGoal;
        const r = isHeart ? 27 : isWard ? 19 : n.kind === "cache" ? 15 : 12;
        const rim = st === "flooded" ? "#5a4a78" : st === "tainted" ? "#6b4ea0" : isHeart ? "#F5A623" : isWard ? (wardLit ? "#FFD27A" : "#8C7BB0") : n.kind === "cache" ? "#8BE0B0" : n.kind === "hazard" ? "#9a4a3a" : "#3B2A57";
        const occupants = playersOn(n.id);
        const interactive = movable || burnable;

        return (
          <g key={n.id} onClick={() => (movable ? onMove(n.id) : burnable ? onBurn(n.id) : undefined)} style={{ cursor: interactive ? "pointer" : "default" }}>
            {movable && (
              <motion.circle cx={n.x} cy={n.y} r={r + 11} fill="none" stroke="#FFD27A" strokeWidth={2} strokeDasharray="3 5"
                animate={{ opacity: [0.4, 1, 0.4], rotate: 360 }}
                transition={{ opacity: { duration: 1.6, repeat: Infinity }, rotate: { duration: 16, repeat: Infinity, ease: "linear" } }}
                style={{ transformOrigin: `${n.x}px ${n.y}px` }} />
            )}
            {burnable && <circle cx={n.x} cy={n.y} r={r + 11} fill="none" stroke="#8BE0B0" strokeWidth={2} strokeDasharray="2 4" />}

            <circle cx={n.x} cy={n.y} r={r} fill={st === "flooded" ? "#120820" : isHeart ? "#2a1a08" : "#140b1e"} stroke={rim} strokeWidth={isHeart || isWard ? 3 : 2} opacity={st === "flooded" ? 0.55 : 1} />

            {/* Heart core */}
            {isHeart && (
              <>
                <motion.circle cx={n.x} cy={n.y} r={12} fill="#F5A623" filter="url(#glow)"
                  animate={{ opacity: [heartBright * 0.6, heartBright, heartBright * 0.6] }} transition={{ duration: Math.max(1, 4 - litWards), repeat: Infinity }} />
                <text x={n.x} y={n.y - r - 8} textAnchor="middle" fontSize={11} fontFamily="'Space Mono'" fill={litWards >= board.wardIds.length ? "#FFD27A" : "#8C8398"}>
                  {litWards >= board.wardIds.length ? "OPEN" : "LOCKED"}
                </text>
              </>
            )}

            {/* Ward progress */}
            {isWard && (
              <>
                <circle cx={n.x} cy={n.y} r={r + 5} fill="none" stroke="#241738" strokeWidth={3} />
                <circle cx={n.x} cy={n.y} r={r + 5} fill="none" stroke={wardLit ? "#FFD27A" : "#F5A623"} strokeWidth={3} strokeLinecap="round"
                  strokeDasharray={`${(2 * Math.PI * (r + 5) * Math.min(1, (wardProgress[n.id] ?? 0) / wardGoal))} 999`}
                  transform={`rotate(-90 ${n.x} ${n.y})`} filter={wardLit ? "url(#glow)" : undefined} />
                <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize={11} fontFamily="'Space Mono'" fill={wardLit ? "#FFD27A" : "#EDE6D6"}>
                  {wardLit ? "✦" : `${wardProgress[n.id] ?? 0}/${wardGoal}`}
                </text>
                <text x={n.x} y={n.y + r + 16} textAnchor="middle" fontSize={9} fontFamily="'Space Mono'" fill="#8C8398">{n.label?.replace("The ", "")}</text>
              </>
            )}

            {!isHeart && !isWard && n.kind === "cache" && st === "lit" && <circle cx={n.x} cy={n.y} r={4} fill="#8BE0B0" opacity={0.85} />}
            {!isHeart && !isWard && n.kind === "hazard" && st === "lit" && <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize={12} fill="#9a4a3a" fontFamily="'Space Mono'">✕</text>}

            {/* player tokens */}
            {occupants.map((p, i) => {
              const off = occupants.length > 1 ? (i - (occupants.length - 1) / 2) * 16 : 0;
              return (
                <g key={p.id}>
                  <circle cx={n.x + off} cy={n.y - r - 12} r={9} fill={p.color} filter="url(#soft)" opacity={0.5} />
                  <motion.circle cx={n.x + off} cy={n.y - r - 12} r={7} fill={p.color} stroke="#0A0710" strokeWidth={2}
                    animate={p.marked ? { opacity: [1, 0.35, 1] } : { opacity: 1 }} transition={p.marked ? { duration: 0.7, repeat: Infinity } : {}} />
                  {current?.id === p.id && (
                    <circle cx={n.x + off} cy={n.y - r - 12} r={11} fill="none" stroke={p.color} strokeWidth={1.5}>
                      <animate attributeName="r" dur="1.4s" values="9;13;9" repeatCount="indefinite" />
                      <animate attributeName="opacity" dur="1.4s" values="1;0;1" repeatCount="indefinite" />
                    </circle>
                  )}
                  {p.marked && <text x={n.x + off} y={n.y - r - 22} textAnchor="middle" fontSize={9} fill="#C2412D" fontFamily="'Space Mono'">marked</text>}
                </g>
              );
            })}
          </g>
        );
      })}

      {/* Hollows — predators, drawn last so they sit on top */}
      {hollows.map((h) => {
        const n = board.nodes.find((x) => x.id === h.nodeId)!;
        return (
          <g key={h.id}>
            <motion.circle cx={n.x} cy={n.y} r={15} fill="#0A0710" stroke="#C2412D" strokeWidth={2} filter="url(#glow)"
              animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 1.3, repeat: Infinity }} style={{ transformOrigin: `${n.x}px ${n.y}px` }} />
            <circle cx={n.x - 4} cy={n.y - 2} r={2} fill="#C2412D" />
            <circle cx={n.x + 4} cy={n.y - 2} r={2} fill="#C2412D" />
            <path d={`M ${n.x - 5} ${n.y + 5} Q ${n.x} ${n.y + 2} ${n.x + 5} ${n.y + 5}`} stroke="#C2412D" strokeWidth={1.3} fill="none" />
          </g>
        );
      })}
    </svg>
  );
}
