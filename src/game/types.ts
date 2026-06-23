export type Phase = "LOBBY" | "PLAY" | "HAUNT" | "CLIMAX" | "END";

export type NodeKind = "heart" | "lantern" | "cache" | "hazard" | "plain";

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
  spawnIds: string[];
}

export interface Player {
  id: string;
  name: string;
  color: string;
  nodeId: string;
  light: number; // personal Light
  alive: boolean;
  escaped: boolean;
  traitor: boolean; // accepted the Whisper
}

export type CardKind = "cache" | "hazard" | "omen" | "boon" | "manifest";

export interface Card {
  id: string;
  title: string;
  kind: CardKind;
  text: string;
  light?: number; // change to personal Light (+gain / -loss)
  lantern?: number; // change to shared Lantern pool
  dread?: number; // change to Dread
  omen?: number; // omens added
  manifest?: string; // a creature/disaster name that marks this node
}

export interface Scenario {
  id: string;
  name: string;
  subtitle: string;
  reveal: string; // narrator line on the Haunt reveal
  ritualGoal: number; // steps needed at the Heart
  escapeCapacity: (players: number) => number; // how many can get out
  dreadSpike: number; // Dread jolt when the Haunt fires
  gloomSurge: number; // extra Gloom nodes flooded per advance afterward
  accent: string; // color the world shifts toward
}

export type DreadTier = "calm" | "ominous" | "menacing" | "devouring";

export interface NarratorEvent {
  text: string;
  tier: DreadTier;
  kind: "ambient" | "move" | "cache" | "hazard" | "omen" | "gloom" | "haunt" | "ritual" | "whisper" | "end";
}

export interface LogEntry {
  turn: number;
  round: number;
  text: string;
  tier: DreadTier;
}
