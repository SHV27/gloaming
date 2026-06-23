import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Board, Card, LogEntry, Phase, Player } from "@/game/types";
import { buildBoard, neighbors } from "@/game/board";
import { CACHE_CARDS, HAZARD_CARDS, OMEN_CARDS, pick } from "@/game/decks";
import { SCENARIOS, drawScenario } from "@/game/scenarios";
import { dreadTier, narrate } from "@/game/narrator";

const PLAYER_COLORS = ["#F5A623", "#7AB8FF", "#8BE0B0", "#E083C0"];
const OMEN_THRESHOLD = 5;
const RITUAL_COST = 2;
const CLEANSE_COST = 3;
const START_LANTERN = 7;
const START_LIGHT = 2;
const STORE_VERSION = 1;

interface GameState {
  version: number;
  phase: Phase;
  board: Board;
  players: Player[];
  turnIndex: number;
  round: number;
  turnCount: number;

  // turn sub-state
  movesLeft: number;
  rolled: boolean;
  resolved: boolean;
  lastRoll: number | null;
  cardDraw: Card | null;

  // resources & pressure
  lantern: number;
  dread: number;
  omens: number;

  // gloom
  gloom: string[];
  manifests: Record<string, string>;

  // haunt (stored as primitives so persistence stays clean)
  hauntFired: boolean;
  scenarioId: string | null;
  scenarioName: string | null;
  scenarioSubtitle: string | null;
  scenarioReveal: string | null;
  accentColor: string | null;
  gloomSurge: number;
  ritualGoal: number;
  ritualProgress: number;
  escapeSlots: number;

  // whisper
  whisperMode: boolean;
  whisperPlayerId: string | null;
  whisperOffered: boolean;

  // narration
  narratorLine: string;
  log: LogEntry[];

  result: "win" | "lose" | null;

  // actions
  newGame: (names: string[], whisperMode: boolean) => void;
  rollMove: () => void;
  moveTo: (nodeId: string) => void;
  searchNode: () => void;
  dismissCard: () => void;
  cleanse: (nodeId: string) => void;
  feedLantern: () => void;
  takeLight: () => void;
  ritualStep: () => void;
  endTurn: () => void;
  dismissHaunt: () => void;
  resolveWhisper: (accept: boolean) => void;
  reset: () => void;

  // internals
  _fireHaunt: () => void;
  _advanceGloom: () => void;
  _checkEnd: () => void;
  _win: () => void;
  _lose: () => void;
  _endGame: () => void;
}

function freshBoard(): Board {
  return buildBoard();
}

function logLine(s: GameState, text: string): LogEntry[] {
  const entry: LogEntry = { turn: s.turnCount, round: s.round, text, tier: dreadTier(s.dread) };
  return [...s.log.slice(-40), entry];
}

const initialNarration =
  "You wake where the light ends. The board knows you are here. It always knew.";

type StateData = Omit<GameState,
  | "newGame" | "rollMove" | "moveTo" | "searchNode" | "dismissCard" | "cleanse"
  | "feedLantern" | "takeLight" | "ritualStep" | "endTurn" | "dismissHaunt"
  | "resolveWhisper" | "reset"
  | "_fireHaunt" | "_advanceGloom" | "_checkEnd" | "_win" | "_lose" | "_endGame">;

function emptyInit(): StateData {
  return {
    version: STORE_VERSION,
    phase: "LOBBY",
    board: freshBoard(),
    players: [],
    turnIndex: 0,
    round: 1,
    turnCount: 0,
    movesLeft: 0,
    rolled: false,
    resolved: false,
    lastRoll: null,
    cardDraw: null,
    lantern: START_LANTERN,
    dread: 0,
    omens: 0,
    gloom: [],
    manifests: {},
    hauntFired: false,
    scenarioId: null,
    scenarioName: null,
    scenarioSubtitle: null,
    scenarioReveal: null,
    accentColor: null,
    gloomSurge: 0,
    ritualGoal: 5,
    ritualProgress: 0,
    escapeSlots: 99,
    whisperMode: false,
    whisperPlayerId: null,
    whisperOffered: false,
    narratorLine: initialNarration,
    log: [],
    result: null,
  };
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      ...emptyInit(),

      newGame: (names, whisperMode) => {
        const board = freshBoard();
        const spawns = [...board.spawnIds];
        const players: Player[] = names.map((name, i) => ({
          id: `p${i}`,
          name: name.trim() || `Lantern ${i + 1}`,
          color: PLAYER_COLORS[i % PLAYER_COLORS.length],
          nodeId: spawns[i % spawns.length],
          light: START_LIGHT,
          alive: true,
          escaped: false,
          traitor: false,
        }));
        set({
          ...emptyInit(),
          board,
          players,
          phase: "PLAY",
          whisperMode: whisperMode && players.length >= 3,
          narratorLine: `The dark has counted you: ${players
            .map((p) => p.name)
            .join(", ")}. It is pleased with the number.`,
        });
      },

      rollMove: () => {
        const s = get();
        if (s.rolled || s.cardDraw) return;
        const roll = 1 + Math.floor(Math.random() * 4); // a worn four-faced die
        set({ rolled: true, movesLeft: roll, lastRoll: roll });
      },

      moveTo: (nodeId) => {
        const s = get();
        if (!s.rolled || s.resolved || s.movesLeft <= 0 || s.cardDraw) return;
        const p = s.players[s.turnIndex];
        if (!p) return;
        if (!neighbors(s.board, p.nodeId).includes(nodeId)) return;

        const intoGloom = s.gloom.includes(nodeId);
        const players = s.players.map((pl) =>
          pl.id === p.id ? { ...pl, nodeId, light: Math.max(0, pl.light - (intoGloom ? 1 : 0)) } : pl,
        );
        const node = s.board.nodes.find((n) => n.id === nodeId);
        const dread = intoGloom ? s.dread + 4 : s.dread;
        const line = narrate("move", dread, {
          name: p.name,
          node: node?.label ?? "deeper dark",
          turn: s.turnCount,
          round: s.round,
          others: s.players.filter((x) => x.id !== p.id).map((x) => x.name),
        });
        set({
          players,
          movesLeft: s.movesLeft - 1,
          dread,
          narratorLine: intoGloom
            ? `${p.name} wades into the Gloom. It welcomes them by name.`
            : line,
          log: logLine({ ...s, dread }, line),
        });
      },

      searchNode: () => {
        const s = get();
        if (s.resolved || s.cardDraw) return;
        const p = s.players[s.turnIndex];
        if (!p) return;
        const node = s.board.nodes.find((n) => n.id === p.nodeId);
        // bias the draw by what kind of place this is
        let card: Card;
        const r = Math.random();
        if (node?.kind === "cache") card = r < 0.7 ? pick(CACHE_CARDS) : pick(OMEN_CARDS);
        else if (node?.kind === "hazard") card = r < 0.65 ? pick(HAZARD_CARDS) : pick(OMEN_CARDS);
        else if (node?.kind === "lantern") card = r < 0.6 ? pick(CACHE_CARDS) : pick(HAZARD_CARDS);
        else card = r < 0.4 ? pick(CACHE_CARDS) : r < 0.75 ? pick(HAZARD_CARDS) : pick(OMEN_CARDS);
        set({ cardDraw: card, resolved: true, movesLeft: 0 });
      },

      dismissCard: () => {
        const s = get();
        const card = s.cardDraw;
        if (!card) return;
        const p = s.players[s.turnIndex];
        let lantern = s.lantern + (card.lantern ?? 0);
        let dread = s.dread + (card.dread ?? 0);
        let omens = s.omens + (card.omen ?? 0);
        lantern = Math.max(0, lantern);
        const players = s.players.map((pl) =>
          pl.id === p?.id ? { ...pl, light: Math.max(0, pl.light + (card.light ?? 0)) } : pl,
        );
        const manifests = { ...s.manifests };
        if (card.manifest && p) manifests[p.nodeId] = card.manifest;

        const node = s.board.nodes.find((n) => n.id === p?.nodeId);
        const kind = card.kind === "omen" || card.kind === "manifest" ? "omen" : card.kind === "boon" ? "cache" : card.kind;
        const line = narrate(kind as "cache" | "hazard" | "omen", dread, {
          name: p?.name,
          node: node?.label ?? "the dark",
          turn: s.turnCount,
          round: s.round,
          omens,
          others: s.players.filter((x) => x.id !== p?.id).map((x) => x.name),
        });

        const next: Partial<GameState> = {
          cardDraw: null,
          lantern,
          dread,
          omens,
          players,
          manifests,
          narratorLine: line,
          log: logLine({ ...s, dread, omens }, line),
        };
        set(next);

        // Haunt trigger
        if (!s.hauntFired && omens >= OMEN_THRESHOLD) {
          get()._fireHaunt();
        }
        get()._checkEnd();
      },

      cleanse: (nodeId) => {
        const s = get();
        if (s.cardDraw || s.lantern < CLEANSE_COST) return;
        const p = s.players[s.turnIndex];
        if (!p) return;
        if (!s.gloom.includes(nodeId)) return;
        if (nodeId !== p.nodeId && !neighbors(s.board, p.nodeId).includes(nodeId)) return;
        const gloom = s.gloom.filter((g) => g !== nodeId);
        const dread = Math.max(0, s.dread - 3);
        const line = `${p.name} pours light into the dark and, for one breath, the Gloom recoils.`;
        set({
          gloom,
          lantern: s.lantern - CLEANSE_COST,
          dread,
          narratorLine: line,
          log: logLine({ ...s, dread }, line),
        });
      },

      feedLantern: () => {
        const s = get();
        const p = s.players[s.turnIndex];
        if (!p || p.light <= 0 || s.cardDraw) return;
        set({
          lantern: s.lantern + 1,
          players: s.players.map((pl) => (pl.id === p.id ? { ...pl, light: pl.light - 1 } : pl)),
          narratorLine: `${p.name} feeds the shared lantern. A small, dangerous generosity.`,
        });
      },

      takeLight: () => {
        const s = get();
        const p = s.players[s.turnIndex];
        if (!p || s.lantern <= 0 || s.cardDraw) return;
        set({
          lantern: s.lantern - 1,
          players: s.players.map((pl) => (pl.id === p.id ? { ...pl, light: pl.light + 1 } : pl)),
          narratorLine: `${p.name} takes from the shared lantern. The others notice. They always notice.`,
        });
      },

      ritualStep: () => {
        const s = get();
        if (!s.hauntFired || s.cardDraw) return;
        const p = s.players[s.turnIndex];
        if (!p || p.nodeId !== s.board.heartId) return;
        // pay from shared lantern first, then personal
        let lantern = s.lantern;
        let players = s.players;
        if (lantern >= RITUAL_COST) lantern -= RITUAL_COST;
        else if (p.light + lantern >= RITUAL_COST) {
          const fromPersonal = RITUAL_COST - lantern;
          lantern = 0;
          players = s.players.map((pl) => (pl.id === p.id ? { ...pl, light: pl.light - fromPersonal } : pl));
        } else return; // not enough light anywhere; gather more

        const ritualProgress = s.ritualProgress + 1;
        const line = narrate("ritual", s.dread, {
          name: p.name,
          others: s.players.filter((x) => x.id !== p.id).map((x) => x.name),
          round: s.round,
        });
        set({
          lantern,
          players,
          ritualProgress,
          phase: "CLIMAX",
          narratorLine: line,
          log: logLine(s, line),
        });
        if (ritualProgress >= s.ritualGoal) {
          get()._win();
        }
      },

      endTurn: () => {
        const s = get();
        if (s.cardDraw || s.result) return;
        if (!s.resolved && s.rolled) {
          // force a resolution so a turn is never skipped silently
          get().searchNode();
          return;
        }
        // advance to the next alive, non-escaped player
        const n = s.players.length;
        let idx = s.turnIndex;
        let round = s.round;
        let turnCount = s.turnCount + 1;
        let endOfRound = false;
        for (let i = 1; i <= n; i++) {
          const cand = (s.turnIndex + i) % n;
          if (cand <= s.turnIndex) endOfRound = true;
          const pl = s.players[cand];
          if (pl.alive && !pl.escaped) {
            idx = cand;
            break;
          }
        }
        const everyoneOut = s.players.every((p) => !p.alive || p.escaped);
        set({ turnIndex: idx, rolled: false, resolved: false, movesLeft: 0, lastRoll: null, turnCount });

        if (everyoneOut) {
          get()._endGame();
          return;
        }
        if (endOfRound) {
          round += 1;
          set({ round });
          get()._advanceGloom();
        }
      },

      dismissHaunt: () => {
        const s = get();
        set({ phase: "PLAY" });
        // offer the Whisper once, after the Haunt, in 3-4P with mode on
        if (s.whisperMode && !s.whisperOffered && s.players.filter((p) => p.alive).length >= 3) {
          const candidates = s.players.filter((p) => p.alive && !p.escaped);
          const chosen = candidates[Math.floor(Math.random() * candidates.length)];
          set({ whisperPlayerId: chosen.id, whisperOffered: true });
        }
      },

      resolveWhisper: (accept) => {
        const s = get();
        const pid = s.whisperPlayerId;
        if (!pid) return;
        if (accept) {
          const players = s.players.map((pl) => (pl.id === pid ? { ...pl, traitor: true, escaped: true } : pl));
          const name = s.players.find((p) => p.id === pid)?.name ?? "someone";
          const dread = s.dread + 8;
          set({
            players,
            whisperPlayerId: null,
            dread,
            lantern: Math.max(0, s.lantern - 1),
            narratorLine: `A door opens for ${name} alone. No one else sees it. The board keeps the secret, as it keeps everything.`,
            log: logLine({ ...s, dread }, `${name} accepted the Whisper.`),
          });
          // if that was the last active player, wrap up
          if (s.players.every((p) => p.id === pid || !p.alive || p.escaped)) get()._endGame();
        } else {
          const name = s.players.find((p) => p.id === pid)?.name ?? "someone";
          set({
            whisperPlayerId: null,
            narratorLine: `${name} refuses the dark's kindness. The board respects loyalty the way a fire respects paper.`,
          });
        }
      },

      reset: () => set({ ...emptyInit() }),

      // ---- internals (not in the public type but reachable) ----
      _fireHaunt: () => {
        const s = get();
        const scen = drawScenario();
        const dread = Math.min(100, s.dread + scen.dreadSpike);
        set({
          phase: "HAUNT",
          hauntFired: true,
          scenarioId: scen.id,
          scenarioName: scen.name,
          scenarioSubtitle: scen.subtitle,
          scenarioReveal: scen.reveal,
          accentColor: scen.accent,
          ritualGoal: scen.ritualGoal,
          gloomSurge: scen.gloomSurge,
          escapeSlots: scen.escapeCapacity(s.players.length),
          dread,
          narratorLine: scen.reveal,
          log: logLine({ ...s, dread }, `THE HAUNT: ${scen.name}`),
        });
      },

      _advanceGloom: () => {
        const s = get();
        const flooded = new Set(s.gloom);
        const count = 1 + s.gloomSurge + Math.floor(s.round / 3);

        // frontier: unflooded nodes adjacent to flooded; if nothing flooded yet,
        // the Gloom enters from the outermost ring.
        let frontier: typeof s.board.nodes;
        if (flooded.size === 0) {
          frontier = s.board.nodes.filter((n) => n.ring === 3);
        } else {
          frontier = s.board.nodes.filter(
            (n) => !flooded.has(n.id) && neighbors(s.board, n.id).some((m) => flooded.has(m)),
          );
        }
        // prefer outer (higher ring) so it reads as marching inward
        frontier.sort((a, b) => b.ring - a.ring || Math.random() - 0.5);
        const toFlood = frontier.slice(0, count).map((n) => n.id);
        toFlood.forEach((id) => flooded.add(id));

        // shove players caught by the new flood toward safety
        let players = s.players;
        let dread = s.dread;
        toFlood.forEach((id) => {
          players = players.map((pl) => {
            if (pl.nodeId !== id || !pl.alive || pl.escaped) return pl;
            const safe = neighbors(s.board, id).find((m) => !flooded.has(m));
            dread += 6;
            return { ...pl, nodeId: safe ?? id, light: Math.max(0, pl.light - 2) };
          });
        });

        // dread always rises with the night; faster with more omens
        dread = Math.min(100, dread + 3 + s.omens);
        const line = narrate("gloom", dread, {
          others: s.players.filter((p) => p.alive && !p.escaped).map((p) => p.name),
          round: s.round,
        });
        set({
          gloom: [...flooded],
          players,
          dread,
          narratorLine: line,
          log: logLine({ ...s, dread }, line),
        });
        get()._checkEnd();
      },

      _checkEnd: () => {
        const s = get();
        if (s.result) return;
        if (s.gloom.includes(s.board.heartId) || s.dread >= 100) {
          get()._lose();
        }
      },

      _win: () => {
        const s = get();
        // who gets out: traitors already escaped; fill remaining slots by nearness to the Heart
        const slots = s.escapeSlots;
        const alreadyOut = s.players.filter((p) => p.escaped).length;
        const remaining = Math.max(0, slots - alreadyOut);
        const heart = s.board.heartId;
        const contenders = s.players
          .filter((p) => p.alive && !p.escaped)
          .sort((a, b) => {
            const da = a.nodeId === heart ? 0 : neighbors(s.board, heart).includes(a.nodeId) ? 1 : 2;
            const db = b.nodeId === heart ? 0 : neighbors(s.board, heart).includes(b.nodeId) ? 1 : 2;
            return da - db || b.light - a.light;
          });
        const winners = new Set(contenders.slice(0, remaining).map((p) => p.id));
        const players = s.players.map((p) =>
          p.escaped ? p : { ...p, escaped: winners.has(p.id) },
        );
        set({ players, phase: "END", result: "win" });
      },

      _lose: () => {
        const s = get();
        // the dark takes everyone who didn't already slip out through a Whisper door
        const players = s.players.map((p) => (p.traitor ? p : { ...p, escaped: false, alive: false }));
        set({ players, phase: "END", result: "lose" });
      },

      _endGame: () => {
        const s = get();
        if (s.result) return;
        // everyone is out (escaped or claimed) without a ritual win → judge by ritual progress
        if (s.ritualProgress >= s.ritualGoal) get()._win();
        else get()._lose();
      },
    }),
    {
      name: "gloaming-save-v1",
      version: STORE_VERSION,
      partialize: (s): StateData => ({
        version: s.version,
        phase: s.phase,
        board: s.board,
        players: s.players,
        turnIndex: s.turnIndex,
        round: s.round,
        turnCount: s.turnCount,
        movesLeft: s.movesLeft,
        rolled: s.rolled,
        resolved: s.resolved,
        lastRoll: s.lastRoll,
        cardDraw: s.cardDraw,
        lantern: s.lantern,
        dread: s.dread,
        omens: s.omens,
        gloom: s.gloom,
        manifests: s.manifests,
        hauntFired: s.hauntFired,
        scenarioId: s.scenarioId,
        scenarioName: s.scenarioName,
        scenarioSubtitle: s.scenarioSubtitle,
        scenarioReveal: s.scenarioReveal,
        accentColor: s.accentColor,
        gloomSurge: s.gloomSurge,
        ritualGoal: s.ritualGoal,
        ritualProgress: s.ritualProgress,
        escapeSlots: s.escapeSlots,
        whisperMode: s.whisperMode,
        whisperPlayerId: s.whisperPlayerId,
        whisperOffered: s.whisperOffered,
        narratorLine: s.narratorLine,
        log: s.log,
        result: s.result,
      }),
    },
  ),
);

// re-derive the live scenario object (with its functions) when needed
export function scenarioFor(id: string | null) {
  return SCENARIOS.find((s) => s.id === id) ?? null;
}
