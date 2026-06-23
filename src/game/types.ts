export type Phase = "LOBBY" | "INTRO" | "PLAY" | "HAUNT" | "CLIMAX" | "END";

export type NodeKind = "heart" | "ward" | "threshold" | "cache" | "hazard" | "plain";
export type NodeState = "lit" | "tainted" | "flooded";

export interface BoardNode {
  id: string;
  x: number;
  y: number;
  ring: number; // 0 = heart, higher = nearer the edge / Gloom
  kind: NodeKind;
  label?: string;
}

export interface Board {
  nodes: BoardNode[];
  edges: [string, string][];
  heartId: string;
  wardIds: string[];
  thresholdId: string; // where the survivors begin, together
  hollowSpawnId: string; // far edge
}

export interface Player {
  id: string;
  name: string;
  color: string;
  nodeId: string;
  light: number; // personal Light
  wounds: number; // 3 = claimed
  marked: boolean;
  alive: boolean; // false once Claimed
  escaped: boolean;
  traitor: boolean;
}

export interface Hollow {
  id: string;
  nodeId: string;
}

// Search tokens drawn from a node's pocket
export type TokenKind = "light" | "relic" | "omen";
export interface SearchToken {
  kind: TokenKind;
  title: string;
  text: string;
  light?: number;
  lantern?: number;
}

export interface SearchSession {
  nodeId: string;
  draws: SearchToken[];
  bankedLight: number;
  omensThisSearch: number;
  collapsed: boolean;
  lastToken: SearchToken | null;
}

// Haunt scenarios (kept from v1; full rewrites deferred to S3)
export interface Scenario {
  id: string;
  name: string;
  subtitle: string;
  reveal: string;
  dreadSpike: number;
  gloomSurge: number;
  accent: string;
}

export type DreadTier = "calm" | "ominous" | "menacing" | "devouring";

export interface LogEntry {
  round: number;
  text: string;
  tier: DreadTier;
}
