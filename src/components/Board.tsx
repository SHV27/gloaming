import { AnimatePresence, motion } from "framer-motion";
import type { Board as BoardT, Player } from "@/game/types";
import { neighbors } from "@/game/board";

interface Props {
  board: BoardT;
  players: Player[];
  current: Player | undefined;
  gloom: string[];
  manifests: Record<string, string>;
  movesLeft: number;
  canMove: boolean;
  accent: string | null;
  onMove: (id: string) => void;
  onCleanse: (id: string) => void;
  canCleanse: boolean;
}

const KIND_RING: Record<string, string> = {
  heart: "#F5A623",
  lantern: "#FFD27A",
  cache: "#8BE0B0",
  hazard: "#C2412D",
  plain: "#3B2A57",
};

export default function Board({
  board,
  players,
  current,
  gloom,
  manifests,
  movesLeft,
  canMove,
  accent,
  onMove,
  onCleanse,
  canCleanse,
}: Props) {
  const flooded = new Set(gloom);
  const reach = current ? new Set(neighbors(board, current.nodeId)) : new Set<string>();

  const playersOn = (id: string) => players.filter((p) => p.nodeId === id && p.alive && !p.escaped);

  return (
    <svg viewBox="0 0 1000 720" className="h-full w-full select-none" role="img" aria-label="The Gloaming board">
      <defs>
        <radialGradient id="heartGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent ?? "#F5A623"} stopOpacity="0.9" />
          <stop offset="55%" stopColor="#F5A623" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#F5A623" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="rotGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent ?? "#3B2A57"} stopOpacity="0.95" />
          <stop offset="100%" stopColor="#0A0710" stopOpacity="0.7" />
        </radialGradient>
        <filter id="fog" x="-40%" y="-40%" width="180%" height="180%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves={2} seed={7} result="n">
            <animate attributeName="baseFrequency" dur="22s" values="0.012 0.02;0.02 0.012;0.012 0.02" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="n" scale={26} />
        </filter>
        <filter id="soft" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* edges */}
      <g stroke="#241738" strokeWidth={2.4}>
        {board.edges.map(([a, b]) => {
          const na = board.nodes.find((n) => n.id === a)!;
          const nb = board.nodes.find((n) => n.id === b)!;
          const dim = flooded.has(a) && flooded.has(b);
          return (
            <line
              key={`${a}-${b}`}
              x1={na.x}
              y1={na.y}
              x2={nb.x}
              y2={nb.y}
              stroke={dim ? "#3B2A57" : "#241738"}
              strokeOpacity={dim ? 0.5 : 0.9}
            />
          );
        })}
      </g>

      {/* the Gloom — the signature element */}
      <g filter="url(#fog)">
        <AnimatePresence>
          {board.nodes
            .filter((n) => flooded.has(n.id))
            .map((n) => (
              <motion.circle
                key={`gloom-${n.id}`}
                cx={n.x}
                cy={n.y}
                fill="url(#rotGrad)"
                initial={{ r: 0, opacity: 0 }}
                animate={{ r: 58, opacity: 0.92 }}
                exit={{ r: 0, opacity: 0 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
            ))}
        </AnimatePresence>
      </g>

      {/* heart aura */}
      {(() => {
        const h = board.nodes.find((n) => n.id === board.heartId)!;
        return (
          <motion.circle
            cx={h.x}
            cy={h.y}
            r={70}
            fill="url(#heartGlow)"
            animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.06, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: `${h.x}px ${h.y}px` }}
          />
        );
      })()}

      {/* nodes */}
      {board.nodes.map((n) => {
        const isFlooded = flooded.has(n.id);
        const isReach = reach.has(n.id);
        const movable = canMove && movesLeft > 0 && isReach && !isFlooded;
        const cleansable = canCleanse && isReach && isFlooded;
        const isHeart = n.kind === "heart";
        const r = isHeart ? 26 : n.kind === "lantern" || n.kind === "cache" ? 16 : 13;
        const ring = KIND_RING[n.kind];
        const occupants = playersOn(n.id);
        const interactive = movable || cleansable;
        return (
          <g
            key={n.id}
            onClick={() => (movable ? onMove(n.id) : cleansable ? onCleanse(n.id) : undefined)}
            style={{ cursor: interactive ? "pointer" : "default" }}
          >
            {/* reachable halo */}
            {movable && (
              <motion.circle
                cx={n.x}
                cy={n.y}
                r={r + 12}
                fill="none"
                stroke="#FFD27A"
                strokeWidth={2}
                strokeDasharray="3 5"
                animate={{ opacity: [0.4, 1, 0.4], rotate: 360 }}
                transition={{ opacity: { duration: 1.6, repeat: Infinity }, rotate: { duration: 14, repeat: Infinity, ease: "linear" } }}
                style={{ transformOrigin: `${n.x}px ${n.y}px` }}
              />
            )}
            {cleansable && (
              <circle cx={n.x} cy={n.y} r={r + 12} fill="none" stroke="#8BE0B0" strokeWidth={2} strokeDasharray="2 4" />
            )}

            <circle
              cx={n.x}
              cy={n.y}
              r={r}
              fill={isFlooded ? "#150a22" : isHeart ? "#2a1a08" : "#140b1e"}
              stroke={isFlooded ? "#5a4a78" : ring}
              strokeWidth={isHeart ? 3 : 2}
              opacity={isFlooded ? 0.5 : 1}
            />
            {isHeart && (
              <circle cx={n.x} cy={n.y} r={11} fill="#F5A623" opacity={isFlooded ? 0.3 : 0.95}>
                <animate attributeName="opacity" dur="3s" values="0.5;0.95;0.5" repeatCount="indefinite" />
              </circle>
            )}
            {n.kind === "lantern" && !isFlooded && <circle cx={n.x} cy={n.y} r={5} fill="#FFD27A" opacity={0.9} />}
            {n.kind === "cache" && !isFlooded && <circle cx={n.x} cy={n.y} r={4} fill="#8BE0B0" opacity={0.85} />}
            {n.kind === "hazard" && !isFlooded && (
              <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize={13} fill="#C2412D" fontFamily="Space Mono">
                ✕
              </text>
            )}

            {/* manifestation marker */}
            {manifests[n.id] && (
              <g>
                <circle cx={n.x} cy={n.y} r={r + 6} fill="none" stroke="#C2412D" strokeWidth={1.5} opacity={0.7} />
                <text x={n.x} y={n.y - r - 9} textAnchor="middle" fontSize={10} fill="#C2412D" fontFamily="'Space Mono'">
                  {manifests[n.id]}
                </text>
              </g>
            )}

            {/* player tokens */}
            {occupants.map((p, i) => {
              const off = occupants.length > 1 ? (i - (occupants.length - 1) / 2) * 15 : 0;
              return (
                <g key={p.id}>
                  <circle cx={n.x + off} cy={n.y - r - 10} r={8} fill={p.color} stroke="#0A0710" strokeWidth={2} filter="url(#soft)" opacity={0.6} />
                  <circle cx={n.x + off} cy={n.y - r - 10} r={7} fill={p.color} stroke="#0A0710" strokeWidth={2} />
                  {current?.id === p.id && (
                    <circle cx={n.x + off} cy={n.y - r - 10} r={11} fill="none" stroke={p.color} strokeWidth={1.5}>
                      <animate attributeName="r" dur="1.4s" values="9;13;9" repeatCount="indefinite" />
                      <animate attributeName="opacity" dur="1.4s" values="1;0;1" repeatCount="indefinite" />
                    </circle>
                  )}
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
