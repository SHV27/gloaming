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

import type { RoleId } from "./roles";

export interface Player {
  id: string;
  name: string;
  role: RoleId;
  color: string;
  nodeId: string;
  light: number; // personal Light
  wounds: number; // role.woundsMax = claimed
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

// Haunt scenarios — each rewrites the stakes with real mechanics.
export interface Scenario {
  id: string;
  name: string;
  subtitle: string;
  reveal: string;
  rule: string; // one-line plain-language rule shown on the reveal & status
  accent: string;
  dreadSpike: number;
  gloomSurge: number;
  // mechanic flags (all optional; read at runtime, never persisted)
  hollowDouble?: boolean; // Collector: double the Hunt on reveal
  hollowSteal?: boolean; // Collector: Hollows steal Light on contact
  gloomDouble?: boolean; // Flood: Gloom advances twice per round
  wardDecay?: boolean; // Flood: unguarded Wards decay each round
  mimicWard?: boolean; // Mimic: one Ward is false
  longNight?: boolean; // Long Night: Dread frozen, whole board Tainted
  lanternLeak?: number; // Famine: Lantern loses N each round
  finite?: boolean; // The Gate is Narrow: limited escapes
}

export type DreadTier = "calm" | "ominous" | "menacing" | "devouring";

export interface LogEntry {
  round: number;
  text: string;
  tier: DreadTier;
}
